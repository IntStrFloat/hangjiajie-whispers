import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { MapPin, Route, Clock, CheckCircle, User } from 'lucide-react';

const features = [
  { icon: Route, text: 'Готовые маршруты' },
  { icon: MapPin, text: 'Карты и ключевые точки' },
  { icon: Clock, text: 'Где теряется время' },
  { icon: CheckCircle, text: 'Что стоит и не стоит делать' },
  { icon: User, text: 'Всё на основе личного опыта' },
];

export function PdfPreviewSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  return (
    <section className="relative py-24 md:py-32 lg:py-40 bg-mist/30 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-forest-light/10 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* PDF Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            {/* Floating tablet mockup */}
            <motion.div
              animate={isVisible ? { y: [0, -15, 0] } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              {/* Tablet frame */}
              <div className="relative bg-foreground rounded-[2.5rem] p-3 shadow-2xl max-w-sm mx-auto lg:mx-0">
                <div className="bg-card rounded-[2rem] overflow-hidden aspect-[3/4]">
                  {/* PDF Preview Content */}
                  <div className="h-full p-6 flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-accent" />
                      </div>
                      <h4 className="font-serif text-xl text-foreground">Гайд по Чжанцзядзе</h4>
                      <p className="text-sm text-muted-foreground mt-1">PDF • 24 страницы</p>
                    </div>

                    {/* Sample content */}
                    <div className="space-y-4 flex-1">
                      <div className="bg-mist/50 rounded-lg p-3">
                        <div className="h-2 bg-stone/30 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-stone/20 rounded w-1/2" />
                      </div>
                      <div className="bg-mist/50 rounded-lg p-3">
                        <div className="h-2 bg-stone/30 rounded w-2/3 mb-2" />
                        <div className="h-2 bg-stone/20 rounded w-4/5" />
                      </div>
                      <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Route className="w-4 h-4 text-accent" />
                          <div className="h-2 bg-accent/30 rounded w-1/2" />
                        </div>
                        <div className="h-2 bg-stone/20 rounded w-3/4" />
                      </div>
                    </div>

                    {/* Page indicator */}
                    <div className="flex justify-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i === 0 ? 'bg-accent' : 'bg-stone/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative shadow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-foreground/10 blur-2xl rounded-full" />
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={isVisible ? { y: [0, -10, 0], rotate: [-3, 3, -3] } : {}}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-8 -right-8 lg:right-8 w-20 h-20 bg-card rounded-2xl shadow-xl flex items-center justify-center"
            >
              <MapPin className="w-10 h-10 text-accent" />
            </motion.div>

            <motion.div
              animate={isVisible ? { y: [0, 8, 0], rotate: [3, -3, 3] } : {}}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-4 -left-4 lg:left-8 w-16 h-16 bg-card rounded-xl shadow-lg flex items-center justify-center"
            >
              <Route className="w-8 h-8 text-forest-light" />
            </motion.div>
          </motion.div>

          {/* Features List */}
          <div className="lg:pl-8">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-10"
            >
              Что внутри PDF
            </motion.h2>

            <ul className="space-y-6">
              {features.map((feature, index) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.1,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-lg md:text-xl text-foreground font-light">
                    {feature.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
