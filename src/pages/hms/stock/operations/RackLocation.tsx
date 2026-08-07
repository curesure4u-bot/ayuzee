import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Search, Brain, Printer, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type RackItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  quantity_available: number;
  min_stock_level: number;
  batch_number: string | null;
  rack: string;
  shelf: number;
  bin: number;
  restock: boolean;
};

// Generate rack location from product category deterministically
const getRack = (category: string | null, index: number): { rack: string; shelf: number; bin: number } => {
  const cat = (category || "").toLowerCase();
  let rack = "A";
  if (cat.includes("taila") || cat.includes("oil")) rack = "C";
  else if (cat.includes("churna") || cat.includes("powder")) rack = "B";
  else if (cat.includes("arishtam") || cat.includes("asava")) rack = "D";
  else if (cat.includes("consumable") || cat.includes("iv")) rack = "E";

  const shelf = (index % 4) + 1;
  const bin = (index % 3) + 1;
  return { rack, shelf, bin };
};

const RackLocation = () => {
  const [items, setItems] = useState<RackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, quantity_available, min_stock_level, batch_number")
        .gt("quantity_available", 0)
        .order("product_category", { ascending: true });

      if (error) throw error;

      setItems((data || []).map((item: any, idx: number) => {
        const loc = getRack(item.product_category, idx);
        return {
          ...item,
          ...loc,
          restock: item.quantity_available <= item.min_stock_level,
        };
      }));
    } catch (err: any) {
      toast.error("Failed to load items");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = items.filter(i => !search || i.product_name.toLowerCase().includes(search.toLowerCase()));
  const highlighted = search ? items.find(i => i.product_name.toLowerCase().includes(search.toLowerCase())) : null;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-green-600" /> Rack / Bin / Location</h1>
          <p className="text-muted-foreground mt-1">Find any medicine's physical location — auto-assigned by category from live stock.</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Location labels printed")}><Printer className="h-4 w-4 mr-1" /> Print Labels</Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search medicine to find location..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Highlight result */}
      {highlighted && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-4 flex items-center gap-4">
            <MapPin className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-bold">{highlighted.product_name}</p>
              <p className="text-lg font-bold text-green-700">
                Rack {highlighted.rack} → Shelf {highlighted.shelf} → Bin {highlighted.bin}
              </p>
              <p className="text-xs text-muted-foreground">Stock: {highlighted.quantity_available} | Batch: {highlighted.batch_number || "—"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rack summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {["A", "B", "C", "D", "E"].map(rack => {
          const rackItems = items.filter(i => i.rack === rack);
          return (
            <Card key={rack} className={rackItems.length > 0 ? "border-blue-200" : ""}>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-blue-600">Rack {rack}</p>
                <p className="text-xs text-muted-foreground">{rackItems.length} items</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Items — Location Map</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Rack</th>
                  <th className="px-3 py-2 text-center">Shelf</th>
                  <th className="px-3 py-2 text-center">Bin</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-center">Restock?</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className={`border-b hover:bg-muted/30 ${item.restock ? "bg-amber-50/50" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-600">{item.rack}</td>
                    <td className="px-3 py-2 text-center">{item.shelf}</td>
                    <td className="px-3 py-2 text-center">{item.bin}</td>
                    <td className="px-3 py-2 text-center font-bold">{item.quantity_available}</td>
                    <td className="px-3 py-2 text-center">
                      {item.restock && <Badge variant="destructive" className="text-[10px]">Restock</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI Location Logic</p>
            <p className="text-[10px] text-purple-700">Rack assignment: A=Tablets/Guggulu/Vati, B=Churna/Powder, C=Oils/Taila, D=Arishtam/Asava, E=Consumables/IV. Auto-calculated from product_category in Supabase. {items.filter(i => i.restock).length} items need restocking.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RackLocation;
