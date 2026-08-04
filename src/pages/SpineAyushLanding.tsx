import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Activity, ArrowRight, ArrowDown, CheckCircle2, Star, Users, Heart,
  Brain, Clock, Zap, Phone, MapPin, Target, TrendingUp,
  Sparkles, ChevronRight, Eye, Shield, Leaf, Play, Send,
} from "lucide-react";

export default function SpineAyushLanding() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [leadForm, setLeadForm] = useState({ name: "", age: "", sex: "", place: "", email: "", whatsapp: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Entry paths — not just pain, but many reasons people come
  const entryPaths = [
    { id: "pain", title: "I Have Pain", subtitle: "Back, neck, sciatica, disc — I want relief", icon: Zap, color: "bg-red-50 border-red-200", textColor: "text-red-700" },
    { id: "posture", title: "My Posture is Bad", subtitle: "Desk work, phone use, rounded shoulders — I want to fix it", icon: Eye, color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
    { id: "energy", title: "I Feel Low Energy", subtitle: "Fatigue, stiffness, brain fog — spine might be the cause", icon: Sparkles, color: "bg-amber-50 border-amber-200", textColor: "text-amber-700" },
    { id: "prevention", title: "I Want Prevention", subtitle: "Family history, aging, desk job — I don't want problems later", icon: Shield, color: "bg-green-50 border-green-200", textColor: "text-green-700" },
    { id: "organ", title: "I Have Organ Issues", subtitle: "Acidity, PCOD, thyroid, breathing — could be spine-related", icon: Heart, color: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
    { id: "performance", title: "I Want Peak Performance", subtitle: "Athlete, yoga practitioner, dancer — I want a stronger spine", icon: TrendingUp, color: "bg-indigo-50 border-indigo-200", textColor: "text-indigo-700" },
  ];

  const pathDetails: Record<string, { headline: string; points: string[]; cta: string }> = {
    pain: { headline: "We treat the ROOT CAUSE of your pain — not just mask symptoms", points: ["Identify which spinal level + muscle imbalance causes YOUR pain", "15 therapy systems combined (not just one approach)", "Self-management tools so you never depend on clinics forever", "83% of our patients become pain-free within 3-6 months"], cta: "Get Your Spine Assessed" },
    posture: { headline: "Your posture shapes your health, confidence, and aging", points: ["13-module posture assessment & correction program", "Identify YOUR specific pattern (UCS, LCS, Sway Back, etc.)", "Corrective exercises designed for YOUR body type (Dosha)", "Visible changes within 4-6 weeks of consistent practice"], cta: "Start Posture Analysis" },
    energy: { headline: "Your spine carries PRANA (life force) to every cell", points: ["Blocked spinal segments = blocked energy to organs", "Specific vertebral levels control specific organ functions", "AYUSH therapies (Basti, Marma, Yoga) restore Pranic flow", "Most people notice energy improvement within 2 weeks"], cta: "Discover Your Blocks" },
    prevention: { headline: "The best time to fix your spine was 10 years ago. The second best time is NOW", points: ["AI-powered Spine Health Score (baseline + tracking)", "Identify problems BEFORE they become pain", "Simple daily routines (5-10 min) that prevent degeneration", "Community of people committed to lifelong spine health"], cta: "Get Your Spine Score" },
    organ: { headline: "Your spine controls every organ through spinal nerves", points: ["C1-C3: Headache, Migraine, Vertigo, Eye problems", "T5-T12: Acidity, Diabetes nerve component, Liver, Kidney", "L1-L3: PCOD, Infertility, Menstrual issues, Constipation", "Fix the spine level → fix the connected organ dysfunction"], cta: "Find Your Connection" },
    performance: { headline: "Elite performance starts with a flexible, aligned spine", points: ["Full spinal mobility = faster, stronger, more resilient", "15 global therapy systems for recovery + enhancement", "Injury prevention through postural optimization", "Used by martial artists, dancers, and yoga practitioners worldwide"], cta: "Optimize Your Spine" },
  };

  const transformations = [
    { before: "Couldn't sit for 30 min", after: "Works 8 hours pain-free", name: "Priya, 32, IT Professional", time: "3 months" },
    { before: "Surgery recommended", after: "Walking 5 km daily", name: "Murugan, 58, Retired", time: "6 months" },
    { before: "Migraine 4x/week", after: "Headache-free for 6 months", name: "Anitha, 28, Teacher", time: "2 months" },
    { before: "PCOD + back pain combo", after: "Regular cycles + no pain", name: "Kavitha, 34, Homemaker", time: "4 months" },
    { before: "Knee pain (postural origin)", after: "Running again", name: "Rajan, 45, Business", time: "3 months" },
    { before: "Couldn't sleep (disc pain)", after: "Full night sleep", name: "Senthil, 50, Driver", time: "2 months" },
  ];

  const whatMakesUsDifferent = [
    { title: "Not 1 system — 15 systems", desc: "Ayurveda + Yoga + Acupuncture + Shiatsu + Cupping + Reflexology + 9 more. Whatever YOUR body responds to best." },
    { title: "Not just treatment — education", desc: "13 learning modules teach you to understand and manage your own spine. Knowledge = freedom from clinics." },
    { title: "Not just doctor — community", desc: "Join people on the same journey. Accountability, support, celebration. Healing is faster together." },
    { title: "Not just feeling — measuring", desc: "VAS pain scale, ROM measurement, Spine Health Score. You SEE your progress in numbers." },
    { title: "Not temporary — transformation", desc: "3-12 month programs. We don't patch — we rebuild. Degeneration → Regeneration." },
  ];

  const faqs = [
    { q: "What exactly is Spine AYUSH?", a: "Spine AYUSH is India's first integrative spine wellness platform. We combine Ayurveda, Panchakarma, Yoga, Acupuncture, and 15 global therapy systems under one roof. Our approach is scientific — we assess with AI tools, treat with multiple systems, educate you through 13 structured modules, and track progress with measurable outcome tools. It's not just a clinic — it's a complete transformation ecosystem with community support." },
    { q: "Is this only for people with back pain?", a: "Not at all. We serve people with pain, posture problems, low energy, those wanting prevention, people with organ issues connected to spine (acidity, PCOD, migraine, thyroid), and athletes wanting peak performance. Your spine is the axis of ALL health — 80% of chronic diseases have a spinal nerve connection." },
    { q: "How is this different from regular physiotherapy or chiropractor?", a: "Three key differences: (1) We use 15 healing systems, not just one — whatever YOUR body responds to best. (2) We TEACH you to manage your own spine through 13 learning modules — no lifelong dependency on clinics. (3) We have a community of people on the same journey — accountability, support, and celebration together. Plus, we measure everything scientifically." },
    { q: "I've tried many treatments and nothing worked. Will this help?", a: "68% of patients who come to us after 'failed conservative treatment' still improve. Why? Because most previous treatments used only ONE approach. We combine Ayurveda + Acupuncture + Trigger Point therapy + Yoga + 11 more systems. Also, we address the ROOT CAUSE (posture, muscle imbalance, nerve) — not just the pain symptom." },
    { q: "How long does it take to see results?", a: "Most patients feel 40-60% improvement within 1-2 weeks of starting treatment. Complete programs run 3-12 months depending on severity and goals. Mild issues: 2-3 months. Moderate (disc, chronic): 3-6 months. Complex/surgical cases: 6-12 months. We track progress with scientific tools so you SEE your improvement in numbers." },
    { q: "Can I join from another city? Is online available?", a: "Yes, partially. After initial in-person assessment and treatment phase (2-4 weeks), many components can be done remotely: module learning, self-treatment practice, community support, video check-ins with doctors. Clinic visits reduce over time as you master self-management." },
    { q: "What is the community about? Why does it matter?", a: "Healing alone is hard. Our community includes people at every stage — from fresh patients to fully recovered alumni. You get: daily accountability, weekly group calls, celebration of wins, peer support during tough days, and mentorship from those who've walked the path before you. Research shows community-supported healing is 3x more effective." },
    { q: "Is Panchakarma safe? Any side effects?", a: "Panchakarma has been practiced safely for 5000 years. All therapies use 100% natural herbs and oils. No chemicals, no steroids, no dependency. Mild detox symptoms (1-2 days) are normal and a sign of healing. Our doctors carefully customize protocols based on your constitution, age, and condition severity." },
    { q: "Who is Dr. Mohamad Saleem?", a: "Dr. Mohamad Saleem is the founder of Spine AYUSH with 15+ years of clinical experience in integrative spine medicine. He has treated 400+ spine patients across 6 branches in Tamil Nadu, combining Ayurveda with modern global therapy systems. He leads monthly live sessions for community members and personally oversees complex cases." },
    { q: "How do I get started?", a: "Simple: (1) Fill the form below or click 'Start Free'. (2) Our team calls you within 24 hours. (3) Book your initial spine assessment (in-person or video). (4) Get your personalized Spine Health Score + treatment roadmap. (5) Begin your transformation journey. No commitment required for the first consultation." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/spine-ayush-logo.png" alt="Spine AYUSH" className="h-10 w-10 rounded-full object-cover shadow-sm" />
            <div>
              <span className="font-bold text-lg leading-none text-teal-800">SPINE<span className="text-amber-600">AYUSH</span></span>
              <p className="text-[9px] text-teal-600 leading-none mt-0.5">— Rebuilds Lives —</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#why" className="hover:text-green-600 transition">Why Spine</a>
            <a href="#paths" className="hover:text-green-600 transition">Your Path</a>
            <a href="#how" className="hover:text-green-600 transition">How It Works</a>
            <a href="#proof" className="hover:text-green-600 transition">Results</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/hms/auth")} className="text-xs text-muted-foreground">Member Login</Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs rounded-full px-4">
              Start Free <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO — The Big Idea */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28 text-center space-y-8">
          <p className="text-sm font-medium text-green-700 tracking-wide uppercase">India's First Integrative Spine Wellness Platform</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            Your Spine is the<br /><span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Axis of Your Entire Health</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            It carries your brain's signals to every organ. It holds you upright against gravity. 
            It determines your energy, your posture, your aging, and your quality of life.
            <br /><strong className="text-foreground">When the spine works, everything works.</strong>
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-8 text-base shadow-lg shadow-green-200" onClick={() => document.getElementById("paths")?.scrollIntoView({ behavior: "smooth" })}>
              Find Your Path <ArrowDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-4">
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border shadow-sm"><Leaf className="h-3.5 w-3.5 text-green-600" /> 15 Healing Systems</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border shadow-sm"><Users className="h-3.5 w-3.5 text-blue-600" /> 401+ Transformed</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border shadow-sm"><Target className="h-3.5 w-3.5 text-amber-600" /> Measurable Outcomes</span>
            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border shadow-sm"><Brain className="h-3.5 w-3.5 text-purple-600" /> AI-Powered Assessment</span>
          </div>
        </div>
      </section>

      {/* WHY SPINE MATTERS — Beyond Pain */}
      <section id="why" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Spine Does More Than Hold You Up</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">Most people only think about their spine when it hurts. But your spine silently controls everything — even things you'd never connect to "back problems."</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Brain, label: "Brain Function", desc: "Clarity, focus, sleep", color: "text-purple-600 bg-purple-50" },
              { icon: Heart, label: "Organ Health", desc: "Digestion, hormones, immunity", color: "text-red-600 bg-red-50" },
              { icon: Zap, label: "Energy Level", desc: "Prana flow, vitality, mood", color: "text-amber-600 bg-amber-50" },
              { icon: TrendingUp, label: "Performance", desc: "Strength, flexibility, speed", color: "text-blue-600 bg-blue-50" },
              { icon: Eye, label: "Posture & Confidence", desc: "How you look & feel", color: "text-indigo-600 bg-indigo-50" },
              { icon: Shield, label: "Injury Prevention", desc: "Resilience & stability", color: "text-green-600 bg-green-50" },
              { icon: Clock, label: "Aging & Longevity", desc: "Stay mobile, stay young", color: "text-teal-600 bg-teal-50" },
              { icon: Sparkles, label: "Quality of Life", desc: "Freedom & independence", color: "text-rose-600 bg-rose-50" },
            ].map(item => (
              <Card key={item.label} className="border-0 shadow-sm hover:shadow-md transition">
                <CardContent className="p-5 text-center space-y-2">
                  <div className={`h-12 w-12 mx-auto rounded-xl ${item.color.split(" ")[1]} grid place-items-center`}>
                    <item.icon className={`h-6 w-6 ${item.color.split(" ")[0]}`} />
                  </div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PATH — The Funnel Entry */}
      <section id="paths" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Brings You Here?</h2>
          <p className="text-center text-muted-foreground mb-10">Choose what resonates most — we'll show you exactly how we can help.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entryPaths.map(path => (
              <Card
                key={path.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${path.color} ${selectedPath === path.id ? "ring-2 ring-green-500 shadow-lg scale-[1.02]" : ""}`}
                onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
              >
                <CardContent className="p-5 space-y-3">
                  <path.icon className={`h-7 w-7 ${path.textColor}`} />
                  <p className={`font-bold ${path.textColor}`}>{path.title}</p>
                  <p className="text-sm text-muted-foreground">{path.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Expanded path detail */}
          {selectedPath && pathDetails[selectedPath] && (
            <div className="mt-8 max-w-3xl mx-auto">
              <Card className="border-green-200 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-green-800">{pathDetails[selectedPath].headline}</h3>
                  <ul className="space-y-2">
                    {pathDetails[selectedPath].points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> {p}
                      </li>
                    ))}
                  </ul>
                  <Button className="bg-green-600 hover:bg-green-700 rounded-full" onClick={() => navigate("/hms/auth")}>
                    {pathDetails[selectedPath].cta} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS — The Journey */}
      <section id="how" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How Your Transformation Happens</h2>
          <p className="text-center text-muted-foreground mb-12">A structured journey — not random treatments. Every phase builds on the last.</p>
          <div className="relative">
            {/* Vertical line connector */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-200 hidden md:block" />
            <div className="space-y-6">
              {[
                { phase: "Discover", title: "Understand Your Spine", desc: "AI-powered assessment finds exactly what's wrong — which level, which muscles, which pattern. No guessing.", what: "Posture analysis · Dosha evaluation · Spine Health Score · Personalized report", icon: Target },
                { phase: "Relieve", title: "Feel Better Fast", desc: "Targeted therapies from 15 systems give relief. Most feel 40-60% better within 1-2 sessions.", what: "Kati/Greeva Basti · Acupuncture · Trigger Point therapy · Immediate care", icon: Zap },
                { phase: "Learn", title: "Understand Why It Happened", desc: "13 learning modules teach you about YOUR specific condition. Knowledge = power to heal.", what: "Posture modules · Muscle imbalance theory · Your syndrome pattern · Self-assessment", icon: Brain },
                { phase: "Rebuild", title: "Fix the Root Cause", desc: "Corrective exercises + ongoing therapies address the actual imbalance — not just the symptom.", what: "4-phase corrective model · 15 therapy systems · Self-treatment mastery · Progress tracking", icon: Activity },
                { phase: "Thrive", title: "Never Go Back", desc: "Community support, maintenance routines, and self-management keep you healthy for life.", what: "Community · Daily routines · Monthly check-ins · Lifelong wellness", icon: Star },
              ].map((step, i) => (
                <div key={step.phase} className="flex gap-4 md:gap-6 items-start">
                  <div className="relative z-10 h-12 w-12 rounded-full bg-green-600 text-white grid place-items-center font-bold shrink-0 shadow-md">
                    {i + 1}
                  </div>
                  <Card className="flex-1 hover:shadow-md transition">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-100 text-green-700 text-[10px]">{step.phase}</Badge>
                      </div>
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                      <p className="text-xs text-green-700 mt-2 bg-green-50 p-2 rounded">{step.what}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="py-20 bg-green-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Why This Works When Other Things Haven't</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatMakesUsDifferent.map((item, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-5 space-y-2">
                  <p className="font-bold text-green-800">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AYURVEDA & PANCHAKARMA — Benefits Only */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-700 mb-4"><Leaf className="h-3 w-3 mr-1" /> Ancient Science, Modern Application</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Ayurveda & Panchakarma</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">5000 years of clinical wisdom applied to modern spine problems. Panchakarma is the gold standard for reversing degeneration — naturally, without surgery.</p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { title: "Deep Tissue Nourishment", desc: "Therapies penetrate deep into disc and bone tissue — reaches areas no pill or injection can." },
              { title: "Root Cause Treatment", desc: "Addresses the underlying Dosha imbalance causing degeneration — not just masking symptoms." },
              { title: "Natural Regeneration", desc: "Stimulates your body's own healing mechanisms. Discs can rehydrate, nerves can recover." },
              { title: "Zero Side Effects", desc: "100% natural herbs and oils. No chemicals, no dependency, no long-term medication burden." },
              { title: "Whole Body Healing", desc: "Spine treatment simultaneously improves digestion, sleep, energy, and mental clarity." },
              { title: "Long-Lasting Results", desc: "Treats the root — so problems don't keep coming back like they do with painkillers." },
            ].map(item => (
              <Card key={item.title} className="border-amber-100 hover:shadow-md hover:border-amber-300 transition">
                <CardContent className="p-5 space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 grid place-items-center"><Leaf className="h-4 w-4 text-amber-700" /></div>
                  <h3 className="font-bold text-amber-900">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Why It Works */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-amber-200">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-amber-900">Why Panchakarma Works for Spine</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> Nourishes bone and nerve tissue from the inside out</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> Removes accumulated toxins that block healing</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> Restores natural movement and flexibility</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> Combined with 14 other global systems for comprehensive healing</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> 5000 years of clinical evidence + modern outcome tracking</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5 border shadow-sm space-y-3 text-center">
                <p className="text-3xl font-bold text-green-700">83%</p>
                <p className="text-sm text-muted-foreground">Success rate with our Panchakarma + Integrative approach</p>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">Most patients feel significant improvement within the first 2 weeks</p>
                <Button className="bg-amber-600 hover:bg-amber-700 rounded-full w-full" onClick={() => navigate("/hms/auth")}>
                  Experience the Difference <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOLLOW US — Social Proof / Content */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold">Follow Our Journey — Free Content Daily</h2>
          <p className="text-gray-400">Tips, exercises, patient stories, and live sessions — all free on our social channels</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.instagram.com/spineayush/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <span className="font-medium">Instagram</span>
            </a>
            <a href="https://www.youtube.com/@SpineAyush" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-red-600 px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg">
              <Play className="h-5 w-5" />
              <span className="font-medium">YouTube</span>
            </a>
            <a href="https://www.facebook.com/spine.ayush" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-blue-600 px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span className="font-medium">Facebook</span>
            </a>
          </div>
          <p className="text-xs text-gray-500">Join 5000+ followers getting free spine health content daily</p>
        </div>
      </section>

      {/* TRANSFORMATION STORIES */}
      <section id="proof" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Real Transformations</h2>
          <p className="text-center text-muted-foreground mb-10">Before → After · From our community of 401+ people</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformations.map((t, i) => (
              <Card key={i} className="hover:shadow-md transition overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2">
                    <div className="p-4 bg-red-50 border-r">
                      <p className="text-[10px] text-red-500 font-medium uppercase">Before</p>
                      <p className="text-sm font-medium text-red-700 mt-1">{t.before}</p>
                    </div>
                    <div className="p-4 bg-green-50">
                      <p className="text-[10px] text-green-500 font-medium uppercase">After</p>
                      <p className="text-sm font-medium text-green-700 mt-1">{t.after}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t">
                    <p className="text-xs text-muted-foreground">{t.name}</p>
                    <Badge variant="outline" className="text-[9px]"><Clock className="h-2.5 w-2.5 mr-0.5" /> {t.time}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Questions People Ask</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <Card key={i} className="cursor-pointer bg-white hover:shadow-sm transition" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{faq.q}</p>
                    <ChevronRight className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${expandedFaq === i ? "rotate-90" : ""}`} />
                  </div>
                  {expandedFaq === i && <p className="text-sm text-muted-foreground mt-4 pt-4 border-t leading-relaxed">{faq.a}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE FORM */}
      <section id="join" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="bg-green-100 text-green-700 mb-3"><Users className="h-3 w-3 mr-1" /> Join 401+ People Healing Together</Badge>
            <h2 className="text-3xl font-bold mb-2">Ready to Start Your Spine Journey?</h2>
            <p className="text-muted-foreground">Fill this form — our team will call you within 24 hours with a free consultation plan. No obligation, no pressure.</p>
          </div>

          {!formSubmitted ? (
            <Card className="border-green-200 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                    <Input placeholder="Your name" value={leadForm.name} onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Age *</label>
                    <Input placeholder="Your age" type="number" value={leadForm.age} onChange={(e) => setLeadForm({...leadForm, age: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Gender *</label>
                    <select className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm" value={leadForm.sex} onChange={(e) => setLeadForm({...leadForm, sex: e.target.value})}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">City / Place *</label>
                    <Input placeholder="Your city" value={leadForm.place} onChange={(e) => setLeadForm({...leadForm, place: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email ID *</label>
                    <Input placeholder="your@email.com" type="email" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">WhatsApp Number *</label>
                    <Input placeholder="+91 XXXXX XXXXX" value={leadForm.whatsapp} onChange={(e) => setLeadForm({...leadForm, whatsapp: e.target.value})} className="mt-1" />
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base" onClick={() => setFormSubmitted(true)}>
                  <Send className="h-4 w-4 mr-2" /> Get My Free Spine Consultation
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">Your information is 100% secure. We will never spam you. Our team calls within 24 hours.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-300 bg-green-50 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-2xl font-bold text-green-800">Thank You!</h3>
                <p className="text-green-700">Our team will call you within 24 hours to discuss your spine health and plan your free consultation.</p>
                <p className="text-sm text-muted-foreground">In the meantime, follow us for daily spine health tips:</p>
                <div className="flex justify-center gap-3">
                  <a href="https://www.instagram.com/spineayush/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm hover:scale-105 transition">Instagram</a>
                  <a href="https://www.youtube.com/@SpineAyush" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:scale-105 transition">YouTube</a>
                  <a href="https://www.facebook.com/spine.ayush" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:scale-105 transition">Facebook</a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Join a Community That Actually Heals Together</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">You don't have to do this alone. Our community of 401+ members supports each other daily — sharing wins, asking questions, staying accountable. From Day 1, you belong.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="bg-green-50 border-green-200"><CardContent className="p-4 text-center"><Users className="h-6 w-6 mx-auto text-green-600 mb-2" /><p className="font-bold text-sm">Weekly Group Calls</p><p className="text-xs text-muted-foreground">Live Q&A with doctors + community sharing</p></CardContent></Card>
            <Card className="bg-blue-50 border-blue-200"><CardContent className="p-4 text-center"><Heart className="h-6 w-6 mx-auto text-blue-600 mb-2" /><p className="font-bold text-sm">Daily Accountability</p><p className="text-xs text-muted-foreground">WhatsApp group + progress tracking + streaks</p></CardContent></Card>
            <Card className="bg-purple-50 border-purple-200"><CardContent className="p-4 text-center"><Star className="h-6 w-6 mx-auto text-purple-600 mb-2" /><p className="font-bold text-sm">Celebrate Every Win</p><p className="text-xs text-muted-foreground">From first pain-free day to full transformation</p></CardContent></Card>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-8" onClick={() => document.getElementById("join")?.scrollIntoView({ behavior: "smooth" })}>
            I Want to Join the Community <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-green-700 to-emerald-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Your Spine Carries Your Life.<br />It Deserves Attention.</h2>
          <p className="text-green-100 text-lg">Whether you're in pain, want better posture, more energy, or peak performance — it all starts with understanding your spine.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 rounded-full px-8 text-base shadow-lg" onClick={() => navigate("/hms/auth")}>
              Start Your Journey <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-green-300 text-green-100 hover:bg-green-600 rounded-full px-8 text-base">
              <Phone className="h-4 w-4 mr-2" /> Talk to Us
            </Button>
          </div>
          <p className="text-green-300 text-sm pt-4">Already a member? <button className="underline text-white font-medium" onClick={() => navigate("/hms/auth")}>Login to your dashboard</button></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/spine-ayush-logo.png" alt="Spine AYUSH" className="h-7 w-7 rounded-full object-cover" />
            <span className="font-semibold text-teal-800">SPINE<span className="text-amber-600">AYUSH</span></span>
            <span className="text-xs text-muted-foreground">by Dr. Mohamad Saleem · Al Shifa · Rebuilds Lives</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Tamil Nadu, India</span>
            <span>15 Therapy Systems · 13 Modules · 401+ Lives Changed</span>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <a href="https://www.instagram.com/spineayush/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-600 transition">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
          </a>
          <a href="https://www.youtube.com/@SpineAyush" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-red-600 transition">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </a>
          <a href="https://www.facebook.com/spine.ayush" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600 transition">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">© 2024-2026 Spine AYUSH by Ayuzee. All rights reserved. Degeneration → Regeneration.</p>
      </footer>
    </div>
  );
}