import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<
    "checking" | "success" | "fail"
  >("checking");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const checkPayment = () => {
      const invoiceId = searchParams.get("InvId");
      const signature = searchParams.get("SignatureValue");
      const outSum = searchParams.get("OutSum");
      const errorCode = searchParams.get("ErrorCode");

      // Если есть код ошибки, платеж не прошел
      if (errorCode) {
        setPaymentStatus("fail");
        const errorMessage = getRobokassaErrorMessage(errorCode);
        toast.error(errorMessage);
        return;
      }

      // Проверяем наличие необходимых параметров
      if (!invoiceId || !signature || !outSum) {
        setPaymentStatus("fail");
        toast.error("Неверные параметры платежа");
        return;
      }

      // Проверяем подпись
      const password2 = import.meta.env.VITE_ROBOKASSA_PASSWORD_2;
      const savedInvoiceId = sessionStorage.getItem("robokassa_invoice_id");

      if (savedInvoiceId !== invoiceId) {
        setPaymentStatus("fail");
        toast.error("Неверный номер заказа");
        return;
      }

      if (password2) {
        const expectedSignature = generateRobokassaResultSignature(
          outSum,
          invoiceId,
          password2,
        );

        if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
          setPaymentStatus("fail");
          toast.error("Неверная подпись платежа");
          return;
        }
      }

      // Платеж успешен
      setPaymentStatus("success");
      sessionStorage.removeItem("robokassa_invoice_id");
      toast.success("Платеж успешно обработан!");
    };

    checkPayment();
  }, [searchParams]);

  const handleDownload = async () => {
    const pdfUrl = import.meta.env.VITE_PDF_URL;

    if (!pdfUrl) {
      toast.error("URL для скачивания не указан");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "zhangjiajie-guide.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF успешно скачан!");
    } catch (error) {
      toast.error("Ошибка при скачивании PDF");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const generateRobokassaResultSignature = (
    outSum: string,
    invoiceId: string,
    password2: string,
  ): string => {
    const signatureString = `${outSum}:${invoiceId}:${password2}`;
    return CryptoJS.MD5(signatureString).toString();
  };

  // Получение сообщения об ошибке по коду из документации Robokassa
  const getRobokassaErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      "20": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "21": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "22": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "23": "Внутренняя ошибка сервиса. Проверьте настройки магазина в личном кабинете и убедитесь, что используете правильные тестовые пароли",
      "24": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "25": "Магазин не активирован. Активируйте магазин в личном кабинете",
      "26": "Магазин не найден. Проверьте правильность MerchantLogin",
      "27": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "28": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "29": "Неверный параметр SignatureValue. Проверьте пароль #1 и убедитесь, что используете тестовые пароли в тестовом режиме",
      "30": "Неверный параметр счёта. Проверьте обязательные и необязательные параметры",
      "31": "Неверная сумма платежа. Сумма должна быть больше нуля",
      "32": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "33": "Время, отведённое на оплату счёта, истекло",
      "34": "Услуга рекуррентных платежей не разрешена магазину",
      "35": "Неверные параметры для инициализации рекуррентного платежа",
      "36": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "37": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "40": "Повторная оплата счёта с тем же номером невозможна. Используйте уникальный InvId",
      "41": "Ошибка на старте операции. Повторите попытку",
      "43": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
      "51": "Срок оплаты счёта истек",
      "52": "Попытка повторной оплаты уже оплаченного счёта",
      "53": "Счёт не найден",
      "64": "Функционал холдирования средств запрещён для магазина",
      "65": "Некорректные параметры для холдирования",
      "500": "Внутренняя ошибка сервиса. Обратитесь в поддержку Robokassa",
    };

    return errorMessages[errorCode] || `Ошибка платежа (код: ${errorCode})`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-deep px-6">
      <div className="max-w-md w-full bg-background rounded-lg p-8 text-center space-y-6">
        {paymentStatus === "checking" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <h1 className="text-2xl font-serif text-foreground">
              Проверка платежа...
            </h1>
            <p className="text-muted-foreground">Пожалуйста, подождите</p>
          </>
        )}

        {paymentStatus === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-serif text-foreground">
              Спасибо за покупку!
            </h1>
            <p className="text-muted-foreground mb-6">
              Платеж успешно обработан. Теперь вы можете скачать PDF-файл.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                className="w-full bg-primary-foreground text-forest-deep hover:bg-primary-foreground/90"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Скачивание...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Скачать PDF
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Вернуться на главную
              </Button>
            </div>
          </>
        )}

        {paymentStatus === "fail" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-serif text-foreground">
              Ошибка платежа
            </h1>
            <p className="text-muted-foreground mb-6">
              К сожалению, платеж не был обработан. Пожалуйста, попробуйте еще
              раз.
            </p>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="w-full bg-primary-foreground text-forest-deep hover:bg-primary-foreground/90"
            >
              Вернуться на главную
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
