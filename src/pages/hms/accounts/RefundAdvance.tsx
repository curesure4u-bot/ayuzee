import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  RotateCcw, IndianRupee, Plus, Search, CheckCircle2,
  Clock, AlertTriangle, Download, User, Wallet, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RefundEntry {
  id: string;
  refundNo: string;
  patientName: string;
  patientId: string;
  originalBillNo: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  refundMode: "Cash" | "Bank Transfer" | "UPI" | "Cheque" | "Adjust Against Advance";
  requestedBy: string;
  approvedBy?: string;
  requestDate: string;
  processedDate?: string;
  status: "Requested" | "Approved" | "Processed" | "Rejected";
}

interface AdvanceDeposit {
  id: string;
  receiptNo: string;
  patientName: string;
  patientId: string;
  depositAmount: number;
  usedAmount: number;
  balanceAmount: number;
  depositDate: string;
  mode: "Cash" | "UPI" | "Card" | "Online";
  purpose: "IPD Admission" | "Surgery" | "Package" | "General" | "Therapy";
  adjustedBills: string[];
  status: "Active" | "Fully Used" | "Refunded";
}

const mockRefunds: RefundEntry[] = [
  { id: "1", refundNo: "RFD-2026-0045", patientName: "Ms. Kavitha R", patientId: "AL-16001", originalBillNo: "BIL-2026-0347", originalAmount: 350, refundAmount: 350, reason: "Test cancelled by patient before sample collection", refundMode: "Cash", requestedBy: "Rec. Priya", approvedBy: "Admin", requestDate: "2026-07-24", processedDate: "2026-07-24", status: "Processed" },
  { id: "2", refundNo: "RFD-2026-0046", patientName: "Mr. Gopal K", patientId: "AL-18045", originalBillNo: "BIL-2026-0346", originalAmount: 2000, refundAmount: 800, reason: "Partial cancellation - 2 tests removed from order", refundMode: "UPI", requestedBy: "Rec. Meena", approvedBy: "Admin", requestDate: "2026-07-24", status: "Approved" },
  { id: "3", refundNo: "RFD-2026-0047", patientName: "Mr. Arjun P", patientId: "AL-19500", originalBillNo: "BIL-2026-0355", originalAmount: 3000, refundAmount: 3000, reason: "Duplicate billing - same tests ordered twice", refundMode: "Bank Transfer", requestedBy: "Rec. Priya", requestDate: "2026-07-24", status: "Requested" },
  { id: "4", refundNo: "RFD-2026-0044", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", originalBillNo: "BIL-2026-0332", originalAmount: 1500, refundAmount: 500, reason: "Overcharged - wrong rate plan applied", refundMode: "Adjust Against Advance", requestedBy: "Supervisor", approvedBy: "Dr. Mohamad Saleem", requestDate: "2026-07-20", processedDate: "2026-07-21", status: "Processed" },
];

const mockAdvances: AdvanceDeposit[] = [
  { id: "1", receiptNo: "ADV-2026-0089", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", depositAmount: 5000, usedAmount: 3500, balanceAmount: 1500, depositDate: "2026-07-20", mode: "UPI", purpose: "Therapy", adjustedBills: ["BIL-2026-0341", "BIL-2026-0348"], status: "Active" },
  { id: "2", receiptNo: "ADV-2026-0090", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", depositAmount: 3000, usedAmount: 1200, balanceAmount: 1800, depositDate: "2026-07-22", mode: "Cash", purpose: "Package", adjustedBills: ["BIL-2026-0342"], status: "Active" },
  { id: "3", receiptNo: "ADV-2026-0088", patientName: "Mr. Suresh Babu", patientId: "AL-15320", depositAmount: 10000, usedAmount: 10000, balanceAmount: 0, depositDate: "2026-07-15", mode: "Card", purpose: "IPD Admission", adjustedBills: ["BIL-2026-0335", "BIL-2026-0343", "BIL-2026-0349"], status: "Fully Used" },
  { id: "4", receiptNo: "ADV-2026-0087", patientName: "Mrs. Saraswathi", patientId: "AL-16050", depositAmount: 2000, usedAmount: 0, balanceAmount: 2000, depositDate: "2026-07-10", mode: "Cash", purpose: "General", adjustedBills: [], status: "Active" },
];

const RefundAdvance = () => {
  const [refunds] = useState<RefundEntry[]>(mockRefunds);
  const [advances, setAdvances] = useState<AdvanceDeposit[]>(mockAdvances);
  const [liveAdvances, setLiveAdvances] = useState<any[]>([]);

  useEffect(() => {
    loadAdvances();
  }, []);

  const loadAdvances = async () => {
    try {
      const { data } = await (supabase as any)
        .from("hms_patient_advances")
        .select("*")
        .order("created_at", { ascending: false });
      setLiveAdvances(data || []);
    } catch (err) {
      console.error("Advances load error:", err);
    }
  };
  const [activeTab, setActiveTab] = useState("refunds");

  const totalRefunds = refunds.reduce((s, r) => s + r.refundAmount, 0);
  const pendingRefunds = refunds.filter(r => r.status === "Requested" || r.status === "Approved").reduce((s, r) => s + r.refundAmount, 0);
  const totalAdvances = advances.reduce((s, a) => s + a.depositAmount, 0);
  const activeBalance = advances.filter(a => a.status === "Active").reduce((s, a) => s + a.balanceAmount, 0);

  const getStatusColor = (s: string) => {
    switch (s) { case "Processed": case "Fully Used": return "bg-green-100 text-green-700"; case "Approved": case "Active": return "bg-blue-100 text-blue-700"; case "Requested": return "bg-amber-100 text-amber-700"; case "Rejected": case "Refunded": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Refund & Advance Management</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs"><Plus className="mr-1 h-3 w-3" /> New Advance</Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8 text-xs"><RotateCcw className="mr-1 h-3 w-3" /> Process Refund</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><RotateCcw className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(totalRefunds / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Total Refunds</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">₹{(pendingRefunds / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Pending Refunds</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Wallet className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">₹{(totalAdvances / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Total Advances</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(activeBalance / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Active Balance</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="refunds">Refunds</TabsTrigger><TabsTrigger value="advances">Advance Deposits</TabsTrigger></TabsList>

        {/* Refunds */}
        <TabsContent value="refunds" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Refund #</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Bill</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-center">Mode</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Action</th></tr></thead>
              <tbody>
                {refunds.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{r.refundNo}<br /><span className="text-[10px] text-muted-foreground">{r.requestDate}</span></td>
                    <td className="px-3 py-2">{r.patientName}<br /><span className="text-[10px] text-muted-foreground">{r.patientId}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{r.originalBillNo}</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600">₹{r.refundAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 max-w-[180px] text-muted-foreground">{r.reason}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[9px]">{r.refundMode}</Badge></td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(r.status)}`}>{r.status}</Badge></td>
                    <td className="px-3 py-2 text-center">
                      {r.status === "Requested" && <Button size="sm" className="h-5 text-[9px] bg-green-600" onClick={() => toast.success("Approved")}>Approve</Button>}
                      {r.status === "Approved" && <Button size="sm" className="h-5 text-[9px] bg-blue-600" onClick={() => toast.success("Processed")}>Process</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Advances */}
        <TabsContent value="advances" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Receipt</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Purpose</th><th className="px-3 py-2 text-right">Deposit</th><th className="px-3 py-2 text-right">Used</th><th className="px-3 py-2 text-right">Balance</th><th className="px-3 py-2 text-center">Mode</th><th className="px-3 py-2 text-left">Adjusted Bills</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
              <tbody>
                {advances.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{a.receiptNo}<br /><span className="text-[10px] text-muted-foreground">{a.depositDate}</span></td>
                    <td className="px-3 py-2">{a.patientName}<br /><span className="text-[10px] text-muted-foreground">{a.patientId}</span></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{a.purpose}</Badge></td>
                    <td className="px-3 py-2 text-right font-bold">₹{a.depositAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-amber-600">₹{a.usedAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{a.balanceAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[9px]">{a.mode}</Badge></td>
                    <td className="px-3 py-2">{a.adjustedBills.length > 0 ? a.adjustedBills.map((b, i) => <Badge key={i} variant="outline" className="text-[8px] mr-0.5">{b}</Badge>) : <span className="text-muted-foreground">-</span>}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(a.status)}`}>{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50"><tr><td colSpan={3} className="px-3 py-2 font-bold text-right">Totals:</td><td className="px-3 py-2 text-right font-bold">₹{totalAdvances.toLocaleString()}</td><td className="px-3 py-2 text-right text-amber-600">₹{advances.reduce((s, a) => s + a.usedAmount, 0).toLocaleString()}</td><td className="px-3 py-2 text-right font-bold text-green-600">₹{activeBalance.toLocaleString()}</td><td colSpan={3}></td></tr></tfoot>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefundAdvance;
