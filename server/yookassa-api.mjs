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
 * Переменные окружения: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, PORT
 */

import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT) || 3001;
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const YOOKASSA_API_URL = "https://api.yookassa.ru/v3";

// CORS заголовки для разработки
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

  const paymentData = {
    amount: {
      value: amount.toFixed(2),
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
function handleWebhook(notification) {
  const { event, object } = notification;

  console.log(`YooKassa webhook: ${event}`, {
    paymentId: object?.id,
    status: object?.status,
  });

  // Сохраняем информацию об успешном платеже
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
    // POST /api/create-payment — создание платежа
    if (req.method === "POST" && pathname === "/api/create-payment") {
      const body = await parseJsonBody(req);

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

      handleWebhook(body);

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
});
