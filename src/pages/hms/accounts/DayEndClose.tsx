import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Clock, IndianRupee, CheckCircle2, AlertTriangle, Lock,
  Banknote, CreditCard, Smartphone, FileText, Printer,
  Download, User, Calculator,
} from "lucide-react";

interface ShiftSummary {
  shiftName: string;
  cashier: string;
  startTime: string;
  endTime: string;
  openingCash: number;
  collections: { mode: string; count: number; amount: number }[];
  totalCollection: number;
  refunds: number;
  expenses: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  status: "Open" | "Closed" | "Discrepancy";
}

const mockShifts: ShiftSummary[] = [
  {
    shiftName: "Morning Shift", cashier: "Rec. Priya", startTime: "07:00 AM", endTime: "02:00 PM",
    openingCash: 2000,
    collections: [
      { mode: "Cash", count: 18, amount: 12500 },
      { mode: "UPI", count: 22, amount: 18200 },
      { mode: "Card", count: 8, amount: 9800 },
      { mode: "Cheque", count: 2, amount: 4500 },
    ],
    totalCollection: 45000, refunds: 700, expenses: 1800,
    expectedCash: 12000, actualCash: 12000, difference: 0, status: "Closed",
  },
  {
    shiftName: "Evening Shift", cashier: "Rec. Meena", startTime: "02:00 PM", endTime: "09:00 PM",
    openingCash: 2000,
    collections: [
      { mode: "Cash", count: 12, amount: 8500 },
      { mode: "UPI", count: 15, amount: 11200 },
      { mode: "Card", count: 5, amount: 6300 },
      { mode: "Cheque", count: 0, amount: 0 },
    ],
    totalCollection: 26000, refunds: 350, expenses: 800,
    expectedCash: 8850, actualCash: 8700, difference: -150, status: "Discrepancy",
  },
];

const denomination = [
  { note: "₹2000", count: 0 }, { note: "₹500", count: 0 }, { note: "₹200", count: 0 },
  { note: "₹100", count: 0 }, { note: "₹50", count: 0 }, { note: "₹20", count: 0 },
  { note: "₹10", count: 0 }, { note: "Coins", count: 0 },
];

const DayEndClose = () => {
  const [shifts] = useState<ShiftSummary[]>(mockShifts);
  const [selectedDate] = useState("2026-07-24");

  const totalDayCollection = shifts.reduce((s, sh) => s + sh.totalCollection, 0);
  const totalCash = shifts.reduce((s, sh) => s + sh.collections.find(c => c.mode === "Cash")!.amount, 0);
  const totalDigital = totalDayCollection - totalCash - shifts.reduce((s, sh) => s + sh.collections.find(c => c.mode === "Cheque")!.amount, 0);
  const hasDiscrepancy = shifts.some(s => s.status === "Discrepancy");

  const getModeIcon = (mode: string) => {
    switch (mode) { case "Cash": return <Banknote className="h-3 w-3 text-green-600" />; case "UPI": return <Smartphone className="h-3 w-3 text-purple-600" />; case "Card": return <CreditCard className="h-3 w-3 text-blue-600" />; case "Cheque": return <FileText className="h-3 w-3 text-amber-600" />; default: return <IndianRupee className="h-3 w-3" />; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Clock className="h-5 w-5" /> Day End / Shift Close</h2>
        <div className="flex gap-2">
          <Input type="date" className="h-8 text-xs w-[130px]" defaultValue={selectedDate} />
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => toast.success("Day closed! All shifts locked.")}><Lock className="mr-1 h-3 w-3" /> Close Day</Button>
        </div>
      </div>

      {/* Day Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(totalDayCollection / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Day's Collection</p></CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="p-3 text-center"><Banknote className="h-4 w-4 mx-auto text-emerald-600" /><p className="text-xl font-bold text-emerald-600 mt-1">₹{(totalCash / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Cash in Hand</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Smartphone className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">₹{(totalDigital / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Digital</p></CardContent></Card>
        <Card className={`${hasDiscrepancy ? "border-red-300 bg-red-50" : "border-green-200"}`}><CardContent className="p-3 text-center">{hasDiscrepancy ? <AlertTriangle className="h-4 w-4 mx-auto text-red-600" /> : <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />}<p className={`text-xl font-bold mt-1 ${hasDiscrepancy ? "text-red-600" : "text-green-600"}`}>{hasDiscrepancy ? "Mismatch" : "Tallied"}</p><p className="text-[10px] text-muted-foreground">Cash Status</p></CardContent></Card>
      </div>

      {/* Shift Cards */}
      <div className="space-y-4">
        {shifts.map((shift) => (
          <Card key={shift.shiftName} className={`${shift.status === "Discrepancy" ? "border-red-300" : "border-green-200"}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> {shift.shiftName} — {shift.cashier}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{shift.startTime} → {shift.endTime}</span>
                  <Badge className={`text-[9px] ${shift.status === "Closed" ? "bg-green-100 text-green-700" : shift.status === "Discrepancy" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{shift.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Collection Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {shift.collections.map((col) => (
                  <div key={col.mode} className="border rounded p-2 text-center">
                    <div className="flex items-center justify-center gap-1">{getModeIcon(col.mode)}<span className="text-[10px]">{col.mode}</span></div>
                    <p className="text-sm font-bold mt-0.5">₹{col.amount.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">{col.count} txns</p>
                  </div>
                ))}
              </div>

              {/* Cash Reconciliation */}
              <div className="grid sm:grid-cols-5 gap-2 text-xs bg-gray-50 rounded p-3">
                <div className="text-center"><p className="text-muted-foreground">Opening</p><p className="font-bold">₹{shift.openingCash.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-muted-foreground">+ Cash Collected</p><p className="font-bold text-green-600">₹{shift.collections.find(c => c.mode === "Cash")!.amount.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-muted-foreground">- Refunds/Expenses</p><p className="font-bold text-red-600">₹{(shift.refunds + shift.expenses).toLocaleString()}</p></div>
                <div className="text-center"><p className="text-muted-foreground">Expected</p><p className="font-bold">₹{shift.expectedCash.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-muted-foreground">Actual Count</p><p className={`font-bold ${shift.difference === 0 ? "text-green-600" : "text-red-600"}`}>₹{shift.actualCash.toLocaleString()}</p>{shift.difference !== 0 && <p className="text-[9px] text-red-600">Diff: ₹{shift.difference}</p>}</div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">Total Shift Collection: <span className="text-green-600">₹{shift.totalCollection.toLocaleString()}</span></p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-[9px]"><Printer className="h-3 w-3 mr-0.5" /> Print</Button>
                  {shift.status === "Open" && <Button size="sm" className="h-6 text-[9px] bg-green-600" onClick={() => toast.success(`${shift.shiftName} closed`)}><Lock className="h-3 w-3 mr-0.5" /> Close Shift</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Denomination Count */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4" /> Cash Denomination Count</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {denomination.map((d) => (
              <div key={d.note} className="text-center">
                <p className="text-[10px] font-medium text-muted-foreground">{d.note}</p>
                <Input className="h-7 text-xs text-center mt-1" type="number" placeholder="0" defaultValue="" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t">
            <p className="text-xs">Denomination Total: <span className="font-bold">₹0</span></p>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Denomination verified")}><CheckCircle2 className="mr-1 h-3 w-3" /> Verify & Save</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank Deposit */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Bank Deposit</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1 grid sm:grid-cols-3 gap-3">
            <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Deposit Amount</label><Input className="h-8 text-xs" type="number" placeholder="₹" /></div>
            <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Bank</label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="iob">IOB - Kadayanallur</SelectItem><SelectItem value="sbi">SBI - Kadayanallur</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Deposit Slip No</label><Input className="h-8 text-xs" placeholder="Slip number" /></div>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shrink-0" onClick={() => toast.success("Bank deposit recorded")}><Download className="mr-1 h-3 w-3" /> Record Deposit</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DayEndClose;
