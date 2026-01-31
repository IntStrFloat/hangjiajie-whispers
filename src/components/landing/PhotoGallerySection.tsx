import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Для замены на свои фото: положите изображения в public/images/gallery/
// и используйте пути вида: /images/gallery/yangjiajie.jpg
const PHOTOS = [
  {
    id: "yangjiajie",
    title: "Территория Янцзяцзе",
    description: "Живописный район с каменными столбами и туманными долинами",
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
  },
  {
    id: "tianmen",
    title: "Окрестности горы Тянмень",
    description: "Небесные ворота и горные тропы",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
  },
  {
    id: "bailong",
    title: "Лифт Байлунг",
    description: "Самый высокий в мире наружный лифт",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  },
  {
    id: "grand-canyon",
    title: "Гранд Каньон",
    description: "Величественные ущелья и обрывы",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: "dragon-cave",
    title: "Пещера дракона",
    description: "Подземное царство сталактитов и сталагмитов",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
] as const;

export function PhotoGallerySection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section
      id="gallery"
      ref={ref}
      className="relative py-24 md:py-32 lg:py-40 bg-mist/30 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest-light/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-4">
            Чжанцзяцзе в фотографиях
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Ключевые локации национального парка
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PHOTOS.map((photo, index) => (
            <motion.article
              key={photo.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3] bg-muted">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                  <h3 className="font-serif text-xl md:text-2xl font-medium mb-2">
                    {photo.title}
                  </h3>
                  <p className="text-sm md:text-base text-primary-foreground/80 font-light">
                    {photo.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
