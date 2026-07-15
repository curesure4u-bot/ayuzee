import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, AlertTriangle, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const COMMON_SYMPTOMS = [
  "Headache", "Fatigue", "Fever", "Cough", "Cold", "Body ache",
  "Joint pain", "Back pain", "Indigestion", "Acidity", "Bloating",
  "Constipation", "Skin rash", "Acne", "Hair fall", "Insomnia",
  "Anxiety", "Stress", "Weight gain", "Weight loss",
];

const AYUSH_SYSTEMS = [
  { value: "any", label: "Any (let AI suggest)" },
  { value: "ayurveda", label: "Ayurveda" },
  { value: "homeopathy", label: "Homeopathy" },
  { value: "unani", label: "Unani" },
  { value: "siddha", label: "Siddha" },
  { value: "yoga", label: "Yoga & Naturopathy" },
];

const SPECIALIST_TO_ROUTE: Record<string, string> = {
  ayurveda: "/doctors?system=ayurveda",
  homeopathy: "/doctors?system=homeopathy",
  unani: "/doctors?system=unani",
  siddha: "/doctors?system=siddha",
  yoga: "/doctors?system=yoga",
};

const SymptomChecker = () => {
  usePageSEO({
    title: "AI Symptom Checker — Ayuzee",
    description: "Describe your symptoms and get AYUSH-aligned guidance on possible patterns and the right specialist to consult.",
  });
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [symptomsText, setSymptomsText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [system, setSystem] = useState<string>("any");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [recommendedSystem, setRecommendedSystem] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      setUserId(data.session.user.id);
      const { data: prof } = await supabase
        .from("profiles")
        .select("date_of_birth, gender")
        .eq("user_id", data.session.user.id)
        .maybeSingle();
      if (prof?.gender) setGender(prof.gender);
      if (prof?.date_of_birth) {
        const yrs = Math.floor((Date.now() - new Date(prof.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000));
        if (yrs > 0 && yrs < 120) setAge(String(yrs));
      }
    });
  }, []);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please sign in to use the symptom checker");
      navigate("/auth");
      return;
    }
    const combined = [symptomsText.trim(), selectedTags.length ? `Tags: ${selectedTags.join(", ")}` : ""]
      .filter(Boolean)
      .join("\n");
    if (!combined) {
      toast.error("Please describe your symptoms or select at least one tag");
      return;
    }

    setLoading(true);
    setAiResponse("");
    setRecommendedSystem("");

    const systemPrompt = `You are an AYUSH-aware wellness assistant for Ayuzee. You DO NOT diagnose. You provide gentle, informational guidance based on Ayurveda, Homeopathy, Unani, Siddha, and Yoga traditions along with common-sense wellness knowledge.

Always structure your reply in markdown with these sections:

### Possible patterns
List 2-3 plausible conditions or dosha/mizaj patterns the symptoms could point to. Keep each to 1-2 sentences. Avoid definitive statements.

### Suggested next step
Recommend which type of AYUSH specialist to consult (Ayurveda Vaidya, Homeopath, Unani Hakim, Siddha practitioner, or Yoga therapist) and briefly explain why in 2-3 sentences.

### Self-care tips
2-4 short, safe lifestyle/diet pointers.

### Red flags
Bullet any symptoms that warrant urgent in-person medical attention.

At the very end, on a new line, output ONLY this machine-readable tag with the recommended system (one of ayurveda, homeopathy, unani, siddha, yoga):
SPECIALIST::<system>

Never claim to diagnose. Never prescribe medicines by name.`;

    const userPrompt = `A patient is describing symptoms and wants guidance.

Symptoms: ${combined}
Preferred AYUSH system: ${system === "any" ? "no preference" : system}
Age: ${age || "not provided"}
Gender: ${gender || "not provided"}

Please respond in the required structure.`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "symptom_checker",
          prompt: userPrompt,
          system: systemPrompt,
          context: { age, gender, ayush_system: system, tags: selectedTags },
          max_tokens: 900,
        },
      });
      if (error) throw error;
      const text: string = data?.response ?? "";
      const match = text.match(/SPECIALIST::\s*(ayurveda|homeopathy|unani|siddha|yoga)/i);
      const rec = (match?.[1] ?? (system !== "any" ? system : "ayurveda")).toLowerCase();
      const cleaned = text.replace(/SPECIALIST::\s*\w+/i, "").trim();
      setAiResponse(cleaned);
      setRecommendedSystem(rec);

      await supabase.from("symptom_checks").insert({
        patient_id: userId,
        symptoms_text: symptomsText,
        symptom_tags: selectedTags,
        ayush_system: system,
        age: age ? Number(age) : null,
        gender: gender || null,
        ai_response: cleaned,
        recommended_specialist: rec,
        model: data?.usage?.model ?? null,
        tokens_used: data?.usage?.total_tokens ?? null,
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bookHref = SPECIALIST_TO_ROUTE[recommendedSystem] ?? "/doctors";
  const specialistLabel =
    recommendedSystem === "homeopathy" ? "Homeopath"
    : recommendedSystem === "unani" ? "Unani Hakim"
    : recommendedSystem === "siddha" ? "Siddha practitioner"
    : recommendedSystem === "yoga" ? "Yoga therapist"
    : "Ayurveda Vaidya";

  return (
    <main className="container max-w-3xl py-10">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Wellness guidance</span>
        <h1 className="mt-2 font-display text-4xl">AI Symptom Checker</h1>
        <p className="mt-2 text-muted-foreground">
          Describe how you feel. We'll suggest possible AYUSH patterns and the right specialist to consult — not a diagnosis.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <Label htmlFor="symptoms">Describe your symptoms</Label>
          <Textarea
            id="symptoms"
            value={symptomsText}
            onChange={(e) => setSymptomsText(e.target.value)}
            placeholder="E.g. Bloating after meals for the past 2 weeks, worse in the evening, with mild acidity…"
            className="mt-2 min-h-[120px]"
            maxLength={2000}
          />
        </div>

        <div>
          <Label>Quick-select common symptoms</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <Badge
                key={s}
                variant={selectedTags.includes(s) ? "default" : "outline"}
                onClick={() => toggleTag(s)}
                className="cursor-pointer select-none"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="system">Preferred system</Label>
            <Select value={system} onValueChange={setSystem}>
              <SelectTrigger id="system" className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AYUSH_SYSTEMS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender" className="mt-2"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This tool provides informational guidance only — <strong>not a medical diagnosis</strong>. Please consult a licensed practitioner for any health concerns.</p>
        </div>

        <Button onClick={handleSubmit} disabled={loading} variant="hero" size="lg" className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analysing…</> : <><Sparkles className="mr-2 h-4 w-4" />Get guidance</>}
        </Button>
      </section>

      {aiResponse && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl">AI guidance</h2>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p><strong>This is not a medical diagnosis.</strong> Please consult a licensed practitioner.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to={bookHref}>Book a {specialistLabel} →</Link>
            </Button>
            <Button variant="outline" onClick={() => { setAiResponse(""); setRecommendedSystem(""); }}>
              Start over
            </Button>
          </div>
        </section>
      )}
    </main>
  );
};

export default SymptomChecker;
