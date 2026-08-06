import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Target, CheckCircle2, Clock, Activity, Printer } from "lucide-react";

const stages = [
  { id: 1, name: "First Contact", ayush: "Darshana", status: "completed", date: "2026-07-10", detail: "OPD registration, chief complaint recorded" },
  { id: 2, name: "Assessment", ayush: "Pariksha", status: "completed", date: "2026-07-12", detail: "Nadi Pariksha, Prakriti assessment, Lab orders" },
  { id: 3, name: "Diagnosis", ayush: "Nidana", status: "completed", date: "2026-07-14", detail: "Gridhrasi (Sciatica) - L4-L5 disc involvement" },
  { id: 4, name: "Treatment Plan", ayush: "Chikitsa Yoga", status: "completed", date: "2026-07-15", detail: "14-day Kati Basti + Tikta Ksheer Basti protocol" },
  { id: 5, name: "Poorvakarma", ayush: "Snehana/Swedana", status: "current", date: "2026-07-20", detail: "Snehapana Day 5 - Mahatiktaka Ghrita 150ml" },
  { id: 6, name: "Pradhanakarma", ayush: "Virechana", status: "upcoming", date: "2026-07-28", detail: "Scheduled after Samyak Snigdha confirmation" },
  { id: 7, name: "Paschatkarma", ayush: "Samsarjana", status: "upcoming", date: "2026-07-30", detail: "Peya to Vilepi to Yusha graduated diet" },
  { id: 8, name: "Follow-up", ayush: "Paschat Karma", status: "upcoming", date: "2026-08-15", detail: "1-month review, repeat Nadi, lab comparison" },
  { id: 9, name: "Wellness", ayush: "Rasayana", status: "upcoming", date: "2026-09-01", detail: "Rasayana therapy + Yoga maintenance plan" },
];

const PatientJourneyMap = () => {
  const currentIdx = stages.findIndex(s => s.status === "current");
  const progress = ((currentIdx + 0.5) / stages.length) * 100;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Target className="h-5 w-5" /> Patient Journey Map</h2>
        <Button size="sm" variant="outline" onClick={() => toast.info("Printing journey card")}><Printer className="mr-1 h-3 w-3" /> Print</Button>
      </div>
      <Card className="border-blue-200"><CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2"><span className="text-sm font-bold">Mr. Rajesh Kumar (AL-12543)</span><Badge>Gridhrasi</Badge><Badge variant="outline" className="text-[10px]">Stage 5/9</Badge></div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-gray-200 rounded-full" style={{ width: `${progress}%` }} /></div>
        <p className="text-[10px] text-muted-foreground mt-1">{progress.toFixed(0)}% completed — Currently in Poorvakarma</p>
      </CardContent></Card>
      <div className="space-y-2">{stages.map((stage) => (
        <Card key={stage.id} className={`${stage.status === "current" ? "border-amber-400 bg-amber-50" : stage.status === "completed" ? "border-green-200" : "opacity-60"}`}>
          <CardContent className="p-3 flex items-center gap-4">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${stage.status === "completed" ? "bg-green-500 text-white" : stage.status === "current" ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
              {stage.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : stage.status === "current" ? <Activity className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            <div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm font-medium">{stage.name}</span><Badge variant="outline" className="text-[9px] text-purple-600">{stage.ayush}</Badge></div><p className="text-[10px] text-muted-foreground">{stage.detail}</p></div>
            <div className="text-right shrink-0"><p className="text-[10px] text-muted-foreground">{stage.date}</p>{stage.status === "current" && <Button size="sm" className="h-5 text-[9px] bg-green-600 mt-1" onClick={() => toast.success("Stage advanced!")}>Complete</Button>}</div>
          </CardContent>
        </Card>
      ))}</div>
    </div>
  );
};
export default PatientJourneyMap;
