import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHmsAccess } from "@/hooks/useHmsAccess";
import {
  Users,
  CalendarClock,
  ReceiptText,
  IndianRupee,
  Clock,
  BedDouble,
  ClipboardList,
  AlertTriangle,
  Plus,
  Activity,
  Pill,
  FlaskConical,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type DashStats = {
  patientsToday: number;
  appointmentsToday: number;
  billsToday: number;
  collectionToday: number;
  waitingNow: number;
  bedsOccupied: number;
  followUpsDue: number;
  lowStockItems: number;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const HmsDashboard = () => {
  const { branch } = useHmsAccess();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashStats>({
    patientsToday: 0,
    appointmentsToday: 0,
    billsToday: 0,
    collectionToday: 0,
    waitingNow: 0,
    bedsOccupied: 0,
    followUpsDue: 0,
    lowStockItems: 0,
  });
  const [recentQueue, setRecentQueue] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;

      const today = todayStr();
      const safe = async (p: Promise<any>) => {
        try { return await p; } catch { return { data: null, count: 0 }; }
      };

      const [patients, appts, bills, billsSum, waiting, followups, inventory, queue] = await Promise.all([
        safe((supabase as any).from("vaidya_queue_tokens").select("id", { count: "exact", head: true }).eq("token_date", today)),
        safe((supabase as any).from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", uid).gte("scheduled_at", today + "T00:00:00").lte("scheduled_at", today + "T23:59:59")),
        safe((supabase as any).from("vaidya_bills").select("id", { count: "exact", head: true }).eq("doctor_user_id", uid).eq("bill_date", today)),
        safe((supabase as any).from("vaidya_bills").select("total_amount").eq("doctor_user_id", uid).eq("bill_date", today)),
        safe((supabase as any).from("vaidya_queue_tokens").select("id", { count: "exact", head: true }).eq("status", "waiting")),
        safe((supabase as any).from("vaidya_followups").select("id", { count: "exact", head: true }).eq("due_date", today).eq("status", "pending")),
        safe((supabase as any).from("vaidya_inventory").select("quantity,low_stock_threshold")),
        safe((supabase as any).from("vaidya_queue_tokens").select("id,token_number,patient_name,status").eq("token_date", today).order("token_number").limit(10)),
      ]);

      const collection = (billsSum.data ?? []).reduce((s: number, r: any) => s + Number(r.total_amount ?? 0), 0);
      const lowStock = (inventory.data ?? []).filter((r: any) => Number(r.quantity ?? 0) <= Number(r.low_stock_threshold ?? 0)).length;

      setStats({
        patientsToday: patients.count ?? 0,
        appointmentsToday: appts.count ?? 0,
        billsToday: bills.count ?? 0,
        collectionToday: collection,
        waitingNow: waiting.count ?? 0,
        bedsOccupied: 0,
        followUpsDue: followups.count ?? 0,
        lowStockItems: lowStock,
      });
      setRecentQueue(queue.data ?? []);
      setLoading(false);
    };

    load();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">HMS Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {today} | {branch ?? "Main Branch"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/hms/patients"><Plus className="mr-1 h-4 w-4" /> New Patient</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/hms/opd"><Activity className="mr-1 h-4 w-4" /> OPD Queue</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard loading={loading} icon={<Users className="h-5 w-5 text-blue-500" />} label="Patients Today" value={stats.patientsToday} trend={+12} />
        <MetricCard loading={loading} icon={<CalendarClock className="h-5 w-5 text-purple-500" />} label="Appointments" value={stats.appointmentsToday} trend={+5} />
        <MetricCard loading={loading} icon={<ReceiptText className="h-5 w-5 text-orange-500" />} label="Bills Generated" value={stats.billsToday} trend={+8} />
        <MetricCard loading={loading} icon={<IndianRupee className="h-5 w-5 text-green-500" />} label="Collection" value={`₹${stats.collectionToday.toLocaleString("en-IN")}`} trend={+15} />
      </div>

      {/* Live Status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard loading={loading} icon={<Clock className="h-5 w-5" />} label="Waiting in Queue" value={stats.waitingNow} color="amber" />
        <StatusCard loading={loading} icon={<BedDouble className="h-5 w-5" />} label="Beds Occupied" value={stats.bedsOccupied} color="blue" />
        <StatusCard loading={loading} icon={<ClipboardList className="h-5 w-5" />} label="Follow-ups Due" value={stats.followUpsDue} color="purple" />
        <StatusCard loading={loading} icon={<AlertTriangle className="h-5 w-5" />} label="Low Stock Items" value={stats.lowStockItems} color="red" />
      </div>

      {/* Quick Actions & Queue */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Live Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Live OPD Queue</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link to="/hms/opd">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : recentQueue.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tokens issued today yet.</p>
            ) : (
              <div className="space-y-2">
                {recentQueue.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {t.token_number}
                      </span>
                      <span className="text-sm font-medium">{t.patient_name ?? "Patient"}</span>
                    </div>
                    <Badge variant={t.status === "waiting" ? "secondary" : t.status === "in_progress" ? "default" : "outline"}>
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <Link to="/hms/opd">
                <Activity className="h-5 w-5" />
                <span className="text-xs">Add Token</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <Link to="/hms/patients">
                <Users className="h-5 w-5" />
                <span className="text-xs">New Patient</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <Link to="/hms/billing">
                <ReceiptText className="h-5 w-5" />
                <span className="text-xs">New Bill</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <Link to="/hms/appointments">
                <CalendarClock className="h-5 w-5" />
                <span className="text-xs">Book Appt</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <Link to="/hms/pharmacy">
                <Pill className="h-5 w-5" />
                <span className="text-xs">Pharmacy</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <Link to="/hms/lab">
                <FlaskConical className="h-5 w-5" />
                <span className="text-xs">Lab Order</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AlertCard label="Stock Expiring (30 days)" value={0} color="red" to="/hms/pharmacy" />
            <AlertCard label="Pending Bills > 7 days" value={0} color="amber" to="/hms/billing" />
            <AlertCard label="Follow-ups Due Today" value={stats.followUpsDue} color="blue" to="/hms/appointments" />
            <AlertCard label="Appointments Next 2hrs" value={stats.appointmentsToday} color="green" to="/hms/appointments" />
          </div>
        </CardContent>
      </Card>

      {/* Vaidya Clinical Tools Integration */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" /> Vaidya Clinical Tools (Connected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Access doctor-facing clinical tools including consultations, prescriptions, and patient management.
          </p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Link to="/vaidya" className="rounded-lg border p-3 text-center hover:bg-emerald-50 transition">
              <p className="text-xs font-medium">Vaidya Home</p>
            </Link>
            <Link to="/vaidya/consultations" className="rounded-lg border p-3 text-center hover:bg-emerald-50 transition">
              <p className="text-xs font-medium">Consultations</p>
            </Link>
            <Link to="/vaidya/ayurveda-prescription" className="rounded-lg border p-3 text-center hover:bg-emerald-50 transition">
              <p className="text-xs font-medium">Prescriptions</p>
            </Link>
            <Link to="/vaidya/panchakarma" className="rounded-lg border p-3 text-center hover:bg-emerald-50 transition">
              <p className="text-xs font-medium">Panchakarma</p>
            </Link>
            <Link to="/vaidya/ashtavidha" className="rounded-lg border p-3 text-center hover:bg-emerald-50 transition">
              <p className="text-xs font-medium">Ashtavidha</p>
            </Link>
            <Link to="/vaidya/hms" className="rounded-lg border p-3 text-center hover:bg-emerald-50 transition">
              <p className="text-xs font-medium">HMS Ultra</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MetricCard = ({ loading, icon, label, value, trend }: { loading: boolean; icon: React.ReactNode; label: string; value: number | string; trend?: number }) => (
  <Card>
    <CardContent className="p-4">
      {loading ? <Skeleton className="h-16 w-full" /> : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
            {trend !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const StatusCard = ({ loading, icon, label, value, color }: { loading: boolean; icon: React.ReactNode; label: string; value: number; color: string }) => (
  <Card className={`border-${color}-200 bg-${color}-50/30`}>
    <CardContent className="p-4">
      {loading ? <Skeleton className="h-12 w-full" /> : (
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
          <p className="mt-1 font-display text-xl font-bold">{value}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const AlertCard = ({ label, value, color, to }: { label: string; value: number; color: string; to: string }) => (
  <Link to={to} className={`rounded-lg border p-3 bg-${color}-50/50 border-${color}-200 hover:bg-${color}-50 transition`}>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-xl font-bold mt-1">{value}</p>
  </Link>
);

export default HmsDashboard;
