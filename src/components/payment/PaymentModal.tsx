import { useState, useEffect, useRef } from "react";
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
import CryptoJS from "crypto-js";

// Типы для Robokassa iFrame
declare global {
  interface Window {
    Robokassa?: {
      StartPayment: (params: {
        MerchantLogin: string;
        OutSum: string;
        InvId?: string;
        Description?: string;
        SignatureValue: string;
        Culture?: string;
        IsTest?: string;
        [key: string]: string | undefined;
      }) => void;
      Render: (params: {
        MerchantLogin: string;
        OutSum: string;
        InvId?: string;
        Description?: string;
        SignatureValue: string;
        Culture?: string;
        IsTest?: string;
        Settings?: string;
        [key: string]: string | undefined;
      }) => void;
    };
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  description,
  onSuccess,
  onError,
}: PaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [useIframe, setUseIframe] = useState(false);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Загрузка скрипта Robokassa iFrame
  useEffect(() => {
    const useIframeMode = import.meta.env.VITE_ROBOKASSA_USE_IFRAME === "1";
    setUseIframe(useIframeMode);

    if (useIframeMode && isOpen) {
      const scriptId = "robokassa-iframe-script";

      // Если скрипт уже загружен, проверяем доступность API
      if (document.getElementById(scriptId)) {
        // Даем время на инициализацию, если скрипт только что загрузился
        if (!window.Robokassa) {
          const checkInterval = setInterval(() => {
            if (window.Robokassa) {
              clearInterval(checkInterval);
            }
          }, 100);

          // Таймаут через 5 секунд
          setTimeout(() => {
            clearInterval(checkInterval);
          }, 5000);
        }
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://auth.robokassa.ru/Merchant/bundle/robokassa_iframe.js";
      script.async = true;

      script.onload = () => {
        // Предупреждение о cross-origin в консоли - это нормально для локальной разработки
        if (import.meta.env.DEV) {
          console.log(
            "✅ Robokassa iFrame скрипт загружен. Предупреждения о 'Unknown origin' в консоли - это нормально для локальной разработки.",
          );
        }
      };

      script.onerror = () => {
        onError("Не удалось загрузить платежный виджет Robokassa");
      };

      document.body.appendChild(script);
    }
  }, [isOpen, onError]);

  // Инициализация платежа через Robokassa (документация: Интерфейс оплаты, типовая последовательность)
  const handleRobokassaPayment = async () => {
    setIsLoading(true);

    try {
      const merchantLogin = import.meta.env.VITE_ROBOKASSA_MERCHANT_LOGIN;
      const isTest = import.meta.env.VITE_ROBOKASSA_TEST === "1" ? "1" : "0";
      const apiUrl = import.meta.env.VITE_ROBOKASSA_API_URL;
      const useIframeMode = import.meta.env.VITE_ROBOKASSA_USE_IFRAME === "1";
      // Description: до 100 символов (документация Robokassa)
      const descriptionSafe = String(description).slice(0, 100);

      if (!merchantLogin) {
        onError(
          "Не настроен логин магазина Robokassa. Добавьте VITE_ROBOKASSA_MERCHANT_LOGIN в .env",
        );
        setIsLoading(false);
        return;
      }

      // ВАЖНО: В тестовом режиме убедитесь, что используете тестовые пароли из личного кабинета!
      if (isTest === "1") {
        console.warn(
          "⚠️ Тестовый режим активен. Убедитесь, что используете тестовые пароли из личного кабинета Robokassa!",
        );
        console.warn(
          "⚠️ Боевые пароли в тестовом режиме вызывают ошибки 23, 29 или 500!",
        );
        console.warn(
          "📍 Получить тестовые пароли: Личный кабинет → Мои магазины → Технические настройки → Тестовые пароли",
        );
      }

      // Генерируем уникальный номер заказа (число от 1 до 9223372036854775807)
      // Используем timestamp для уникальности
      const invoiceId = Date.now().toString();

      // Если есть API URL, используем backend для генерации подписи (безопасно)
      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            merchantLogin,
            amount,
            invoiceId,
            description: descriptionSafe,
            isTest,
            successUrl: `${window.location.origin}/payment-success`,
            failUrl: `${window.location.origin}/payment-success`,
          }),
        });

        if (!response.ok) {
          throw new Error("Ошибка при создании платежа");
        }

        const data = await response.json();
        submitRobokassaForm(data);
      } else {
        // Прямая генерация подписи на фронтенде (менее безопасно, но работает)
        // ВАЖНО: Для продакшена используйте backend!
        const password1 = import.meta.env.VITE_ROBOKASSA_PASSWORD_1;

        if (!password1) {
          onError(
            "Не настроен пароль #1 Robokassa. Добавьте VITE_ROBOKASSA_PASSWORD_1 в .env или настройте backend (VITE_ROBOKASSA_API_URL)",
          );
          setIsLoading(false);
          return;
        }

        const signature = generateRobokassaSignature(
          merchantLogin,
          amount,
          invoiceId,
          password1,
        );

        if (useIframeMode && window.Robokassa) {
          startIframePayment({
            merchantLogin,
            amount,
            invoiceId,
            description: descriptionSafe,
            signature,
            isTest,
          });
        } else {
          submitRobokassaForm({
            merchantLogin,
            amount,
            invoiceId,
            description: descriptionSafe,
            signature,
            isTest,
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      onError(
        error instanceof Error
          ? error.message
          : "Ошибка при инициализации платежа",
      );
    }
  };

  // Запуск оплаты через iFrame
  const startIframePayment = (params: {
    merchantLogin: string;
    amount: number;
    invoiceId: string;
    description: string;
    signature: string;
    isTest: string;
  }) => {
    // Ждем загрузки скрипта, если он еще не загружен
    if (!window.Robokassa) {
      let attempts = 0;
      const maxAttempts = 50; // 5 секунд максимум

      const checkRobokassa = setInterval(() => {
        attempts++;
        if (window.Robokassa) {
          clearInterval(checkRobokassa);
          // Рекурсивно вызываем функцию после загрузки
          startIframePayment(params);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkRobokassa);
          onError(
            "Платежный виджет Robokassa не загрузился. Проверьте подключение к интернету и попробуйте еще раз.",
          );
          setIsLoading(false);
        }
      }, 100);

      return;
    }

    // Сохраняем invoiceId для проверки после возврата
    sessionStorage.setItem("robokassa_invoice_id", params.invoiceId);

    // Для отладки - логируем параметры (только в dev режиме)
    if (import.meta.env.DEV) {
      console.log("Robokassa iFrame параметры:", {
        MerchantLogin: params.merchantLogin,
        OutSum: params.amount.toFixed(2),
        InvId: params.invoiceId,
        Description: params.description,
        SignatureValue: params.signature,
        IsTest: params.isTest,
      });
    }

    try {
      // Запускаем оплату через iFrame
      // ВАЖНО: SuccessURL и FailURL не передаются в StartPayment для iFrame
      // Они настраиваются в личном кабинете Robokassa
      window.Robokassa.StartPayment({
        MerchantLogin: params.merchantLogin,
        OutSum: params.amount.toFixed(2),
        InvId: params.invoiceId,
        Description: params.description,
        SignatureValue: params.signature,
        Culture: "ru",
        IsTest: params.isTest,
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      onError(
        error instanceof Error
          ? error.message
          : "Ошибка при запуске платежа через iFrame",
      );
    }
  };

  const submitRobokassaForm = (params: {
    merchantLogin: string;
    amount: number;
    invoiceId: string;
    description: string;
    signature: string;
    isTest: string;
    successUrl?: string;
    failUrl?: string;
  }) => {
    // URL по документации. Для подтверждения оплаты на стороне сервера настройте ResultURL в ЛК и скрипт, возвращающий OK{InvId}.
    const robokassaUrl =
      import.meta.env.VITE_ROBOKASSA_URL ||
      "https://auth.robokassa.ru/Merchant/Index.aspx";

    const successUrl =
      params.successUrl || `${window.location.origin}/payment-success`;
    const failUrl =
      params.failUrl || `${window.location.origin}/payment-success`;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = robokassaUrl;
    form.setAttribute("accept-charset", "UTF-8");
    form.style.display = "none";

    // Параметры по документации. SuccessURL/FailURL в подпись не входят.
    const fields: Record<string, string> = {
      MerchantLogin: params.merchantLogin,
      OutSum: params.amount.toFixed(2),
      InvId: params.invoiceId,
      Description: params.description,
      SignatureValue: params.signature,
      IsTest: params.isTest,
      Culture: "ru",
      SuccessURL: successUrl,
      FailURL: failUrl,
    };

    // Для отладки (только в dev режиме)
    if (import.meta.env.DEV) {
      console.log("Robokassa форма параметры:", fields);
    }

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    // Закрываем модальное окно
    setIsLoading(false);
    onClose();

    // Сохраняем invoiceId для проверки после возврата
    sessionStorage.setItem("robokassa_invoice_id", params.invoiceId);
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

          {useIframe ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Оплата будет произведена в окне на этой странице.
                  {import.meta.env.DEV && (
                    <>
                      <br />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        Примечание: Предупреждения о "Unknown origin" в консоли
                        браузера - это нормально для локальной разработки и не
                        влияют на работу платежной системы.
                      </span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
              {import.meta.env.VITE_ROBOKASSA_TEST === "1" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Тестовый режим активен!</strong> Убедитесь, что
                    используете тестовые пароли из личного кабинета Robokassa.
                    Боевые пароли в тестовом режиме вызовут ошибку 500.
                  </AlertDescription>
                </Alert>
              )}
              <div ref={iframeContainerRef} className="min-h-[500px]" />
              <Button
                onClick={handleRobokassaPayment}
                disabled={isLoading}
                className="w-full bg-primary-foreground text-forest-deep hover:bg-primary-foreground/90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  "Оплатить"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Вы будете перенаправлены на страницу оплаты Robokassa.
                  <br />
                  <a
                    href="https://robokassa.ru/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline inline-flex items-center gap-1 mt-1"
                  >
                    Подробнее о Robokassa <ExternalLink className="w-3 h-3" />
                  </a>
                </AlertDescription>
              </Alert>
              {import.meta.env.VITE_ROBOKASSA_TEST === "1" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Тестовый режим активен!</strong> Убедитесь, что
                    используете тестовые пароли из личного кабинета Robokassa.
                    Боевые пароли в тестовом режиме вызовут ошибку 500.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRobokassaPayment}
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
          )}
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

// Генерация подписи для запроса на оплату (документация: «Сборка подписи SignatureValue»).
// Строка: MerchantLogin:OutSum:InvId:Пароль#1[:Shp_key=value...]. Shp_* — по алфавиту.
// InvId рекомендуем передавать уникальным (1..9223372036854775807).
const generateRobokassaSignature = (
  merchantLogin: string,
  amount: number,
  invoiceId: string,
  password1: string,
  shpParams?: Record<string, string>,
): string => {
  // Формируем базовую строку: MerchantLogin:OutSum:InvId:Password#1
  // ВАЖНО: OutSum должен быть строкой с точкой (например, "1499.00"), не числом
  const outSum = typeof amount === "number" ? amount.toFixed(2) : amount;
  let signatureString = `${merchantLogin}:${outSum}:${invoiceId}:${password1}`;

  // Если есть пользовательские параметры Shp_*, добавляем их после пароля в алфавитном порядке
  if (shpParams && Object.keys(shpParams).length > 0) {
    const sortedKeys = Object.keys(shpParams).sort();
    const shpString = sortedKeys
      .map((key) => `:Shp_${key}=${shpParams[key]}`)
      .join("");
    signatureString += shpString;
  }

  const signature = md5(signatureString);

  // Для отладки (только в dev режиме)
  if (import.meta.env.DEV) {
    console.log("Robokassa подпись:", {
      строкаДляПодписи: signatureString,
      подпись: signature,
      merchantLogin,
      outSum,
      invoiceId,
    });
  }

  return signature;
};

// Генерация подписи для проверки результата платежа
// Формат: OutSum:InvId:Password#2
const generateRobokassaResultSignature = (
  outSum: string,
  invoiceId: string,
  password2: string,
): string => {
  const signatureString = `${outSum}:${invoiceId}:${password2}`;
  return md5(signatureString);
};

// MD5 функция для фронтенда
// ВАЖНО: Для продакшена лучше использовать backend для генерации подписи!
const md5 = (str: string): string => {
  return CryptoJS.MD5(str).toString();
};
