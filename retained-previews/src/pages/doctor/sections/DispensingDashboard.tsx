import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Pill,
  TrendingUp,
  Users,
  IndianRupee,
  Search,
  Calendar,
  Package,
  ArrowUpRight,
} from "lucide-react";

interface PatientOrder {
  id: string;
  patient_name: string;
  patient_id: string | null;
  order_date: string;
  items: { name: string; qty: number; price: number }[];
  total_value: number;
  margin_earned: number;
  margin_percentage: number;
  status: string;
}

interface DispensingStats {
  totalOrders: number;
  totalPatients: number;
  totalRevenue: number;
  totalMargin: number;
  avgMarginPct: number;
  thisMonthOrders: number;
  thisMonthMargin: number;
}

const DispensingDashboard = () => {
  const { doctor, userId } = useDoctor();
  const [orders, setOrders] = useState<PatientOrder[]>([]);
  const [stats, setStats] = useState<DispensingStats>({
    totalOrders: 0, totalPatients: 0, totalRevenue: 0, totalMargin: 0, avgMarginPct: 0, thisMonthOrders: 0, thisMonthMargin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    if (!doctor?.id) return;
    loadOrders();
  }, [doctor?.id]);

  const loadOrders = async () => {
    setLoading(true);
    // Load partner orders placed by this doctor for patients
    const { data, error } = await supabase
      .from("orders")
      .select("id, patient_name, patient_id, created_at, items, total, status, commission_amount")
      .eq("placed_by_doctor_id", doctor!.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      const mapped: PatientOrder[] = (data as any[]).map((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        const margin = o.commission_amount ?? Math.round(o.total * 0.12);
        return {
          id: o.id,
          patient_name: o.patient_name ?? "Patient",
          patient_id: o.patient_id,
          order_date: o.created_at,
          items: items.map((i: any) => ({ name: i.name ?? i.product_name ?? "Item", qty: i.quantity ?? 1, price: i.price ?? 0 })),
          total_value: o.total ?? 0,
          margin_earned: margin,
          margin_percentage: o.total > 0 ? Math.round((margin / o.total) * 100) : 0,
          status: o.status ?? "delivered",
        };
      });
      setOrders(mapped);
      calculateStats(mapped);
    }
    setLoading(false);
  };

  const calculateStats = (o: PatientOrder[]) => {
    const now = new Date();
    const thisMonth = o.filter((x) => {
      const d = new Date(x.order_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const uniquePatients = new Set(o.map((x) => x.patient_name)).size;
    const totalRev = o.reduce((s, x) => s + x.total_value, 0);
    const totalMargin = o.reduce((s, x) => s + x.margin_earned, 0);

    setStats({
      totalOrders: o.length,
      totalPatients: uniquePatients,
      totalRevenue: totalRev,
      totalMargin,
      avgMarginPct: totalRev > 0 ? Math.round((totalMargin / totalRev) * 100) : 0,
      thisMonthOrders: thisMonth.length,
      thisMonthMargin: thisMonth.reduce((s, x) => s + x.margin_earned, 0),
    });
  };

  const filteredOrders = orders
    .filter((o) => {
      if (period === "this_month") {
        const now = new Date();
        const d = new Date(o.order_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === "last_30") {
        return new Date(o.order_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }
      return true;
    })
    .filter((o) =>
      !search || o.patient_name.toLowerCase().includes(search.toLowerCase())
    );

  // Group by patient for per-patient view
  const patientSummary = Object.values(
    filteredOrders.reduce((acc, o) => {
      const key = o.patient_name;
      if (!acc[key]) acc[key] = { name: key, orders: 0, totalValue: 0, totalMargin: 0, lastOrder: o.order_date };
      acc[key].orders++;
      acc[key].totalValue += o.total_value;
      acc[key].totalMargin += o.margin_earned;
      if (new Date(o.order_date) > new Date(acc[key].lastOrder)) acc[key].lastOrder = o.order_date;
      return acc;
    }, {} as Record<string, { name: string; orders: number; totalValue: number; totalMargin: number; lastOrder: string }>)
  ).sort((a, b) => b.totalMargin - a.totalMargin);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dispensing Dashboard</h1>
        <p className="text-muted-foreground">Track medicines dispensed per patient and your earned margins from Partner orders.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Package className="mx-auto h-5 w-5 text-blue-600 mb-1" />
            <p className="font-display text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Users className="mx-auto h-5 w-5 text-violet-600 mb-1" />
            <p className="font-display text-2xl font-bold">{stats.totalPatients}</p>
            <p className="text-xs text-muted-foreground">Unique Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <IndianRupee className="mx-auto h-5 w-5 text-emerald-600 mb-1" />
            <p className="font-display text-2xl font-bold text-emerald-600">₹{stats.totalMargin.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Margin Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-amber-600 mb-1" />
            <p className="font-display text-2xl font-bold text-amber-600">{stats.avgMarginPct}%</p>
            <p className="text-xs text-muted-foreground">Avg Margin %</p>
          </CardContent>
        </Card>
      </div>

      {/* This Month Highlight */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-emerald-800">This Month</p>
            <p className="text-xs text-emerald-600">{stats.thisMonthOrders} orders placed</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-emerald-700">₹{stats.thisMonthMargin.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">margin earned</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Per-Patient Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Per-Patient Dispensing Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patientSummary.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No dispensing data yet. Place partner orders for patients to track margins here.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Patient</th>
                    <th className="px-4 py-2 text-center">Orders</th>
                    <th className="px-4 py-2 text-right">Total Value</th>
                    <th className="px-4 py-2 text-right">Margin Earned</th>
                    <th className="px-4 py-2 text-right">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {patientSummary.map((p, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-center">{p.orders}</td>
                      <td className="px-4 py-3 text-right">₹{p.totalValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">₹{p.totalMargin.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">{new Date(p.lastOrder).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {filteredOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Dispensing Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {filteredOrders.slice(0, 20).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{order.patient_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.slice(0, 2).map((it) => it.name).join(", ")}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" /> {new Date(order.order_date).toLocaleDateString("en-IN")}
                    <Badge variant="outline" className="ml-1 text-[9px]">{order.status}</Badge>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">₹{order.total_value}</p>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                    <ArrowUpRight className="h-3.5 w-3.5" /> ₹{order.margin_earned}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{order.margin_percentage}% margin</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DispensingDashboard;
