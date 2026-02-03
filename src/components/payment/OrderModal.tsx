import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-zhangjiajie.jpg";

const SUPPORT_EMAIL = "gostlix20201@gmail.com";
const PRIVACY_LINK = "https://www.consultant.ru/document/cons_doc_LAW_61801/";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  amount: number;
  onContinue: (data: { name: string; email: string }) => void;
}

export const OrderModal = ({
  isOpen,
  onClose,
  productName,
  amount,
  onContinue,
}: OrderModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    consent &&
    offerAccepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onContinue({ name: name.trim(), email: email.trim() });
    onClose();
  };

  const handlePrivacyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setShowPrivacy((prev) => !prev);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md bg-background text-foreground border border-border rounded-xl p-6 gap-0"
        aria-labelledby="order-modal-title"
        aria-describedby="order-modal-desc"
      >
        <DialogHeader className="text-left gap-2 pb-4">
          <DialogTitle
            id="order-modal-title"
            className="text-xl font-semibold text-foreground"
          >
            Ваш заказ:
          </DialogTitle>
        </DialogHeader>

        {/* Order summary */}
        <div className="flex items-center gap-4 py-4 border-b border-border">
          <img
            src={heroImage}
            alt=""
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {productName}
            </p>
          </div>
          <p className="font-semibold text-foreground whitespace-nowrap">
            {amount} ₽
          </p>
        </div>

        {/* Delivery info */}
        <p
          id="order-modal-desc"
          className="text-sm text-muted-foreground py-4 border-b border-border"
        >
          Вы получите доступ к гайду на Вашу электронную почту сразу после
          оплаты. Если этого не произошло, проверьте, пожалуйста, папку СПАМ.
          Если возникнут проблемы, пишите на почту{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary underline hover:no-underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="order-name" className="text-foreground">
              Ваше имя
            </Label>
            <Input
              id="order-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="bg-muted/50 border-border"
              autoComplete="name"
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-email" className="text-foreground">
              Ваша почта
            </Label>
            <Input
              id="order-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="bg-muted/50 border-border"
              autoComplete="email"
              aria-required="true"
            />
          </div>

          {/* Offer acceptance */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="order-offer"
              checked={offerAccepted}
              onCheckedChange={(checked) => setOfferAccepted(checked === true)}
              aria-describedby="order-offer-desc"
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <label
                htmlFor="order-offer"
                className="text-sm text-foreground cursor-pointer leading-tight"
              >
                Я ознакомился(ась) с{" "}
                <a
                  href="/oferta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  офертой
                </a>{" "}
                и согласен(а) с условиями покупки
              </label>
              <p id="order-offer-desc" className="sr-only">
                Обязательно для продолжения оплаты
              </p>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="order-consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                aria-describedby="order-consent-detail"
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="order-consent"
                  className="text-sm text-foreground cursor-pointer leading-tight"
                >
                  Я согласен(а) на обработку персональных данных{" "}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy((p) => !p)}
                    onKeyDown={handlePrivacyKeyDown}
                    className="underline hover:no-underline text-primary inline"
                    tabIndex={0}
                    aria-expanded={showPrivacy}
                    aria-label="Подробнее о обработке данных"
                  >
                    Подробнее
                  </button>
                </label>
                {showPrivacy && (
                  <p
                    id="order-consent-detail"
                    className="text-xs text-muted-foreground mt-2 leading-relaxed"
                  >
                    Мы обрабатываем Ваши данные только для оформления покупки,
                    отправки заказа и связи по Вашим вопросам. Данные не
                    передаются третьим лицам и не используются для рекламы.
                    Хранение осуществляется в соответствии с требованиями
                    законодательства РФ. Вы можете запросить удаление своих
                    данных, написав на{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-primary underline hover:no-underline"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                    .{" "}
                    <a
                      href={PRIVACY_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      Закон о персональных данных
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid}
            className={cn(
              "w-full mt-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium",
            )}
          >
            Продолжить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
