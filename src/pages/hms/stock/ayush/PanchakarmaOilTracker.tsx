import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Droplets, Brain, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OilItem = {
  id: string;
  product_name: string;
  quantity_available: number;
  quantity_unit: string;
  min_stock_level: number;
  cost_per_unit: number;
  low: boolean;
};

type Deduction = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  notes: string | null;
  created_at: string;
};

export default function PanchakarmaOilTracker() {
  const [oils, setOils] = useState<OilItem[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedOil, setSelectedOil] = useState("");
  const [qty, setQty] = useState("");
  const [patientName, setPatientName] = useState("");
  const [therapy, setTherapy] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch PK store items (Taila category)
      const { data: pkStore } = await (supabase as any)
        .from("hms_ward_stores")
        .select("id")
        .eq("store_type", "panchakarma")
        .limit(1)
        .single();

      let storeId = pkStore?.id;
      // Fallback: get items with Taila category from any store
      const { data: items } = storeId
        ? await (supabase as any).from("hms_ward_stock_items").select("*").eq("ward_store_id", storeId).order("product_name")
        : await (supabase as any).from("hms_ward_stock_items").select("*").ilike("product_category", "%Taila%").order("product_name");

      setOils((items || []).map((i: any) => ({
        ...i,
        low: i.quantity_available <= i.min_stock_level,
      })));

      // Fetch recent therapy deductions
      const { data: logs } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stock_items(product_name)")
        .eq("consumption_type", "therapy_use")
        .order("created_at", { ascending: false })
        .limit(10);

      setDeductions((logs || []).map((l: any) => ({
        ...l,
        product_name: l.hms_ward_stock_items?.product_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load PK data");
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeduct = async () => {
    if (!selectedOil) { toast.error("Select oil"); return; }
    if (!qty || parseFloat(qty) <= 0) { toast.error("Enter quantity"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); setSaving(false); return; }

      const oil = oils.find(o => o.id === selectedOil);
      if (!oil) { toast.error("Oil not found"); setSaving(false); return; }

      await (supabase as any).from("hms_ward_consumption_log").insert({
        ward_store_id: (await (supabase as any).from("hms_ward_stock_items").select("ward_store_id").eq("id", selectedOil).single()).data?.ward_store_id,
        ward_stock_item_id: selectedOil,
        quantity_consumed: parseFloat(qty),
        consumption_type: "therapy_use",
        billed_to_patient: true,
        bill_amount: parseFloat(qty) * oil.cost_per_unit,
        consumed_by: user.id,
        notes: `PK Therapy: ${therapy || "Abhyanga"}. Patient: ${patientName || "Walk-in"}. Oil: ${oil.product_name}`,
      });

      toast.success(`Deducted ${qty} from ${oil.product_name}`);
      setQty(""); setPatientName(""); setTherapy("");
      loadData();
    } catch (err: any) {
      toast.error("Failed to deduct");
      console.error(err);
    }
    setSaving(false);
  };

  const lowStock = oils.filter(o => o.low);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Droplets className="h-6 w-6 text-amber-600" /> Panchakarma Oil Tracker</h1>
        <p className="text-muted-foreground mt-1">Auto-deduct oils per therapy session — live from Supabase PK store.</p>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800"><strong>{lowStock.length} oils low:</strong> {lowStock.map(o => o.product_name).join(", ")}</p>
        </div>
      )}

      {/* Deduct Form */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Deduct Oil for Therapy</CardTitle></CardHeader>
        <CardContent className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <Select value={selectedOil} onValueChange={setSelectedOil}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select oil" /></SelectTrigger>
              <SelectContent>
                {oils.map(o => <SelectItem key={o.id} value={o.id}>{o.product_name} ({o.quantity_available} {o.quantity_unit})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input className="w-20 h-8 text-xs" type="number" placeholder="ml/qty" value={qty} onChange={e => setQty(e.target.value)} />
          <Input className="w-28 h-8 text-xs" placeholder="Patient" value={patientName} onChange={e => setPatientName(e.target.value)} />
          <Input className="w-28 h-8 text-xs" placeholder="Therapy" value={therapy} onChange={e => setTherapy(e.target.value)} />
          <Button size="sm" className="h-8" onClick={handleDeduct} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Deduct"}
          </Button>
        </CardContent>
      </Card>

      {/* Oil Stock */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Oil Stock ({oils.length} items)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Oil</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-center">Min Level</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {oils.map(o => (
                  <tr key={o.id} className={`border-b ${o.low ? "bg-amber-50/50" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{o.product_name}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{o.quantity_available} {o.quantity_unit}</td>
                    <td className="px-3 py-2 text-center text-xs">{o.min_stock_level}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={o.low ? "destructive" : "outline"} className={`text-[10px] ${!o.low ? "text-green-600" : ""}`}>{o.low ? "Low" : "OK"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deductions */}
      {deductions.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Therapy Deductions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr><th className="px-3 py-1 text-left">Oil</th><th className="px-3 py-1 text-center">Qty</th><th className="px-3 py-1 text-left">Notes</th><th className="px-3 py-1 text-left">Date</th></tr>
                </thead>
                <tbody>
                  {deductions.map(d => (
                    <tr key={d.id} className="border-b">
                      <td className="px-3 py-1.5 font-medium">{d.product_name}</td>
                      <td className="px-3 py-1.5 text-center font-bold">{d.quantity_consumed}</td>
                      <td className="px-3 py-1.5 text-muted-foreground max-w-[200px] truncate">{d.notes || "—"}</td>
                      <td className="px-3 py-1.5">{new Date(d.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
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
            <p className="font-semibold text-xs text-purple-800">PK Oil Intelligence</p>
            <p className="text-[10px] text-purple-700">Fetches oils from Panchakarma store (store_type='panchakarma') or Taila category. Each deduction logs to consumption_log with type 'therapy_use'.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
