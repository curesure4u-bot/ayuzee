import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ClipboardList, Plus, Trash2, Save, FileText, Printer,
  Activity, Target, Heart, Brain, Zap, Clock, CheckCircle2,
  ArrowRight, ArrowDown, Star, Shield, Leaf, Users,
  ChevronDown, ChevronUp, GripVertical,
} from "lucide-react";

// ─── Types ───
interface ProtocolPhase {
  id: string;
  name: string;
  duration: string;
  therapies: TherapyItem[];
  goals: string[];
  frequency: string;
  notes: string;
}

interface TherapyItem {
  id: string;
  name: string;
  type: string;
  duration: string;
  frequency: string;
  notes: string;
}

interface ProtocolData {
  patientName: string;
  patientAge: string;
  patientGender: string;
  condition: string;
  subCondition: string;
  severity: string;
  dosha: string;
  spinalLevel: string;
  chronicity: string;
  painScore: string;
  comorbidities: string;
  contraindications: string;
  phases: ProtocolPhase[];
  medicines: MedicineItem[];
  selfCareInstructions: string[];
  followUpSchedule: string;
  totalDuration: string;
  estimatedCost: string;
  expectedOutcome: string;
  doctorNotes: string;
}

interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  route: string;
}

// ─── Static Data ───
const conditions = [
  { id: "sciatica", name: "Gridhrasi (Sciatica)", levels: "L4-S1" },
  { id: "cervical", name: "Greeva Stambha (Cervical Spondylosis)", levels: "C4-C7" },
  { id: "lbp", name: "Kati Shoola (Chronic Low Back Pain)", levels: "L1-L5" },
  { id: "disc", name: "Disc Herniation / Bulge", levels: "L4-L5 / L5-S1" },
  { id: "frozen", name: "Avabahuka (Frozen Shoulder)", levels: "C5-T2" },
  { id: "headache", name: "Cervicogenic Headache", levels: "C1-C3" },
  { id: "knee", name: "Knee Pain (Postural Origin)", levels: "L3-L4" },
  { id: "stiffness", name: "Morning Stiffness (Full Spine)", levels: "Full" },
  { id: "thoracic", name: "Upper Back / Inter-Scapular Pain", levels: "T4-T8" },
  { id: "si", name: "SI Joint Dysfunction", levels: "L5-S1, SI" },
  { id: "ankylosing", name: "Ankylosing Spondylitis", levels: "Full Spine + SI" },
  { id: "scoliosis", name: "Scoliosis / Postural Deviation", levels: "Variable" },
];

const doshaOptions = ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Vata-Kapha", "Pitta-Kapha", "Tridosha"];

const therapyLibrary = [
  // Level 1 Quick therapies
  { name: "Agnikarma", type: "Level 1", defaultDuration: "15 min" },
  { name: "Viddha Karma", type: "Level 1", defaultDuration: "10 min" },
  { name: "Marma Therapy", type: "Level 1", defaultDuration: "30 min" },
  { name: "Doctor's Manual Therapy", type: "Level 1", defaultDuration: "20 min" },
  { name: "Hijama / Cupping", type: "Level 1", defaultDuration: "30 min" },
  { name: "Trigger Point Therapy", type: "Level 1", defaultDuration: "20 min" },
  { name: "Varma Therapy (Siddha)", type: "Level 1", defaultDuration: "20 min" },
  { name: "Mudra Therapy", type: "Level 1", defaultDuration: "15 min" },
  // Level 2 Panchakarma
  { name: "Kati Basti", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Greeva Basti", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Prishtha Basti", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Tikta Ksheer Basti", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Patra Pinda Sweda", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Choorna Pinda Sweda", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Nasya", type: "Level 2 (PK)", defaultDuration: "30 min" },
  { name: "Shirodhara", type: "Level 2 (PK)", defaultDuration: "45 min" },
  { name: "Pizhichil", type: "Level 2 (PK)", defaultDuration: "60 min" },
  { name: "Abhyanga + Swedana", type: "Level 2 (PK)", defaultDuration: "60 min" },
  { name: "Upanaha Sweda (Overnight Poultice)", type: "Level 2 (PK)", defaultDuration: "Overnight" },
  { name: "Meru Chikitsa (Spine Mobilization)", type: "Level 2 (PK)", defaultDuration: "30 min" },
  // Integrative Therapies
  { name: "Acupuncture", type: "Integrative", defaultDuration: "30 min" },
  { name: "Electroacupuncture", type: "Integrative", defaultDuration: "30 min" },
  { name: "Dry Needling", type: "Integrative", defaultDuration: "20 min" },
  { name: "Moxibustion", type: "Integrative", defaultDuration: "20 min" },
  { name: "Ear Acupuncture / Seeds", type: "Integrative", defaultDuration: "15 min" },
  { name: "Shiatsu", type: "Integrative", defaultDuration: "45 min" },
  { name: "Thai Massage", type: "Integrative", defaultDuration: "60 min" },
  { name: "Reflexology", type: "Integrative", defaultDuration: "30 min" },
  { name: "MET (Muscle Energy Technique)", type: "Integrative", defaultDuration: "20 min" },
  { name: "Sujok Therapy", type: "Integrative", defaultDuration: "15 min" },
  // Yoga / Exercise
  { name: "Spine Yoga Therapy", type: "Yoga/Exercise", defaultDuration: "45 min" },
  { name: "Corrective Exercise Protocol", type: "Yoga/Exercise", defaultDuration: "30 min" },
  { name: "Pranayama + Meditation", type: "Yoga/Exercise", defaultDuration: "20 min" },
  { name: "McKenzie Protocol", type: "Yoga/Exercise", defaultDuration: "15 min" },
];

const medicineLibrary = [
  { name: "Maharasnadi Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Rasnasaptakam Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Dhanwantaram Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Guggulu Tiktakam Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Pathyadi Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Guduchyadi Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Rasnaerandadi Kashayam", dosage: "15ml BD", timing: "Before food", route: "Oral" },
  { name: "Yogaraja Guggulu", dosage: "2 tabs BD", timing: "After food", route: "Oral" },
  { name: "Kaishore Guggulu", dosage: "2 tabs BD", timing: "After food", route: "Oral" },
  { name: "Laksha Guggulu", dosage: "2 tabs BD", timing: "After food", route: "Oral" },
  { name: "Trayodashang Guggulu", dosage: "2 tabs BD", timing: "After food", route: "Oral" },
  { name: "Ekangaveer Ras", dosage: "1 tab BD", timing: "After food", route: "Oral" },
  { name: "Shirashooladi Vajra Ras", dosage: "1 tab BD", timing: "After food", route: "Oral" },
  { name: "Ksheerabala 101 Avarti Capsule", dosage: "1 cap BD", timing: "After food", route: "Oral" },
  { name: "Ashwagandha Churna", dosage: "1 tsp", timing: "Night with milk", route: "Oral" },
  { name: "Eranda Taila", dosage: "10ml", timing: "Bedtime", route: "Oral" },
  { name: "Brahmi Ghrita", dosage: "1 tsp", timing: "Bedtime", route: "Oral" },
  { name: "Mahanarayan Taila", dosage: "QS", timing: "External", route: "External" },
  { name: "Dhanwantaram Tailam", dosage: "QS", timing: "External Abhyanga", route: "External" },
  { name: "Ksheerabala Taila", dosage: "QS", timing: "External / Basti", route: "External" },
  { name: "Sahacharadi Taila", dosage: "QS", timing: "External", route: "External" },
  { name: "Kottamchukkadi Taila", dosage: "QS", timing: "External", route: "External" },
  { name: "Pinda Taila", dosage: "QS", timing: "External (cooling)", route: "External" },
  { name: "Mahamasha Taila", dosage: "QS", timing: "External cervical", route: "External" },
  { name: "Anu Taila", dosage: "6 drops/nostril", timing: "Morning Nasya", route: "Nasal" },
];

const protocolTemplates: Record<string, Partial<ProtocolData> & { phases: ProtocolPhase[]; medicines: MedicineItem[]; selfCareInstructions: string[] }> = {
  sciatica: {
    dosha: "Vata",
    spinalLevel: "L4-S1",
    totalDuration: "6-8 weeks",
    expectedOutcome: "60-80% pain reduction, restored mobility, nerve recovery",
    phases: [
      {
        id: "p1", name: "Phase 1: Acute Relief", duration: "Week 1-2", frequency: "Daily",
        therapies: [
          { id: "t1", name: "Agnikarma", type: "Level 1", duration: "15 min", frequency: "3 sessions/week", notes: "Gluteal trigger points" },
          { id: "t2", name: "Trigger Point Therapy", type: "Level 1", duration: "20 min", frequency: "Alternate days", notes: "Piriformis + QL" },
          { id: "t3", name: "Kati Basti", type: "Level 2 (PK)", duration: "45 min", frequency: "Daily × 7", notes: "Dhanwantaram Taila @ 42°C" },
        ],
        goals: ["VAS reduction from 7-8 to 4-5", "Reduce acute inflammation", "Improve SLR by 20°"],
        notes: "Start with Level 1 for immediate relief, add Kati Basti from Day 3",
      },
      {
        id: "p2", name: "Phase 2: Deep Treatment", duration: "Week 3-5", frequency: "Daily/Alternate",
        therapies: [
          { id: "t4", name: "Tikta Ksheer Basti", type: "Level 2 (PK)", duration: "45 min", frequency: "16-day schedule", notes: "Alternating Anuvasana/Niruha" },
          { id: "t5", name: "Patra Pinda Sweda", type: "Level 2 (PK)", duration: "45 min", frequency: "Daily × 7", notes: "Before Basti" },
          { id: "t6", name: "Acupuncture", type: "Integrative", duration: "30 min", frequency: "2×/week", notes: "BL40 + BL60 + Huatuojiaji L4-S1" },
        ],
        goals: ["VAS reduction to 2-3", "Nerve recovery (reduced numbness)", "Core stability activation"],
        notes: "Main Panchakarma phase — Basti is primary treatment for Gridhrasi",
      },
      {
        id: "p3", name: "Phase 3: Rehabilitation & Prevention", duration: "Week 6-8", frequency: "2-3×/week",
        therapies: [
          { id: "t7", name: "Spine Yoga Therapy", type: "Yoga/Exercise", duration: "45 min", frequency: "Daily", notes: "Cat-cow, bird-dog, core activation" },
          { id: "t8", name: "Corrective Exercise Protocol", type: "Yoga/Exercise", duration: "30 min", frequency: "3×/week", notes: "Lower cross syndrome correction" },
          { id: "t9", name: "Marma Therapy", type: "Level 1", duration: "30 min", frequency: "Weekly maintenance", notes: "Kukundara + Katikataruna" },
        ],
        goals: ["VAS 0-1 (pain-free)", "Full functional recovery", "Prevention protocol established"],
        notes: "Transition to self-maintenance; patient empowerment phase",
      },
    ],
    medicines: [
      { id: "m1", name: "Maharasnadi Kashayam", dosage: "15ml BD", timing: "Before food", duration: "6 weeks", route: "Oral" },
      { id: "m2", name: "Yogaraja Guggulu", dosage: "2 tabs BD", timing: "After food", duration: "6 weeks", route: "Oral" },
      { id: "m3", name: "Ksheerabala 101 Avarti Capsule", dosage: "1 cap BD", timing: "After food", duration: "8 weeks", route: "Oral" },
      { id: "m4", name: "Dhanwantaram Tailam", dosage: "QS", timing: "External Abhyanga", duration: "Daily", route: "External" },
    ],
    selfCareInstructions: [
      "BL40 acupressure 3×/day (60 sec each knee)",
      "Piriformis ball release (2 min each side)",
      "Cat-cow 10 reps morning + evening",
      "Avoid prolonged sitting >30 min without break",
      "Sleep with pillow between knees (side-lying)",
      "No forward bending with straight legs",
    ],
    followUpSchedule: "Day 3 → Day 7 → Day 14 → Day 28 → Day 56",
  },
  cervical: {
    dosha: "Vata-Pitta",
    spinalLevel: "C4-C7",
    totalDuration: "4-6 weeks",
    expectedOutcome: "70-85% pain reduction, restored ROM, nerve function recovery",
    phases: [
      {
        id: "p1", name: "Phase 1: Pain Relief + Decompression", duration: "Week 1-2", frequency: "Daily",
        therapies: [
          { id: "t1", name: "Marma Therapy", type: "Level 1", duration: "30 min", frequency: "Daily", notes: "Krikatika + Amsa points" },
          { id: "t2", name: "Doctor's Manual Therapy", type: "Level 1", duration: "20 min", frequency: "Alternate days", notes: "Gentle cervical traction" },
          { id: "t3", name: "Greeva Basti", type: "Level 2 (PK)", duration: "45 min", frequency: "Daily × 7", notes: "Ksheerabala Taila @ 40°C" },
          { id: "t4", name: "Nasya", type: "Level 2 (PK)", duration: "30 min", frequency: "Daily × 7", notes: "Anu Taila 6 drops/nostril" },
        ],
        goals: ["VAS reduction 7→4", "Reduce muscle spasm", "Restore 50% ROM"],
        notes: "Nasya is critical for cervical — Prana Vayu access via nasal route",
      },
      {
        id: "p2", name: "Phase 2: Nerve Recovery + Strengthening", duration: "Week 3-4", frequency: "Daily/Alternate",
        therapies: [
          { id: "t5", name: "Acupuncture", type: "Integrative", duration: "30 min", frequency: "2×/week", notes: "GB20 + GB21 + Huatuojiaji C4-C7" },
          { id: "t6", name: "Shirodhara", type: "Level 2 (PK)", duration: "45 min", frequency: "5 sessions", notes: "If stress component present" },
          { id: "t7", name: "MET (Muscle Energy Technique)", type: "Integrative", duration: "20 min", frequency: "3×/week", notes: "Cervical rotation + lateral flexion" },
        ],
        goals: ["VAS 2-3", "Arm numbness resolved", "Neck ROM 80%+ of normal"],
        notes: "Address Upper Cross Syndrome posture pattern in parallel",
      },
      {
        id: "p3", name: "Phase 3: Posture Correction + Maintenance", duration: "Week 5-6", frequency: "2-3×/week",
        therapies: [
          { id: "t8", name: "Corrective Exercise Protocol", type: "Yoga/Exercise", duration: "30 min", frequency: "Daily", notes: "Chin tucks, deep neck flexor activation" },
          { id: "t9", name: "Pranayama + Meditation", type: "Yoga/Exercise", duration: "20 min", frequency: "Daily", notes: "Bhramari + neck breathing" },
        ],
        goals: ["Pain-free", "Forward head posture corrected", "Self-management established"],
        notes: "Ergonomic advice mandatory for desk workers",
      },
    ],
    medicines: [
      { id: "m1", name: "Dhanwantaram Kashayam", dosage: "15ml BD", timing: "Before food", duration: "4 weeks", route: "Oral" },
      { id: "m2", name: "Ekangaveer Ras", dosage: "1 tab BD", timing: "After food", duration: "4 weeks", route: "Oral" },
      { id: "m3", name: "Ashwagandha Churna", dosage: "1 tsp", timing: "Night with milk", duration: "6 weeks", route: "Oral" },
      { id: "m4", name: "Mahamasha Taila", dosage: "QS", timing: "External cervical", duration: "Daily", route: "External" },
      { id: "m5", name: "Anu Taila", dosage: "6 drops/nostril", timing: "Morning Nasya", duration: "7 days", route: "Nasal" },
    ],
    selfCareInstructions: [
      "GB20 self-press 3×/day (skull base, 60 sec)",
      "Chin tucks × 10 every hour at desk",
      "Greeva Sanchalana (slow neck rotations × 5 each direction)",
      "Hot towel on neck before bed (5 min)",
      "Avoid looking down at phone >10 min continuously",
      "Proper pillow height — neck neutral alignment",
    ],
    followUpSchedule: "Day 1 → Day 3 → Day 7 → Day 14 → Day 28 → Day 42",
  },
};

// ─── Helper ───
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function SpineTreatmentProtocolBuilder() {
  const [protocol, setProtocol] = useState<ProtocolData>({
    patientName: "",
    patientAge: "",
    patientGender: "",
    condition: "",
    subCondition: "",
    severity: "",
    dosha: "",
    spinalLevel: "",
    chronicity: "",
    painScore: "",
    comorbidities: "",
    contraindications: "",
    phases: [],
    medicines: [],
    selfCareInstructions: [],
    followUpSchedule: "",
    totalDuration: "",
    estimatedCost: "",
    expectedOutcome: "",
    doctorNotes: "",
  });

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showTherapyPicker, setShowTherapyPicker] = useState<string | null>(null);
  const [showMedicinePicker, setShowMedicinePicker] = useState(false);
  const [newSelfCare, setNewSelfCare] = useState("");
  const [therapyFilter, setTherapyFilter] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("");

  // Load template based on condition
  const loadTemplate = (conditionId: string) => {
    const template = protocolTemplates[conditionId];
    if (template) {
      setProtocol(prev => ({
        ...prev,
        condition: conditionId,
        dosha: template.dosha || prev.dosha,
        spinalLevel: template.spinalLevel || prev.spinalLevel,
        totalDuration: template.totalDuration || prev.totalDuration,
        expectedOutcome: template.expectedOutcome || prev.expectedOutcome,
        phases: template.phases || [],
        medicines: template.medicines || [],
        selfCareInstructions: template.selfCareInstructions || [],
        followUpSchedule: template.followUpSchedule || prev.followUpSchedule,
      }));
      setExpandedPhases(new Set(template.phases?.map(p => p.id) || []));
      toast.success(`Template loaded: ${conditions.find(c => c.id === conditionId)?.name}`);
    } else {
      setProtocol(prev => ({
        ...prev,
        condition: conditionId,
        spinalLevel: conditions.find(c => c.id === conditionId)?.levels || "",
      }));
      toast.info("No template available — build protocol manually");
    }
  };

  // Phase management
  const addPhase = () => {
    const newPhase: ProtocolPhase = {
      id: generateId(),
      name: `Phase ${protocol.phases.length + 1}`,
      duration: "",
      therapies: [],
      goals: [],
      frequency: "",
      notes: "",
    };
    setProtocol(prev => ({ ...prev, phases: [...prev.phases, newPhase] }));
    setExpandedPhases(prev => new Set([...prev, newPhase.id]));
  };

  const removePhase = (phaseId: string) => {
    setProtocol(prev => ({ ...prev, phases: prev.phases.filter(p => p.id !== phaseId) }));
  };

  const updatePhase = (phaseId: string, updates: Partial<ProtocolPhase>) => {
    setProtocol(prev => ({
      ...prev,
      phases: prev.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p),
    }));
  };

  // Therapy management within phases
  const addTherapyToPhase = (phaseId: string, therapy: typeof therapyLibrary[0]) => {
    const newTherapy: TherapyItem = {
      id: generateId(),
      name: therapy.name,
      type: therapy.type,
      duration: therapy.defaultDuration,
      frequency: "",
      notes: "",
    };
    updatePhase(phaseId, {
      therapies: [...(protocol.phases.find(p => p.id === phaseId)?.therapies || []), newTherapy],
    });
    setShowTherapyPicker(null);
  };

  const removeTherapyFromPhase = (phaseId: string, therapyId: string) => {
    const phase = protocol.phases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, { therapies: phase.therapies.filter(t => t.id !== therapyId) });
    }
  };

  // Medicine management
  const addMedicine = (med: typeof medicineLibrary[0]) => {
    const newMed: MedicineItem = {
      id: generateId(),
      name: med.name,
      dosage: med.dosage,
      timing: med.timing,
      duration: "",
      route: med.route,
    };
    setProtocol(prev => ({ ...prev, medicines: [...prev.medicines, newMed] }));
    setShowMedicinePicker(false);
  };

  const removeMedicine = (medId: string) => {
    setProtocol(prev => ({ ...prev, medicines: prev.medicines.filter(m => m.id !== medId) }));
  };

  // Self-care management
  const addSelfCare = () => {
    if (!newSelfCare.trim()) return;
    setProtocol(prev => ({ ...prev, selfCareInstructions: [...prev.selfCareInstructions, newSelfCare.trim()] }));
    setNewSelfCare("");
  };

  const removeSelfCare = (index: number) => {
    setProtocol(prev => ({
      ...prev,
      selfCareInstructions: prev.selfCareInstructions.filter((_, i) => i !== index),
    }));
  };

  // Phase goals
  const addGoalToPhase = (phaseId: string, goal: string) => {
    if (!goal.trim()) return;
    const phase = protocol.phases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, { goals: [...phase.goals, goal.trim()] });
    }
  };

  const removeGoalFromPhase = (phaseId: string, index: number) => {
    const phase = protocol.phases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, { goals: phase.goals.filter((_, i) => i !== index) });
    }
  };

  // Toggle phase expand
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  // Save protocol
  const handleSave = async () => {
    if (!protocol.patientName) { toast.error("Please enter patient name"); return; }
    if (!protocol.condition) { toast.error("Please select a condition"); return; }
    if (protocol.phases.length === 0) { toast.error("Add at least one treatment phase"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const { error } = await supabase.from("spine_therapy_sessions").insert({
        patient_id: user.id,
        doctor_id: user.id,
        session_number: 0,
        therapy_name: `Protocol: ${conditions.find(c => c.id === protocol.condition)?.name || protocol.condition}`,
        duration_minutes: 0,
        status: "protocol_created",
        doctor_notes: JSON.stringify({
          type: "treatment_protocol",
          patientName: protocol.patientName,
          patientAge: protocol.patientAge,
          patientGender: protocol.patientGender,
          condition: protocol.condition,
          severity: protocol.severity,
          dosha: protocol.dosha,
          spinalLevel: protocol.spinalLevel,
          chronicity: protocol.chronicity,
          painScore: protocol.painScore,
          comorbidities: protocol.comorbidities,
          contraindications: protocol.contraindications,
          phases: protocol.phases,
          medicines: protocol.medicines,
          selfCareInstructions: protocol.selfCareInstructions,
          followUpSchedule: protocol.followUpSchedule,
          totalDuration: protocol.totalDuration,
          estimatedCost: protocol.estimatedCost,
          expectedOutcome: protocol.expectedOutcome,
          doctorNotes: protocol.doctorNotes,
        }),
        pain_before: protocol.painScore ? parseInt(protocol.painScore) : null,
      });

      if (error) {
        console.error("Save error:", error);
        toast.error("Save failed: " + error.message);
      } else {
        toast.success("Treatment protocol saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  // Stats
  const totalTherapies = protocol.phases.reduce((sum, p) => sum + p.therapies.length, 0);
  const totalPhases = protocol.phases.length;
  const completeness = [
    protocol.patientName, protocol.condition, protocol.dosha, protocol.severity,
    protocol.phases.length > 0, protocol.medicines.length > 0,
    protocol.selfCareInstructions.length > 0, protocol.followUpSchedule,
  ].filter(Boolean).length;
  const completenessPercent = Math.round((completeness / 8) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Treatment Protocol Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Design multi-phase spine therapy protocols with therapies, medicines, self-care & follow-up plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700">
            <Brain className="h-3 w-3 mr-1" /> Tool #1 of 5
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" /> {completenessPercent}% Complete
          </Badge>
        </div>
      </div>

      {/* Completeness Progress */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Protocol Completeness</span>
            <span className="text-sm text-muted-foreground">{completeness}/8 sections filled</span>
          </div>
          <Progress value={completenessPercent} className="h-2" />
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>{totalPhases} phases</span>
            <span>{totalTherapies} therapies</span>
            <span>{protocol.medicines.length} medicines</span>
            <span>{protocol.selfCareInstructions.length} self-care items</span>
          </div>
        </CardContent>
      </Card>

      {/* Patient & Condition Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Patient Name / ID</label>
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={protocol.patientName}
                  onChange={e => setProtocol(prev => ({ ...prev, patientName: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Age</label>
                  <Input
                    placeholder="45"
                    value={protocol.patientAge}
                    onChange={e => setProtocol(prev => ({ ...prev, patientAge: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Gender</label>
                  <Select value={protocol.patientGender} onValueChange={v => setProtocol(prev => ({ ...prev, patientGender: v }))}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Pain Score (VAS 0-10)</label>
                <Input
                  placeholder="7"
                  type="number"
                  min="0"
                  max="10"
                  value={protocol.painScore}
                  onChange={e => setProtocol(prev => ({ ...prev, painScore: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Chronicity</label>
                <Select value={protocol.chronicity} onValueChange={v => setProtocol(prev => ({ ...prev, chronicity: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acute">Acute (&lt; 6 weeks)</SelectItem>
                    <SelectItem value="subacute">Sub-acute (6-12 weeks)</SelectItem>
                    <SelectItem value="chronic">Chronic (&gt; 12 weeks)</SelectItem>
                    <SelectItem value="recurring">Recurring episodic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Comorbidities</label>
              <Input
                placeholder="e.g. Diabetes, Hypertension, Obesity..."
                value={protocol.comorbidities}
                onChange={e => setProtocol(prev => ({ ...prev, comorbidities: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Contraindications</label>
              <Input
                placeholder="e.g. Bleeding disorders, Pregnancy, Skin infections..."
                value={protocol.contraindications}
                onChange={e => setProtocol(prev => ({ ...prev, contraindications: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Condition & Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">Primary Condition</label>
              <Select
                value={protocol.condition}
                onValueChange={v => loadTemplate(v)}
              >
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  {conditions.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.levels})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Severity</label>
                <Select value={protocol.severity} onValueChange={v => setProtocol(prev => ({ ...prev, severity: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild (VAS 1-3)</SelectItem>
                    <SelectItem value="moderate">Moderate (VAS 4-6)</SelectItem>
                    <SelectItem value="severe">Severe (VAS 7-8)</SelectItem>
                    <SelectItem value="very-severe">Very Severe (VAS 9-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Dosha Predominance</label>
                <Select value={protocol.dosha} onValueChange={v => setProtocol(prev => ({ ...prev, dosha: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {doshaOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Spinal Level</label>
                <Input
                  placeholder="e.g. L4-S1"
                  value={protocol.spinalLevel}
                  onChange={e => setProtocol(prev => ({ ...prev, spinalLevel: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Total Duration</label>
                <Input
                  placeholder="e.g. 6-8 weeks"
                  value={protocol.totalDuration}
                  onChange={e => setProtocol(prev => ({ ...prev, totalDuration: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Expected Outcome</label>
              <Input
                placeholder="e.g. 60-80% pain reduction, restored mobility"
                value={protocol.expectedOutcome}
                onChange={e => setProtocol(prev => ({ ...prev, expectedOutcome: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Estimated Cost (₹)</label>
              <Input
                placeholder="e.g. 15000"
                value={protocol.estimatedCost}
                onChange={e => setProtocol(prev => ({ ...prev, estimatedCost: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Phases */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" /> Treatment Phases ({totalPhases})
            </CardTitle>
            <Button size="sm" onClick={addPhase} className="gap-1">
              <Plus className="h-3 w-3" /> Add Phase
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {protocol.phases.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No phases yet. Select a condition to auto-load a template, or add phases manually.</p>
            </div>
          )}

          {protocol.phases.map((phase, idx) => (
            <div key={phase.id} className="border rounded-lg overflow-hidden">
              {/* Phase Header */}
              <div
                className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                  <span className="font-medium text-sm">{phase.name}</span>
                  {phase.duration && <Badge className="bg-blue-50 text-blue-600 text-[10px]">{phase.duration}</Badge>}
                  <Badge variant="secondary" className="text-[10px]">{phase.therapies.length} therapies</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); removePhase(phase.id); }}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                  {expandedPhases.has(phase.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {/* Phase Content */}
              {expandedPhases.has(phase.id) && (
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium">Phase Name</label>
                      <Input
                        value={phase.name}
                        onChange={e => updatePhase(phase.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Duration</label>
                      <Input
                        placeholder="e.g. Week 1-2"
                        value={phase.duration}
                        onChange={e => updatePhase(phase.id, { duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Frequency</label>
                      <Input
                        placeholder="e.g. Daily"
                        value={phase.frequency}
                        onChange={e => updatePhase(phase.id, { frequency: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Therapies in this phase */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium">Therapies</label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => setShowTherapyPicker(showTherapyPicker === phase.id ? null : phase.id)}
                      >
                        <Plus className="h-2.5 w-2.5" /> Add Therapy
                      </Button>
                    </div>

                    {showTherapyPicker === phase.id && (
                      <div className="border rounded p-2 mb-2 bg-muted/30 max-h-48 overflow-y-auto">
                        <Input
                          placeholder="Filter therapies..."
                          value={therapyFilter}
                          onChange={e => setTherapyFilter(e.target.value)}
                          className="mb-2 h-7 text-xs"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {therapyLibrary
                            .filter(t => t.name.toLowerCase().includes(therapyFilter.toLowerCase()) || t.type.toLowerCase().includes(therapyFilter.toLowerCase()))
                            .map(t => (
                              <button
                                key={t.name}
                                onClick={() => addTherapyToPhase(phase.id, t)}
                                className="text-left p-1.5 rounded text-xs hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                              >
                                <span className="font-medium">{t.name}</span>
                                <span className="text-muted-foreground ml-1">({t.type} · {t.defaultDuration})</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {phase.therapies.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No therapies added yet</p>
                    ) : (
                      <div className="space-y-1">
                        {phase.therapies.map(t => (
                          <div key={t.id} className="flex items-center gap-2 p-2 rounded bg-background border text-xs">
                            <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="font-medium">{t.name}</span>
                            <Badge variant="secondary" className="text-[9px]">{t.type}</Badge>
                            <span className="text-muted-foreground">{t.duration}</span>
                            {t.frequency && <span className="text-muted-foreground">· {t.frequency}</span>}
                            {t.notes && <span className="text-muted-foreground italic truncate max-w-[150px]">— {t.notes}</span>}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-5 w-5 p-0"
                              onClick={() => removeTherapyFromPhase(phase.id, t.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="text-xs font-medium">Phase Goals</label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        placeholder="Add a goal for this phase..."
                        className="h-7 text-xs"
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            addGoalToPhase(phase.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                    {phase.goals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {phase.goals.map((g, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                            {g}
                            <button onClick={() => removeGoalFromPhase(phase.id, i)} className="ml-1 text-red-400 hover:text-red-600">×</button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phase Notes */}
                  <div>
                    <label className="text-xs font-medium">Phase Notes</label>
                    <Textarea
                      placeholder="Clinical notes for this phase..."
                      className="h-16 text-xs mt-1"
                      value={phase.notes}
                      onChange={e => updatePhase(phase.id, { notes: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" /> Medicines ({protocol.medicines.length})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setShowMedicinePicker(!showMedicinePicker)}
            >
              <Plus className="h-3 w-3" /> Add Medicine
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showMedicinePicker && (
            <div className="border rounded p-2 mb-3 bg-muted/30 max-h-48 overflow-y-auto">
              <Input
                placeholder="Filter medicines..."
                value={medicineFilter}
                onChange={e => setMedicineFilter(e.target.value)}
                className="mb-2 h-7 text-xs"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {medicineLibrary
                  .filter(m => m.name.toLowerCase().includes(medicineFilter.toLowerCase()))
                  .map(m => (
                    <button
                      key={m.name}
                      onClick={() => addMedicine(m)}
                      className="text-left p-1.5 rounded text-xs hover:bg-green-50 border border-transparent hover:border-green-200 transition"
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground ml-1">({m.dosage} · {m.route})</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {protocol.medicines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No medicines added yet</p>
          ) : (
            <div className="space-y-1">
              {protocol.medicines.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded border text-xs">
                  <Leaf className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="font-medium">{m.name}</span>
                  <Badge variant="outline" className="text-[9px]">{m.dosage}</Badge>
                  <span className="text-muted-foreground">{m.timing}</span>
                  {m.duration && <span className="text-muted-foreground">· {m.duration}</span>}
                  <Badge variant="secondary" className="text-[9px] ml-auto">{m.route}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => removeMedicine(m.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Self-Care Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" /> Self-Care Instructions ({protocol.selfCareInstructions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add self-care instruction (e.g. BL40 acupressure 3×/day)..."
              value={newSelfCare}
              onChange={e => setNewSelfCare(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addSelfCare(); }}
              className="text-xs"
            />
            <Button size="sm" onClick={addSelfCare} className="gap-1 shrink-0">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {protocol.selfCareInstructions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No self-care instructions added yet</p>
          ) : (
            <div className="space-y-1">
              {protocol.selfCareInstructions.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-red-50/50 border border-red-100 text-xs">
                  <Heart className="h-3 w-3 text-red-400 shrink-0" />
                  <span>{item}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-5 w-5 p-0"
                    onClick={() => removeSelfCare(i)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-Up & Doctor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Follow-Up Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g. Day 3 → Day 7 → Day 14 → Day 28 → Day 56&#10;Or: Weekly VAS + monthly full assessment"
              className="h-24 text-xs"
              value={protocol.followUpSchedule}
              onChange={e => setProtocol(prev => ({ ...prev, followUpSchedule: e.target.value }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Doctor's Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Additional clinical observations, precautions, or special instructions..."
              className="h-24 text-xs"
              value={protocol.doctorNotes}
              onChange={e => setProtocol(prev => ({ ...prev, doctorNotes: e.target.value }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Protocol Summary */}
      {protocol.phases.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" /> Protocol Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-blue-600">{totalPhases}</p>
                <p className="text-[10px] text-muted-foreground">Treatment Phases</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-amber-600">{totalTherapies}</p>
                <p className="text-[10px] text-muted-foreground">Total Therapies</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-green-600">{protocol.medicines.length}</p>
                <p className="text-[10px] text-muted-foreground">Medicines</p>
              </div>
              <div className="p-2 rounded bg-white border">
                <p className="text-lg font-bold text-red-600">{protocol.selfCareInstructions.length}</p>
                <p className="text-[10px] text-muted-foreground">Self-Care Items</p>
              </div>
            </div>
            {protocol.totalDuration && (
              <div className="mt-3 flex items-center gap-4 text-xs">
                <span><Clock className="h-3 w-3 inline mr-1" />Duration: <strong>{protocol.totalDuration}</strong></span>
                {protocol.estimatedCost && <span>💰 Est. Cost: <strong>₹{protocol.estimatedCost}</strong></span>}
                {protocol.expectedOutcome && <span><Target className="h-3 w-3 inline mr-1" />{protocol.expectedOutcome}</span>}
              </div>
            )}

            {/* Phase flow */}
            <div className="mt-3 flex items-center gap-1 flex-wrap">
              {protocol.phases.map((phase, idx) => (
                <div key={phase.id} className="flex items-center gap-1">
                  <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                    {phase.name} ({phase.therapies.length})
                  </Badge>
                  {idx < protocol.phases.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setProtocol({
              patientName: "", patientAge: "", patientGender: "", condition: "", subCondition: "",
              severity: "", dosha: "", spinalLevel: "", chronicity: "", painScore: "",
              comorbidities: "", contraindications: "", phases: [], medicines: [],
              selfCareInstructions: [], followUpSchedule: "", totalDuration: "",
              estimatedCost: "", expectedOutcome: "", doctorNotes: "",
            });
            setExpandedPhases(new Set());
            toast.info("Protocol cleared");
          }}>
            Clear All
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            const summary = `
TREATMENT PROTOCOL — ${conditions.find(c => c.id === protocol.condition)?.name || "Spine"}
Patient: ${protocol.patientName} | Age: ${protocol.patientAge} | Gender: ${protocol.patientGender}
Condition: ${conditions.find(c => c.id === protocol.condition)?.name || protocol.condition}
Dosha: ${protocol.dosha} | Spinal Level: ${protocol.spinalLevel} | Severity: ${protocol.severity}
Duration: ${protocol.totalDuration} | Cost: ₹${protocol.estimatedCost}

PHASES:
${protocol.phases.map((p, i) => `${i + 1}. ${p.name} (${p.duration}) — ${p.therapies.map(t => t.name).join(", ")}`).join("\n")}

MEDICINES:
${protocol.medicines.map(m => `• ${m.name} — ${m.dosage} ${m.timing} × ${m.duration}`).join("\n")}

SELF-CARE:
${protocol.selfCareInstructions.map(s => `• ${s}`).join("\n")}

FOLLOW-UP: ${protocol.followUpSchedule}
EXPECTED OUTCOME: ${protocol.expectedOutcome}
NOTES: ${protocol.doctorNotes}
            `.trim();
            navigator.clipboard.writeText(summary);
            toast.success("Protocol copied to clipboard!");
          }}>
            <Printer className="h-3 w-3" /> Copy as Text
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Protocol"}
          </Button>
        </div>
      </div>
    </div>
  );
}
