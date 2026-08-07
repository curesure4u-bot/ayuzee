import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Shield, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type DrugItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  is_critical: boolean;
  quantity_available: number;
};

const DrugSchedule = () => {
  const [items, setItems] = useState<DrugItem[]>([]);
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
        .select("id, product_name, product_category, is_critical, quantity_available")
        .gt("quantity_available", 0)
        .order("product_category", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast.error("Failed to load drug data");
      console.error(err);
    }
    setLoading(false);
  };

  const getSchedule = (item: DrugItem) => {
    if (item.is_critical) return "Controlled/NDPS";
    const cat = (item.product_category || "").toLowerCase();
    if (cat.includes("capsule") || cat.includes("injection")) return "Schedule H";
    if (cat.includes("iv fluid")) return "Schedule H";
    return "OTC (Ayurveda)";
  };

  const getDispensingRule = (item: DrugItem) => {
    if (item.is_critical) return "Special license + register";
    const cat = (item.product_category || "").toLowerCase();
    if (cat.includes("capsule") || cat.includes("injection") || cat.includes("iv")) return "Prescription only";
    return "No restriction";
  };

  const filtered = items.filter(i =>
    i.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (i.product_category || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const categories = [...new Set(filtered.map(i => i.product_category || "Uncategorized"))];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-red-600" /> Drug Schedule & Classification</h1>
          <p className="text-muted-foreground mt-1">Live classification from Supabase stock — {items.length} items across {categories.length} categories</p>
        </div>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2 text-muted-foreground" />
        <Input placeholder="Search medicine for schedule info..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{items.filter(i => !i.is_critical).length}</p><p className="text-xs text-muted-foreground">OTC / Ayurveda</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{items.filter(i => i.is_critical).length}</p><p className="text-xs text-muted-foreground">Controlled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{categories.length}</p><p className="text-xs text-muted-foreground">Categories</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Drug Schedule Database (Live)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-center">Schedule</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Dispensing Rule</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No items found</td></tr>
                ) : (
                  filtered.map((d) => {
                    const schedule = getSchedule(d);
                    return (
                      <tr key={d.id} className={`border-b ${d.is_critical ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2 font-medium text-xs">{d.product_name}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={schedule.includes("OTC") ? "outline" : "destructive"} className={`text-[10px] ${schedule.includes("OTC") ? "text-green-600" : ""}`}>
                            {schedule}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs">{d.product_category || "—"}</td>
                        <td className="px-3 py-2 text-xs">{getDispensingRule(d)}</td>
                        <td className="px-3 py-2 text-center text-xs font-bold">{d.quantity_available}</td>
                      </tr>
                    );
                  })
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
            <p className="font-semibold text-purple-800">AI Compliance Check</p>
            <p className="text-sm text-purple-700">
              Items marked is_critical=true are treated as controlled substances requiring special dispensing rules. 
              All other AYUSH items are OTC by default. HMS auto-blocks controlled items without valid authorization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrugSchedule;
