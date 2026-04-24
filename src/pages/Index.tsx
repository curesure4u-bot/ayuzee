import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { Doctors } from "@/components/site/Doctors";
import { WhyAyuzee } from "@/components/site/WhyAyuzee";
import { Products } from "@/components/site/Products";
import { Therapy } from "@/components/site/Therapy";
import { PrakritiSection } from "@/components/site/PrakritiSection";
import { Learning } from "@/components/site/Learning";
import { Testimonials } from "@/components/site/Testimonials";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WelcomeUserTypeDialog } from "@/components/auth/WelcomeUserTypeDialog";
import { setSEO } from "@/lib/seo";

const Index = () => {
  const [params, setParams] = useSearchParams();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    setSEO(
      "Ayuzee — India's #1 AYUSH Platform | Ayurveda Doctors, Panchakarma Therapists, Medicines",
      "Book verified Ayurveda, Homeopathy, Siddha & Unani doctors online. GPS-tracked Panchakarma therapists. Authentic medicines delivered pan-India. Prakriti AI diagnosis.",
    );

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      name: "Ayuzee",
      description: "India's #1 AYUSH Aggregator Platform — Ayurveda doctors, Panchakarma therapists, authentic medicines",
      url: "https://ayuzee.com",
      logo: "https://ayuzee.com/icon-512.png",
      medicalSpecialty: ["Ayurveda", "Homeopathy", "Unani", "Siddha", "Yoga"],
      areaServed: "IN",
      sameAs: ["https://twitter.com/ayuzee", "https://facebook.com/ayuzee"],
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (params.get("welcome") === "1") setWelcomeOpen(true);
  }, [params]);

  const handleClose = (v: boolean) => {
    setWelcomeOpen(v);
    if (!v && params.get("welcome")) {
      params.delete("welcome");
      setParams(params, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <Categories />
        <Doctors />
        <WhyAyuzee />
        <Products />
        <Therapy />
        <PrakritiSection />
        <Learning />
        <Testimonials />
        <Blog />
        <CTA />
      </main>
      <Footer />
      <WelcomeUserTypeDialog open={welcomeOpen} onOpenChange={handleClose} />
    </div>
  );
};

export default Index;
