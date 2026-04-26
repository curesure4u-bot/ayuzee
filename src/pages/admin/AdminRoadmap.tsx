import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, Sparkles, Download, Rocket, Target, TrendingUp } from "lucide-react";

type Status = "shipped" | "in_progress" | "planned" | "vision";

const statusMeta: Record<Status, { label: string; className: string; dot: string; icon: typeof CheckCircle2 }> = {
  shipped:     { label: "Shipped",      className: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40", dot: "bg-emerald-500",  icon: CheckCircle2 },
  in_progress: { label: "In Progress",  className: "bg-amber-500/10 text-amber-700 border-amber-300/40",       dot: "bg-amber-500",    icon: Clock },
  planned:     { label: "Planned",      className: "bg-slate-500/10 text-slate-700 border-slate-300/40",       dot: "bg-slate-500",    icon: Circle },
  vision:      { label: "Vision",       className: "bg-violet-500/10 text-violet-700 border-violet-300/40",    dot: "bg-violet-500",   icon: Sparkles },
};

interface Module { name: string; status: Status }
interface Phase { id: string; name: string; window: string; status: Status; summary: string; modules: Module[] }

const phases: Phase[] = [
  { id: "P1", name: "Foundation",                    window: "Q4 2024 — Q2 2026", status: "shipped",     summary: "Core multi-portal platform — patient, doctor, therapist, venue, student & admin apps, payments, wallet, Prakriti AI.",
    modules: [
      { name: "Patient App + Onboarding", status: "shipped" },
      { name: "Doctor Portal (HMS, EMR, Prescriptions)", status: "shipped" },
      { name: "Therapist & Venue Portals", status: "shipped" },
      { name: "Student Learning Hub", status: "shipped" },
      { name: "Admin Super Dashboard (28 modules)", status: "shipped" },
      { name: "Razorpay Payments + Wallet + Referrals", status: "shipped" },
      { name: "Prakriti AI Diagnosis", status: "shipped" },
      { name: "Panchakarma Booking Engine", status: "shipped" },
      { name: "Medicine Store + Bulk Catalog", status: "shipped" },
      { name: "ATMRI Charity Model 3", status: "shipped" },
    ]},
  { id: "P2", name: "Homeopathy AI Suite",           window: "Q2 2026", status: "shipped", summary: "Premium Homeopathy Repertory + Materia Medica AI with 1000 rubrics and 200 remedies.",
    modules: [
      { name: "Case Taking (13-section EMR)", status: "shipped" },
      { name: "Repertory (1000 rubrics, weighted ranking)", status: "shipped" },
      { name: "Materia Medica (200 remedies)", status: "shipped" },
      { name: "AI Rubric Finder (NLP)", status: "shipped" },
      { name: "Remedy Comparison Engine", status: "shipped" },
      { name: "Saved Cases & Follow-ups", status: "shipped" },
      { name: "Prescription PDF Export", status: "shipped" },
    ]},
  { id: "P3", name: "Clinical Intelligence Layer",   window: "Q3 2026", status: "in_progress", summary: "AI co-pilot across every consultation — differentials, drug interactions, classical references, voice scribe.",
    modules: [
      { name: "AI Clinical Decision Support (CDS)", status: "in_progress" },
      { name: "AI Voice Scribe (multilingual)", status: "in_progress" },
      { name: "Drug-Herb Interaction Checker", status: "planned" },
      { name: "Classical Reference Engine (Charaka, Sushruta)", status: "planned" },
      { name: "Pulse & Tongue AI Diagnosis (image)", status: "planned" },
      { name: "AI Triage Bot for Patients", status: "planned" },
      { name: "Lab Report OCR + Interpretation", status: "planned" },
    ]},
  { id: "P4", name: "ABDM & Govt Integration",       window: "Q4 2026", status: "planned", summary: "National Health Stack compliance — ABHA, FHIR, e-Sanjeevani interoperability.",
    modules: [
      { name: "ABHA Linking & Health Records Push", status: "in_progress" },
      { name: "FHIR R4 Bundle Export", status: "planned" },
      { name: "NDHM Consent Manager", status: "planned" },
      { name: "AYUSH Ministry Reporting Dashboard", status: "planned" },
      { name: "DigiLocker Prescription Storage", status: "planned" },
      { name: "e-Sanjeevani Bridge", status: "planned" },
    ]},
  { id: "P5", name: "Hospital Management (HIMS)",    window: "Q1 2027", status: "planned", summary: "Full hospital OS for AYUSH clinics, Panchakarma centers and integrative hospitals.",
    modules: [
      { name: "OPD / IPD Management", status: "planned" },
      { name: "Bed & Room Allocation", status: "planned" },
      { name: "Pharmacy & Inventory (batch, expiry)", status: "planned" },
      { name: "Billing, GST & Insurance Claims", status: "planned" },
      { name: "Staff Roster & Payroll", status: "planned" },
      { name: "Lab & Imaging Module", status: "planned" },
      { name: "HR & Asset Management", status: "planned" },
    ]},
  { id: "P6", name: "AYUSH Marketplace & D2C",       window: "Q2 2027", status: "planned", summary: "Vertical commerce: authentic medicines, kits, devices, organic foods, B2B bulk.",
    modules: [
      { name: "Verified Brand Storefronts", status: "planned" },
      { name: "Subscription & Refill Engine", status: "planned" },
      { name: "Cold-chain & Pan-India Logistics", status: "planned" },
      { name: "B2B Wholesale & Tendering", status: "planned" },
      { name: "AYUSH Devices (Nasya, Shirodhara kits)", status: "planned" },
      { name: "Organic Food & Nutraceuticals", status: "planned" },
    ]},
  { id: "P7", name: "Education & Research Cloud",    window: "Q3 2027", status: "planned", summary: "EdTech + research network for BAMS/BHMS students, PG aspirants and researchers.",
    modules: [
      { name: "Live Classes & Webinars", status: "in_progress" },
      { name: "PG Entrance Prep (AIAPGET)", status: "planned" },
      { name: "Case Library (1L+ anonymised cases)", status: "planned" },
      { name: "Research Collaboration Network", status: "planned" },
      { name: "Verified Certificates on-chain", status: "planned" },
      { name: "Internship & Job Marketplace", status: "in_progress" },
    ]},
  { id: "P8", name: "Global Expansion",              window: "Q4 2027", status: "planned", summary: "Take Indian AYUSH to UAE, UK, USA & SEA via teleconsult and verified exports.",
    modules: [
      { name: "Multi-currency & Multi-language", status: "planned" },
      { name: "International Teleconsultation", status: "planned" },
      { name: "FDA / EU Compliance for Exports", status: "planned" },
      { name: "Diaspora Wellness Subscriptions", status: "planned" },
      { name: "Partner Clinics Abroad", status: "planned" },
    ]},
  { id: "P9", name: "Ayuzee AI Super-Intelligence",  window: "2028", status: "vision", summary: "Personal AYUSH AI for every Indian — predictive, preventive, prakriti-aware.",
    modules: [
      { name: "Personal Prakriti Lifelong Twin", status: "vision" },
      { name: "Predictive Disease Risk (Ayur + ML)", status: "vision" },
      { name: "Smart Home Integration (sleep, vitals)", status: "vision" },
      { name: "Family Health Graph", status: "vision" },
      { name: "AI Yoga & Diet Coach (vision-based)", status: "vision" },
      { name: "Ayuzee Genome × Dosha Analysis", status: "vision" },
    ]},
];

const metrics = [
  { label: "Verified Practitioners", y2026: "10,000",     y2027: "40,000",     y2028: "1,00,000",    icon: Target },
  { label: "Active Patients",        y2026: "2,00,000",   y2027: "20,00,000",  y2028: "1,00,00,000", icon: TrendingUp },
  { label: "Cities Served",          y2026: "50",         y2027: "300",        y2028: "1,000+",      icon: Rocket },
  { label: "ARR (₹ Cr)",             y2026: "15",         y2027: "150",        y2028: "1,000",       icon: Sparkles },
];

const filters: (Status | "all")[] = ["all", "shipped", "in_progress", "planned", "vision"];

const AdminRoadmap = () => {
  const [filter, setFilter] = useState<Status | "all">("all");

  const stats = useMemo(() => {
    const all = phases.flatMap((p) => p.modules);
    const count = (s: Status) => all.filter((m) => m.status === s).length;
    return { total: all.length, shipped: count("shipped"), in_progress: count("in_progress"), planned: count("planned"), vision: count("vision") };
  }, []);

  const completion = Math.round((stats.shipped / stats.total) * 100);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Strategic roadmap · Confidential</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">The Ayuzee AI Super App</h1>
            <p className="mt-3 max-w-2xl text-base text-emerald-100/90">India's #1 AYUSH Intelligence Platform — Ayurveda, Homeopathy, Siddha, Unani & Yoga. Built for 1 billion patients. Powered by AI.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <span className="rounded-full bg-white/10 px-3 py-1">9 Phases</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{stats.total} Modules</span>
              <span className="rounded-full bg-white/10 px-3 py-1">2026 → 2028</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild variant="secondary" className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
              <a href="/Ayuzee_AI_SuperApp_Roadmap.pdf" target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Download PDF</a>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
              <a href="/Ayuzee_AI_SuperApp_Roadmap.pptx" target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Download Deck</a>
            </Button>
          </div>
        </div>
        <div className="relative mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Shipped", value: stats.shipped, color: "text-emerald-300" },
            { label: "In Progress", value: stats.in_progress, color: "text-amber-300" },
            { label: "Planned", value: stats.planned, color: "text-sky-200" },
            { label: "Vision", value: stats.vision, color: "text-violet-200" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/70">{s.label}</p>
              <p className={`mt-1 font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-6 flex items-center gap-4">
          <Progress value={completion} className="h-2 flex-1 bg-white/10" />
          <span className="text-sm font-semibold text-amber-300">{completion}% delivered</span>
        </div>
      </Card>

      {/* Growth Targets */}
      <div>
        <h2 className="font-display text-2xl font-bold">Growth targets</h2>
        <p className="mt-1 text-sm text-muted-foreground">North star — 10M treated patients, 1L verified practitioners, ₹1000 Cr ARR by 2028.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="overflow-hidden border-border/60">
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{m.label}</p>
                  <m.icon className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 font-display text-3xl font-bold text-emerald-900">{m.y2028}</p>
                <p className="mt-2 text-xs text-muted-foreground">2026 <span className="font-semibold text-foreground">{m.y2026}</span>  ·  2027 <span className="font-semibold text-foreground">{m.y2027}</span></p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filter</span>
        {filters.map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className={filter === f ? "bg-emerald-700 hover:bg-emerald-800" : ""}>
            {f === "all" ? "All" : statusMeta[f].label}
          </Button>
        ))}
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {phases.map((phase, idx) => {
          const visible = filter === "all" ? phase.modules : phase.modules.filter((m) => m.status === filter);
          if (!visible.length) return null;
          const meta = statusMeta[phase.status];
          const PhaseIcon = meta.icon;
          return (
            <Card key={phase.id} className="overflow-hidden border-border/60">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-emerald-50 to-transparent p-6 dark:from-emerald-950/30">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-900 font-display text-lg font-bold text-amber-300">{phase.id}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-2xl font-bold">{phase.name}</h3>
                      <Badge variant="outline" className={meta.className}><PhaseIcon className="mr-1 h-3 w-3" />{meta.label}</Badge>
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{phase.window}</p>
                    <p className="mt-2 max-w-3xl text-sm text-foreground/80">{phase.summary}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p className="font-bold uppercase tracking-widest">Modules</p>
                  <p className="mt-1 font-display text-3xl font-bold text-emerald-900 dark:text-emerald-300">{visible.length}<span className="text-base text-muted-foreground">/{phase.modules.length}</span></p>
                </div>
              </div>
              <div className="grid gap-3 p-6 md:grid-cols-2">
                {visible.map((m) => {
                  const ms = statusMeta[m.status];
                  const Icon = ms.icon;
                  return (
                    <div key={m.name} className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                      <span className={`absolute left-0 top-0 h-full w-1 ${ms.dot}`} />
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="flex-1 text-sm font-medium">{m.name}</p>
                      <Badge variant="outline" className={`shrink-0 text-[10px] ${ms.className}`}>{ms.label}</Badge>
                    </div>
                  );
                })}
              </div>
              {idx < phases.length - 1 && <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />}
            </Card>
          );
        })}
      </div>

      <Card className="border-emerald-200/40 bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 text-center text-white">
        <h3 className="font-display text-3xl font-bold">Powered by Ayuzee AI</h3>
        <p className="mt-2 text-emerald-100/90">Integrative AYUSH Intelligence Platform — built in India for the world.</p>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-400" />
      </Card>
    </div>
  );
};

export default AdminRoadmap;
