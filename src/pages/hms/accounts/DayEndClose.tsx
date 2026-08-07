import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock, IndianRupee, CheckCircle2, AlertTriangle, Lock,
  Banknote, CreditCard, Smartphone, FileText, Printer,
  User, Loader2,
} from "lucide-react";
import { useDayEndClose } from "@/hooks/useDayEndClose";

const DayEndClose = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const { shifts, stats, loading, error, closeShift, closeDay } = useDayEndClose(selectedDate);

  const handleCloseShift = async (shiftId: string, expectedCash: number) => {
    const actualCash = expectedCash; // In real use, this comes from denomination count form
    const success = await closeShift(shiftId, actualCash);
    if (success) toast.success("Shift closed!");
    else toast.error("Failed to close shift");
  };

  const handleCloseDay = async () => {
    const openShifts = shifts.filter((s) => s.status === "Open");
    if (openShifts.length > 0) {
      toast.error("Close all shifts before closing the day");
      return;
    }
    const success = await closeDay();
    if (success) toast.success("Day closed! All shifts locked.");
    else toast.error("Failed to close day");
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "Cash": return <Banknote className="h-3 w-3 text-green-600" />;
      case "UPI": return <Smartphone className="h-3 w-3 text-purple-600" />;
      case "Card": return <CreditCard className="h-3 w-3 text-blue-600" />;
      case "Cheque": return <FileText className="h-3 w-3 text-amber-600" />;
      default: return <IndianRupee className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Clock className="h-5 w-5" /> Day End / Shift Close</h2>
        <div className="flex gap-2">
          <Input type="date" className="h-8 text-xs w-[130px]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={handleCloseDay}><Lock className="mr-1 h-3 w-3" /> Close Day</Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading shift data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Day Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(stats.totalDayCollection / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Day's Collection</p></CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="p-3 text-center"><Banknote className="h-4 w-4 mx-auto text-emerald-600" /><p className="text-xl font-bold text-emerald-600 mt-1">₹{(stats.totalCash / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Cash in Hand</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Smartphone className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">₹{(stats.totalDigital / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Digital</p></CardContent></Card>
        <Card className={`${stats.hasDiscrepancy ? "border-red-300 bg-red-50" : "border-green-200"}`}><CardContent className="p-3 text-center">{stats.hasDiscrepancy ? <AlertTriangle className="h-4 w-4 mx-auto text-red-600" /> : <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />}<p className={`text-xl font-bold mt-1 ${stats.hasDiscrepancy ? "text-red-600" : "text-green-600"}`}>{stats.hasDiscrepancy ? "Mismatch" : "Tallied"}</p><p className="text-[10px] text-muted-foreground">Cash Status</p></CardContent></Card>
      </div>

      {/* Shift Cards */}
      <div className="space-y-4">
        {shifts.map((shift) => (
          <Card key={shift.id} className={`${shift.status === "Discrepancy" ? "border-red-300" : shift.status === "Open" ? "border-amber-300" : "border-green-200"}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> {shift.shiftName} Shift — {shift.cashier}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{shift.startTime} → {shift.endTime}</span>
                  <Badge className={`text-[9px] ${shift.status === "Closed" || shift.status === "Verified" ? "bg-green-100 text-green-700" : shift.status === "Discrepancy" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{shift.status}</Badge>
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
                <div><span className="text-muted-foreground">Opening</span><p className="font-bold">₹{shift.openingCash.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">+ Cash Collected</span><p className="font-bold text-green-600">₹{(shift.collections.find((c) => c.mode === "Cash")?.amount || 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">- Refunds</span><p className="font-bold text-red-600">₹{shift.refunds.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">- Expenses</span><p className="font-bold text-red-600">₹{shift.expenses.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">= Expected</span><p className="font-bold">₹{shift.expectedCash.toLocaleString()}</p></div>
              </div>

              {/* Actual vs Expected */}
              {shift.actualCash !== null && (
                <div className="flex items-center justify-between text-xs border-t pt-2">
                  <span>Actual Cash: <strong>₹{shift.actualCash.toLocaleString()}</strong></span>
                  <span className={shift.difference === 0 ? "text-green-600" : "text-red-600"}>
                    Difference: <strong>₹{shift.difference}</strong>
                  </span>
                </div>
              )}

              {/* Close Shift Button */}
              {shift.status === "Open" && (
                <Button size="sm" variant="outline" className="w-full" onClick={() => handleCloseShift(shift.id, shift.expectedCash)}>
                  <Lock className="mr-1 h-3 w-3" /> Close This Shift
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print Summary */}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => toast.success("Day-end report printed")}><Printer className="mr-1 h-3 w-3" /> Print Summary</Button>
      </div>
    </div>
  );
};

export default DayEndClose;
