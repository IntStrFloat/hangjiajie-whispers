import { ExternalLink, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest-deep py-12 md:py-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center gap-6 text-center text-primary-foreground/80">
          {/* Политика и оферта */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a
              href="https://www.consultant.ru/document/cons_doc_LAW_61801/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />О персональных
              данных
            </a>
            <a
              href="/oferta.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm md:text-base hover:text-primary-foreground transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              Публичная оферта
            </a>
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
