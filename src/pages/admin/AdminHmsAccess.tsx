import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CENTER_TYPES = [
  { value: "main_hospital", label: "Main Hospital" },
  { value: "branch", label: "Branch" },
  { value: "franchisee", label: "Franchisee" },
  { value: "exclusive_center", label: "Exclusive Center" },
];

type Doctor = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  hms_access: boolean;
  hms_branch: string | null;
  hms_center_type: string | null;
  hms_access_granted_at: string | null;
};

type Req = {
  id: string;
  doctor_user_id: string;
  center_name: string;
  role: string | null;
  center_type: string | null;
  daily_patients: number | null;
  message: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  doctor_name?: string;
  doctor_phone?: string | null;
};

const AdminHmsAccess = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [editFor, setEditFor] = useState<Doctor | null>(null);
  const [editBranch, setEditBranch] = useState("");
  const [editType, setEditType] = useState("");
  const [revokeFor, setRevokeFor] = useState<Doctor | null>(null);
  const [rejectFor, setRejectFor] = useState<Req | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    const [d, r] = await Promise.all([
      (supabase as any).from("doctors").select("id,user_id,full_name,phone,hms_access,hms_branch,hms_center_type,hms_access_granted_at"),
      (supabase as any).from("hms_access_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setDoctors((d.data ?? []) as Doctor[]);
    const reqs = (r.data ?? []) as Req[];
    // hydrate doctor names
    const ids = Array.from(new Set(reqs.map((q) => q.doctor_user_id)));
    if (ids.length) {
      const { data: ds } = await (supabase as any).from("doctors").select("user_id,full_name,phone").in("user_id", ids);
      const map = new Map((ds ?? []).map((x: any) => [x.user_id, x]));
      reqs.forEach((q) => {
        const m: any = map.get(q.doctor_user_id);
        q.doctor_name = m?.full_name ?? "—";
        q.doctor_phone = m?.phone ?? null;
      });
    }
    setRequests(reqs);
  };

  useEffect(() => {
    document.title = "Admin · HMS Tools Ultra";
    load();
  }, []);

  const active = useMemo(() => doctors.filter((d) => d.hms_access), [doctors]);
  const revoked = useMemo(() => doctors.filter((d) => !d.hms_access && d.hms_access_granted_at), [doctors]);
  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);

  const saveEdit = async () => {
    if (!editFor) return;
    const { error } = await (supabase as any).from("doctors").update({
      hms_branch: editBranch || null,
      hms_center_type: editType || null,
    }).eq("id", editFor.id);
    if (error) return toast.error(error.message);
    toast.success("Branch updated");
    setEditFor(null);
    load();
  };

  const revoke = async () => {
    if (!revokeFor) return;
    const { error } = await (supabase as any).from("doctors").update({ hms_access: false }).eq("id", revokeFor.id);
    if (error) return toast.error(error.message);
    toast.success("Access revoked");
    setRevokeFor(null);
    load();
  };

  const reactivate = async (d: Doctor) => {
    const { error } = await (supabase as any).from("doctors").update({ hms_access: true }).eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success("Access reactivated");
    load();
  };

  const approve = async (r: Req) => {
    const { data: sess } = await supabase.auth.getSession();
    const adminId = sess.session?.user?.id;
    const u1 = await (supabase as any).from("doctors").update({
      hms_access: true,
      hms_branch: r.center_name,
      hms_center_type: r.center_type,
      hms_access_granted_at: new Date().toISOString(),
      hms_access_granted_by: adminId,
    }).eq("user_id", r.doctor_user_id);
    if (u1.error) return toast.error(u1.error.message);
    await (supabase as any).from("hms_access_requests").update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    }).eq("id", r.id);
    if (r.doctor_phone) {
      supabase.functions.invoke("send-whatsapp", {
        body: {
          to: r.doctor_phone,
          message: "Your HMS Tools Ultra access has been activated on Ayuzee. Login at ayuzee.com to access your HMS dashboard. — Ayuzee Team",
        },
      });
    }
    toast.success("Approved");
    load();
  };

  const reject = async () => {
    if (!rejectFor) return;
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await (supabase as any).from("hms_access_requests").update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: sess.session?.user?.id,
    }).eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    toast.success("Rejected");
    setRejectFor(null);
    setReason("");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">⚡ HMS Tools Ultra — Access Management</h1>
        <p className="text-sm text-muted-foreground">Approve centers, branches, and staff for HMS Tools Ultra.</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">✅ Active Centers ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">⏳ Pending Requests ({pending.length})</TabsTrigger>
          <TabsTrigger value="revoked">❌ Revoked ({revoked.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card><CardContent className="p-4">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Doctor</TableHead><TableHead>Branch</TableHead><TableHead>Center Type</TableHead>
                <TableHead>Granted On</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {active.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.full_name}</TableCell>
                    <TableCell>{d.hms_branch || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{d.hms_center_type || "—"}</Badge></TableCell>
                    <TableCell>{d.hms_access_granted_at ? new Date(d.hms_access_granted_at).toLocaleDateString("en-IN") : "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditFor(d); setEditBranch(d.hms_branch ?? ""); setEditType(d.hms_center_type ?? ""); }}>Edit Branch</Button>
                      <Button size="sm" variant="destructive" onClick={() => setRevokeFor(d)}>Revoke Access</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {active.length === 0 && <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">No active centers.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card><CardContent className="p-4">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Center</TableHead><TableHead>Doctor</TableHead><TableHead>Role</TableHead>
                <TableHead>Type</TableHead><TableHead>Daily OPD</TableHead><TableHead>Message</TableHead>
                <TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {pending.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.center_name}</TableCell>
                    <TableCell>{r.doctor_name}</TableCell>
                    <TableCell>{r.role || "—"}</TableCell>
                    <TableCell>{r.center_type || "—"}</TableCell>
                    <TableCell>{r.daily_patients ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate" title={r.message ?? ""}>{r.message || "—"}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => approve(r)}>✅ Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRejectFor(r); setReason(""); }}>❌ Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pending.length === 0 && <TableRow><TableCell colSpan={8} className="py-6 text-center text-muted-foreground">No pending requests.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="revoked">
          <Card><CardContent className="p-4">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Doctor</TableHead><TableHead>Branch</TableHead><TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {revoked.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.full_name}</TableCell>
                    <TableCell>{d.hms_branch || "—"}</TableCell>
                    <TableCell>{d.hms_center_type || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => reactivate(d)}>Re-activate</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {revoked.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">No revoked accounts.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Edit branch dialog */}
      <Dialog open={!!editFor} onOpenChange={(o) => !o && setEditFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Branch — {editFor?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Branch Name</Label><Input value={editBranch} onChange={(e) => setEditBranch(e.target.value)} /></div>
            <div>
              <Label>Center Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CENTER_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFor(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <Dialog open={!!revokeFor} onOpenChange={(o) => !o && setRevokeFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Revoke HMS Access?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will immediately remove HMS Tools Ultra access for {revokeFor?.full_name}.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={revoke}>Revoke</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Request</DialogTitle></DialogHeader>
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim()} onClick={reject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHmsAccess;
