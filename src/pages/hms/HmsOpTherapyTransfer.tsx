import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Users, Sparkles, Clock, CheckCircle2, CalendarClock } from "lucide-react";

const transfers = [
  { id: "OPT-01", patient: "Mr. Nagaraj (AL-8472)", opNo: "OP-1846", fromDoctor: "Dr. Mohamad Saleem", toTherapist: "Th. Priya (PK Room 1)", therapy: "Kati Basti", duration: "45 min", schedule: "Today 11:00 AM", notes: "L4-L5 Gridhrasi. Warm Sahacharadi Taila. Position: Prone. Oil temp: 40°C", status: "In Progress" },
  { id: "OPT-02", patient: "Mrs. Kalpana (AL-9201)", opNo: "OP-1849", fromDoctor: "Dr. Mohamad Saleem", toTherapist: "Th. Kavitha (PK Room 2)", therapy: "Patra Pinda Sweda", duration: "30 min", schedule: "Today 11:30 AM", notes: "Both knees. Use Nirgundi + Eranda leaves. Medium heat.", status: "Waiting" },
  { id: "OPT-03", patient: "Mrs. Hameedhal (AL-15598)", opNo: "OP-1852", fromDoctor: "Dr. Mohamad Saleem", toTherapist: "Th. Rajesh (Agnikarma Room)", therapy: "Agnikarma", duration: "15 min", schedule: "Today 12:00 PM", notes: "Trigger points: L4-L5 paraspinal bilateral. Shalaka: Pancha Dhatu. Ghee post-application.", status: "Completed" },
  { id: "OPT-04", patient: "Rabiyathubasaria (AL-15568)", opNo: "OP-1851", fromDoctor: "Dr. Sahana Fathima", toTherapist: "Th. Priya (PK Room 1)", therapy: "Greeva Basti + Nasya", duration: "60 min", schedule: "Today 2:00 PM", notes: "Cervical spondylosis. Ksheerabala Taila for Greeva Basti + Anu Taila Nasya 6 drops each nostril.", status: "Scheduled" },
  { id: "OPT-05", patient: "Mr. Kubbusamy (AL-8990)", opNo: "OP-1855", fromDoctor: "Dr. Mohamad Saleem", toTherapist: "Th. Kavitha (PK Room 2)", therapy: "Janu Basti", duration: "40 min", schedule: "Today 3:00 PM", notes: "Right knee OA. Murivenna + Kottamchukkadi mix. Keep 30 min retention.", status: "Scheduled" },
];

const HmsOpTherapyTransfer = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">OP → Therapy Transfer (OPT)</h1><p className="text-sm text-muted-foreground">Doctor consultation → Assign therapy → Therapist receives patient with full instructions</p></div>
      <div className="flex gap-2">
        <Badge variant="outline">Today: {transfers.length} transfers</Badge>
        <Button onClick={() => toast.success("New therapy transfer initiated")}><ArrowRight className="mr-2 h-4 w-4" />New Transfer</Button>
      </div>
    </div>

    <div className="grid gap-3">
      {transfers.map(t => (
        <Card key={t.id} className={t.status === "Completed" ? "border-green-200 bg-green-50/30" : t.status === "In Progress" ? "border-blue-200 bg-blue-50/30" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{t.patient}</p>
                  <Badge variant="outline" className="text-xs">{t.opNo}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge className="bg-purple-100 text-purple-800">{t.therapy}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>From: {t.fromDoctor}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>To: {t.toTherapist}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{t.duration}</span>
                  <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{t.schedule}</span>
                </div>
                <p className="text-xs bg-muted/50 p-2 rounded mt-1"><strong>Instructions:</strong> {t.notes}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={
                  t.status === "Completed" ? "bg-green-100 text-green-800" :
                  t.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                  t.status === "Waiting" ? "bg-amber-100 text-amber-800" :
                  "bg-gray-100 text-gray-800"
                }>{t.status}</Badge>
                {t.status === "Scheduled" && <Button size="sm" variant="outline" onClick={() => toast.success("Patient called to therapy room")}>Call Patient</Button>}
                {t.status === "Waiting" && <Button size="sm" onClick={() => toast.success("Therapy started")}>Start Therapy</Button>}
                {t.status === "In Progress" && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Therapy completed — patient back to doctor")}><CheckCircle2 className="mr-1 h-3 w-3" />Complete</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card><CardHeader><CardTitle>Therapy Transfer Flow</CardTitle></CardHeader><CardContent className="text-sm space-y-2">
      <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-800">1</Badge> Doctor writes therapy order during consultation</div>
      <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-800">2</Badge> System assigns therapist + room based on availability</div>
      <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-800">3</Badge> Therapist receives patient with full instructions (oil type, temperature, duration, position)</div>
      <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-800">4</Badge> Therapy performed → Timer auto-tracked → Consumables auto-deducted from stock</div>
      <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-800">5</Badge> Patient returns to doctor / next therapy / discharged</div>
      <div className="flex items-center gap-2"><Badge className="bg-green-100 text-green-800">✓</Badge> Bill auto-generated for therapy (linked to OP visit)</div>
    </CardContent></Card>
  </div>
);
export default HmsOpTherapyTransfer;
