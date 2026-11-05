import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CaseTakingForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    chief_complaint: "",
    complaint_duration: "",
    aggravations: [] as string[],
    ameliorations: [] as string[],
    mental_state: "",
    fears: [] as string[],
    thermal: "",
    thirst: "",
    appetite: "",
    past_history: "",
    family_history: "",
    miasm: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/doctor/auth");
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const up = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleArr = (k: string, val: string) => {
    const arr = (form as any)[k] as string[];
    up(k, arr.includes(val) ? arr.filter((x: string) => x !== val) : [...arr, val]);
  };

  const chipCls = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
      active ? "bg-purple-700 text-white border-purple-700" : "border-border hover:border-purple-400"
    }`;

  const save = async () => {
    if (!form.chief_complaint.trim()) {
      toast.error("Chief complaint is required");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("homeopathy_cases")
      .insert({ doctor_user_id: userId, ...form, status: "active" })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast.error("Could not save case. Please ensure the homeopathy database is set up.");
      return;
    }
    toast.success("Case saved successfully!");
    navigate(`/homeopathy/cases`);
  };

  const aggList = ["Morning", "Evening", "Night", "Cold", "Heat", "Damp", "Motion", "Rest", "Pressure", "Touch", "Eating", "Empty stomach", "Consolation", "Company", "Solitude"];
  const amelList = ["Open air", "Warm room", "Cold", "Heat", "Motion", "Rest", "Pressure", "Lying down", "Eating", "Company", "Bending double", "Cold drinks", "Hot drinks"];
  const fearList = ["Darkness", "Death", "Disease", "Poverty", "Insanity", "Heights", "Narrow spaces", "Water", "Animals", "Being alone", "Crowd", "Failure", "Future"];
  const miasmList = ["Psora", "Sycosis", "Syphilis", "Tubercular", "Mixed"];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel={true} />

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <nav className="text-xs text-muted-foreground mb-3">
          <Link to="/homeopathy/cases" className="hover:text-purple-700">← Case Files</Link>
          <span className="mx-2">/</span>
          <span>New Case</span>
        </nav>

        <h1 className="text-3xl font-bold">📋 New Homeopathy Case</h1>
        <p className="text-muted-foreground mt-1 mb-6">Complete the case sheet — more details = better repertorisation</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-purple-700" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Step 1 — Chief Complaint</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Chief Complaint *</label>
              <Textarea
                value={form.chief_complaint}
                onChange={(e) => up("chief_complaint", e.target.value)}
                placeholder="Describe the main problem in patient's own words..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Duration</label>
              <Input
                value={form.complaint_duration}
                onChange={(e) => up("complaint_duration", e.target.value)}
                placeholder="e.g. 3 months, since childhood, 2 years"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Aggravations (what makes it WORSE)</label>
              <div className="flex flex-wrap gap-2">
                {aggList.map((a) => (
                  <button key={a} onClick={() => toggleArr("aggravations", a)} className={chipCls(form.aggravations.includes(a))}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ameliorations (what makes it BETTER)</label>
              <div className="flex flex-wrap gap-2">
                {amelList.map((a) => (
                  <button key={a} onClick={() => toggleArr("ameliorations", a)} className={chipCls(form.ameliorations.includes(a))}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-purple-700 hover:bg-purple-800 text-white">
              Next: Mental Symptoms →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Step 2 — Mental Symptoms</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mental & Emotional State</label>
              <Textarea
                value={form.mental_state}
                onChange={(e) => up("mental_state", e.target.value)}
                placeholder="Describe the patient's mental state, emotions, personality..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fears</label>
              <div className="flex flex-wrap gap-2">
                {fearList.map((f) => (
                  <button key={f} onClick={() => toggleArr("fears", f)} className={chipCls(form.fears.includes(f))}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Thermal State</label>
              <div className="flex gap-3">
                {["Chilly", "Hot", "Variable"].map((t) => (
                  <button
                    key={t}
                    onClick={() => up("thermal", t)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.thermal === t ? "bg-purple-700 text-white border-purple-700" : "border-border hover:border-purple-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Thirst</label>
              <div className="flex gap-2 flex-wrap">
                {["Thirstless", "Little", "Moderate", "Excessive"].map((t) => (
                  <button key={t} onClick={() => up("thirst", t)} className={chipCls(form.thirst === t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                Next: History →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Step 3 — History</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Past History</label>
              <Textarea
                value={form.past_history}
                onChange={(e) => up("past_history", e.target.value)}
                placeholder="Significant illnesses, operations, injuries, childhood diseases..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Family History</label>
              <Textarea
                value={form.family_history}
                onChange={(e) => up("family_history", e.target.value)}
                placeholder="Parents/siblings — diabetes, heart disease, cancer, TB, mental illness..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Miasm</label>
              <div className="flex gap-2 flex-wrap">
                {miasmList.map((m) => (
                  <button key={m} onClick={() => up("miasm", m.toLowerCase())} className={chipCls(form.miasm === m.toLowerCase())}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Back</Button>
              <Button onClick={() => setStep(4)} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                Next: Review →
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Step 4 — Review & Save</h2>
            <div className="space-y-3">
              {[
                { label: "Chief Complaint", value: form.chief_complaint },
                { label: "Duration", value: form.complaint_duration },
                { label: "Aggravations", value: form.aggravations.join(", ") || "None selected" },
                { label: "Ameliorations", value: form.ameliorations.join(", ") || "None selected" },
                { label: "Mental State", value: form.mental_state },
                { label: "Fears", value: form.fears.join(", ") || "None selected" },
                { label: "Thermal", value: form.thermal || "Not specified" },
                { label: "Thirst", value: form.thirst || "Not specified" },
                { label: "Miasm", value: form.miasm || "Not assessed" },
              ].map((item) => (
                <div key={item.label} className="flex gap-4 p-3 rounded-xl bg-muted/30">
                  <span className="text-xs font-semibold text-muted-foreground w-32 shrink-0 mt-0.5">{item.label}</span>
                  <span className="text-sm">{item.value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">← Back</Button>
              <Button onClick={save} disabled={saving || !form.chief_complaint} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                {saving ? "Saving..." : "💾 Save Case"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default CaseTakingForm;
