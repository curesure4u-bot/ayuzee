import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, AlertTriangle, CheckCircle, TrendingUp, ShoppingCart } from "lucide-react";

const items = [
  { item: "Rasnasaptakam Kashayam 450ml", current: 32, min: 20, max: 150, rol: 50, avgDaily: 5, leadDays: 7, daysOfStock: 6, status: "critical" },
  { item: "Simhanada Guggulu 60t", current: 85, min: 30, max: 200, rol: 60, avgDaily: 4, leadDays: 5, daysOfStock: 21, status: "ok" },
  { item: "Kottamchukkadi Taila 200ml", current: 28, min: 15, max: 100, rol: 35, avgDaily: 3, leadDays: 7, daysOfStock: 9, status: "below_rol" },
  { item: "Ashwagandha Churna 100g", current: 45, min: 20, max: 120, rol: 40, avgDaily: 2, leadDays: 5, daysOfStock: 22, status: "ok" },
  { item: "Dashamoolarishtam 450ml", current: 18, min: 15, max: 100, rol: 35, avgDaily: 3, leadDays: 7, daysOfStock: 6, status: "critical" },
  { item: "Triphala Churna 100g", current: 200, min: 50, max: 250, rol: 80, avgDaily: 6, leadDays: 4, daysOfStock: 33, status: "ok" },
  { item: "Chandraprabha Vati 60t", current: 55, min: 20, max: 120, rol: 45, avgDaily: 2, leadDays: 6, daysOfStock: 27, status: "ok" },
  { item: "Mahanarayan Taila 200ml", current: 12, min: 10, max: 80, rol: 25, avgDaily: 2, leadDays: 7, daysOfStock: 6, status: "critical" },
  { item: "Bala Taila 200ml", current: 38, min: 10, max: 60, rol: 20, avgDaily: 1, leadDays: 7, daysOfStock: 38, status: "ok" },
  { item: "Dhanwantharam Taila 200ml", current: 22, min: 12, max: 70, rol: 30, avgDaily: 2, leadDays: 7, daysOfStock: 11, status: "below_rol" },
];

export default function ReorderLevel() {
  const critical = items.filter(i => i.status === "critical");
  const belowRol = items.filter(i => i.status === "below_rol");
  const ok = items.filter(i => i.status === "ok");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" /> Min / Max / Reorder Level
          </h1>
          <p className="text-muted-foreground mt-1">Per-item stock thresholds with auto-PO trigger — never stock out, never overstock</p>
        </div>
        <Button onClick={() => toast.success(`Auto-PO generated for ${critical.length + belowRol.length} items`)}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Generate Auto-PO ({critical.length + belowRol.length} items)
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{critical.length}</p><p className="text-xs text-muted-foreground">Critical (≤ Min)</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{belowRol.length}</p><p className="text-xs text-muted-foreground">Below ROL</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{ok.length}</p><p className="text-xs text-muted-foreground">Healthy</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Stock Level Monitor</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Current</th>
                  <th className="px-3 py-2 text-center">Min</th>
                  <th className="px-3 py-2 text-center">ROL</th>
                  <th className="px-3 py-2 text-center">Max</th>
                  <th className="px-3 py-2 text-center">Avg/Day</th>
                  <th className="px-3 py-2 text-center">Lead (days)</th>
                  <th className="px-3 py-2 text-center">Days Left</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const fillPct = Math.round((item.current / item.max) * 100);
                  return (
                    <tr key={i} className={`border-b ${item.status === "critical" ? "bg-red-50/50" : item.status === "below_rol" ? "bg-amber-50/50" : ""}`}>
                      <td className="px-3 py-2 text-xs font-medium">{item.item}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <span className="font-bold text-xs">{item.current}</span>
                          <Progress value={fillPct} className="w-12 h-1.5" />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-xs text-red-600">{item.min}</td>
                      <td className="px-3 py-2 text-center text-xs text-amber-600 font-bold">{item.rol}</td>
                      <td className="px-3 py-2 text-center text-xs text-green-600">{item.max}</td>
                      <td className="px-3 py-2 text-center text-xs">{item.avgDaily}/day</td>
                      <td className="px-3 py-2 text-center text-xs">{item.leadDays}d</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">
                        <span className={item.daysOfStock <= 7 ? "text-red-600" : item.daysOfStock <= 14 ? "text-amber-600" : "text-green-600"}>
                          {item.daysOfStock}d
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={item.status === "critical" ? "destructive" : item.status === "below_rol" ? "default" : "outline"} className={`text-[10px] ${item.status === "ok" ? "text-green-600" : ""}`}>
                          {item.status === "critical" ? "Critical" : item.status === "below_rol" ? "Below ROL" : "OK"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 text-xs text-blue-700 space-y-1">
          <p><strong>ROL Formula:</strong> Reorder Level = (Avg Daily Consumption × Lead Time) + Safety Stock</p>
          <p><strong>Order Qty:</strong> Max Level − Current Stock (when ROL hit)</p>
          <p><strong>Safety Stock:</strong> (Max Daily Usage − Avg Daily Usage) × Lead Time</p>
          <p><strong>Auto-PO Trigger:</strong> When Current ≤ ROL, system auto-generates Purchase Order to reach Max level</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Reorder Optimizer</p>
            <p className="text-sm text-purple-700">
              3 items critical (Rasnasaptakam, Dashamoolarishtam, Mahanarayan) — will stock out within 6 days.
              Auto-PO recommended: 118 units Rasnasaptakam (₹17,110), 82 units Dashamool (₹11,070), 68 units Mahanarayan (₹12,240).
              Total auto-PO value: ₹40,420. AI adjusts ROL dynamically based on Ritu (monsoon +30% buffer for Vata medicines).
              Triphala at 200 units (near max 250) — defer next purchase by 3 weeks to avoid overstock.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
