import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type StockItem = {
  id: string;
  product_name: string;
  quantity_available: number;
  cost_per_unit: number;
};

// Predefined kit templates (these would eventually come from a kit config table)
const kitTemplates = [
  { name: "Spine Ayush - 5 Day Package", items: ["Kottamchukkadi Taila", "Mahanarayan Taila", "Rasnasaptakam", "Simhanada Guggulu", "Triphala Churna"] },
  { name: "Joint Care Monthly Kit", items: ["Simhanada Guggulu", "Rasnasaptakam", "Ashwagandha Churna"] },
  { name: "PK Abhyanga Kit", items: ["Kottamchukkadi Taila", "Dhanwantharam Taila", "Eladi Coconut Oil"] },
];

export default function KitAssembly() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStock(); }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, quantity_available, cost_per_unit")
        .gt("quantity_available", 0)
        .order("product_name");
      setStockItems(data || []);
    } catch (err: any) { toast.error("Failed to load stock"); }
    setLoading(false);
  };

  const getAvailability = (itemName: string) => {
    const match = stockItems.find(s => s.product_name.toLowerCase().includes(itemName.toLowerCase()));
    return match ? { available: true, qty: match.quantity_available, cost: match.cost_per_unit } : { available: false, qty: 0, cost: 0 };
  };

  const canAssembleKit = (items: string[]) => items.every(item => getAvailability(item).available);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-indigo-600" /> Kit Assembly</h1>
        <p className="text-muted-foreground mt-1">Pre-defined treatment kits — check component availability from live stock.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{kitTemplates.length}</p><p className="text-xs text-muted-foreground">Kit Templates</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{kitTemplates.filter(k => canAssembleKit(k.items)).length}</p><p className="text-xs text-muted-foreground">Can Assemble</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{stockItems.length}</p><p className="text-xs text-muted-foreground">Stock Items Available</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {kitTemplates.map((kit, idx) => {
          const canAssemble = canAssembleKit(kit.items);
          const kitCost = kit.items.reduce((s, item) => s + getAvailability(item).cost, 0);
          return (
            <Card key={idx} className={canAssemble ? "border-green-200" : "border-red-200"}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{kit.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={canAssemble ? "outline" : "destructive"} className={`text-[10px] ${canAssemble ? "text-green-600" : ""}`}>
                      {canAssemble ? "Ready to Assemble" : "Missing Items"}
                    </Badge>
                    <span className="text-xs font-bold">₹{kitCost.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {kit.items.map((item, i) => {
                    const avail = getAvailability(item);
                    return (
                      <Badge key={i} variant={avail.available ? "outline" : "destructive"} className={`text-[10px] ${avail.available ? "text-green-600" : ""}`}>
                        {item} {avail.available ? `(${avail.qty})` : "✗"}
                      </Badge>
                    );
                  })}
                </div>
                {canAssemble && (
                  <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => toast.success(`Kit "${kit.name}" assembled`)}>Assemble Kit</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">Kit Intelligence</p>
            <p className="text-[10px] text-purple-700">Components checked against live hms_ward_stock_items. Kits show green when all items available, red when any component missing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
