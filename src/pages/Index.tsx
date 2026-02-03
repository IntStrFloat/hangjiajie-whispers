import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { PhotoGallerySection } from "@/components/landing/PhotoGallerySection";
import { PdfPreviewSection } from "@/components/landing/PdfPreviewSection";
import { PurchaseSection } from "@/components/landing/PurchaseSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Если Robokassa редиректит на корень (Success URL / Fail URL = site root), перенаправляем на /payment-success
  useEffect(() => {
    const invId = searchParams.get("InvId");
    const errorCode = searchParams.get("ErrorCode");
    const outSum = searchParams.get("OutSum");
    const signature = searchParams.get("SignatureValue");
    if (
      invId != null ||
      errorCode != null ||
      (outSum != null && signature != null)
    ) {
      navigate(`/payment-success?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [navigate, searchParams]);

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
      <Footer />
    </main>
  );
};

export default Index;
