import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { VenueContext } from "./VenueLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface SessionRow {
  id: string;
  scheduled_date: string;
  scheduled_start: string;
  scheduled_duration_minutes: number;
  therapy_name: string;
  patient_name: string;
  venue_room: string | null;
  status: string | null;
}

const VenueBookings = () => {
  const { venue } = useOutletContext<VenueContext>();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("therapy_sessions")
        .select("id, scheduled_date, scheduled_start, scheduled_duration_minutes, therapy_name, patient_name, venue_room, status")
        .eq("venue_id", venue.id)
        .order("scheduled_date", { ascending: false }).order("scheduled_start", { ascending: false });
      setSessions((data ?? []) as SessionRow[]);
      setLoading(false);
    })();
  }, [venue.id]);

  if (loading) return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">All sessions scheduled at your venue.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{sessions.length} total</CardTitle></CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Date / time</th>
                    <th className="text-left p-3">Room</th>
                    <th className="text-left p-3">Therapy</th>
                    <th className="text-left p-3">Patient</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">{new Date(s.scheduled_date).toLocaleDateString("en-IN")} · {s.scheduled_start.slice(0, 5)}</td>
                      <td className="p-3">{s.venue_room ?? "—"}</td>
                      <td className="p-3">{s.therapy_name}</td>
                      <td className="p-3">{s.patient_name}</td>
                      <td className="p-3"><Badge variant="outline" className="capitalize">{(s.status ?? "scheduled").replace(/_/g, " ")}</Badge></td>
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

export default VenueBookings;
