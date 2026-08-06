import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, CheckCircle2, Clock, Stethoscope, Brain, Target,
  Save, ClipboardList, AlertTriangle, Zap, Heart, Users,
} from "lucide-react";

export default function SpineTherapySession() {
  const [selectedTherapy, setSelectedTherapy] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    patientName: "", sessionNumber: "1", duration: "30",
    intensity: "", bodyArea: "", spinalLevel: "",
    painBefore: "", painAfter: "", immediateResponse: "",
    doctorNotes: "", nextPlan: "", homeExercise: "",
  });

  const therapies = [
    { id: 1, name: "Acupuncture (TCM)", icon: "🪡" },
    { id: 2, name: "Acupressure Therapy", icon: "👆" },
    { id: 3, name: "Dry Needling", icon: "📌" },
    { id: 4, name: "Trigger Point Therapy", icon: "🎯" },
    { id: 5, name: "Auriculotherapy", icon: "👂" },
    { id: 6, name: "Kampo & Shiatsu", icon: "🇯🇵" },
    { id: 7, name: "Korean Hand Therapy", icon: "✋" },
    { id: 8, name: "Reflexology", icon: "🦶" },
    { id: 9, name: "Cupping (Hijama)", icon: "🫙" },
    { id: 10, name: "Moxibustion", icon: "🔥" },
    { id: 11, name: "Thai Massage", icon: "🇹🇭" },
    { id: 12, name: "Osteopathic / MET", icon: "🦴" },
    { id: 13, name: "Sujok Therapy", icon: "🌀" },
    { id: 14, name: "Marma Therapy", icon: "🙏" },
    { id: 15, name: "Pranic Healing", icon: "✨" },
  ];

  // Checkpoints per therapy (matching SQL seed data)
  const therapyCheckpoints: Record<number, { name: string; category: string }[]> = {
    1: [
      { name: "Patient consent obtained", category: "preparation" },
      { name: "Skin cleaned with alcohol", category: "preparation" },
      { name: "Points selected based on diagnosis", category: "execution" },
      { name: "Needles inserted (depth recorded)", category: "execution" },
      { name: "De Qi sensation obtained", category: "execution" },
      { name: "Retention time completed", category: "execution" },
      { name: "All needles removed & counted", category: "safety" },
      { name: "Post-treatment VAS recorded", category: "assessment" },
      { name: "Aftercare instructions given", category: "aftercare" },
    ],
    2: [
      { name: "Points identified by palpation", category: "preparation" },
      { name: "Pressure technique selected", category: "execution" },
      { name: "Pressure applied (duration per point)", category: "execution" },
      { name: "Patient feedback during treatment", category: "assessment" },
      { name: "Post-treatment VAS recorded", category: "assessment" },
      { name: "Self-care points taught to patient", category: "aftercare" },
    ],
    3: [
      { name: "Trigger point identified (taut band)", category: "preparation" },
      { name: "Skin cleaned", category: "preparation" },
      { name: "Needle inserted into TrP", category: "execution" },
      { name: "Local twitch response obtained", category: "execution" },
      { name: "Referred pain reproduction noted", category: "assessment" },
      { name: "Post-needling stretch performed", category: "aftercare" },
      { name: "Post-treatment VAS recorded", category: "assessment" },
      { name: "Aftercare: heat + hydration advised", category: "aftercare" },
    ],
    4: [
      { name: "Active TrPs identified & mapped", category: "preparation" },
      { name: "Ischemic compression applied", category: "execution" },
      { name: "Barrier releases documented", category: "execution" },
      { name: "Post-release stretch performed", category: "aftercare" },
      { name: "Post-treatment VAS recorded", category: "assessment" },
      { name: "Self-treatment tool taught", category: "aftercare" },
    ],
    5: [
      { name: "Ear points detected (probe/palpation)", category: "preparation" },
      { name: "Ear cleaned with alcohol", category: "preparation" },
      { name: "Seeds/needles placed on spine zone", category: "execution" },
      { name: "Additional points added (Shenmen etc)", category: "execution" },
      { name: "Patient response within 5 min", category: "assessment" },
      { name: "Self-press instructions given", category: "aftercare" },
    ],
    6: [
      { name: "Abdominal diagnosis (Fukushin)", category: "preparation" },
      { name: "Shiatsu BL channel pressed", category: "execution" },
      { name: "Tender points noted", category: "assessment" },
      { name: "Kampo formula selected", category: "execution" },
      { name: "Sotai correction if indicated", category: "execution" },
      { name: "Makko-Ho stretches taught", category: "aftercare" },
    ],
    7: [
      { name: "Spine correspondence located", category: "preparation" },
      { name: "Most tender point identified", category: "assessment" },
      { name: "Stimulation applied", category: "execution" },
      { name: "Response assessed", category: "assessment" },
      { name: "Seeds placed for ongoing use", category: "aftercare" },
    ],
    8: [
      { name: "Foot/hand spine zone located", category: "preparation" },
      { name: "Thumb walking performed", category: "execution" },
      { name: "Tender zones documented", category: "assessment" },
      { name: "Sustained pressure on tender areas", category: "execution" },
      { name: "Post-treatment VAS recorded", category: "assessment" },
      { name: "Self-rolling technique taught", category: "aftercare" },
    ],
    9: [
      { name: "Skin condition checked", category: "preparation" },
      { name: "Oil applied to treatment area", category: "preparation" },
      { name: "Cups placed (method documented)", category: "execution" },
      { name: "Retention time completed", category: "execution" },
      { name: "Cup marks assessed & documented", category: "assessment" },
      { name: "Aftercare instructions given", category: "aftercare" },
    ],
    10: [
      { name: "Cold/Vata pattern confirmed", category: "preparation" },
      { name: "Moxa technique selected", category: "execution" },
      { name: "Points warmed (BL23, GV4 etc)", category: "execution" },
      { name: "Patient warmth sensation confirmed", category: "assessment" },
      { name: "Skin checked post-treatment", category: "safety" },
      { name: "Self-moxa/infrared instructions", category: "aftercare" },
    ],
    11: [
      { name: "Patient positioned on mat", category: "preparation" },
      { name: "Sen lines pressed (spine channels)", category: "execution" },
      { name: "Assisted stretches performed", category: "execution" },
      { name: "ROM improvement noted", category: "assessment" },
      { name: "Home stretches assigned", category: "aftercare" },
    ],
    12: [
      { name: "Restricted segment identified", category: "preparation" },
      { name: "Barrier engaged", category: "execution" },
      { name: "Isometric contraction (5-7 sec)", category: "execution" },
      { name: "New barrier taken", category: "execution" },
      { name: "Repetitions completed (3-5)", category: "execution" },
      { name: "Post-MET ROM assessed", category: "assessment" },
      { name: "Self-MET taught for home", category: "aftercare" },
    ],
    13: [
      { name: "Correspondence system selected", category: "preparation" },
      { name: "Active point found on hand/foot", category: "assessment" },
      { name: "Stimulation method applied", category: "execution" },
      { name: "Body pain response checked", category: "assessment" },
      { name: "Ongoing seeds placed", category: "aftercare" },
    ],
    14: [
      { name: "Spine Marma points assessed", category: "preparation" },
      { name: "Oil applied to Marma zones", category: "preparation" },
      { name: "Marma stimulation performed", category: "execution" },
      { name: "Duration per Marma (30-60 sec)", category: "execution" },
      { name: "Energy flow improvement noted", category: "assessment" },
      { name: "Self-Marma routine taught", category: "aftercare" },
    ],
    15: [
      { name: "Chakra scanning performed", category: "preparation" },
      { name: "Congested areas swept/cleansed", category: "execution" },
      { name: "Depleted areas energized", category: "execution" },
      { name: "Patient energy level reassessed", category: "assessment" },
      { name: "Self-energy exercise taught", category: "aftercare" },
    ],
  };

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item); else next.add(item);
      return next;
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "preparation": return "bg-blue-100 text-blue-700";
      case "execution": return "bg-green-100 text-green-700";
      case "assessment": return "bg-purple-100 text-purple-700";
      case "aftercare": return "bg-amber-100 text-amber-700";
      case "safety": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const currentCheckpoints = selectedTherapy ? therapyCheckpoints[selectedTherapy] || [] : [];
  const completionPct = currentCheckpoints.length > 0 ? Math.round((checkedItems.size / currentCheckpoints.length) * 100) : 0;

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedTherapy) { toast.error("Please select a therapy"); return; }
    if (!formData.patientName) { toast.error("Please enter patient name/ID"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const therapy = therapies.find(t => t.id === selectedTherapy);
      const completedCheckpoints = Array.from(checkedItems).map(name => {
        const cp = currentCheckpoints.find(c => c.name === name);
        return { name, category: cp?.category || "execution", completed: true };
      });

      const { error } = await supabase.from("spine_therapy_sessions").insert({
        patient_id: user.id, // TODO: replace with actual patient lookup
        doctor_id: user.id,
        session_number: parseInt(formData.sessionNumber) || 1,
        therapy_id: selectedTherapy,
        therapy_name: therapy?.name || "",
        duration_minutes: parseInt(formData.duration) || 30,
        intensity: formData.intensity || null,
        body_area: formData.bodyArea || null,
        spinal_level: formData.spinalLevel || null,
        checkpoints_completed: completedCheckpoints,
        total_checkpoints: currentCheckpoints.length,
        checkpoints_done: checkedItems.size,
        pain_before: formData.painBefore ? parseInt(formData.painBefore) : null,
        pain_after: formData.painAfter ? parseInt(formData.painAfter) : null,
        immediate_response: formData.immediateResponse || null,
        doctor_notes: formData.doctorNotes || null,
        next_session_plan: formData.nextPlan || null,
        home_exercise_given: formData.homeExercise || null,
        status: "completed",
      });

      if (error) {
        console.error("Save error:", error);
        toast.error("Failed to save session: " + error.message);
      } else {
        toast.success("Session saved successfully! Recovery score will update.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-purple-600" />
            Spine Therapy Session — Doctor Tool
          </h1>
          <p className="text-muted-foreground mt-1">Record what was done · Checkpoints · Measure patient response</p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300">
          <ClipboardList className="h-3 w-3 mr-1" /> Session Recording
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Session Info + Therapy Selection */}
        <div className="space-y-4">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Patient & Session</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Patient Name / ID</label><Input placeholder="Search patient..." value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Session #</label><Input type="number" value={formData.sessionNumber} onChange={e => setFormData({...formData, sessionNumber: e.target.value})} className="mt-1" /></div>
                <div><label className="text-xs font-medium">Duration (min)</label><Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="mt-1" /></div>
              </div>
              <div><label className="text-xs font-medium">Intensity</label>
                <Select value={formData.intensity} onValueChange={v => setFormData({...formData, intensity: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="mild">Mild</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="strong">Strong</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Body Area</label><Input placeholder="e.g., Lumbar paraspinal" value={formData.bodyArea} onChange={e => setFormData({...formData, bodyArea: e.target.value})} className="mt-1" /></div>
              <div><label className="text-xs font-medium">Spinal Level</label><Input placeholder="e.g., L4-S1" value={formData.spinalLevel} onChange={e => setFormData({...formData, spinalLevel: e.target.value})} className="mt-1" /></div>
            </CardContent>
          </Card>

          {/* Therapy Selection */}
          <Card className="border-green-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-green-600" /> Select Therapy (15 Systems)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-1.5 max-h-[400px] overflow-y-auto">
                {therapies.map(t => (
                  <button key={t.id} onClick={() => { setSelectedTherapy(t.id); setCheckedItems(new Set()); }}
                    className={`flex items-center gap-2 p-2 rounded text-left text-sm transition ${selectedTherapy === t.id ? "bg-green-100 border border-green-300 font-medium" : "hover:bg-muted border border-transparent"}`}>
                    <span>{t.icon}</span>
                    <span className="flex-1">{t.name}</span>
                    {selectedTherapy === t.id && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Checkpoints */}
        <div className="space-y-4">
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="h-4 w-4 text-purple-600" /> Session Checkpoints</CardTitle>
                {selectedTherapy && <Badge className="bg-purple-100 text-purple-700 text-[10px]">{checkedItems.size}/{currentCheckpoints.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTherapy ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a therapy from the left panel to see its checkpoints</p>
              ) : (
                <div className="space-y-2">
                  <Progress value={completionPct} className="h-2 mb-3" />
                  {currentCheckpoints.map((cp, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${checkedItems.has(cp.name) ? "bg-green-50 border-green-200" : "hover:bg-muted"}`} onClick={() => toggleCheck(cp.name)}>
                      <input type="checkbox" checked={checkedItems.has(cp.name)} readOnly className="h-4 w-4 rounded border-gray-300 text-green-600" />
                      <span className="flex-1 text-sm">{cp.name}</span>
                      <Badge className={`text-[9px] ${getCategoryColor(cp.category)}`}>{cp.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pain Score */}
          <Card className="border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-amber-600" /> Pain Score (VAS)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-red-600">Before Treatment</label>
                  <Input type="number" min="0" max="10" placeholder="0-10" value={formData.painBefore} onChange={e => setFormData({...formData, painBefore: e.target.value})} className="mt-1 border-red-200" />
                  <p className="text-[9px] text-muted-foreground mt-0.5">0 = no pain, 10 = worst</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-green-600">After Treatment</label>
                  <Input type="number" min="0" max="10" placeholder="0-10" value={formData.painAfter} onChange={e => setFormData({...formData, painAfter: e.target.value})} className="mt-1 border-green-200" />
                  <p className="text-[9px] text-muted-foreground mt-0.5">Lower = better response</p>
                </div>
              </div>
              {formData.painBefore && formData.painAfter && (
                <div className="mt-3 p-2 bg-green-50 rounded text-center">
                  <p className="text-sm font-bold text-green-700">
                    Immediate Improvement: {Math.round(((parseInt(formData.painBefore) - parseInt(formData.painAfter)) / parseInt(formData.painBefore)) * 100)}%
                  </p>
                  <p className="text-[10px] text-green-600">VAS: {formData.painBefore} → {formData.painAfter}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Response + Notes + Save */}
        <div className="space-y-4">
          {/* Immediate Response */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Patient Response</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Immediate Response</label>
                <Select value={formData.immediateResponse} onValueChange={v => setFormData({...formData, immediateResponse: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="How did patient respond?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (&gt;50% pain reduction)</SelectItem>
                    <SelectItem value="good">Good (30-50% improvement)</SelectItem>
                    <SelectItem value="moderate">Moderate (10-30% improvement)</SelectItem>
                    <SelectItem value="minimal">Minimal (&lt;10% change)</SelectItem>
                    <SelectItem value="adverse">Adverse reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Notes */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Doctor Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Session Notes</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Key observations, findings..." value={formData.doctorNotes} onChange={e => setFormData({...formData, doctorNotes: e.target.value})} />
              </div>
              <div><label className="text-xs font-medium">Next Session Plan</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" placeholder="What to do next time..." value={formData.nextPlan} onChange={e => setFormData({...formData, nextPlan: e.target.value})} />
              </div>
              <div><label className="text-xs font-medium">Home Exercise / Self-Care Given</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" placeholder="What patient should do at home..." value={formData.homeExercise} onChange={e => setFormData({...formData, homeExercise: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Session & Update Recovery Score"}
          </Button>

          {/* Session Summary */}
          {selectedTherapy && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-xs space-y-1">
                <p className="font-medium">Session Summary:</p>
                <p>Therapy: {therapies.find(t => t.id === selectedTherapy)?.name}</p>
                <p>Checkpoints: {checkedItems.size}/{currentCheckpoints.length} ({completionPct}%)</p>
                <p>Pain: {formData.painBefore || "?"} → {formData.painAfter || "?"}</p>
                <p>Response: {formData.immediateResponse || "Not recorded"}</p>
                <p>Duration: {formData.duration} min | Intensity: {formData.intensity || "?"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
