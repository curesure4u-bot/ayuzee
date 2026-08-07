import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AnalysisItem = {
  product_name: string;
  category: "A" | "B" | "C";
  value: number;
  pct: number;
  quantity: number;
};

const AbcAnalysis = () => {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("product_name, quantity_available, cost_per_unit")
        .gt("quantity_available", 0)
        .order("cost_per_unit", { ascending: false });

      if (error) throw error;

      const totalValue = (data || []).reduce((s: number, d: any) => s + (d.quantity_available * d.cost_per_unit), 0);

      // Classify: top 20% value = A, next 30% = B, rest = C
      let cumulative = 0;
      const classified: AnalysisItem[] = (data || []).map((d: any) => {
        const value = d.quantity_available * d.cost_per_unit;
        cumulative += value;
        const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const cumulativePct = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;

        let category: "A" | "B" | "C" = "C";
        if (cumulativePct <= 70) category = "A";
        else if (cumulativePct <= 90) category = "B";

        return { product_name: d.product_name, category, value, pct, quantity: d.quantity_available };
      });

      setItems(classified);
    } catch (err: any) {
      toast.error("Failed to load analysis");
      console.error(err);
    }
    setLoading(false);
  };

  const aItems = items.filter(d => d.category === "A");
  const bItems = items.filter(d => d.category === "B");
  const cItems = items.filter(d => d.category === "C");
  const totalValue = items.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" /> ABC Inventory Analysis (Live)</h1>
          <p className="text-muted-foreground mt-1">Classify inventory by value — A (high), B (medium), C (low). Live from Supabase.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-600">A — High Value</p>
            <p className="text-xs text-muted-foreground">{aItems.length} items (₹{(aItems.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K)</p>
            <p className="text-[10px]">Tight control, frequent reorder</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">B — Medium Value</p>
            <p className="text-xs text-muted-foreground">{bItems.length} items (₹{(bItems.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K)</p>
            <p className="text-[10px]">Regular monitoring</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-green-600">C — Low Value</p>
            <p className="text-xs text-muted-foreground">{cItems.length} items (₹{(cItems.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K)</p>
            <p className="text-[10px]">Bulk order, minimal control</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Item Classification ({items.length} items)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Class</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-center">% of Total</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No stock data for analysis</td></tr>
                ) : (
                  items.slice(0, 20).map((d, i) => (
                    <tr key={i} className={`border-b ${d.category === "A" ? "bg-red-50/30" : d.category === "B" ? "bg-amber-50/30" : ""}`}>
                      <td className="px-3 py-2 text-xs font-medium">{d.product_name}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={d.category === "A" ? "destructive" : d.category === "B" ? "default" : "secondary"} className="text-[10px]">{d.category}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-bold">₹{d.value.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center text-xs">{d.pct.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-center text-xs">{d.quantity}</td>
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
            <p className="font-semibold text-purple-800">AI ABC Intelligence</p>
            <p className="text-sm text-purple-700">
              {aItems.length > 0
                ? `Category A: ${aItems.length} items account for ~70% of stock value (₹${(aItems.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K). These need tightest control and frequent reorder points.`
                : "Add stock items to see ABC classification analysis."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbcAnalysis;
