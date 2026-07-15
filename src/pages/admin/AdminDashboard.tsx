import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, IndianRupee, Package, ShieldAlert, Stethoscope, Users } from "lucide-react";

type DayPoint = { day: string; revenue?: number; appointments?: number };
type RecentOrder = { id: string; full_name: string; total: number; order_status: string; payment_status: string; created_at: string };
type SafetyFlag = { id: string; reason: string; severity: string | null; created_at: string; therapists?: { full_name?: string | null } | null };

const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const timeAgo = (iso: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const AdminDashboard = () => {
  usePageSEO({ title: "Admin Dashboard — Ayuzee", noIndex: true });
  const [stats, setStats] = useState({ users: 0, doctors: 0, therapists: 0, appointmentsToday: 0, ordersToday: 0, revenueMonth: 0 });
  const [revenueChart, setRevenueChart] = useState<DayPoint[]>([]);
  const [appointmentChart, setAppointmentChart] = useState<DayPoint[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [approvals, setApprovals] = useState({ doctors: 0, therapists: 0, venues: 0, students: 0 });
  const [alerts, setAlerts] = useState<SafetyFlag[]>([]);

  useEffect(() => { const load = async () => {
      const today = new Date();
      const todayKey = today.toISOString().slice(0, 10);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const since30 = new Date(today); since30.setDate(since30.getDate() - 29); since30.setHours(0, 0, 0, 0);
      const since14 = new Date(today); since14.setDate(since14.getDate() - 13); since14.setHours(0, 0, 0, 0);

      const [users, doctors, therapists, apptsToday, ordersToday, monthOrders, revenueRows, apptRows, recentOrders, pendingDoctors, pendingTherapists, pendingVenues, pendingStudents, safetyRows] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("therapists").select("id", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("appointment_date", todayKey),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", `${todayKey}T00:00:00.000Z`).lt("created_at", tomorrow.toISOString()),
        supabase.from("orders").select("total").eq("payment_status", "paid").gte("created_at", monthStart),
        supabase.from("orders").select("total,created_at,payment_status").eq("payment_status", "paid").gte("created_at", since30.toISOString()),
        supabase.from("appointments").select("appointment_date").gte("appointment_date", since14.toISOString().slice(0, 10)),
        supabase.from("orders").select("id,full_name,total,order_status,payment_status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("doctors").select("id", { count: "exact", head: true }).eq("is_verified", false),
        supabase.from("therapists").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
        supabase.from("therapy_venues").select("id", { count: "exact", head: true }).eq("is_verified", false),
        (supabase as any).from("student_profiles").select("id", { count: "exact", head: true }).eq("is_verified", false),
        supabase.from("therapist_safety_flags").select("id,reason,severity,created_at,therapists(full_name)").eq("resolved", false).order("created_at", { ascending: false }).limit(3),
      ]);

      setStats({ users: users.count ?? 0, doctors: doctors.count ?? 0, therapists: therapists.count ?? 0, appointmentsToday: apptsToday.count ?? 0, ordersToday: ordersToday.count ?? 0, revenueMonth: (monthOrders.data ?? []).reduce((sum, row) => sum + (row.total || 0), 0) });
      setOrders((recentOrders.data ?? []) as RecentOrder[]);
      setApprovals({ doctors: pendingDoctors.count ?? 0, therapists: pendingTherapists.count ?? 0, venues: pendingVenues.count ?? 0, students: pendingStudents.count ?? 0 });
      setAlerts((safetyRows.data ?? []) as SafetyFlag[]);

      const revenue: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); revenue[d.toISOString().slice(0, 10)] = 0; }
      (revenueRows.data ?? []).forEach((row) => { revenue[row.created_at.slice(0, 10)] += row.total || 0; });
      setRevenueChart(Object.entries(revenue).map(([day, value]) => ({ day: day.slice(5), revenue: value })));

      const appointments: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); appointments[d.toISOString().slice(0, 10)] = 0; }
      (apptRows.data ?? []).forEach((row) => { if (row.appointment_date in appointments) appointments[row.appointment_date] += 1; });
      setAppointmentChart(Object.entries(appointments).map(([day, value]) => ({ day: day.slice(5), appointments: value })));
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.users.toLocaleString("en-IN"), icon: Users },
    { label: "Total Doctors", value: stats.doctors.toLocaleString("en-IN"), icon: Stethoscope },
    { label: "Therapists", value: stats.therapists.toLocaleString("en-IN"), icon: Users },
    { label: "Today's Appointments", value: stats.appointmentsToday.toLocaleString("en-IN"), icon: CalendarDays },
    { label: "Orders Today", value: stats.ordersToday.toLocaleString("en-IN"), icon: Package },
    { label: "Revenue This Month", value: formatINR(stats.revenueMonth), icon: IndianRupee },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Live operational overview across Ayuzee.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{statCards.map((card) => <Card key={card.label}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle><card.icon className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="font-display text-2xl">{card.value}</div></CardContent></Card>)}</div>
      <div className="grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Daily revenue · last 30 days</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueChart}><defs><linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" /><XAxis dataKey="day" fontSize={12} stroke="hsl(var(--muted-foreground))" /><YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" /><Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#adminRevenue)" strokeWidth={2} /></AreaChart></ResponsiveContainer></CardContent></Card><Card><CardHeader><CardTitle>Appointments · last 14 days</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={appointmentChart}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" /><XAxis dataKey="day" fontSize={12} stroke="hsl(var(--muted-foreground))" /><YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" allowDecimals={false} /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /><Bar dataKey="appointments" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card></div>
      <div className="grid gap-4 xl:grid-cols-3"><Card><CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader><CardContent className="space-y-3">{orders.map((order) => <div key={order.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0"><div><p className="font-medium">{order.full_name}</p><p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)} · {timeAgo(order.created_at)}</p></div><div className="text-right"><p className="font-semibold">{formatINR(order.total)}</p><Badge variant="secondary">{order.order_status}</Badge></div></div>)}{orders.length === 0 && <p className="text-sm text-muted-foreground">No recent orders.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader><CardContent className="space-y-3">{[{ label: "Doctors pending", value: approvals.doctors, url: "/admin/doctors" }, { label: "Therapists pending", value: approvals.therapists, url: "/admin/therapists" }, { label: "Venues pending", value: approvals.venues, url: "/admin/venues" }, { label: "Students pending", value: approvals.students, url: "/admin/students" }].map((item) => <div key={item.label} className="flex items-center justify-between"><span className="text-sm">{item.label}</span><div className="flex items-center gap-3"><Badge>{item.value}</Badge><Link to={item.url} className="text-sm font-medium text-primary hover:underline">Review →</Link></div></div>)}</CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Safety Alerts</CardTitle><Link to="/admin/safety" className="text-sm font-medium text-primary hover:underline">View all →</Link></CardHeader><CardContent className="space-y-3">{alerts.map((alert) => <div key={alert.id} className="rounded-md border border-border p-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">{alert.therapists?.full_name || "Therapist"}</p><Badge className={alert.severity === "suspension" ? "bg-admin-danger text-destructive-foreground" : "bg-admin-warning text-foreground"}>{alert.severity || "warning"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{alert.reason}</p></div>)}{alerts.length === 0 && <div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldAlert className="h-4 w-4" /> No unresolved safety alerts.</div>}</CardContent></Card></div>
    </div>
  );
};

export default AdminDashboard;