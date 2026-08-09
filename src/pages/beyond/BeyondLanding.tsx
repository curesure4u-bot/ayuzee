import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  Heart,
  Rocket,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FEATURES = [
  { icon: Target, title: "Wheel of Life", desc: "Assess all 8 life areas with radar chart" },
  { icon: Timer, title: "Time Management", desc: "Pomodoro, planner, energy mapping" },
  { icon: BookOpen, title: "30+ Curated Books", desc: "5-min summaries + apply-it challenges" },
  { icon: Compass, title: "Leadership Lab", desc: "12 branching scenarios, 5 levels" },
  { icon: Heart, title: "Wellness Hub", desc: "Breathing, mood tracking, burnout quiz" },
  { icon: Coins, title: "Finance Toolkit", desc: "SIP calculator, EMI, tax guide" },
  { icon: Rocket, title: "Guided Pathways", desc: "Structured programs with daily actions" },
  { icon: Brain, title: "Micro-Learning", desc: "Swipeable 5-min lessons" },
  { icon: Trophy, title: "Gamification", desc: "XP, levels, badges, streaks, leaderboard" },
];

const TESTIMONIALS = [
  { text: "Finally someone built tools for the PERSON behind the stethoscope.", role: "PG Resident, Ayurveda" },
  { text: "The Wheel of Life was a wake-up call. I scored 2/10 on Family.", role: "Senior Consultant" },
  { text: "Pomodoro + micro-learning between patients changed my productivity.", role: "MBBS Student" },
];

const BeyondLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Account created! Check your email to confirm, then sign in.");
      setIsSignUp(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Welcome to Beyond.Praxis!");
      navigate("/beyond");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-violet-950 to-slate-950 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Beyond.Praxis</span>
        </div>
        <a href="https://www.instagram.com/beyond.praxis/" target="_blank" rel="noopener noreferrer" className="text-sm text-violet-300 hover:text-white transition-colors">
          @beyond.praxis
        </a>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="bg-violet-600/30 text-violet-200 border-violet-500/30 mb-4">Built for Medical Professionals</Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          Beyond the White Coat
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-violet-200 max-w-2xl mx-auto">
          The first Life Operating System for doctors. Master your time, wealth, wellness, leadership — not just your clinical skills.
        </p>
        <p className="mt-2 text-sm text-violet-400">
          By Jasir Sajidh · For medical students and busy doctors
        </p>
      </section>

      {/* Login Card */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="max-w-md mx-auto bg-white/5 backdrop-blur border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">{isSignUp ? "Create Account" : "Sign In"}</h2>
              <p className="text-sm text-violet-300 mt-1">Access all 24 tools free during beta</p>
            </div>
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-violet-400"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="bg-white/10 border-white/20 text-white placeholder:text-violet-400"
            />
            <Button onClick={handleAuth} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold">
              {loading ? "..." : isSignUp ? "Create Account" : "Sign In & Enter"}
            </Button>
            <p className="text-center text-xs text-violet-400">
              {isSignUp ? "Already have an account?" : "New here?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-violet-200 underline">
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">24 Tools. One Platform.</h2>
        <p className="text-center text-violet-300 mb-10">Everything a doctor needs beyond clinical work</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-600/30">
                <f.icon className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <p className="font-medium text-sm">{f.title}</p>
                <p className="text-xs text-violet-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who is this for */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Who is Beyond.Praxis for?</h2>
        <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
          {[
            { title: "Medical Students", desc: "Exam stress, career confusion, zero financial literacy" },
            { title: "Residents & Junior Doctors", desc: "80-hr weeks, burnout, no time for anything beyond medicine" },
            { title: "Senior Practitioners", desc: "Want to teach, write, invest — but no platform makes it easy" },
          ].map((p) => (
            <div key={p.title} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
              <p className="font-medium text-sm">{p.title}</p>
              <p className="text-xs text-violet-400 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">What Doctors Say</h2>
        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm italic text-violet-200">"{t.text}"</p>
              <p className="text-xs text-violet-400 mt-2">— {t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiator */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Why Beyond.Praxis?</h2>
        <p className="text-violet-300 max-w-2xl mx-auto text-sm">
          Marrow teaches exams. Practo serves patients. LinkedIn is generic. <strong className="text-white">Nobody builds tools for the doctor as a person.</strong> We focus on the human behind the stethoscope — their time, wealth, wellness, leadership, and legacy.
        </p>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-8 max-w-lg mx-auto">
          <Zap className="mx-auto h-8 w-8 text-violet-400 mb-3" />
          <h3 className="text-xl font-bold">Start Free Today</h3>
          <p className="text-sm text-violet-300 mt-1">All 24 tools free during beta. No credit card needed.</p>
          <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mt-4 bg-gradient-to-r from-violet-500 to-indigo-600">
            Sign Up Now <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10 text-center">
        <p className="text-xs text-violet-500">
          Beyond.Praxis by Jasir Sajidh · Part of{" "}
          <a href="https://ayuzee.com" className="text-violet-300 hover:underline">Ayuzee</a>
          {" "}· <a href="https://www.instagram.com/beyond.praxis/" target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:underline">Instagram</a>
        </p>
      </footer>
    </div>
  );
};

export default BeyondLanding;
