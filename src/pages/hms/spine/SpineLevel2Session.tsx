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
  Save, ClipboardList, Sparkles, Heart, Calendar,
} from "lucide-react";

export default function SpineLevel2Session() {
  const [selectedTherapy, setSelectedTherapy] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    patientName: "", sessionNumber: "1", dayOfCourse: "1", totalDays: "7",
    duration: "45", intensity: "", bodyArea: "", spinalLevel: "",
    painBefore: "", painAfter: "", immediateResponse: "",
    doctorNotes: "", oilUsed: "", oilTemp: "", retentionTime: "",
    nextPlan: "", homeAdvice: "",
  });

  const level2Therapies = [
    { id: 1, name: "Kati Basti", desc: "Warm medicated oil retention on lumbar spine (dam technique)", duration: "30-40 min", days: "7 days", price: "₹8,500", indication: "Low back pain, Sciatica, Disc problems" },
    { id: 2, name: "Greeva Basti", desc: "Oil retention on cervical spine for neck disorders", duration: "30 min", days: "7 days", price: "₹8,500", indication: "Neck pain, Cervical spondylosis, Arm numbness" },
    { id: 3, name: "Prishtha Basti", desc: "Full spine oil retention for multi-level involvement", duration: "45 min", days: "14 days", price: "₹16,000", indication: "Full spine stiffness, Ankylosing spondylitis" },
    { id: 4, name: "Tikta Ksheer Basti", desc: "Medicated enema (bitter herbs + milk) for bone/nerve nourishment", duration: "30 min", days: "16 days", price: "₹12,000", indication: "Disc degeneration, Osteoporosis, Deep nerve pain" },
    { id: 5, name: "Patra Pinda Sweda", desc: "Warm herbal leaf bolus massage for muscle release", duration: "45 min", days: "7 days", price: "₹7,000", indication: "Muscle spasm, Morning stiffness, Inflammation" },
    { id: 6, name: "Nasya + Greeva Basti", desc: "Nasal oil therapy combined with cervical oil retention", duration: "45 min", days: "7 days", price: "₹9,500", indication: "Cervicogenic headache, C1-C3 involvement" },
    { id: 7, name: "Meru Chikitsa", desc: "Ayurvedic spine manipulation/correction technique", duration: "20 min", days: "5 sessions", price: "₹5,000", indication: "Spinal misalignment, Postural correction" },
    { id: 8, name: "Spine Yoga Therapy", desc: "Therapeutic yoga protocol specific to spine condition", duration: "45 min", days: "21 days", price: "₹6,000", indication: "Maintenance, Prevention, Mild chronic pain" },
    { id: 9, name: "Abhyanga + Swedana", desc: "Full body oil massage followed by steam/sudation therapy", duration: "60 min", days: "7 days", price: "₹7,000", indication: "Generalized Vata, Stiffness, Pre-Basti preparation" },
    { id: 10, name: "Pizhichil (Sarvanga Dhara)", desc: "Continuous warm oil pouring over entire body", duration: "60 min", days: "7 days", price: "₹14,000", indication: "Severe degeneration, Paralysis, Neurological spine" },
    { id: 11, name: "Shirodhara", desc: "Continuous oil stream on forehead for neuro-calming", duration: "45 min", days: "7 days", price: "₹7,000", indication: "Stress spine, Insomnia from pain, Cervical tension" },
    { id: 12, name: "Nadi Sweda (Local Steam)", desc: "Targeted steam application on spine using herbal decoction", duration: "15 min", days: "7-14 days", price: "₹3,000", indication: "Post-Basti, Stiffness, Morning rigidity" },
    { id: 13, name: "Choorna Pinda Sweda", desc: "Herbal powder bolus massage (dry heat therapy)", duration: "45 min", days: "7 days", price: "₹6,000", indication: "Kapha-Vata conditions, Obesity + spine, Swelling" },
    { id: 14, name: "Upanaha Sweda (Poultice)", desc: "Warm herbal paste application + bandage overnight", duration: "Apply 30 min", days: "7 nights", price: "₹4,000", indication: "Severe joint stiffness, Osteoarthritis spine, Frozen segments" },
    { id: 15, name: "Lepa (Herbal Paste Application)", desc: "Cold/warm medicated paste on affected spine area", duration: "30 min", days: "7-14 days", price: "₹3,500", indication: "Inflammation, Acute flare, Pitta-type spine pain" },
    { id: 16, name: "Raktamokshana (Jalaukavacharana)", desc: "Leech therapy / controlled bloodletting for inflammatory spine", duration: "30 min", days: "1-3 sessions", price: "₹2,000", indication: "Pitta-Rakta disorders, Inflammatory spine, Nerve root inflammation" },
    { id: 17, name: "Katee Dhara", desc: "Continuous medicated liquid stream on lumbar region", duration: "30 min", days: "7 days", price: "₹6,000", indication: "Degenerative lumbar, Post-surgery rehab, Chronic inflammation" },
    { id: 18, name: "Virechana (Therapeutic Purgation)", desc: "Controlled purgation for Pitta-dominant spine disorders", duration: "1 day procedure", days: "1 day + 7 days prep", price: "₹5,000", indication: "Pitta-type sciatica, Inflammatory radiculopathy" },
    { id: 19, name: "Matra Basti (Daily Oil Enema)", desc: "Small quantity oil enema given daily for Vata pacification", duration: "15 min", days: "7-30 days", price: "₹5,000", indication: "Chronic Vata, Elderly spine, Post-Panchakarma maintenance" },
    { id: 20, name: "Taila Dhara (Oil Stream)", desc: "Continuous warm oil stream on specific spine segment", duration: "30 min", days: "7 days", price: "₹7,000", indication: "Nerve root compression, Disc bulge, Radiculopathy" },
    { id: 21, name: "GH Pack (Gastro-Hepatic)", desc: "Naturopathy mud/cold pack on abdomen — improves spine via gut-nerve axis", duration: "20 min", days: "7-14 days", price: "₹2,000", indication: "Spine + digestive issues, Vata-Apana correction, Constipation-related LBP" },
    { id: 22, name: "Mud Pack (Spine)", desc: "Cold/warm mud application directly on spine — detox + anti-inflammatory", duration: "30 min", days: "7 days", price: "₹2,500", indication: "Pitta-type inflammation, Swelling, Acute flare, Heat in spine" },
    { id: 23, name: "Hip Bath (Kati Snana)", desc: "Patient sits in warm/cold water tub up to navel — lumbar + pelvic circulation", duration: "20 min", days: "7-14 days", price: "₹2,000", indication: "Lumbar stiffness, SI joint, Pelvic floor + spine connection, Apana Vayu" },
    { id: 24, name: "Spine Bath (Spinal Spray)", desc: "Continuous warm/alternating water spray along entire spine — nerve toning", duration: "15 min", days: "7 days", price: "₹2,000", indication: "Full spine stiffness, Nerve toning, Morning rigidity, Circulation boost" },
    { id: 25, name: "Plantain Leaf Bath / Wrap", desc: "Warm plantain leaves wrapped around spine — natural anti-inflammatory poultice", duration: "30 min", days: "7 days", price: "₹2,500", indication: "Natural Sweda (sudation), Muscle relaxation, Post-Panchakarma support" },
    { id: 26, name: "Diet Therapy (Spine-Specific)", desc: "Condition-specific diet plan — anti-inflammatory, Vata-pacifying, bone-nourishing foods", duration: "Ongoing", days: "Full course", price: "Included", indication: "All spine patients — foundation of healing, speeds recovery 30-40%" },
    { id: 27, name: "Enema (Naturopathy)", desc: "Warm water / coffee / herbal enema for gut detox — clears Apana Vayu blockage", duration: "15 min", days: "3-7 days", price: "₹1,500", indication: "Constipation + LBP, Toxic load, Pre-treatment cleansing" },
    { id: 28, name: "Wet Sheet Pack", desc: "Full body wet sheet wrapping — deep relaxation + detoxification + nerve calming", duration: "45 min", days: "5-7 days", price: "₹3,000", indication: "Stress-related spine, Insomnia from pain, Full body Vata calming" },
  ];
  const [customTherapies, setCustomTherapies] = useState<{id: number; name: string; desc: string; duration: string; days: string; price: string; indication: string}[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTherapy, setNewTherapy] = useState({ name: "", desc: "", duration: "", days: "", price: "", indication: "" });
  const [dailySchedule, setDailySchedule] = useState<number[]>([]);

  const allTherapies = [...level2Therapies, ...customTherapies];

  const addCustomTherapy = () => {
    if (!newTherapy.name) return;
    setCustomTherapies(prev => [...prev, { id: 100 + prev.length, ...newTherapy }]);
    setNewTherapy({ name: "", desc: "", duration: "", days: "", price: "", indication: "" });
    setShowAddForm(false);
    toast.success("Custom therapy added!");
  };

  const toggleDailySchedule = (id: number) => {
    setDailySchedule(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const level2Checkpoints: Record<number, { name: string; category: string }[]> = {
    1: [ // Kati Basti
      { name: "Patient positioned prone, lumbar exposed", category: "preparation" },
      { name: "Black gram dough dam prepared (circular, leak-proof)", category: "preparation" },
      { name: "Dam placed around lumbar spine (L1-S1 coverage)", category: "execution" },
      { name: "Oil warmed to 42-44°C (Dhanwantaram/Ksheerabala)", category: "preparation" },
      { name: "Oil poured into dam (fill completely)", category: "execution" },
      { name: "Temperature maintained throughout (replace when cool)", category: "execution" },
      { name: "Retention time: 30-40 minutes", category: "execution" },
      { name: "Gentle massage within dam during retention", category: "execution" },
      { name: "Oil removed, dam removed, area wiped clean", category: "aftercare" },
      { name: "Post-Basti hot water fomentation / Nadi Sweda", category: "aftercare" },
      { name: "VAS recorded before and after", category: "assessment" },
      { name: "ROM assessed (flexion/extension)", category: "assessment" },
      { name: "Patient advised: rest 30 min, avoid cold, light diet", category: "aftercare" },
    ],
    2: [ // Greeva Basti
      { name: "Patient positioned prone, cervical exposed", category: "preparation" },
      { name: "Dough dam prepared (oval shape for neck contour)", category: "preparation" },
      { name: "Dam placed around cervical spine (C1-T1 coverage)", category: "execution" },
      { name: "Oil warmed to 40-42°C (Ksheerabala/Mahamasha)", category: "preparation" },
      { name: "Oil poured into dam carefully (avoid spillage into ears)", category: "execution" },
      { name: "Temperature maintained (replace oil every 5-7 min)", category: "execution" },
      { name: "Retention time: 25-30 minutes", category: "execution" },
      { name: "Gentle occipital/suboccipital massage during retention", category: "execution" },
      { name: "Oil removed, dam removed, neck wiped", category: "aftercare" },
      { name: "Post-Basti Nadi Sweda (steam) on neck", category: "aftercare" },
      { name: "VAS recorded before and after", category: "assessment" },
      { name: "Neck ROM assessed (rotation, lateral flexion)", category: "assessment" },
      { name: "Patient advised: avoid AC/fan, keep neck warm, light diet", category: "aftercare" },
    ],
    3: [ // Prishtha Basti
      { name: "Patient positioned prone, full spine exposed", category: "preparation" },
      { name: "Extended dough dam prepared (full spine length)", category: "preparation" },
      { name: "Dam placed along entire spine (C7-Sacrum)", category: "execution" },
      { name: "Oil warmed to 42°C (Sahacharadi + Dhanwantaram mix)", category: "preparation" },
      { name: "Oil poured to fill entire spinal dam", category: "execution" },
      { name: "Temperature maintained throughout (40-45 min)", category: "execution" },
      { name: "Segmental massage within dam at affected levels", category: "execution" },
      { name: "Oil removed, spine wiped, full back massage", category: "aftercare" },
      { name: "Patra Pinda Sweda post-treatment (10 min)", category: "aftercare" },
      { name: "VAS recorded, full spine ROM assessed", category: "assessment" },
      { name: "Patient advised complete rest day of treatment", category: "aftercare" },
    ],
    4: [ // Tikta Ksheer Basti
      { name: "Prakriti & Agni assessment (personalize formula)", category: "preparation" },
      { name: "Basti Dravya prepared (Tikta herbs + Ksheer + Taila)", category: "preparation" },
      { name: "Patient positioned left lateral / knee-chest", category: "preparation" },
      { name: "Anal area lubricated with oil", category: "preparation" },
      { name: "Basti administered (Niruha/Anuvasana as per schedule)", category: "execution" },
      { name: "Patient retains for prescribed time (Niruha: 48 min max)", category: "execution" },
      { name: "Evacuation observed and documented", category: "assessment" },
      { name: "Post-Basti observation: energy, appetite, pain", category: "assessment" },
      { name: "Schedule noted: Day type (Anuvasana/Niruha alternating)", category: "execution" },
      { name: "Diet instructions: light, warm, Vata-pacifying", category: "aftercare" },
      { name: "VAS + overall wellness score recorded", category: "assessment" },
    ],
    5: [ // Patra Pinda Sweda
      { name: "Herbal leaves selected (Nirgundi, Eranda, Arka, Dhatura)", category: "preparation" },
      { name: "Leaves cut + fried in oil with rock salt + lemon", category: "preparation" },
      { name: "Tied into bolus (Pinda) in cloth", category: "preparation" },
      { name: "Two boluses prepared + heated in oil", category: "preparation" },
      { name: "Abhyanga (oil massage) done on back first", category: "execution" },
      { name: "Hot bolus applied in circular + linear strokes on spine", category: "execution" },
      { name: "Both sides of spine treated (erector spinae)", category: "execution" },
      { name: "Reheat bolus when temperature drops", category: "execution" },
      { name: "Duration: 30-45 min (until sweating starts)", category: "execution" },
      { name: "Wipe area, rest in warm room 15 min", category: "aftercare" },
      { name: "VAS + stiffness score recorded", category: "assessment" },
      { name: "ROM improvement noted", category: "assessment" },
    ],
    6: [ // Nasya + Greeva Basti
      { name: "Facial steam/hot towel for 5 min (open sinuses)", category: "preparation" },
      { name: "Patient supine, head tilted back", category: "preparation" },
      { name: "Anu Taila / Ksheerabala instilled (6-8 drops per nostril)", category: "execution" },
      { name: "Patient inhales gently, retain 5 min", category: "execution" },
      { name: "Gargle with warm water post-Nasya", category: "aftercare" },
      { name: "Then proceed to Greeva Basti (same session)", category: "execution" },
      { name: "Greeva Basti checkpoints (as per Greeva Basti protocol)", category: "execution" },
      { name: "Combined VAS assessment: headache + neck pain", category: "assessment" },
      { name: "Patient advised: avoid cold air, cover head/neck", category: "aftercare" },
    ],
    7: [ // Meru Chikitsa
      { name: "Full spine assessment (restriction, tenderness, alignment)", category: "preparation" },
      { name: "Warm oil applied along spine", category: "preparation" },
      { name: "Gentle traction at affected level", category: "execution" },
      { name: "Spinal mobilization / adjustment technique applied", category: "execution" },
      { name: "Patient breathing coordinated with correction", category: "execution" },
      { name: "Post-correction ROM tested immediately", category: "assessment" },
      { name: "Stabilization exercise taught post-correction", category: "aftercare" },
      { name: "VAS before and after", category: "assessment" },
      { name: "Advise: avoid heavy lifting 48hr, maintain posture", category: "aftercare" },
    ],
    8: [ // Spine Yoga Therapy
      { name: "Condition-specific asana sequence selected", category: "preparation" },
      { name: "Warm-up: Sukshma Vyayama (micro-exercises)", category: "execution" },
      { name: "Pranayama: Anuloma Viloma / Bhramari (5 min)", category: "execution" },
      { name: "Main asanas performed (graded difficulty)", category: "execution" },
      { name: "Hold times and repetitions documented", category: "execution" },
      { name: "Pain monitoring during each asana", category: "assessment" },
      { name: "Shavasana (relaxation) 5-10 min", category: "execution" },
      { name: "VAS before and after session", category: "assessment" },
      { name: "Home practice chart given/updated", category: "aftercare" },
    ],
    9: [ // Abhyanga + Swedana
      { name: "Oil selected based on Dosha (Til/Ksheerabala/Mahanarayan)", category: "preparation" },
      { name: "Oil warmed to comfortable temperature", category: "preparation" },
      { name: "Full body Abhyanga (systematic massage 30-40 min)", category: "execution" },
      { name: "Special focus on spine: long strokes along erectors", category: "execution" },
      { name: "Marma points stimulated during Abhyanga", category: "execution" },
      { name: "Bashpa Sweda (steam box) or Nadi Sweda applied", category: "execution" },
      { name: "Sweating observed (Samyak Swinna Lakshana)", category: "assessment" },
      { name: "Rest in warm room 15-20 min post-steam", category: "aftercare" },
      { name: "Warm water bath after rest period", category: "aftercare" },
      { name: "VAS + flexibility assessed", category: "assessment" },
    ],
    10: [ // Pizhichil
      { name: "Patient on Droni (wooden treatment table)", category: "preparation" },
      { name: "Oil quantity prepared (3-5 liters, warmed)", category: "preparation" },
      { name: "Two therapists positioned (one per side)", category: "preparation" },
      { name: "Continuous warm oil poured over entire body", category: "execution" },
      { name: "Simultaneous gentle massage during pouring", category: "execution" },
      { name: "Oil temperature maintained (reheat in water bath)", category: "execution" },
      { name: "Duration: 45-60 min continuous", category: "execution" },
      { name: "Special focus on spine and affected areas", category: "execution" },
      { name: "Patient wiped gently, rest 30 min warm room", category: "aftercare" },
      { name: "Light warm diet after treatment", category: "aftercare" },
      { name: "VAS + neurological assessment + ROM", category: "assessment" },
      { name: "Document session in course progress", category: "assessment" },
    ],
  };

  const [saving, setSaving] = useState(false);

  const handleSaveLevel2 = async () => {
    if (!selectedTherapy) { toast.error("Please select a therapy"); return; }
    if (!formData.patientName) { toast.error("Please enter patient name/ID"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const therapy = allTherapies.find(t => t.id === selectedTherapy);
      const completedCheckpoints = Array.from(checkedItems).map(name => {
        const cp = currentCPs.find(c => c.name === name);
        return { name, category: cp?.category || "execution", completed: true };
      });

      const { error } = await supabase.from("spine_therapy_sessions").insert({
        patient_id: user.id,
        doctor_id: user.id,
        session_number: parseInt(formData.sessionNumber) || 1,
        therapy_id: selectedTherapy <= 15 ? selectedTherapy : 1,
        therapy_name: therapy?.name || "",
        duration_minutes: parseInt(formData.duration) || 45,
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
        home_exercise_given: formData.homeAdvice || null,
        status: "completed",
      });

      if (error) {
        console.error("Save error:", error);
        toast.error("Failed to save: " + error.message);
      } else {
        toast.success(`Day ${formData.dayOfCourse} session saved! Recovery score updated.`);
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
    switch (cat) { case "preparation": return "bg-blue-100 text-blue-700"; case "execution": return "bg-green-100 text-green-700"; case "assessment": return "bg-purple-100 text-purple-700"; case "aftercare": return "bg-amber-100 text-amber-700"; case "safety": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };
  const currentCPs = selectedTherapy ? level2Checkpoints[selectedTherapy] || [] : [];
  const pct = currentCPs.length > 0 ? Math.round((checkedItems.size / currentCPs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-purple-600" /> Level 2: Panchakarma Protocol Session</h1>
          <p className="text-muted-foreground mt-1">Course-based treatment · Record daily progress · Oil retention + Basti + Sweda protocols</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700"><Calendar className="h-3 w-3 mr-1" /> Course Treatment</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Patient & Course Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Patient Name / ID</label><Input placeholder="Search patient..." value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="mt-1" /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs font-medium">Session #</label><Input type="number" value={formData.sessionNumber} onChange={e => setFormData({...formData, sessionNumber: e.target.value})} className="mt-1" /></div>
                <div><label className="text-xs font-medium">Day of Course</label><Input type="number" value={formData.dayOfCourse} onChange={e => setFormData({...formData, dayOfCourse: e.target.value})} className="mt-1" /></div>
                <div><label className="text-xs font-medium">Total Days</label><Input type="number" value={formData.totalDays} onChange={e => setFormData({...formData, totalDays: e.target.value})} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Duration (min)</label><Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="mt-1" /></div>
                <div><label className="text-xs font-medium">Spinal Level</label><Input placeholder="e.g., L4-S1" value={formData.spinalLevel} onChange={e => setFormData({...formData, spinalLevel: e.target.value})} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Oil Used</label><Input placeholder="e.g., Dhanwantaram" value={formData.oilUsed} onChange={e => setFormData({...formData, oilUsed: e.target.value})} className="mt-1" /></div>
                <div><label className="text-xs font-medium">Oil Temp (°C)</label><Input placeholder="e.g., 42" value={formData.oilTemp} onChange={e => setFormData({...formData, oilTemp: e.target.value})} className="mt-1" /></div>
              </div>
              {/* Course Progress */}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Course Progress: Day {formData.dayOfCourse} of {formData.totalDays}</p>
                <Progress value={(parseInt(formData.dayOfCourse || "1") / parseInt(formData.totalDays || "7")) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /> Level 2 Panchakarma ({allTherapies.length})</CardTitle>
                <Button variant="outline" size="sm" className="text-[10px] h-6" onClick={() => setShowAddForm(!showAddForm)}>+ Add Custom</Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddForm && (
                <div className="mb-3 p-3 bg-purple-50 rounded border border-purple-200 space-y-2">
                  <p className="text-xs font-medium">Add New Treatment:</p>
                  <Input placeholder="Therapy name" value={newTherapy.name} onChange={e => setNewTherapy({...newTherapy, name: e.target.value})} className="h-8 text-xs" />
                  <Input placeholder="Description" value={newTherapy.desc} onChange={e => setNewTherapy({...newTherapy, desc: e.target.value})} className="h-8 text-xs" />
                  <div className="grid grid-cols-3 gap-1">
                    <Input placeholder="Duration" value={newTherapy.duration} onChange={e => setNewTherapy({...newTherapy, duration: e.target.value})} className="h-8 text-xs" />
                    <Input placeholder="Days" value={newTherapy.days} onChange={e => setNewTherapy({...newTherapy, days: e.target.value})} className="h-8 text-xs" />
                    <Input placeholder="Price" value={newTherapy.price} onChange={e => setNewTherapy({...newTherapy, price: e.target.value})} className="h-8 text-xs" />
                  </div>
                  <Button size="sm" className="w-full h-7 text-xs bg-purple-600" onClick={addCustomTherapy}>Add Therapy</Button>
                </div>
              )}
              {/* Daily Schedule Toggle */}
              {dailySchedule.length > 0 && (
                <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-[10px] font-medium text-green-700 mb-1">Today's Schedule ({dailySchedule.length} therapies):</p>
                  <div className="flex flex-wrap gap-1">
                    {dailySchedule.map(id => {
                      const t = allTherapies.find(x => x.id === id);
                      return t ? <Badge key={id} className="bg-green-100 text-green-700 text-[9px]">{t.name}</Badge> : null;
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {allTherapies.map(t => (
                  <div key={t.id} className={`flex items-center gap-2 p-2 rounded text-sm transition border ${selectedTherapy === t.id ? "bg-purple-100 border-purple-300" : "hover:bg-muted border-transparent"}`}>
                    <input type="checkbox" checked={dailySchedule.includes(t.id)} onChange={() => toggleDailySchedule(t.id)} className="h-3.5 w-3.5 rounded shrink-0" title="Add to today's schedule" />
                    <button className="flex-1 text-left" onClick={() => { setSelectedTherapy(t.id); setCheckedItems(new Set()); }}>
                      <p className="font-medium text-xs">{t.name}</p>
                      <p className="text-[9px] text-muted-foreground">{t.duration} · {t.days} · {t.price}</p>
                    </button>
                    {selectedTherapy === t.id && <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />}
                  </div>
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
                <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="h-4 w-4 text-purple-600" /> Daily Checkpoints</CardTitle>
                {selectedTherapy && <Badge className="bg-purple-100 text-purple-700 text-[10px]">{checkedItems.size}/{currentCPs.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTherapy ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a Panchakarma therapy to see daily checkpoints</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  <Progress value={pct} className="h-2 mb-3" />
                  {currentCPs.map((cp, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${checkedItems.has(cp.name) ? "bg-green-50 border-green-200" : "hover:bg-muted"}`} onClick={() => toggleCheck(cp.name)}>
                      <input type="checkbox" checked={checkedItems.has(cp.name)} readOnly className="h-4 w-4 rounded" />
                      <span className="flex-1 text-xs">{cp.name}</span>
                      <Badge className={`text-[8px] ${getCatColor(cp.category)}`}>{cp.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-amber-600" /> Daily Pain Score</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-red-600">Before Today</label><Input type="number" min="0" max="10" placeholder="0-10" value={formData.painBefore} onChange={e => setFormData({...formData, painBefore: e.target.value})} className="mt-1 border-red-200" /></div>
                <div><label className="text-xs font-medium text-green-600">After Today</label><Input type="number" min="0" max="10" placeholder="0-10" value={formData.painAfter} onChange={e => setFormData({...formData, painAfter: e.target.value})} className="mt-1 border-green-200" /></div>
              </div>
              {formData.painBefore && formData.painAfter && parseInt(formData.painBefore) > 0 && (
                <div className="mt-3 p-2 bg-green-50 rounded text-center">
                  <p className="text-sm font-bold text-green-700">Today's Improvement: {Math.round(((parseInt(formData.painBefore) - parseInt(formData.painAfter)) / parseInt(formData.painBefore)) * 100)}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Response & Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-medium">Immediate Response</label>
                <Select value={formData.immediateResponse} onValueChange={v => setFormData({...formData, immediateResponse: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Today's response" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (significant relief)</SelectItem>
                    <SelectItem value="good">Good (noticeable improvement)</SelectItem>
                    <SelectItem value="moderate">Moderate (some benefit)</SelectItem>
                    <SelectItem value="same">Same as yesterday</SelectItem>
                    <SelectItem value="worse">Slightly worse (healing reaction?)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Doctor Notes (Today)</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px]" placeholder="Today's observations, tissue response, oil absorption..." value={formData.doctorNotes} onChange={e => setFormData({...formData, doctorNotes: e.target.value})} />
              </div>
              <div><label className="text-xs font-medium">Home Advice for Tonight</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[50px]" placeholder="Diet, rest, avoid cold, exercises..." value={formData.homeAdvice} onChange={e => setFormData({...formData, homeAdvice: e.target.value})} />
              </div>
              <div><label className="text-xs font-medium">Tomorrow's Plan</label>
                <textarea className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[50px]" placeholder="Continue same / modify oil / add therapy..." value={formData.nextPlan} onChange={e => setFormData({...formData, nextPlan: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          {/* Course Milestones */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-green-600" /> Course Milestones</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1.5">
              {[
                { day: "Day 1-2", note: "Tissue absorption begins, mild soreness possible" },
                { day: "Day 3-4", note: "Oil penetration deepens, stiffness reducing" },
                { day: "Day 5-6", note: "Significant relief expected, ROM improving" },
                { day: "Day 7", note: "Course consolidation, maximum tissue saturation" },
                { day: "Post-course", note: "Maintenance exercises + monthly follow-up" },
              ].map(m => (
                <div key={m.day} className="flex items-start gap-2 p-1.5 bg-white rounded border">
                  <span className="font-bold text-green-700 shrink-0 w-16">{m.day}</span>
                  <span className="text-muted-foreground">{m.note}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12" onClick={handleSaveLevel2} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : `Save Day ${formData.dayOfCourse} Session`}
          </Button>

          {selectedTherapy && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-xs space-y-1">
                <p className="font-medium">Session Summary:</p>
                <p>Therapy: {level2Therapies.find(t => t.id === selectedTherapy)?.name}</p>
                <p>Day: {formData.dayOfCourse}/{formData.totalDays} | Oil: {formData.oilUsed || "?"} @ {formData.oilTemp || "?"}°C</p>
                <p>Checkpoints: {checkedItems.size}/{currentCPs.length} ({pct}%)</p>
                <p>Pain: {formData.painBefore || "?"} → {formData.painAfter || "?"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
