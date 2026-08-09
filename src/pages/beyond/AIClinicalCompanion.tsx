import { useState } from "react";
import {
  Bot,
  ClipboardCopy,
  FileText,
  Heart,
  Pill,
  Stethoscope,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════════
// DISCHARGE SUMMARY GENERATOR
// ════════════════════════════════════════════════════════════

function DischargeSummaryGenerator() {
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [investigations, setInvestigations] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");

  const generateSummary = () => {
    if (!patientName || !diagnosis) { toast.error("Fill patient name and diagnosis"); return; }
    const summary = `DISCHARGE SUMMARY
═══════════════════════════════════════
Patient: ${patientName}    Age: ${age}
Date of Discharge: ${new Date().toLocaleDateString("en-IN")}

DIAGNOSIS: ${diagnosis}

TREATMENT GIVEN:
${treatment || "—"}

INVESTIGATIONS:
${investigations || "—"}

ADVICE ON DISCHARGE:
${advice || "—"}

FOLLOW-UP: ${followUp || "After 1 week"}

Doctor Signature: ________________
═══════════════════════════════════════`;
    navigator.clipboard.writeText(summary);
    toast.success("Discharge summary copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Discharge Summary Generator</CardTitle>
        <CardDescription className="text-xs">Fill details → get a formatted discharge summary ready to print.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          <Input placeholder="Age/Gender (e.g. 45/M)" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <Input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        <Textarea placeholder="Treatment Given (medicines, procedures...)" value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} className="text-sm" />
        <Textarea placeholder="Investigations (lab results, imaging...)" value={investigations} onChange={(e) => setInvestigations(e.target.value)} rows={2} className="text-sm" />
        <Textarea placeholder="Advice on Discharge (diet, activity, medications to continue...)" value={advice} onChange={(e) => setAdvice(e.target.value)} rows={2} className="text-sm" />
        <Input placeholder="Follow-up (e.g. After 1 week, After 15 days)" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        <Button onClick={generateSummary} className="w-full gap-2"><ClipboardCopy className="h-4 w-4" /> Generate & Copy</Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// PATIENT EXPLANATION SIMPLIFIER
// ════════════════════════════════════════════════════════════

function PatientExplainer() {
  const [medicalText, setMedicalText] = useState("");
  const [simplified, setSimplified] = useState("");

  const simplify = () => {
    if (!medicalText.trim()) { toast.error("Enter medical text to simplify"); return; }
    // Client-side simplification rules (basic — real version would use AI)
    let result = medicalText
      .replace(/hypertension/gi, "high blood pressure")
      .replace(/diabetes mellitus/gi, "sugar disease (diabetes)")
      .replace(/myocardial infarction/gi, "heart attack")
      .replace(/cerebrovascular accident/gi, "brain stroke")
      .replace(/dyslipidemia/gi, "high cholesterol")
      .replace(/osteoarthritis/gi, "joint wear and tear")
      .replace(/bronchitis/gi, "inflammation of the breathing tubes")
      .replace(/gastritis/gi, "stomach lining irritation")
      .replace(/insomnia/gi, "difficulty sleeping")
      .replace(/analgesic/gi, "pain-killer")
      .replace(/antipyretic/gi, "fever-reducing medicine")
      .replace(/antibiotic/gi, "germ-killing medicine")
      .replace(/prognosis/gi, "expected outcome")
      .replace(/bilateral/gi, "on both sides")
      .replace(/unilateral/gi, "on one side")
      .replace(/chronic/gi, "long-lasting")
      .replace(/acute/gi, "sudden/recent")
      .replace(/benign/gi, "not harmful/not cancer")
      .replace(/malignant/gi, "cancerous/serious")
      .replace(/edema/gi, "swelling")
      .replace(/pyrexia/gi, "fever")
      .replace(/dyspnea/gi, "difficulty breathing")
      .replace(/tachycardia/gi, "fast heartbeat")
      .replace(/bradycardia/gi, "slow heartbeat");
    setSimplified(result + "\n\n[Note: For full AI-powered simplification, integrate OpenAI/Claude API]");
    toast.success("Simplified! Copy and share with patient.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Patient Explanation Simplifier</CardTitle>
        <CardDescription className="text-xs">Convert medical jargon → simple language your patient understands.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea placeholder="Enter medical text (e.g. 'Patient has bilateral osteoarthritis with chronic dyspnea')" value={medicalText} onChange={(e) => setMedicalText(e.target.value)} rows={3} className="text-sm" />
        <Button onClick={simplify} className="w-full">Simplify for Patient</Button>
        {simplified && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Patient-Friendly Version:</p>
            <p className="text-sm text-green-600 dark:text-green-300 whitespace-pre-wrap">{simplified}</p>
            <Button size="sm" variant="ghost" className="mt-2 text-xs gap-1" onClick={() => { navigator.clipboard.writeText(simplified); toast.success("Copied!"); }}>
              <ClipboardCopy className="h-3 w-3" /> Copy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// DIFFERENTIAL DIAGNOSIS HELPER
// ════════════════════════════════════════════════════════════

function DDxHelper() {
  const [symptoms, setSymptoms] = useState("");
  const [ddxList, setDdxList] = useState<string[]>([]);

  const generateDDx = () => {
    if (!symptoms.trim()) { toast.error("Enter symptoms"); return; }
    // Basic keyword-based DDx (real version = AI/database lookup)
    const lower = symptoms.toLowerCase();
    const suggestions: string[] = [];

    if (lower.includes("chest pain")) suggestions.push("Acute Coronary Syndrome", "Costochondritis", "GERD", "Pulmonary Embolism", "Pneumothorax", "Anxiety/Panic Attack");
    if (lower.includes("headache")) suggestions.push("Tension Headache", "Migraine", "Sinusitis", "Hypertensive Crisis", "Meningitis", "Space-Occupying Lesion");
    if (lower.includes("fever")) suggestions.push("Viral Upper Respiratory Infection", "UTI", "Malaria", "Dengue", "Typhoid", "Tuberculosis");
    if (lower.includes("joint pain")) suggestions.push("Osteoarthritis", "Rheumatoid Arthritis", "Gout", "Reactive Arthritis", "SLE", "Fibromyalgia");
    if (lower.includes("cough")) suggestions.push("Viral URTI", "Allergic Bronchitis", "Asthma", "Tuberculosis", "GERD-related cough", "Post-nasal drip");
    if (lower.includes("back pain")) suggestions.push("Lumbar Spondylosis", "Disc Prolapse", "Muscle Strain", "Ankylosing Spondylitis", "Kidney Stone", "Spinal Stenosis");
    if (lower.includes("abdominal pain")) suggestions.push("Gastritis/Peptic Ulcer", "Appendicitis", "IBS", "Gallstones", "Pancreatitis", "Urinary Calculus");

    if (suggestions.length === 0) suggestions.push("Enter common symptoms like 'chest pain', 'headache', 'fever', 'joint pain', 'cough', 'back pain', 'abdominal pain' for quick DDx suggestions.", "[Full AI-powered DDx requires API integration]");

    setDdxList(suggestions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><Stethoscope className="h-4 w-4 text-indigo-500" /> Differential Diagnosis Helper</CardTitle>
        <CardDescription className="text-xs">Enter symptoms → get a quick DDx list to consider. Not a substitute for clinical judgment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Enter key symptoms (e.g. chest pain, fever, joint pain)" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateDDx()} />
        <Button onClick={generateDDx} className="w-full">Generate DDx Suggestions</Button>
        {ddxList.length > 0 && (
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs font-medium mb-2">Consider:</p>
            {ddxList.map((dx, i) => (
              <p key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary font-bold">{i + 1}.</span> {dx}</p>
            ))}
            <p className="text-[10px] text-muted-foreground mt-2 italic">⚠️ This is a thinking aid, not a diagnostic tool. Always apply clinical correlation.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════

const AIClinicalCompanion = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <Bot className="h-7 w-7 text-violet-500" />
          AI Clinical Companion
        </h1>
        <p className="text-muted-foreground">Productivity tools that save you time in daily clinical work</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            These tools use template-based generation now. For full AI power (natural language discharge summaries,
            voice-to-note, advanced DDx), connect an OpenAI/Claude API key in settings.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="discharge" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discharge" className="text-xs gap-1"><FileText className="h-3.5 w-3.5" /> Discharge</TabsTrigger>
          <TabsTrigger value="explain" className="text-xs gap-1"><Heart className="h-3.5 w-3.5" /> Simplifier</TabsTrigger>
          <TabsTrigger value="ddx" className="text-xs gap-1"><Stethoscope className="h-3.5 w-3.5" /> DDx Helper</TabsTrigger>
        </TabsList>
        <TabsContent value="discharge"><DischargeSummaryGenerator /></TabsContent>
        <TabsContent value="explain"><PatientExplainer /></TabsContent>
        <TabsContent value="ddx"><DDxHelper /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AIClinicalCompanion;
