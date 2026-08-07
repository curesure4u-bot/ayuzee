import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type IndentRecord = {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  transfer_reason: string | null;
  requested_at: string;
  created_at: string;
  from_store_name?: string;
  to_store_name?: string;
};

const IndentManage = () => {
  const [records, setRecords] = useState<IndentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewType, setViewType] = useState<"open" | "byDate">("byDate");

  useEffect(() => {
    loadWardStores();
    loadIndents();
  }, []);

  const loadWardStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
  };

  const loadIndents = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .ilike("transfer_reason", "%Indent%")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecords((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
        from_store_name: row.from_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load indents");
      console.error(err);
    }
    setLoading(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .ilike("transfer_reason", "%Indent%")
        .order("created_at", { ascending: false });

      if (viewType === "open") {
        query = query.in("status", ["pending", "approved", "in_transit"]);
      }
      if (fromStore) {
        query = query.eq("from_store_id", fromStore);
      }
      if (toStore) {
        query = query.eq("to_store_id", toStore);
      }
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
        to_store_name: row.to_store?.ward_name || "—",
        from_store_name: row.from_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to filter indents");
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      approved: "bg-blue-100 text-blue-700 border-blue-300",
      in_transit: "bg-purple-100 text-purple-700 border-purple-300",
      received: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "";
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/indent/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New Indent</Button>
        </Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Indent</Button>
        <Link to="/hms/stock/indent/gdn/new">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">New GDN</Button>
        </Link>
        <Link to="/hms/stock/indent/gdn/manage">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">Manage GDN</Button>
        </Link>
      </div>

      {/* View Type Tabs */}
      <div className="flex gap-2">
        <Button size="sm" variant={viewType === "open" ? "default" : "outline"} onClick={() => setViewType("open")} className={viewType === "open" ? "bg-green-600" : ""}>Open Indent</Button>
        <Button size="sm" variant={viewType === "byDate" ? "default" : "outline"} onClick={() => setViewType("byDate")}>Indent By Date</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Indent</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={fromStore} onValueChange={setFromStore}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="From store" /></SelectTrigger>
          <SelectContent>
            {wardStores.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={toStore} onValueChange={setToStore}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="To store" /></SelectTrigger>
          <SelectContent>
            {wardStores.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={handleFilter}>Go</Button>
      </div>

      {/* Table */}
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
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Product</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Qty</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Order Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">From Store</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">To Store</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No indent records found</td></tr>
                ) : (
                  records.map((r, idx) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{idx + 1}.</td>
                      <td className="px-3 py-2 font-medium">{r.product_name}</td>
                      <td className="px-3 py-2">{r.quantity}</td>
                      <td className="px-3 py-2">{new Date(r.requested_at || r.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{r.from_store_name}</td>
                      <td className="px-3 py-2">{r.to_store_name}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`text-xs ${getStatusBadge(r.status)}`}>{r.status}</Badge>
                      </td>
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

export default IndentManage;
