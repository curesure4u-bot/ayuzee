import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHmsAccess } from "@/hooks/useHmsAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Lock, Zap } from "lucide-react";

const ROLES = ["Branch Manager", "Doctor", "Reception Staff", "Pharmacist", "Nurse", "Admin"];
const CENTER_TYPES: Array<{ value: string; label: string }> = [
  { value: "main_hospital", label: "Main Hospital" },
  { value: "branch", label: "Branch" },
  { value: "franchisee", label: "Franchisee" },
  { value: "exclusive_center", label: "Exclusive Center" },
];

type RequestRow = {
  id: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
};

export const HmsAccessGate = ({ children }: { children: ReactNode }) => {
  const { hasAccess, loading } = useHmsAccess();
  const [open, setOpen] = useState(false);
  const [latest, setLatest] = useState<RequestRow | null>(null);
  const [centerName, setCenterName] = useState("");
  const [role, setRole] = useState("");
  const [centerType, setCenterType] = useState("");
  const [daily, setDaily] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hasAccess || loading) return;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data } = await (supabase as any)
        .from("hms_access_requests")
        .select("id,status,rejection_reason")
        .eq("doctor_user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatest(data ?? null);
    })();
  }, [hasAccess, loading]);

  const submit = async () => {
    if (!centerName.trim()) return toast.error("Center name is required");
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return toast.error("Sign in required");
    setSaving(true);
    const { error } = await (supabase as any).from("hms_access_requests").insert({
      doctor_user_id: uid,
      center_name: centerName.trim(),
      role,
      center_type: centerType,
      daily_patients: daily ? Number(daily) : null,
      message,
      status: "pending",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Request submitted. We'll respond within 24 hours.");
    setOpen(false);
    setLatest({ id: "tmp", status: "pending", rejection_reason: null });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (hasAccess) return <>{children}</>;

  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <Card className="w-full max-w-xl border-primary/20">
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Zap className="h-4 w-4" /> HMS Tools Ultra
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-2xl">Access Required</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This module is available only to approved centers, branches, and staff.
            Contact your Ayuzee administrator to activate HMS Tools Ultra access.
          </p>
          <div className="rounded-md border bg-muted/40 p-4 text-sm">
            <p className="mb-2 font-semibold">What you get with HMS Tools Ultra:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>✅ OPD Queue & Token Management</li>
              <li>✅ Patient Registration & Records</li>
              <li>✅ Consultation & Prescription</li>
              <li>✅ Billing & Invoice (GST)</li>
              <li>✅ MIS Reports (12 categories)</li>
              <li>✅ Ward & IP Admission Management</li>
              <li>✅ Staff Attendance & Assets</li>
              <li>✅ WhatsApp Notifications</li>
            </ul>
          </div>

          {latest?.status === "pending" && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              ⏳ Request under review. You'll be notified via WhatsApp within 24 hours.
            </div>
          )}
          {latest?.status === "rejected" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              ❌ Previous request rejected{latest.rejection_reason ? `: ${latest.rejection_reason}` : ""}.
            </div>
          )}

          <Button className="w-full" onClick={() => setOpen(true)} disabled={latest?.status === "pending"}>
            {latest?.status === "rejected" ? "Re-apply for Access" : "Request HMS Tools Ultra Access"}
          </Button>
          <p className="text-center text-xs italic text-muted-foreground">
            "Our team will activate within 24 hours of your request."
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request HMS Tools Ultra Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Center / Clinic Name *</Label>
              <Input value={centerName} onChange={(e) => setCenterName(e.target.value)} />
            </div>
            <div>
              <Label>Your Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Center Type</Label>
              <Select value={centerType} onValueChange={setCenterType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {CENTER_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Daily Patient Count</Label>
              <Input type="number" min={0} value={daily} onChange={(e) => setDaily(e.target.value)} />
            </div>
            <div>
              <Label>Message to Ayuzee Admin</Label>
              <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Submitting…" : "Submit Request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsAccessGate;
