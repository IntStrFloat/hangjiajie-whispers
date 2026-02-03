import { Link } from "react-router-dom";
import { ExternalLink, FileText, Mail, Send } from "lucide-react";

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
            Доставка: ссылка на PDF на вашу почту сразу после оплаты. Условия
            возврата — в{" "}
            <Link to="/oferta" className="underline hover:no-underline">
              оферте
            </Link>
            .
          </p>

          {/* Связь */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium text-primary-foreground">
              Связаться со мной
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:gostlix20201@gmail.com"
                className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                gostlix20201@gmail.com
              </a>
              <a
                href="https://t.me/frontendEnjoyer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                @frontendEnjoyer
              </a>
            </div>
          </div>

          {/* Информация о владельце */}
          <div className="text-sm md:text-base font-light">
            <p>Березнёв Дмитрий Алексеевич</p>
            <p>Самозанятый</p>
            <p>ИНН: 695005289893</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
