import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import heroImage from '@/assets/hero-zhangjiajie.jpg';

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <img
          src={heroImage}
          alt="Туманные скалы национального парка Чжанцзядзе"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-overlay" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 min-h-screen flex flex-col justify-end pb-24 md:pb-32 lg:pb-40 px-6 md:px-12 lg:px-20"
      >
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-4xl md:text-5xl lg:text-7xl text-primary-foreground leading-tight mb-6 md:mb-8"
          >
            Мой опыт путешествия
            <br />
            <span className="text-mist/90">по национальному парку Чжанцзядзе</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-lg md:text-xl text-mist/80 font-light max-w-2xl mb-10 md:mb-12"
          >
            Маршруты, места и советы, которые я бы хотел получить перед поездкой
          </motion.p>

          {/* Desktop CTA */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Button
                onClick={onCtaClick}
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Получить мой PDF-гайд
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mobile Sticky CTA */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-forest-deep/95 to-forest-deep/80 backdrop-blur-sm"
        >
          <Button
            onClick={onCtaClick}
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base py-6 rounded-full font-medium"
          >
            Получить мой PDF-гайд
          </Button>
        </motion.div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-mist/30 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 bg-mist/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
