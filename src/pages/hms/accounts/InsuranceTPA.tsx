import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Shield, IndianRupee, Search, Download, CheckCircle2,
  Clock, AlertTriangle, XCircle, FileText, Upload,
  RefreshCw, Eye, Plus,
} from "lucide-react";

interface InsuranceClaim {
  id: string;
  claimNo: string;
  patientName: string;
  patientId: string;
  insuranceProvider: string;
  tpaName: string;
  policyNo: string;
  billNo: string;
  billAmount: number;
  claimAmount: number;
  approvedAmount?: number;
  submittedDate: string;
  approvedDate?: string;
  settledDate?: string;
  rejectionReason?: string;
  status: "Pre-Auth" | "Submitted" | "Under Review" | "Approved" | "Settled" | "Rejected" | "Partial";
  type: "Cashless" | "Reimbursement";
  documents: string[];
}

const mockClaims: InsuranceClaim[] = [
  { id: "1", claimNo: "CLM-2026-0089", patientName: "Mr. Venkat Rao", patientId: "AL-16025", insuranceProvider: "Star Health Insurance", tpaName: "Medi Assist", policyNo: "SH-2026-456789", billNo: "BIL-2026-0350", billAmount: 3500, claimAmount: 3500, approvedAmount: 3500, submittedDate: "2026-07-22", approvedDate: "2026-07-23", status: "Approved", type: "Cashless", documents: ["Pre-auth letter", "Discharge summary", "Bills"] },
  { id: "2", claimNo: "CLM-2026-0090", patientName: "Mrs. Saraswathi", patientId: "AL-16050", insuranceProvider: "ICICI Lombard", tpaName: "Raksha TPA", policyNo: "IL-2026-123456", billNo: "BIL-2026-0352", billAmount: 5200, claimAmount: 5200, submittedDate: "2026-07-24", status: "Under Review", type: "Cashless", documents: ["Pre-auth letter", "Investigation reports"] },
  { id: "3", claimNo: "CLM-2026-0088", patientName: "Mr. Gopal K", patientId: "AL-18045", insuranceProvider: "New India Assurance", tpaName: "Health India TPA", policyNo: "NIA-2025-789012", billNo: "BIL-2026-0338", billAmount: 4800, claimAmount: 4800, approvedAmount: 4200, submittedDate: "2026-07-18", approvedDate: "2026-07-22", settledDate: "2026-07-24", status: "Settled", type: "Reimbursement", documents: ["Bills", "Reports", "Prescription", "ID proof"] },
  { id: "4", claimNo: "CLM-2026-0087", patientName: "Ms. Kavitha R", patientId: "AL-16001", insuranceProvider: "Star Health Insurance", tpaName: "Medi Assist", policyNo: "SH-2026-345678", billNo: "BIL-2026-0337", billAmount: 2800, claimAmount: 2800, approvedAmount: 1500, submittedDate: "2026-07-15", approvedDate: "2026-07-20", status: "Partial", type: "Cashless", documents: ["Pre-auth", "Bills"], rejectionReason: "Vitamin tests not covered under policy" },
  { id: "5", claimNo: "CLM-2026-0086", patientName: "Mr. Arjun P", patientId: "AL-19500", insuranceProvider: "Bajaj Allianz", tpaName: "Paramount TPA", policyNo: "BA-2026-567890", billNo: "BIL-2026-0330", billAmount: 6500, claimAmount: 6500, submittedDate: "2026-07-10", status: "Rejected", type: "Cashless", documents: ["Pre-auth"], rejectionReason: "Pre-existing condition exclusion. Waiting period not completed." },
  { id: "6", claimNo: "CLM-2026-0091", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", insuranceProvider: "Star Health Insurance", tpaName: "Medi Assist", policyNo: "SH-2026-112233", billNo: "BIL-2026-0355", billAmount: 8500, claimAmount: 8500, submittedDate: "2026-07-24", status: "Pre-Auth", type: "Cashless", documents: ["Pre-auth request"] },
];

const InsuranceTPA = () => {
  const [claims] = useState<InsuranceClaim[]>(mockClaims);
  const [activeTab, setActiveTab] = useState("claims");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const totalClaimed = claims.reduce((s, c) => s + c.claimAmount, 0);
  const settledAmount = claims.filter(c => c.status === "Settled" || c.status === "Approved").reduce((s, c) => s + (c.approvedAmount || 0), 0);
  const pendingAmount = claims.filter(c => c.status === "Submitted" || c.status === "Under Review" || c.status === "Pre-Auth").reduce((s, c) => s + c.claimAmount, 0);
  const rejectedAmount = claims.filter(c => c.status === "Rejected").reduce((s, c) => s + c.claimAmount, 0);

  const filtered = claims.filter(c => {
    const matchSearch = c.patientName.toLowerCase().includes(search.toLowerCase()) || c.claimNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (s: string) => {
    switch (s) { case "Settled": return "bg-green-100 text-green-700"; case "Approved": return "bg-blue-100 text-blue-700"; case "Under Review": case "Pre-Auth": return "bg-amber-100 text-amber-700"; case "Submitted": return "bg-purple-100 text-purple-700"; case "Rejected": return "bg-red-100 text-red-700"; case "Partial": return "bg-orange-100 text-orange-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Shield className="h-5 w-5" /> Insurance & TPA Claims</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Claim</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">₹{(totalClaimed / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Total Claimed</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(settledAmount / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Settled</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">₹{(pendingAmount / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><XCircle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(rejectedAmount / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="claims">Claims</TabsTrigger><TabsTrigger value="submit">Submit Claim</TabsTrigger><TabsTrigger value="reconciliation">Reconciliation</TabsTrigger></TabsList>

        {/* Claims List */}
        <TabsContent value="claims" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search claim, patient..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="Pre-Auth">Pre-Auth</SelectItem><SelectItem value="Submitted">Submitted</SelectItem><SelectItem value="Under Review">Under Review</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Settled">Settled</SelectItem><SelectItem value="Rejected">Rejected</SelectItem><SelectItem value="Partial">Partial</SelectItem></SelectContent></Select>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Claim</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Insurer / TPA</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2 text-right">Claimed</th><th className="px-3 py-2 text-right">Approved</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Action</th></tr></thead>
              <tbody>
                {filtered.map((claim) => (
                  <tr key={claim.id} className={`border-b ${claim.status === "Rejected" ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2"><p className="font-medium">{claim.claimNo}</p><p className="text-[10px] text-muted-foreground">{claim.submittedDate}</p></td>
                    <td className="px-3 py-2">{claim.patientName}<br /><span className="text-[10px] text-muted-foreground">{claim.patientId}</span></td>
                    <td className="px-3 py-2"><p>{claim.insuranceProvider}</p><p className="text-[10px] text-muted-foreground">{claim.tpaName}</p></td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[9px] ${claim.type === "Cashless" ? "text-green-600" : "text-blue-600"}`}>{claim.type}</Badge></td>
                    <td className="px-3 py-2 text-right font-bold">₹{claim.claimAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{claim.approvedAmount ? <span className="text-green-600 font-bold">₹{claim.approvedAmount.toLocaleString()}</span> : "-"}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(claim.status)}`}>{claim.status}</Badge>{claim.rejectionReason && <p className="text-[8px] text-red-500 mt-0.5 max-w-[120px]">{claim.rejectionReason}</p>}</td>
                    <td className="px-3 py-2 text-center"><div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button>
                      {claim.status === "Rejected" && <Button size="sm" variant="outline" className="h-5 text-[9px] text-orange-600" onClick={() => toast.info("Resubmission initiated")}><RefreshCw className="h-3 w-3" /></Button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Submit Claim */}
        <TabsContent value="submit" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Submit New Insurance Claim</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2"><label className="text-xs font-medium">Patient</label><Input className="h-8 text-xs" placeholder="Search patient..." /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Insurance Provider</label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="star">Star Health Insurance</SelectItem><SelectItem value="icici">ICICI Lombard</SelectItem><SelectItem value="nia">New India Assurance</SelectItem><SelectItem value="bajaj">Bajaj Allianz</SelectItem><SelectItem value="cghs">CGHS</SelectItem><SelectItem value="echs">ECHS</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">TPA</label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="medi">Medi Assist</SelectItem><SelectItem value="raksha">Raksha TPA</SelectItem><SelectItem value="health">Health India TPA</SelectItem><SelectItem value="paramount">Paramount TPA</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Policy Number</label><Input className="h-8 text-xs" placeholder="Enter policy no" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Claim Type</label><Select defaultValue="Cashless"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cashless">Cashless</SelectItem><SelectItem value="Reimbursement">Reimbursement</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Claim Amount (₹)</label><Input className="h-8 text-xs" type="number" placeholder="Amount" /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-medium">Upload Documents</label><Input type="file" multiple className="text-xs" accept=".pdf,.jpg,.png" /><p className="text-[10px] text-muted-foreground">Pre-auth letter, Bills, Reports, Discharge summary, ID proof</p></div>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Claim submitted to TPA!")}><Upload className="mr-1 h-4 w-4" /> Submit Claim</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation */}
        <TabsContent value="reconciliation" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">TPA Settlement Reconciliation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Track settlement payments received from TPAs against approved claims.</p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="border rounded p-3 text-center"><p className="text-muted-foreground">Total Approved</p><p className="text-lg font-bold text-blue-600">₹{((settledAmount + 1500) / 1000).toFixed(1)}K</p></div>
                <div className="border rounded p-3 text-center"><p className="text-muted-foreground">Settled (Received)</p><p className="text-lg font-bold text-green-600">₹{(settledAmount / 1000).toFixed(1)}K</p></div>
                <div className="border rounded p-3 text-center"><p className="text-muted-foreground">Awaiting Settlement</p><p className="text-lg font-bold text-amber-600">₹{(3500 / 1000).toFixed(1)}K</p></div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.info("Reconciliation report generated")}><Download className="mr-1 h-3 w-3" /> Download Reconciliation Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceTPA;
