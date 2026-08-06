import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Plus, Clock, CheckCircle2, XCircle, FileText, Upload } from "lucide-react";

const preAuthRequests = [
  { id: "PA-001", patient: "Mr. Nagaraj (AL-8472)", tpa: "Star Health", policyNo: "SH-2024-889012", treatment: "Panchakarma (14 days) — Kati Basti + Tikta Ksheer Basti", estCost: 45000, submitted: "2026-07-25", status: "Approved", approvedAmt: 38000, remarks: "Approved for 14 days. Room category: General. Panchakarma covered under AYUSH policy." },
  { id: "PA-002", patient: "Mrs. Kalpana (AL-9201)", tpa: "ICICI Lombard", policyNo: "IL-2025-442011", treatment: "IP Admission — Virechana + Post-care (7 days)", estCost: 28000, submitted: "2026-07-27", status: "Pending", approvedAmt: 0, remarks: "Under review by TPA. Expected response: 48 hrs." },
  { id: "PA-003", patient: "Mr. Kubbusamy (AL-8990)", tpa: "New India Assurance", policyNo: "NI-2024-116789", treatment: "Spine rehabilitation (21 days)", estCost: 85000, submitted: "2026-07-20", status: "Rejected", approvedAmt: 0, remarks: "Rejected: Pre-existing condition clause. Appeal submitted." },
];

const claims = [
  { id: "CL-001", patient: "Mrs. Hameedhal (AL-15598)", tpa: "Star Health", treatment: "Vasti Course (16 days)", billedAmt: 42000, claimedAmt: 38000, settledAmt: 35000, submitted: "2026-07-10", settled: "2026-07-22", status: "Settled", tds: 1900 },
  { id: "CL-002", patient: "Mr. Nagaraj (AL-8472)", tpa: "Star Health", treatment: "Previous PK admission", billedAmt: 35000, claimedAmt: 32000, settledAmt: 0, submitted: "2026-07-15", settled: "-", status: "Under Process", tds: 0 },
  { id: "CL-003", patient: "Rabiyathubasaria (AL-15568)", tpa: "Bajaj Allianz", treatment: "Virechana + IP 5 days", billedAmt: 25000, claimedAmt: 22000, settledAmt: 0, submitted: "2026-07-18", settled: "-", status: "Query Raised", tds: 0 },
];

const HmsInsurancePreauth = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Insurance Pre-Auth & Claims</h1><p className="text-sm text-muted-foreground">Submit pre-authorization, track approvals, manage claim submission & settlement</p></div>
      <Button onClick={() => toast.info("New pre-auth request form")}><Plus className="mr-2 h-4 w-4" />New Pre-Auth</Button>
    </div>

    <Tabs defaultValue="preauth"><TabsList><TabsTrigger value="preauth">Pre-Authorization</TabsTrigger><TabsTrigger value="claims">Claims & Settlement</TabsTrigger><TabsTrigger value="analytics">Rejection Analytics</TabsTrigger></TabsList>
      <TabsContent value="preauth">
        <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">TPA</th><th className="p-3 text-left">Treatment</th><th className="p-3">Est. Cost</th><th className="p-3">Approved</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>{preAuthRequests.map(r => (<tr key={r.id} className="border-t"><td className="p-3 font-mono text-xs">{r.id}</td><td className="p-3">{r.patient}</td><td className="p-3 text-xs">{r.tpa}</td><td className="p-3 text-xs">{r.treatment}</td><td className="p-3 text-center">₹{(r.estCost/1000).toFixed(0)}K</td><td className="p-3 text-center">{r.approvedAmt > 0 ? `₹${(r.approvedAmt/1000).toFixed(0)}K` : "-"}</td><td className="p-3"><Badge className={r.status === "Approved" ? "bg-green-100 text-green-800" : r.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{r.status}</Badge></td><td className="p-3">{r.status === "Rejected" && <Button size="sm" variant="outline" onClick={() => toast.info("Appeal submitted")}>Appeal</Button>}</td></tr>))}</tbody></table></CardContent></Card>
      </TabsContent>
      <TabsContent value="claims">
        <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">TPA</th><th className="p-3">Billed</th><th className="p-3">Claimed</th><th className="p-3">Settled</th><th className="p-3">TDS</th><th className="p-3">Status</th></tr></thead>
          <tbody>{claims.map(c => (<tr key={c.id} className="border-t"><td className="p-3 font-mono text-xs">{c.id}</td><td className="p-3">{c.patient}</td><td className="p-3 text-xs">{c.tpa}</td><td className="p-3 text-center">₹{(c.billedAmt/1000).toFixed(0)}K</td><td className="p-3 text-center">₹{(c.claimedAmt/1000).toFixed(0)}K</td><td className="p-3 text-center">{c.settledAmt > 0 ? `₹${(c.settledAmt/1000).toFixed(0)}K` : "-"}</td><td className="p-3 text-center">{c.tds > 0 ? `₹${c.tds}` : "-"}</td><td className="p-3"><Badge className={c.status === "Settled" ? "bg-green-100 text-green-800" : c.status === "Query Raised" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{c.status}</Badge></td></tr>))}</tbody></table></CardContent></Card>
      </TabsContent>
      <TabsContent value="analytics"><Card><CardHeader><CardTitle>Rejection Reasons (Last 6 months)</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
        <div className="flex justify-between p-2 bg-red-50 rounded"><span>Pre-existing condition clause</span><span className="font-bold">35%</span></div>
        <div className="flex justify-between p-2 bg-amber-50 rounded"><span>Incomplete documents</span><span className="font-bold">25%</span></div>
        <div className="flex justify-between p-2 bg-amber-50 rounded"><span>Treatment not in policy scope</span><span className="font-bold">20%</span></div>
        <div className="flex justify-between p-2 bg-muted rounded"><span>Room category mismatch</span><span className="font-bold">12%</span></div>
        <div className="flex justify-between p-2 bg-muted rounded"><span>Waiting period not completed</span><span className="font-bold">8%</span></div>
        <p className="text-xs text-muted-foreground mt-3">AI Suggestion: Pre-verify patient policy coverage BEFORE admission. 60% of rejections are preventable with upfront eligibility check.</p>
      </CardContent></Card></TabsContent>
    </Tabs>
  </div>
);
export default HmsInsurancePreauth;
