import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { VenueContext } from "./VenueLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck2, IndianRupee, DoorOpen, Star, Loader2 } from "lucide-react";

interface SessionRow {
  id: string;
  scheduled_date: string;
  scheduled_start: string;
  scheduled_duration_minutes: number;
  therapy_name: string;
  patient_name: string;
  venue_room: string | null;
  status: string | null;
  venue_earnings: number | null;
  therapist_id: string | null;
}

const statusVariant = (s?: string | null) => {
  switch (s) {
    case "completed": return "default";
    case "in_progress": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

const VenueDashboard = () => {
  const { venue } = useOutletContext<VenueContext>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, occupiedToday: 0, rating: 0 });
  const [today, setToday] = useState<SessionRow[]>([]);

  useEffect(() => {
    (async () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const monthStart = new Date(); monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split("T")[0];

      const [{ data: monthSessions }, { data: todaySessions }, { data: venueRow }] = await Promise.all([
        supabase.from("therapy_sessions").select("id, venue_earnings, status").eq("venue_id", venue.id).gte("scheduled_date", monthStartStr),
        supabase.from("therapy_sessions").select("id, scheduled_date, scheduled_start, scheduled_duration_minutes, therapy_name, patient_name, venue_room, status, venue_earnings, therapist_id").eq("venue_id", venue.id).eq("scheduled_date", todayStr).order("scheduled_start"),
        supabase.from("therapy_venues").select("rating").eq("id", venue.id).maybeSingle(),
      ]);

      const bookings = monthSessions?.length ?? 0;
      const revenue = monthSessions?.reduce((s, r: any) => s + Number(r.venue_earnings ?? 0), 0) ?? 0;
      const occupiedRooms = new Set((todaySessions ?? []).filter((r: any) => r.status !== "cancelled").map((r: any) => r.venue_room)).size;

      setStats({ bookings, revenue, occupiedToday: occupiedRooms, rating: venueRow?.rating ?? 0 });
      setToday((todaySessions ?? []) as SessionRow[]);
      setLoading(false);
    })();
  }, [venue.id]);

  if (loading) return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {venue.name}</h1>
        <p className="text-muted-foreground">Here's how your venue is performing this month.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck2} label="Bookings (month)" value={String(stats.bookings)} />
        <StatCard icon={IndianRupee} label="Revenue (month)" value={`₹${stats.revenue.toLocaleString("en-IN")}`} />
        <StatCard icon={DoorOpen} label="Rooms occupied today" value={String(stats.occupiedToday)} />
        <StatCard icon={Star} label="Average rating" value={stats.rating ? stats.rating.toFixed(1) : "—"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Today's bookings</CardTitle></CardHeader>
        <CardContent className="p-0">
          {today.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No bookings scheduled today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Room</th>
                    <th className="text-left p-3">Therapy</th>
                    <th className="text-left p-3">Patient</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {today.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">{s.scheduled_start?.slice(0, 5)}</td>
                      <td className="p-3">{s.venue_room ?? "—"}</td>
                      <td className="p-3">{s.therapy_name}</td>
                      <td className="p-3">{s.patient_name}</td>
                      <td className="p-3"><Badge variant={statusVariant(s.status)} className="capitalize">{(s.status ?? "scheduled").replace(/_/g, " ")}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <Card><CardContent className="p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs"><Icon className="h-4 w-4" />{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </CardContent></Card>
);

export default VenueDashboard;
