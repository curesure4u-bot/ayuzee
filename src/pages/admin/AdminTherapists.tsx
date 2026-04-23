import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Star } from "lucide-react";

interface Therapist {
  id: string; full_name: string; phone: string; gender: string | null;
  certificate_url: string | null; certifying_body: string | null;
  allowed_therapies: string[]; verification_status: string; is_verified: boolean;
  rating: number; total_sessions: number; city: string | null; rejection_reason: string | null;
  user_id: string | null;
}

const STATUSES = ["pending", "approved", "rejected", "suspended"] as const;

const AdminTherapists = () => {
  const [list, setList] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<Therapist | null>(null);
  const [reason, setReason] = useState("");
  const [flagCounts, setFlagCounts] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("therapists").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Therapist[]);
    const { data: flags } = await supabase.from("therapist_safety_flags").select("therapist_id");
    const counts: Record<string, number> = {};
    (flags ?? []).forEach((f: { therapist_id: string }) => { counts[f.therapist_id] = (counts[f.therapist_id] ?? 0) + 1; });
    setFlagCounts(counts);
    setLoading(false);
  };

  useEffect(() => { document.title = "Therapists — Admin"; load(); }, []);

  const sendNotice = async (phone: string, message: string) => {
    try { await supabase.functions.invoke("send-whatsapp", { body: { to: phone, message } }); } catch (e) { console.warn(e); }
  };

  const approve = async (t: Therapist) => {
    const { error } = await supabase.from("therapists").update({ is_verified: true, verification_status: "approved", rejection_reason: null }).eq("id", t.id);
    if (error) return toast.error(error.message);
    sendNotice(t.phone, "Congratulations! Your Ayuzee therapist account is approved. Go online to start receiving sessions.");
    toast.success("Therapist approved");
    load();
  };
  const suspend = async (t: Therapist) => {
    const { error } = await supabase.from("therapists").update({ is_verified: false, verification_status: "suspended" }).eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("Therapist suspended");
    load();
  };
  const reject = async () => {
    if (!rejectFor) return;
    const { error } = await supabase.from("therapists").update({ is_verified: false, verification_status: "rejected", rejection_reason: reason }).eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    sendNotice(rejectFor.phone, `Your Ayuzee therapist application was not approved. Reason: ${reason}`);
    toast.success("Therapist rejected");
    setRejectFor(null); setReason(""); load();
  };

  const certUrl = async (path: string) => {
    const { data } = await supabase.storage.from("therapist-docs").createSignedUrl(path, 600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Therapists</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, suspend Panchakarma therapists.</p>
      </div>
      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Tabs defaultValue="pending">
          <TabsList>{STATUSES.map(s => <TabsTrigger key={s} value={s} className="capitalize">{s} ({list.filter(t => t.verification_status === s).length})</TabsTrigger>)}</TabsList>
          {STATUSES.map(s => (
            <TabsContent key={s} value={s} className="space-y-3 mt-4">
              {list.filter(t => t.verification_status === s).length === 0 && <Card><CardContent className="p-10 text-center text-muted-foreground">No {s} therapists.</CardContent></Card>}
              {list.filter(t => t.verification_status === s).map(t => (
                <Card key={t.id}><CardContent className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{t.full_name}</h3>
                        <Badge variant="outline" className="capitalize">{t.verification_status}</Badge>
                        {(flagCounts[t.id] ?? 0) > 0 && <Badge variant="destructive">{flagCounts[t.id]} flag(s)</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{t.phone} · {t.city ?? "—"} · {t.gender ?? "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">Certifying body: {t.certifying_body ?? "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">Therapies: {(t.allowed_therapies ?? []).join(", ") || "—"}</div>
                      {t.verification_status === "approved" && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" />{t.rating.toFixed(1)}</span>
                          <span>· {t.total_sessions} sessions</span>
                        </div>
                      )}
                      {t.rejection_reason && <p className="text-xs text-destructive mt-1">Reason: {t.rejection_reason}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {t.certificate_url && <Button size="sm" variant="outline" onClick={() => certUrl(t.certificate_url!)}><FileText className="h-3 w-3 mr-1" />Certificate</Button>}
                      {t.verification_status !== "approved" && <Button size="sm" onClick={() => approve(t)}>Approve</Button>}
                      {t.verification_status !== "rejected" && <Button size="sm" variant="outline" onClick={() => { setRejectFor(t); setReason(""); }}>Reject</Button>}
                      {t.verification_status === "approved" && <Button size="sm" variant="destructive" onClick={() => suspend(t)}>Suspend</Button>}
                    </div>
                  </div>
                </CardContent></Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectFor?.full_name}</DialogTitle></DialogHeader>
          <Textarea rows={4} placeholder="Reason for rejection (will be sent to therapist)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={reject} disabled={!reason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTherapists;
