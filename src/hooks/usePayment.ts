import { useState, useCallback } from "react";

interface PaymentState {
  isProcessing: boolean;
  isSuccess: boolean;
  error: string | null;
}

export const usePayment = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    isSuccess: false,
    error: null,
  });

  const initiatePayment = useCallback(
    async (amount: number, description: string) => {
      setPaymentState({
        isProcessing: true,
        isSuccess: false,
        error: null,
      });

      try {
        // Здесь будет вызов API для создания платежа
        // Пока используем заглушку для тестирования
        const paymentId = await createPayment(amount, description);

        return paymentId;
      } catch (error) {
        setPaymentState({
          isProcessing: false,
          isSuccess: false,
          error:
            error instanceof Error
              ? error.message
              : "Ошибка при создании платежа",
        });
        throw error;
      }
    },
    [],
  );

  const handlePaymentSuccess = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      isSuccess: true,
      error: null,
    });
  }, []);

  const handlePaymentError = useCallback((error: string) => {
    setPaymentState({
      isProcessing: false,
      isSuccess: false,
      error,
    });
  }, []);

  const resetPayment = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      isSuccess: false,
      error: null,
    });
  }, []);

  return {
    paymentState,
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentError,
    resetPayment,
  };
};

// Функция для создания платежа через ЮKassa
// ВАЖНО: Для продакшена нужно создать backend endpoint
// который будет создавать платеж через ЮKassa API
const createPayment = async (
  amount: number,
  description: string,
): Promise<string> => {
  // TODO: Замените на реальный вызов вашего backend API
  // Пример:
  // const response = await fetch('/api/create-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, description }),
  // });
  // const data = await response.json();
  // return data.paymentId;

  // Временная заглушка для разработки
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("test-payment-id-" + Date.now());
    }, 500);
  });
};
