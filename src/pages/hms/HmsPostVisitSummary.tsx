import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FileText, Smartphone, CheckCircle2, Clock, Brain, Send } from "lucide-react";

const recentSummaries = [
  { id: "PVS-01", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-31", doctor: "Dr. Mohamad Saleem", diagnosis: "Gridhrasi (Sciatica) — L4-L5", prescription: "Rasnasaptakam + Simhanada Guggulu + Kati Basti 7 days", diet: "Avoid: cold foods, curd, raw salads. Include: warm soups, ginger, turmeric milk", yoga: "Bhujangasana, Shalabhasana, Pawanmuktasana — 15 min morning", nextVisit: "2026-08-07", whatsappSent: true, sentAt: "10:42 AM" },
  { id: "PVS-02", patient: "Mrs. Kalpana (AL-9201)", date: "2026-07-31", doctor: "Dr. Mohamad Saleem", diagnosis: "Amavata (RA) — Active phase", prescription: "Simhanada Guggulu + Rasnadi Kashayam + Eranda Taila", diet: "Avoid: dairy, wheat, sugar. Include: anti-inflammatory spices, warm water fasting 1 day/week", yoga: "Gentle joint mobilization only — no weight-bearing", nextVisit: "2026-08-14", whatsappSent: true, sentAt: "11:15 AM" },
  { id: "PVS-03", patient: "Rabiyathubasaria (AL-15568)", date: "2026-07-31", doctor: "Dr. Sahana Fathima", diagnosis: "Pakshaghata follow-up", prescription: "Bala Ashwagandha Taila Nasya + Matra Basti + Physiotherapy", diet: "High protein (moong dal, sprouted), warm ghee, avoid heavy meals", yoga: "Pranayama (Anuloma Viloma) — 10 min", nextVisit: "2026-08-03", whatsappSent: false, sentAt: "" },
];

const autoConfig = [
  { label: "Auto-send after consultation", enabled: true },
  { label: "Include prescription details", enabled: true },
  { label: "Include diet chart (Pathya)", enabled: true },
  { label: "Include yoga/exercise", enabled: true },
  { label: "Include next appointment", enabled: true },
  { label: "Include medicine reminders setup", enabled: true },
  { label: "Send in patient's preferred language", enabled: false },
  { label: "Include Google Review link (after 2nd visit)", enabled: true },
];

const HmsPostVisitSummary = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Post-Visit Auto-Summary</h1><p className="text-sm text-muted-foreground">Auto-generate & send visit summary via WhatsApp after every consultation</p></div>
      <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />2/3 sent today</Badge>
    </div>

    <Card><CardHeader><CardTitle>Today's Summaries</CardTitle></CardHeader><CardContent className="p-0">
      <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Patient</th><th className="p-3">Doctor</th><th className="p-3 text-left">Diagnosis</th><th className="p-3 text-left">Key Advice</th><th className="p-3">Next Visit</th><th className="p-3">WhatsApp</th><th className="p-3">Action</th></tr></thead>
        <tbody>{recentSummaries.map(s => (<tr key={s.id} className="border-t"><td className="p-3 font-medium">{s.patient}</td><td className="p-3 text-xs text-center">{s.doctor}</td><td className="p-3 text-xs">{s.diagnosis}</td><td className="p-3 text-xs">{s.diet.substring(0, 50)}...</td><td className="p-3 text-center text-xs">{s.nextVisit}</td><td className="p-3 text-center">{s.whatsappSent ? <Badge className="bg-green-100 text-green-800">Sent {s.sentAt}</Badge> : <Badge className="bg-amber-100 text-amber-800">Pending</Badge>}</td><td className="p-3">{!s.whatsappSent && <Button size="sm" onClick={() => toast.success("Summary sent via WhatsApp")}><Send className="mr-1 h-3 w-3" />Send</Button>}</td></tr>))}</tbody></table>
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Summary Preview (Patient Sees This)</CardTitle></CardHeader><CardContent>
      <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-sm space-y-2 max-w-md">
        <p className="font-bold">🏥 Al Shifa Ayush — Visit Summary</p>
        <p><strong>Date:</strong> 31 Jul 2026 | <strong>Doctor:</strong> Dr. Mohamad Saleem</p>
        <p><strong>Diagnosis:</strong> Gridhrasi (Sciatica) — L4-L5</p>
        <p><strong>💊 Medicines:</strong><br/>1. Rasnasaptakam 15ml + water, 6AM & 6PM<br/>2. Simhanada Guggulu 2 tabs after food<br/>3. Kati Basti (7 days at hospital)</p>
        <p><strong>🥗 Diet:</strong> Avoid cold/curd/raw. Eat warm soups, ginger tea, turmeric milk.</p>
        <p><strong>🧘 Exercise:</strong> Bhujangasana, Shalabhasana — 15 min morning</p>
        <p><strong>📅 Next Visit:</strong> 7 Aug 2026 (Thu) at 9:30 AM</p>
        <p className="text-xs text-muted-foreground">Reply DONE daily when you take your medicine 💪</p>
      </div>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Auto-Send Configuration</CardTitle></CardHeader><CardContent className="space-y-3">
      {autoConfig.map((c, i) => (<div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded"><span className="text-sm">{c.label}</span><Switch checked={c.enabled} /></div>))}
    </CardContent></Card>
  </div>
);
export default HmsPostVisitSummary;
