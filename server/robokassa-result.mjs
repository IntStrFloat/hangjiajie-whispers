/**
 * Обработчик Result URL для Robokassa (GET).
 * Документация: оповещение на ResultURL, формула подписи OutSum:InvId:Пароль#2[:Shp_*].
 * Ответ: OK{InvId} при совпадении подписи.
 *
 * Запуск: ROBOKASSA_PASSWORD_2=your_password node server/robokassa-result.mjs
 * Порт по умолчанию 31337 (проксировать в Nginx на /robokassa-result).
 */

import http from "node:http";
import { createHash } from "node:crypto";

const PORT = Number(process.env.PORT) || 31337;
const PASSWORD2 = process.env.ROBOKASSA_PASSWORD_2;

function md5(str) {
  return createHash("md5").update(str, "utf8").digest("hex");
}

/**
 * Подпись для Result URL: OutSum:InvId:Пароль#2[:Shp_key=value...], Shp_* по алфавиту.
 */
function buildResultSignature(outSum, invId, password2, shpParams) {
  let s = `${outSum}:${invId}:${password2}`;
  if (shpParams && Object.keys(shpParams).length > 0) {
    const sorted = Object.keys(shpParams).sort();
    for (const k of sorted) {
      s += `:Shp_${k}=${shpParams[k]}`;
    }
  }
  return md5(s);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  const url = new URL(req.url, `http://localhost`);
  if (url.pathname !== "/robokassa-result") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  const params = Object.fromEntries(url.searchParams);
  const outSum = params.OutSum;
  const invId = params.InvId;
  const signatureValue = params.SignatureValue;

  if (!PASSWORD2) {
    console.error("ROBOKASSA_PASSWORD_2 not set");
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server configuration error");
    return;
  }

  if (!outSum || !invId || !signatureValue) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Missing OutSum, InvId or SignatureValue");
    return;
  }

  const shpParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith("Shp_")) {
      shpParams[key.slice(4)] = value; // без префикса Shp_
    }
  }

  const expectedSignature = buildResultSignature(
    outSum,
    invId,
    PASSWORD2,
    shpParams,
  );
  const received = (signatureValue || "").toLowerCase();
  const expected = expectedSignature.toLowerCase();

  if (received !== expected) {
    console.warn("Robokassa Result URL: signature mismatch", {
      invId,
      received: received.slice(0, 8),
      expected: expected.slice(0, 8),
    });
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(`OK${invId}`);
});

server.listen(PORT, () => {
  console.log(
    `Robokassa Result URL handler: http://127.0.0.1:${PORT}/robokassa-result`,
  );
});
