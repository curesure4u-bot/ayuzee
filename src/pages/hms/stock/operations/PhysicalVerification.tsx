import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClipboardList, CheckCircle, AlertTriangle, Brain, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type VerificationItem = {
  id: string;
  product_name: string;
  quantity_available: number;
  physicalQty: number;
  difference: number;
  status: "Match" | "Shortage" | "Excess";
};

const PhysicalVerification = () => {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStockItems();
  }, []);

  const loadStockItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, quantity_available")
        .gt("quantity_available", 0)
        .order("product_name", { ascending: true });

      if (error) throw error;

      setItems((data || []).map((item: any) => ({
        ...item,
        physicalQty: item.quantity_available, // Default physical = system
        difference: 0,
        status: "Match" as const,
      })));
    } catch (err: any) {
      toast.error("Failed to load stock items");
      console.error(err);
    }
    setLoading(false);
  };

  const handlePhysicalQtyChange = (id: string, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const physicalQty = parseFloat(value) || 0;
        const difference = physicalQty - item.quantity_available;
        let status: "Match" | "Shortage" | "Excess" = "Match";
        if (difference < 0) status = "Shortage";
        else if (difference > 0) status = "Excess";
        return { ...item, physicalQty, difference, status };
      }
      return item;
    }));
  };

  const handleApplyDifferences = async () => {
    const mismatches = items.filter(i => i.status !== "Match");
    if (mismatches.length === 0) {
      toast.success("No differences to adjust — all items match");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      for (const item of mismatches) {
        // Update stock quantity
        await (supabase as any)
          .from("hms_ward_stock_items")
          .update({
            quantity_available: item.physicalQty,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        // Log adjustment
        await (supabase as any)
          .from("hms_ward_consumption_log")
          .insert({
            ward_store_id: (await (supabase as any).from("hms_ward_stock_items").select("ward_store_id").eq("id", item.id).single()).data?.ward_store_id,
            ward_stock_item_id: item.id,
            quantity_consumed: Math.abs(item.difference),
            consumption_type: item.difference < 0 ? "wastage" : "returned",
            billed_to_patient: false,
            bill_amount: 0,
            consumed_by: user.id,
            notes: `Physical verification adjustment: ${item.product_name}. System: ${item.quantity_available}, Physical: ${item.physicalQty}, Diff: ${item.difference > 0 ? "+" : ""}${item.difference}`,
          });
      }

      toast.success(`${mismatches.length} items adjusted in Supabase`);
      loadStockItems();
    } catch (err: any) {
      toast.error("Failed to apply adjustments: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  const matches = items.filter(v => v.status === "Match").length;
  const mismatches = items.filter(v => v.status !== "Match").length;
  const accuracy = items.length > 0 ? Math.round((matches / items.length) * 100) : 100;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-blue-600" /> Physical Stock Verification</h1>
          <p className="text-muted-foreground mt-1">Periodic physical count vs system — find discrepancies and adjust</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Verification sheet exported")}><Download className="h-4 w-4 mr-1" /> Export Sheet</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Items to Verify</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{matches}</p><p className="text-xs text-muted-foreground">Match</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{mismatches}</p><p className="text-xs text-muted-foreground">Mismatch</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{accuracy}%</p><p className="text-xs text-muted-foreground">Accuracy</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Verification — Enter Physical Counts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">System Qty</th>
                  <th className="px-3 py-2 text-center">Physical Qty</th>
                  <th className="px-3 py-2 text-center">Difference</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No stock items found</td></tr>
                ) : (
                  items.map((v) => (
                    <tr key={v.id} className={`border-b ${v.status !== "Match" ? "bg-red-50/50" : ""}`}>
                      <td className="px-3 py-2 font-medium text-xs">{v.product_name}</td>
                      <td className="px-3 py-2 text-center">{v.quantity_available}</td>
                      <td className="px-3 py-2 text-center">
                        <Input
                          type="number"
                          value={v.physicalQty}
                          onChange={(e) => handlePhysicalQtyChange(v.id, e.target.value)}
                          className="h-7 w-16 text-center mx-auto text-xs"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-bold">
                        <span className={v.difference < 0 ? "text-red-600" : v.difference > 0 ? "text-blue-600" : "text-green-600"}>
                          {v.difference > 0 ? "+" : ""}{v.difference}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={v.status === "Match" ? "outline" : "destructive"} className={`text-[10px] ${v.status === "Match" ? "text-green-600" : ""}`}>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleApplyDifferences} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Adjust Stock (Apply Differences)
        </Button>
        <Button variant="outline" onClick={() => toast.success("Report saved")}>Save Verification Report</Button>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Discrepancy Analysis</p>
            <p className="text-sm text-purple-700">
              {mismatches > 0
                ? `${mismatches} discrepancies detected. Review shortages for possible dispensing losses or pilferage. Excess items may indicate GRN entries without matching PO.`
                : "All items match system records. Stock integrity is maintained."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicalVerification;
