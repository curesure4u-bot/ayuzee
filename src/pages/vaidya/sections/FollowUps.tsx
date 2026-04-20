import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

const FollowUps = () => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [patients, setPatients] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("vaidya_consultations")
        .select("*")
        .eq("doctor_user_id", userId)
        .not("follow_up_date", "is", null)
        .gte("follow_up_date", today)
        .order("follow_up_date", { ascending: true });
      setItems(data ?? []);
      const ids = Array.from(new Set((data ?? []).map((d: any) => d.patient_id).filter(Boolean)));
      if (ids.length) {
        const { data: ps } = await supabase.from("vaidya_patients").select("id, full_name").in("id", ids);
        const map: Record<string, string> = {};
        (ps ?? []).forEach((p: any) => (map[p.id] = p.full_name));
        setPatients(map);
      }
    })();
  }, [userId]);

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-3xl p-12 text-center">
        <CalendarCheck className="mx-auto h-14 w-14 text-muted-foreground" />
        <p className="mt-4 font-display text-xl text-muted-foreground">There is no follow up right now…</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-2">
      <h1 className="font-display text-2xl">Follow-up list</h1>
      {items.map((c) => (
        <Card key={c.id} className="flex items-center justify-between p-4">
          <div>
            <p className="font-semibold">{patients[c.patient_id] || "Patient"}</p>
            <p className="text-xs text-muted-foreground">{c.diagnosis || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{c.follow_up_date}</p>
            <p className="text-xs text-muted-foreground">Last visit: {c.visit_date}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FollowUps;
