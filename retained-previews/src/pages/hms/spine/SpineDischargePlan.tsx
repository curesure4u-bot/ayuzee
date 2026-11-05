import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, Save, Printer, Plus, Trash2, CheckCircle2,
  Brain, Heart, Activity, Clock, Leaf, Shield, Zap,
  Home, Dumbbell, Pill, Calendar, AlertTriangle,
  Phone, Star, ArrowRight, Copy,
} from "lucide-react";

// ─── Types ───
interface ExerciseItem {
  id: string;
  name: string;
  frequency: string;
  duration: string;
  instructions: string;
  category: string;
}

interface MedicineDischarge {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  specialInstructions: string;
}

interface DietItem {
  id: string;
  item: string;
  type: "include" | "avoid";
  reason: string;
}

interface FollowUpItem {
  id: string;
  date: string;
  purpose: string;
  tests: string;
}

// ─── Helpers ───
const generateId = () => Math.random().toString(36).substr(2, 9);
const today = () => new Date().toISOString().split("T")[0];

// ─── Exercise Library ───
const exerciseLibrary = [
  { name: "Cat-Cow (Marjaryasana-Bitilasana)", frequency: "2×/day", duration: "10 reps", instructions: "On all fours, alternate arching and rounding spine. Breathe in on arch, out on round. Slow and controlled.", category: "Mobility" },
  { name: "Bird-Dog", frequency: "2×/day", duration: "10 reps each side", instructions: "On all fours, extend opposite arm and leg. Hold 5 sec. Keep spine neutral. Don't rotate hips.", category: "Core Stability" },
  { name: "Pelvic Tilts", frequency: "3×/day", duration: "10 reps", instructions: "Lie on back, knees bent. Gently flatten lower back to floor, then release. Small controlled movement.", category: "Core Activation" },
  { name: "Knee-to-Chest Stretch", frequency: "2×/day", duration: "30 sec each side × 3", instructions: "Lie on back, pull one knee to chest gently. Keep other leg straight or bent. Feel stretch in low back/glute.", category: "Flexibility" },
  { name: "Piriformis Stretch (Figure-4)", frequency: "2×/day", duration: "30 sec each side × 3", instructions: "Lie on back, cross ankle over opposite knee. Pull bottom knee toward chest. Feel stretch in deep buttock.", category: "Flexibility" },
  { name: "Chin Tucks", frequency: "Every hour at desk", duration: "10 reps", instructions: "Sit/stand tall. Draw chin straight back (make double chin). Hold 5 sec. Keep eyes level.", category: "Cervical" },
  { name: "Neck Rotations (Greeva Sanchalana)", frequency: "2×/day", duration: "5 each direction", instructions: "Sit tall. Slowly turn head left, hold 5 sec, return center, turn right. Move only to comfortable range.", category: "Cervical" },
  { name: "Wall Angels", frequency: "1×/day", duration: "10 reps", instructions: "Stand with back flat against wall. Arms in goalpost position. Slowly slide arms up and down. Keep contact with wall.", category: "Posture" },
  { name: "Bridge Exercise (Setu Bandhasana)", frequency: "2×/day", duration: "10 reps, hold 5 sec", instructions: "Lie on back, knees bent, feet flat. Lift hips up squeezing glutes. Hold 5 sec. Lower slowly.", category: "Core Stability" },
  { name: "McKenzie Extension (Prone Press-up)", frequency: "Every 2 hours", duration: "10 reps", instructions: "Lie face down. Press upper body up with arms, keep hips on floor. Hold 2 sec. Return. ONLY if extension-biased.", category: "Disc" },
  { name: "Dead Bug", frequency: "1×/day", duration: "10 reps each side", instructions: "Lie on back, arms up, knees at 90°. Lower opposite arm and leg toward floor. Keep lower back pressed to floor.", category: "Core Stability" },
  { name: "Surya Namaskar (Sun Salutation)", frequency: "Morning", duration: "3-5 rounds", instructions: "Full 12-step sequence. Move slowly, coordinate with breath. Modify as needed (skip jump-back if acute).", category: "Full Spine" },
  { name: "BL40 Acupressure (Behind Knees)", frequency: "3×/day", duration: "60 sec each knee", instructions: "Find center of back of knee crease. Press firmly with thumb. Hold 60 sec. Helps sciatica and back pain.", category: "Acupressure" },
  { name: "GB20 Acupressure (Skull Base)", frequency: "3×/day", duration: "60 sec", instructions: "Find hollows at base of skull, either side of spine. Press firmly upward. Helps headache and neck pain.", category: "Acupressure" },
  { name: "Tennis Ball Paraspinal Release", frequency: "1×/day", duration: "5 min", instructions: "Place 2 tennis balls in sock. Lie on them along spine (not ON spine). Roll gently. Avoid bony prominences.", category: "Self-Massage" },
  { name: "Piriformis Ball Release", frequency: "1×/day", duration: "2 min each side", instructions: "Sit on tennis ball on buttock muscle. Cross ankle over knee. Roll slowly on tight spots. Breathe deeply.", category: "Self-Massage" },
  { name: "Thoracic Foam Roller Extension", frequency: "1×/day", duration: "30 sec × 5 positions", instructions: "Lie on foam roller across upper back. Hands behind head. Gently extend backward at each level T4-T10.", category: "Mobility" },
  { name: "Bhramari Pranayama (Humming Bee)", frequency: "Morning + Evening", duration: "5-10 rounds", instructions: "Sit comfortably. Close ears with thumbs. Inhale deeply. Exhale making humming sound. Calms nervous system.", category: "Pranayama" },
  { name: "Anulom Vilom (Alternate Nostril)", frequency: "Morning", duration: "5-10 min", instructions: "Sit tall. Close right nostril, inhale left. Close both, hold. Exhale right. Inhale right. Exhale left. = 1 round.", category: "Pranayama" },
  { name: "Self-Abhyanga (Oil Massage)", frequency: "Morning before bath", duration: "10-15 min", instructions: "Warm sesame/Dhanwantaram oil. Massage whole body with long strokes on limbs, circular on joints. Wait 15 min, then bath.", category: "Ayurvedic Self-Care" },
];

// ─── Medicine Templates ───
const medicineTemplates = [
  { name: "Maharasnadi Kashayam", dosage: "15ml BD", timing: "Before food with equal warm water", duration: "30 days" },
  { name: "Rasnasaptakam Kashayam", dosage: "15ml BD", timing: "Before food with equal warm water", duration: "30 days" },
  { name: "Dhanwantaram Kashayam", dosage: "15ml BD", timing: "Before food with equal warm water", duration: "30 days" },
  { name: "Yogaraja Guggulu", dosage: "2 tabs BD", timing: "After food with warm water", duration: "30 days" },
  { name: "Kaishore Guggulu", dosage: "2 tabs BD", timing: "After food with warm water", duration: "30 days" },
  { name: "Ksheerabala 101 Capsule", dosage: "1 cap BD", timing: "After food", duration: "60 days" },
  { name: "Ashwagandha Churna", dosage: "1 tsp", timing: "Night with warm milk", duration: "60 days" },
  { name: "Eranda Taila", dosage: "10ml", timing: "Bedtime with warm water", duration: "2×/week for 4 weeks" },
  { name: "Mahanarayan Taila", dosage: "QS", timing: "External application before bath", duration: "Daily" },
  { name: "Dhanwantaram Tailam", dosage: "QS", timing: "External self-Abhyanga", duration: "Daily" },
  { name: "Kottamchukkadi Taila", dosage: "QS", timing: "External on affected joint", duration: "Daily" },
  { name: "Anu Taila (Nasya)", dosage: "2-3 drops/nostril", timing: "Morning empty stomach", duration: "Daily for 7 days/month" },
];

// ─── Diet Templates ───
const dietTemplates = {
  include: [
    { item: "Warm water throughout the day", reason: "Reduces Vata, aids digestion" },
    { item: "Ghee (1 tsp with meals)", reason: "Lubricates joints, nourishes Asthi Dhatu" },
    { item: "Milk + Turmeric at bedtime", reason: "Anti-inflammatory, promotes healing" },
    { item: "Soups, stews, warm foods", reason: "Easy to digest, Vata-pacifying" },
    { item: "Sesame seeds / Til", reason: "Calcium rich, strengthens bones" },
    { item: "Green leafy vegetables (cooked)", reason: "Mineral rich, supports Asthi Dhatu" },
    { item: "Dates, raisins, figs", reason: "Natural calcium + iron, energy" },
    { item: "Ginger tea (fresh)", reason: "Anti-inflammatory, improves Agni" },
  ],
  avoid: [
    { item: "Cold food and drinks", reason: "Aggravates Vata, increases stiffness" },
    { item: "Leftover / reheated food", reason: "Increases Ama (toxins)" },
    { item: "Excessive raw salads", reason: "Difficult to digest, Vata-aggravating" },
    { item: "Curd at night", reason: "Increases Kapha, blocks Srotas" },
    { item: "Deep fried / junk food", reason: "Ama-producing, inflammatory" },
    { item: "Excessive caffeine", reason: "Depletes Ojas, disturbs sleep" },
    { item: "Carbonated drinks", reason: "Vata-aggravating, depletes calcium" },
    { item: "Brinjal, potato (excess)", reason: "Vata-aggravating vegetables" },
  ],
};

export default function SpineDischargePlan() {
  // Patient & Treatment Summary
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [condition, setCondition] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [dischargeDate, setDischargeDate] = useState(today());
  const [totalSessions, setTotalSessions] = useState("");
  const [therapiesReceived, setTherapiesReceived] = useState("");
  const [vasAdmission, setVasAdmission] = useState("");
  const [vasDischarge, setVasDischarge] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [doctorName, setDoctorName] = useState("Dr. Mohamad Saleem");

  // Home Plan
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineDischarge[]>([]);
  const [dietInclude, setDietInclude] = useState<DietItem[]>([]);
  const [dietAvoid, setDietAvoid] = useState<DietItem[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [lifestyleAdvice, setLifestyleAdvice] = useState("");
  const [warningSignsCustom, setWarningSignsCustom] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // UI state
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showMedicinePicker, setShowMedicinePicker] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState("");
  const [saving, setSaving] = useState(false);

  // Add exercise
  const addExercise = (ex: typeof exerciseLibrary[0]) => {
    setExercises(prev => [...prev, { id: generateId(), ...ex }]);
    setShowExercisePicker(false);
  };

  const removeExercise = (id: string) => setExercises(prev => prev.filter(e => e.id !== id));

  // Add medicine
  const addMedicine = (med: typeof medicineTemplates[0]) => {
    setMedicines(prev => [...prev, { id: generateId(), ...med, specialInstructions: "" }]);
    setShowMedicinePicker(false);
  };

  const removeMedicine = (id: string) => setMedicines(prev => prev.filter(m => m.id !== id));

  // Diet
  const addDietInclude = (item: typeof dietTemplates.include[0]) => {
    setDietInclude(prev => [...prev, { id: generateId(), ...item, type: "include" }]);
  };

  const addDietAvoid = (item: typeof dietTemplates.avoid[0]) => {
    setDietAvoid(prev => [...prev, { id: generateId(), ...item, type: "avoid" }]);
  };

  // Follow-up
  const addFollowUp = () => {
    setFollowUps(prev => [...prev, { id: generateId(), date: "", purpose: "", tests: "" }]);
  };

  const removeFollowUp = (id: string) => setFollowUps(prev => prev.filter(f => f.id !== id));

  const updateFollowUp = (id: string, updates: Partial<FollowUpItem>) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Load condition-specific home plan
  const loadConditionPlan = (cond: string) => {
    setCondition(cond);
    // Auto-add relevant exercises based on condition
    const exerciseSets: Record<string, string[]> = {
      sciatica: ["Cat-Cow (Marjaryasana-Bitilasana)", "Piriformis Stretch (Figure-4)", "Bird-Dog", "BL40 Acupressure (Behind Knees)", "Piriformis Ball Release", "Pelvic Tilts"],
      cervical: ["Chin Tucks", "Neck Rotations (Greeva Sanchalana)", "Wall Angels", "GB20 Acupressure (Skull Base)", "Bhramari Pranayama (Humming Bee)"],
      lbp: ["Cat-Cow (Marjaryasana-Bitilasana)", "Pelvic Tilts", "Bridge Exercise (Setu Bandhasana)", "Bird-Dog", "Tennis Ball Paraspinal Release", "Dead Bug"],
      disc: ["McKenzie Extension (Prone Press-up)", "Bird-Dog", "Pelvic Tilts", "BL40 Acupressure (Behind Knees)", "Cat-Cow (Marjaryasana-Bitilasana)"],
      frozen: ["Wall Angels", "Chin Tucks", "Neck Rotations (Greeva Sanchalana)", "Self-Abhyanga (Oil Massage)"],
      stiffness: ["Surya Namaskar (Sun Salutation)", "Cat-Cow (Marjaryasana-Bitilasana)", "Self-Abhyanga (Oil Massage)", "Thoracic Foam Roller Extension", "Anulom Vilom (Alternate Nostril)"],
    };

    const selected = exerciseSets[cond] || exerciseSets["lbp"];
    const newExercises = selected.map(name => {
      const lib = exerciseLibrary.find(e => e.name === name);
      return lib ? { id: generateId(), ...lib } : null;
    }).filter(Boolean) as ExerciseItem[];

    setExercises(newExercises);

    // Auto-add diet
    setDietInclude(dietTemplates.include.slice(0, 5).map(d => ({ id: generateId(), ...d, type: "include" as const })));
    setDietAvoid(dietTemplates.avoid.slice(0, 5).map(d => ({ id: generateId(), ...d, type: "avoid" as const })));

    toast.success(`Home plan loaded for ${cond}`);
  };

  // Generate printable text
  const generatePrintText = () => {
    const painReduction = vasAdmission && vasDischarge
      ? Math.round(((parseInt(vasAdmission) - parseInt(vasDischarge)) / parseInt(vasAdmission)) * 100)
      : null;

    return `
════════════════════════════════════════════════════════════════
         AYUZEE SPINE CLINIC — DISCHARGE SUMMARY
              & HOME CARE PLAN
════════════════════════════════════════════════════════════════

PATIENT INFORMATION
───────────────────
Name: ${patientName}
Age/Gender: ${patientAge} / ${patientGender}
Contact: ${patientPhone}
Condition: ${condition}
Admission Date: ${admissionDate}
Discharge Date: ${dischargeDate}
Doctor: ${doctorName}

TREATMENT SUMMARY
───────────────────
Total Sessions: ${totalSessions}
Therapies Received: ${therapiesReceived}
VAS Score: ${vasAdmission}/10 → ${vasDischarge}/10 ${painReduction ? `(${painReduction}% improvement)` : ""}
Outcome: ${outcomeNotes}

════════════════════════════════════════════════════════════════
         HOME EXERCISE PLAN
════════════════════════════════════════════════════════════════

${exercises.map((ex, i) => `${i + 1}. ${ex.name}
   Frequency: ${ex.frequency} | Duration: ${ex.duration}
   How to do: ${ex.instructions}
`).join("\n")}

════════════════════════════════════════════════════════════════
         MEDICINES TO CONTINUE
════════════════════════════════════════════════════════════════

${medicines.map((m, i) => `${i + 1}. ${m.name}
   Dose: ${m.dosage} | Timing: ${m.timing} | Duration: ${m.duration}
   ${m.specialInstructions ? `Note: ${m.specialInstructions}` : ""}
`).join("\n")}

════════════════════════════════════════════════════════════════
         DIET PLAN (Pathya-Apathya)
════════════════════════════════════════════════════════════════

✅ FOODS TO INCLUDE:
${dietInclude.map(d => `   • ${d.item} — ${d.reason}`).join("\n")}

❌ FOODS TO AVOID:
${dietAvoid.map(d => `   • ${d.item} — ${d.reason}`).join("\n")}

════════════════════════════════════════════════════════════════
         LIFESTYLE ADVICE
════════════════════════════════════════════════════════════════

${lifestyleAdvice || "• Avoid prolonged sitting >30 min\n• Sleep on firm mattress\n• Use proper pillow height\n• Avoid heavy lifting\n• Practice exercises daily without fail"}

════════════════════════════════════════════════════════════════
         FOLLOW-UP SCHEDULE
════════════════════════════════════════════════════════════════

${followUps.map((f, i) => `${i + 1}. ${f.date} — ${f.purpose}${f.tests ? ` (Tests: ${f.tests})` : ""}`).join("\n")}

════════════════════════════════════════════════════════════════
         WARNING SIGNS — CONTACT IMMEDIATELY IF:
════════════════════════════════════════════════════════════════

• Sudden severe pain increase (VAS jumps to 8-10)
• Numbness/weakness in legs spreading rapidly
• Bladder or bowel dysfunction (inability to pass/control urine)
• Fever with back pain
• Night pain that wakes from sleep
${warningSignsCustom ? warningSignsCustom : ""}

────────────────────────────────────────────────────────────────
Clinic Contact: Call/WhatsApp for any concerns
Doctor: ${doctorName}
Discharge Date: ${dischargeDate}
Next Visit: ${followUps[0]?.date || "As advised"}

"Your spine healed with treatment. Now maintain it with daily practice."
────────────────────────────────────────────────────────────────
    `.trim();
  };

  // Copy to clipboard
  const handleCopy = () => {
    const text = generatePrintText();
    navigator.clipboard.writeText(text);
    toast.success("Discharge plan copied to clipboard!");
  };

  // Save
  const handleSave = async () => {
    if (!patientName) { toast.error("Enter patient name"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const { error } = await supabase.from("spine_therapy_sessions").insert({
        patient_id: user.id,
        doctor_id: user.id,
        session_number: 0,
        therapy_name: `Discharge Plan: ${condition || "Spine"}`,
        duration_minutes: 0,
        status: "discharged",
        pain_before: vasAdmission ? parseInt(vasAdmission) : null,
        pain_after: vasDischarge ? parseInt(vasDischarge) : null,
        doctor_notes: JSON.stringify({
          type: "discharge_plan",
          patientName, patientAge, patientGender, patientPhone,
          condition, admissionDate, dischargeDate, totalSessions,
          therapiesReceived, vasAdmission, vasDischarge, outcomeNotes,
          exercises, medicines, dietInclude, dietAvoid,
          followUps, lifestyleAdvice, warningSignsCustom,
          additionalNotes, doctorName,
          generatedAt: new Date().toISOString(),
        }),
      });

      if (error) {
        toast.error("Save failed: " + error.message);
      } else {
        toast.success("Discharge plan saved!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const painReduction = vasAdmission && vasDischarge && parseInt(vasAdmission) > 0
    ? Math.round(((parseInt(vasAdmission) - parseInt(vasDischarge)) / parseInt(vasAdmission)) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600" />
            Discharge & Home Plan Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate patient discharge summary with home exercises, medicines, diet & follow-up plan
          </p>
        </div>
        <Badge className="bg-teal-100 text-teal-700">
          <Brain className="h-3 w-3 mr-1" /> Tool #5 of 5
        </Badge>
      </div>

      {/* Patient & Treatment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Patient Name</label>
                <Input placeholder="Full name" value={patientName} onChange={e => setPatientName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Age</label>
                  <Input placeholder="45" value={patientAge} onChange={e => setPatientAge(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium">Gender</label>
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Phone / WhatsApp</label>
                <Input placeholder="+91 9876543210" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">Condition</label>
                <Select value={condition} onValueChange={loadConditionPlan}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sciatica">Gridhrasi (Sciatica)</SelectItem>
                    <SelectItem value="cervical">Cervical Spondylosis</SelectItem>
                    <SelectItem value="lbp">Chronic Low Back Pain</SelectItem>
                    <SelectItem value="disc">Disc Herniation</SelectItem>
                    <SelectItem value="frozen">Frozen Shoulder</SelectItem>
                    <SelectItem value="stiffness">Morning Stiffness</SelectItem>
                    <SelectItem value="si">SI Joint Dysfunction</SelectItem>
                    <SelectItem value="thoracic">Upper Back Pain</SelectItem>
                    <SelectItem value="headache">Cervicogenic Headache</SelectItem>
                    <SelectItem value="knee">Knee Pain (Postural)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Doctor Name</label>
              <Input value={doctorName} onChange={e => setDoctorName(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Treatment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Admission Date</label>
                <Input type="date" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">Discharge Date</label>
                <Input type="date" value={dischargeDate} onChange={e => setDischargeDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium">Total Sessions</label>
                <Input placeholder="14" value={totalSessions} onChange={e => setTotalSessions(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">VAS (Admit)</label>
                <Input type="number" min="0" max="10" placeholder="7" value={vasAdmission} onChange={e => setVasAdmission(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">VAS (Discharge)</label>
                <Input type="number" min="0" max="10" placeholder="2" value={vasDischarge} onChange={e => setVasDischarge(e.target.value)} />
              </div>
            </div>
            {painReduction !== null && (
              <div className="p-2 rounded bg-green-50 border border-green-200 text-center">
                <p className="text-xs text-green-700 font-medium">Pain Reduction: <span className="text-lg font-bold">{painReduction}%</span></p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium">Therapies Received</label>
              <Input placeholder="e.g. Kati Basti × 7, Agnikarma × 3, Acupuncture × 6" value={therapiesReceived} onChange={e => setTherapiesReceived(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Outcome Notes</label>
              <Textarea placeholder="Patient improved significantly..." className="h-14 text-xs" value={outcomeNotes} onChange={e => setOutcomeNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Home Exercise Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-600" /> Home Exercise Plan ({exercises.length})
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowExercisePicker(!showExercisePicker)}>
              <Plus className="h-3 w-3" /> Add Exercise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showExercisePicker && (
            <div className="border rounded p-2 mb-3 bg-muted/30 max-h-52 overflow-y-auto">
              <Input placeholder="Filter exercises..." value={exerciseFilter} onChange={e => setExerciseFilter(e.target.value)} className="mb-2 h-7 text-xs" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {exerciseLibrary
                  .filter(e => e.name.toLowerCase().includes(exerciseFilter.toLowerCase()) || e.category.toLowerCase().includes(exerciseFilter.toLowerCase()))
                  .map(ex => (
                    <button
                      key={ex.name}
                      onClick={() => addExercise(ex)}
                      className="text-left p-2 rounded text-xs hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                    >
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-muted-foreground block text-[9px]">{ex.category} · {ex.frequency} · {ex.duration}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Select a condition above to auto-load exercises, or add manually</p>
          ) : (
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={ex.id} className="p-2 rounded border bg-blue-50/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{i + 1}</Badge>
                      <span className="font-medium">{ex.name}</span>
                      <Badge className="bg-blue-100 text-blue-700 text-[9px]">{ex.category}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeExercise(ex.id)}>
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                  <div className="ml-7 mt-1 text-muted-foreground">
                    <span className="font-medium text-foreground">{ex.frequency}</span> · {ex.duration}
                  </div>
                  <p className="ml-7 mt-0.5 text-[10px] text-muted-foreground italic">{ex.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4 text-green-600" /> Medicines to Continue ({medicines.length})
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowMedicinePicker(!showMedicinePicker)}>
              <Plus className="h-3 w-3" /> Add Medicine
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showMedicinePicker && (
            <div className="border rounded p-2 mb-3 bg-muted/30 max-h-44 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {medicineTemplates.map(m => (
                  <button
                    key={m.name}
                    onClick={() => addMedicine(m)}
                    className="text-left p-1.5 rounded text-xs hover:bg-green-50 border border-transparent hover:border-green-200 transition"
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="text-muted-foreground block text-[9px]">{m.dosage} · {m.timing}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {medicines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No medicines added yet</p>
          ) : (
            <div className="space-y-1">
              {medicines.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded border text-xs">
                  <Leaf className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="font-medium">{m.name}</span>
                  <Badge variant="outline" className="text-[9px]">{m.dosage}</Badge>
                  <span className="text-muted-foreground">{m.timing}</span>
                  <span className="text-muted-foreground">· {m.duration}</span>
                  <Button variant="ghost" size="sm" className="ml-auto h-5 w-5 p-0" onClick={() => removeMedicine(m.id)}>
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diet Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Foods to Include ({dietInclude.length})
              </CardTitle>
              <Select onValueChange={v => {
                const item = dietTemplates.include.find(d => d.item === v);
                if (item) addDietInclude(item);
              }}>
                <SelectTrigger className="w-[130px] h-7 text-[10px]"><SelectValue placeholder="+ Add food" /></SelectTrigger>
                <SelectContent>
                  {dietTemplates.include.map(d => (
                    <SelectItem key={d.item} value={d.item} className="text-xs">{d.item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {dietInclude.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No items added</p>
            ) : (
              <div className="space-y-1">
                {dietInclude.map(d => (
                  <div key={d.id} className="flex items-center gap-1 p-1.5 rounded bg-green-50/50 border border-green-100 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                    <span className="font-medium">{d.item}</span>
                    <span className="text-muted-foreground ml-auto">{d.reason}</span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setDietInclude(prev => prev.filter(x => x.id !== d.id))}>
                      <Trash2 className="h-2.5 w-2.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Foods to Avoid ({dietAvoid.length})
              </CardTitle>
              <Select onValueChange={v => {
                const item = dietTemplates.avoid.find(d => d.item === v);
                if (item) addDietAvoid(item);
              }}>
                <SelectTrigger className="w-[130px] h-7 text-[10px]"><SelectValue placeholder="+ Add food" /></SelectTrigger>
                <SelectContent>
                  {dietTemplates.avoid.map(d => (
                    <SelectItem key={d.item} value={d.item} className="text-xs">{d.item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {dietAvoid.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No items added</p>
            ) : (
              <div className="space-y-1">
                {dietAvoid.map(d => (
                  <div key={d.id} className="flex items-center gap-1 p-1.5 rounded bg-red-50/50 border border-red-100 text-[10px]">
                    <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                    <span className="font-medium">{d.item}</span>
                    <span className="text-muted-foreground ml-auto">{d.reason}</span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setDietAvoid(prev => prev.filter(x => x.id !== d.id))}>
                      <Trash2 className="h-2.5 w-2.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lifestyle & Follow-up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <Home className="h-3.5 w-3.5" /> Lifestyle Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="• Avoid prolonged sitting >30 min&#10;• Sleep on firm mattress&#10;• Use proper pillow height&#10;• Avoid heavy lifting&#10;• Practice exercises daily without fail&#10;• Walk 20-30 min daily"
              className="h-28 text-xs"
              value={lifestyleAdvice}
              onChange={e => setLifestyleAdvice(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Follow-Up Schedule ({followUps.length})
              </CardTitle>
              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={addFollowUp}>
                <Plus className="h-2.5 w-2.5" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {followUps.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No follow-ups scheduled</p>
            ) : (
              followUps.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[9px] shrink-0">{i + 1}</Badge>
                  <Input type="date" className="h-7 w-[120px] text-xs" value={f.date} onChange={e => updateFollowUp(f.id, { date: e.target.value })} />
                  <Input placeholder="Purpose" className="h-7 text-xs flex-1" value={f.purpose} onChange={e => updateFollowUp(f.id, { purpose: e.target.value })} />
                  <Input placeholder="Tests" className="h-7 text-xs w-[100px]" value={f.tests} onChange={e => updateFollowUp(f.id, { tests: e.target.value })} />
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeFollowUp(f.id)}>
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning Signs + Additional Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-red-500" /> Red Flag Warning Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 mb-2 text-xs">
              <div className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" /> Sudden severe pain increase (VAS 8-10)</div>
              <div className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" /> Numbness/weakness spreading rapidly</div>
              <div className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" /> Bladder/bowel dysfunction</div>
              <div className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" /> Fever with back pain</div>
              <div className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" /> Night pain waking from sleep</div>
            </div>
            <Textarea
              placeholder="Add any custom warning signs..."
              className="h-12 text-xs"
              value={warningSignsCustom}
              onChange={e => setWarningSignsCustom(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional instructions, next phase treatment plan, referrals..."
              className="h-28 text-xs"
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Summary */}
      {patientName && condition && (
        <Card className="border-teal-200 bg-teal-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" /> Discharge Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-blue-600">{exercises.length}</p>
                <p className="text-[9px] text-muted-foreground">Exercises</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-green-600">{medicines.length}</p>
                <p className="text-[9px] text-muted-foreground">Medicines</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-amber-600">{dietInclude.length + dietAvoid.length}</p>
                <p className="text-[9px] text-muted-foreground">Diet Items</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-purple-600">{followUps.length}</p>
                <p className="text-[9px] text-muted-foreground">Follow-ups</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className={`text-lg font-bold ${painReduction && painReduction >= 50 ? "text-green-600" : "text-orange-600"}`}>
                  {painReduction !== null ? `${painReduction}%` : "—"}
                </p>
                <p className="text-[9px] text-muted-foreground">Pain Reduction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => {
          setPatientName(""); setPatientAge(""); setPatientGender(""); setPatientPhone("");
          setCondition(""); setAdmissionDate(""); setDischargeDate(today());
          setTotalSessions(""); setTherapiesReceived(""); setVasAdmission(""); setVasDischarge("");
          setOutcomeNotes(""); setExercises([]); setMedicines([]);
          setDietInclude([]); setDietAvoid([]); setFollowUps([]);
          setLifestyleAdvice(""); setWarningSignsCustom(""); setAdditionalNotes("");
          toast.info("Form cleared");
        }}>
          Clear All
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleCopy}>
            <Copy className="h-3 w-3" /> Copy Plan
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            const text = generatePrintText();
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Discharge_Plan_${patientName.replace(/\s+/g, "_") || "Patient"}_${dischargeDate}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Discharge plan downloaded!");
          }}>
            <Printer className="h-3 w-3" /> Download .txt
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
