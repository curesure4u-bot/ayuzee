import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SupplierPerformance = {
  supplier: string;
  totalOrders: number;
  receivedOrders: number;
  pendingOrders: number;
  onTimePercent: number;
  avgDays: number;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
};

const tierColors: Record<string, string> = {
  Platinum: "bg-purple-100 text-purple-700",
  Gold: "bg-amber-100 text-amber-700",
  Silver: "bg-gray-100 text-gray-700",
  Bronze: "bg-orange-100 text-orange-700",
};

export default function SupplierSLA() {
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupplierData();
  }, []);

  const loadSupplierData = async () => {
    setLoading(true);
    try {
      // Fetch all PO-related transfers (supplier orders)
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*")
        .ilike("transfer_reason", "%supplier%")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by supplier (extracted from transfer_reason)
      const supplierMap: Record<string, { total: number; received: number; pending: number; dates: number[] }> = {};

      (data || []).forEach((t: any) => {
        const reason = t.transfer_reason || "";
        const supplierMatch = reason.match(/supplier:\s*(\w+)/i);
        const supplier = supplierMatch ? supplierMatch[1].toUpperCase() : "UNKNOWN";

        if (!supplierMap[supplier]) {
          supplierMap[supplier] = { total: 0, received: 0, pending: 0, dates: [] };
        }
        supplierMap[supplier].total++;
        if (t.status === "received") {
          supplierMap[supplier].received++;
          // Calculate days between created and now as proxy for delivery time
          const created = new Date(t.created_at);
          const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
          supplierMap[supplier].dates.push(days);
        } else {
          supplierMap[supplier].pending++;
        }
      });

      const performances: SupplierPerformance[] = Object.entries(supplierMap).map(([supplier, data]) => {
        const onTimePercent = data.total > 0 ? Math.round((data.received / data.total) * 100) : 0;
        const avgDays = data.dates.length > 0 ? Math.round(data.dates.reduce((s, d) => s + d, 0) / data.dates.length * 10) / 10 : 0;

        let tier: "Platinum" | "Gold" | "Silver" | "Bronze" = "Bronze";
        if (onTimePercent >= 95) tier = "Platinum";
        else if (onTimePercent >= 85) tier = "Gold";
        else if (onTimePercent >= 70) tier = "Silver";

        return { supplier, totalOrders: data.total, receivedOrders: data.received, pendingOrders: data.pending, onTimePercent, avgDays, tier };
      });

      setSuppliers(performances.sort((a, b) => b.onTimePercent - a.onTimePercent));
    } catch (err: any) {
      toast.error("Failed to load supplier data");
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const meetingSLA = suppliers.filter(s => s.onTimePercent >= 85).length;
  const belowSLA = suppliers.filter(s => s.onTimePercent < 75).length;
  const avgFillRate = suppliers.length > 0 ? Math.round(suppliers.reduce((s, sup) => s + sup.onTimePercent, 0) / suppliers.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-amber-600" /> Supplier Performance SLA</h1>
          <p className="text-muted-foreground mt-1">Track delivery fulfillment from live Supabase transfer records.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{suppliers.length}</p><p className="text-xs text-muted-foreground">Suppliers Tracked</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{meetingSLA}</p><p className="text-xs text-muted-foreground">Meeting SLA</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{belowSLA}</p><p className="text-xs text-muted-foreground">Below SLA</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{avgFillRate}%</p><p className="text-xs text-muted-foreground">Avg Fill Rate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Supplier SLA Scorecard</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-center">Orders</th>
                  <th className="px-3 py-2 text-center">Received</th>
                  <th className="px-3 py-2 text-center">Pending</th>
                  <th className="px-3 py-2 text-center">Fill Rate</th>
                  <th className="px-3 py-2 text-center">Avg Days</th>
                  <th className="px-3 py-2 text-center">Tier</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No supplier data. Run seed SQL to populate.</td></tr>
                ) : (
                  suppliers.map((s, i) => (
                    <tr key={i} className={`border-b ${s.onTimePercent < 75 ? "bg-red-50/50" : ""}`}>
                      <td className="px-3 py-2 text-xs font-medium">{s.supplier}</td>
                      <td className="px-3 py-2 text-center text-xs">{s.totalOrders}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold text-green-600">{s.receivedOrders}</td>
                      <td className="px-3 py-2 text-center text-xs text-amber-600">{s.pendingOrders}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Progress value={s.onTimePercent} className="w-12 h-1.5" />
                          <span className={`text-[10px] font-bold ${s.onTimePercent >= 85 ? "text-green-600" : s.onTimePercent >= 70 ? "text-amber-600" : "text-red-600"}`}>{s.onTimePercent}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-xs"><span className={s.avgDays <= 5 ? "text-green-600" : "text-red-600"}>{s.avgDays}d</span></td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${tierColors[s.tier]}`}>{s.tier}</Badge></td>
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
            <p className="font-semibold text-purple-800">AI Supplier Intelligence</p>
            <p className="text-sm text-purple-700">
              {suppliers.length > 0
                ? `${suppliers.length} suppliers tracked. Best: ${suppliers[0]?.supplier} (${suppliers[0]?.onTimePercent}% fill rate). ${belowSLA > 0 ? `${belowSLA} supplier(s) below SLA — consider alternative sourcing.` : "All suppliers meeting targets."}`
                : "Supplier data will appear after purchase orders are received. Run the seed SQL for sample data."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
