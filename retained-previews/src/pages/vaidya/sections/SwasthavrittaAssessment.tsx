import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Save, Sparkles, User2, Activity, Sunrise, Utensils, Briefcase, Wind, Brain, Pill } from "lucide-react";
import { toast } from "sonner";

const PRAKRITI = ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridosha"];
const AGNI = ["Sama", "Vishama", "Tikshna", "Manda"];
const KOSHTHA = ["Mrudu", "Madhyama", "Krura"];
const SARA_SAMHANAN = ["Pravara (Excellent)", "Madhyama (Moderate)", "Avara (Poor)"];
const SLEEP_QUALITY = ["Sound", "Interrupted", "Insufficient", "Excessive"];
const FOOD_TYPE = ["Vegetarian", "Non-Vegetarian", "Mixed", "Vegan"];
const FOOD_FAULTS = ["Abhishyandi", "Paryushit", "Adhyashan", "Vishamashan", "Samashan", "Anashan", "Viruddhashan"];
const ADDICTIONS = ["Tobacco (smoking)", "Tobacco (chewing)", "Alcohol", "Caffeine", "Other"];
const VEGAS = ["Urination (Mutra)", "Defecation (Pureesha)", "Hunger (Kshudha)", "Thirst (Trushna)", "Sleep (Nidra)", "Sneezing (Kshavathu)", "Yawning (Jrumbha)", "Tears (Ashru)", "Belching (Udgara)"];
const OCCUPATIONS = ["Sedentary (desk)", "Standing", "Field / Manual", "Mixed", "Retired", "Student", "Homemaker"];

type State = {
  patient_id: string;
  height_cm: string; weight_kg: string;
  prakriti: string;
  agni: string; koshtha: string; sara: string; samhanan: string;
  sleep_time: string; wake_time: string; sleep_quality: string; day_sleep: boolean;
  exercise_type: string; exercise_minutes: string;
  yoga_practice: boolean; pranayama_practice: boolean;
  food_type: string;
  meal_breakfast: string; meal_lunch: string; meal_evening: string; meal_dinner: string;
  food_faults: Record<string, boolean>;
  water_intake_litres: string; fasting_practice: boolean;
  occupation_type: string; screen_time_hours: string;
  addictions: Record<string, boolean>;
  vega_suppression: Record<string, boolean>;
  mental_stress: boolean; mental_stress_source: string;
  current_medications: string;
};

const initialState: State = {
  patient_id: "",
  height_cm: "", weight_kg: "",
  prakriti: "",
  agni: "", koshtha: "", sara: "", samhanan: "",
  sleep_time: "", wake_time: "", sleep_quality: "", day_sleep: false,
  exercise_type: "", exercise_minutes: "",
  yoga_practice: false, pranayama_practice: false,
  food_type: "",
  meal_breakfast: "", meal_lunch: "", meal_evening: "", meal_dinner: "",
  food_faults: {},
  water_intake_litres: "", fasting_practice: false,
  occupation_type: "", screen_time_hours: "",
  addictions: {},
  vega_suppression: {},
  mental_stress: false, mental_stress_source: "",
  current_medications: "",
};

const SECTIONS = [
  { id: "basics", label: "Patient Basics", icon: User2 },
  { id: "ashtavidha", label: "Ashtavidha Pariksha", icon: Activity },
  { id: "dinacharya", label: "Dinacharya", icon: Sunrise },
  { id: "ahara", label: "Ahara (Diet)", icon: Utensils },
  { id: "vihara", label: "Vihara (Lifestyle)", icon: Briefcase },
  { id: "vega", label: "Vega (Natural Urges)", icon: Wind },
  { id: "mental", label: "Mental Health", icon: Brain },
  { id: "meds", label: "Current Medications", icon: Pill },
];

const SwasthavrittaAssessment = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [s, setS] = useState<State>({ ...initialState, patient_id: params.get("patient_id") || "" });
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [open, setOpen] = useState<string[]>(["basics"]);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS(prev => ({ ...prev, [k]: v }));

  const bmi = useMemo(() => {
    const h = parseFloat(s.height_cm), w = parseFloat(s.weight_kg);
    if (!h || !w) return null;
    return +(w / Math.pow(h / 100, 2)).toFixed(1);
  }, [s.height_cm, s.weight_kg]);

  const completion = useMemo(() => {
    const done = [
      s.height_cm && s.weight_kg && s.prakriti,
      s.agni && s.koshtha && s.sara && s.samhanan,
      s.sleep_time && s.wake_time && s.sleep_quality,
      s.food_type && (s.meal_breakfast || s.meal_lunch) && s.water_intake_litres,
      s.occupation_type,
      Object.keys(s.vega_suppression).length > 0 || true,
      true, // mental optional
      true, // meds optional
    ].filter(Boolean).length;
    return Math.round((done / SECTIONS.length) * 100);
  }, [s]);

  const save = async (status: "draft" | "submitted") => {
    if (!s.patient_id) { toast.error("Patient ID is required"); return; }
    if (!s.height_cm || !s.weight_kg || !s.prakriti) {
      toast.error("Please complete Patient Basics (height, weight, prakriti)");
      setOpen(["basics"]); return;
    }
    setSaving(status === "draft" ? "draft" : "submit");
    const { data: auth } = await supabase.auth.getUser();
    const vaidya_id = auth?.user?.id ?? null;

    const payload: any = {
      patient_id: s.patient_id,
      vaidya_id,
      status,
      height_cm: parseFloat(s.height_cm) || null,
      weight_kg: parseFloat(s.weight_kg) || null,
      bmi,
      prakriti: s.prakriti || null,
      agni: s.agni || null,
      koshtha: s.koshtha || null,
      sara: s.sara || null,
      samhanan: s.samhanan || null,
      sleep_time: s.sleep_time || null,
      wake_time: s.wake_time || null,
      sleep_quality: s.sleep_quality || null,
      day_sleep: s.day_sleep,
      exercise_type: s.exercise_type || null,
      exercise_minutes: s.exercise_minutes ? parseInt(s.exercise_minutes) : null,
      yoga_practice: s.yoga_practice,
      pranayama_practice: s.pranayama_practice,
      food_type: s.food_type || null,
      meal_timings: {
        breakfast: s.meal_breakfast || null,
        lunch: s.meal_lunch || null,
        evening: s.meal_evening || null,
        dinner: s.meal_dinner || null,
      },
      food_faults: s.food_faults,
      water_intake_litres: s.water_intake_litres ? parseFloat(s.water_intake_litres) : null,
      fasting_practice: s.fasting_practice,
      screen_time_hours: s.screen_time_hours ? parseFloat(s.screen_time_hours) : null,
      addictions: Object.entries(s.addictions).filter(([, v]) => v).map(([k]) => k).join(", ") || null,
      occupation_type: s.occupation_type || null,
      vega_suppression: s.vega_suppression,
      mental_stress: s.mental_stress,
      mental_stress_source: s.mental_stress ? (s.mental_stress_source || null) : null,
      current_medications: s.current_medications || null,
    };

    const { error } = await supabase.from("swasthavritta_assessments").insert(payload);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "draft" ? "Draft saved" : "Submitted for AI draft");
    navigate("/vaidya");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Swasthavritta Assessment</h1>
          <p className="text-sm text-muted-foreground">Comprehensive Ayurvedic lifestyle & diet evaluation.</p>
        </div>
        <div className="min-w-[180px]">
          <p className="mb-1 text-xs text-muted-foreground">Progress · {completion}%</p>
          <Progress value={completion} className="h-2" />
        </div>
      </div>

      <Card className="p-4">
        <Label htmlFor="pid" className="text-xs">Patient ID (UUID)</Label>
        <Input id="pid" value={s.patient_id} onChange={e => set("patient_id", e.target.value)}
          placeholder="e.g. paste patient auth user id" className="mt-1 font-mono text-sm" />
      </Card>

      <Accordion type="multiple" value={open} onValueChange={setOpen} className="space-y-2">
        {/* 1. BASICS */}
        <AccordionItem value="basics" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><User2 className="h-4 w-4" /> 1. Patient Basics</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Height (cm)</Label>
                <Input type="number" value={s.height_cm} onChange={e => set("height_cm", e.target.value)} />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input type="number" value={s.weight_kg} onChange={e => set("weight_kg", e.target.value)} />
              </div>
              <div>
                <Label>BMI (auto)</Label>
                <Input value={bmi ?? ""} readOnly className="bg-muted" />
              </div>
            </div>
            <div>
              <Label>Prakriti</Label>
              <RadioGroup value={s.prakriti} onValueChange={v => set("prakriti", v)}
                className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                {PRAKRITI.map(p => (
                  <label key={p} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm ${s.prakriti === p ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value={p} /> {p}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. ASHTAVIDHA */}
        <AccordionItem value="ashtavidha" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Activity className="h-4 w-4" /> 2. Ashtavidha Pariksha</span>
          </AccordionTrigger>
          <AccordionContent className="grid gap-3 pt-2 md:grid-cols-2">
            {[
              { k: "agni", label: "Agni", options: AGNI },
              { k: "koshtha", label: "Koshtha", options: KOSHTHA },
              { k: "sara", label: "Sara", options: SARA_SAMHANAN },
              { k: "samhanan", label: "Samhanan", options: SARA_SAMHANAN },
            ].map(({ k, label, options }) => (
              <div key={k}>
                <Label>{label}</Label>
                <Select value={(s as any)[k]} onValueChange={v => set(k as any, v)}>
                  <SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger>
                  <SelectContent>
                    {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 3. DINACHARYA */}
        <AccordionItem value="dinacharya" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Sunrise className="h-4 w-4" /> 3. Dinacharya</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="grid gap-3 md:grid-cols-3">
              <div><Label>Sleep time</Label><Input type="time" value={s.sleep_time} onChange={e => set("sleep_time", e.target.value)} /></div>
              <div><Label>Wake time</Label><Input type="time" value={s.wake_time} onChange={e => set("wake_time", e.target.value)} /></div>
              <div>
                <Label>Sleep quality</Label>
                <Select value={s.sleep_quality} onValueChange={v => set("sleep_quality", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SLEEP_QUALITY.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={s.day_sleep} onCheckedChange={v => set("day_sleep", v)} /><Label>Day sleep (Divaswapna)</Label></div>
              <div className="flex items-center gap-2"><Switch checked={s.yoga_practice} onCheckedChange={v => set("yoga_practice", v)} /><Label>Yoga</Label></div>
              <div className="flex items-center gap-2"><Switch checked={s.pranayama_practice} onCheckedChange={v => set("pranayama_practice", v)} /><Label>Pranayama</Label></div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Exercise type</Label><Input value={s.exercise_type} onChange={e => set("exercise_type", e.target.value)} placeholder="Walking, gym, etc." /></div>
              <div><Label>Exercise (minutes/day)</Label><Input type="number" value={s.exercise_minutes} onChange={e => set("exercise_minutes", e.target.value)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. AHARA */}
        <AccordionItem value="ahara" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Utensils className="h-4 w-4" /> 4. Ahara (Diet)</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div>
              <Label>Food type</Label>
              <Select value={s.food_type} onValueChange={v => set("food_type", v)}>
                <SelectTrigger className="md:w-72"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{FOOD_TYPE.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div><Label>Breakfast</Label><Input type="time" value={s.meal_breakfast} onChange={e => set("meal_breakfast", e.target.value)} /></div>
              <div><Label>Lunch</Label><Input type="time" value={s.meal_lunch} onChange={e => set("meal_lunch", e.target.value)} /></div>
              <div><Label>Evening</Label><Input type="time" value={s.meal_evening} onChange={e => set("meal_evening", e.target.value)} /></div>
              <div><Label>Dinner</Label><Input type="time" value={s.meal_dinner} onChange={e => set("meal_dinner", e.target.value)} /></div>
            </div>
            <div>
              <Label className="mb-2 block">Ahara Doshas (food faults)</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {FOOD_FAULTS.map(f => (
                  <label key={f} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox checked={!!s.food_faults[f]} onCheckedChange={v => set("food_faults", { ...s.food_faults, [f]: !!v })} />
                    {f}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Water intake (litres/day)</Label><Input type="number" step="0.1" value={s.water_intake_litres} onChange={e => set("water_intake_litres", e.target.value)} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={s.fasting_practice} onCheckedChange={v => set("fasting_practice", v)} /><Label>Regular fasting (Upavasa)</Label></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. VIHARA */}
        <AccordionItem value="vihara" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> 5. Vihara (Lifestyle)</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Occupation type</Label>
                <Select value={s.occupation_type} onValueChange={v => set("occupation_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{OCCUPATIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Screen time (hours/day)</Label><Input type="number" step="0.5" value={s.screen_time_hours} onChange={e => set("screen_time_hours", e.target.value)} /></div>
            </div>
            <div>
              <Label className="mb-2 block">Addictions</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ADDICTIONS.map(a => (
                  <label key={a} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox checked={!!s.addictions[a]} onCheckedChange={v => set("addictions", { ...s.addictions, [a]: !!v })} />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. VEGA */}
        <AccordionItem value="vega" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Wind className="h-4 w-4" /> 6. Vega Dharana (Suppression of urges)</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="mb-2 text-xs text-muted-foreground">Check any urges the patient regularly suppresses.</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {VEGAS.map(v => (
                <label key={v} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <Checkbox checked={!!s.vega_suppression[v]} onCheckedChange={val => set("vega_suppression", { ...s.vega_suppression, [v]: !!val })} />
                  {v}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 7. MENTAL */}
        <AccordionItem value="mental" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> 7. Mental Health</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={s.mental_stress} onCheckedChange={v => set("mental_stress", v)} />
              <Label>Patient reports significant stress</Label>
            </div>
            {s.mental_stress && (
              <div>
                <Label>Reported source (as stated by patient)</Label>
                <Textarea value={s.mental_stress_source} onChange={e => set("mental_stress_source", e.target.value)}
                  placeholder="Work, family, finances… (capture only what patient reports; do not diagnose)" rows={3} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 8. MEDICATIONS */}
        <AccordionItem value="meds" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2"><Pill className="h-4 w-4" /> 8. Current Medications</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <Textarea value={s.current_medications} onChange={e => set("current_medications", e.target.value)}
              placeholder="List all ongoing medicines (allopathic, Ayurvedic, OTC), doses & duration." rows={4} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <Button variant="outline" onClick={() => save("draft")} disabled={!!saving}>
          <Save className="mr-2 h-4 w-4" /> {saving === "draft" ? "Saving…" : "Save draft"}
        </Button>
        <Button onClick={() => save("submitted")} disabled={!!saving}>
          <Sparkles className="mr-2 h-4 w-4" /> {saving === "submit" ? "Submitting…" : "Submit for AI Draft"}
        </Button>
      </div>
    </div>
  );
};

export default SwasthavrittaAssessment;
