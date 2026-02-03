import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Zap, Infinity, WifiOff } from "lucide-react";
import { PaymentHandler } from "@/components/payment/PaymentHandler";

export function PurchaseSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const amount = 499;
  const description = "PDF-гид по Чжанцзяцзе";

  return (
    <section
      id="purchase"
      ref={ref}
      className="relative py-24 md:py-32 lg:py-40 bg-forest-deep overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-mist/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary-foreground leading-tight mb-6"
          >
            Получить мой опыт
            <br />в формате PDF
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-lg md:text-xl text-mist/70 font-light mb-12"
          >
            Один файл, который заменяет часы подготовки
          </motion.p>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mb-10"
          >
            <span className="font-serif text-6xl md:text-7xl text-primary-foreground">
              {amount}
            </span>
            <span className="text-2xl md:text-3xl text-mist/60 ml-2">₽</span>
          </motion.div>

          {/* Payment Handler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <PaymentHandler
              amount={amount}
              description={description}
              productName="Гайд по Чжанцзяцзе"
              pdfUrl={import.meta.env.VITE_PDF_URL}
            />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="flex flex-wrap justify-center gap-6 md:gap-8 mt-10"
          >
            <div className="flex items-center gap-2 text-mist/60 text-sm md:text-base">
              <Zap className="w-4 h-4" />
              <span>Мгновенный доступ</span>
            </div>
            <div className="flex items-center gap-2 text-mist/60 text-sm md:text-base">
              <Infinity className="w-4 h-4" />
              <span>Без подписки</span>
            </div>
            <div className="flex items-center gap-2 text-mist/60 text-sm md:text-base">
              <WifiOff className="w-4 h-4" />
              <span>Офлайн</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom padding for mobile sticky button */}
      <div className="h-20 md:h-0" />
    </section>
  );
}
