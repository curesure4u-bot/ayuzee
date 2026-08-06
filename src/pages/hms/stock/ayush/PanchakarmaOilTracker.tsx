import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Droplets, Brain, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

const oils = [
  { name: "Kottamchukkadi Taila", stock: 4200, unit: "ml", perSession: 200, sessions: 21, threshold: 2000, category: "Kati Vasti / Abhyanga" },
  { name: "Mahanarayan Taila", stock: 3600, unit: "ml", perSession: 150, sessions: 24, threshold: 1500, category: "Abhyanga / Shiro" },
  { name: "Dhanwantharam Taila", stock: 2800, unit: "ml", perSession: 175, sessions: 16, threshold: 1800, category: "Postpartum / Abhyanga" },
  { name: "Bala Taila", stock: 1200, unit: "ml", perSession: 100, sessions: 12, threshold: 1000, category: "Pizhichil / Shirodhara" },
  { name: "Ksheerabala Taila", stock: 900, unit: "ml", perSession: 80, sessions: 11, threshold: 800, category: "Nasyam / Karnapooranam" },
  { name: "Tila Taila (base)", stock: 8500, unit: "ml", perSession: 400, sessions: 21, threshold: 3000, category: "Base oil / Pizhichil" },
];

const recentDeductions = [
  { date: "22 Jul", patient: "Rajesh Kumar", therapy: "Kati Vasti", oil: "Kottamchukkadi Taila", qty: 200, doctor: "Dr. Arun" },
  { date: "22 Jul", patient: "Meera Nair", therapy: "Abhyanga", oil: "Mahanarayan Taila", qty: 150, doctor: "Dr. Arun" },
  { date: "22 Jul", patient: "Suresh Menon", therapy: "Shirodhara", oil: "Ksheerabala Taila", qty: 80, doctor: "Dr. Priya" },
  { date: "21 Jul", patient: "Priya Sharma", therapy: "Pizhichil", oil: "Tila Taila (base)", qty: 400, doctor: "Dr. Arun" },
  { date: "21 Jul", patient: "Anand Patel", therapy: "Nasyam", oil: "Ksheerabala Taila", qty: 80, doctor: "Dr. Priya" },
];

export default function PanchakarmaOilTracker() {
  const [selectedTherapy, setSelectedTherapy] = useState("");
  const [selectedOil, setSelectedOil] = useState("");
  const [qty, setQty] = useState("");

  const lowStock = oils.filter(o => o.stock <= o.threshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="h-6 w-6 text-amber-600" /> Panchakarma Oil Consumption Tracker
        </h1>
        <p className="text-muted-foreground mt-1">Auto-deduct oils per therapy session — real-time stock management for PK room</p>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{lowStock.length} oils below threshold:</strong> {lowStock.map(o => o.name).join(", ")} — Reorder recommended.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {oils.map((oil, i) => {
          const pct = Math.round((oil.stock / (oil.sessions * oil.perSession)) * 100);
          const isLow = oil.stock <= oil.threshold;
          return (
            <Card key={i} className={isLow ? "border-amber-300" : ""}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold truncate">{oil.name}</p>
                  {isLow && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
                </div>
                <p className="text-lg font-bold">{oil.stock.toLocaleString()} {oil.unit}</p>
                <p className="text-[10px] text-muted-foreground">{oil.category}</p>
                <Progress value={Math.min(pct, 100)} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">~{Math.floor(oil.stock / oil.perSession)} sessions remaining</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Manual Deduction (Session-wise)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select onValueChange={setSelectedTherapy}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Therapy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kati-vasti">Kati Vasti</SelectItem>
                <SelectItem value="abhyanga">Abhyanga</SelectItem>
                <SelectItem value="shirodhara">Shirodhara</SelectItem>
                <SelectItem value="pizhichil">Pizhichil</SelectItem>
                <SelectItem value="nasyam">Nasyam</SelectItem>
                <SelectItem value="karnapooranam">Karnapooranam</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedOil}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Oil" /></SelectTrigger>
              <SelectContent>
                {oils.map(o => <SelectItem key={o.name} value={o.name}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Qty (ml)"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="h-9 text-xs"
            />
            <Button
              className="h-9 text-xs"
              onClick={() => {
                if (!selectedTherapy || !selectedOil || !qty) {
                  toast.error("Please fill all fields");
                  return;
                }
                toast.success(`Deducted ${qty}ml of ${selectedOil} for ${selectedTherapy}`);
                setQty("");
              }}
            >
              <TrendingDown className="h-3.5 w-3.5 mr-1" /> Deduct Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Deductions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Therapy</th>
                  <th className="px-3 py-2 text-left">Oil</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Doctor</th>
                </tr>
              </thead>
              <tbody>
                {recentDeductions.map((d, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{d.date}</td>
                    <td className="px-3 py-2 text-xs font-medium">{d.patient}</td>
                    <td className="px-3 py-2 text-xs">{d.therapy}</td>
                    <td className="px-3 py-2 text-xs">{d.oil}</td>
                    <td className="px-3 py-2 text-center font-bold text-red-600 text-xs">-{d.qty}ml</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{d.doctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Oil Planning</p>
            <p className="text-sm text-purple-700">
              Next 7 days: 18 Kati Vasti + 12 Abhyanga + 6 Shirodhara sessions scheduled.
              Estimated consumption: Kottamchukkadi 3,600ml, Mahanarayan 1,800ml, Ksheerabala 480ml.
              <strong> Ksheerabala Taila will hit zero in 3 days</strong> — auto-PO suggested (2L).
              Tila base oil sufficient for 21+ days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
