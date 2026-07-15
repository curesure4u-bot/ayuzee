import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Doctor = { id: string; user_id: string | null; full_name: string; specialization: string; city: string; state?: string | null; created_at: string; verification_status: string; is_verified: boolean; phone: string | null; commission_rate?: number; is_suspended?: boolean; rejection_reason: string | null; hms_access?: boolean; hms_branch?: string | null; hms_center_type?: string | null };
const tabs = ["all", "pending", "approved", "rejected", "suspended"];
const CENTER_TYPES = [
  { value: "main_hospital", label: "Main Hospital" },
  { value: "branch", label: "Branch" },
  { value: "franchisee", label: "Franchisee" },
  { value: "exclusive_center", label: "Exclusive Center" },
];
const statusOf = (d: Doctor) => d.is_suspended ? "suspended" : d.verification_status === "approved" || d.is_verified ? "approved" : d.verification_status === "rejected" ? "rejected" : "pending";

const AdminDoctors = () => {
  usePageSEO({ title: "Admin · Doctors — Ayuzee", noIndex: true });
  const [rows, setRows] = useState<Doctor[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [rejectFor, setRejectFor] = useState<Doctor | null>(null);
  const [reason, setReason] = useState("");
  const [commissions, setCommissions] = useState<Record<string, string>>({});
  const [hmsFor, setHmsFor] = useState<Doctor | null>(null);
  const [hmsBranch, setHmsBranch] = useState("");
  const [hmsType, setHmsType] = useState("");

  const load = async () => {
    const { data, error } = await (supabase as any).from("doctors").select("*").order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows((data ?? []) as Doctor[]);
    setCommissions(Object.fromEntries(((data ?? []) as Doctor[]).map((d) => [d.id, String(d.commission_rate ?? 0)])));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((d) => (tab === "all" || statusOf(d) === tab) && (!query || `${d.full_name} ${d.specialization} ${d.city} ${d.state ?? ""}`.toLowerCase().includes(query.toLowerCase()))), [rows, tab, query]);
  const counts = { total: rows.length, pending: rows.filter((d) => statusOf(d) === "pending").length, approved: rows.filter((d) => statusOf(d) === "approved").length, rejected: rows.filter((d) => statusOf(d) === "rejected").length };

  const notify = (phone: string | null, message: string) => phone ? supabase.functions.invoke("send-whatsapp", { body: { to: phone, message } }) : Promise.resolve();
  const approve = async (d: Doctor) => {
    const [doctorUpdate, roleInsert] = await Promise.all([
      (supabase as any).from("doctors").update({ is_verified: true, is_approved: true, verification_status: "approved", is_suspended: false, rejection_reason: null }).eq("id", d.id),
      d.user_id ? supabase.from("user_roles").upsert({ user_id: d.user_id, role: "doctor" as any }, { onConflict: "user_id,role" }) : Promise.resolve({ error: null }),
    ]);
    if (doctorUpdate.error || (roleInsert as any).error) return toast.error(doctorUpdate.error?.message || (roleInsert as any).error.message);
    await notify(d.phone, "Your Ayuzee doctor account is approved");
    toast.success("Doctor approved"); load();
  };
  const reject = async () => {
    if (!rejectFor) return;
    const { error } = await (supabase as any).from("doctors").update({ is_verified: false, is_approved: false, verification_status: "rejected", rejection_reason: reason }).eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    await notify(rejectFor.phone, `Your Ayuzee doctor account was rejected. Reason: ${reason}`);
    toast.success("Doctor rejected"); setRejectFor(null); setReason(""); load();
  };
  const suspend = async (d: Doctor) => { const { error } = await (supabase as any).from("doctors").update({ is_suspended: true, public_profile: false }).eq("id", d.id); if (error) return toast.error(error.message); toast.success("Doctor suspended"); load(); };
  const saveCommission = async (d: Doctor) => { const { error } = await (supabase as any).from("doctors").update({ commission_rate: Number(commissions[d.id]) || 0 }).eq("id", d.id); if (error) return toast.error(error.message); toast.success("Commission updated"); load(); };
  const openDoc = async (d: Doctor, file: string) => { if (!d.user_id) return toast.error("User ID missing"); const { data } = await supabase.storage.from("doctor-documents").createSignedUrl(`${d.user_id}/${file}`, 900); if (data?.signedUrl) window.open(data.signedUrl, "_blank"); else toast.error("Document unavailable"); };

  const toggleHms = (d: Doctor, value: boolean) => {
    if (value) {
      setHmsFor(d);
      setHmsBranch(d.hms_branch ?? "");
      setHmsType(d.hms_center_type ?? "");
    } else {
      (supabase as any).from("doctors").update({ hms_access: false }).eq("id", d.id).then(({ error }: any) => {
        if (error) toast.error(error.message);
        else { toast.success("HMS access disabled"); load(); }
      });
    }
  };

  const saveHms = async () => {
    if (!hmsFor) return;
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await (supabase as any).from("doctors").update({
      hms_access: true,
      hms_branch: hmsBranch,
      hms_center_type: hmsType,
      hms_access_granted_at: new Date().toISOString(),
      hms_access_granted_by: sess.session?.user?.id,
    }).eq("id", hmsFor.id);
    if (error) return toast.error(error.message);
    toast.success("HMS access granted");
    setHmsFor(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Doctors</h1><p className="text-sm text-muted-foreground">Review doctors, documents, and commission rates.</p></div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[["Total", counts.total], ["Pending", counts.pending], ["Approved", counts.approved], ["Rejected", counts.rejected]].map(([label, value]) => (
          <Card key={label as string}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-2xl">{value}</p></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={setTab}><TabsList>{tabs.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList></Tabs>
          <Input className="lg:w-80" placeholder="Search doctors" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Specialization</TableHead><TableHead>City</TableHead>
            <TableHead>Registered</TableHead><TableHead>Status</TableHead>
            <TableHead>HMS Access</TableHead>
            <TableHead>Commission</TableHead><TableHead>Documents</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.full_name}</TableCell>
                <TableCell>{d.specialization}</TableCell>
                <TableCell>{d.city}, {d.state || "—"}</TableCell>
                <TableCell>{new Date(d.created_at).toLocaleDateString("en-IN")}</TableCell>
                <TableCell><Badge variant={statusOf(d) === "rejected" ? "destructive" : statusOf(d) === "approved" ? "default" : "secondary"}>{statusOf(d)}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {d.hms_access
                      ? <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">⚡ HMS ✓</Badge>
                      : <Badge variant="secondary">No HMS</Badge>}
                    <Switch checked={!!d.hms_access} onCheckedChange={(v) => toggleHms(d, v)} aria-label="HMS Access" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-32 gap-2">
                    <Input className="h-8 w-20" value={commissions[d.id] ?? "0"} onChange={(e) => setCommissions((c) => ({ ...c, [d.id]: e.target.value }))} />
                    <Button size="sm" variant="outline" onClick={() => saveCommission(d)}>Save</Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openDoc(d, "certificate.pdf")}>View Certificate</Button>
                    <Button size="sm" variant="outline" onClick={() => openDoc(d, "id.pdf")}>View ID</Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {statusOf(d) === "pending" && (<>
                      <Button size="sm" onClick={() => approve(d)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRejectFor(d); setReason(""); }}>Reject</Button>
                    </>)}
                    {statusOf(d) === "approved" && <Button size="sm" variant="destructive" onClick={() => suspend(d)}>Suspend</Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No doctors found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!rejectFor} onOpenChange={(open) => !open && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectFor?.full_name}</DialogTitle></DialogHeader>
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim()} onClick={reject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!hmsFor} onOpenChange={(o) => !o && setHmsFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant HMS Tools Ultra — {hmsFor?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Branch</Label><Input value={hmsBranch} onChange={(e) => setHmsBranch(e.target.value)} placeholder="e.g. Main Hospital — Kadayanallur" /></div>
            <div>
              <Label>Center Type</Label>
              <Select value={hmsType} onValueChange={setHmsType}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CENTER_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHmsFor(null)}>Cancel</Button>
            <Button onClick={saveHms} disabled={!hmsBranch || !hmsType}>Grant Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;
