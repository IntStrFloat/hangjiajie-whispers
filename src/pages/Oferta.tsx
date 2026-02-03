import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SELLER_NAME = "Березнёв Дмитрий Алексеевич";
const SELLER_INN = "695005289893";
const SUPPORT_EMAIL = "gostlix20201@gmail.com";
const TELEGRAM = "https://t.me/frontendEnjoyer";

export default function Oferta() {
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
            Публичная оферта
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Настоящий документ является официальным предложением (публичной
            офертой) заключить договор купли-продажи цифрового товара на
            условиях, изложенных ниже.
          </p>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              1. Продавец
            </h2>
            <p className="text-muted-foreground">
              Исполнитель (продавец): {SELLER_NAME}, самозанятый.
              <br />
              ИНН: {SELLER_INN}.
              <br />
              Контакты:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary underline"
              >
                {SUPPORT_EMAIL}
              </a>
              ,{" "}
              <a
                href={TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Telegram
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              2. Товар и цена
            </h2>
            <p className="text-muted-foreground">
              Цифровой товар — информационный продукт в формате PDF («Гайд по
              Чжанцзяцзе»). Цена товара указана на сайте в момент оформления
              заказа (в рублях РФ). Оплата производится единоразово в полном
              объёме.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              3. Оплата
            </h2>
            <p className="text-muted-foreground">
              Оплата принимается через платёжный сервис Robokassa (ООО
              «РОБОКАССА») способами, доступными на странице оплаты. Моментом
              оплаты считается успешное зачисление средств. При возникновении
              технических ошибок оплаты покупатель вправе обратиться по
              контактам, указанным в п. 1.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              4. Передача товара (доставка)
            </h2>
            <p className="text-muted-foreground">
              Доступ к цифровому товару (ссылка для скачивания или файл)
              направляется на электронную почту покупателя, указанную при
              оформлении заказа, в течение разумного срока после подтверждения
              оплаты, как правило — сразу после поступления платежа. Покупатель
              обязуется проверить папку «Спам» и корректность указанного адреса.
              При отсутствии письма в течение 24 часов необходимо обратиться по
              контактам из п. 1.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              5. Отказ от заказа и возврат денежных средств
            </h2>
            <p className="text-muted-foreground mb-3">
              В соответствии со ст. 26.1 Закона РФ «О защите прав потребителей»:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
              <li>
                Покупатель вправе отказаться от заказа до момента получения
                доступа к цифровому товару (до перехода по ссылке или
                скачивания). В этом случае денежные средства подлежат возврату в
                течение 10 (десяти) дней с момента получения продавцом заявления
                об отказе, направленного по контактам из п. 1.
              </li>
              <li>
                После передачи покупателю доступа к цифровому контенту (отправка
                ссылки/файла на email) право на отказ от товара надлежащего
                качества не применяется в силу характера товара (предоставление
                цифрового контента, потребляемого при использовании).
              </li>
              <li>
                При наличии недостатков товара (невозможность открыть файл,
                несоответствие описанию и т.п.) покупатель вправе предъявить
                требования в соответствии с законодательством РФ; возврат
                средств в таком случае осуществляется в сроки, установленные
                законом.
              </li>
            </ul>
            <p className="text-muted-foreground">
              Заявление об отказе до получения доступа направляется на{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary underline"
              >
                {SUPPORT_EMAIL}
              </a>
              с указанием номера/даты заказа и реквизитов для возврата.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              6. Персональные данные
            </h2>
            <p className="text-muted-foreground">
              Обработка персональных данных покупателя осуществляется в
              соответствии с ФЗ «О персональных данных» и политикой
              конфиденциальности, размещённой на сайте. Оформляя заказ,
              покупатель подтверждает согласие на обработку указанных им данных
              в целях исполнения договора.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              7. Заключение договора
            </h2>
            <p className="text-muted-foreground">
              Оферта действует с момента размещения на сайте. Акцептом оферты
              является совершение покупателем действий по оплате товара после
              ознакомления с условиями оферты. С этого момента договор
              купли-продажи считается заключённым на условиях настоящей оферты.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">
              8. Прочее
            </h2>
            <p className="text-muted-foreground">
              К отношениям сторон применяется законодательство Российской
              Федерации. По вопросам, не урегулированным офертой, стороны
              руководствуются Законом «О защите прав потребителей» и иными
              применимыми нормами. Контакты продавца для претензий и вопросов:
              {SUPPORT_EMAIL},{" "}
              <a
                href={TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Telegram
              </a>
              .
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
