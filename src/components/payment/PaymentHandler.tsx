import { useState } from "react";
import { PaymentModal } from "./PaymentModal";
import { OrderModal } from "./OrderModal";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentHandlerProps {
  amount: number;
  description: string;
  productName?: string;
  pdfUrl?: string; // URL для скачивания PDF после оплаты
}

export const PaymentHandler = ({
  amount,
  description,
  productName = "Гайд по Чжанцзяцзе",
  pdfUrl,
}: PaymentHandlerProps) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePurchase = () => {
    setIsOrderModalOpen(true);
  };

  const handleOrderContinue = () => {
    setIsOrderModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    setIsPaymentModalOpen(false);
    toast.success("Платеж успешно обработан!");
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleDownload = async () => {
    if (!pdfUrl) {
      toast.error("URL для скачивания не указан");
      return;
    }

    setIsDownloading(true);
    try {
      // Скачиваем PDF
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

  if (isPaid) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-lg text-primary-foreground mb-2">
            Спасибо за покупку!
          </p>
          <p className="text-mist/70">Теперь вы можете скачать PDF</p>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="lg"
          className="bg-primary-foreground text-forest-deep hover:bg-primary-foreground/90 text-lg px-12 py-7 rounded-full font-medium transition-all duration-300 hover:scale-105"
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
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handlePurchase}
        size="lg"
        className="bg-primary-foreground text-forest-deep hover:bg-primary-foreground/90 text-lg px-12 py-7 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        Купить и скачать PDF
      </Button>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        productName={productName}
        amount={amount}
        onContinue={handleOrderContinue}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={amount}
        description={description}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </>
  );
};
