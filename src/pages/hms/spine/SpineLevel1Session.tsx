import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, CheckCircle2, Clock, Stethoscope, Target,
  Save, ClipboardList, Zap, Heart,
} from "lucide-react";

export default function SpineLevel1Session() {
  const [selectedTherapy, setSelectedTherapy] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    patientName: "", duration: "15", intensity: "",
    bodyArea: "", spinalLevel: "", painBefore: "", painAfter: "",
    immediateResponse: "", doctorNotes: "", nextPlan: "", conversionNote: "",
  });

  const level1Therapies = [
    { id: 1, name: "Viddha Karma", desc: "Therapeutic puncture at Marma/Sira points", duration: "10 min", price: 500, relief: "30-40%" },
    { id: 2, name: "Agnikarma", desc: "Heat cauterization on trigger points (Panchdhatu Shalaka)", duration: "15 min", price: 800, relief: "40-60%" },
    { id: 3, name: "Marma Therapy", desc: "Deep pressure on vital energy points (107 Marma)", duration: "30 min", price: 600, relief: "25-35%" },
    { id: 4, name: "Doctor's Therapy", desc: "Manual spine mobilization, traction, manipulation", duration: "20 min", price: 500, relief: "30-50%" },
    { id: 5, name: "Hijama / Cupping", desc: "Wet/Dry cupping on back muscles for pain relief", duration: "30 min", price: 1000, relief: "35-50%" },
    { id: 6, name: "Trigger Point Therapy", desc: "Deep tissue pressure on myofascial trigger points", duration: "20 min", price: 500, relief: "30-40%" },
    { id: 7, name: "Varma Therapy (Siddha)", desc: "Tamil martial point stimulation for nerve release", duration: "20 min", price: 600, relief: "35-45%" },
    { id: 8, name: "Mudra Therapy", desc: "Energy channeling through hand positions + breathwork", duration: "15 min", price: 300, relief: "15-25%" },
  ];

  const level1Checkpoints: Record<number, { name: string; category: string }[]> = {
    1: [ // Viddha Karma
      { name: "Patient consent + explain procedure", category: "preparation" },
      { name: "Identify Sira/Marma points for puncture", category: "preparation" },
      { name: "Sterilize skin and instrument", category: "safety" },
      { name: "Puncture at selected points (depth 1-2mm)", category: "execution" },
      { name: "Observe blood/fluid release (if Sira)", category: "execution" },
      { name: "Apply antiseptic post-puncture", category: "aftercare" },
      { name: "Record immediate pain response", category: "assessment" },
      { name: "Advise rest 15 min post-procedure", category: "aftercare" },
    ],
    2: [ // Agnikarma
      { name: "Confirm indication (chronic pain/TrP)", category: "preparation" },
      { name: "Patient consent for thermal procedure", category: "preparation" },
      { name: "Heat Panchdhatu Shalaka to red-hot", category: "execution" },
      { name: "Apply to trigger point (Samyak Dagdha Lakshana)", category: "execution" },
      { name: "Observe tissue response (white/copper colored)", category: "assessment" },
      { name: "Apply Ghrita + Madhu (ghee + honey) immediately", category: "aftercare" },
      { name: "Apply Yashtimadhu paste/cold pack", category: "aftercare" },
      { name: "Record VAS before and after", category: "assessment" },
      { name: "Advise: no water contact 24hr, keep dry", category: "aftercare" },
    ],
    3: [ // Marma Therapy
      { name: "Assess spine-related Marma tenderness", category: "preparation" },
      { name: "Apply warm oil (Til/Mahanarayan) to Marma zones", category: "preparation" },
      { name: "Stimulate Kukundara Marma (sacral)", category: "execution" },
      { name: "Stimulate Katikataruna (hip joint)", category: "execution" },
      { name: "Stimulate Krikatika (C1-C2) if cervical", category: "execution" },
      { name: "Duration 30-60 sec per Marma (clockwise/sustained)", category: "execution" },
      { name: "Assess energy flow improvement", category: "assessment" },
      { name: "Record VAS before and after", category: "assessment" },
      { name: "Teach self-Marma points for home", category: "aftercare" },
    ],
    4: [ // Doctor's Therapy (Manual)
      { name: "Assess restricted spinal segment", category: "preparation" },
      { name: "Patient positioning (prone/side-lying)", category: "preparation" },
      { name: "Gentle traction applied (manual/sustained)", category: "execution" },
      { name: "Mobilization of restricted segment (grade I-IV)", category: "execution" },
      { name: "MET if indicated (isometric contraction)", category: "execution" },
      { name: "Assess ROM improvement post-manipulation", category: "assessment" },
      { name: "Record VAS before and after", category: "assessment" },
      { name: "Advise movement + avoid heavy lifting 24hr", category: "aftercare" },
    ],
    5: [ // Hijama / Cupping
      { name: "Check skin condition (no lesions/infection)", category: "preparation" },
      { name: "Select dry vs wet cupping based on diagnosis", category: "preparation" },
      { name: "Apply oil to treatment area", category: "preparation" },
      { name: "Place cups on paraspinal muscles (BL channel)", category: "execution" },
      { name: "Retain cups 5-10 min (observe color change)", category: "execution" },
      { name: "If wet: superficial scratches + reapply cup (3-5 min)", category: "execution" },
      { name: "Remove cups, clean area, apply antiseptic", category: "aftercare" },
      { name: "Document cup mark colors", category: "assessment" },
      { name: "Record VAS before and after", category: "assessment" },
      { name: "Advise: keep warm, no cold bath 24hr", category: "aftercare" },
    ],
    6: [ // Trigger Point Therapy
      { name: "Palpate and identify active trigger points", category: "preparation" },
      { name: "Document TrP location + referred pain pattern", category: "preparation" },
      { name: "Apply ischemic compression (60-90 sec hold)", category: "execution" },
      { name: "Wait for barrier release (pain drops from 7 to 3)", category: "execution" },
      { name: "Take to new barrier, repeat 2-3 times", category: "execution" },
      { name: "Post-release stretch (30 sec x3)", category: "aftercare" },
      { name: "Record VAS before and after", category: "assessment" },
      { name: "Teach self-compression (tennis ball/theracane)", category: "aftercare" },
    ],
    7: [ // Varma Therapy (Siddha)
      { name: "Identify affected Varma points (96/108 Varma system)", category: "preparation" },
      { name: "Assess nerve pathway involvement", category: "preparation" },
      { name: "Apply specific stimulation technique (touch/press/strike)", category: "execution" },
      { name: "Stimulate Thattu Varma (percussion) if indicated", category: "execution" },
      { name: "Apply Thokku Varma (sustained pressure) points", category: "execution" },
      { name: "Observe nerve release response (tingling/warmth)", category: "assessment" },
      { name: "Record VAS before and after", category: "assessment" },
      { name: "Apply Varma oil (Iluppennai-based)", category: "aftercare" },
      { name: "Advise rest + dietary restrictions (Pathiyam)", category: "aftercare" },
    ],
    8: [ // Mudra Therapy
      { name: "Assess patient energy level + breathing pattern", category: "preparation" },
      { name: "Select appropriate Mudra for spine condition", category: "preparation" },
      { name: "Guide patient into Mudra position", category: "execution" },
      { name: "Coordinate with Pranayama (breath technique)", category: "execution" },
      { name: "Hold duration: 5-15 min with awareness", category: "execution" },
      { name: "Assess energy shift (warmth/tingling in spine)", category: "assessment" },
      { name: "Record VAS/energy score before and after", category: "assessment" },
      { name: "Teach Mudra for daily home practice", category: "aftercare" },
    ],
  };

  const [saving, setSaving] = useState(false);

  const handleSaveLevel1 = async () => {
    if (!selectedTherapy) { toast.error("Please select a therapy"); return; }
    if (!formData.patientName) { toast.error("Please enter patient name/ID"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const therapy = level1Therapies.find(t => t.id === selectedTherapy);
      const completedCheckpoints = Array.from(checkedItems).map(name => {
        const cp = currentCPs.find(c => c.name === name);
        return { name, category: cp?.category || "execution", completed: true };
      });

      const { error } = await supabase.from("spine_therapy_sessions").insert({
        patient_id: user.id,
        doctor_id: user.id,
        session_number: 1,
        therapy_id: selectedTherapy,
        therapy_name: therapy?.name || "",
        duration_minutes: parseInt(formData.duration) || 15,
        intensity: formData.intensity || null,
        body_area: formData.bodyArea || null,
        spinal_level: formData.spinalLevel || null,
        checkpoints_completed: completedCheckpoints,
        total_checkpoints: currentCPs.length,
        checkpoints_done: checkedItems.size,
        pain_before: formData.painBefore ? parseInt(formData.painBefore) : null,
        pain_after: formData.painAfter ? parseInt(formData.painAfter) : null,
        immediate_response: formData.immediateResponse || null,
        doctor_notes: formData.doctorNotes || null,
        next_session_plan: formData.nextPlan || null,
        status: "completed",
      });

      if (error) {
        console.error("Save error:", error);
        toast.error("Failed to save: " + error.message);
      } else {
        toast.success("Level 1 session saved! Patient recovery updated.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => { const n = new Set(prev); if (n.has(item)) n.delete(item); else n.add(item); return n; });
  };

  const getCatColor = (cat: string) => {
    switch (cat) {
      case "preparation": return "bg-blue-100 text-blue-700";
      case "execution": return "bg-green-100 text-green-700";
      case "assessment": return "bg-purple-100 text-purple-700";
      case "aftercare": return "bg-amber-100 text-amber-700";
      case "safety": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const currentCPs = selectedTherapy ? level1Checkpoints[selectedTherapy] || [] : [];
  const pct = currentCPs.length > 0 ? Math.round((checkedItems.size / currentCPs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-green-600" /> Level 1: First Treatment (OPD — Same Day Relief)</h1>
          <p className="text-muted-foreground mt-1">Doctor records what was done · Checkpoints · Patient feels 30-60% relief same day</p>
        </div>
        <Badge className="bg-green-100 text-green-700"><Activity className="h-3 w-3 mr-1" /> OPD Session</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Patient + Therapy Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Patient & Session</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Patient Name / ID</label><Input placeholder="Search patient..." value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Duration (min)</label><Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="mt-1" /></div>
                <div><label className="text-xs font-medium">Intensity</label>
                  <Select value={formData.intensity} onValueChange={v => setFormData({...formData, intensity: v})}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="mild">Mild</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="strong">Strong</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><label className="text-xs font-medium">Body Area / Spinal Level</label><Input placeholder="e.g., L4-S1 paraspinal" value={formData.spinalLevel} onChange={e => setFormData({...formData, spinalLevel: e.target.value})} className="mt-1" /></div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-green-600" /> Level 1 Therapies (8)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {level1Therapies.map(t => (
                  <button key={t.id} onClick={() => { setSelectedTherapy(t.id); setCheckedItems(new Set()); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded text-left text-sm transition ${selectedTherapy === t.id ? "bg-green-100 border border-green-300" : "hover:bg-muted border border-transparent"}`}>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5"><Clock className="h-2.5 w-2.5 inline mr-0.5" />{t.duration} · ₹{t.price}</p>
                    </div>
                    <Badge className="bg-green-50 text-green-700 text-[9px] shrink-0">{t.relief}</Badge>
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
                <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="h-4 w-4 text-purple-600" /> Treatment Checkpoints</CardTitle>
                {selectedTherapy && <Badge className="bg-purple-100 text-purple-700 text-[10px]">{checkedItems.size}/{currentCPs.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTherapy ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a Level 1 therapy to see checkpoints</p>
              ) : (
                <div className="space-y-2">
                  <Progress value={pct} className="h-2 mb-3" />
                  {currentCPs.map((cp, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${checkedItems.has(cp.name) ? "bg-green-50 border-green-200" : "hover:bg-muted"}`} onClick={() => toggleCheck(cp.name)}>
                      <input type="checkbox" checked={checkedItems.has(cp.name)} readOnly className="h-4 w-4 rounded" />
                      <span className="flex-1 text-sm">{cp.name}</span>
                      <Badge className={`text-[9px] ${getCatColor(cp.category)}`}>{cp.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* VAS */}
          <Card className="border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-amber-600" /> Pain Score (VAS)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-red-600">Before</label><Input type="number" min="0" max="10" placeholder="0-10" value={formData.painBefore} onChange={e => setFormData({...formData, painBefore: e.target.value})} className="mt-1 border-red-200" /></div>
                <div><label className="text-xs font-medium text-green-600">After</label><Input type="number" min="0" max="10" placeholder="0-10" value={formData.painAfter} onChange={e => setFormData({...formData, painAfter: e.target.value})} className="mt-1 border-green-200" /></div>
              </div>
              {formData.painBefore && formData.painAfter && parseInt(formData.painBefore) > 0 && (
                <div className="mt-3 p-2 bg-green-50 rounded text-center">
                  <p className="text-sm font-bold text-green-700">Same-Day Relief: {Math.round(((parseInt(formData.painBefore) - parseInt(formData.painAfter)) / parseInt(formData.painBefore)) * 100)}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Response + Notes + Conversion */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Response & Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Immediate Response</label>
                <Select value={formData.immediateResponse} onValueChange={v => setFormData({...formData, immediateResponse: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="How did patient respond?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (&gt;50% relief)</SelectItem>
                    <SelectItem value="good">Good (30-50% relief)</SelectItem>
                    <SelectItem value="moderate">Moderate (15-30% relief)</SelectItem>
                    <SelectItem value="minimal">Minimal (&lt;15% relief)</SelectItem>
                    <SelectItem value="adverse">Adverse reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Doctor Notes</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px]" placeholder="Observations, findings..." value={formData.doctorNotes} onChange={e => setFormData({...formData, doctorNotes: e.target.value})} />
              </div>
              <div><label className="text-xs font-medium">Next Step / Plan</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" placeholder="Recommend Level 2 package? Follow-up?" value={formData.nextPlan} onChange={e => setFormData({...formData, nextPlan: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          {/* Conversion Strategy */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-amber-600" /> Conversion to Package</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">After Level 1 relief, guide patient toward structured treatment:</p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-white rounded border flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>"You felt relief today — imagine what a full course can do"</span>
                </div>
                <div className="p-2 bg-white rounded border flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>"This was emergency relief. For permanent cure, you need the full protocol"</span>
                </div>
                <div className="p-2 bg-white rounded border flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>"Level 2 (Panchakarma) addresses the ROOT CAUSE — not just symptoms"</span>
                </div>
              </div>
              <div className="mt-2"><label className="text-xs font-medium">Conversion Note</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[50px]" placeholder="Patient's response to package suggestion..." value={formData.conversionNote} onChange={e => setFormData({...formData, conversionNote: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={handleSaveLevel1} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Level 1 Session"}
          </Button>

          {selectedTherapy && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-xs space-y-1">
                <p className="font-medium">Session Summary:</p>
                <p>Therapy: {level1Therapies.find(t => t.id === selectedTherapy)?.name}</p>
                <p>Checkpoints: {checkedItems.size}/{currentCPs.length} ({pct}%)</p>
                <p>Pain: {formData.painBefore || "?"} → {formData.painAfter || "?"}</p>
                <p>Response: {formData.immediateResponse || "Not recorded"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
