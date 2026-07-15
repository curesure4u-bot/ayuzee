import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Video, Building2, Plus } from "lucide-react";

interface Appt {
  id: string;
  appointment_date: string;
  time_slot: string;
  mode: string;
  status: string;
  fee: number;
  doctors: { full_name: string; specialization: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-secondary/15 text-secondary",
  confirmed: "bg-primary/10 text-primary",
  scheduled: "bg-primary/10 text-primary",
  consulted: "bg-emerald-500/15 text-emerald-700",
  completed: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const PatientAppointmentsList = () => {
  usePageSEO({ title: "My Appointments — Ayuzee", noIndex: true });
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date_desc");

  useEffect(() => { supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      const { data: rows } = await supabase
        .from("appointments")
        .select("id, appointment_date, time_slot, mode, status, fee, doctors(full_name, specialization)")
        .eq("user_id", uid)
        .order("appointment_date", { ascending: false });
      setAppts((rows as unknown as Appt[]) ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...appts];
    if (status !== "all") list = list.filter((a) => a.status === status);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((a) =>
        `${a.doctors?.full_name ?? ""} ${a.doctors?.specialization ?? ""}`.toLowerCase().includes(s),
      );
    }
    list.sort((a, b) => {
      const da = +new Date(a.appointment_date);
      const db = +new Date(b.appointment_date);
      return sort === "date_asc" ? da - db : db - da;
    });
    return list;
  }, [appts, q, status, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">My Appointments</h1>
          <p className="text-sm text-muted-foreground">Track your past and upcoming consultations</p>
        </div>
        <Button variant="hero" asChild><Link to="/doctors"><Plus className="mr-1 h-4 w-4" />Book Appointment</Link></Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search doctor or specialization" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Scheduled</SelectItem>
              <SelectItem value="completed">Consulted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest first</SelectItem>
              <SelectItem value="date_asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No appointments found</p>
            <Button asChild variant="hero" className="mt-5"><Link to="/doctors">Book your first consultation</Link></Button>
          </div>
        ) : (
          filtered.map((a) => (
            <article key={a.id} className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                  {a.mode === "video" ? <Video className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${a.fee === 0 ? "bg-emerald-500/15 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                      {a.fee === 0 ? "Free" : "Paid"}
                    </span>
                    <span className="text-xs text-muted-foreground">ID #{a.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="mt-1 font-semibold">{a.doctors?.full_name ?? "Doctor"}</h3>
                  <p className="text-sm text-muted-foreground">{a.doctors?.specialization}</p>
                  <p className="mt-1 text-sm">
                    {new Date(a.appointment_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {a.time_slot} · {a.mode === "video" ? "Video" : "In-clinic"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status] || "bg-muted text-muted-foreground"}`}>
                  {a.status}
                </span>
                <span className="font-display text-lg">₹{a.fee}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentsList;
