import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HmsAccessGate from "@/components/hms/HmsAccessGate";
import { useHmsAccess } from "@/hooks/useHmsAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, CalendarClock, ReceiptText, IndianRupee, Clock, BedDouble,
  ClipboardList, AlertTriangle, Plus, FileText, Zap,
} from "lucide-react";

type Stats = {
  patientsToday: number;
  apptsToday: number;
  billsToday: number;
  collectionToday: number;
  waiting: number;
  beds: number;
  followups: number;
  lowStock: number;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const HmsDash = () => {
  const { branch } = useHmsAccess();
  const [uid, setUid] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    patientsToday: 0, apptsToday: 0, billsToday: 0, collectionToday: 0,
    waiting: 0, beds: 0, followups: 0, lowStock: 0,
  });
  const [queue, setQueue] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);

  const load = async (userId: string) => {
    const today = todayStr();
    const safe = async (p: Promise<any>) => {
      try { return await p; } catch { return { data: null, count: 0 }; }
    };

    const [
      pat, ap, bills, billsSum, waiting, fu, inv, q, apList,
    ] = await Promise.all([
      safe((supabase as any).from("vaidya_queue_tokens").select("id", { count: "exact", head: true }).eq("token_date", today)),
      safe((supabase as any).from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", userId).gte("scheduled_at", today + "T00:00:00").lte("scheduled_at", today + "T23:59:59")),
      safe((supabase as any).from("vaidya_bills").select("id", { count: "exact", head: true }).eq("doctor_user_id", userId).eq("bill_date", today)),
      safe((supabase as any).from("vaidya_bills").select("total_amount").eq("doctor_user_id", userId).eq("bill_date", today)),
      safe((supabase as any).from("vaidya_queue_tokens").select("id", { count: "exact", head: true }).eq("status", "waiting")),
      safe((supabase as any).from("vaidya_followups").select("id", { count: "exact", head: true }).eq("due_date", today).eq("status", "pending")),
      safe((supabase as any).from("vaidya_inventory").select("quantity,low_stock_threshold")),
      safe((supabase as any).from("vaidya_queue_tokens").select("id,token_number,patient_name,status").eq("token_date", today).order("token_number").limit(20)),
      safe((supabase as any).from("appointments").select("id,scheduled_at,status,patient_name").eq("doctor_id", userId).gte("scheduled_at", today + "T00:00:00").lte("scheduled_at", today + "T23:59:59").order("scheduled_at").limit(20)),
    ]);

    const collection = (billsSum.data ?? []).reduce((s: number, r: any) => s + Number(r.total_amount ?? 0), 0);
    const lowStock = (inv.data ?? []).filter((r: any) => Number(r.quantity ?? 0) <= Number(r.low_stock_threshold ?? 0)).length;

    setStats({
      patientsToday: pat.count ?? 0,
      apptsToday: ap.count ?? 0,
      billsToday: bills.count ?? 0,
      collectionToday: collection,
      waiting: waiting.count ?? 0,
      beds: 0,
      followups: fu.count ?? 0,
      lowStock,
    });
    setQueue(q.data ?? []);
    setAppts(apList.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const u = sess.session?.user;
      if (!u) return;
      setUid(u.id);
      const { data: prof } = await (supabase as any).from("profiles").select("full_name").eq("user_id", u.id).maybeSingle();
      setName(prof?.full_name ?? u.email ?? "Doctor");
      await load(u.id);
    })();
  }, []);

  // Realtime queue updates
  useEffect(() => {
    const channel = supabase
      .channel("hms-queue-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "vaidya_queue_tokens" }, () => {
        if (uid) load(uid);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [uid]);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" /> HMS Tools Ultra
          </h1>
          <p className="text-sm text-muted-foreground">{today} &nbsp;|&nbsp; {branch ?? "—"} &nbsp;|&nbsp; Welcome, Dr. {name}</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30">⚡ HMS Tools Ultra</Badge>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard loading={loading} icon={<Users className="h-5 w-5" />} label="🧑‍⚕️ Patients Today" value={stats.patientsToday} />
        <StatCard loading={loading} icon={<CalendarClock className="h-5 w-5" />} label="📅 Appointments Today" value={stats.apptsToday} />
        <StatCard loading={loading} icon={<ReceiptText className="h-5 w-5" />} label="🧾 Bills Today" value={stats.billsToday} />
        <StatCard loading={loading} icon={<IndianRupee className="h-5 w-5" />} label="💰 Collection Today" value={`₹${stats.collectionToday.toLocaleString("en-IN")}`} />
      </div>

      {/* Live Status */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard loading={loading} icon={<Clock className="h-5 w-5" />} label="⏳ Waiting Now" value={stats.waiting} />
        <StatCard loading={loading} icon={<BedDouble className="h-5 w-5" />} label="🛏️ Beds Occupied" value={stats.beds} />
        <StatCard loading={loading} icon={<ClipboardList className="h-5 w-5" />} label="📋 Follow-ups Due" value={stats.followups} />
        <StatCard loading={loading} icon={<AlertTriangle className="h-5 w-5" />} label="⚠️ Low Stock" value={stats.lowStock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">📋 Today's Queue</h3>
            {loading ? <Skeleton className="h-40 w-full" /> : queue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tokens yet today.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {queue.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded border p-2">
                    <span><b>#{t.token_number}</b> · {t.patient_name ?? "Patient"}</span>
                    <Badge variant={t.status === "waiting" ? "secondary" : "default"}>{t.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild size="sm" variant="outline" className="mt-3 w-full"><Link to="/vaidya/reception">Open Reception</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">📅 Today's Appointments</h3>
            {loading ? <Skeleton className="h-40 w-full" /> : appts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments today.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {appts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded border p-2">
                    <span>{new Date(a.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {a.patient_name ?? "—"}</span>
                    <Badge variant="outline">{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild size="sm" variant="outline" className="mt-3 w-full"><Link to="/vaidya/upcoming">All Appointments</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline"><Link to="/vaidya/reception"><Plus className="mr-1 h-4 w-4" />Add to Queue</Link></Button>
              <Button asChild variant="outline"><Link to="/vaidya/patients"><Plus className="mr-1 h-4 w-4" />New Patient</Link></Button>
              <Button asChild variant="outline"><Link to="/vaidya/consultations"><Plus className="mr-1 h-4 w-4" />Consultation</Link></Button>
              <Button asChild variant="outline"><Link to="/vaidya/bills"><Plus className="mr-1 h-4 w-4" />New Bill</Link></Button>
              <Button asChild variant="outline"><Link to="/vaidya/analytics"><FileText className="mr-1 h-4 w-4" />MIS Reports</Link></Button>
              <Button asChild variant="outline"><Link to="/hms/ipd"><BedDouble className="mr-1 h-4 w-4" />Ward Status</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 font-semibold">Alerts</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <Alert color="bg-red-500/10 border-red-500/40" label="🔴 Stock expiring (30 days)" value={0} to="/vaidya/inventory" />
            <Alert color="bg-amber-500/10 border-amber-500/40" label="🟡 Pending bills > 7 days" value={0} to="/vaidya/bills" />
            <Alert color="bg-blue-500/10 border-blue-500/40" label="🔵 Follow-ups due today" value={stats.followups} to="/vaidya/follow-up" />
            <Alert color="bg-emerald-500/10 border-emerald-500/40" label="🟢 Appointments next 2h" value={stats.apptsToday} to="/vaidya/upcoming" />
          </div>
        </CardContent>
      </Card>

      {/* Full AYUSH HMS Portal Interconnection */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Full AYUSH HMS Portal
            </h3>
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Connected</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Access the complete hospital management system with AYUSH clinical modules, AI tools, manufacturing, and research.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/panchakarma">Panchakarma</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/yoga">Yoga Therapy</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/inventory">Inventory</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/consultations">Consultations</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/patients">Patients</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/bills">Billing</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/analytics">Analytics</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/vaidya/follow-up">Follow-ups</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ loading, icon, label, value }: { loading: boolean; icon: React.ReactNode; label: string; value: number | string }) => (
  <Card>
    <CardContent className="p-4">
      {loading ? <Skeleton className="h-12 w-full" /> : (
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
          <p className="mt-2 font-display text-2xl">{value}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const Alert = ({ color, label, value, to }: { color: string; label: string; value: number; to: string }) => (
  <Link to={to} className={`rounded-md border p-3 ${color} hover:opacity-90 transition`}>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-xl">{value}</p>
  </Link>
);

const HmsUltraDashboard = () => (
  <HmsAccessGate>
    <HmsDash />
  </HmsAccessGate>
);

export default HmsUltraDashboard;
