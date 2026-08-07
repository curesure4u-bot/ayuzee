import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PORecord = {
  id: string;
  product_name: string;
  quantity: number;
  batch_number: string | null;
  transfer_reason: string | null;
  status: string;
  requested_at: string;
  created_at: string;
  to_store_name?: string;
  from_store_name?: string;
};

const PurchaseOrderManage = () => {
  const [orders, setOrders] = useState<PORecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
        from_store_name: row.from_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load purchase orders");
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
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate + "T23:59:59");
      }

      const { data, error } = await query;
      if (error) throw error;

      setOrders((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
        from_store_name: row.from_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to filter orders");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = orders.filter((o) =>
    o.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (o.transfer_reason || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.to_store_name || "").toLowerCase().includes(search.toLowerCase())
  );

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
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/purchase/po/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button>
        </Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage PO</Button>
        <Link to="/hms/stock/purchase/po/find">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Find Product PO</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage PO</h2>
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
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All</SelectItem>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Show All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
          <select className="border rounded px-2 py-1 text-sm"><option>100</option></select>
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
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Store (To)</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Batch</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Order Date</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Supplier / Reason</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                        No purchase orders found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((po, idx) => (
                      <tr key={po.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{idx + 1}.</td>
                        <td className="px-3 py-2">{po.to_store_name}</td>
                        <td className="px-3 py-2 font-medium">{po.product_name}</td>
                        <td className="px-3 py-2">{po.quantity}</td>
                        <td className="px-3 py-2 font-mono">{po.batch_number || "—"}</td>
                        <td className="px-3 py-2">{new Date(po.requested_at || po.created_at).toLocaleDateString()}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate">{po.transfer_reason || "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-xs ${getStatusBadge(po.status)}`}>
                            {po.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="sm" className="h-6 text-xs">...</Button>
                        </td>
                      </tr>
                    ))
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

export default PurchaseOrderManage;
