import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Profile = { full_name: string | null; phone: string | null; date_of_birth: string | null; gender: string | null };

const CIRCUMFERENCE = 263.9;

export const WellnessScore = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checks, setChecks] = useState({ appointment: false, order: false, prakriti: false, therapy: false });
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("full_name, phone, date_of_birth, gender").eq("user_id", userId).maybeSingle(),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("order_status", "delivered"),
      supabase.from("prakriti_assessments").select("id", { count: "exact", head: true }).eq("patient_user_id", userId),
      supabase.from("therapy_sessions").select("id", { count: "exact", head: true }).eq("patient_user_id", userId).eq("status", "completed"),
    ]).then(([prof, appts, orders, prakriti, therapy]) => {
      setProfile((prof.data as Profile) ?? null);
      setChecks({ appointment: (appts.count ?? 0) >= 1, order: (orders.count ?? 0) >= 1, prakriti: (prakriti.count ?? 0) >= 1, therapy: (therapy.count ?? 0) >= 1 });
    });
  }, [userId]);

  const profileComplete = !!(profile?.full_name && profile.phone && profile.date_of_birth && profile.gender);
  const score = useMemo(() => [profileComplete, checks.appointment, checks.order, checks.prakriti, checks.therapy].filter(Boolean).length * 20, [profileComplete, checks]);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(score / 30));
    const interval = window.setInterval(() => {
      current = Math.min(score, current + step);
      setAnimatedScore(current);
      if (current >= score) window.clearInterval(interval);
    }, 50);
    return () => window.clearInterval(interval);
  }, [score]);

  const scoreColor = score > 70 ? "hsl(var(--primary))" : score > 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const subtitle = score >= 80 ? "Excellent! 🌟" : score >= 60 ? "Good progress 💪" : score >= 40 ? "Getting started 🌱" : "Let's begin your journey 🙏";
  const items = [
    { label: "Profile complete", done: profileComplete, points: "+20pts", href: "/dashboard" },
    { label: "First appointment", done: checks.appointment, points: "+20pts", href: "/doctors" },
    { label: "First order delivered", done: checks.order, points: "+20pts", href: "/shop" },
    { label: "Prakriti quiz done", done: checks.prakriti, points: "+20pts", href: "/diagnosis/prakriti" },
    { label: "Therapy session completed", done: checks.therapy, points: "+20pts", href: "/therapist/browse" },
  ];
  const missing = [{ key: "phone", label: "📱 Add phone number", missing: !profile?.phone }, { key: "dob", label: "🎂 Add date of birth", missing: !profile?.date_of_birth }, { key: "gender", label: "👤 Set gender", missing: !profile?.gender }].filter((x) => x.missing);

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-[100px] w-[100px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle stroke="hsl(var(--muted))" strokeWidth="8" fill="none" r="42" cx="50" cy="50" />
            <circle stroke={scoreColor} strokeWidth="8" fill="none" r="42" cx="50" cy="50" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - animatedScore / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-bold">{animatedScore}</p><p className="text-xs text-muted-foreground">/100</p></div></div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Wellness Score</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-3 space-y-2">{items.map((item) => <button key={item.label} onClick={() => !item.done && navigate(item.href)} className="flex w-full items-center justify-between gap-3 text-left text-sm"><span className="flex items-center gap-2"><span className={`grid h-5 w-5 place-items-center rounded-full text-xs ${item.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{item.done ? "✓" : "○"}</span>{item.label}</span><span className="text-xs text-muted-foreground">{item.points}</span></button>)}</div>
        </div>
      </div>
      {score < 100 && missing.length > 0 && <div className="mt-5 border-t border-border pt-4"><p className="text-sm font-medium">Complete your profile to improve your score:</p><div className="mt-2 flex flex-wrap gap-2">{missing.map((item) => <button key={item.key} onClick={() => navigate("/dashboard")} className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">{item.label}</button>)}</div></div>}
    </article>
  );
};