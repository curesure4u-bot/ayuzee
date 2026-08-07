import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type StoreStock = {
  store_id: string;
  store_name: string;
  product_name: string;
  quantity: number;
  item_id: string;
};

type Suggestion = {
  item: string;
  from_store: string;
  from_store_id: string;
  from_qty: number;
  to_store: string;
  to_store_id: string;
  to_qty: number;
  suggest_qty: number;
  priority: "critical" | "high" | "medium";
};

export default function StockRedistribution() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    analyzStock();
  }, []);

  const analyzStock = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, quantity_available, ward_store_id, hms_ward_stores(ward_name)")
        .gt("quantity_available", 0)
        .order("product_name");

      if (error) throw error;

      // Group by product
      const productMap: Record<string, StoreStock[]> = {};
      (data || []).forEach((item: any) => {
        const name = item.product_name;
        if (!productMap[name]) productMap[name] = [];
        productMap[name].push({
          store_id: item.ward_store_id,
          store_name: item.hms_ward_stores?.ward_name || "Unknown",
          product_name: name,
          quantity: item.quantity_available,
          item_id: item.id,
        });
      });

      // Find imbalances: one store has a lot, another has very little
      const suggestions: Suggestion[] = [];
      Object.entries(productMap).forEach(([product, stores]) => {
        if (stores.length < 2) return;
        const sorted = [...stores].sort((a, b) => b.quantity - a.quantity);
        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];

        if (highest.quantity > 10 && lowest.quantity <= 5 && highest.store_id !== lowest.store_id) {
          const suggestQty = Math.min(Math.floor(highest.quantity * 0.3), highest.quantity - lowest.quantity);
          if (suggestQty >= 2) {
            let priority: "critical" | "high" | "medium" = "medium";
            if (lowest.quantity <= 2) priority = "critical";
            else if (lowest.quantity <= 5) priority = "high";

            suggestions.push({
              item: product,
              from_store: highest.store_name,
              from_store_id: highest.store_id,
              from_qty: highest.quantity,
              to_store: lowest.store_name,
              to_store_id: lowest.store_id,
              to_qty: lowest.quantity,
              suggest_qty: suggestQty,
              priority,
            });
          }
        }
      });

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2 };
      suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setSuggestions(suggestions);
    } catch (err: any) {
      toast.error("Failed to analyze stock");
      console.error(err);
    }
    setLoading(false);
  };

  const handleExecuteTransfer = async (suggestion: Suggestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); return; }

      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .insert({
          from_store_id: suggestion.from_store_id,
          to_store_id: suggestion.to_store_id,
          product_name: suggestion.item,
          quantity: suggestion.suggest_qty,
          transfer_reason: `AI Redistribution: ${suggestion.from_store} (${suggestion.from_qty}) → ${suggestion.to_store} (${suggestion.to_qty})`,
          status: "in_transit",
          requested_by: user.id,
        });

      if (error) throw error;
      toast.success(`Transfer created: ${suggestion.suggest_qty} ${suggestion.item} → ${suggestion.to_store}`);
      setSuggestions(suggestions.filter(s => s !== suggestion));
    } catch (err: any) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    }
  };

  const handleExecuteAll = async () => {
    setExecuting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Login required"); setExecuting(false); return; }

    let count = 0;
    for (const s of suggestions) {
      try {
        await (supabase as any).from("hms_ward_stock_transfers").insert({
          from_store_id: s.from_store_id,
          to_store_id: s.to_store_id,
          product_name: s.item,
          quantity: s.suggest_qty,
          transfer_reason: `AI Redistribution (batch): ${s.from_store} → ${s.to_store}`,
          status: "in_transit",
          requested_by: user.id,
        });
        count++;
      } catch (err) { /* continue */ }
    }
    toast.success(`${count} redistributions executed`);
    setSuggestions([]);
    setExecuting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" /> Stock Redistribution AI</h1>
          <p className="text-muted-foreground mt-1">AI detects imbalances across stores — auto-suggests transfers to prevent stock-outs.</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">{suggestions.length} Suggestions</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{suggestions.filter(s => s.priority === "critical").length}</p><p className="text-[10px] text-muted-foreground">Critical</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{suggestions.filter(s => s.priority === "high").length}</p><p className="text-[10px] text-muted-foreground">High Priority</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{suggestions.length}</p><p className="text-[10px] text-muted-foreground">Total Suggestions</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">Live</p><p className="text-[10px] text-muted-foreground">Real-time Analysis</p></CardContent></Card>
      </div>

      {suggestions.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">All stores are well-balanced. No redistribution needed.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <Card key={i} className={s.priority === "critical" ? "border-red-300" : s.priority === "high" ? "border-amber-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{s.item}</p>
                      <Badge variant={s.priority === "critical" ? "destructive" : s.priority === "high" ? "default" : "secondary"} className="text-[10px]">{s.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="text-center p-2 rounded bg-green-50 min-w-[100px]">
                        <p className="font-bold text-green-700">{s.from_store}</p>
                        <p className="text-[10px]">{s.from_qty} units</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="h-4 w-4 text-purple-600" />
                        <Badge className="bg-purple-100 text-purple-700 text-[10px] mt-0.5">{s.suggest_qty} units</Badge>
                      </div>
                      <div className="text-center p-2 rounded bg-red-50 min-w-[100px]">
                        <p className="font-bold text-red-700">{s.to_store}</p>
                        <p className="text-[10px]">{s.to_qty} units</p>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="h-7 text-xs ml-3" onClick={() => handleExecuteTransfer(s)}>Execute</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <Button className="w-full" onClick={handleExecuteAll} disabled={executing}>
          {executing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Execute All Redistributions ({suggestions.length})
        </Button>
      )}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Redistribution Logic</p>
            <p className="text-sm text-purple-700">
              Analyzes live stock levels across all ward stores. Identifies items where one store has 30%+ surplus while another is critically low (&le;5 units). Each "Execute" creates a real transfer record in hms_ward_stock_transfers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
