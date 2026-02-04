import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

// URL API сервера (в разработке используем локальный, в продакшене — тот же домен)
const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }
  return window.location.origin;
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<
    "checking" | "success" | "fail"
  >("checking");
  const [isDownloading, setIsDownloading] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);

  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/payment/${paymentId}`);

      if (!response.ok) {
        throw new Error("Ошибка при проверке статуса платежа");
      }

      const data = await response.json();

      if (data.status === "succeeded" || data.paid === true) {
        setPaymentStatus("success");
        sessionStorage.removeItem("yookassa_payment_id");
        toast.success("Платеж успешно обработан!");
        return true;
      }

      if (data.status === "canceled") {
        setPaymentStatus("fail");
        sessionStorage.removeItem("yookassa_payment_id");
        toast.error("Платеж был отменён");
        return true;
      }

      // Платеж ещё в обработке (pending, waiting_for_capture)
      return false;
    } catch (error) {
      console.error("Error checking payment:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const paymentId = sessionStorage.getItem("yookassa_payment_id");

    if (!paymentId) {
      setPaymentStatus("fail");
      toast.error("Платеж не найден. Попробуйте снова.");
      return;
    }

    // Проверяем статус платежа
    const checkPayment = async () => {
      const isCompleted = await checkPaymentStatus(paymentId);

      if (!isCompleted && checkAttempts < 10) {
        // Платёж ещё в обработке, проверяем снова через 2 секунды
        setTimeout(() => {
          setCheckAttempts((prev) => prev + 1);
        }, 2000);
      } else if (!isCompleted) {
        // Превышено количество попыток
        setPaymentStatus("fail");
        toast.error(
          "Не удалось подтвердить платеж. Проверьте почту или свяжитесь с поддержкой.",
        );
      }
    };

    checkPayment();
  }, [checkAttempts, checkPaymentStatus]);

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
      toast.success("Гайд успешно скачан!");
    } catch (error) {
      toast.error("Ошибка при скачивании гайда");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
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
            <p className="text-muted-foreground">
              Пожалуйста, подождите. Проверка {checkAttempts + 1}/10
            </p>
          </>
        )}

        {paymentStatus === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-serif text-foreground">
              Спасибо за покупку!
            </h1>
            <p className="text-muted-foreground mb-6">
              Платеж успешно обработан. Теперь вы можете скачать гайд.
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
                    Скачать гайд
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
