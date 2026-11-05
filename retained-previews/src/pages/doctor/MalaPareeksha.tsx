import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Download, LayoutDashboard, Save } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
} from "recharts";
import {
  STOOL_TYPES, MALA_OPTIONS, analyzeMala, computeBMI, RISK_LABEL,
  VARNA_OPTIONS, PRAMANA_OPTIONS, GANDHA_OPTIONS, PLAVA_OPTIONS,
  TIME_OF_DAY_OPTIONS, ASSOCIATED_SYMPTOMS, suggestDoshaCorrelation,
  type MalaResponses, type StoolType, type PatientInfo, type MalaExtendedFields,
} from "@/data/ashtavidha";
import {
  startAyuzeePdf, addTitle, addPlainTable, addSectionTable, addParagraph,
  finalizeAyuzeePdf, safeFileName,
} from "@/lib/pdf/ayuzeePdf";
import { MalaPayloadSchema, PhoneSchema, withinJsonBudget } from "@/lib/validation/malaPareeksha";
import { Checkbox } from "@/components/ui/checkbox";

const emptyPatient: PatientInfo = {
  patientId: "", uhid: "", name: "", age: "", gender: "", weight: "", height: "", bmi: "",
  occupation: "", phone: "", visitDate: new Date().toISOString().slice(0, 10),
  consultant: "", chiefComplaint: "", duration: "",
};

const emptyResponses: MalaResponses = {
  frequency: "", colour: "", smell: "",
  mucus: "no", blood: "no", undigestedFood: "no", oilLayer: "no", floating: "no",
  difficulty: "none", burning: "none", pain: "none", gas: "none",
  bloating: "no", appetite: "", waterIntake: "", foodPattern: "",
  stress: "", sleep: "", exercise: "",
  _extras: { yoga: "", pranayama: "", referral: "", warnings: "" },
};

const riskColor: Record<string, string> = {
  normal: "bg-emerald-100 text-emerald-800 border-emerald-300",
  observe: "bg-amber-100 text-amber-800 border-amber-300",
  attention: "bg-orange-100 text-orange-900 border-orange-300",
  urgent: "bg-red-100 text-red-800 border-red-300",
};

type HistoryRow = {
  id: string; assessment_date: string; stool_type: number;
  dosha: string | null; agni: string | null; ama: string | null; risk_level: string | null;
  patient_name: string | null;
};

const MalaPareeksha = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState("new");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [patient, setPatient] = useState<PatientInfo>(emptyPatient);
  const [stoolType, setStoolType] = useState<number | null>(null);
  const [responses, setResponses] = useState<MalaResponses>(emptyResponses);
  const [diagnosisNote, setDiagnosisNote] = useState("");
  const [dietAdvice, setDietAdvice] = useState("");
  const [lifestyleAdvice, setLifestyleAdvice] = useState("");
  const [medicines, setMedicines] = useState("");
  const [panchakarma, setPanchakarma] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Extended clinical fields
  const [ext, setExt] = useState<MalaExtendedFields>({
    varna: "", varna_note: "", akriti_bristol_type: null,
    pramana: "", gandha: "", ama_present: null, ama_note: "",
    plava_pariksha: "", frequency_per_day: null, time_of_day_pattern: "",
    associated_symptoms: [],
  });
  const setE = <K extends keyof MalaExtendedFields>(k: K) => (v: MalaExtendedFields[K]) =>
    setExt((e) => ({ ...e, [k]: v }));
  const toggleSymptom = (s: string) => setExt((e) => {
    const cur = e.associated_symptoms ?? [];
    if (s === "None") return { ...e, associated_symptoms: cur.includes("None") ? [] : ["None"] };
    const without = cur.filter((x) => x !== "None");
    return {
      ...e,
      associated_symptoms: without.includes(s) ? without.filter((x) => x !== s) : [...without, s],
    };
  });
  const suggestedDosha = useMemo(
    () => suggestDoshaCorrelation(ext, stoolType),
    [ext, stoolType],
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: doc } = await supabase.from("doctors").select("full_name").eq("user_id", uid).maybeSingle();
        if (doc?.full_name) setPatient((p) => ({ ...p, consultant: doc.full_name }));
      }
    })();
  }, []);

  // Auto-BMI
  useEffect(() => {
    const bmi = computeBMI(patient.weight, patient.height);
    if (bmi !== patient.bmi) setPatient((p) => ({ ...p, bmi }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.weight, patient.height]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const { data } = await (supabase as any)
      .from("mala_pareeksha_assessments")
      .select("id,assessment_date,stool_type,dosha,agni,ama,risk_level,patient_name")
      .order("assessment_date", { ascending: false })
      .limit(100);
    setHistory((data ?? []) as HistoryRow[]);
    setLoadingHistory(false);
  };

  useEffect(() => { if (tab === "history" || tab === "trends") loadHistory(); }, [tab]);

  const analysis = useMemo(() => (stoolType ? analyzeMala(stoolType, responses) : null), [stoolType, responses]);

  const setR = (k: keyof MalaResponses) => (v: string) =>
    setResponses((r) => ({ ...r, [k]: v }));
  const setP = (k: keyof PatientInfo) => (v: string) =>
    setPatient((p) => ({ ...p, [k]: v }));
  const setExtra = (k: "yoga" | "pranayama" | "referral" | "warnings") => (v: string) =>
    setResponses((r) => ({ ...r, _extras: { ...(r._extras ?? {}), [k]: v } }));

  const resetForm = () => {
    setPatient({ ...emptyPatient, visitDate: new Date().toISOString().slice(0, 10), consultant: patient.consultant });
    setStoolType(null); setResponses(emptyResponses);
    setDiagnosisNote(""); setDietAdvice(""); setLifestyleAdvice("");
    setMedicines(""); setPanchakarma(""); setFollowupDate("");
    setExt({
      varna: "", varna_note: "", akriti_bristol_type: null,
      pramana: "", gandha: "", ama_present: null, ama_note: "",
      plava_pariksha: "", frequency_per_day: null, time_of_day_pattern: "",
      associated_symptoms: [],
    });
  };

  const save = async () => {
    if (!userId) return toast.error("Please sign in to save.");
    if (patient.phone) {
      const ph = PhoneSchema.safeParse(patient.phone);
      if (!ph.success) return toast.error(ph.error.issues[0]?.message ?? "Invalid phone");
    }
    if (!stoolType) return toast.error("Select a stool type.");

    const rawPayload = {
      patient_user_id: userId,
      doctor_user_id: userId,
      patient_name: patient.name,
      patient_age: patient.age ? Number(patient.age) : null,
      patient_gender: patient.gender || null,
      patient_ref: patient.patientId || patient.uhid || null,
      assessment_date: patient.visitDate || new Date().toISOString().slice(0, 10),
      stool_type: stoolType,
      responses: { ...responses, _patient: patient, _extended: ext },
      analysis: analysis ?? {},
      dosha: analysis?.dosha ?? null,
      agni: analysis?.agni ?? null,
      ama: analysis?.ama ?? null,
      risk_level: analysis?.risk ?? null,
      diagnosis_note: diagnosisNote || null,
      diet_advice: dietAdvice || null,
      lifestyle_advice: lifestyleAdvice || null,
      medicines: medicines || null,
      panchakarma: panchakarma || null,
      followup_date: followupDate || null,
      red_flag_warning: responses._extras?.warnings || null,
      // Extended clinical fields
      varna: ext.varna || null,
      varna_note: ext.varna_note || null,
      akriti_bristol_type: ext.akriti_bristol_type ?? null,
      pramana: ext.pramana || null,
      gandha: ext.gandha || null,
      ama_present: ext.ama_present ?? null,
      ama_note: ext.ama_note || null,
      plava_pariksha: ext.plava_pariksha || null,
      frequency_per_day: ext.frequency_per_day ?? null,
      time_of_day_pattern: ext.time_of_day_pattern || null,
      associated_symptoms: ext.associated_symptoms?.length ? ext.associated_symptoms : null,
      suggested_dosha_correlation: suggestedDosha,
    };

    // Validate + sanitize on the client (server re-validates via triggers/CHECKs).
    const parsed = MalaPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return toast.error(`${first?.path.join(".") || "input"}: ${first?.message}`);
    }
    if (!withinJsonBudget(parsed.data.responses) || !withinJsonBudget(parsed.data.analysis, 15000)) {
      return toast.error("Assessment payload too large.");
    }

    setSaving(true);
    const { error } = await (supabase as any)
      .from("mala_pareeksha_assessments")
      .insert(parsed.data);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Assessment saved.");
    resetForm();
  };

  const downloadPdf = async () => {
    if (!stoolType || !analysis) return toast.error("Complete the assessment first.");
    const { doc, y } = startAyuzeePdf({
      clinicName: "Ayuzee",
      doctorName: patient.consultant,
      subtitle: "Ashtavidha Pareeksha — Mala Pareeksha Report",
    });
    let cursor = addTitle(doc, y, "Mala Pareeksha Report", patient.visitDate ?? "");
    cursor = addPlainTable(doc, cursor, [
      ["Patient", patient.name || "—"],
      ["Patient ID / UHID", `${patient.patientId || "—"} / ${patient.uhid || "—"}`],
      ["Age / Gender", `${patient.age || "—"} / ${patient.gender || "—"}`],
      ["Weight / Height / BMI", `${patient.weight || "—"} / ${patient.height || "—"} / ${patient.bmi || "—"}`],
      ["Occupation / Phone", `${patient.occupation || "—"} / ${patient.phone || "—"}`],
      ["Consultant", patient.consultant || "—"],
      ["Chief Complaint", `${patient.chiefComplaint || "—"} (${patient.duration || "—"})`],
    ]);
    cursor = addSectionTable(doc, cursor, {
      title: "Ayurvedic Findings",
      head: ["Field", "Value"],
      body: [
        ["Stool Type", `${analysis.stool.id}. ${analysis.stool.name}`],
        ["Dosha", analysis.dosha],
        ["Agni", analysis.agni],
        ["Ama", analysis.ama],
        ["Dhatu", analysis.dhatu],
        ["Srotas", analysis.srotas],
        ["Clinical Impression", analysis.impression],
        ["Risk", RISK_LABEL[analysis.risk] ?? analysis.risk],
      ],
      columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" } },
    });
    cursor = addParagraph(doc, cursor, "Summary", analysis.summary);
    if (analysis.reasons.length) cursor = addParagraph(doc, cursor, "Red-flag reasons", analysis.reasons.join("; "));
    if (diagnosisNote) cursor = addParagraph(doc, cursor, "Diagnosis Note", diagnosisNote);
    if (dietAdvice) cursor = addParagraph(doc, cursor, "Diet Advice", dietAdvice);
    if (lifestyleAdvice) cursor = addParagraph(doc, cursor, "Lifestyle Advice", lifestyleAdvice);
    if (responses._extras?.yoga) cursor = addParagraph(doc, cursor, "Yoga", responses._extras.yoga);
    if (responses._extras?.pranayama) cursor = addParagraph(doc, cursor, "Pranayama", responses._extras.pranayama);
    if (medicines) cursor = addParagraph(doc, cursor, "Ayurveda Medicines", medicines);
    if (panchakarma) cursor = addParagraph(doc, cursor, "Panchakarma", panchakarma);
    if (followupDate) cursor = addParagraph(doc, cursor, "Follow-up", followupDate);
    if (responses._extras?.referral) cursor = addParagraph(doc, cursor, "Referral Notes", responses._extras.referral);
    if (responses._extras?.warnings) cursor = addParagraph(doc, cursor, "Warnings", responses._extras.warnings);

    // QR code with reference
    try {
      const refId = `${patient.uhid || patient.patientId || "AYZ"}-${Date.now().toString(36).toUpperCase()}`;
      const qrPayload = JSON.stringify({
        clinic: "Ayuzee", module: "Mala Pareeksha", ref: refId,
        patient: patient.name, date: patient.visitDate,
        dosha: analysis.dosha, agni: analysis.agni, ama: analysis.ama, impression: analysis.impression,
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 0, width: 160 });
      doc.addImage(qrDataUrl, "PNG", 155, cursor + 4, 32, 32);
      doc.setFontSize(8);
      doc.text(`Ref: ${refId}`, 155, cursor + 40);
    } catch { /* ignore QR failure */ }

    cursor = addParagraph(doc, cursor + 4, "Disclaimer",
      "This tool supports Ayurvedic clinical documentation and patient education. It does not replace direct medical examination, diagnosis, laboratory tests, or emergency care. Blood in stool, black stool, severe diarrhea, dehydration, fever, or persistent symptoms require immediate medical consultation.");
    finalizeAyuzeePdf(doc, `${safeFileName(patient.name || "patient")}_mala_pareeksha.pdf`, "Ayuzee · Ashtavidha Pareeksha");
  };

  // Trend data
  const trendData = useMemo(() => {
    return history.slice().reverse().map((h) => ({
      date: h.assessment_date,
      stool: h.stool_type,
      Vata: h.dosha === "Vata" ? 1 : 0,
      Pitta: h.dosha === "Pitta" ? 1 : 0,
      Kapha: h.dosha === "Kapha" ? 1 : 0,
      Ama: h.ama === "High" ? 3 : h.ama === "Moderate" ? 2 : 1,
    }));
  }, [history]);

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/doctor/ashtavidha" className="inline-flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Ashtavidha Pareeksha
        </Link>
        <span>/</span>
        <span className="text-foreground">Mala Pareeksha</span>
        <div className="ml-auto">
          <Link to="/doctor/ashtavidha/mala/dashboard">
            <Button variant="outline" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ashtavidha · 3 of 8</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[hsl(150,45%,18%)]">Mala Pareeksha</h1>
          <p className="mt-1 text-sm text-muted-foreground">Structured stool examination and Ayurvedic clinical analysis.</p>
        </div>
        <Badge className="bg-[hsl(150,45%,18%)] text-[hsl(45,60%,70%)]">Ayuzee HMS · Clinical Examination</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new">New Assessment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-4">
              <h3 className="col-span-full font-display text-lg font-semibold">Patient information</h3>
              <Field label="Patient ID" value={patient.patientId ?? ""} onChange={setP("patientId")} />
              <Field label="UHID" value={patient.uhid ?? ""} onChange={setP("uhid")} />
              <Field label="Patient Name *" value={patient.name ?? ""} onChange={setP("name")} />
              <Field label="Age" type="number" value={patient.age ?? ""} onChange={setP("age")} />
              <div>
                <Label>Gender</Label>
                <Select value={patient.gender ?? ""} onValueChange={setP("gender")}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Weight (kg)" type="number" value={patient.weight ?? ""} onChange={setP("weight")} />
              <Field label="Height (cm)" type="number" value={patient.height ?? ""} onChange={setP("height")} />
              <Field label="BMI" value={patient.bmi ?? ""} readOnly />
              <Field label="Occupation" value={patient.occupation ?? ""} onChange={setP("occupation")} />
              <Field label="Phone" value={patient.phone ?? ""} onChange={setP("phone")} />
              <Field label="Visit Date" type="date" value={patient.visitDate ?? ""} onChange={setP("visitDate")} />
              <Field label="Consultant" value={patient.consultant ?? ""} onChange={setP("consultant")} />
              <div className="md:col-span-2">
                <Label>Chief Complaint</Label>
                <Input value={patient.chiefComplaint ?? ""} onChange={(e) => setP("chiefComplaint")(e.target.value)} />
              </div>
              <Field label="Duration" value={patient.duration ?? ""} onChange={setP("duration")} placeholder="e.g. 2 weeks" />
            </CardContent>
          </Card>

          {/* Section 1: Stool type */}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-semibold">Section 1 · Stool type</h2>
              <p className="text-xs text-muted-foreground">Tap a card that best matches</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STOOL_TYPES.map((s) => (
                <StoolCard key={s.id} s={s} active={stoolType === s.id} onSelect={() => setStoolType(s.id)} />
              ))}
            </div>
          </div>

          {/* Section 2: Clinical questions */}
          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <h3 className="col-span-full font-display text-lg font-semibold">Section 2 · Clinical questions</h3>
              <SelectField label="Frequency" value={responses.frequency ?? ""} onChange={setR("frequency")} options={[...MALA_OPTIONS.frequency]} />
              <SelectField label="Colour" value={responses.colour ?? ""} onChange={setR("colour")} options={[...MALA_OPTIONS.colour]} />
              <SelectField label="Smell" value={responses.smell ?? ""} onChange={setR("smell")} options={[...MALA_OPTIONS.smell]} />
              <SelectField label="Mucus" value={responses.mucus ?? ""} onChange={setR("mucus")} options={[...MALA_OPTIONS.yesNo]} />
              <SelectField label="Blood" value={responses.blood ?? ""} onChange={setR("blood")} options={[...MALA_OPTIONS.yesNo]} />
              <SelectField label="Undigested food" value={responses.undigestedFood ?? ""} onChange={setR("undigestedFood")} options={[...MALA_OPTIONS.yesNo]} />
              <SelectField label="Oil layer" value={responses.oilLayer ?? ""} onChange={setR("oilLayer")} options={[...MALA_OPTIONS.yesNo]} />
              <SelectField label="Floating" value={responses.floating ?? ""} onChange={setR("floating")} options={[...MALA_OPTIONS.yesNo]} />
              <SelectField label="Difficulty passing" value={responses.difficulty ?? ""} onChange={setR("difficulty")} options={[...MALA_OPTIONS.severity]} />
              <SelectField label="Burning" value={responses.burning ?? ""} onChange={setR("burning")} options={[...MALA_OPTIONS.severity]} />
              <SelectField label="Pain" value={responses.pain ?? ""} onChange={setR("pain")} options={[...MALA_OPTIONS.severity]} />
              <SelectField label="Gas" value={responses.gas ?? ""} onChange={setR("gas")} options={[...MALA_OPTIONS.severity]} />
              <SelectField label="Bloating" value={responses.bloating ?? ""} onChange={setR("bloating")} options={[...MALA_OPTIONS.yesNo]} />
              <SelectField label="Appetite" value={responses.appetite ?? ""} onChange={setR("appetite")} options={[...MALA_OPTIONS.appetite]} />
              <SelectField label="Water intake" value={responses.waterIntake ?? ""} onChange={setR("waterIntake")} options={[...MALA_OPTIONS.waterIntake]} />
              <SelectField label="Food pattern" value={responses.foodPattern ?? ""} onChange={setR("foodPattern")} options={[...MALA_OPTIONS.foodPattern]} />
              <SelectField label="Stress" value={responses.stress ?? ""} onChange={setR("stress")} options={[...MALA_OPTIONS.stress]} />
              <SelectField label="Sleep" value={responses.sleep ?? ""} onChange={setR("sleep")} options={[...MALA_OPTIONS.sleep]} />
              <SelectField label="Exercise" value={responses.exercise ?? ""} onChange={setR("exercise")} options={[...MALA_OPTIONS.exercise]} />
            </CardContent>
          </Card>

          {/* Section 2b: Structured Ayurvedic examination (Varna, Pramana, Gandha, Plava, etc.) */}
          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <h3 className="col-span-full font-display text-lg font-semibold">
                Section 2b · Structured examination (Varna · Akriti · Pramana · Gandha · Plava)
              </h3>

              <div>
                <Label>Varna (colour)</Label>
                <Select value={ext.varna ?? ""} onValueChange={(v) => setE("varna")(v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {VARNA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Varna note {ext.varna === "other" ? "*" : "(optional)"}</Label>
                <Input
                  value={ext.varna_note ?? ""}
                  maxLength={300}
                  onChange={(e) => setE("varna_note")(e.target.value)}
                  placeholder="Describe colour details"
                />
              </div>

              <div>
                <Label>Akriti — Bristol Stool Scale (1–7)</Label>
                <Select
                  value={ext.akriti_bristol_type ? String(ext.akriti_bristol_type) : ""}
                  onValueChange={(v) => setE("akriti_bristol_type")(v ? Number(v) : null)}
                >
                  <SelectTrigger><SelectValue placeholder="Select Bristol type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Type 1 · Separate hard lumps</SelectItem>
                    <SelectItem value="2">Type 2 · Lumpy sausage</SelectItem>
                    <SelectItem value="3">Type 3 · Cracked sausage</SelectItem>
                    <SelectItem value="4">Type 4 · Smooth soft sausage</SelectItem>
                    <SelectItem value="5">Type 5 · Soft blobs</SelectItem>
                    <SelectItem value="6">Type 6 · Fluffy mushy</SelectItem>
                    <SelectItem value="7">Type 7 · Watery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <SelectField
                label="Pramana (quantity)"
                value={ext.pramana ?? ""}
                onChange={(v) => setE("pramana")(v)}
                options={[...PRAMANA_OPTIONS]}
              />
              <SelectField
                label="Gandha (odour)"
                value={ext.gandha ?? ""}
                onChange={(v) => setE("gandha")(v)}
                options={[...GANDHA_OPTIONS]}
              />

              <div>
                <Label>Plava pariksha (float/sink)</Label>
                <Select value={ext.plava_pariksha ?? ""} onValueChange={(v) => setE("plava_pariksha")(v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {PLAVA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ama present?</Label>
                <Select
                  value={ext.ama_present === true ? "yes" : ext.ama_present === false ? "no" : ""}
                  onValueChange={(v) => setE("ama_present")(v === "yes" ? true : v === "no" ? false : null)}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Ama note (optional)</Label>
                <Input
                  value={ext.ama_note ?? ""}
                  maxLength={300}
                  onChange={(e) => setE("ama_note")(e.target.value)}
                  placeholder="e.g. undigested food, sticky mucus"
                />
              </div>

              <div>
                <Label>Frequency (times per day)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step="0.5"
                  value={ext.frequency_per_day ?? ""}
                  onChange={(e) => setE("frequency_per_day")(e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
              <SelectField
                label="Time-of-day pattern"
                value={ext.time_of_day_pattern ?? ""}
                onChange={(v) => setE("time_of_day_pattern")(v)}
                options={[...TIME_OF_DAY_OPTIONS]}
              />

              <div className="md:col-span-3">
                <Label>Associated symptoms</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {ASSOCIATED_SYMPTOMS.map((s) => {
                    const checked = (ext.associated_symptoms ?? []).includes(s);
                    return (
                      <label key={s} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                        <Checkbox checked={checked} onCheckedChange={() => toggleSymptom(s)} />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-3">
                <Label>Auto-suggested Dosha correlation (rule-based)</Label>
                <Input value={suggestedDosha} readOnly className="bg-muted/40 font-semibold" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Derived from Bristol type, Varna, Pramana, Gandha, Plava, Ama, frequency and associated symptoms.
                  Not AI — deterministic scoring only.
                </p>
              </div>
            </CardContent>
          </Card>



          {/* Section 3: Auto analysis */}
          {analysis && (
            <Card className="border-primary/30 bg-[hsl(150,45%,18%)]/[0.04]">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">Section 3 · Ayurvedic analysis</h3>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskColor[analysis.risk]}`}>
                    {RISK_LABEL[analysis.risk]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{analysis.summary}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
                  <MiniStat label="Dosha" value={analysis.dosha} />
                  <MiniStat label="Agni" value={analysis.agni} />
                  <MiniStat label="Ama" value={analysis.ama} />
                  <MiniStat label="Dhatu" value={analysis.dhatu} />
                  <MiniStat label="Srotas" value={analysis.srotas} />
                  <MiniStat label="Impression" value={analysis.impression} />
                </div>
                {analysis.risk === "urgent" && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <div>
                      <div className="font-semibold">Requires immediate medical attention</div>
                      {analysis.reasons.length > 0 && <div className="text-xs">{analysis.reasons.join(" · ")}</div>}
                    </div>
                  </div>
                )}
                <Separator className="my-3" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Suggested:</span> {analysis.stool.advice}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Doctor recommendations */}
          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <h3 className="col-span-full font-display text-lg font-semibold">Section 5 · Doctor recommendations</h3>
              <TextAreaField label="Diagnosis" value={diagnosisNote} onChange={setDiagnosisNote} />
              <TextAreaField label="Diet advice" value={dietAdvice} onChange={setDietAdvice} />
              <TextAreaField label="Lifestyle" value={lifestyleAdvice} onChange={setLifestyleAdvice} />
              <TextAreaField label="Yoga" value={responses._extras?.yoga ?? ""} onChange={setExtra("yoga")} />
              <TextAreaField label="Pranayama" value={responses._extras?.pranayama ?? ""} onChange={setExtra("pranayama")} />
              <TextAreaField label="Ayurveda medicines" value={medicines} onChange={setMedicines} />
              <TextAreaField label="Panchakarma" value={panchakarma} onChange={setPanchakarma} />
              <div>
                <Label>Follow-up date</Label>
                <Input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} />
              </div>
              <TextAreaField label="Warnings" value={responses._extras?.warnings ?? ""} onChange={setExtra("warnings")} />
              <TextAreaField label="Referral notes" value={responses._extras?.referral ?? ""} onChange={setExtra("referral")} />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save Assessment"}
            </Button>
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="mr-2 h-4 w-4" />Download PDF
            </Button>
          </div>

          <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            This tool supports Ayurvedic clinical documentation and patient education. It does not replace direct medical
            examination, diagnosis, laboratory tests, or emergency care. Blood in stool, black stool, severe diarrhea,
            dehydration, fever, or persistent symptoms require immediate medical consultation.
          </p>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-5">
              {loadingHistory ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assessments saved yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => {
                    const st = STOOL_TYPES.find(s => s.id === h.stool_type);
                    return (
                      <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                        <div>
                          <div className="font-semibold">{h.patient_name || "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground">{h.assessment_date} · {st?.name}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="outline">{h.dosha ?? "—"}</Badge>
                          <Badge variant="outline">{h.agni ?? "—"}</Badge>
                          <Badge variant="outline">Ama {h.ama ?? "—"}</Badge>
                          {h.risk_level && (
                            <span className={`rounded-full border px-2 py-0.5 font-semibold ${riskColor[h.risk_level] ?? ""}`}>
                              {RISK_LABEL[h.risk_level] ?? h.risk_level}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardContent className="space-y-6 p-5">
              <div>
                <h3 className="mb-2 font-display text-lg font-semibold">Ama level trend</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[0, 3]} fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Ama" stroke="hsl(150, 45%, 25%)" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-display text-lg font-semibold">Stool type trend</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[0, 11]} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="stool" fill="hsl(45, 60%, 45%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-display text-lg font-semibold">Dosha distribution over time</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip /><Legend />
                      <Line type="monotone" dataKey="Vata" stroke="#6366f1" />
                      <Line type="monotone" dataKey="Pitta" stroke="#ef4444" />
                      <Line type="monotone" dataKey="Kapha" stroke="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StoolCard = ({ s, active, onSelect }: { s: StoolType; active: boolean; onSelect: () => void }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-label={`Select stool type ${s.id}: ${s.name}`}
    aria-pressed={active}
    className={`text-left rounded-xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
      active ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/60 hover:bg-muted/40"
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="text-2xl" aria-hidden>{s.icon}</div>
      <span className="text-xs font-semibold text-muted-foreground">#{s.id}</span>
    </div>
    <div className="mt-2 font-semibold">{s.name}</div>
    <div className="mt-1 text-xs text-muted-foreground">{s.interpretation}</div>
    <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
      <span className="rounded-full bg-[hsl(150,45%,18%)]/10 px-2 py-0.5 text-[hsl(150,45%,18%)]">{s.dosha}</span>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">{s.agni} Agni</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-800">Ama: {s.ama}</span>
    </div>
  </button>
);

const Field = ({ label, value, onChange, type = "text", placeholder, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) => (
  <div>
    <Label>{label}</Label>
    <Input
      type={type} value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={readOnly ? "bg-muted/40" : ""}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <div>
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

const TextAreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label>{label}</Label>
    <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} maxLength={2000} />
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-background p-3">
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold">{value}</div>
  </div>
);

export default MalaPareeksha;
