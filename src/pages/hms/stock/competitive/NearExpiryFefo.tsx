import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ExpiryItem = {
  id: string;
  product_name: string;
  batch_number: string | null;
  expiry_date: string;
  quantity_available: number;
  cost_per_unit: number;
  daysLeft: number;
  value: number;
  zone: "red" | "amber" | "yellow" | "green";
};

export default function NearExpiryFefo() {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, batch_number, expiry_date, quantity_available, cost_per_unit")
        .not("expiry_date", "is", null)
        .gt("quantity_available", 0)
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const mapped: ExpiryItem[] = (data || [])
        .map((item: any) => {
          const exp = new Date(item.expiry_date);
          const daysLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          let zone: "red" | "amber" | "yellow" | "green" = "green";
          if (daysLeft <= 60) zone = "red";
          else if (daysLeft <= 90) zone = "amber";
          else if (daysLeft <= 180) zone = "yellow";
          return {
            ...item,
            daysLeft,
            value: item.quantity_available * item.cost_per_unit,
            zone,
          };
        })
        .filter((item: ExpiryItem) => item.daysLeft <= 180);

      setItems(mapped);
    } catch (err: any) {
      toast.error("Failed to load expiry data");
      console.error(err);
    }
    setLoading(false);
  };

  const red = items.filter(a => a.zone === "red");
  const amber = items.filter(a => a.zone === "amber");
  const yellow = items.filter(a => a.zone === "yellow");
  const totalAtRisk = items.reduce((s, a) => s + a.value, 0);

  const getAction = (zone: string, daysLeft: number) => {
    if (daysLeft <= 30) return "Immediate discount sale / return to supplier";
    if (zone === "red") return "Push discount sale or transfer to high-demand branch";
    if (zone === "amber") return "Transfer to high-consumption branch";
    return "Normal FEFO dispensing — monitor weekly";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-red-600" /> Near-Expiry Alert & FEFO</h1>
          <p className="text-muted-foreground mt-1">First Expiry First Out — 60/90/180 day alerts from live Supabase stock.</p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">₹{totalAtRisk.toLocaleString()} at risk</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{red.length}</p><p className="text-xs text-muted-foreground">Critical (&le;60 days)</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{amber.length}</p><p className="text-xs text-muted-foreground">Warning (61-90 days)</p></CardContent></Card>
        <Card className="border-yellow-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-yellow-600">{yellow.length}</p><p className="text-xs text-muted-foreground">Watch (91-180 days)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalAtRisk / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Value at Risk</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Expiry Alerts ({items.length} items)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Batch</th>
                  <th className="px-3 py-2 text-center">Expiry</th>
                  <th className="px-3 py-2 text-center">Days Left</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No near-expiry items found</td></tr>
                ) : (
                  items.map((a) => (
                    <tr key={a.id} className={`border-b ${a.zone === "red" ? "bg-red-50" : a.zone === "amber" ? "bg-amber-50/50" : ""}`}>
                      <td className="px-3 py-2 text-xs font-medium">{a.product_name}</td>
                      <td className="px-3 py-2 text-xs font-mono">{a.batch_number || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs">{a.expiry_date}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={a.zone === "red" ? "destructive" : a.zone === "amber" ? "default" : "secondary"} className="text-[10px]">{a.daysLeft}d</Badge>
                      </td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{a.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold">₹{a.value.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[10px] text-purple-700">{getAction(a.zone, a.daysLeft)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI FEFO Intelligence</p>
            <p className="text-sm text-purple-700">
              {red.length > 0 ? `${red.length} items expiring within 60 days (₹${red.reduce((s, r) => s + r.value, 0).toLocaleString()} value). Immediate action required.` : "No critical expiry items."}
              {" "}System enforces FEFO: earliest expiry batch is always dispensed first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
