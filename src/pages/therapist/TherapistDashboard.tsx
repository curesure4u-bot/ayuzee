import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CalendarCheck, IndianRupee, Star, Activity, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { TherapistContext } from "./TherapistLayout";

interface SessionRow {
  id: string;
  patient_name: string;
  therapy_name: string;
  scheduled_start: string;
  scheduled_date: string;
  status: string;
  venue_name?: string | null;
}

const TherapistDashboard = () => {
  const { therapist, reload } = useOutletContext<TherapistContext>();
  const [stats, setStats] = useState({ today: 0, weekEarn: 0, rating: 0, total: 0 });
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Therapist Dashboard | Ayuzee";
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [{ data: todays }, { data: weekData }, { data: tInfo }] = await Promise.all([
        supabase.from("therapy_sessions")
          .select("id, patient_name, therapy_name, scheduled_start, scheduled_date, status, therapy_venues(name)")
          .eq("therapist_id", therapist.id).eq("scheduled_date", today).order("scheduled_start"),
        supabase.from("therapy_sessions")
          .select("therapist_earnings, status, created_at")
          .eq("therapist_id", therapist.id).eq("status", "completed").gte("created_at", weekAgo),
        supabase.from("therapists").select("rating, total_sessions").eq("id", therapist.id).maybeSingle(),
      ]);

      const list: SessionRow[] = (todays ?? []).map((s: any) => ({
        id: s.id, patient_name: s.patient_name, therapy_name: s.therapy_name,
        scheduled_start: s.scheduled_start, scheduled_date: s.scheduled_date, status: s.status,
        venue_name: s.therapy_venues?.name ?? null,
      }));
      setSessions(list);
      setStats({
        today: list.length,
        weekEarn: (weekData ?? []).reduce((acc: number, r: any) => acc + Number(r.therapist_earnings || 0), 0),
        rating: Number(tInfo?.rating ?? 0),
        total: tInfo?.total_sessions ?? 0,
      });
      setLoading(false);
    })();
  }, [therapist.id]);

  const toggle = async (next: boolean) => {
    const { error } = await supabase.from("therapists").update({ is_available: next }).eq("id", therapist.id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    await reload();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {therapist.full_name.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-sm">Here's how today is shaping up.</p>
      </div>

      {!therapist.is_available && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">You're currently offline</div>
              <div className="text-sm text-muted-foreground">Go online to receive new session assignments.</div>
            </div>
            <div className="flex items-center gap-2"><span className="text-sm">Go online</span><Switch checked={false} onCheckedChange={() => toggle(true)} /></div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Today's sessions" value={stats.today.toString()} />
        <StatCard icon={IndianRupee} label="This week" value={`₹${stats.weekEarn.toLocaleString("en-IN")}`} />
        <StatCard icon={Star} label="Rating" value={stats.rating.toFixed(1)} />
        <StatCard icon={Activity} label="Total sessions" value={stats.total.toString()} />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today's schedule</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/therapist/sessions">View all</Link></Button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No sessions scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <Link key={s.id} to="/therapist/sessions" className="flex items-center justify-between gap-4 p-3 border rounded-lg hover:border-primary/40 transition">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.patient_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.therapy_name} · {s.venue_name ?? "Venue TBD"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono">{s.scheduled_start.slice(0, 5)}</div>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{s.status.replace(/_/g, " ")}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Card><CardContent className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </div>
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="h-5 w-5" /></div>
    </div>
  </CardContent></Card>
);

export default TherapistDashboard;
