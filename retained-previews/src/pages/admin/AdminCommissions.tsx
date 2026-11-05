import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Split = { key: string; value: number; description?: string | null };
type Doctor = { id: string; full_name: string; specialization: string; city: string; commission_rate: number };
type Payout = { id: string; requester_user_id: string; type: string; amount: number; status: string; created_at: string; admin_note?: string | null; notes?: string | null; therapist_id?: string | null; venue_id?: string | null; recipient_name?: string | null; bank_details?: unknown; name?: string; bank?: string };
const splitKeys = ["therapist_percent", "venue_percent", "doctor_referral_percent", "platform_percent"];
const labels: Record<string, string> = { therapist_percent: "Therapist %", venue_percent: "Venue %", doctor_referral_percent: "Doctor Referral %", platform_percent: "Platform %" };
const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const AdminCommissions = () => {
  usePageSEO({ title: "Commissions — Admin", noIndex: true });
  const [splits, setSplits] = useState<Record<string, string>>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<Payout | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const [splitRes, doctorRes, payoutRes] = await Promise.all([
      (supabase as any).from("revenue_split_config").select("key,value,description").in("key", splitKeys),
      supabase.from("doctors").select("id,full_name,specialization,city,commission_rate").order("full_name"),
      (supabase as any).from("payout_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    if (splitRes.error) toast.error(splitRes.error.message);
    if (doctorRes.error) toast.error(doctorRes.error.message);
    if (payoutRes.error) toast.error(payoutRes.error.message);
    const splitRows = (splitRes.data ?? []) as Split[];
    const draft = Object.fromEntries(splitKeys.map((k) => [k, String(splitRows.find((r) => r.key === k)?.value ?? 0)]));
    setSplits(draft);
    setDoctors((doctorRes.data ?? []) as Doctor[]);
    const payoutRows = (payoutRes.data ?? []) as Payout[];
    const ids = [...new Set(payoutRows.map((p) => p.requester_user_id).filter(Boolean))];
    const { data: profiles } = ids.length ? await supabase.from("profiles").select("user_id,full_name").in("user_id", ids) : { data: [] } as any;
    const map = new Map<string, string>((profiles ?? []).map((p: any) => [p.user_id, p.full_name || "Partner"]));
    setPayouts(payoutRows.map((p) => ({ ...p, name: p.recipient_name || map.get(p.requester_user_id) || "Partner", bank: last4((p as any).bank_details || p.notes) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  const total = useMemo(() => splitKeys.reduce((sum, k) => sum + Number(splits[k] || 0), 0), [splits]);

  const saveSplits = async () => {
    if (Math.abs(total - 100) > 0.01) return toast.error("Revenue split must total 100%");
    for (const key of splitKeys) await (supabase as any).from("revenue_split_config").upsert({ key, value: Number(splits[key] || 0) });
    toast.success("Commission settings saved. Applies to new sessions only.");
    load();
  };
  const saveDoctorRate = async (id: string, rate: number) => {
    const { error } = await supabase.from("doctors").update({ commission_rate: rate }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Doctor commission updated");
  };
  const approve = async (p: Payout) => {
    await supabase.functions.invoke("process-payout", { body: { payout_request_id: p.id } });
    const { error } = await (supabase as any).from("payout_requests").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Payout approved"); load();
  };
  const reject = async () => {
    if (!rejectFor) return;
    const { error } = await (supabase as any).from("payout_requests").update({ status: "rejected", admin_note: reason }).eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    toast.success("Payout rejected"); setRejectFor(null); setReason(""); load();
  };

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return <div className="space-y-6"><div><h1 className="font-display text-3xl">Commissions & Payouts</h1><p className="text-sm text-muted-foreground">Configure revenue splits and review pending payout requests.</p></div>
    <Card><CardHeader><CardTitle>Commission Settings</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-4">{splitKeys.map((key) => <div key={key}><Label>{labels[key]}</Label><Input type="number" value={splits[key] ?? ""} onChange={(e) => setSplits({ ...splits, [key]: e.target.value })} /></div>)}</div><p className={Math.abs(total - 100) > 0.01 ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>Total: {total}% · applies to new sessions only.</p><Button onClick={saveSplits} disabled={Math.abs(total - 100) > 0.01}>Save settings</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Doctor commission rates</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Specialization</TableHead><TableHead>City</TableHead><TableHead>Commission %</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{doctors.map((d) => <DoctorRow key={d.id} doctor={d} onSave={saveDoctorRate} />)}</TableBody></Table></CardContent></Card>
    <Card><CardHeader><CardTitle>Pending Payout Requests</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Bank</TableHead><TableHead>Requested</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{payouts.map((p) => <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell><Badge variant="outline">{p.type}</Badge></TableCell><TableCell className="text-right font-semibold">{money(p.amount)}</TableCell><TableCell>{p.bank || "—"}</TableCell><TableCell>{new Date(p.created_at).toLocaleDateString("en-IN")}</TableCell><TableCell className="text-right space-x-2"><Button size="sm" onClick={() => approve(p)}>Approve</Button><Button size="sm" variant="outline" onClick={() => setRejectFor(p)}>Reject</Button></TableCell></TableRow>)}{payouts.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No pending payouts.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}><DialogContent><DialogHeader><DialogTitle>Reject payout</DialogTitle></DialogHeader><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" /><DialogFooter><Button variant="outline" onClick={() => setRejectFor(null)}>Back</Button><Button variant="destructive" onClick={reject}>Reject</Button></DialogFooter></DialogContent></Dialog>
  </div>;
};
const DoctorRow = ({ doctor, onSave }: { doctor: Doctor; onSave: (id: string, rate: number) => void }) => { const [rate, setRate] = useState(String(doctor.commission_rate ?? 0)); return <TableRow><TableCell>{doctor.full_name}</TableCell><TableCell>{doctor.specialization}</TableCell><TableCell>{doctor.city}</TableCell><TableCell><Input type="number" className="w-24" value={rate} onChange={(e) => setRate(e.target.value)} /></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => onSave(doctor.id, Number(rate))}>Save</Button></TableCell></TableRow>; };
const last4 = (v: unknown) => { const s = typeof v === "string" ? v : JSON.stringify(v ?? ""); const m = s.match(/\d{4}(?!.*\d)/); return m ? `•••• ${m[0]}` : "—"; };
export default AdminCommissions;
