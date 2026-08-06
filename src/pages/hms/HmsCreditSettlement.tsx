import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Wallet, IndianRupee, Users, CheckCircle, Clock,
  Search, Download, Plus, AlertTriangle,
} from "lucide-react";

type CreditEntry = {
  id: string; patient: string; phId: string; billNo: string; billDate: string;
  totalAmount: number; paidAmount: number; creditAmount: number;
  status: "Pending" | "Partial" | "Settled"; department: string;
  settledDate: string; settledBy: string; mode: string;
};

const mockCredits: CreditEntry[] = [
  { id: "1", patient: "Ramesh Kumar", phId: "PH-001", billNo: "OP-2026-1524", billDate: "2026-07-20", totalAmount: 5500, paidAmount: 3000, creditAmount: 2500, status: "Pending", department: "Ayurveda OPD", settledDate: "", settledBy: "", mode: "" },
  { id: "2", patient: "Priya Menon", phId: "PH-002", billNo: "PK-2026-0089", billDate: "2026-07-15", totalAmount: 28000, paidAmount: 20000, creditAmount: 8000, status: "Partial", department: "Panchakarma", settledDate: "2026-07-20", settledBy: "Cashier", mode: "UPI" },
  { id: "3", patient: "Mohammed F.", phId: "PH-004", billNo: "IP-2026-0045", billDate: "2026-07-18", totalAmount: 45000, paidAmount: 30000, creditAmount: 15000, status: "Pending", department: "IPD", settledDate: "", settledBy: "", mode: "" },
  { id: "4", patient: "Lakshmi Nair", phId: "PH-005", billNo: "PH-2026-3421", billDate: "2026-07-12", totalAmount: 3200, paidAmount: 3200, creditAmount: 0, status: "Settled", department: "Pharmacy", settledDate: "2026-07-12", settledBy: "Cashier", mode: "Cash" },
  { id: "5", patient: "Sunil Menon", phId: "PH-006", billNo: "OP-2026-1530", billDate: "2026-07-21", totalAmount: 1800, paidAmount: 0, creditAmount: 1800, status: "Pending", department: "Homeopathy", settledDate: "", settledBy: "", mode: "" },
  { id: "6", patient: "Ananya S.", phId: "PH-003", billNo: "LB-2026-0892", billDate: "2026-07-19", totalAmount: 2400, paidAmount: 2400, creditAmount: 0, status: "Settled", department: "Lab", settledDate: "2026-07-21", settledBy: "Vignesh", mode: "Card" },
];

const HmsCreditSettlement = () => {
  const [credits] = useState<CreditEntry[]>(mockCredits);
  const [settleOpen, setSettleOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = credits.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchText && !c.patient.toLowerCase().includes(searchText.toLowerCase()) && !c.billNo.includes(searchText)) return false;
    return true;
  });

  const totalCredit = credits.reduce((s, c) => s + c.creditAmount, 0);
  const pendingCredit = credits.filter(c => c.status === "Pending").reduce((s, c) => s + c.creditAmount, 0);
  const settledToday = credits.filter(c => c.settledDate === "2026-07-21" || c.settledDate === "2026-07-22").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-orange-600" /> Credit Settlement
        </h1>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setSettleOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Settle Credit
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-blue-600" /><p className="text-lg font-bold mt-1">₹{totalCredit.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Credit Outstanding</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-lg font-bold mt-1 text-red-600">₹{pendingCredit.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pending Settlement</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{credits.filter(c => c.status === "Pending").length}</p><p className="text-xs text-muted-foreground">Patients with Credit</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{settledToday}</p><p className="text-xs text-muted-foreground">Settled Today</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Partial">Partial</SelectItem><SelectItem value="Settled">Settled</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Search:</span>
          <Input className="w-[200px] h-7 text-xs" placeholder="Patient or Bill No" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50"><tr>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Patient</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">PhID</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Bill No</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Bill Date</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Total</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Paid</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Credit</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Department</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Status</th>
            <th className="px-3 py-2 text-left font-medium text-orange-700">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className={`border-b hover:bg-muted/30 ${c.status === "Pending" && c.creditAmount > 5000 ? "bg-red-50/30" : ""}`}>
                <td className="px-3 py-2 font-medium text-xs">{c.patient}</td>
                <td className="px-3 py-2 text-xs">{c.phId}</td>
                <td className="px-3 py-2 text-xs font-mono">{c.billNo}</td>
                <td className="px-3 py-2 text-xs">{c.billDate}</td>
                <td className="px-3 py-2 text-xs">₹{c.totalAmount.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs text-green-600">₹{c.paidAmount.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs font-bold text-red-600">₹{c.creditAmount.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs">{c.department}</td>
                <td className="px-3 py-2"><Badge variant={c.status === "Settled" ? "outline" : c.status === "Partial" ? "default" : "destructive"} className={`text-[10px] ${c.status === "Settled" ? "text-green-600" : ""}`}>{c.status}</Badge></td>
                <td className="px-3 py-2">{c.status !== "Settled" && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success(`Settled ₹${c.creditAmount} for ${c.patient}`)}>Settle</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Settle Credit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient / Bill No *</Label><Input placeholder="Search patient or bill number" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount *</Label><Input type="number" placeholder="0" /></div>
              <div><Label>Payment Mode</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="bank">Bank Transfer</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Remarks</Label><Input placeholder="Optional remarks" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => { toast.success("Credit settled successfully"); setSettleOpen(false); }}>Settle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsCreditSettlement;
