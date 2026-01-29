import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import aboutImage from '@/assets/about-zhangjiajie.jpg';

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: textRef, isVisible: textVisible } = useScrollAnimation({ threshold: 0.2 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative py-24 md:py-32 lg:py-40 bg-background overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with Parallax */}
          <motion.div
            className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl order-2 lg:order-1"
          >
            <motion.img
              style={{ y: imageY, scale: imageScale }}
              src={aboutImage}
              alt="Каменный столб в тумане, Чжанцзядзе"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/20 to-transparent" />
          </motion.div>

          {/* Text Content */}
          <div ref={textRef} className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={textVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-8">
                Что такое Чжанцзядзе
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={textVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                Чжанцзядзе — это один из самых необычных национальных парков в мире.
                Каменные столбы, туман, канатные дороги и километры пеших маршрутов.
              </p>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                Это место легко испортить плохим планированием —
                и так же легко раскрыть, если знать куда и в каком порядке идти.
              </p>
            </motion.div>

            {/* Decorative element */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={textVisible ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-10 h-px w-24 bg-accent origin-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
