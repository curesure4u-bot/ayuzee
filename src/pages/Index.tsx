import { Header } from "@/components/site/Header";
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
    </div>
  );
};

export default Index;
