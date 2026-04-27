import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const HomeopathyHub = () => {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("doctors")
      .select("id, full_name, specialization, city, consultation_fee, rating, avatar_url")
      .ilike("category", "%Homeopathy%")
      .eq("is_verified", true)
      .limit(4)
      .then(({ data }) => setDoctors(data || []));
  }, []);

  const cards = [
    {
      icon: "📋",
      title: "Case Taking Software",
      desc: "Digital case sheet following classical homeopathy protocol — chief complaint, mentals, generals, miasm assessment.",
      cta: "Start Case →",
      to: "/homeopathy/case/new",
      bg: "bg-purple-50 border-purple-200",
    },
    {
      icon: "🔍",
      title: "Kent Repertory Search",
      desc: "Search 68,000+ rubrics from Kent, Boericke, and Boenninghausen. AI-assisted repertorisation with remedy scoring.",
      cta: "Search Repertory →",
      to: "/homeopathy/repertory",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      icon: "📚",
      title: "Materia Medica Library",
      desc: "Complete Boericke Materia Medica with 3,500+ remedy profiles. Compare remedies, find keynotes, check antidotes.",
      cta: "Browse Remedies →",
      to: "/homeopathy/materia-medica",
      bg: "bg-green-50 border-green-200",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel={true} />

      {/* HERO */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            💊 India's First Cloud Homeopathy Platform
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold leading-tight">
            Classical Homeopathy<br />
            <span className="text-purple-700">in the Digital Age</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with BHMS doctors, get AI-assisted Kent Repertory analysis, and access 3,500+ remedy profiles — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-purple-700 hover:bg-purple-800 text-white">
              <Link to="/doctors?system=Homeopathy">Find Homeopathy Doctor →</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Link to="/doctor/auth">BHMS Doctor? Join Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3 FEATURE CARDS */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.title} className={`rounded-2xl border-2 p-6 ${card.bg}`}>
              <div className="text-4xl">{card.icon}</div>
              <h3 className="mt-4 font-semibold text-xl">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
              <Link to={card.to} className="mt-4 inline-block text-sm font-semibold text-purple-700 hover:text-purple-900">
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED HOMEOPATHY DOCTORS */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Verified Homeopathy Doctors</h2>
              <p className="text-muted-foreground mt-1">BHMS qualified, online and in-clinic consultations</p>
            </div>
            <Link to="/doctors?system=Homeopathy" className="text-sm font-semibold text-purple-700 hover:text-purple-900">
              View All →
            </Link>
          </div>
          {doctors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-border">
              <div className="text-5xl">🩺</div>
              <p className="mt-3 text-muted-foreground">Homeopathy doctors will appear here once verified.</p>
              <Link to="/doctor/auth" className="mt-4 inline-block text-sm font-semibold text-purple-700">
                Register as BHMS Doctor →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctors.map((doc) => (
                <Link to={`/doctors/${doc.id}`} key={doc.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-all">
                  <div className="h-16 w-16 rounded-full bg-purple-100 grid place-items-center font-bold text-purple-700 text-lg">
                    {doc.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="mt-3 font-semibold">{doc.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                  <p className="text-xs text-muted-foreground mt-1">📍 {doc.city}</p>
                  <p className="text-sm font-semibold text-purple-700 mt-2">₹{doc.consultation_fee}/consult</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA FOR BHMS DOCTORS */}
      <section className="py-20 bg-purple-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold">Are you a BHMS Doctor?</h2>
          <p className="mt-4 text-lg text-purple-100">
            Get free access to India's only cloud-based homeopathy case taking software. Kent Repertory search, AI remedy analysis, digital prescriptions — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50">
              <Link to="/doctor/auth">Join Free as BHMS Doctor</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/homeopathy/materia-medica">Browse Materia Medica</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default HomeopathyHub;
