import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const CONTRAINDICATIONS = [
  "Fever",
  "Active infection",
  "Open wound",
  "Bleeding disorder",
  "On blood thinners",
  "Severe anemia",
  "Pregnancy caution",
  "Severe neuropathy",
  "Uncontrolled diabetes",
  "Uncontrolled hypertension",
  "Malignancy suspicion",
  "Severe fear / anxiety",
  "No consent",
];

const ParaSurgicalNewCase = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    gender: "",
    occupation: "",
    chief_complaint: "",
    pain_location: "",
    duration: "",
    pain_severity: 5,
    radiation: "",
    numbness: false,
    stiffness: false,
    swelling: false,
    rom_restriction: "",
    previous_treatment: "",
    imaging_available: "",
    diabetes: false,
    hypertension: false,
    bleeding_history: false,
    surgery_history: "",
    posture_issues: "",
    lifestyle_factors: "",
    doctor_notes: "",
  });
  const [ci, setCi] = useState<string[]>([]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleCi = (item: string) =>
    setCi((arr) => (arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]));

  const submit = async () => {
    if (!form.patient_name.trim() || !form.chief_complaint.trim()) {
      toast.error("Patient name and chief complaint are required");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please sign in");
      setSaving(false);
      return;
    }
    const payload = {
      ...form,
      age: form.age ? parseInt(form.age) : null,
      doctor_user_id: auth.user.id,
      contraindications: ci,
      status: "draft",
    };
    const { data, error } = await (supabase as any)
      .from("parasurgical_cases")
      .insert(payload)
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast.error("Failed to save case");
      return;
    }
    toast.success("Case created");
    navigate(`/vaidya/parasurgical/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/vaidya/parasurgical")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="font-display text-2xl font-semibold">New Case Assessment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Patient name *</Label>
            <Input value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age</Label>
              <Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} />
            </div>
            <div>
              <Label>Gender</Label>
              <Input value={form.gender} onChange={(e) => set("gender", e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Occupation</Label>
            <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complaint & symptoms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Chief complaint *</Label>
            <Textarea
              rows={2}
              value={form.chief_complaint}
              onChange={(e) => set("chief_complaint", e.target.value)}
            />
          </div>
          <div>
            <Label>Pain location</Label>
            <Input value={form.pain_location} onChange={(e) => set("pain_location", e.target.value)} />
          </div>
          <div>
            <Label>Duration</Label>
            <Input
              placeholder="e.g. 3 months"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Pain severity: {form.pain_severity}/10</Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[form.pain_severity]}
              onValueChange={(v) => set("pain_severity", v[0])}
            />
          </div>
          <div>
            <Label>Radiation symptoms</Label>
            <Input value={form.radiation} onChange={(e) => set("radiation", e.target.value)} />
          </div>
          <div>
            <Label>ROM restriction</Label>
            <Input
              value={form.rom_restriction}
              onChange={(e) => set("rom_restriction", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-4">
            {(["numbness", "stiffness", "swelling"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm capitalize">
                <Checkbox checked={form[k]} onCheckedChange={(v) => set(k, !!v)} />
                {k}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Previous treatment</Label>
            <Textarea
              rows={2}
              value={form.previous_treatment}
              onChange={(e) => set("previous_treatment", e.target.value)}
            />
          </div>
          <div>
            <Label>Imaging available</Label>
            <Textarea
              rows={2}
              value={form.imaging_available}
              onChange={(e) => set("imaging_available", e.target.value)}
            />
          </div>
          <div>
            <Label>Surgery history</Label>
            <Textarea
              rows={2}
              value={form.surgery_history}
              onChange={(e) => set("surgery_history", e.target.value)}
            />
          </div>
          <div>
            <Label>Posture issues</Label>
            <Input
              value={form.posture_issues}
              onChange={(e) => set("posture_issues", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Lifestyle factors</Label>
            <Textarea
              rows={2}
              value={form.lifestyle_factors}
              onChange={(e) => set("lifestyle_factors", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 md:col-span-2">
            {(["diabetes", "hypertension", "bleeding_history"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm capitalize">
                <Checkbox checked={form[k]} onCheckedChange={(v) => set(k, !!v)} />
                {k.replace("_", " ")}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" /> Contraindications checklist
          </CardTitle>
          <CardDescription>Tick any that apply. AI will flag risks accordingly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {CONTRAINDICATIONS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <Checkbox checked={ci.includes(c)} onCheckedChange={() => toggleCi(c)} />
                {c}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={form.doctor_notes}
            onChange={(e) => set("doctor_notes", e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/vaidya/parasurgical")}>
          Cancel
        </Button>
        <Button variant="hero" disabled={saving} onClick={submit}>
          {saving ? "Saving…" : "Save & continue to AI selector"}
        </Button>
      </div>
    </div>
  );
};

export default ParaSurgicalNewCase;
