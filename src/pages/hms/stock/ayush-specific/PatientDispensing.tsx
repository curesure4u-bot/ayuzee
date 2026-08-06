import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, Users, Search, Pill, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

const patients = [
  {
    name: "Rajesh Kumar", id: "P-1001", condition: "Lumbar Spondylosis", doctor: "Dr. Arun",
    totalDispensed: 18, lastVisit: "22 Jul 2026", adherence: 85, refillDue: "29 Jul 2026",
    medicines: [
      { name: "Rasnasaptakam Kashayam 450ml", dispensed: 6, frequency: "1 bottle/15 days", lastDate: "22 Jul", nextRefill: "06 Aug", adherence: 90 },
      { name: "Simhanada Guggulu 60t", dispensed: 4, frequency: "1 box/month", lastDate: "22 Jul", nextRefill: "22 Aug", adherence: 85 },
      { name: "Kottamchukkadi Taila 200ml", dispensed: 8, frequency: "1 bottle/week (PK)", lastDate: "22 Jul", nextRefill: "29 Jul", adherence: 80 },
    ]
  },
  {
    name: "Meera Nair", id: "P-1002", condition: "Rheumatoid Arthritis", doctor: "Dr. Arun",
    totalDispensed: 24, lastVisit: "21 Jul 2026", adherence: 72, refillDue: "28 Jul 2026",
    medicines: [
      { name: "Simhanada Guggulu 60t", dispensed: 8, frequency: "1 box/month", lastDate: "21 Jul", nextRefill: "21 Aug", adherence: 75 },
      { name: "Rasnasaptakam Kashayam 450ml", dispensed: 10, frequency: "1 bottle/15 days", lastDate: "21 Jul", nextRefill: "05 Aug", adherence: 70 },
      { name: "Chandraprabha Vati 60t", dispensed: 6, frequency: "1 box/month", lastDate: "21 Jul", nextRefill: "21 Aug", adherence: 72 },
    ]
  },
  {
    name: "Suresh Menon", id: "P-1003", condition: "Cervical Spondylosis", doctor: "Dr. Priya",
    totalDispensed: 12, lastVisit: "20 Jul 2026", adherence: 92, refillDue: "03 Aug 2026",
    medicines: [
      { name: "Mahanarayan Taila 200ml", dispensed: 4, frequency: "1 bottle/2 weeks (PK)", lastDate: "20 Jul", nextRefill: "03 Aug", adherence: 95 },
      { name: "Dashamoolarishtam 450ml", dispensed: 4, frequency: "1 bottle/month", lastDate: "20 Jul", nextRefill: "20 Aug", adherence: 90 },
      { name: "Ashwagandha Churna 100g", dispensed: 4, frequency: "1 pack/month", lastDate: "20 Jul", nextRefill: "20 Aug", adherence: 90 },
    ]
  },
  {
    name: "Priya Sharma", id: "P-1004", condition: "PCOD", doctor: "Dr. Priya",
    totalDispensed: 9, lastVisit: "15 Jul 2026", adherence: 55, refillDue: "22 Jul 2026",
    medicines: [
      { name: "Chandraprabha Vati 60t", dispensed: 3, frequency: "1 box/month", lastDate: "15 Jul", nextRefill: "15 Aug", adherence: 60 },
      { name: "Ashwagandha Churna 100g", dispensed: 3, frequency: "1 pack/month", lastDate: "15 Jul", nextRefill: "15 Aug", adherence: 55 },
      { name: "Dashamoolarishtam 450ml", dispensed: 3, frequency: "1 bottle/month", lastDate: "15 Jul", nextRefill: "15 Aug", adherence: 50 },
    ]
  },
];

export default function PatientDispensing() {
  const [search, setSearch] = useState("");
  const filtered = search ? patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : patients;
  const avgAdherence = Math.round(patients.reduce((s, p) => s + p.adherence, 0) / patients.length);
  const refillsDue = patients.filter(p => {
    const d = new Date(p.refillDue);
    const now = new Date("2026-07-22");
    return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" /> Patient-wise Dispensing History
        </h1>
        <p className="text-muted-foreground mt-1">Track which medicines dispensed to which patient — refill tracking & adherence correlation</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{patients.length}</p><p className="text-xs text-muted-foreground">Active Patients</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Pill className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{patients.reduce((s, p) => s + p.totalDispensed, 0)}</p><p className="text-xs text-muted-foreground">Total Dispensed</p></CardContent></Card>
        <Card className={avgAdherence < 70 ? "border-red-200" : "border-green-200"}><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{avgAdherence}%</p><p className="text-xs text-muted-foreground">Avg Adherence</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Calendar className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{refillsDue}</p><p className="text-xs text-muted-foreground">Refills Due (7 days)</p></CardContent></Card>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search patient name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-4">
        {filtered.map((patient) => (
          <Card key={patient.id} className={patient.adherence < 60 ? "border-red-200" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {patient.name}
                    <Badge variant="outline" className="text-[10px]">{patient.id}</Badge>
                    {patient.adherence < 60 && <Badge variant="destructive" className="text-[10px]">Low Adherence</Badge>}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{patient.condition} • {patient.doctor} • Last visit: {patient.lastVisit}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Adherence</span>
                    <Progress value={patient.adherence} className="w-16 h-2" />
                    <span className={`text-xs font-bold ${patient.adherence >= 80 ? "text-green-600" : patient.adherence >= 60 ? "text-amber-600" : "text-red-600"}`}>{patient.adherence}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Refill due: {patient.refillDue}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="px-2 py-1 text-left">Medicine</th>
                      <th className="px-2 py-1 text-center">Times Dispensed</th>
                      <th className="px-2 py-1 text-center">Frequency</th>
                      <th className="px-2 py-1 text-center">Last</th>
                      <th className="px-2 py-1 text-center">Next Refill</th>
                      <th className="px-2 py-1 text-center">Adherence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.medicines.map((med, j) => (
                      <tr key={j} className="border-b">
                        <td className="px-2 py-1.5 font-medium">{med.name}</td>
                        <td className="px-2 py-1.5 text-center">{med.dispensed}x</td>
                        <td className="px-2 py-1.5 text-center text-muted-foreground">{med.frequency}</td>
                        <td className="px-2 py-1.5 text-center">{med.lastDate}</td>
                        <td className="px-2 py-1.5 text-center font-bold">{med.nextRefill}</td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={med.adherence >= 80 ? "text-green-600" : med.adherence >= 60 ? "text-amber-600" : "text-red-600"}>{med.adherence}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Adherence & Refill Intelligence</p>
            <p className="text-sm text-purple-700">
              <strong>Priya Sharma (55% adherence):</strong> Pattern detected — skips Dashamoolarishtam (taste issue). AI suggests:
              Switch to Dashamoola Arka (same action, better palatability) or Dashamoolarishtam capsules.
              <br/><strong>Rajesh Kumar:</strong> Kottamchukkadi Taila refill due in 7 days — auto-reserve from stock + WhatsApp reminder.
              <br/><strong>Correlation:</strong> Patients with &gt;80% adherence show 3.2x better clinical outcomes (spine pain VAS reduction).
              Low adherence strongly predicts dropout within 2 months — trigger retention engine.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
