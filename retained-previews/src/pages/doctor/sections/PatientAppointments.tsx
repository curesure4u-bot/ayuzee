import { useEffect, useMemo, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Plus, Video, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Appt {
  id: string;
  user_id: string;
  appointment_date: string;
  time_slot: string;
  mode: string;
  fee: number;
  status: string;
  payment_status: string;
}
interface PatientInfo { user_id: string; full_name: string | null; phone: string | null }

const PatientAppointments = () => {
  const { doctor } = useDoctor();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientInfo>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!doctor?.id) return;
    (async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctor.id)
        .order("appointment_date", { ascending: false });
      const list = (data ?? []) as Appt[];
      setAppts(list);
      const ids = Array.from(new Set(list.map((a) => a.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", ids);
        const map: Record<string, PatientInfo> = {};
        (profs ?? []).forEach((p) => { map[p.user_id] = p as PatientInfo; });
        setPatients(map);
      }
    })();
  }, [doctor?.id]);

  const todayKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const apptsForDay = useMemo(
    () => appts.filter((a) => a.appointment_date === todayKey),
    [appts, todayKey],
  );
  const filteredAppts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appts;
    return appts.filter((a) => {
      const p = patients[a.user_id];
      return (
        p?.full_name?.toLowerCase().includes(q) ||
        p?.phone?.toLowerCase().includes(q)
      );
    });
  }, [appts, search, patients]);

  const datesWithAppts = useMemo(
    () => new Set(appts.map((a) => a.appointment_date)),
    [appts],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/doctor"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-2xl">Appointment Calendar</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile no."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/doctor/patients"><Plus className="mr-1 h-4 w-4" /> Create Appointment</Link>
          </Button>
          <Button variant="link" size="sm" onClick={() => setSelectedDate(undefined)}>
            View All Appointments
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasAppt: (d) => datesWithAppts.has(format(d, "yyyy-MM-dd")) }}
            modifiersClassNames={{ hasAppt: "bg-primary/10 text-primary font-semibold" }}
            className="p-0 pointer-events-auto"
          />
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">
              {selectedDate ? `Appointments on ${format(selectedDate, "PPP")}` : "All appointments"}
            </h2>
            <Badge variant="secondary">{(selectedDate ? apptsForDay : filteredAppts).length}</Badge>
          </div>

          {(selectedDate ? apptsForDay : filteredAppts).length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No appointments for {selectedDate ? "this day" : "your filter"}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-2">S.No.</th>
                    <th className="py-2 pr-2">Apt. Time</th>
                    <th className="py-2 pr-2">Patient</th>
                    <th className="py-2 pr-2">Mode</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Meeting</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedDate ? apptsForDay : filteredAppts).map((a, i) => {
                    const p = patients[a.user_id];
                    return (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-3 pr-2">{i + 1}</td>
                        <td className="py-3 pr-2 font-medium">{a.time_slot}</td>
                        <td className="py-3 pr-2">
                          <div className="font-medium">{p?.full_name || "Patient"}</div>
                          <div className="text-xs text-muted-foreground">{p?.phone || "—"}</div>
                        </td>
                        <td className="py-3 pr-2 capitalize">
                          <span className="inline-flex items-center gap-1">
                            {a.mode === "video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            {a.mode}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <Badge variant={a.status === "confirmed" ? "default" : "secondary"}>{a.status}</Badge>
                        </td>
                        <td className="py-3 pr-2">
                          {a.mode === "video" && a.status === "confirmed" ? (
                            <Button size="sm" variant="link" className="h-auto p-0">
                              <ExternalLink className="mr-1 h-3 w-3" /> Join
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatientAppointments;
