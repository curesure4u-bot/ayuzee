import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Session {
  id: string; therapy_name: string; therapy_code: string; status: string;
  scheduled_date: string; scheduled_start: string; scheduled_duration_minutes: number; actual_duration_minutes: number | null;
  patient_name: string; total_amount: number; payment_status: string; razorpay_payment_id: string | null;
  patient_user_id: string | null;
  therapists: { id: string; full_name: string } | null;
  therapy_venues: { id: string; name: string } | null;
}
interface TherapistOpt { id: string; full_name: string; allowed_therapies: string[]; }

const STATUSES = ["scheduled", "therapist_assigned", "in_progress", "completed", "cancelled"];

const AdminTherapySessions = () => {
  usePageSEO({ title: "Therapy Sessions — Admin", noIndex: true });
  const [list, setList] = useState<Session[]>([]);
  const [therapists, setTherapists] = useState<TherapistOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reassignFor, setReassignFor] = useState<Session | null>(null);
  const [newTherapistId, setNewTherapistId] = useState("");
  const [cancelFor, setCancelFor] = useState<Session | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("therapy_sessions")
      .select("id, therapy_name, therapy_code, status, scheduled_date, scheduled_start, scheduled_duration_minutes, actual_duration_minutes, patient_name, patient_user_id, total_amount, payment_status, razorpay_payment_id, therapists(id, full_name), therapy_venues(id, name)")
      .order("scheduled_date", { ascending: false }).limit(200);
    setList((data ?? []) as unknown as Session[]);
    const { data: ts } = await supabase.from("therapists").select("id, full_name, allowed_therapies").eq("is_verified", true).eq("verification_status", "approved");
    setTherapists((ts ?? []) as TherapistOpt[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => list.filter(s => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !`${s.patient_name} ${s.therapy_name} ${s.therapists?.full_name ?? ""} ${s.therapy_venues?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [list, statusFilter, search]);

  const reassign = async () => {
    if (!reassignFor || !newTherapistId) return;
    const { error } = await supabase.from("therapy_sessions").update({ therapist_id: newTherapistId, status: "therapist_assigned" }).eq("id", reassignFor.id);
    if (error) return toast.error(error.message);
    toast.success("Therapist reassigned");
    setReassignFor(null); setNewTherapistId(""); load();
  };

  const cancel = async () => {
    if (!cancelFor) return;
    const { error } = await supabase.from("therapy_sessions").update({ status: "cancelled", payment_status: cancelFor.payment_status === "paid" ? "refund_pending" : cancelFor.payment_status }).eq("id", cancelFor.id);
    if (error) return toast.error(error.message);
    if (cancelFor.payment_status === "paid") {
      await supabase.from("refund_requests").insert({
        session_id: cancelFor.id,
        patient_user_id: cancelFor.patient_user_id,
        amount: cancelFor.total_amount,
        razorpay_payment_id: cancelFor.razorpay_payment_id,
        reason: cancelReason,
      });
    }
    toast.success("Session cancelled");
    setCancelFor(null); setCancelReason(""); load();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Therapy Sessions</h1><p className="text-sm text-muted-foreground">Monitor, reassign, or cancel therapy sessions.</p></div>
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Search patient / therapist / venue / therapy" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Date / Time</th>
                  <th className="text-left p-3">Patient</th>
                  <th className="text-left p-3">Therapy</th>
                  <th className="text-left p-3">Therapist</th>
                  <th className="text-left p-3">Venue</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">No sessions.</td></tr>}
                {filtered.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 whitespace-nowrap">{s.scheduled_date}<div className="text-xs text-muted-foreground">{s.scheduled_start.slice(0, 5)}</div></td>
                    <td className="p-3">{s.patient_name}</td>
                    <td className="p-3">{s.therapy_name}<div className="text-xs text-muted-foreground">{s.therapy_code}</div></td>
                    <td className="p-3">{s.therapists?.full_name ?? "—"}</td>
                    <td className="p-3">{s.therapy_venues?.name ?? "—"}</td>
                    <td className="p-3 whitespace-nowrap">{s.actual_duration_minutes ?? s.scheduled_duration_minutes} min</td>
                    <td className="p-3 text-right whitespace-nowrap">₹{Number(s.total_amount).toLocaleString("en-IN")}<div className="text-xs text-muted-foreground">{s.payment_status}</div></td>
                    <td className="p-3"><Badge variant="outline" className="capitalize text-[10px]">{s.status.replace(/_/g, " ")}</Badge></td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      {s.status !== "completed" && s.status !== "cancelled" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setReassignFor(s); setNewTherapistId(""); }}>Reassign</Button>
                          <Button size="sm" variant="destructive" onClick={() => { setCancelFor(s); setCancelReason(""); }}>Cancel</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      <Dialog open={!!reassignFor} onOpenChange={(o) => !o && setReassignFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reassign therapist</DialogTitle></DialogHeader>
          <Select value={newTherapistId} onValueChange={setNewTherapistId}>
            <SelectTrigger><SelectValue placeholder="Choose therapist" /></SelectTrigger>
            <SelectContent>
              {therapists.filter(t => !reassignFor || t.allowed_therapies.includes(reassignFor.therapy_code)).map(t => (
                <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignFor(null)}>Cancel</Button>
            <Button onClick={reassign} disabled={!newTherapistId}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelFor} onOpenChange={(o) => !o && setCancelFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel session</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{cancelFor?.payment_status === "paid" ? "Payment is paid — a refund will be queued (status: refund_pending)." : "No refund needed."}</p>
          <Input placeholder="Reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelFor(null)}>Back</Button>
            <Button variant="destructive" onClick={cancel}>Cancel session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTherapySessions;
