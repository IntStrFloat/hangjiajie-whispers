import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { PhotoGallerySection } from "@/components/landing/PhotoGallerySection";
import { PdfPreviewSection } from "@/components/landing/PdfPreviewSection";
import { PurchaseSection } from "@/components/landing/PurchaseSection";

const Index = () => {
  const scrollToPurchase = () => {
    const purchaseSection = document.getElementById("purchase");
    purchaseSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen">
      <HeroSection onCtaClick={scrollToPurchase} />
      <AboutSection />
      <PhotoGallerySection />
      <PdfPreviewSection />
      <PurchaseSection />
    </main>
  );
};

export default Index;
