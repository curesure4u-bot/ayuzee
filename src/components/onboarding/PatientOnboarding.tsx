import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { recordConsent } from "@/lib/consent";

type Goal = "find_doctor" | "panchakarma" | "medicines" | "prakriti" | "condition" | "student";

const goalOptions: { icon: string; label: string; value: Goal }[] = [
  { icon: "🏥", label: "Find an Ayurveda Doctor", value: "find_doctor" },
  { icon: "🫙", label: "Book Panchakarma Therapy", value: "panchakarma" },
  { icon: "💊", label: "Buy Ayurvedic Medicines", value: "medicines" },
  { icon: "🧬", label: "Know My Prakriti (Dosha)", value: "prakriti" },
  { icon: "💪", label: "Manage a Health Condition", value: "condition" },
  { icon: "📚", label: "I'm an Ayurveda Student", value: "student" },
];

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"];

const healthAreas = ["Arthritis & Joint", "Spine & Back", "Diabetes", "PCOD", "Digestive Health", "Skin & Hair", "Mental Wellness", "Weight Management", "Immunity", "Heart & BP", "Sleep", "General Wellness"];

const goalActions: Record<Goal, { label: string; href: string }[]> = {
  find_doctor: [{ label: "🩺 Browse 10,000+ AYUSH Doctors", href: "/doctors" }, { label: "🧬 Take Your 5-min Prakriti Quiz", href: "/diagnosis/prakriti" }],
  panchakarma: [{ label: "🫙 Find Therapists near", href: "/therapist/browse" }, { label: "🏥 Browse Panchakarma therapies", href: "/therapies" }],
  medicines: [{ label: "💊 Shop Ayurvedic Medicines", href: "/shop" }, { label: "🏥 Find Specialist Doctors", href: "/doctors" }],
  prakriti: [{ label: "🧬 Take Your 5-min Prakriti Quiz", href: "/diagnosis/prakriti" }, { label: "🩺 Browse 10,000+ AYUSH Doctors", href: "/doctors" }],
  condition: [{ label: "🏥 Find Specialist Doctors", href: "/doctors" }, { label: "💊 Shop condition-specific medicines", href: "/shop" }],
  student: [{ label: "🎓 Go to Student Hub", href: "/student" }, { label: "📚 Browse Courses & CME", href: "/learning/courses" }],
};

export const PatientOnboarding = ({ userId, onComplete }: { userId: string; onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ date_of_birth: "", gender: "", city: localStorage.getItem("ayuzee_city") || "", state: "" });
  const [interests, setInterests] = useState<string[]>([]);
  const [healthConsent, setHealthConsent] = useState(false);

  const saveProfile = async () => {
    if (!profile.date_of_birth || !profile.gender || !profile.city || !profile.state) return toast.error("Please complete all fields");
    if (!healthConsent) return toast.error("Please consent to health data processing to continue");
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("user_id", userId);
    if (!error) await recordConsent({ purpose: "health_processing", granted: true, userId });
    setSaving(false);
    if (error) return toast.error(error.message);
    localStorage.setItem("ayuzee_city", profile.city);
    setStep(3);
  };

  const complete = () => {
    if (!goal) return;
    localStorage.setItem("ayuzee_onboarding_complete", "true");
    localStorage.setItem("ayuzee_goal", goal);
    localStorage.setItem("ayuzee_health_interests", JSON.stringify(interests));
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-elegant">
        <div className="text-center">
          <div className="mx-auto flex w-fit items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-full gradient-leaf"><Leaf className="h-5 w-5 text-primary-foreground" /></span><span className="font-display text-2xl font-semibold">Ayuzee</span></div>
          <div className="mt-6 flex justify-center gap-2">{[1, 2, 3, 4].map((dot) => <span key={dot} className={`h-2.5 w-2.5 rounded-full ${dot <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
        </div>

        {step === 1 && <div className="mt-8"><p className="text-center text-xs font-semibold text-primary">STEP 1 of 4</p><h2 className="mt-2 text-center font-display text-2xl">Welcome! What brings you here today? 🌿</h2><p className="mt-2 text-center text-sm text-muted-foreground">We'll personalise your Ayuzee experience based on your answer.</p><div className="mt-6 grid grid-cols-2 gap-3">{goalOptions.map((option) => <button key={option.value} type="button" onClick={() => setGoal(option.value)} className={`rounded-2xl border-2 p-4 text-center transition-smooth ${goal === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}><span className="text-3xl">{option.icon}</span><span className="mt-2 block text-sm font-semibold">{option.label}</span></button>)}</div><Button variant="hero" className="mt-6 w-full" disabled={!goal} onClick={() => setStep(2)}>Next →</Button></div>}

        {step === 2 && <div className="mt-8"><p className="text-center text-xs font-semibold text-primary">STEP 2 of 4</p><h2 className="mt-2 text-center font-display text-2xl">A little about you 🙏</h2><p className="mt-2 text-center text-sm text-muted-foreground">We use this to personalise doctor and product recommendations.</p><div className="mt-6 space-y-4"><div><Label>Date of birth</Label><Input type="date" value={profile.date_of_birth} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} /></div><div><Label>Gender</Label><div className="mt-2 flex gap-2">{["Male", "Female", "Other"].map((gender) => <button key={gender} type="button" onClick={() => setProfile({ ...profile, gender: gender.toLowerCase() })} className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold ${profile.gender === gender.toLowerCase() ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{gender}</button>)}</div></div><div><Label>City</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="Your city" /></div><div><Label>State</Label><select value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select state</option>{indianStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></div><label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm text-muted-foreground"><Checkbox checked={healthConsent} onCheckedChange={(v) => setHealthConsent(v === true)} className="mt-0.5" /><span>I consent to Ayuzee processing my health-related profile data as described in the <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>.</span></label></div><Button variant="hero" className="mt-6 w-full" disabled={saving || !healthConsent} onClick={saveProfile}>{saving ? "Saving…" : "Next →"}</Button></div>}

        {step === 3 && <div className="mt-8"><p className="text-center text-xs font-semibold text-primary">STEP 3 of 4</p><h2 className="mt-2 text-center font-display text-2xl">Which health areas matter most to you?</h2><p className="mt-2 text-center text-sm text-muted-foreground">Select all that apply — we'll show relevant doctors and products.</p><div className="mt-6 flex flex-wrap gap-2">{healthAreas.map((area) => <button key={area} type="button" onClick={() => setInterests((current) => current.includes(area) ? current.filter((x) => x !== area) : [...current, area])} className={`rounded-full border px-3 py-2 text-sm font-medium ${interests.includes(area) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{area}</button>)}</div><Button variant="hero" className="mt-6 w-full" onClick={() => { localStorage.setItem("ayuzee_health_interests", JSON.stringify(interests)); setStep(4); }}>Next →</Button></div>}

        {step === 4 && goal && <div className="mt-8"><p className="text-center text-xs font-semibold text-primary">STEP 4 of 4</p><h2 className="mt-2 text-center font-display text-2xl">Your personalised Ayuzee plan is ready! 🎉</h2><div className="mt-6 rounded-2xl gradient-leaf p-5 text-primary-foreground"><p className="font-semibold">Based on your answers, here's what we recommend:</p><div className="mt-4 grid gap-2">{goalActions[goal].slice(0, 2).map((action) => <Link key={action.href} to={action.href} className="rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/25">{action.label}{goal === "panchakarma" && action.href === "/therapist/browse" ? ` ${profile.city || "you"}` : ""} →</Link>)}</div></div><Button variant="hero" size="lg" className="mt-6 w-full" onClick={complete}>Go to my Dashboard →</Button></div>}
      </div>
    </div>
  );
};