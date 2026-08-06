import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Calendar, Pill, FlaskConical, Syringe, FileText, Heart, Activity } from "lucide-react";

const timeline = [
  { date: "22 Jul 2026", patient: "Rajesh Kumar", events: [
    { type: "visit", time: "10:30 AM", detail: "Follow-up visit (3rd). VAS Pain: 4/10 (was 7/10 on Day 1). Kati Vasti session #5 done.", icon: Activity },
    { type: "prescription", time: "10:45 AM", detail: "Rx: Rasnasaptakam 200ml ×3, Simhanada Guggulu ×1, Kottamchukkadi Taila ×1 (15 days)", icon: Pill },
    { type: "procedure", time: "11:00 AM", detail: "Kati Vasti performed — oil retained 40 min. Good tolerance.", icon: Syringe },
  ]},
  { date: "22 Jul 2026", patient: "Meera Nair", events: [
    { type: "visit", time: "11:30 AM", detail: "New complaint: Right knee pain worsened. Examined — Agnikarma indicated.", icon: Activity },
    { type: "procedure", time: "11:45 AM", detail: "Agnikarma — 3 trigger points. Samyak Dagdha achieved. Immediate relief reported.", icon: Syringe },
    { type: "prescription", time: "12:00 PM", detail: "Rx: Simhanada Guggulu ×2, Rasnasaptakam ×3. Follow-up in 7 days.", icon: Pill },
  ]},
  { date: "21 Jul 2026", patient: "Suresh Menon", events: [
    { type: "visit", time: "09:30 AM", detail: "Cervical spondylosis follow-up. Neck ROM improved 30%. Numbness reduced.", icon: Activity },
    { type: "lab", time: "09:45 AM", detail: "Ordered: X-ray Cervical Spine AP/Lateral (to compare with baseline).", icon: FlaskConical },
    { type: "prescription", time: "10:00 AM", detail: "Rx continued: Mahanarayan Taila ×2, Dashamoolarishtam ×1, Ashwagandha ×1.", icon: Pill },
  ]},
  { date: "20 Jul 2026", patient: "Priya Sharma", events: [
    { type: "visit", time: "02:00 PM", detail: "PCOD follow-up. Period normalized (28 days cycle achieved). Weight down 2 kg.", icon: Activity },
    { type: "prescription", time: "02:15 PM", detail: "Rx: Chandraprabha Vati ×2, Ashwagandha ×2, Dashamoolarishtam ×1 (30 days).", icon: Pill },
    { type: "note", time: "02:20 PM", detail: "Counseling: Continue yoga + diet chart. Review after 1 month. Reduce to maintenance dose.", icon: Heart },
  ]},
  { date: "19 Jul 2026", patient: "Anand Patel", events: [
    { type: "visit", time: "03:00 PM", detail: "Varicose veins — post Jalaukavacharana review. Heaviness 70% better. Skin color improved.", icon: Activity },
    { type: "note", time: "03:15 PM", detail: "Plan: One more leech session after 15 days. Continue compression stocking + elevation.", icon: FileText },
  ]},
];

const typeColors: Record<string, string> = {
  visit: "bg-blue-100 text-blue-700",
  prescription: "bg-green-100 text-green-700",
  procedure: "bg-red-100 text-red-700",
  lab: "bg-purple-100 text-purple-700",
  note: "bg-amber-100 text-amber-700",
};

export default function DoctorTimeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-blue-600" /> My Patient Timeline</h1>
          <p className="text-muted-foreground mt-1">Chronological view of all your consultations, prescriptions, procedures, and notes</p>
        </div>
        <Input placeholder="Filter by patient name..." className="w-48 h-8 text-xs" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-2 text-center"><Activity className="h-3.5 w-3.5 mx-auto text-blue-600" /><p className="text-lg font-bold">8</p><p className="text-[10px] text-muted-foreground">Visits (This Week)</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><Pill className="h-3.5 w-3.5 mx-auto text-green-600" /><p className="text-lg font-bold">8</p><p className="text-[10px] text-muted-foreground">Prescriptions</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><Syringe className="h-3.5 w-3.5 mx-auto text-red-600" /><p className="text-lg font-bold">4</p><p className="text-[10px] text-muted-foreground">Procedures</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><FlaskConical className="h-3.5 w-3.5 mx-auto text-purple-600" /><p className="text-lg font-bold">1</p><p className="text-[10px] text-muted-foreground">Lab Orders</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold">5</p><p className="text-[10px] text-muted-foreground">Unique Patients</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {timeline.map((day, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold text-muted-foreground px-2">{day.date}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Card>
              <CardContent className="p-3">
                <p className="font-semibold text-sm mb-2">{day.patient}</p>
                <div className="space-y-2 border-l-2 border-muted pl-3 ml-1">
                  {day.events.map((event, j) => {
                    const Icon = event.icon;
                    return (
                      <div key={j} className="flex items-start gap-2">
                        <div className={`p-1 rounded ${typeColors[event.type]}`}><Icon className="h-3 w-3" /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[9px] ${typeColors[event.type]}`}>{event.type}</Badge>
                            <span className="text-[10px] text-muted-foreground">{event.time}</span>
                          </div>
                          <p className="text-xs mt-0.5">{event.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Timeline Insights</p><p className="text-sm text-purple-700">This week: 8 consultations, 4 procedures (highest procedure week this month). Rajesh Kumar showing consistent improvement (VAS 7→4 in 5 Kati Vasti sessions). Priya Sharma's PCOD resolved — candidate for discharge to maintenance phase. Suresh's X-ray ordered but not yet reported — follow up with lab. Average consultation time: 12 min (below your 15 min target — good efficiency).</p></div></CardContent></Card>
    </div>
  );
}
