import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type InvoiceRecord = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  bill_amount: number | null;
  notes: string | null;
  created_at: string;
  store_name?: string;
};

const PharmacyInvoice = () => {
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
    if (data && data.length > 0) setSelectedStore(data[0].id);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .eq("consumption_type", "patient_use")
        .eq("billed_to_patient", true)
        .order("created_at", { ascending: false });

      if (selectedStore) query = query.eq("ward_store_id", selectedStore);
      if (startDate) query = query.gte("created_at", startDate);
      if (endDate) query = query.lte("created_at", endDate + "T23:59:59");

      const { data, error } = await query;
      if (error) throw error;

      setRecords((data || []).map((row: any) => ({
        ...row,
        product_name: row.hms_ward_stock_items?.product_name || "—",
        store_name: row.hms_ward_stores?.ward_name || "—",
      })));

      toast.success(`Invoice generated: ${(data || []).length} items`);
    } catch (err: any) {
      toast.error("Failed to generate invoice");
      console.error(err);
    }
    setLoading(false);
  };

  const totalAmount = records.reduce((s, r) => s + (r.bill_amount || 0), 0);
  const totalItems = records.reduce((s, r) => s + r.quantity_consumed, 0);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center justify-center gap-2">
          <FileText className="h-5 w-5" /> Pharmacy Invoice
        </h2>
        <p className="text-sm text-muted-foreground">Generate consolidated invoices from sale records in Supabase</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label className="text-xs font-semibold">Store</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Store" /></SelectTrigger>
                <SelectContent>
                  {wardStores.map(s => <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">From</Label>
              <Input type="date" className="w-[140px]" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold">To</Label>
              <Input type="date" className="w-[140px]" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {records.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Invoice Summary</CardTitle>
              <div className="text-sm font-bold text-green-600">Total: ₹{totalAmount.toLocaleString()} | {totalItems} units</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr key={r.id} className="border-b">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{r.product_name}</td>
                      <td className="px-3 py-2 text-center">{r.quantity_consumed}</td>
                      <td className="px-3 py-2 text-right font-bold">₹{(r.bill_amount || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PharmacyInvoice;
