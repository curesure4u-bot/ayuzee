import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Plus, Phone, Video, User } from "lucide-react";

type Appointment = {
  id: string;
  patient_name: string | null;
  scheduled_at: string;
  status: string;
  consultation_type: string | null;
  notes: string | null;
};

const HmsAppointments = () => {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("today");

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data } = await (supabase as any)
        .from("appointments")
        .select("id,patient_name,scheduled_at,status,consultation_type,notes")
        .eq("doctor_id", uid)
        .order("scheduled_at", { ascending: true })
        .limit(100);
      setAppts(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appts.filter((a) => a.scheduled_at?.startsWith(today));
  const upcoming = appts.filter((a) => a.scheduled_at > new Date().toISOString());
  const past = appts.filter((a) => a.scheduled_at < new Date().toISOString());

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-500" />;
      case "phone": return <Phone className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-purple-500" />;
    }
  };

  const renderList = (list: Appointment[]) => (
    list.length === 0 ? (
      <p className="py-8 text-center text-sm text-muted-foreground">No appointments found.</p>
    ) : (
      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30">
            <div className="flex items-center gap-3">
              {getTypeIcon(a.consultation_type)}
              <div>
                <p className="text-sm font-medium">{a.patient_name ?? "Patient"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.scheduled_at).toLocaleString("en-IN", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <Badge variant={
              a.status === "confirmed" ? "default" :
              a.status === "completed" ? "outline" :
              a.status === "cancelled" ? "destructive" : "secondary"
            }>
              {a.status}
            </Badge>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">{todayAppts.length} appointments today</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Book Appointment</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="today">Today ({todayAppts.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          <Card><CardContent className="p-4">{loading ? <p className="text-center text-sm text-muted-foreground py-8">Loading...</p> : renderList(todayAppts)}</CardContent></Card>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <Card><CardContent className="p-4">{renderList(upcoming)}</CardContent></Card>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <Card><CardContent className="p-4">{renderList(past)}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsAppointments;
