import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ShelfLifeItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  expiry_date: string | null;
  created_at: string;
  quantity_available: number;
  daysLeft: number;
  pctUsed: number;
  status: "safe" | "warning" | "expired" | "improves";
};

// Ayurvedic shelf life rules by category
const getStandardLife = (category: string | null): { months: number; unlimited: boolean } => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("arishtam") || cat.includes("asava")) return { months: 0, unlimited: true };
  if (cat.includes("taila") || cat.includes("oil")) return { months: 16, unlimited: false };
  if (cat.includes("churna") || cat.includes("powder")) return { months: 24, unlimited: false };
  if (cat.includes("vati") || cat.includes("guggulu")) return { months: 24, unlimited: false };
  if (cat.includes("kashayam")) return { months: 24, unlimited: false };
  return { months: 24, unlimited: false };
};

export default function YogaKshema() {
  const [items, setItems] = useState<ShelfLifeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, expiry_date, created_at, quantity_available")
        .gt("quantity_available", 0)
        .order("expiry_date", { ascending: true, nullsFirst: false });

      if (error) throw error;

      const now = new Date();
      setItems((data || []).map((item: any) => {
        const life = getStandardLife(item.product_category);

        if (life.unlimited) {
          return { ...item, daysLeft: 999, pctUsed: 0, status: "improves" as const };
        }

        if (!item.expiry_date) {
          return { ...item, daysLeft: 365, pctUsed: 50, status: "safe" as const };
        }

        const exp = new Date(item.expiry_date);
        const daysLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const totalLifeDays = life.months * 30;
        const pctUsed = totalLifeDays > 0 ? Math.min(100, Math.round(((totalLifeDays - daysLeft) / totalLifeDays) * 100)) : 0;

        let status: "safe" | "warning" | "expired" = "safe";
        if (daysLeft <= 0) status = "expired";
        else if (daysLeft <= 90) status = "warning";

        return { ...item, daysLeft, pctUsed: Math.max(0, pctUsed), status };
      }));
    } catch (err: any) {
      toast.error("Failed to load shelf-life data");
      console.error(err);
    }
    setLoading(false);
  };

  const safe = items.filter(i => i.status === "safe").length;
  const warning = items.filter(i => i.status === "warning").length;
  const expired = items.filter(i => i.status === "expired").length;
  const improves = items.filter(i => i.status === "improves").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-indigo-600" /> Yoga Kshema (Shelf-life) Tracker</h1>
        <p className="text-muted-foreground mt-1">AYUSH shelf-life rules per category — Sharangdhara Samhita based, live from Supabase.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{safe}</p><p className="text-[10px] text-muted-foreground">Safe</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{improves}</p><p className="text-[10px] text-muted-foreground">Improves with Age</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{warning}</p><p className="text-[10px] text-muted-foreground">Warning (&le;90d)</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{expired}</p><p className="text-[10px] text-muted-foreground">Expired</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Shelf-life Status ({items.length} items)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Days Left</th>
                  <th className="px-3 py-2 text-center">Life Used</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className={`border-b ${item.status === "expired" ? "bg-red-50" : item.status === "warning" ? "bg-amber-50/50" : item.status === "improves" ? "bg-blue-50/30" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 text-xs">{item.product_category || "—"}</td>
                    <td className="px-3 py-2 text-center text-xs">{item.status === "improves" ? "∞" : item.daysLeft <= 0 ? "Expired" : `${item.daysLeft}d`}</td>
                    <td className="px-3 py-2 text-center">
                      {item.status !== "improves" && <Progress value={item.pctUsed} className="w-16 h-1.5 mx-auto" />}
                      {item.status === "improves" && <span className="text-[10px] text-blue-600">Gets better</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={item.status === "expired" ? "destructive" : item.status === "warning" ? "default" : "outline"} className={`text-[10px] ${item.status === "safe" ? "text-green-600" : item.status === "improves" ? "text-blue-600" : ""}`}>
                        {item.status === "improves" ? "Improves" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
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
            <p className="font-semibold text-xs text-purple-800">Yoga Kshema Intelligence</p>
            <p className="text-[10px] text-purple-700">Rules: Arishtam/Asava = unlimited (improves). Taila = 16 months. Churna/Vati = 2 years. Kashayam = 2 years. Applied to live expiry_date from Supabase.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
