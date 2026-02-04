import { Link } from "react-router-dom";
import { ExternalLink, FileText, Mail, Phone, Send } from "lucide-react";

// Контакты и реквизиты: замените на свои перед подключением приёма платежей
const CONTACT_EMAIL = "gostlix20201@gmail.com";
const CONTACT_TELEGRAM = "https://t.me/frontendEnjoyer";
const CONTACT_TELEGRAM_LABEL = "@frontendEnjoyer";
const CONTACT_PHONE: string = "+7 (915) 739-75-70"; // Укажите телефон для соответствия требованиям ЮKassa
const SELLER_CITY = "Москва"; // Город для самозанятого

export function Footer() {
  return (
    <footer className="bg-forest-deep py-12 md:py-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center gap-6 text-center text-primary-foreground/80">
          {/* Политика, оферта, доставка и возврат */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              Политика конфиденциальности
            </Link>
            <a
              href="https://www.consultant.ru/document/cons_doc_LAW_61801/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />О персональных
              данных (152-ФЗ)
            </a>
            <Link
              to="/oferta"
              className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              Публичная оферта
            </Link>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-xl">
            <strong>Способ получения товара:</strong> После оплаты на указанную
            электронную почту отправляется ссылка для скачивания гайда (обычно в
            течение нескольких минут). Если письма нет, проверьте папку «Спам».
            Условия возврата денежных средств и отказа от услуги — в{" "}
            <Link to="/oferta" className="underline hover:no-underline">
              оферте
            </Link>
            .
          </p>

          {/* Контакты: телефон, e-mail, Telegram */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium text-primary-foreground">
              Связаться со мной
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {CONTACT_PHONE ? (
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {CONTACT_PHONE}
                </a>
              ) : null}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={CONTACT_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                {CONTACT_TELEGRAM_LABEL}
              </a>
            </div>
          </div>

          {/* Юридическая информация: самозанятый ФИО, ИНН, город */}
          <div className="text-sm md:text-base font-light">
            <p>Березнёв Дмитрий Алексеевич</p>
            <p>Самозанятый</p>
            <p>ИНН: 695005289893</p>
            <p>г. {SELLER_CITY}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
