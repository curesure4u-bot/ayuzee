import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

const UpcomingAppointments = () => {
  const { doctor } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!doctor?.id) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctor.id)
        .gte("appointment_date", today)
        .order("appointment_date", { ascending: true });
      setItems(data ?? []);
      const ids = Array.from(new Set((data ?? []).map((a: any) => a.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", ids);
        const map: Record<string, any> = {};
        (profs ?? []).forEach((p: any) => (map[p.user_id] = p));
        setProfiles(map);
      }
    })();
  }, [doctor?.id]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <h1 className="font-display text-xl">Upcoming Appointments</h1>
        <Button variant="default" asChild><Link to="/doctor/appointments">Calendar View</Link></Button>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Currently you have no appointments!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{profiles[a.user_id]?.full_name || "Patient"}</p>
                <p className="text-xs text-muted-foreground">{profiles[a.user_id]?.phone || "—"} · {a.mode}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{a.appointment_date}</p>
                <p className="text-xs text-muted-foreground">{a.time_slot}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;
