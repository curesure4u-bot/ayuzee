import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { Doctors } from "@/components/site/Doctors";
import { Products } from "@/components/site/Products";
import { Therapy } from "@/components/site/Therapy";
import { PrakritiSection } from "@/components/site/PrakritiSection";
import { Learning } from "@/components/site/Learning";
import { Testimonials } from "@/components/site/Testimonials";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { PincodeWidget } from "@/components/site/PincodeWidget";
import { TrustStrip } from "@/components/site/TrustStrip";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { WelcomeUserTypeDialog } from "@/components/auth/WelcomeUserTypeDialog";
import { setSEO } from "@/lib/seo";

const AYUSH_SYSTEMS = [
  { name: "Ayurveda", icon: "🌿", desc: "Ancient healing through herbs, diet & Panchakarma", link: "/doctors?q=Ayurveda", color: "from-emerald-50 to-green-100 border-emerald-200 hover:border-emerald-400" },
  { name: "Siddha", icon: "⚗️", desc: "Tamil traditional medicine for chronic conditions", link: "/doctors?q=Siddha", color: "from-amber-50 to-orange-100 border-amber-200 hover:border-amber-400" },
  { name: "Homeopathy", icon: "💧", desc: "Micro-dose remedies for holistic healing", link: "/doctors?q=Homeopathy", color: "from-violet-50 to-purple-100 border-violet-200 hover:border-violet-400" },
  { name: "Unani", icon: "🏺", desc: "Greco-Arabic medicine for balanced temperament", link: "/doctors?q=Unani", color: "from-sky-50 to-blue-100 border-sky-200 hover:border-sky-400" },
  { name: "Yoga & Naturopathy", icon: "🧘", desc: "Mind-body wellness through natural therapies", link: "/doctors?q=Yoga", color: "from-rose-50 to-pink-100 border-rose-200 hover:border-rose-400" },
];

const AyushSystemsSection = () => (
  <section className="border-b border-border bg-background">
    <div className="container py-10">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold">All AYUSH Systems. One Platform.</h2>
        <p className="mt-2 text-muted-foreground">Consult verified doctors across India's 5 traditional medicine systems</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {AYUSH_SYSTEMS.map((sys) => (
          <Link
            key={sys.name}
            to={sys.link}
            className={`group rounded-2xl border bg-gradient-to-br ${sys.color} p-5 text-center transition-all hover:-translate-y-1 hover:shadow-elegant`}
          >
            <span className="text-3xl">{sys.icon}</span>
            <h3 className="mt-2 font-display text-base font-bold">{sys.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{sys.desc}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">🌿 100% Synthetic-Free</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">🎯 Root Cause Treatment</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">🔒 Private & Secured</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">🔄 Free Follow-Up in 7 days</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">💬 Text Chat from ₹99</span>
      </div>
    </div>
  </section>
);

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
      <PincodeWidget variant="banner" />
      <main>
        <Hero />
        <AyushSystemsSection />
        <TrustStrip />
        <Categories />
        <Doctors />
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
