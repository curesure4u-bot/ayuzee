import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type DueRecord = {
  id: string;
  ward_store_id: string;
  quantity_consumed: number;
  bill_amount: number | null;
  notes: string | null;
  created_at: string;
  store_name?: string;
  product_name?: string;
};

const ManageDue = () => {
  const [records, setRecords] = useState<DueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"due" | "revert">("due");
  const [location, setLocation] = useState("loc1");

  useEffect(() => {
    loadDueRecords();
  }, []);

  const loadDueRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .eq("billed_to_patient", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecords((data || []).map((row: any) => ({
        ...row,
        store_name: row.hms_ward_stores?.ward_name || "—",
        product_name: row.hms_ward_stock_items?.product_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load due records");
      console.error(err);
    }
    setLoading(false);
  };

  const totalDue = records.reduce((s, r) => s + (r.bill_amount || 0), 0);

  const parsePatient = (notes: string | null) => {
    if (!notes) return "—";
    const match = notes.match(/Patient:\s*([^.]+)/i);
    return match ? match[1].trim() : "—";
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={view === "due" ? "default" : "outline"} onClick={() => setView("due")}
          className={view === "due" ? "bg-orange-600 hover:bg-orange-700" : "text-orange-600 border-orange-300"}>
          Manage Due
        </Button>
        <Button size="sm" variant={view === "revert" ? "default" : "outline"} onClick={() => setView("revert")}
          className={view === "revert" ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-300"}>
          Manage Due - Revert
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">
          {view === "due" ? "Manage Due" : "Manage Due - Revert"}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 max-w-lg mb-4">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
                <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
                <SelectItem value="loc3">Old GH Road, Theni</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={loadDueRecords}>Go</Button>
            {view === "due" && (
              <Button variant="ghost" size="sm" className="text-teal-600">
                <Info className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-orange-600">{records.length}</p><p className="text-xs text-muted-foreground">Billed Items</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{totalDue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Billed</p></CardContent></Card>
          </div>
        </CardContent>
      </Card>

      {/* Due Records Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Patient</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Amount</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No due records found</td></tr>
                  ) : (
                    records.map((r, idx) => (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{idx + 1}.</td>
                        <td className="px-3 py-2">{r.store_name}</td>
                        <td className="px-3 py-2 font-medium">{r.product_name}</td>
                        <td className="px-3 py-2">{parsePatient(r.notes)}</td>
                        <td className="px-3 py-2">{r.quantity_consumed}</td>
                        <td className="px-3 py-2 font-bold text-green-600">₹{(r.bill_amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageDue;
