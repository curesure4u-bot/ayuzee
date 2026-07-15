import { useEffect, useMemo, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Phone, ArrowUpDown, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface Patient {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  appointments_count: number;
  last_visit: string | null;
}

const maskPhone = (p?: string | null) =>
  !p ? "—" : p.length > 4 ? `${p.slice(0, 2)}XXXXXX${p.slice(-2)}` : p;

const MyPatients = () => {
  const { doctor } = useDoctor();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctor?.id) return;
    (async () => {
      setLoading(true);
      const { data: appts } = await supabase
        .from("appointments")
        .select("user_id, appointment_date")
        .eq("doctor_id", doctor.id);
      const userIds = Array.from(new Set((appts ?? []).map((a) => a.user_id)));
      if (!userIds.length) { setPatients([]); setLoading(false); return; }
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);
      const list: Patient[] = userIds.map((uid) => {
        const userAppts = (appts ?? []).filter((a) => a.user_id === uid);
        const last = userAppts.map((a) => a.appointment_date).sort().pop() ?? null;
        const p = (profs ?? []).find((x) => x.user_id === uid);
        return {
          user_id: uid,
          full_name: p?.full_name ?? null,
          phone: p?.phone ?? null,
          appointments_count: userAppts.length,
          last_visit: last,
        };
      });
      setPatients(list);
      setLoading(false);
    })();
  }, [doctor?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = patients.filter((p) =>
      !q ||
      p.full_name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.user_id.toLowerCase().includes(q),
    );
    list = [...list].sort((a, b) => {
      const A = a.last_visit ?? "";
      const B = b.last_visit ?? "";
      return sortDesc ? B.localeCompare(A) : A.localeCompare(B);
    });
    return list;
  }, [patients, search, sortDesc]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/doctor"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-2xl">My Patients</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Patient"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <p className="mt-1 text-xs text-muted-foreground">Search by Name, Mobile No. & Patient ID</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setSortDesc((s) => !s)} title="Sort by last visit">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading patients…</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 font-display text-xl">No patients yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Patients will appear here once they book an appointment with you.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.user_id} className="p-4 transition hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">
                    {p.full_name || "Patient"}{" "}
                    <span className="text-xs text-muted-foreground">
                      (PT-{p.user_id.slice(0, 6).toUpperCase()})
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.appointments_count} appointment{p.appointments_count !== 1 && "s"}
                    {p.last_visit && ` • last visit ${p.last_visit}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-mono">{maskPhone(p.phone)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPatients;
