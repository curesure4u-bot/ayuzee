import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Lock, CheckCircle, Clock, AlertTriangle, Package, Pill } from "lucide-react";

const reservations = [
  { id: "RES-801", patient: "Rajesh Kumar", rx: "Rx#4525", doctor: "Dr. Arun", time: "10:42 AM", items: [{ medicine: "Rasnasaptakam 200ml", qty: 3, reserved: true }, { medicine: "Simhanada Guggulu 60t", qty: 1, reserved: true }, { medicine: "Kottamchukkadi Taila 200ml", qty: 1, reserved: true }], totalValue: 1060, status: "reserved", expiresIn: "45 min" },
  { id: "RES-800", patient: "Meera Nair", rx: "Rx#4526", doctor: "Dr. Arun", time: "10:30 AM", items: [{ medicine: "Chandraprabha Vati 60t", qty: 2, reserved: true }, { medicine: "Ashwagandha Churna 100g", qty: 2, reserved: true }], totalValue: 680, status: "reserved", expiresIn: "30 min" },
  { id: "RES-799", patient: "Suresh Menon", rx: "Rx#4527", doctor: "Dr. Priya", time: "10:15 AM", items: [{ medicine: "Mahanarayan Taila 200ml", qty: 2, reserved: true }, { medicine: "Dashamoolarishtam 450ml", qty: 1, reserved: true }], totalValue: 825, status: "dispensed", expiresIn: "—" },
  { id: "RES-798", patient: "Priya Sharma", rx: "Rx#4528", doctor: "Dr. Priya", time: "09:55 AM", items: [{ medicine: "Rasnasaptakam 200ml", qty: 2, reserved: false }, { medicine: "Triphala Churna 100g", qty: 1, reserved: true }], totalValue: 540, status: "partial_stockout", expiresIn: "—" },
  { id: "RES-797", patient: "Anand Patel", rx: "Rx#4529", doctor: "Dr. Arun", time: "09:30 AM", items: [{ medicine: "Simhanada Guggulu 60t", qty: 1, reserved: true }, { medicine: "Rasnasaptakam 200ml", qty: 3, reserved: true }], totalValue: 780, status: "expired_released", expiresIn: "—" },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  reserved: { color: "bg-blue-100 text-blue-700", label: "Reserved" },
  dispensed: { color: "bg-green-100 text-green-700", label: "Dispensed" },
  partial_stockout: { color: "bg-amber-100 text-amber-700", label: "Partial (Stock-out)" },
  expired_released: { color: "bg-gray-100 text-gray-600", label: "Released (expired)" },
};

export default function RxStockSync() {
  const reserved = reservations.filter(r => r.status === "reserved");
  const dispensed = reservations.filter(r => r.status === "dispensed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6 text-blue-600" /> Prescription-to-Stock Sync</h1>
          <p className="text-muted-foreground mt-1">Doctor writes Rx → stock auto-reserved → patient collects. No more "sold to walk-in before patient arrives."</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 text-xs">{reserved.length} active reservations</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Lock className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{reserved.length}</p><p className="text-[10px] text-muted-foreground">Reserved</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{dispensed.length}</p><p className="text-[10px] text-muted-foreground">Dispensed</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{reservations.filter(r => r.status === "partial_stockout").length}</p><p className="text-[10px] text-muted-foreground">Stock-out</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-gray-500" /><p className="text-xl font-bold">{reservations.filter(r => r.status === "expired_released").length}</p><p className="text-[10px] text-muted-foreground">Released</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Live Reservations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reservations.map((res) => {
            const sc = statusConfig[res.status];
            return (
              <div key={res.id} className={`p-3 rounded border ${res.status === "reserved" ? "border-blue-200 bg-blue-50/20" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{res.patient}</p>
                    <Badge className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                    {res.status === "reserved" && <Badge variant="outline" className="text-[10px] text-amber-600">Expires: {res.expiresIn}</Badge>}
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-muted-foreground">{res.rx} • {res.doctor} • {res.time}</p>
                    <p className="font-bold">₹{res.totalValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {res.items.map((item, j) => (
                    <Badge key={j} variant={item.reserved ? "outline" : "destructive"} className={`text-[10px] ${item.reserved ? "text-green-600" : ""}`}>
                      <Pill className="h-2.5 w-2.5 mr-0.5" />{item.medicine} ×{item.qty} {item.reserved ? "✓" : "✗ Out"}
                    </Badge>
                  ))}
                </div>
                {res.status === "reserved" && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${res.id} dispensed`)}>Dispense Now</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info(`${res.id} reservation released`)}>Release</Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 text-xs text-blue-700 space-y-1">
          <p><strong>How it works:</strong></p>
          <p>1. Doctor submits Rx → System checks stock availability instantly</p>
          <p>2. If available: Auto-reserves (locks) those items for 60 minutes</p>
          <p>3. Patient reaches pharmacy → reserved items dispensed immediately</p>
          <p>4. If patient doesn't collect within 60 min → reservation released back to general stock</p>
          <p>5. If stock insufficient: Doctor gets alert before Rx submission → can suggest alternative</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Sync Intelligence</p><p className="text-sm text-purple-700">Before Rx-Sync: 8% of patients faced "medicine sold before reaching pharmacy." After: 0.5% (only genuine stock-outs). RES-798 (Priya Sharma): Rasnasaptakam stock-out detected at Rx time — doctor was alerted, prescribed Maharasnadi Kashayam instead. RES-797 (Anand Patel): Didn't collect in 60 min — released. AI sent WhatsApp reminder at 45 min mark. Walk-in revenue protected: ₹12,000/month no longer lost to "reserved but not collected."</p></div></CardContent></Card>
    </div>
  );
}
