import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Wallet, Plus, IndianRupee, Clock, CheckCircle, XCircle } from "lucide-react";

type Claim = {
  id: string;
  patientName: string;
  policyNo: string;
  insurer: string;
  claimAmount: number;
  approvedAmount: number;
  submittedDate: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "settled";
  type: "cashless" | "reimbursement";
};

const mockClaims: Claim[] = [
  { id: "1", patientName: "Ramesh Kumar", policyNo: "HI-2025-78934", insurer: "Star Health", claimAmount: 45000, approvedAmount: 42000, submittedDate: "2026-07-05", status: "approved", type: "cashless" },
  { id: "2", patientName: "Lakshmi Devi", policyNo: "NI-2026-12345", insurer: "National Insurance", claimAmount: 28000, approvedAmount: 0, submittedDate: "2026-07-12", status: "under_review", type: "cashless" },
  { id: "3", patientName: "Sunil Menon", policyNo: "AY-2025-56789", insurer: "Ayushman Bharat", claimAmount: 65000, approvedAmount: 65000, submittedDate: "2026-06-28", status: "settled", type: "cashless" },
  { id: "4", patientName: "Meera Nair", policyNo: "NHI-2026-44556", insurer: "New India Assurance", claimAmount: 35000, approvedAmount: 0, submittedDate: "2026-07-14", status: "submitted", type: "reimbursement" },
  { id: "5", patientName: "Anand Sharma", policyNo: "IC-2025-99887", insurer: "ICICI Lombard", claimAmount: 52000, approvedAmount: 0, submittedDate: "2026-07-10", status: "rejected", type: "cashless" },
];

const HmsInsurance = () => {
  const [claims] = useState<Claim[]>(mockClaims);
  const [newClaimOpen, setNewClaimOpen] = useState(false);

  const totalClaimed = claims.reduce((s, c) => s + c.claimAmount, 0);
  const totalApproved = claims.reduce((s, c) => s + c.approvedAmount, 0);
  const pendingClaims = claims.filter((c) => ["submitted", "under_review"].includes(c.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" /> Insurance Claims
          </h1>
          <p className="text-sm text-muted-foreground">
            Cashless & Reimbursement claims, Ayushman Bharat, CGHS, ECHS
          </p>
        </div>
        <Button onClick={() => setNewClaimOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Claim
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-blue-600">₹{(totalClaimed / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Claimed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{(totalApproved / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-600">{pendingClaims.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">{claims.filter(c => c.status === "rejected").length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Claims</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Patient</th>
                  <th className="px-3 py-2 text-left font-medium">Insurer</th>
                  <th className="px-3 py-2 text-left font-medium">Policy No.</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Amount</th>
                  <th className="px-3 py-2 text-left font-medium">Approved</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{claim.patientName}</td>
                    <td className="px-3 py-2">{claim.insurer}</td>
                    <td className="px-3 py-2 font-mono text-xs">{claim.policyNo}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-xs capitalize">{claim.type}</Badge></td>
                    <td className="px-3 py-2">₹{claim.claimAmount.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{claim.approvedAmount > 0 ? `₹${claim.approvedAmount.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-3 py-2">
                      <Badge variant={
                        claim.status === "approved" || claim.status === "settled" ? "outline" :
                        claim.status === "rejected" ? "destructive" : "secondary"
                      } className={`text-xs capitalize ${claim.status === "approved" || claim.status === "settled" ? "text-green-600" : ""}`}>
                        {claim.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Claim Dialog */}
      <Dialog open={newClaimOpen} onOpenChange={setNewClaimOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit New Insurance Claim</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient</Label><Input placeholder="Search patient" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Insurance Company</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="star">Star Health</SelectItem>
                    <SelectItem value="national">National Insurance</SelectItem>
                    <SelectItem value="ayushman">Ayushman Bharat (PMJAY)</SelectItem>
                    <SelectItem value="cghs">CGHS</SelectItem>
                    <SelectItem value="echs">ECHS</SelectItem>
                    <SelectItem value="new_india">New India Assurance</SelectItem>
                    <SelectItem value="icici">ICICI Lombard</SelectItem>
                    <SelectItem value="hdfc">HDFC Ergo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Policy Number</Label><Input placeholder="Policy/Card number" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Claim Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashless">Cashless</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Claim Amount (₹)</Label><Input type="number" placeholder="Amount" /></div>
            </div>
            <div><Label>Treatment Details</Label><Input placeholder="Diagnosis and treatment summary" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClaimOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Claim submitted"); setNewClaimOpen(false); }}>Submit Claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsInsurance;
