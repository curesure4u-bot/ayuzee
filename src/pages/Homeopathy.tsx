import {  useEffect  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Pill, Sparkles, BookOpen, Stethoscope, ShieldCheck, GitCompareArrows, Activity, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const principles = [
  { title: "Like cures like", body: "A substance that produces symptoms in a healthy person can cure similar symptoms in a sick one (Similia Similibus Curentur)." },
  { title: "Single similimum", body: "One carefully chosen remedy matched to the totality of the patient — body, mind and emotions." },
  { title: "Minimum dose", body: "The smallest effective dose, prepared by potentisation, gentle yet deeply acting." },
  { title: "Constitutional approach", body: "Treats the person, not just the disease. Considers temperament, miasm, history and lifestyle." },
];

const tools = [
  { icon: Brain, title: "AI Constitutional Analysis", body: "Hahnemannian totality + miasmatic evaluation built into every digital case." },
  { icon: BookOpen, title: "200-Remedy Materia Medica", body: "Searchable library of polychrests with keynotes, modalities and mentals." },
  { icon: Activity, title: "Repertorisation Engine", body: "Kent-style symptom grading with SRP/keynote weighting." },
  { icon: GitCompareArrows, title: "AI Remedy Differentiation", body: "Side-by-side comparison of 2–4 remedies for clearer prescriptions." },
];

const Homeopathy = () => {
  usePageSEO({ title: "Homeopathy on Ayuzee — AI-Assisted Classical Practice" });
  useEffect(() => { const meta = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "Classical homeopathy backed by AI: constitutional case-taking, repertorisation, and a 200-remedy Materia Medica for verified doctors and patients in India.");
  }, []);

  return (
    <main className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-background to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20">
        <div className="container py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/60 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> AI-assisted classical homeopathy
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-6xl leading-tight">
              Homeopathy, prescribed with the rigour of <span className="text-emerald-700 dark:text-emerald-300">classical totality</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Find verified homeopathy doctors, learn about the science of single similimum, and let qualified physicians use Ayuzee's AI tools — built on Hahnemannian principles — to choose your remedy with care.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/doctors?system=Homeopathy">
                  <Stethoscope className="mr-2 h-4 w-4" /> Book a Homeopath
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/shop?system=Homeopathy">
                  <Pill className="mr-2 h-4 w-4" /> Shop Homeopathic Medicines
                </Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> All prescriptions issued by qualified BHMS / MD (Hom) physicians.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: "200+", l: "Remedies in library" },
                  { v: "Kent-style", l: "Repertorisation engine" },
                  { v: "AI", l: "Constitutional analysis" },
                  { v: "BHMS", l: "Verified physicians" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-muted/40 p-4">
                    <p className="font-display text-2xl text-emerald-700 dark:text-emerald-300">{s.v}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                <p className="font-semibold">For doctors</p>
                <p className="mt-1 text-emerald-800/80 dark:text-emerald-200/80">Sign in to access the Homeo case-taking suite, repertorisation engine and Materia Medica AI.</p>
                <Link to="/homeo" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
                  Open Homeo Console <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="container py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">The science</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Four principles, applied with discipline</h2>
          <p className="mt-3 text-muted-foreground">Homeopathy is a 220-year-old system of medicine recognised under India's AYUSH ministry. We pair its classical method with modern decision-support — never replacing the physician's judgement.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <article key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">For practitioners</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">A complete digital homeopathy suite</h2>
            <p className="mt-3 text-muted-foreground">Built for verified BHMS / MD (Hom) physicians. Every AI suggestion is decision-support — final prescription always rests with the doctor.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {tools.map((t) => (
              <article key={t.title} className="rounded-2xl border border-border bg-card p-6 flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
                  <t.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/doctor/auth">Join as a Homeopath</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/homeo">Open Homeo Console</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PATIENT JOURNEY */}
      <section className="container py-20">
        <h2 className="font-display text-3xl md:text-4xl">How it works for you</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "Book a verified doctor", b: "Filter by specialty, language and city. Video or in-clinic." },
            { n: "2", t: "Detailed case-taking", b: "Your physician records mentals, generals and modalities — the totality." },
            { n: "3", t: "Single remedy + follow-up", b: "Receive your similimum, dosing instructions and a tracked follow-up date." },
          ].map((s) => (
            <article key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <p className="font-display text-3xl text-emerald-700 dark:text-emerald-300">{s.n}</p>
              <h3 className="mt-2 font-display text-lg">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl">Start your homeopathic journey</h2>
          <p className="mt-3 text-emerald-100 max-w-xl mx-auto">A consultation with a verified homeopath, a thoughtful single remedy, and follow-ups that respect the gentle pace of cure.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/doctors?system=Homeopathy">Find a Homeopath</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10">
              <Link to="/shop?system=Homeopathy">Shop Medicines</Link>
            </Button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground italic">
          Educational and clinical decision-support content. Final prescription must be made by a qualified homeopathy physician.
        </p>
      </section>
    </main>
  );
};

export default Homeopathy;
