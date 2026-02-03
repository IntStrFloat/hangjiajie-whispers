import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SUPPORT_EMAIL = "gostlix20201@gmail.com";
const LAW_LINK = "https://www.consultant.ru/document/cons_doc_LAW_61801/";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12 max-w-3xl">
        <Button variant="ghost" className="mb-6 -ml-2" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Link>
        </Button>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
            Политика обработки персональных данных
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Настоящая политика определяет порядок обработки персональных данных
            посетителей сайта и покупателей в соответствии с Федеральным законом
            от 27.07.2006 № 152-ФЗ «О персональных данных».
          </p>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              1. Оператор
            </h2>
            <p className="text-muted-foreground">
              Оператор персональных данных — владелец сайта (самозанятый),
              контакт для обращений:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              2. Какие данные обрабатываются
            </h2>
            <p className="text-muted-foreground">
              При оформлении заказа и оплате могут запрашиваться: имя (или
              инициалы), адрес электронной почты. Технические данные (IP,
              cookie) могут обрабатываться в объёме, необходимом для работы
              сайта и платёжного сервиса.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              3. Цели обработки
            </h2>
            <p className="text-muted-foreground">
              Персональные данные обрабатываются исключительно для: оформления
              покупки, передачи заказа (доставки цифрового товара на указанный
              email), связи по вопросам заказа и обращений пользователей. Данные
              не передаются третьим лицам в маркетинговых или рекламных целях и
              не продаются.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              4. Правовое основание и согласие
            </h2>
            <p className="text-muted-foreground">
              Обработка осуществляется на основании согласия субъекта
              персональных данных (проставление отметки при оформлении заказа) и
              в целях исполнения договора купли-продажи. Передача данных
              платёжному сервису (Robokassa) осуществляется в объёме,
              необходимом для проведения платежа, в соответствии с правилами
              указанного сервиса.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              5. Хранение и защита
            </h2>
            <p className="text-muted-foreground">
              Срок хранения персональных данных определяется требованиями
              законодательства РФ и целями обработки. Принимаются меры,
              препятствующие несанкционированному доступу, утечке и изменению
              данных.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              6. Права пользователя
            </h2>
            <p className="text-muted-foreground">
              Пользователь вправе запросить доступ к своим данным, их уточнение,
              блокирование или удаление, направив обращение на{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary underline"
              >
                {SUPPORT_EMAIL}
              </a>
              . Вопросы, связанные с обработкой персональных данных,
              регулируются законодательством РФ, в том числе{" "}
              <a
                href={LAW_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                ФЗ «О персональных данных»
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              7. Изменения
            </h2>
            <p className="text-muted-foreground">
              Оператор вправе обновлять настоящую политику. Актуальная версия
              размещена на данной странице. Продолжение использования сайта и
              оформление заказов после изменений означает принятие обновлённой
              политики.
            </p>
          </section>
        </article>

        <div className="mt-10">
          <Button asChild variant="outline">
            <Link to="/">Вернуться на главную</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
