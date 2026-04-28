import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  IndianRupee,
  CalendarDays,
  Boxes,
  ReceiptText,
  HeartHandshake,
  Activity,
  Stethoscope,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const VaidyaHome = () => {
  const { doctor, userId } = useDoctor();
  const [stats, setStats] = useState({
    patients: 0,
    earnedTotal: 0,
    earnedToday: 0,
    apptsTotal: 0,
    apptsToday: 0,
    consultsToday: 0,
    pendingFollowUps: 0,
    lowStock: 0,
    outstanding: 0,
  });
  const [series, setSeries] = useState<{ day: string; revenue: number }[]>([]);
  const [todayConsults, setTodayConsults] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, { name: string; phone?: string }>>({});
  const [insight, setInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const today = todayStr();
      const since = daysAgo(13);

      const [
        { count: walkins },
        { data: bills },
        appointmentsRes,
        { data: stock },
        { data: consults },
        { data: pending },
      ] = await Promise.all([
        supabase
          .from("vaidya_patients")
          .select("id", { count: "exact", head: true })
          .eq("doctor_user_id", userId),
        supabase
          .from("vaidya_bills")
          .select("total, status, created_at")
          .eq("doctor_user_id", userId)
          .gte("created_at", `${since}T00:00:00`),
        doctor?.id
          ? supabase
              .from("appointments")
              .select("user_id, fee, payment_status, appointment_date, time_slot, status, mode")
              .eq("doctor_id", doctor.id)
          : Promise.resolve({ data: [] as any[] }),
        supabase
          .from("vaidya_inventory")
          .select("quantity, low_stock_threshold")
          .eq("doctor_user_id", userId),
        supabase
          .from("vaidya_consultations")
          .select("id, patient_id, visit_date, diagnosis, fee, chief_complaint, follow_up_date")
          .eq("doctor_user_id", userId)
          .order("visit_date", { ascending: false })
          .limit(50),
        supabase
          .from("vaidya_consultations")
          .select("id, patient_id, follow_up_date, diagnosis, visit_date")
          .eq("doctor_user_id", userId)
          .not("follow_up_date", "is", null)
          .gte("follow_up_date", today)
          .order("follow_up_date", { ascending: true })
          .limit(8),
      ]);

      const appts = (appointmentsRes as any).data ?? [];
      const apptUsers = new Set(appts.map((a: any) => a.user_id));
      const apptsToday = appts.filter((a: any) => a.appointment_date === today);

      const earnedTotal =
        (bills ?? []).reduce((s: number, b: any) => s + (b.total ?? 0), 0) +
        appts.filter((a: any) => a.payment_status === "paid").reduce((s: number, a: any) => s + (a.fee ?? 0), 0);

      const earnedToday =
        (bills ?? [])
          .filter((b: any) => (b.created_at ?? "").slice(0, 10) === today)
          .reduce((s: number, b: any) => s + (b.total ?? 0), 0) +
        apptsToday
          .filter((a: any) => a.payment_status === "paid")
          .reduce((s: number, a: any) => s + (a.fee ?? 0), 0);

      const outstanding = (bills ?? [])
        .filter((b: any) => (b.status ?? "").toLowerCase() === "due")
        .reduce((s: number, b: any) => s + (b.total ?? 0), 0);

      const lowStock = (stock ?? []).filter(
        (s: any) => s.quantity <= (s.low_stock_threshold ?? 5),
      ).length;

      const consultsToday = (consults ?? []).filter((c: any) => c.visit_date === today);

      // 14-day revenue series
      const map: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) map[daysAgo(i)] = 0;
      (bills ?? []).forEach((b: any) => {
        const d = (b.created_at ?? "").slice(0, 10);
        if (d in map) map[d] += b.total ?? 0;
      });
      appts
        .filter((a: any) => a.payment_status === "paid" && a.appointment_date in map)
        .forEach((a: any) => (map[a.appointment_date] += a.fee ?? 0));

      const seriesData = Object.entries(map).map(([day, revenue]) => ({
        day: day.slice(5),
        revenue,
      }));

      setStats({
        patients: (walkins ?? 0) + apptUsers.size,
        earnedTotal,
        earnedToday,
        apptsTotal: appts.length,
        apptsToday: apptsToday.length,
        consultsToday: consultsToday.length,
        pendingFollowUps: (pending ?? []).length,
        lowStock,
        outstanding,
      });
      setSeries(seriesData);
      setTodayConsults(consultsToday.slice(0, 5));
      setFollowUps(pending ?? []);

      // Patient lookup
      const allIds = Array.from(
        new Set(
          [...(consultsToday ?? []), ...(pending ?? [])]
            .map((x: any) => x.patient_id)
            .filter(Boolean),
        ),
      );
      if (allIds.length) {
        const { data: ps } = await supabase
          .from("vaidya_patients")
          .select("id, full_name, phone")
          .in("id", allIds);
        const m: Record<string, { name: string; phone?: string }> = {};
        (ps ?? []).forEach((p: any) => (m[p.id] = { name: p.full_name, phone: p.phone }));
        setPatientsMap(m);
      }
    })();
  }, [userId, doctor?.id]);

  // Generate AI insight when stats settle
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setInsightLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("vaidya-daily-insight", {
          body: { stats },
        });
        if (cancelled) return;
        if (error) throw error;
        setInsight(data?.insight || "");
      } catch (e: any) {
        if (!cancelled) setInsight("Tip: review today's pending follow-ups and confirm tomorrow's appointments early.");
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, stats.consultsToday, stats.pendingFollowUps, stats.lowStock]);

  const cards = useMemo(
    () => [
      { label: "Total Patients", value: stats.patients, icon: Users, tone: "from-primary/80 to-primary" },
      { label: "Earned (All Time)", value: fmtINR(stats.earnedTotal), icon: IndianRupee, tone: "from-emerald-500/80 to-emerald-600" },
      { label: "Earned Today", value: fmtINR(stats.earnedToday), icon: TrendingUp, tone: "from-rose-500/80 to-rose-600" },
      { label: "Appointments", value: stats.apptsTotal, icon: CalendarDays, tone: "from-sky-500/80 to-sky-600" },
      { label: "Today's Appointments", value: stats.apptsToday, icon: Clock, tone: "from-violet-500/80 to-violet-600" },
      { label: "Consultations Today", value: stats.consultsToday, icon: Stethoscope, tone: "from-indigo-500/80 to-indigo-600" },
      { label: "Pending Follow-ups", value: stats.pendingFollowUps, icon: HeartHandshake, tone: "from-amber-500/80 to-amber-600" },
      { label: "Low-stock Items", value: stats.lowStock, icon: Boxes, tone: "from-orange-500/80 to-orange-600" },
    ],
    [stats],
  );

  const quick = [
    { to: "/vaidya/consultations", label: "Consultations", icon: ReceiptText },
    { to: "/vaidya/patients", label: "Patients", icon: Users },
    { to: "/vaidya/inventory", label: "Inventory", icon: Boxes },
    { to: "/learning/library", label: "Ayuzee Library", icon: Activity },
    { to: "/vaidya/network", label: "Partner Network", icon: HeartHandshake },
  ];

  const waLink = (phone?: string, text?: string) => {
    if (!phone) return undefined;
    const clean = phone.replace(/\D/g, "");
    return `https://wa.me/${clean}?text=${encodeURIComponent(text ?? "")}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">
            Welcome, Dr. {doctor?.full_name?.split(" ")[0] || "Vaidya"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your clinical command center — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {stats.outstanding > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> {fmtINR(stats.outstanding)} outstanding
          </Badge>
        )}
      </div>

      {/* AI Insight */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">AI Daily Insight</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {insightLoading ? "Analyzing your day…" : insight || "Have a productive day!"}
            </p>
          </div>
        </div>
      </Card>

      {/* 8 Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className={`overflow-hidden bg-gradient-to-br ${c.tone} text-primary-foreground`}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider opacity-90">{c.label}</p>
                <c.icon className="h-4 w-4 opacity-90" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{c.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart + Today's consultations */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Revenue — last 14 days</h2>
              <p className="text-xs text-muted-foreground">Bills + paid appointments</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" /> {fmtINR(series.reduce((s, d) => s + d.revenue, 0))}
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: any) => [fmtINR(Number(v)), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Today's Consultations</h2>
            <Link to="/vaidya/consultations" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {todayConsults.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No consultations recorded today yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {todayConsults.map((c) => (
                <li key={c.id} className="rounded-lg border p-3 transition hover:border-primary/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {patientsMap[c.patient_id]?.name || "Patient"}
                    </p>
                    {c.fee ? <span className="text-xs font-semibold text-primary">{fmtINR(c.fee)}</span> : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {c.diagnosis || c.chief_complaint || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Follow-ups + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Pending Follow-ups</h2>
              <p className="text-xs text-muted-foreground">Reach out via WhatsApp in one tap</p>
            </div>
            <Link to="/vaidya/follow-up" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {followUps.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No upcoming follow-ups. 🎉
            </p>
          ) : (
            <ul className="divide-y">
              {followUps.map((f) => {
                const p = patientsMap[f.patient_id];
                const msg = `Namaste ${p?.name || ""}, this is a reminder for your follow-up on ${f.follow_up_date}. — Dr. ${doctor?.full_name?.split(" ")[0] || ""}`;
                const wa = waLink(p?.phone, msg);
                return (
                  <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p?.name || "Patient"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {f.diagnosis || "—"} · last visit {f.visit_date}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{f.follow_up_date}</span>
                      {wa ? (
                        <Button asChild size="sm" variant="outline" className="h-8 gap-1">
                          <a href={wa} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8" disabled>
                          No phone
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Quick actions</h2>
          <div className="space-y-2">
            {quick.map((q) => (
              <Link key={q.to} to={q.to}>
                <div className="flex items-center justify-between rounded-lg border p-3 transition hover:border-primary/40 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                      <q.icon className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-medium">{q.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VaidyaHome;
