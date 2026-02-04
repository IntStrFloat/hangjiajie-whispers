import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// URL API сервера (в разработке используем локальный, в продакшене — тот же домен)
const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }
  return window.location.origin;
};

export const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  description,
  onError,
}: PaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleYooKassaPayment = async () => {
    setIsLoading(true);

    try {
      const apiUrl = getApiUrl();
      const returnUrl = `${window.location.origin}/payment-success`;

      // Создаём платёж через наш API сервер
      const response = await fetch(`${apiUrl}/api/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description: description.slice(0, 128),
          returnUrl,
          metadata: {
            product: "zhangjiajie-guide",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ошибка при создании платежа");
      }

      const data = await response.json();

      if (!data.confirmationUrl) {
        throw new Error("Не получен URL для оплаты");
      }

      // Сохраняем ID платежа для проверки после возврата
      sessionStorage.setItem("yookassa_payment_id", data.paymentId);

      // Перенаправляем на страницу оплаты ЮKassa
      window.location.href = data.confirmationUrl;
    } catch (error) {
      setIsLoading(false);
      onError(
        error instanceof Error
          ? error.message
          : "Ошибка при инициализации платежа",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Оплата</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 text-center">
            <p className="text-3xl font-bold text-forest-deep">
              {amount} <span className="text-xl">₽</span>
            </p>
          </div>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Вы будете перенаправлены на страницу оплаты ЮKassa.
                <br />
                <a
                  href="https://yookassa.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1 mt-1"
                >
                  Подробнее о ЮKassa <ExternalLink className="w-3 h-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleYooKassaPayment}
              disabled={isLoading}
              className="w-full bg-primary-foreground text-forest-deep hover:bg-primary-foreground/90"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Перенаправление...
                </>
              ) : (
                "Перейти к оплате"
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
