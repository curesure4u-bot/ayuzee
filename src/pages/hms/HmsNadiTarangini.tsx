import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Brain, Upload, FileText, Activity, Heart, Download } from "lucide-react";

const mockReports = [
  { id: "NT-001", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-28", device: "Nadi Tarangini v3.2", prakriti: "Vata-Pitta", vikruti: "Vata↑", pulseRate: 78, rhythm: "Irregular", vataScore: 72, pittaScore: 58, kaphaScore: 30, agni: "Vishama", status: "Reviewed" },
  { id: "NT-002", patient: "Mrs. Kalpana (AL-9201)", date: "2026-07-27", device: "Nadi Tarangini v3.2", prakriti: "Pitta-Kapha", vikruti: "Pitta↑", pulseRate: 82, rhythm: "Regular", vataScore: 35, pittaScore: 78, kaphaScore: 52, agni: "Tikshna", status: "Pending" },
  { id: "NT-003", patient: "Mr. Kubbusamy (AL-8990)", date: "2026-07-26", device: "AyuSynk Pulse", prakriti: "Kapha", vikruti: "Vata-Kapha↑", pulseRate: 64, rhythm: "Regular", vataScore: 55, pittaScore: 28, kaphaScore: 75, agni: "Manda", status: "Reviewed" },
];

const HmsNadiTarangini = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Nadi Tarangini — Device Reports</h1><p className="text-muted-foreground text-sm">Machine-generated pulse waveform analysis with AI Dosha correlation</p></div>
      <Button onClick={() => toast.info("Connect Nadi Tarangini device via USB/Bluetooth")}><Upload className="mr-2 h-4 w-4" />Import Report</Button>
    </div>
    <Tabs defaultValue="reports"><TabsList><TabsTrigger value="reports">Reports</TabsTrigger><TabsTrigger value="waveform">Waveform Analysis</TabsTrigger><TabsTrigger value="ai">AI Interpretation</TabsTrigger></TabsList>
      <TabsContent value="reports">
        <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">Date</th><th className="p-3">Device</th><th className="p-3">Pulse</th><th className="p-3">V/P/K Score</th><th className="p-3">Vikruti</th><th className="p-3">Agni</th><th className="p-3">Status</th></tr></thead>
          <tbody>{mockReports.map(r => (<tr key={r.id} className="border-t"><td className="p-3 font-mono text-xs">{r.id}</td><td className="p-3">{r.patient}</td><td className="p-3 text-center">{r.date}</td><td className="p-3 text-center text-xs">{r.device}</td><td className="p-3 text-center">{r.pulseRate} bpm ({r.rhythm})</td><td className="p-3 text-center"><span className="text-blue-600">{r.vataScore}</span>/<span className="text-red-600">{r.pittaScore}</span>/<span className="text-green-600">{r.kaphaScore}</span></td><td className="p-3 text-center"><Badge variant="outline">{r.vikruti}</Badge></td><td className="p-3 text-center">{r.agni}</td><td className="p-3 text-center"><Badge className={r.status === "Reviewed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{r.status}</Badge></td></tr>))}</tbody></table></CardContent></Card>
      </TabsContent>
      <TabsContent value="waveform"><Card><CardHeader><CardTitle>Pulse Waveform (Nadi Tarangini)</CardTitle></CardHeader><CardContent><div className="h-48 bg-muted rounded flex items-center justify-center text-muted-foreground">Waveform graph renders here from device data (Vata=fast/irregular, Pitta=sharp/bounding, Kapha=slow/steady)</div><p className="text-xs text-muted-foreground mt-2">Supported devices: Nadi Tarangini v3.x, AyuSynk Pulse, AtreYa Nadi</p></CardContent></Card></TabsContent>
      <TabsContent value="ai"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Dosha Correlation</CardTitle></CardHeader><CardContent className="space-y-3"><div className="p-3 rounded bg-blue-50 border border-blue-200 text-sm"><strong>AI Analysis:</strong> Pulse waveform shows elevated Vata characteristics (irregular rhythm, fast upstroke). Combined with Vishama Agni and V/P/K ratio 72/58/30 — consistent with Vata Vikruti. Recommend: Vata-pacifying protocol (warm oil massage, Bala Ashwagandha, regulated routine).</div><div className="p-3 rounded bg-green-50 border border-green-200 text-sm"><strong>Prakriti Confirmation:</strong> Device-measured pulse pattern matches clinical Prakriti assessment (Vata-Pitta). Correlation: 91%.</div></CardContent></Card></TabsContent>
    </Tabs>
  </div>
);
export default HmsNadiTarangini;
