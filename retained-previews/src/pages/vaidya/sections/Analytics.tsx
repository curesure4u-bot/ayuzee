import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  IndianRupee,
  Stethoscope,
  Users,
  Pill,
  Activity,
  CalendarDays,
  Wallet,
} from "lucide-react";

type Range = 7 | 30 | 90;

const COLORS = ["hsl(var(--primary))", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#14b8a6"];

const Analytics = () => {
  const { userId, doctor } = useDoctor();
  const [range, setRange] = useState<Range>(30);
  const [bills, setBills] = useState<any[]>([]);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [cons, setCons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - range + 1);
    return d.toISOString().slice(0, 10);
  }, [range]);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const sinceISO = new Date(since).toISOString();

    const [bRes, cRes, aRes] = await Promise.all([
      supabase
        .from("vaidya_bills")
        .select("id,total,subtotal,discount,payment_mode,status,bill_type,created_at")
        .eq("doctor_user_id", userId)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: true }),
      supabase
        .from("vaidya_consultations")
        .select("id,visit_date,diagnosis,fee,patient_id,created_at")
        .eq("doctor_user_id", userId)
        .gte("visit_date", since)
        .order("visit_date", { ascending: true }),
      doctor?.id
        ? supabase
            .from("appointments")
            .select("id,appointment_date,status,fee,payment_status,mode")
            .eq("doctor_id", doctor.id)
            .gte("appointment_date", since)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    setBills(bRes.data ?? []);
    setCons(cRes.data ?? []);
    setAppts((aRes as any).data ?? []);

    const billIds = (bRes.data ?? []).map((b: any) => b.id);
    if (billIds.length) {
      const { data: items } = await supabase
        .from("vaidya_bill_items")
        .select("medicine_name,quantity,line_total,bill_id")
        .in("bill_id", billIds);
      setBillItems(items ?? []);
    } else {
      setBillItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, range, doctor?.id]);

  // KPIs
  const kpis = useMemo(() => {
    const billRev = bills.reduce((s, b) => s + (b.total ?? 0), 0);
    const apptRev = appts.filter((a) => a.payment_status === "paid").reduce((s, a) => s + (a.fee ?? 0), 0);
    const total = billRev + apptRev;
    const opCount = cons.length + appts.length;
    const uniquePts = new Set([
      ...cons.map((c) => c.patient_id).filter(Boolean),
      ...appts.map((a: any) => a.id),
    ]).size;
    const avgBill = bills.length ? Math.round(billRev / bills.length) : 0;
    return { total, billRev, apptRev, opCount, uniquePts, avgBill };
  }, [bills, appts, cons]);

  // Daily revenue + OP series
  const dailySeries = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; opd: number }> = {};
    for (let i = 0; i < range; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (range - 1 - i));
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: key.slice(5), revenue: 0, opd: 0 };
    }
    bills.forEach((b) => {
      const k = (b.created_at as string).slice(0, 10);
      if (map[k]) map[k].revenue += b.total ?? 0;
    });
    appts.forEach((a) => {
      const k = a.appointment_date as string;
      if (map[k]) {
        if (a.payment_status === "paid") map[k].revenue += a.fee ?? 0;
        map[k].opd += 1;
      }
    });
    cons.forEach((c) => {
      const k = c.visit_date as string;
      if (map[k]) map[k].opd += 1;
    });
    return Object.values(map);
  }, [bills, appts, cons, range]);

  // Top diagnoses
  const topDiagnoses = useMemo(() => {
    const counts: Record<string, number> = {};
    cons.forEach((c) => {
      const dx = (c.diagnosis ?? "").trim();
      if (!dx) return;
      const key = dx.split(/[,;\n]/)[0].trim().slice(0, 40);
      if (!key) return;
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [cons]);

  // Top medicines
  const topMedicines = useMemo(() => {
    const agg: Record<string, { qty: number; revenue: number }> = {};
    billItems.forEach((it) => {
      const k = (it.medicine_name || "Unknown").trim();
      if (!agg[k]) agg[k] = { qty: 0, revenue: 0 };
      agg[k].qty += it.quantity ?? 0;
      agg[k].revenue += it.line_total ?? 0;
    });
    return Object.entries(agg)
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);
  }, [billItems]);

  // Payment mode breakdown
  const payModes = useMemo(() => {
    const map: Record<string, number> = {};
    bills.forEach((b) => {
      const k = (b.payment_mode || "unknown").toLowerCase();
      map[k] = (map[k] ?? 0) + (b.total ?? 0);
    });
    appts
      .filter((a) => a.payment_status === "paid")
      .forEach((a) => {
        map["online"] = (map["online"] ?? 0) + (a.fee ?? 0);
      });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [bills, appts]);

  const StatCard = ({ label, value, icon: Icon, gradient, prefix, suffix }: any) => (
    <Card className={`bg-gradient-to-br ${gradient} p-4 text-primary-foreground`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-90">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {prefix}
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
            {suffix && <span className="ml-1 text-sm font-normal opacity-80">{suffix}</span>}
          </p>
        </div>
        <Icon className="h-8 w-8 opacity-80" />
      </div>
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Revenue, OP visits, top diagnoses & medicines.</p>
        </div>
        <div className="flex gap-1 rounded-md border p-1">
          {([7, 30, 90] as Range[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setRange(r)}
            >
              {r}d
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={kpis.total} prefix="₹" icon={IndianRupee} gradient="from-emerald-500/80 to-emerald-600" />
        <StatCard label="OP Visits" value={kpis.opCount} icon={Stethoscope} gradient="from-primary/80 to-primary" />
        <StatCard label="Unique Patients" value={kpis.uniquePts} icon={Users} gradient="from-sky-500/80 to-sky-600" />
        <StatCard label="Avg Bill" value={kpis.avgBill} prefix="₹" icon={Wallet} gradient="from-violet-500/80 to-violet-600" />
      </div>

      {/* Revenue + OP combined */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Revenue & OP trend</h3>
            <p className="text-xs text-muted-foreground">Last {range} days</p>
          </div>
          <Badge variant="outline" className="text-xs">₹{kpis.total.toLocaleString("en-IN")}</Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="opd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              <Area yAxisId="right" type="monotone" dataKey="opd" name="OP Visits" stroke="#0ea5e9" fill="url(#opd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top diagnoses */}
        <Card className="p-5">
          <h3 className="mb-3 font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-500" />Top diagnoses
          </h3>
          {topDiagnoses.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No diagnosis data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiagnoses} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={130} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Payment mode pie */}
        <Card className="p-5">
          <h3 className="mb-3 font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-500" />Payment mode breakdown
          </h3>
          {payModes.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No payment data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payModes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e: any) => `${e.name}: ₹${e.value}`}>
                    {payModes.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₹${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Top medicines */}
      <Card className="p-5">
        <h3 className="mb-3 font-semibold flex items-center gap-2">
          <Pill className="h-4 w-4 text-amber-500" />Top medicines (by revenue)
        </h3>
        {topMedicines.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No medicine sales recorded yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMedicines}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: any, n: any) => (n === "revenue" ? `₹${v}` : v)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="qty" name="Qty Sold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-2">Medicine</th>
                    <th className="py-2 pr-2 text-right">Qty</th>
                    <th className="py-2 pr-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topMedicines.map((m) => (
                    <tr key={m.name} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{m.name}</td>
                      <td className="py-2 pr-2 text-right">{m.qty}</td>
                      <td className="py-2 pr-2 text-right">₹{m.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {loading && <p className="text-center text-xs text-muted-foreground">Loading…</p>}
    </div>
  );
};

export default Analytics;
