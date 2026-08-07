import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type IssueRecord = {
  id: string;
  ward_store_id: string;
  quantity_consumed: number;
  consumption_type: string;
  bill_amount: number | null;
  notes: string | null;
  created_at: string;
  store_name?: string;
  product_name?: string;
};

const IssueManage = () => {
  const [records, setRecords] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .in("consumption_type", ["patient_use", "therapy_use"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter to only "Issue" entries (from notes)
      const issueRecords = (data || []).filter((row: any) =>
        (row.notes || "").toLowerCase().includes("issue to")
      );

      setRecords(issueRecords.map((row: any) => ({
        ...row,
        store_name: row.hms_ward_stores?.ward_name || "—",
        product_name: row.hms_ward_stock_items?.product_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load issues");
      console.error(err);
    }
    setLoading(false);
  };

  const parseRecipient = (notes: string | null) => {
    if (!notes) return "—";
    const match = notes.match(/Issue to \w+:\s*([^.]+)/i);
    return match ? match[1].trim() : "—";
  };

  const filtered = records.filter((r) =>
    (r.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.notes || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.store_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/issue/new"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button></Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Issue</Button>
        <Link to="/hms/stock/issue/ward-request"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Ward Request</Button></Link>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage Issue</h2></div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Show All</SelectItem></SelectContent>
        </Select>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={loadIssues}>Go</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Product</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Qty</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Amount</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">To Whom</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No issue records found</td></tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{idx + 1}.</td>
                      <td className="px-3 py-2">{r.store_name}</td>
                      <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2 font-medium">{r.product_name}</td>
                      <td className="px-3 py-2">{r.quantity_consumed}</td>
                      <td className="px-3 py-2">₹{(r.bill_amount || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">{parseRecipient(r.notes)}</td>
                      <td className="px-3 py-2"><Button variant="ghost" size="sm" className="h-6 text-xs">...</Button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueManage;
