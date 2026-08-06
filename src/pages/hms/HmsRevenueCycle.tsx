import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart3, AlertTriangle, CheckCircle2, Clock, Brain, Wallet } from "lucide-react";

const pipeline = [
  { stage: "Visit Completed", count: 245, value: 892000, leakage: 0, color: "bg-blue-100 text-blue-800" },
  { stage: "Bill Generated", count: 238, value: 868000, leakage: 24000, color: "bg-indigo-100 text-indigo-800" },
  { stage: "Payment Collected", count: 210, value: 756000, leakage: 112000, color: "bg-purple-100 text-purple-800" },
  { stage: "Insurance Claimed", count: 45, value: 385000, leakage: 42000, color: "bg-violet-100 text-violet-800" },
  { stage: "Fully Settled", count: 195, value: 698000, leakage: 0, color: "bg-green-100 text-green-800" },
];

const leakagePoints = [
  { issue: "Unbilled consultations (doctor forgot to close)", amount: 24000, patients: 7, fix: "Auto-bill trigger after 30 min consultation" },
  { issue: "Pending insurance claims (not submitted)", amount: 42000, patients: 12, fix: "Auto-submit claims within 24 hrs of discharge" },
  { issue: "Outstanding patient balance (no follow-up)", amount: 68000, patients: 28, fix: "WhatsApp payment reminder at 7, 14, 30 days" },
  { issue: "Pharmacy dispensed but not billed to OP", amount: 18000, patients: 9, fix: "Link Rx-to-bill auto-generation" },
  { issue: "Lab tests done but no bill raised", amount: 12000, patients: 5, fix: "Auto-bill on result entry" },
];

const HmsRevenueCycle = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Revenue Cycle Management</h1><p className="text-sm text-muted-foreground">Track: Visit → Bill → Collect → Claim → Settle. Find & fix revenue leakage.</p></div>
      <Badge className="bg-red-100 text-red-800"><AlertTriangle className="mr-1 h-3 w-3" />₹1.64L leakage detected this month</Badge>
    </div>
    <Tabs defaultValue="pipeline"><TabsList><TabsTrigger value="pipeline">Revenue Pipeline</TabsTrigger><TabsTrigger value="leakage">Leakage Points</TabsTrigger><TabsTrigger value="ai">AI Fix Suggestions</TabsTrigger></TabsList>
      <TabsContent value="pipeline">
        <div className="grid gap-2">{pipeline.map((s, i) => (<Card key={i}><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><Badge className={s.color}>{i + 1}</Badge><div><p className="font-medium">{s.stage}</p><p className="text-xs text-muted-foreground">{s.count} patients</p></div></div><div className="text-right"><p className="font-bold">₹{(s.value / 1000).toFixed(0)}K</p>{s.leakage > 0 && <p className="text-xs text-red-600">-₹{(s.leakage / 1000).toFixed(0)}K leaked</p>}</div></CardContent></Card>))}</div>
      </TabsContent>
      <TabsContent value="leakage">
        <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Issue</th><th className="p-3">Amount Lost</th><th className="p-3">Patients</th><th className="p-3 text-left">Auto-Fix</th></tr></thead>
          <tbody>{leakagePoints.map((l, i) => (<tr key={i} className="border-t"><td className="p-3">{l.issue}</td><td className="p-3 text-center font-bold text-red-600">₹{(l.amount/1000).toFixed(0)}K</td><td className="p-3 text-center">{l.patients}</td><td className="p-3 text-xs text-green-700">{l.fix}</td></tr>))}</tbody></table></CardContent></Card>
      </TabsContent>
      <TabsContent value="ai"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Revenue Recovery</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <div className="p-3 bg-green-50 rounded border border-green-200"><strong>Recoverable this month:</strong> ₹1.12L of ₹1.64L (68%) can be auto-recovered by enabling 3 automations.</div>
        <div className="p-3 bg-blue-50 rounded border border-blue-200"><strong>Action 1:</strong> Enable auto-bill generation after consultation (saves ₹24K/month)</div>
        <div className="p-3 bg-blue-50 rounded border border-blue-200"><strong>Action 2:</strong> Enable WhatsApp payment reminders for outstanding (recovers ₹45K/month)</div>
        <div className="p-3 bg-blue-50 rounded border border-blue-200"><strong>Action 3:</strong> Auto-submit insurance claims within 24 hrs (recovers ₹42K/month)</div>
      </CardContent></Card></TabsContent>
    </Tabs>
  </div>
);
export default HmsRevenueCycle;
