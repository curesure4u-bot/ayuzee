import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Droplets, CheckCircle2, Plus, FileText, Users,
  Activity,
} from "lucide-react";

// Reference: Charaka Samhita - Siddhi Sthana, Ashtanga Hridaya - Sutra Sthana Ch.18

interface TherapySession {
  id: string; patientId: string; patientName: string; procedure: string; phase: string;
  startDate: string; totalDays: number; currentDay: number; therapist: string; doctor: string;
  snehanaOil: string; snehanaDays: number; swedanaType: string; vegaCount?: number;
  status: string; lastNote: string;
}

const mockSessions: TherapySession[] = [
  { id: "pk1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", procedure: "Virechana", phase: "Poorvakarma", startDate: "2026-07-20", totalDays: 14, currentDay: 5, therapist: "Therapist Anbu", doctor: "Dr. Mohamad Saleem", snehanaOil: "Mahatiktaka Ghrita", snehanaDays: 7, swedanaType: "Bashpa Sweda", status: "In Progress", lastNote: "Day 5: 150ml ghrita. Samyak Snigdha Lakshanas appearing." },
  { id: "pk2", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", procedure: "Basti", phase: "Pradhanakarma", startDate: "2026-07-18", totalDays: 19, currentDay: 7, therapist: "Therapist Lakshmi", doctor: "Dr. Mohamad Saleem", snehanaOil: "Dhanwantaram Taila", snehanaDays: 3, swedanaType: "Nadi Sweda", vegaCount: 4, status: "In Progress", lastNote: "Yoga Basti Day 5. Alternating Anuvasana/Niruha. Good retention." },
  { id: "pk3", patientId: "AL-15320", patientName: "Mr. Suresh Babu", procedure: "Vamana", phase: "Paschatkarma", startDate: "2026-07-14", totalDays: 15, currentDay: 11, therapist: "Therapist Anbu", doctor: "Dr. Mohamad Saleem", snehanaOil: "Mahakalyanaka Ghrita", snehanaDays: 7, swedanaType: "Sarvanga Sweda", vegaCount: 8, status: "Post-care", lastNote: "Samsarjana Day 4: Krita Yusha. Patient recovering well." },
];

const PanchakarmaTherapy = () => {
  const [sessions] = useState<TherapySession[]>(mockSessions);
  const [selected, setSelected] = useState<TherapySession | null>(mockSessions[0]);
  const getPhaseColor = (p: string) => { switch (p) { case "Poorvakarma": return "bg-amber-100 text-amber-700"; case "Pradhanakarma": return "bg-red-100 text-red-700"; case "Paschatkarma": return "bg-green-100 text-green-700"; default: return "bg-gray-100"; } };
  const getIcon = (p: string) => { switch (p) { case "Vamana": return "🤮"; case "Virechana": return "💊"; case "Basti": return "💉"; case "Nasya": return "👃"; case "Raktamokshana": return "🩸"; default: return "🔬"; } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Droplets className="h-5 w-5" /> Panchakarma Therapy Management</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Therapy Plan</Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">Ref: Charaka Samhita - Siddhi Sthana | Ashtanga Hridaya - Sutra Sthana Ch.18</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><span className="text-lg">🧈</span><p className="text-lg font-bold text-amber-600 mt-1">{sessions.filter(s => s.phase === "Poorvakarma").length}</p><p className="text-[10px] text-muted-foreground">Poorvakarma</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><span className="text-lg">⚡</span><p className="text-lg font-bold text-red-600 mt-1">{sessions.filter(s => s.phase === "Pradhanakarma").length}</p><p className="text-[10px] text-muted-foreground">Pradhanakarma</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><span className="text-lg">🥣</span><p className="text-lg font-bold text-green-600 mt-1">{sessions.filter(s => s.phase === "Paschatkarma").length}</p><p className="text-[10px] text-muted-foreground">Paschatkarma</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600 mt-1">{sessions.length}</p><p className="text-[10px] text-muted-foreground">Active</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold text-purple-600 mt-1">12</p><p className="text-[10px] text-muted-foreground">Completed</p></CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-2">{sessions.map((s) => (
          <Card key={s.id} className={`cursor-pointer transition hover:border-orange-300 ${selected?.id === s.id ? "border-orange-500 bg-orange-50" : ""}`} onClick={() => setSelected(s)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">{s.patientName}</span><Badge className={`text-[9px] ${getPhaseColor(s.phase)}`}>{s.phase}</Badge></div>
              <div className="flex items-center gap-2 mt-1"><span>{getIcon(s.procedure)}</span><span className="text-xs">{s.procedure}</span><Badge variant="outline" className="text-[9px]">Day {s.currentDay}/{s.totalDays}</Badge></div>
              <p className="text-[10px] text-muted-foreground mt-1">{s.therapist} | {s.doctor}</p>
            </CardContent>
          </Card>
        ))}</div>
        <div className="lg:col-span-2 space-y-3">
          {!selected ? <Card><CardContent className="p-12 text-center text-muted-foreground"><Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Select a therapy session</p></CardContent></Card> : (<>
            <Card className="border-orange-200"><CardContent className="p-4">
              <div className="flex items-center justify-between mb-3"><div><p className="font-bold text-sm">{selected.patientName} ({selected.patientId})</p><p className="text-xs text-muted-foreground">{getIcon(selected.procedure)} {selected.procedure} | {selected.phase} | Day {selected.currentDay}/{selected.totalDays}</p></div><Badge className={`${getPhaseColor(selected.phase)}`}>{selected.status}</Badge></div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2"><div className="h-full bg-gradient-to-r from-amber-400 via-red-400 to-green-400 rounded-full" style={{ width: `${(selected.currentDay / selected.totalDays) * 100}%` }} /></div>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className={`border rounded p-2 ${selected.phase === "Poorvakarma" ? "border-amber-400 bg-amber-50" : ""}`}><p className="font-medium">Poorvakarma</p><p className="text-[10px] text-muted-foreground">Snehana+Swedana</p></div>
                <div className={`border rounded p-2 ${selected.phase === "Pradhanakarma" ? "border-red-400 bg-red-50" : ""}`}><p className="font-medium">Pradhanakarma</p><p className="text-[10px] text-muted-foreground">{selected.procedure}</p></div>
                <div className={`border rounded p-2 ${selected.phase === "Paschatkarma" ? "border-green-400 bg-green-50" : ""}`}><p className="font-medium">Paschatkarma</p><p className="text-[10px] text-muted-foreground">Samsarjana</p></div>
              </div>
            </CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Treatment Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-2 text-xs">
              <p><span className="text-muted-foreground">Snehana:</span> <strong>{selected.snehanaOil}</strong> ({selected.snehanaDays} days)</p>
              <p><span className="text-muted-foreground">Swedana:</span> <strong>{selected.swedanaType}</strong></p>
              <p><span className="text-muted-foreground">Therapist:</span> <strong>{selected.therapist}</strong></p>
              {selected.vegaCount && <p><span className="text-muted-foreground">Vegas:</span> <strong>{selected.vegaCount}</strong></p>}
            </CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Latest Note</CardTitle></CardHeader><CardContent><p className="text-xs">{selected.lastNote}</p></CardContent></Card>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.info("Daily note form")}><FileText className="mr-1 h-3 w-3" /> Add Note</Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Vitals")}><Activity className="mr-1 h-3 w-3" /> Vitals</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Phase advanced")}><CheckCircle2 className="mr-1 h-3 w-3" /> Advance Phase</Button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
};

export default PanchakarmaTherapy;
