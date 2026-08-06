import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2, CheckCircle2, XCircle, AlertTriangle, Clock, Search,
  IndianRupee, CreditCard, Smartphone, Landmark, Brain, Sparkles,
  Calendar, RefreshCw, Shield, Eye
} from "lucide-react";

type ReconciliationEntry = {
  id: string;
  date: string;
  transactionId: string;
  patientName: string;
  billNo: string;
  amount: number;
  paymentMode: "gpay" | "phonepe" | "netbanking" | "card" | "paytm";
  systemStatus: "received" | "pending" | "mismatch";
  bankStatus: "credited" | "pending" | "not_found";
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
};

const reconciliationData: ReconciliationEntry[] = [
  { id: "1", date: "2026-07-21", transactionId: "UPI/426789123456", patientName: "Rajesh Kumar", billNo: "BILL-2145", amount: 2500, paymentMode: "gpay", systemStatus: "received", bankStatus: "credited", verified: true, verifiedBy: "Admin", verifiedAt: "Jul 22, 09:15 AM" },
  { id: "2", date: "2026-07-21", transactionId: "UPI/426789234567", patientName: "Sunita Devi", billNo: "BILL-2146", amount: 1800, paymentMode: "phonepe", systemStatus: "received", bankStatus: "credited", verified: true, verifiedBy: "Admin", verifiedAt: "Jul 22, 09:16 AM" },
  { id: "3", date: "2026-07-21", transactionId: "UPI/426789345678", patientName: "Mohammed Ali", billNo: "BILL-2147", amount: 5200, paymentMode: "gpay", systemStatus: "received", bankStatus: "pending", verified: false, remarks: "Bank settlement pending T+1" },
  { id: "4", date: "2026-07-21", transactionId: "NEFT/HDFC87654321", patientName: "Lakshmi Narayan", billNo: "BILL-2148", amount: 12500, paymentMode: "netbanking", systemStatus: "received", bankStatus: "not_found", verified: false, remarks: "Transaction not reflecting in bank" },
  { id: "5", date: "2026-07-21", transactionId: "UPI/426789456789", patientName: "Priya Sharma", billNo: "BILL-2149", amount: 3400, paymentMode: "gpay", systemStatus: "received", bankStatus: "credited", verified: false },
  { id: "6", date: "2026-07-21", transactionId: "UPI/426789567890", patientName: "Arun Krishnan", billNo: "BILL-2150", amount: 1500, paymentMode: "paytm", systemStatus: "received", bankStatus: "credited", verified: true, verifiedBy: "Cashier", verifiedAt: "Jul 22, 10:30 AM" },
  { id: "7", date: "2026-07-21", transactionId: "CARD/VIS98765432", patientName: "Deepa Menon", billNo: "BILL-2151", amount: 8200, paymentMode: "card", systemStatus: "received", bankStatus: "pending", verified: false, remarks: "Card settlement T+2" },
  { id: "8", date: "2026-07-20", transactionId: "UPI/426788111222", patientName: "Ravi Patel", billNo: "BILL-2139", amount: 4500, paymentMode: "gpay", systemStatus: "mismatch", bankStatus: "credited", verified: false, remarks: "Amount mismatch: Bank shows ₹4,000" },
];

const Reconciliation = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-07-21");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const filtered = reconciliationData.filter(e => {
    if (filterStatus === "verified") return e.verified;
    if (filterStatus === "pending") return !e.verified && e.bankStatus === "pending";
    if (filterStatus === "mismatch") return e.bankStatus === "not_found" || e.systemStatus === "mismatch";
    return true;
  });

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);
  const verifiedAmount = filtered.filter(e => e.verified).reduce((s, e) => s + e.amount, 0);
  const pendingAmount = filtered.filter(e => !e.verified).reduce((s, e) => s + e.amount, 0);
  const mismatchCount = filtered.filter(e => e.bankStatus === "not_found" || e.systemStatus === "mismatch").length;

  const toggleEntry = (id: string) => {
    setSelectedEntries(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Payment Reconciliation
          </h2>
          <p className="text-sm text-muted-foreground">Verify GPay, Net Banking & Card payments next day</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-[160px]" />
          <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Sync Bank</Button>
          <Button size="sm" disabled={selectedEntries.length === 0}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Verify Selected ({selectedEntries.length})
          </Button>
        </div>
      </div>

      {/* AI Alert Banner */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">AI Reconciliation Alert</p>
              <div className="mt-1 space-y-1 text-sm text-amber-600">
                <p>• 1 transaction (₹12,500) not found in bank statement - investigate NEFT/HDFC87654321</p>
                <p>• 1 amount mismatch detected: System ₹4,500 vs Bank ₹4,000 for UPI/426788111222</p>
                <p>• 2 card/UPI settlements pending (normal T+1/T+2 cycle) - will auto-verify tomorrow</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Total Digital Payments</p>
            </div>
            <p className="font-display text-xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">{filtered.length} transactions</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
            <p className="font-display text-xl font-bold text-green-600">₹{verifiedAmount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-green-600">{filtered.filter(e => e.verified).length} confirmed</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Pending Verification</p>
            </div>
            <p className="font-display text-xl font-bold text-amber-600">₹{pendingAmount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-amber-600">{filtered.filter(e => !e.verified).length} awaiting</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Mismatches / Issues</p>
            </div>
            <p className="font-display text-xl font-bold text-red-600">{mismatchCount}</p>
            <p className="text-xs text-red-600">Needs investigation</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="verified">Verified Only</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
            <SelectItem value="mismatch">Mismatches</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Search by patient, bill#, transaction ID..." className="max-w-sm" />
      </div>

      {/* Reconciliation Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-center w-10">
                    <Checkbox
                      checked={selectedEntries.length === filtered.filter(e => !e.verified).length && selectedEntries.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedEntries(filtered.filter(e => !e.verified).map(e => e.id));
                        else setSelectedEntries([]);
                      }}
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Patient / Bill</th>
                  <th className="px-3 py-2 text-left font-medium">Transaction ID</th>
                  <th className="px-3 py-2 text-left font-medium">Mode</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 text-center font-medium">Bank Status</th>
                  <th className="px-3 py-2 text-center font-medium">Verified</th>
                  <th className="px-3 py-2 text-left font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className={`border-b hover:bg-muted/30 ${entry.bankStatus === "not_found" || entry.systemStatus === "mismatch" ? "bg-red-50/50" : ""}`}>
                    <td className="px-3 py-2 text-center">
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        disabled={entry.verified}
                        onCheckedChange={() => toggleEntry(entry.id)}
                      />
                    </td>
                    <td className="px-3 py-2 text-xs">{entry.date}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-xs">{entry.patientName}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.billNo}</p>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{entry.transactionId}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {entry.paymentMode === "gpay" && <Smartphone className="mr-1 h-3 w-3" />}
                        {entry.paymentMode === "netbanking" && <Landmark className="mr-1 h-3 w-3" />}
                        {entry.paymentMode === "card" && <CreditCard className="mr-1 h-3 w-3" />}
                        {entry.paymentMode}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">₹{entry.amount.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={
                        entry.bankStatus === "credited" ? "bg-green-100 text-green-700" :
                        entry.bankStatus === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {entry.bankStatus === "credited" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {entry.bankStatus === "pending" && <Clock className="mr-1 h-3 w-3" />}
                        {entry.bankStatus === "not_found" && <XCircle className="mr-1 h-3 w-3" />}
                        {entry.bankStatus.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {entry.verified ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-[9px] text-muted-foreground">{entry.verifiedBy}</span>
                        </div>
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                      {entry.remarks ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Process Info */}
      <Card className="border-blue-100">
        <CardContent className="p-4">
          <p className="font-medium text-sm mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" /> Auto-Reconciliation Process
          </p>
          <div className="grid gap-3 sm:grid-cols-4 text-xs">
            <div className="p-2 rounded bg-blue-50 text-center">
              <p className="font-semibold">Step 1</p>
              <p className="text-muted-foreground">Cashier enters digital payment at billing</p>
            </div>
            <div className="p-2 rounded bg-blue-50 text-center">
              <p className="font-semibold">Step 2</p>
              <p className="text-muted-foreground">Next day: System pulls bank statement</p>
            </div>
            <div className="p-2 rounded bg-blue-50 text-center">
              <p className="font-semibold">Step 3</p>
              <p className="text-muted-foreground">AI matches transactions auto</p>
            </div>
            <div className="p-2 rounded bg-blue-50 text-center">
              <p className="font-semibold">Step 4</p>
              <p className="text-muted-foreground">Admin verifies mismatches</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
