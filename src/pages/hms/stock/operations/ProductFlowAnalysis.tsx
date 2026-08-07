import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, BarChart3, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type FlowItem = {
  product_name: string;
  opening: number;
  received: number;
  sold: number;
  wastage: number;
  returned: number;
  closing: number;
};

const ProductFlowAnalysis = () => {
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [flowData, setFlowData] = useState<FlowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
    if (data && data.length > 0) setSelectedStore(data[0].id);
  };

  const handleGenerate = async () => {
    if (!selectedStore) { toast.error("Select a store"); return; }
    setLoading(true);
    try {
      // Fetch stock items for this store
      const { data: stockItems } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, quantity_available")
        .eq("ward_store_id", selectedStore);

      // Fetch consumption log for this store
      const { data: logs } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("ward_stock_item_id, quantity_consumed, consumption_type")
        .eq("ward_store_id", selectedStore);

      // Build flow per product
      const flowMap: Record<string, FlowItem> = {};

      (stockItems || []).forEach((item: any) => {
        flowMap[item.id] = {
          product_name: item.product_name,
          opening: item.quantity_available,
          received: 0,
          sold: 0,
          wastage: 0,
          returned: 0,
          closing: item.quantity_available,
        };
      });

      (logs || []).forEach((log: any) => {
        const id = log.ward_stock_item_id;
        if (!flowMap[id]) return;

        switch (log.consumption_type) {
          case "patient_use":
          case "therapy_use":
            flowMap[id].sold += log.quantity_consumed;
            break;
          case "transfer":
            flowMap[id].received += log.quantity_consumed;
            break;
          case "wastage":
            flowMap[id].wastage += log.quantity_consumed;
            break;
          case "returned":
            flowMap[id].returned += log.quantity_consumed;
            break;
        }
      });

      // Calculate closing = opening + received - sold - wastage + returned
      Object.values(flowMap).forEach(item => {
        item.closing = item.opening + item.received - item.sold - item.wastage + item.returned;
      });

      setFlowData(Object.values(flowMap).filter(f => f.received > 0 || f.sold > 0 || f.wastage > 0 || f.returned > 0));
      setGenerated(true);
      toast.success("Product flow analysis generated");
    } catch (err: any) {
      toast.error("Failed to generate analysis");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Product Flow Analysis
          </h2>
          <p className="text-sm text-muted-foreground">Opening + Received − Sold − Wastage + Returns = Closing per product</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 max-w-xl">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select store" /></SelectTrigger>
              <SelectContent>
                {wardStores.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-purple-700 hover:bg-purple-800" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Flow Analysis ({flowData.length} products with movement)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Opening</th>
                    <th className="px-3 py-2 text-center text-green-600">+ Received</th>
                    <th className="px-3 py-2 text-center text-red-600">− Sold</th>
                    <th className="px-3 py-2 text-center text-amber-600">− Wastage</th>
                    <th className="px-3 py-2 text-center text-blue-600">+ Returns</th>
                    <th className="px-3 py-2 text-center font-bold">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {flowData.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No product movement in selected store</td></tr>
                  ) : (
                    flowData.map((f, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 text-xs font-medium">{f.product_name}</td>
                        <td className="px-3 py-2 text-center text-xs">{f.opening}</td>
                        <td className="px-3 py-2 text-center text-xs text-green-600 font-bold">{f.received > 0 ? `+${f.received}` : "—"}</td>
                        <td className="px-3 py-2 text-center text-xs text-red-600 font-bold">{f.sold > 0 ? `-${f.sold}` : "—"}</td>
                        <td className="px-3 py-2 text-center text-xs text-amber-600">{f.wastage > 0 ? `-${f.wastage}` : "—"}</td>
                        <td className="px-3 py-2 text-center text-xs text-blue-600">{f.returned > 0 ? `+${f.returned}` : "—"}</td>
                        <td className="px-3 py-2 text-center text-xs font-bold">{f.closing}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI Flow Intelligence</p>
            <p className="text-[10px] text-purple-700">Analyzes real movement data from hms_ward_consumption_log. Shows exactly how stock moved: what came in (GRN), what went out (sales, therapy), losses (wastage), and returns.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductFlowAnalysis;
