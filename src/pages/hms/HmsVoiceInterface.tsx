import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mic, Brain, FileText, Pill, Activity, CheckCircle2, Users } from "lucide-react";

const voiceCommands = [
  { command: "\"Prescribe Rasnasaptakam 15ml BD for 15 days\"", result: "→ Rx added: Rasnasaptakam Kashayam 200ml × 3, 15ml + warm water, 6AM & 6PM, Before food", status: "Executed" },
  { command: "\"Book Kati Basti for Nagaraj tomorrow 10 AM\"", result: "→ OPT scheduled: Kati Basti, Mr. Nagaraj, 01-Aug 10:00 AM, PK Room 1, Th. Priya", status: "Executed" },
  { command: "\"What is Nagaraj's last SLR reading?\"", result: "→ SLR: Left 35°, Right 70° (measured 28-Jul-2026). Previous: Left 20°, Right 60° — Improved.", status: "Answered" },
  { command: "\"Order CBC and ESR for Kalpana\"", result: "→ Lab order created: CBC + ESR for Mrs. Kalpana (AL-9201). Sent to Lab counter.", status: "Executed" },
  { command: "\"Discharge Hameedhal with follow-up next Monday\"", result: "→ Discharge initiated: Mrs. Hameedhal. Follow-up: Mon 04-Aug 9:30 AM. Summary generating...", status: "Executed" },
  { command: "\"Show me today's revenue\"", result: "→ Today: ₹48,200 (OP: ₹22K, Pharmacy: ₹15K, PK: ₹8.5K, Lab: ₹2.7K)", status: "Answered" },
];

const HmsVoiceInterface = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Voice-First Interface</h1><p className="text-sm text-muted-foreground">Speak naturally → HMS executes. Prescribe, order, book, query — hands-free clinical workflow.</p></div>
      <Button className="bg-red-600 hover:bg-red-700" onClick={() => toast.info("Listening... Speak your command")}><Mic className="mr-2 h-4 w-4" />Start Listening</Button>
    </div>
    <Card className="border-red-200 bg-red-50/30"><CardContent className="p-6 text-center"><Mic className="h-12 w-12 mx-auto text-red-600 mb-3" /><p className="text-lg font-semibold">Say a command...</p><p className="text-sm text-muted-foreground mt-1">Examples: "Prescribe...", "Book therapy...", "Order lab...", "Show revenue...", "Discharge patient..."</p></CardContent></Card>

    <Card><CardHeader><CardTitle>Recent Voice Commands</CardTitle></CardHeader><CardContent className="space-y-3">
      {voiceCommands.map((v, i) => (
        <div key={i} className="p-3 border rounded-lg">
          <div className="flex items-center gap-2 mb-1"><Mic className="h-3.5 w-3.5 text-red-600" /><p className="text-sm font-medium">{v.command}</p><Badge className={v.status === "Executed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{v.status}</Badge></div>
          <p className="text-xs text-muted-foreground pl-6">{v.result}</p>
        </div>
      ))}
    </CardContent></Card>

    <Card><CardHeader><CardTitle>What You Can Do by Voice</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 bg-green-50 rounded"><Pill className="h-4 w-4 mb-1 text-green-600" /><strong>Prescribe</strong><br/>"Prescribe [medicine] [dose] [frequency] [duration]"</div>
      <div className="p-3 bg-blue-50 rounded"><Activity className="h-4 w-4 mb-1 text-blue-600" /><strong>Book Therapy</strong><br/>"Book [therapy] for [patient] [date] [time]"</div>
      <div className="p-3 bg-purple-50 rounded"><FileText className="h-4 w-4 mb-1 text-purple-600" /><strong>Order Labs</strong><br/>"Order [test] for [patient]"</div>
      <div className="p-3 bg-amber-50 rounded"><Users className="h-4 w-4 mb-1 text-amber-600" /><strong>Query</strong><br/>"Show me [patient]'s [vitals/reports/history]"</div>
    </CardContent></Card>
  </div>
);
export default HmsVoiceInterface;
