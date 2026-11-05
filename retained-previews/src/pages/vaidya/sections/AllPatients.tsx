import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Phone, User } from "lucide-react";
import { toast } from "sonner";

interface Row {
  source: "appointment" | "manual";
  id: string;
  full_name: string | null;
  phone: string | null;
  appointments: number;
  last_visit?: string | null;
}

const AllPatients = () => {
  const { doctor, userId } = useDoctor();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", age: "", gender: "", address: "", notes: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const [appts, manuals] = await Promise.all([
      doctor?.id
        ? supabase.from("appointments").select("user_id, appointment_date").eq("doctor_id", doctor.id)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("vaidya_patients").select("*").eq("doctor_user_id", userId).order("created_at", { ascending: false }),
    ]);

    const apptIds = Array.from(new Set((appts.data ?? []).map((a: any) => a.user_id)));
    let profMap: Record<string, any> = {};
    if (apptIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", apptIds);
      (profs ?? []).forEach((p: any) => (profMap[p.user_id] = p));
    }

    const apptRows: Row[] = apptIds.map((uid) => {
      const list = (appts.data ?? []).filter((a: any) => a.user_id === uid);
      return {
        source: "appointment",
        id: uid,
        full_name: profMap[uid]?.full_name ?? "Patient",
        phone: profMap[uid]?.phone ?? null,
        appointments: list.length,
        last_visit: list.map((a: any) => a.appointment_date).sort().pop() ?? null,
      };
    });

    const manualRows: Row[] = (manuals.data ?? []).map((m: any) => ({
      source: "manual",
      id: m.id,
      full_name: m.full_name,
      phone: m.phone,
      appointments: 0,
    }));

    setRows([...apptRows, ...manualRows]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, doctor?.id]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) => r.full_name?.toLowerCase().includes(t) || r.phone?.toLowerCase().includes(t),
    );
  }, [rows, q]);

  const submit = async () => {
    if (!userId) return;
    if (form.full_name.trim().length < 2) return toast.error("Name required");
    const { error } = await supabase.from("vaidya_patients").insert({
      doctor_user_id: userId,
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Patient added");
    setOpen(false);
    setForm({ full_name: "", phone: "", age: "", gender: "", address: "", notes: "" });
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/80 to-primary p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-wider opacity-90">Number Of Patients</p>
          <p className="mt-2 font-display text-3xl font-bold">{rows.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-rose-500/80 to-rose-500 p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-wider opacity-90">Walk-in (manual)</p>
          <p className="mt-2 font-display text-3xl font-bold">{rows.filter((r) => r.source === "manual").length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-sky-500/80 to-sky-500 p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-wider opacity-90">From Appointments</p>
          <p className="mt-2 font-display text-3xl font-bold">{rows.filter((r) => r.source === "appointment").length}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Patients List</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" /> Add New Patient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add walk-in patient</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                </div>
                <div><Label>Gender</Label><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or phone" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">No patients yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Patient ID</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Contact</th>
                  <th className="py-2 pr-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const profileUrl = `/vaidya/patients/${r.source === "manual" ? "vaidya" : "user"}/${r.id}`;
                  return (
                    <tr key={`${r.source}-${r.id}`} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-3 pr-2">{i + 1}</td>
                      <td className="py-3 pr-2 font-mono text-xs">PT-{r.id.slice(0, 6).toUpperCase()}</td>
                      <td className="py-3 pr-2">
                        <Link to={profileUrl} className="flex items-center gap-2 text-primary hover:underline">
                          <User className="h-4 w-4" />{r.full_name}
                        </Link>
                      </td>
                      <td className="py-3 pr-2"><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone || "—"}</span></td>
                      <td className="py-3 pr-2 text-xs capitalize text-muted-foreground">{r.source === "manual" ? "Walk-in" : "Appointment"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AllPatients;
