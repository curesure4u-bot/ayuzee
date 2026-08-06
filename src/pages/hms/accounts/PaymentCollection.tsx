import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  IndianRupee, Search, Printer, Plus, CheckCircle2,
  CreditCard, Smartphone, Banknote, QrCode, Clock,
  Download, User, Receipt, FileText,
} from "lucide-react";

interface PaymentEntry {
  id: string;
  receiptNo: string;
  patientName: string;
  patientId: string;
  billNo: string;
  amount: number;
  mode: "Cash" | "Card" | "UPI" | "Cheque" | "Online" | "Wallet";
  receivedBy: string;
  timestamp: string;
  status: "Completed" | "Pending" | "Reversed";
  reference?: string;
}

const mockPayments: PaymentEntry[] = [
  { id: "1", receiptNo: "RCT-2026-00451", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", billNo: "BIL-2026-0341", amount: 1000, mode: "UPI", receivedBy: "Rec. Priya", timestamp: "2026-07-24 08:55 AM", status: "Completed", reference: "GPay - rajesh@okaxis" },
  { id: "2", receiptNo: "RCT-2026-00452", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", billNo: "BIL-2026-0340", amount: 700, mode: "Card", receivedBy: "Rec. Priya", timestamp: "2026-07-24 07:25 AM", status: "Completed", reference: "Visa ****4532" },
  { id: "3", receiptNo: "RCT-2026-00453", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", billNo: "BIL-2026-0342", amount: 500, mode: "Cash", receivedBy: "Rec. Meena", timestamp: "2026-07-24 09:20 AM", status: "Completed" },
  { id: "4", receiptNo: "RCT-2026-00454", patientName: "Mr. Arun Prasad", patientId: "AL-12980", billNo: "BIL-2026-0345", amount: 1500, mode: "UPI", receivedBy: "Rec. Priya", timestamp: "2026-07-24 10:30 AM", status: "Completed", reference: "PhonePe" },
  { id: "5", receiptNo: "RCT-2026-00455", patientName: "Mr. Gopal K", patientId: "AL-18045", billNo: "BIL-2026-0346", amount: 2000, mode: "Cheque", receivedBy: "Rec. Meena", timestamp: "2026-07-24 11:00 AM", status: "Pending", reference: "Chq# 456789 - IOB" },
  { id: "6", receiptNo: "RCT-2026-00456", patientName: "Ms. Kavitha R", patientId: "AL-16001", billNo: "BIL-2026-0347", amount: 350, mode: "Cash", receivedBy: "Rec. Priya", timestamp: "2026-07-24 11:15 AM", status: "Completed" },
];

const PaymentCollection = () => {
  const [payments] = useState<PaymentEntry[]>(mockPayments);
  const [activeTab, setActiveTab] = useState("collect");
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("ALL");

  const todayTotal = payments.filter(p => p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const cashTotal = payments.filter(p => p.mode === "Cash" && p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const digitalTotal = payments.filter(p => p.mode !== "Cash" && p.mode !== "Cheque" && p.status === "Completed").reduce((s, p) => s + p.amount, 0);

  const filtered = payments.filter(p => {
    const matchSearch = p.patientName.toLowerCase().includes(search.toLowerCase()) || p.receiptNo.toLowerCase().includes(search.toLowerCase());
    const matchMode = modeFilter === "ALL" || p.mode === modeFilter;
    return matchSearch && matchMode;
  });

  const getModeIcon = (mode: string) => {
    switch (mode) { case "Cash": return <Banknote className="h-3 w-3 text-green-600" />; case "Card": return <CreditCard className="h-3 w-3 text-blue-600" />; case "UPI": return <Smartphone className="h-3 w-3 text-purple-600" />; case "Cheque": return <FileText className="h-3 w-3 text-amber-600" />; default: return <IndianRupee className="h-3 w-3" />; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Receipt className="h-5 w-5" /> Payment Collection & Receipts</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Collection</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(todayTotal / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Today's Collection</p></CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="p-3 text-center"><Banknote className="h-4 w-4 mx-auto text-emerald-600" /><p className="text-xl font-bold text-emerald-600 mt-1">₹{(cashTotal / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Cash</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Smartphone className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">₹{(digitalTotal / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Digital (UPI+Card)</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Receipt className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{payments.length}</p><p className="text-[10px] text-muted-foreground">Receipts Today</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="collect">New Payment</TabsTrigger><TabsTrigger value="receipts">Receipts</TabsTrigger></TabsList>

        {/* New Payment Form */}
        <TabsContent value="collect" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Collect Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2"><label className="text-xs font-medium">Patient / Bill No</label><Input className="h-8 text-xs" placeholder="Search patient or bill number..." /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Amount (₹)</label><Input className="h-8 text-xs" type="number" placeholder="Enter amount" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Payment Mode</label><Select defaultValue="Cash"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Card">Card (Swipe)</SelectItem><SelectItem value="UPI">UPI (GPay/PhonePe)</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Online">Online Transfer</SelectItem><SelectItem value="Wallet">Wallet</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Reference / Transaction ID</label><Input className="h-8 text-xs" placeholder="UPI ref / Card approval / Cheque no" /></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2"><label className="text-xs font-medium">Against Bill</label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select bill" /></SelectTrigger><SelectContent><SelectItem value="current">Current Bill</SelectItem><SelectItem value="advance">Advance Deposit</SelectItem><SelectItem value="partial">Partial Payment</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Received By</label><Select defaultValue="priya"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="priya">Rec. Priya</SelectItem><SelectItem value="meena">Rec. Meena</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Remarks</label><Input className="h-8 text-xs" placeholder="Optional notes" /></div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Payment collected! Receipt generated.")}><IndianRupee className="mr-1 h-4 w-4" /> Collect & Print Receipt</Button>
                <Button variant="outline" onClick={() => toast.success("Payment saved")}><CheckCircle2 className="mr-1 h-4 w-4" /> Collect (No Print)</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick QR */}
          <Card className="border-purple-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-20 w-20 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center"><QrCode className="h-10 w-10 text-purple-400" /></div>
              <div><p className="text-sm font-medium">Counter QR Code</p><p className="text-xs text-muted-foreground">Patient scans this QR at counter to pay via UPI</p><p className="text-xs text-purple-600 mt-1">UPI: ayuzeelab@okaxis</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts List */}
        <TabsContent value="receipts" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search receipt, patient..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={modeFilter} onValueChange={setModeFilter}><SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="Cash">Cash</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="Cheque">Cheque</SelectItem></SelectContent></Select>
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Receipt #</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Bill</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-center">Mode</th><th className="px-3 py-2 text-left">Reference</th><th className="px-3 py-2 text-left">Time</th><th className="px-3 py-2 text-center">Action</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{p.receiptNo}</td>
                    <td className="px-3 py-2">{p.patientName}<br /><span className="text-[10px] text-muted-foreground">{p.patientId}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{p.billNo}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{p.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><div className="flex items-center justify-center gap-1">{getModeIcon(p.mode)}<span>{p.mode}</span></div></td>
                    <td className="px-3 py-2 text-muted-foreground text-[10px]">{p.reference || "-"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.timestamp.split(" ").slice(1).join(" ")}</td>
                    <td className="px-3 py-2 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Receipt printed")}><Printer className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 border-t bg-green-50 text-xs text-right font-bold text-green-700">Total Collected: ₹{todayTotal.toLocaleString()}</div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentCollection;
