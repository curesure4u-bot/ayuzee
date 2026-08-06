import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Heart, Send, Printer } from "lucide-react";

type Asana = {
  sanskrit: string; english: string; duration: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  contraindications: string; benefits: string;
};

type YogaPlan = { asanas: Asana[]; pranayama: string[]; mudras: string[]; meditation: string };

const conditionPlans: Record<string, YogaPlan> = {
  gridhrasi: {
    asanas: [
      { sanskrit: "Ardha Matsyendrasana", english: "Half Spinal Twist", duration: "30 sec each side", difficulty: "Moderate", contraindications: "Acute disc herniation, pregnancy", benefits: "Relieves sciatic nerve compression, improves spinal mobility" },
      { sanskrit: "Supta Padangusthasana", english: "Reclining Hand-to-Toe", duration: "1 min each leg", difficulty: "Easy", contraindications: "Hamstring tear", benefits: "Stretches piriformis, hamstrings; reduces nerve impingement" },
      { sanskrit: "Setu Bandhasana", english: "Bridge Pose", duration: "5 breaths x 3 reps", difficulty: "Easy", contraindications: "Neck injury", benefits: "Strengthens glutes, decompresses lumbar spine" },
      { sanskrit: "Bhujangasana", english: "Cobra Pose", duration: "15 sec x 5 reps", difficulty: "Easy", contraindications: "Acute lumbar disc prolapse", benefits: "Extends spine, relieves disc pressure on nerve root" },
      { sanskrit: "Markatasana", english: "Monkey Twist", duration: "1 min each side", difficulty: "Easy", contraindications: "Severe spinal stenosis", benefits: "Gentle spinal twist releasing Vata from Kati region" },
    ],
    pranayama: ["Nadi Shodhana (Alternate Nostril) — 10 rounds", "Bhramari — 5 rounds (calms Vata)"],
    mudras: ["Vayu Mudra (30 min daily) — reduces Vata", "Prana Mudra — energizes lower limbs"],
    meditation: "Yoga Nidra (20 min) — deep relaxation for pain management",
  },
  prameha: {
    asanas: [
      { sanskrit: "Mandukasana", english: "Frog Pose", duration: "30 sec x 3", difficulty: "Moderate", contraindications: "Knee injury", benefits: "Compresses pancreas, stimulates insulin secretion" },
      { sanskrit: "Ardha Matsyendrasana", english: "Half Spinal Twist", duration: "30 sec each side", difficulty: "Moderate", contraindications: "Spinal disc issues", benefits: "Massages abdominal organs, improves pancreatic function" },
      { sanskrit: "Paschimottanasana", english: "Seated Forward Bend", duration: "1 min", difficulty: "Moderate", contraindications: "Slipped disc", benefits: "Stimulates kidneys, liver; reduces blood sugar" },
      { sanskrit: "Dhanurasana", english: "Bow Pose", duration: "15 sec x 3", difficulty: "Moderate", contraindications: "Hernia, pregnancy", benefits: "Strengthens core, activates pancreas" },
      { sanskrit: "Surya Namaskar", english: "Sun Salutation", duration: "5 rounds", difficulty: "Moderate", contraindications: "Severe cardiac issues", benefits: "Full body exercise, improves metabolism" },
    ],
    pranayama: ["Kapalabhati — 3 rounds x 30 strokes", "Bhastrika — 2 rounds (stimulates Agni)"],
    mudras: ["Apana Mudra — 15 min (helps elimination)", "Surya Mudra — 15 min (increases metabolic fire)"],
    meditation: "Trataka (candle gazing) — 10 min for concentration & metabolic balance",
  },
};

const weeklySchedule = [
  { day: "Monday", focus: "Spinal Flexibility & Core" },
  { day: "Tuesday", focus: "Pranayama & Meditation (rest day)" },
  { day: "Wednesday", focus: "Strength & Balance Asanas" },
  { day: "Thursday", focus: "Gentle Stretches & Mudra Practice" },
  { day: "Friday", focus: "Full Sequence (Asana + Pranayama)" },
  { day: "Saturday", focus: "Surya Namaskar & Kriyas" },
  { day: "Sunday", focus: "Yoga Nidra & Restorative Poses" },
];

const conditions = [
  { value: "gridhrasi", label: "Gridhrasi (Sciatica)" },
  { value: "prameha", label: "Prameha (Diabetes)" },
];

const diffColor = (d: string) => d === "Easy" ? "bg-green-100 text-green-700" : d === "Moderate" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";

const YogaPrescription = () => {
  const [condition, setCondition] = useState("");
  const plan = condition ? conditionPlans[condition] : null;

  const handlePrescribe = () => toast.success("Yoga prescription added to patient's treatment plan");
  const handlePrint = () => { window.print(); toast.info("Printing yoga chart"); };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" /> Yoga Prescription Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">AI-suggested yoga plans based on condition</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print Chart</Button>
          {plan && <Button size="sm" onClick={handlePrescribe}><Send className="h-4 w-4 mr-1" /> Prescribe</Button>}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Select Condition</CardTitle></CardHeader>
        <CardContent>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Choose condition..." /></SelectTrigger>
            <SelectContent>
              {conditions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {plan && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Recommended Asanas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {plan.asanas.map((a, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{a.sanskrit} <span className="text-muted-foreground">({a.english})</span></span>
                    <Badge className={diffColor(a.difficulty)}>{a.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration: {a.duration}</p>
                  <p className="text-xs mt-1"><span className="font-medium">Benefits:</span> {a.benefits}</p>
                  <p className="text-xs text-red-600"><span className="font-medium">CI:</span> {a.contraindications}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Pranayama</CardTitle></CardHeader>
              <CardContent><ul className="text-sm space-y-1">{plan.pranayama.map((p,i) => <li key={i}>• {p}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Mudras</CardTitle></CardHeader>
              <CardContent><ul className="text-sm space-y-1">{plan.mudras.map((m,i) => <li key={i}>• {m}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Meditation</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{plan.meditation}</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Schedule</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weeklySchedule.map(d => (
                  <div key={d.day} className="text-center border rounded p-2">
                    <p className="text-xs font-semibold">{d.day.slice(0,3)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{d.focus}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default YogaPrescription;
