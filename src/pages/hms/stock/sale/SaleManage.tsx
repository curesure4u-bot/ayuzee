import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SaleRecord = {
  id: string;
  ward_store_id: string;
  quantity_consumed: number;
  bill_amount: number | null;
  billed_to_patient: boolean;
  notes: string | null;
  created_at: string;
  store_name?: string;
  product_name?: string;
};

const SaleManage = () => {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .eq("consumption_type", "patient_use")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecords((data || []).map((row: any) => ({
        ...row,
        store_name: row.hms_ward_stores?.ward_name || "—",
        product_name: row.hms_ward_stock_items?.product_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load sales");
      console.error(err);
    }
    setLoading(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .eq("consumption_type", "patient_use")
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate + "T23:59:59");
      }

      const { data, error } = await query;
      if (error) throw error;

      setRecords((data || []).map((row: any) => ({
        ...row,
        store_name: row.hms_ward_stores?.ward_name || "—",
        product_name: row.hms_ward_stock_items?.product_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to filter sales");
      console.error(err);
    }
    setLoading(false);
  };

  // Parse patient name and bill type from notes
  const parseNotes = (notes: string | null) => {
    if (!notes) return { patient: "—", billType: "OP", consultant: "—", payment: "—" };
    const patientMatch = notes.match(/Patient:\s*([^.]+)/i);
    const typeMatch = notes.match(/Sale bill \((\w+)\)/i);
    const paymentMatch = notes.match(/Payment:\s*(\w+)/i);
    return {
      patient: patientMatch ? patientMatch[1].trim() : "Counter",
      billType: typeMatch ? typeMatch[1] : "OP",
      consultant: "—",
      payment: paymentMatch ? paymentMatch[1] : "Cash",
    };
  };

  const filtered = records.filter((r) =>
    (r.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.notes || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.store_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/sale/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New Bill</Button>
        </Link>
        <Link to="/hms/stock/sale/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New Bill (New Tab)</Button>
        </Link>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Ward Request</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Prescription</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Discharge Summary</Button>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Sale</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Sale</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
          </SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All</SelectItem>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8" onClick={handleFilter}>Go</Button>
      </div>

      {/* Entries & Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select className="border rounded px-2 py-1 text-sm"><option>10</option><option>50</option><option>100</option></select>
          <span>entries</span>
        </div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Amount</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Patient</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Payment</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                        No sale records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sale, idx) => {
                      const parsed = parseNotes(sale.notes);
                      return (
                        <tr key={sale.id} className="border-b hover:bg-muted/30">
                          <td className="px-3 py-2">{idx + 1}.</td>
                          <td className="px-3 py-2">{sale.store_name}</td>
                          <td className="px-3 py-2">{new Date(sale.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2 font-medium">{sale.product_name}</td>
                          <td className="px-3 py-2">{sale.quantity_consumed}</td>
                          <td className="px-3 py-2 font-bold text-green-600">₹{(sale.bill_amount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2">{parsed.patient}</td>
                          <td className="px-3 py-2">{parsed.billType}</td>
                          <td className="px-3 py-2">{parsed.payment}</td>
                          <td className="px-3 py-2">
                            <Button variant="ghost" size="sm" className="h-6 text-xs">...</Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleManage;
