import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { Doctors } from "@/components/site/Doctors";
import { Products } from "@/components/site/Products";
import { Therapy } from "@/components/site/Therapy";
import { Learning } from "@/components/site/Learning";
import { Testimonials } from "@/components/site/Testimonials";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WelcomeUserTypeDialog } from "@/components/auth/WelcomeUserTypeDialog";

const Index = () => {
  const [params, setParams] = useSearchParams();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

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
        <Products />
        <Therapy />
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
