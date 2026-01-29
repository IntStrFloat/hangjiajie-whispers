import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { PdfPreviewSection } from '@/components/landing/PdfPreviewSection';
import { PurchaseSection } from '@/components/landing/PurchaseSection';

const Index = () => {
  const scrollToPurchase = () => {
    const purchaseSection = document.getElementById('purchase');
    purchaseSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePurchase = () => {
    // TODO: Integrate Stripe payment
    console.log('Purchase initiated');
    // For now, scroll to purchase section
    scrollToPurchase();
  };

  return (
    <main className="min-h-screen">
      <HeroSection onCtaClick={scrollToPurchase} />
      <AboutSection />
      <PdfPreviewSection />
      <PurchaseSection onPurchase={handlePurchase} />
    </main>
  );
};

export default Index;
