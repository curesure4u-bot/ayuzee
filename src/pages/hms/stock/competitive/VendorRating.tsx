import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Star, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type VendorScore = {
  name: string;
  totalOrders: number;
  received: number;
  pending: number;
  fillRate: number;
  overall: number;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
};

const tierColors: Record<string, string> = { Platinum: "bg-purple-100 text-purple-700", Gold: "bg-amber-100 text-amber-700", Silver: "bg-gray-100 text-gray-700", Bronze: "bg-orange-100 text-orange-700" };

export default function VendorRating() {
  const [vendors, setVendors] = useState<VendorScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*")
        .ilike("transfer_reason", "%supplier%")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const vendorMap: Record<string, { total: number; received: number }> = {};
      (data || []).forEach((t: any) => {
        const match = (t.transfer_reason || "").match(/supplier:\s*(\w+)/i);
        const name = match ? match[1].toUpperCase() : "UNKNOWN";
        if (!vendorMap[name]) vendorMap[name] = { total: 0, received: 0 };
        vendorMap[name].total++;
        if (t.status === "received") vendorMap[name].received++;
      });

      const scores: VendorScore[] = Object.entries(vendorMap).map(([name, d]) => {
        const fillRate = d.total > 0 ? Math.round((d.received / d.total) * 100) : 0;
        let tier: "Platinum" | "Gold" | "Silver" | "Bronze" = "Bronze";
        if (fillRate >= 95) tier = "Platinum";
        else if (fillRate >= 85) tier = "Gold";
        else if (fillRate >= 70) tier = "Silver";
        return { name, totalOrders: d.total, received: d.received, pending: d.total - d.received, fillRate, overall: fillRate, tier };
      }).sort((a, b) => b.overall - a.overall);

      setVendors(scores);
    } catch (err: any) {
      toast.error("Failed to load vendor data");
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-amber-600" /> Vendor Rating & Performance</h1>
          <p className="text-muted-foreground mt-1">Rate suppliers based on delivery performance from live Supabase transfer data.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{vendors.length}</p><p className="text-xs text-muted-foreground">Vendors Tracked</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><Star className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{vendors.filter(v => v.fillRate >= 85).length}</p><p className="text-xs text-muted-foreground">Meeting SLA</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{vendors.length > 0 ? Math.round(vendors.reduce((s, v) => s + v.fillRate, 0) / vendors.length) : 0}%</p><p className="text-xs text-muted-foreground">Avg Fill Rate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Vendor Scorecard</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Vendor</th>
                  <th className="px-3 py-2 text-center">Orders</th>
                  <th className="px-3 py-2 text-center">Received</th>
                  <th className="px-3 py-2 text-center">Pending</th>
                  <th className="px-3 py-2 text-center">Fill Rate</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-center">Tier</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No vendor data found</td></tr>
                ) : (
                  vendors.map((v, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{v.name}</td>
                      <td className="px-3 py-2 text-center text-xs">{v.totalOrders}</td>
                      <td className="px-3 py-2 text-center text-xs text-green-600 font-bold">{v.received}</td>
                      <td className="px-3 py-2 text-center text-xs text-amber-600">{v.pending}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Progress value={v.fillRate} className="w-12 h-1.5" />
                          <span className="text-[10px] font-bold">{v.fillRate}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{v.overall}/100</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${tierColors[v.tier]}`}>{v.tier}</Badge></td>
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
            <p className="font-semibold text-xs text-purple-800">AI Vendor Intelligence</p>
            <p className="text-[10px] text-purple-700">
              Scores derived from PO fulfillment in hms_ward_stock_transfers. Tier: Platinum (95%+), Gold (85%+), Silver (70%+), Bronze (&lt;70%).
              {vendors.length > 0 && ` Best performer: ${vendors[0].name} (${vendors[0].fillRate}%).`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
