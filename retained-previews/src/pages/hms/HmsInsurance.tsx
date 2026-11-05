import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Wallet, Plus, Loader2 } from "lucide-react";
import { useInsuranceClaims } from "@/hooks/useInsuranceClaims";

const HmsInsurance = () => {
  const { claims, totalClaimed, totalApproved, pendingCount, loading, error, createClaim } = useInsuranceClaims();
  const [newClaimOpen, setNewClaimOpen] = useState(false);
  const [formPatient, setFormPatient] = useState("");
  const [formPolicy, setFormPolicy] = useState("");
  const [formInsurer, setFormInsurer] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState<"cashless" | "reimbursement">("cashless");

  const handleCreateClaim = async () => {
    if (!formPatient || !formPolicy || !formInsurer || !formAmount) {
      toast.error("All fields are required");
      return;
    }
    const success = await createClaim({
      patientName: formPatient,
      policyNo: formPolicy,
      insurer: formInsurer,
      claimAmount: Number(formAmount),
      submittedDate: new Date().toISOString().split("T")[0],
      status: "submitted",
      type: formType,
    });
    if (success) {
      toast.success("Claim submitted");
      setNewClaimOpen(false);
      setFormPatient(""); setFormPolicy(""); setFormInsurer(""); setFormAmount("");
    } else {
      toast.error("Failed to submit claim");
    }
  };

  const rejectedCount = claims.filter((c) => c.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" /> Insurance Claims
          </h1>
          <p className="text-sm text-muted-foreground">Cashless & Reimbursement claims, Ayushman Bharat, CGHS, ECHS</p>
        </div>
        <Button onClick={() => setNewClaimOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Claim
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading claims...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-blue-600">₹{(totalClaimed / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Claimed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{(totalApproved / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-600">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">{rejectedCount}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
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
                {claims.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No claims found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Claim Dialog */}
      <Dialog open={newClaimOpen} onOpenChange={setNewClaimOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit New Insurance Claim</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium">Patient Name *</label><Input className="h-8 text-xs" value={formPatient} onChange={(e) => setFormPatient(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Policy No. *</label><Input className="h-8 text-xs" value={formPolicy} onChange={(e) => setFormPolicy(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Insurer *</label><Input className="h-8 text-xs" value={formInsurer} onChange={(e) => setFormInsurer(e.target.value)} placeholder="e.g. Star Health" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Claim Amount (₹) *</label><Input className="h-8 text-xs" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} /></div>
            <div className="space-y-1 col-span-2"><label className="text-xs font-medium">Claim Type</label><Select value={formType} onValueChange={(v) => setFormType(v as any)}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cashless">Cashless</SelectItem><SelectItem value="reimbursement">Reimbursement</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClaimOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClaim}>Submit Claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsInsurance;
