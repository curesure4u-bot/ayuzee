import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Droplet, Trash2, Eye, Mic, Hand, Sparkles, User, Save, Plus, History } from "lucide-react";
import { toast } from "sonner";

type ExamRow = {
  id: string;
  patient_name: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  exam_date: string;
  dosha_assessment: string | null;
  clinical_impression: string | null;
};

const FOLDS = [
  { key: "nadi", label: "Nadi (Pulse)", icon: Activity, fields: [
    { name: "rate", label: "Rate (bpm)", type: "number" },
    { name: "rhythm", label: "Rhythm", type: "text", placeholder: "Regular / Irregular" },
    { name: "dosha_type", label: "Dosha Pattern", type: "select", options: ["Vata (snake-like)", "Pitta (frog-like)", "Kapha (swan-like)", "Mixed"] },
  ]},
  { key: "mutra", label: "Mutra (Urine)", icon: Droplet, fields: [
    { name: "color", label: "Color", type: "text", placeholder: "Pale / Yellow / Dark" },
    { name: "frequency", label: "Frequency / day", type: "text" },
    { name: "odor", label: "Odor", type: "text" },
  ]},
  { key: "mala", label: "Mala (Stool)", icon: Trash2, fields: [
    { name: "consistency", label: "Consistency", type: "text", placeholder: "Hard / Soft / Loose" },
    { name: "frequency", label: "Frequency / day", type: "text" },
    { name: "color", label: "Color", type: "text" },
  ]},
  { key: "jihva", label: "Jihva (Tongue)", icon: Sparkles, fields: [
    { name: "coating", label: "Coating", type: "text", placeholder: "None / Thin / Thick white / Yellow" },
    { name: "color", label: "Color", type: "text" },
    { name: "moisture", label: "Moisture", type: "text", placeholder: "Dry / Moist / Wet" },
  ]},
  { key: "shabda", label: "Shabda (Voice)", icon: Mic, fields: [
    { name: "clarity", label: "Clarity", type: "text", placeholder: "Clear / Hoarse / Weak" },
    { name: "tone", label: "Tone", type: "text" },
  ]},
  { key: "sparsha", label: "Sparsha (Touch / Skin)", icon: Hand, fields: [
    { name: "temperature", label: "Temperature", type: "text", placeholder: "Cold / Warm / Hot" },
    { name: "moisture", label: "Skin moisture", type: "text", placeholder: "Dry / Normal / Oily" },
    { name: "texture", label: "Texture", type: "text" },
  ]},
  { key: "drik", label: "Drik (Eyes)", icon: Eye, fields: [
    { name: "color", label: "Sclera color", type: "text" },
    { name: "luster", label: "Luster", type: "text", placeholder: "Bright / Dull" },
  ]},
  { key: "akriti", label: "Akriti (Body Build)", icon: User, fields: [
    { name: "frame", label: "Frame", type: "text", placeholder: "Thin / Medium / Stout" },
    { name: "weight_kg", label: "Weight (kg)", type: "number" },
  ]},
] as const;

export default function Ashtavidha() {
  const [history, setHistory] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [folds, setFolds] = useState<Record<string, Record<string, string>>>({});
  const [doshaAssessment, setDoshaAssessment] = useState("");
  const [impression, setImpression] = useState("");
  const [recommendations, setRecommendations] = useState("");

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vaidya_ashtavidha_exams")
      .select("id, patient_name, patient_age, patient_gender, exam_date, dosha_assessment, clinical_impression")
      .order("exam_date", { ascending: false })
      .limit(50);
    setHistory((data as ExamRow[]) || []);
    setLoading(false);
  };

  const setField = (foldKey: string, name: string, value: string) => {
    setFolds(prev => ({ ...prev, [foldKey]: { ...(prev[foldKey] || {}), [name]: value } }));
  };

  const reset = () => {
    setPatientName(""); setAge(""); setGender(""); setExamDate(new Date().toISOString().slice(0, 10));
    setFolds({}); setDoshaAssessment(""); setImpression(""); setRecommendations("");
  };

  const handleSave = async () => {
    if (!patientName.trim()) { toast.error("Patient name is required"); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      doctor_user_id: u.user!.id,
      patient_name: patientName,
      patient_age: age ? Number(age) : null,
      patient_gender: gender || null,
      exam_date: examDate,
      nadi: folds.nadi || {}, mutra: folds.mutra || {}, mala: folds.mala || {}, jihva: folds.jihva || {},
      shabda: folds.shabda || {}, sparsha: folds.sparsha || {}, drik: folds.drik || {}, akriti: folds.akriti || {},
      dosha_assessment: doshaAssessment || null,
      clinical_impression: impression || null,
      recommendations: recommendations || null,
    };
    const { error } = await supabase.from("vaidya_ashtavidha_exams").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ashtavidha exam saved");
    reset();
    loadHistory();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold">Ashtavidha Pariksha</h1>
        <p className="text-sm text-muted-foreground">Classical 8-fold Ayurveda examination — Nadi, Mutra, Mala, Jihva, Shabda, Sparsha, Drik, Akriti</p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new"><Plus className="mr-1 h-4 w-4" /> New Exam</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-1 h-4 w-4" /> History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Patient</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div><Label>Patient name *</Label><Input value={patientName} onChange={e=>setPatientName(e.target.value)} /></div>
              <div><Label>Age</Label><Input type="number" value={age} onChange={e=>setAge(e.target.value)} /></div>
              <div>
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Exam date</Label><Input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)} /></div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {FOLDS.map(f => {
              const Icon = f.icon;
              return (
                <Card key={f.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      {f.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {f.fields.map(field => (
                      <div key={field.name}>
                        <Label className="text-xs">{field.label}</Label>
                        {field.type === "select" ? (
                          <Select value={folds[f.key]?.[field.name] || ""} onValueChange={v => setField(f.key, field.name, v)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {(field as any).options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type}
                            placeholder={(field as any).placeholder}
                            value={folds[f.key]?.[field.name] || ""}
                            onChange={e => setField(f.key, field.name, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        rows={2}
                        value={folds[f.key]?.notes || ""}
                        onChange={e => setField(f.key, "notes", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Clinical Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Dosha assessment</Label>
                <Select value={doshaAssessment} onValueChange={setDoshaAssessment}>
                  <SelectTrigger><SelectValue placeholder="Select dominant dosha" /></SelectTrigger>
                  <SelectContent>
                    {["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"].map(d =>
                      <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Clinical impression</Label><Textarea rows={3} value={impression} onChange={e=>setImpression(e.target.value)} /></div>
              <div><Label>Recommendations</Label><Textarea rows={3} value={recommendations} onChange={e=>setRecommendations(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} variant="hero"><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save Exam"}</Button>
                <Button variant="outline" onClick={reset}>Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading…</div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No exams recorded yet.</div>
              ) : (
                <div className="divide-y">
                  {history.map(h => (
                    <div key={h.id} className="flex items-start justify-between gap-4 p-4 hover:bg-muted/30">
                      <div>
                        <div className="font-semibold">{h.patient_name} <span className="text-xs text-muted-foreground">· {h.patient_age || "—"} {h.patient_gender || ""}</span></div>
                        <div className="text-xs text-muted-foreground">{new Date(h.exam_date).toLocaleDateString()}</div>
                        {h.clinical_impression && <p className="mt-1 text-sm line-clamp-2">{h.clinical_impression}</p>}
                      </div>
                      {h.dosha_assessment && <Badge variant="secondary">{h.dosha_assessment}</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
