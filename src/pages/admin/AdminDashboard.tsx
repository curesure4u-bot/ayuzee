import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, ShoppingBag, IndianRupee, Gift, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Stats { users: number; doctors: number; orders: number; revenue: number; referralCodes: number; referralPayouts: number; }
interface RecentAppt { id: string; appointment_date: string; time_slot: string; status: string; mode: string; }
interface RecentOrder { id: string; full_name: string; total: number; order_status: string; created_at: string; }
interface DayPoint { day: string; revenue: number; }

const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, doctors: 0, orders: 0, revenue: 0, referralCodes: 0, referralPayouts: 0 });
  const [appts, setAppts] = useState<RecentAppt[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [chart, setChart] = useState<DayPoint[]>([]);

  useEffect(() => {
    document.title = "Admin Dashboard — Ayuzee";
    const load = async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const monthIso = monthStart.toISOString();

      const [u, d, o, paid, recentAppts, recentOrders, allOrders, refCodes, refPayouts] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("payment_status", "paid"),
        supabase.from("appointments").select("id,appointment_date,time_slot,status,mode").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("id,full_name,total,order_status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("total,created_at,payment_status").gte("created_at", sinceIso),
        supabase.from("profiles").select("referral_code", { count: "exact", head: true }).not("referral_code", "is", null),
        supabase.from("ayuzee_transactions").select("amount").eq("type", "referral_credit").gte("created_at", monthIso),
      ]);

      const revenue = (paid.data ?? []).reduce((s, r: { total: number }) => s + (r.total || 0), 0);
      const referralPayouts = (refPayouts.data ?? []).reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);
      setStats({
        users: u.count ?? 0, doctors: d.count ?? 0, orders: o.count ?? 0, revenue,
        referralCodes: refCodes.count ?? 0, referralPayouts,
      });
      setAppts((recentAppts.data ?? []) as RecentAppt[]);
      setOrders((recentOrders.data ?? []) as RecentOrder[]);

      const days: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const dt = new Date(); dt.setDate(dt.getDate() - i);
        days[dt.toISOString().slice(0, 10)] = 0;
      }
      (allOrders.data ?? []).forEach((row: { total: number; created_at: string; payment_status: string }) => {
        if (row.payment_status !== "paid") return;
        const k = row.created_at.slice(0, 10);
        if (k in days) days[k] += row.total || 0;
      });
      setChart(Object.entries(days).map(([day, revenue]) => ({ day: day.slice(5), revenue })));
    };
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users.toLocaleString("en-IN"), icon: Users },
    { label: "Total Doctors", value: stats.doctors.toLocaleString("en-IN"), icon: Stethoscope },
    { label: "Total Orders", value: stats.orders.toLocaleString("en-IN"), icon: ShoppingBag },
    { label: "Total Revenue", value: formatINR(stats.revenue), icon: IndianRupee },
    { label: "Active Referral Codes", value: stats.referralCodes.toLocaleString("en-IN"), icon: Gift },
    { label: "Referral Payouts (this month)", value: formatINR(stats.referralPayouts), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of platform performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="font-display text-2xl">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Daily revenue · last 30 days</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => formatINR(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent appointments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {appts.length === 0 && <p className="text-sm text-muted-foreground">No appointments yet.</p>}
            {appts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div>
                  <p className="font-medium">{a.appointment_date} · {a.time_slot}</p>
                  <p className="text-xs text-muted-foreground capitalize">{a.mode.replace("_", " ")}</p>
                </div>
                <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium capitalize">{a.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div>
                  <p className="font-medium">{o.full_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatINR(o.total)}</p>
                  <span className="text-xs capitalize text-muted-foreground">{o.order_status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
