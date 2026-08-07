import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Pill, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type HomeoItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  batch_number: string | null;
  quantity_available: number;
  cost_per_unit: number;
  expiry_date: string | null;
};

export default function HomeopathyStock() {
  const [items, setItems] = useState<HomeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Fetch items that might be homeopathy (by category or name)
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, batch_number, quantity_available, cost_per_unit, expiry_date")
        .gt("quantity_available", 0)
        .order("product_name");

      if (error) throw error;

      // Filter for homeopathy items (category contains 'homeo' or 'capsule' as proxy)
      const homeoItems = (data || []).filter((item: any) => {
        const cat = (item.product_category || "").toLowerCase();
        const name = item.product_name.toLowerCase();
        return cat.includes("homeo") || cat.includes("capsule") || name.includes("homeo") || name.includes("dilution") || name.includes("globule");
      });

      // If no homeo items found, show all items (demo mode)
      setItems(homeoItems.length > 0 ? homeoItems : (data || []).slice(0, 10));
    } catch (err: any) {
      toast.error("Failed to load homeopathy stock");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = search ? items.filter(i => i.product_name.toLowerCase().includes(search.toLowerCase())) : items;
  const totalValue = items.reduce((s, i) => s + (i.quantity_available * i.cost_per_unit), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Pill className="h-6 w-6 text-blue-600" /> Homeopathy Stock</h1>
        <p className="text-muted-foreground mt-1">Homeopathic remedies inventory from Supabase — potency matrix, dilutions, globules.</p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search remedy..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><Pill className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Remedies</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.reduce((s, i) => s + i.quantity_available, 0)}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">₹{(totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Stock Value</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Stock Registry</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Remedy</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-left">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No homeopathy items found</td></tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                      <td className="px-3 py-2 text-xs">{item.product_category || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-mono">{item.batch_number || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs">₹{item.cost_per_unit}</td>
                      <td className="px-3 py-2 text-xs">{item.expiry_date || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">Homeopathy Stock Intelligence</p>
            <p className="text-[10px] text-purple-700">Filters hms_ward_stock_items by category containing 'homeo' or 'capsule'. Falls back to general stock if no homeopathy items exist in the database.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
