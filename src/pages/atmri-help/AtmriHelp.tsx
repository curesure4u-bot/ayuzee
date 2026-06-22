import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  inTreatment: number;
  pledgeDoctors: number;
  medicinesDispatched: number;
  completed: number;
  consultsDonated: number;
  partnerHospitals: number;
};

type Case = {
  id: string;
  status: string;
  created_at: string;
};

const AtmriHelp = () => {
  const [stats, setStats] = useState<Stats>({
    inTreatment: 0,
    pledgeDoctors: 0,
    medicinesDispatched: 0,
    completed: 0,
    consultsDonated: 0,
    partnerHospitals: 0,
  });
  const [urgent, setUrgent] = useState<Case[]>([]);

  useEffect(() => {
    document.title = "Free Ayurvedic Treatment — ATMRI Trust × Ayuzee";
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    (meta as HTMLMetaElement).content = "ATMRI Trust funds free AYUSH treatment for underprivileged patients. Zero crowdfunding. 80G-compliant.";

    (async () => {
      const c = supabase as any;
      const [inTx, completed, hospitals, pledges] = await Promise.all([
        c.from("atmri_sponsored_cases_public").select("id", { count: "exact", head: true }).eq("status", "in_treatment"),
        c.from("atmri_sponsored_cases_public").select("id", { count: "exact", head: true }).eq("status", "completed"),
        c.from("atmri_partner_hospitals_public").select("id", { count: "exact", head: true }),
        c.from("doctor_charity_pledges").select("total_consultations_donated, is_active"),
      ]);
      const pledgeRows = (pledges.data ?? []) as { total_consultations_donated: number; is_active: boolean }[];
      setStats({
        inTreatment: inTx.count ?? 0,
        completed: completed.count ?? 0,
        medicinesDispatched: 0, // PII-restricted field no longer publicly aggregated
        partnerHospitals: hospitals.count ?? 0,
        pledgeDoctors: pledgeRows.filter((p) => p.is_active).length,
        consultsDonated: pledgeRows.reduce((s, p) => s + (p.total_consultations_donated || 0), 0),
      });

      // Patient names/stories are no longer publicly listed; urgent highlight removed.
      setUrgent([]);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <style>{`
        @keyframes atmri-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .atmri-float-1 { animation: atmri-float 6s ease-in-out infinite; }
        .atmri-float-2 { animation: atmri-float 6s ease-in-out infinite; animation-delay: -2s; }
        .atmri-float-3 { animation: atmri-float 6s ease-in-out infinite; animation-delay: -4s; }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge className="mb-5 border-transparent bg-primary/10 text-primary hover:bg-primary/15">
              🏛️ ATMRI Trust · 80G · 12A · 12AA — Sponsoring Free AYUSH Treatment
            </Badge>
            <h1 className="font-display text-5xl font-semibold leading-tight text-foreground md:text-6xl">
              Free Ayurvedic Treatment<br />
              <span className="text-primary">for Those Who Need It Most</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              ATMRI Trust and Ayuzee directly fund hospital bills, medicines, and therapy sessions for
              underprivileged patients. No fundraising. No waiting. Pure charitable care.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["🚫 Zero cash to patient", "💊 Medicines sent directly", "🩺 Doctor donates consultation"].map((t) => (
                <span key={t} className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">{t}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/atmri-help/apply">📋 Apply for Free Treatment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/atmri-help/pledge">🩺 Doctors: Pledge Free Consults</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              AYUSH &amp; Traditional Medicine Research Institute Trust · Registered under Indian Trusts Act
              · 80G: [your number] · 12A: [your number] · 12AA: [your number]
            </p>
          </div>

          <div className="relative hidden h-[420px] lg:block">
            <Card className="atmri-float-1 absolute right-0 top-2 w-72 border-green-200 bg-green-50 p-5 shadow-elegant">
              <p className="text-xs uppercase tracking-wider text-green-700">In treatment</p>
              <p className="mt-1 font-display text-2xl font-semibold text-green-900">🌿 {stats.inTreatment} Patients</p>
              <p className="mt-1 text-xs text-green-800/70">Currently receiving free treatment</p>
            </Card>
            <Card className="atmri-float-2 absolute left-0 top-36 w-72 border-amber-200 bg-amber-50 p-5 shadow-elegant">
              <p className="text-xs uppercase tracking-wider text-amber-700">Doctors pledged</p>
              <p className="mt-1 font-display text-2xl font-semibold text-amber-900">🩺 {stats.pledgeDoctors} Doctors</p>
              <p className="mt-1 text-xs text-amber-800/70">Donating free consultations every month</p>
            </Card>
            <Card className="atmri-float-3 absolute right-6 bottom-0 w-72 border-blue-200 bg-blue-50 p-5 shadow-elegant">
              <p className="text-xs uppercase tracking-wider text-blue-700">Medicines dispatched</p>
              <p className="mt-1 font-display text-2xl font-semibold text-blue-900">💊 {stats.medicinesDispatched} Kits</p>
              <p className="mt-1 text-xs text-blue-800/70">Authentic medicines delivered free</p>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-3 border-transparent bg-accent text-primary hover:bg-accent">🌿 The ATMRI Trust Model</Badge>
          <h2 className="font-display text-4xl font-semibold">No donation needed. Trust pays everything.</h2>
          <p className="mt-3 text-muted-foreground">
            Unlike crowdfunding platforms that ask the public to donate, ATMRI Trust directly funds your treatment from its charitable corpus.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
          {[
            { c: "border-green-200 bg-green-50 text-green-900", t: "📋 Patient Applies", b: "Family or doctor submits the case with medical documents. Completely free." },
            { c: "border-blue-200 bg-blue-50 text-blue-900", t: "✅ ATMRI Reviews", b: "Our medical team verifies the condition and treatment plan. Admin does a video call." },
            { c: "border-amber-200 bg-amber-50 text-amber-900", t: "🩺 Doctor Assigned", b: "A verified Ayuzee doctor pledges a free consultation. They sign a legal declaration." },
            { c: "border-purple-200 bg-purple-50 text-purple-900", t: "💊 Treatment Begins", b: "Medicines dispatched free. Therapy sessions funded by Trust. Hospital bill paid directly by ATMRI." },
            { c: "border-teal-200 bg-teal-50 text-teal-900", t: "📸 Outcome Shared", b: "Patient's progress is documented. Shared (with consent) to inspire others." },
          ].flatMap((step, i, arr) => {
            const items: JSX.Element[] = [
              <Card key={`s${i}`} className={`h-full border-2 p-5 ${step.c}`}>
                <p className="font-semibold">{step.t}</p>
                <p className="mt-2 text-sm opacity-80">{step.b}</p>
              </Card>,
            ];
            if (i < arr.length - 1) items.push(<ChevronRight key={`a${i}`} className="hidden h-6 w-6 text-muted-foreground md:block" />);
            return items;
          })}
        </div>

        <div className="mt-10 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center text-amber-900">
          ⚡ <strong>ATMRI Trust pays the hospital directly.</strong> Zero cash ever touches the patient. This is why we are FCRA compliant and IT-audited.
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="border-y bg-card py-12">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-5">
          {[
            { e: "🌿", n: stats.completed, l: "Patients Healed" },
            { e: "🏥", n: stats.inTreatment, l: "In Treatment Now" },
            { e: "🩺", n: stats.consultsDonated, l: "Consults Donated" },
            { e: "💊", n: stats.medicinesDispatched, l: "Medicine Kits Dispatched" },
            { e: "🏛️", n: stats.partnerHospitals, l: "Partner Hospitals" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl">{s.e}</p>
              <p className="mt-1 font-display text-3xl font-semibold text-primary">{s.n}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE CASES */}
      <section className="container py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">🌿 Patients Currently Being Helped</h2>
            <p className="text-muted-foreground">With consent — sharing their journey to inspire others</p>
          </div>
          <Button asChild variant="outline"><Link to="/atmri-help/cases">View All Cases →</Link></Button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {urgent.length === 0 && <p className="text-sm text-muted-foreground">No urgent active cases right now.</p>}
          {urgent.map((c) => (
            <Card key={c.id} className="overflow-hidden transition-all hover:-translate-y-1">
              <div className="relative h-44 bg-gradient-to-br from-primary/20 to-accent">
                {c.patient_photo_url ? (
                  <img src={c.patient_photo_url} alt={c.patient_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center font-display text-5xl text-primary">{c.patient_name.charAt(0)}</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs text-white">🟢 In Treatment</span>
                {c.is_urgent && <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs text-white">🔴 URGENT</span>}
              </div>
              <div className="p-5">
                <span className="rounded-full bg-accent px-2 py-1 text-xs text-primary">{c.condition_name}</span>
                <p className="mt-2 font-semibold text-lg">{c.patient_name}</p>
                <p className="text-sm text-muted-foreground">{c.patient_city}, {c.patient_state}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.patient_story}</p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to={`/atmri-help/cases/${c.id}`}>Read Story →</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW TO HELP */}
      <section className="bg-accent/30 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { t: "You are a Patient / Family", b1: "Apply for FREE treatment from ATMRI Trust", b2: "Our team will review your case within 48 hours.", cta: "Apply Now →", to: "/atmri-help/apply" },
              { t: "You are a Doctor", b1: "Pledge free consultations. Earn the AYUSH Healing Doctor badge.", b2: "Even 1 consult/month changes a patient's life.", cta: "Pledge Now →", to: "/atmri-help/pledge" },
              { t: "You are a Hospital / Clinic", b1: "Become an ATMRI partner. Reserve beds for Trust patients. Sign an MOU.", b2: "Your facility gets CSR recognition and Ayuzee listing.", cta: "Partner With Us →", to: "/atmri-help/hospitals" },
            ].map((card) => (
              <Card key={card.t} className="flex flex-col p-6">
                <p className="font-display text-xl font-semibold">{card.t}</p>
                <p className="mt-3 text-sm text-foreground">{card.b1}</p>
                <p className="mt-2 text-sm text-muted-foreground">{card.b2}</p>
                <Button asChild className="mt-auto pt-4" variant="outline"><Link to={card.to}>{card.cta}</Link></Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AtmriHelp;
