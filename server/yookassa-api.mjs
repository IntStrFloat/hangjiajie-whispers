/**
 * API сервер для ЮKassa.
 * Документация: https://yookassa.ru/developers/api
 *
 * Эндпоинты:
 * - POST /api/create-payment — создание платежа
 * - POST /api/webhook — обработка webhook от ЮKassa
 * - GET /api/payment/:id — проверка статуса платежа
 *
 * Запуск: node server/yookassa-api.mjs
 * Переменные окружения: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, PORT, SMTP_*
 */

import http from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createTransport } from "nodemailer";

// Загрузка переменных из .env файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", ".env");

try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  console.warn("Could not load .env file:", error.message);
}

const PORT = Number(process.env.PORT) || 3001;
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const YOOKASSA_API_URL = "https://api.yookassa.ru/v3";

// SMTP настройки для отправки email
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

// Resend API (альтернатива SMTP, если порты заблокированы)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

// Путь к PDF файлу (имя файла из .env или по умолчанию)
const PDF_FILENAME = process.env.PDF_FILENAME || "Гайд.pdf";
const PDF_PATH = join(__dirname, "..", "public", PDF_FILENAME);

// CORS заголовки для разработки
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Создание SMTP транспорта для отправки email
 */
function createEmailTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP не настроен. Email не будут отправляться.");
    return null;
  }

  console.log(`SMTP config: ${SMTP_HOST}:${SMTP_PORT}, user: ${SMTP_USER}`);

  return createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 30000, // 30 секунд на подключение
    greetingTimeout: 30000, // 30 секунд на приветствие
    socketTimeout: 60000, // 60 секунд на операции
    logger: true, // Включаем логирование
    debug: true, // Включаем отладку
  });
}

const emailTransport = createEmailTransport();

/**
 * Проверка SMTP соединения
 */
async function verifySmtpConnection() {
  if (!emailTransport) return false;

  try {
    console.log("Проверка SMTP соединения...");
    await emailTransport.verify();
    console.log("SMTP соединение: OK");
    return true;
  } catch (error) {
    console.error("SMTP соединение: ОШИБКА -", error.message);
    return false;
  }
}

// Проверяем SMTP при старте (асинхронно)
verifySmtpConnection();

/**
 * Отправка email через Resend API (альтернатива SMTP)
 * https://resend.com/docs/api-reference/emails/send-email
 */
async function sendEmailViaResend(customerEmail, customerName, pdfBuffer) {
  if (!RESEND_API_KEY) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: customerEmail,
      subject: "Ваш гайд по Чжанцзяцзе",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d5016;">Спасибо за покупку!</h1>
          <p>Здравствуйте${customerName ? `, ${customerName}` : ""}!</p>
          <p>Благодарим вас за покупку гайда по Чжанцзяцзе.</p>
          <p>Ваш гайд прикреплён к этому письму. Скачайте его и наслаждайтесь путешествием!</p>
          <p>Если у вас возникнут вопросы, пишите на <a href="mailto:gostlix20201@gmail.com">gostlix20201@gmail.com</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Березнёв Дмитрий Алексеевич<br>
            Самозанятый, ИНН: 695005289893
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "Гайд-по-Чжанцзяцзе.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Email отправлен через Resend: ${customerEmail}, id: ${data.id}`);
  return true;
}

/**
 * Отправка email с PDF гайдом
 * Пробует SMTP, если не работает — Resend API
 */
async function sendGuideEmail(customerEmail, customerName) {
  if (!existsSync(PDF_PATH)) {
    console.error(`PDF файл не найден: ${PDF_PATH}`);
    return false;
  }

  const pdfBuffer = readFileSync(PDF_PATH);

  // Пробуем отправить через SMTP
  if (emailTransport) {
    const mailOptions = {
      from: SMTP_FROM,
      to: customerEmail,
      subject: "Ваш гайд по Чжанцзяцзе",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d5016;">Спасибо за покупку!</h1>
          <p>Здравствуйте${customerName ? `, ${customerName}` : ""}!</p>
          <p>Благодарим вас за покупку гайда по Чжанцзяцзе.</p>
          <p>Ваш гайд прикреплён к этому письму. Скачайте его и наслаждайтесь путешествием!</p>
          <p>Если у вас возникнут вопросы, пишите на <a href="mailto:gostlix20201@gmail.com">gostlix20201@gmail.com</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Березнёв Дмитрий Алексеевич<br>
            Самозанятый, ИНН: 695005289893
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "Гайд-по-Чжанцзяцзе.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    try {
      const info = await emailTransport.sendMail(mailOptions);
      console.log(
        `Email отправлен через SMTP: ${customerEmail}, messageId: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      console.error(`SMTP ошибка: ${error.message}`);
      console.log("Пробуем Resend API...");
    }
  }

  // Пробуем отправить через Resend API
  if (RESEND_API_KEY) {
    try {
      return await sendEmailViaResend(customerEmail, customerName, pdfBuffer);
    } catch (error) {
      console.error(`Resend ошибка: ${error.message}`);
    }
  }

  console.error(
    "Не удалось отправить email: ни SMTP, ни Resend не настроены или не работают",
  );
  return false;
}

/**
 * Парсинг JSON тела запроса
 */
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Отправка JSON ответа
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders,
  });
  res.end(JSON.stringify(data));
}

/**
 * Создание платежа в ЮKassa
 * Документация: https://yookassa.ru/developers/api#create_payment
 */
async function createPayment({ amount, description, returnUrl, metadata }) {
  const idempotenceKey = randomUUID();

  // Преобразуем сумму в строку с двумя знаками после запятой (требование API)
  const amountValue =
    typeof amount === "number"
      ? amount.toFixed(2)
      : String(Number(amount).toFixed(2));

  const paymentData = {
    amount: {
      value: amountValue,
      currency: "RUB",
    },
    capture: true,
    confirmation: {
      type: "redirect",
      return_url: returnUrl,
    },
    description: description?.slice(0, 128) || "Оплата заказа",
    metadata: metadata || {},
  };

  const auth = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");

  const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YooKassa create payment error:", response.status, errorText);
    throw new Error(`YooKassa error: ${response.status}`);
  }

  return response.json();
}

/**
 * Получение информации о платеже
 * Документация: https://yookassa.ru/developers/api#get_payment
 */
async function getPayment(paymentId) {
  const auth = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");

  const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YooKassa get payment error:", response.status, errorText);
    throw new Error(`YooKassa error: ${response.status}`);
  }

  return response.json();
}

/**
 * Хранилище успешных платежей (в продакшене использовать БД)
 */
const successfulPayments = new Map();

/**
 * Обработка webhook от ЮKassa
 * Документация: https://yookassa.ru/developers/using-api/webhooks
 */
async function handleWebhook(notification) {
  const { event, object } = notification;

  console.log(`YooKassa webhook: ${event}`, {
    paymentId: object?.id,
    status: object?.status,
    metadata: object?.metadata,
  });

  // Сохраняем информацию об успешном платеже и отправляем email
  if (event === "payment.succeeded" && object?.id) {
    successfulPayments.set(object.id, {
      status: "succeeded",
      amount: object.amount,
      description: object.description,
      metadata: object.metadata,
      paid: true,
      paidAt: new Date().toISOString(),
    });
    console.log(`Payment ${object.id} marked as successful`);

    // Отправляем email с гайдом
    const customerEmail = object.metadata?.customerEmail;
    const customerName = object.metadata?.customerName;

    if (customerEmail) {
      console.log(`Sending guide to ${customerEmail}...`);
      const emailSent = await sendGuideEmail(customerEmail, customerName);
      if (emailSent) {
        console.log(`Guide sent successfully to ${customerEmail}`);
      } else {
        console.error(`Failed to send guide to ${customerEmail}`);
      }
    } else {
      console.warn(`No customer email in payment metadata for ${object.id}`);
    }
  }

  if (event === "payment.canceled" && object?.id) {
    successfulPayments.set(object.id, {
      status: "canceled",
      amount: object.amount,
      canceledAt: new Date().toISOString(),
    });
    console.log(`Payment ${object.id} marked as canceled`);
  }

  return { success: true };
}

/**
 * Основной HTTP сервер
 */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Проверка конфигурации
  if (!SHOP_ID || !SECRET_KEY) {
    console.error("YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY not set");
    sendJson(res, 500, { error: "Server configuration error" });
    return;
  }

  try {
    // Логирование входящих запросов
    console.log(`${req.method} ${pathname}`);

    // Health check endpoint
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, {
        status: "ok",
        timestamp: new Date().toISOString(),
        smtp: emailTransport ? "configured" : "not configured",
        pdfExists: existsSync(PDF_PATH),
      });
      return;
    }

    // POST /api/create-payment — создание платежа
    if (req.method === "POST" && pathname === "/api/create-payment") {
      const body = await parseJsonBody(req);
      console.log("Create payment request:", {
        amount: body.amount,
        returnUrl: body.returnUrl,
        customerEmail: body.metadata?.customerEmail,
      });

      if (!body.amount || body.amount <= 0) {
        sendJson(res, 400, { error: "Invalid amount" });
        return;
      }

      if (!body.returnUrl) {
        sendJson(res, 400, { error: "Missing returnUrl" });
        return;
      }

      const payment = await createPayment({
        amount: Number(body.amount),
        description: body.description,
        returnUrl: body.returnUrl,
        metadata: body.metadata,
      });

      console.log(`Payment created: ${payment.id}`);

      sendJson(res, 200, {
        paymentId: payment.id,
        confirmationUrl: payment.confirmation?.confirmation_url,
        status: payment.status,
      });
      return;
    }

    // POST /api/webhook — webhook от ЮKassa
    if (req.method === "POST" && pathname === "/api/webhook") {
      const body = await parseJsonBody(req);

      // Проверка подлинности webhook (по IP или статусу объекта)
      // В продакшене рекомендуется проверять IP-адрес отправителя

      await handleWebhook(body);

      // ЮKassa ожидает HTTP 200 для подтверждения получения
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
      return;
    }

    // GET /api/payment/:id — проверка статуса платежа
    const paymentMatch = pathname.match(/^\/api\/payment\/([a-zA-Z0-9-]+)$/);
    if (req.method === "GET" && paymentMatch) {
      const paymentId = paymentMatch[1];

      // Сначала проверяем локальный кэш (webhook)
      const cachedPayment = successfulPayments.get(paymentId);
      if (cachedPayment) {
        sendJson(res, 200, {
          paymentId,
          ...cachedPayment,
        });
        return;
      }

      // Запрашиваем у ЮKassa
      const payment = await getPayment(paymentId);

      sendJson(res, 200, {
        paymentId: payment.id,
        status: payment.status,
        paid: payment.paid,
        amount: payment.amount,
        description: payment.description,
        metadata: payment.metadata,
      });
      return;
    }

    // 404 для неизвестных маршрутов
    sendJson(res, 404, { error: "Not Found" });
  } catch (error) {
    console.error("Server error:", error);
    sendJson(res, 500, { error: error.message || "Internal Server Error" });
  }
});

server.listen(PORT, () => {
  console.log(`YooKassa API server running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  POST /api/create-payment — создание платежа`);
  console.log(`  POST /api/webhook — webhook от ЮKassa`);
  console.log(`  GET /api/payment/:id — проверка статуса платежа`);
  console.log(
    `\nEmail configuration: ${emailTransport ? "OK" : "NOT CONFIGURED"}`,
  );
  console.log(
    `PDF file: ${existsSync(PDF_PATH) ? "OK" : "NOT FOUND"} (${PDF_PATH})`,
  );
});
