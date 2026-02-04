# Hangjiajie Whispers

Лендинг с гайдом по национальному парку Чжанцзяцзе. Платежи через ЮKassa.

## Локальная разработка

```bash
npm install
cp .env.example .env
# Заполните .env (YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, VITE_PDF_URL)

# Запуск API сервера (в отдельном терминале)
npm run server

# Запуск фронтенда
npm run dev
```

## Деплой

См. [DEPLOY.md](./DEPLOY.md) — пошаговые команды, конфиг Nginx и чек-лист для развёртывания на сервере.
