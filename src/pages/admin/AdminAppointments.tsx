import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Appointment = {
  id: string; user_id: string; appointment_date: string; time_slot: string; mode: string; status: string;
  payment_status: string; fee: number; razorpay_payment_id: string | null; zoom_join_url?: string | null;
  doctors?: { full_name: string } | null; patient?: { full_name?: string | null; email?: string | null } | null;
};

const statuses = ["scheduled", "confirmed", "completed", "cancelled"];
const todayIso = () => new Date().toISOString().slice(0, 10);
const inThisWeek = (date: string) => {
  usePageSEO({ title: "Appointments — Admin", noIndex: true });
  const d = new Date(date); const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(start.getDate() + 7); return d >= start && d < end;
};
const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const AdminAppointments = () => {
  const [rows, setRows] = useState<Appointment[]>([]); const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all"); const [mode, setMode] = useState("all"); const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [doctorSearch, setDoctorSearch] = useState("");
  const [cancelFor, setCancelFor] = useState<Appointment | null>(null); const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("appointments").select("*, doctors(full_name)").order("appointment_date", { ascending: false }).limit(300);
    if (error) toast.error(error.message);
    const appts = (data ?? []) as Appointment[];
    const ids = [...new Set(appts.map((a) => a.user_id).filter(Boolean))];
    const { data: profiles } = ids.length ? await supabase.from("profiles").select("user_id,full_name,email").in("user_id", ids) : { data: [] } as any;
    const map = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    setRows(appts.map((a) => ({ ...a, patient: map.get(a.user_id) ?? null })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((a) => {
    if (status !== "all" && a.status !== status) return false;
    if (mode !== "all" && a.mode !== mode) return false;
    if (from && a.appointment_date < from) return false;
    if (to && a.appointment_date > to) return false;
    if (doctorSearch && !(a.doctors?.full_name ?? "").toLowerCase().includes(doctorSearch.toLowerCase())) return false;
    return true;
  }), [rows, status, mode, from, to, doctorSearch]);

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await (supabase as any).from("appointments").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Appointment updated"); load();
  };
  const refund = async (a: Appointment) => {
    await update(a.id, { payment_status: "refund_pending" });
    toast.info("Marked for manual Razorpay refund review");
  };

  return <div className="space-y-6">
    <div><h1 className="font-display text-3xl">Appointments</h1><p className="text-sm text-muted-foreground">Manage consultations, confirmations, cancellations, and refunds.</p></div>
    <div className="grid gap-4 md:grid-cols-3"><Stat label="Today's appointments" value={rows.filter(r => r.appointment_date === todayIso()).length} /><Stat label="Pending confirmation" value={rows.filter(r => r.status === "scheduled").length} /><Stat label="Completed this week" value={rows.filter(r => r.status === "completed" && inThisWeek(r.appointment_date)).length} /></div>
    <Card><CardContent className="flex flex-wrap gap-3 p-4">
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select>
      <Select value={mode} onValueChange={setMode}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All modes</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="in-clinic">In-clinic</SelectItem></SelectContent></Select>
      <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
      <Input placeholder="Search doctor" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} className="max-w-xs" />
    </CardContent></Card>
    <Card><CardContent className="p-0">{loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : <Table><TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Zoom</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map(a => <TableRow key={a.id}><TableCell>{a.patient?.full_name || "Patient"}</TableCell><TableCell>{a.doctors?.full_name ?? "—"}</TableCell><TableCell>{a.appointment_date}</TableCell><TableCell>{a.time_slot}</TableCell><TableCell><Badge variant="outline" className="capitalize">{a.mode}</Badge></TableCell><TableCell><Badge className="capitalize" variant={a.status === "cancelled" ? "destructive" : "secondary"}>{a.status}</Badge></TableCell><TableCell><Badge variant={a.payment_status === "paid" ? "default" : "outline"}>{a.payment_status}</Badge></TableCell><TableCell className="text-right font-semibold">{money(a.fee)}</TableCell><TableCell>{a.zoom_join_url ? <Button asChild size="sm" variant="ghost"><a href={a.zoom_join_url} target="_blank" rel="noreferrer"><ExternalLink /></a></Button> : "—"}</TableCell><TableCell className="space-x-1 text-right whitespace-nowrap">{a.status === "scheduled" && <Button size="sm" onClick={() => update(a.id, { status: "confirmed" })}>Confirm</Button>}{a.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => setCancelFor(a)}>Cancel</Button>}{a.status === "cancelled" && a.payment_status === "paid" && <Button size="sm" variant="destructive" onClick={() => refund(a)}>Refund</Button>}</TableCell></TableRow>)}{filtered.length === 0 && <TableRow><TableCell colSpan={10} className="py-8 text-center text-muted-foreground">No appointments found.</TableCell></TableRow>}</TableBody></Table>}</CardContent></Card>
    <Dialog open={!!cancelFor} onOpenChange={(o) => !o && setCancelFor(null)}><DialogContent><DialogHeader><DialogTitle>Cancel appointment</DialogTitle></DialogHeader><Textarea placeholder="Cancellation reason" value={reason} onChange={(e) => setReason(e.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setCancelFor(null)}>Back</Button><Button variant="destructive" onClick={() => { if (cancelFor) update(cancelFor.id, { status: "cancelled", notes: reason }); setCancelFor(null); setReason(""); }}>Cancel appointment</Button></DialogFooter></DialogContent></Dialog>
  </div>;
};
const Stat = ({ label, value }: { label: string; value: number }) => <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></CardContent></Card>;
export default AdminAppointments;
