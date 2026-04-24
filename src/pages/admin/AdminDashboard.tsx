import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Stethoscope, ShoppingBag, IndianRupee, Gift, Wallet, GraduationCap, Award, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Stats { users: number; doctors: number; orders: number; revenue: number; referralCodes: number; referralPayouts: number; }
interface StudentStats { total: number; verified: number; enrolled: number; certificates: number; }
interface StudentRow { id: string; user_id: string; full_name: string; phone: string | null; course: string | null; college_name: string | null; year_of_study: number | null; state: string | null; is_verified: boolean; student_id_url: string | null; rejection_note: string | null; }
interface RecentAppt { id: string; appointment_date: string; time_slot: string; status: string; mode: string; }
interface RecentOrder { id: string; full_name: string; total: number; order_status: string; created_at: string; }
interface DayPoint { day: string; revenue: number; }

const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, doctors: 0, orders: 0, revenue: 0, referralCodes: 0, referralPayouts: 0 });
  const [appts, setAppts] = useState<RecentAppt[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [chart, setChart] = useState<DayPoint[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats>({ total: 0, verified: 0, enrolled: 0, certificates: 0 });
  const [rejecting, setRejecting] = useState<StudentRow | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    document.title = "Admin Dashboard — Ayuzee";
    const load = async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const monthIso = monthStart.toISOString();

      const [u, d, o, paid, recentAppts, recentOrders, allOrders, refCodes, refPayouts, studentRows, verifiedStudents, enrolled, certs] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("payment_status", "paid"),
        supabase.from("appointments").select("id,appointment_date,time_slot,status,mode").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("id,full_name,total,order_status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("total,created_at,payment_status").gte("created_at", sinceIso),
        supabase.from("profiles").select("referral_code", { count: "exact", head: true }).not("referral_code", "is", null),
        supabase.from("ayuzee_transactions").select("amount").eq("type", "referral_credit").gte("created_at", monthIso),
        (supabase as any).from("student_profiles").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("student_profiles").select("id", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("lms_progress").select("id", { count: "exact", head: true }),
        supabase.from("lms_certificates").select("id", { count: "exact", head: true }),
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
      setStudents((studentRows.data ?? []) as StudentRow[]);
      setStudentStats({ total: studentRows.data?.length ?? 0, verified: verifiedStudents.count ?? 0, enrolled: enrolled.count ?? 0, certificates: certs.count ?? 0 });
    };
    load();
  }, []);

  const getStudentIdUrl = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("student-docs").createSignedUrl(path, 60 * 20);
    return data?.signedUrl ?? null;
  };

  const verifyStudent = async (student: StudentRow) => {
    const { error } = await (supabase as any).from("student_profiles").update({ is_verified: true, rejection_note: null }).eq("id", student.id);
    if (error) { toast.error(error.message); return; }
    if (student.phone) {
      await supabase.functions.invoke("send-whatsapp", {
        body: { to: student.phone, message: "Your Ayuzee student account is verified! Access all courses and webinars now." },
      });
    }
    toast.success("Student verified");
    setStudents((rows) => rows.map((row) => row.id === student.id ? { ...row, is_verified: true, rejection_note: null } : row));
    setStudentStats((current) => ({ ...current, verified: current.verified + 1 }));
  };

  const rejectStudent = async () => {
    if (!rejecting) return;
    const { error } = await (supabase as any).from("student_profiles").update({ is_verified: false, rejection_note: rejectNote || null }).eq("id", rejecting.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Student rejected");
    setStudents((rows) => rows.map((row) => row.id === rejecting.id ? { ...row, is_verified: false, rejection_note: rejectNote || null } : row));
    setRejecting(null);
    setRejectNote("");
  };

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="students">Students</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-6">
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
            <CardContent><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => formatINR(v)} /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: "Total students", value: studentStats.total, icon: GraduationCap }, { label: "Verified students", value: studentStats.verified, icon: Users }, { label: "Courses enrolled", value: studentStats.enrolled, icon: BookOpen }, { label: "Certificates issued", value: studentStats.certificates, icon: Award }].map((s) => <Card key={s.label}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle><s.icon className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="font-display text-2xl">{s.value.toLocaleString("en-IN")}</div></CardContent></Card>)}
          </div>
          <Card><CardHeader><CardTitle>Student verification</CardTitle></CardHeader><CardContent className="space-y-3">{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}{students.map((student) => <div key={student.id} className="grid gap-3 rounded-xl border border-border p-4 lg:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{student.full_name}</p><Badge variant={student.is_verified ? "default" : "secondary"}>{student.is_verified ? "Verified" : "Pending"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{student.course || "Course"} · Year {student.year_of_study || "—"} · {student.college_name || "College not added"}</p><p className="text-sm text-muted-foreground">{student.state || "State not added"}</p>{student.rejection_note && <p className="mt-2 text-xs text-destructive">Rejected: {student.rejection_note}</p>}</div><div className="flex flex-wrap items-center gap-2 lg:justify-end">{!student.is_verified && student.student_id_url && <Button variant="outline" size="sm" onClick={async () => { const url = await getStudentIdUrl(student.student_id_url); if (url) window.open(url, "_blank"); }}>View ID</Button>}{!student.is_verified && <Button size="sm" onClick={() => verifyStudent(student)}>Verify</Button>}<Button variant="outline" size="sm" onClick={() => { setRejecting(student); setRejectNote(student.rejection_note || ""); }}>Reject</Button></div></div>)}</CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}><DialogContent><DialogHeader><DialogTitle>Reject student verification</DialogTitle></DialogHeader><Textarea value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} placeholder="Optional note" /><DialogFooter><Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="destructive" onClick={rejectStudent}>Reject</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
};

export default AdminDashboard;
