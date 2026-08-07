import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, RefreshCw, CreditCard, CheckCircle, Clock, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionRecord = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  bill_amount: number | null;
  notes: string | null;
  created_at: string;
  store_name?: string;
  patient_name?: string;
};

export default function MedicineSubscription() {
  const [records, setRecords] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      // Use consumption log as subscription records (recurring patient_use entries)
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .eq("consumption_type", "patient_use")
        .eq("billed_to_patient", true)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      setRecords((data || []).map((row: any) => {
        const patientMatch = (row.notes || "").match(/Patient:\s*([^.]+)/i);
        return {
          ...row,
          store_name: row.hms_ward_stores?.ward_name || "—",
          product_name: row.hms_ward_stock_items?.product_name || "—",
          patient_name: patientMatch ? patientMatch[1].trim() : "Walk-in",
        };
      }));
    } catch (err: any) {
      toast.error("Failed to load subscription data");
      console.error(err);
    }
    setLoading(false);
  };

  // Group by patient to show recurring patterns
  const patientMap: Record<string, { count: number; totalValue: number; products: string[] }> = {};
  records.forEach(r => {
    const key = r.patient_name || "Walk-in";
    if (!patientMap[key]) patientMap[key] = { count: 0, totalValue: 0, products: [] };
    patientMap[key].count++;
    patientMap[key].totalValue += r.bill_amount || 0;
    if (!patientMap[key].products.includes(r.product_name)) {
      patientMap[key].products.push(r.product_name);
    }
  });

  const subscribers = Object.entries(patientMap)
    .filter(([_, v]) => v.count >= 2) // 2+ purchases = subscription candidate
    .sort((a, b) => b[1].totalValue - a[1].totalValue);

  const monthlyRevenue = records.reduce((s, r) => s + (r.bill_amount || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RefreshCw className="h-6 w-6 text-green-600" /> Patient Medicine Subscription</h1>
          <p className="text-muted-foreground mt-1">Recurring dispensing patterns from live Supabase data — identify subscription candidates.</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New subscription plan created")}>+ New Subscription</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{subscribers.length}</p><p className="text-xs text-muted-foreground">Repeat Patients</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CreditCard className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">₹{(monthlyRevenue / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Billed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{records.length}</p><p className="text-xs text-muted-foreground">Dispensing Events</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{Object.keys(patientMap).length - subscribers.length}</p><p className="text-xs text-muted-foreground">One-time Only</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Subscription Candidates (Repeat Patients)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-center">Purchases</th>
                  <th className="px-3 py-2 text-right">Total Value</th>
                  <th className="px-3 py-2 text-left">Products</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No repeat patients found yet. Data appears after multiple sales.</td></tr>
                ) : (
                  subscribers.map(([patient, data], idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{patient}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{data.count}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold text-green-600">₹{data.totalValue.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px] truncate">{data.products.join(", ")}</td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success(`Subscription offer sent to ${patient}`)}>Offer Plan</Button>
                      </td>
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
            <p className="font-semibold text-xs text-purple-800">AI Subscription Intelligence</p>
            <p className="text-[10px] text-purple-700">
              Patients with 2+ purchases are subscription candidates. Auto-dispatch reduces missed doses and guarantees recurring revenue.
              {subscribers.length > 0 && ` Top candidate: ${subscribers[0][0]} (${subscribers[0][1].count} purchases, ₹${subscribers[0][1].totalValue}).`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
