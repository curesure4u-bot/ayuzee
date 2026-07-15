import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UtensilsCrossed, Plus, CheckCircle, Clock, Printer } from "lucide-react";

type KOT = {
  id: string; kotNo: string; table: string; area: string;
  items: { name: string; qty: number; special: string }[];
  status: "new" | "preparing" | "ready" | "served"; time: string;
  patient: string; dietLinked: boolean;
};

const mockKots: KOT[] = [
  { id: "1", kotNo: "KOT-045", table: "IP-Room 101", area: "Patient Room", items: [{ name: "Rice + Dal + Vegetables (Pathya)", qty: 1, special: "No salt extra" }, { name: "Warm Water", qty: 1, special: "" }], status: "preparing", time: "12:30", patient: "Ramesh Kumar", dietLinked: true },
  { id: "2", kotNo: "KOT-046", table: "IP-PK-2", area: "Panchakarma Wing", items: [{ name: "Peya (Rice Gruel) - Samsarjana Day 2", qty: 1, special: "No oil, no salt" }], status: "new", time: "12:30", patient: "Meera Nair", dietLinked: true },
  { id: "3", kotNo: "KOT-047", table: "Table 3", area: "Restaurant (AC)", items: [{ name: "Ayurveda Thali", qty: 2, special: "1 without curd" }, { name: "Fresh Juice", qty: 2, special: "No sugar" }], status: "ready", time: "12:15", patient: "Visitor", dietLinked: false },
  { id: "4", kotNo: "KOT-048", table: "Table 7", area: "Restaurant (Lawn)", items: [{ name: "Herbal Tea", qty: 3, special: "" }, { name: "Fruit Bowl", qty: 3, special: "" }], status: "served", time: "11:45", patient: "Staff", dietLinked: false },
  { id: "5", kotNo: "KOT-049", table: "IP-Room 201", area: "Patient Room", items: [{ name: "Kapha-Reducing Lunch", qty: 1, special: "Light, dry, warm. No dairy" }, { name: "Honey Water", qty: 1, special: "" }], status: "preparing", time: "12:30", patient: "Lakshmi Devi", dietLinked: true },
];

const HmsCanteen = () => {
  const [kots] = useState<KOT[]>(mockKots);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-orange-600" /> Restaurant & Canteen
          </h1>
          <p className="text-sm text-muted-foreground">Kitchen order tickets (KOT) · Multi-area billing · Diet integration · Remote kitchen display</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all"><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Areas</SelectItem><SelectItem value="patient">Patient Rooms</SelectItem><SelectItem value="ac">Restaurant (AC)</SelectItem><SelectItem value="lawn">Lawn Area</SelectItem></SelectContent></Select>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New KOT</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{kots.filter(k => k.status === "new").length}</p><p className="text-xs text-muted-foreground">New Orders</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{kots.filter(k => k.status === "preparing").length}</p><p className="text-xs text-muted-foreground">Preparing</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{kots.filter(k => k.status === "ready").length}</p><p className="text-xs text-muted-foreground">Ready to Serve</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{kots.filter(k => k.dietLinked).length}</p><p className="text-xs text-muted-foreground">Diet-Linked</p></CardContent></Card>
      </div>

      {/* KOT Board - Kitchen Display Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kots.filter(k => k.status !== "served").map((kot) => (
          <Card key={kot.id} className={`${kot.status === "new" ? "border-red-300 bg-red-50/30" : kot.status === "preparing" ? "border-amber-300 bg-amber-50/20" : "border-green-300 bg-green-50/20"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{kot.kotNo}</Badge>
                  <Badge variant={kot.status === "new" ? "destructive" : kot.status === "preparing" ? "default" : "outline"} className={`text-[10px] capitalize ${kot.status === "ready" ? "text-green-600" : ""}`}>{kot.status}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{kot.time}</span>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium">{kot.table}</p>
                <p className="text-xs text-muted-foreground">{kot.area} · {kot.patient}</p>
                {kot.dietLinked && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[9px] mt-1">Diet-Linked</Badge>}
              </div>
              <div className="space-y-1 border-t pt-2">
                {kot.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span><strong>{item.qty}x</strong> {item.name}</span>
                    {item.special && <Badge variant="secondary" className="text-[8px]">{item.special}</Badge>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                {kot.status === "new" && <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => toast.success("Marked: Preparing")}>Start</Button>}
                {kot.status === "preparing" && <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => toast.success("Marked: Ready")}>Ready</Button>}
                {kot.status === "ready" && <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => toast.success("Served")}>Served</Button>}
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Printer className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Served History */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Today's Served ({kots.filter(k => k.status === "served").length})</CardTitle></CardHeader>
        <CardContent>
          {kots.filter(k => k.status === "served").map((kot) => (
            <div key={kot.id} className="flex items-center justify-between p-2 rounded border mb-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-mono">{kot.kotNo}</Badge>
                <span className="text-xs">{kot.table} · {kot.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</span>
              </div>
              <span className="text-xs text-muted-foreground">{kot.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsCanteen;
