import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, ShieldCheck, ClipboardList } from "lucide-react";
import { toast } from "sonner";

type SessionRow = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string | null;
  room_resource: string | null;
  vaidya_id: string;
  therapist_id: string | null;
  course_id: string | null;
  pre_procedure_assessment: any;
  procedure_log: any;
  transfer_note: string | null;
  post_procedure_care_plan: string | null;
  adverse_event_flag: boolean;
  post_care_approved_at: string | null;
};

const sb = supabase as any;

const JsonBlock = ({ data }: { data: any }) => {
  if (!data) return <p className="text-sm text-muted-foreground italic">Not recorded.</p>;
  if (typeof data === "string") return <p className="text-sm whitespace-pre-wrap">{data}</p>;
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground italic">Empty.</p>;
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="border-b border-border/50 py-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k.replace(/_/g, " ")}</dt>
          <dd className="text-sm whitespace-pre-wrap">
            {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v ?? "—")}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default function PanchakarmaPostCareQueue() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setSessions([]);
      setLoading(false);
      return;
    }
    const { data, error } = await sb
      .from("panchakarma_sessions")
      .select(
        "id,status,scheduled_date,scheduled_time,room_resource,vaidya_id,therapist_id,course_id,pre_procedure_assessment,procedure_log,transfer_note,post_procedure_care_plan,adverse_event_flag,post_care_approved_at",
      )
      .eq("status", "post_care_pending")
      .eq("vaidya_id", uid)
      .order("scheduled_date", { ascending: true });
    if (error) toast.error(error.message);
    const rows = (data ?? []) as SessionRow[];
    setSessions(rows);
    setDrafts(Object.fromEntries(rows.map((r) => [r.id, r.post_procedure_care_plan ?? ""])));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveDraft = async (id: string) => {
    setSaving(id);
    const { error } = await sb
      .from("panchakarma_sessions")
      .update({ post_procedure_care_plan: drafts[id] ?? "" })
      .eq("id", id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Care plan draft saved");
  };

  const approve = async (id: string) => {
    const plan = (drafts[id] ?? "").trim();
    if (plan.length < 20) {
      toast.error("Please write a post-procedure care plan (min 20 characters) before approving.");
      return;
    }
    if (!userId) return;
    setSaving(id);
    const { error } = await sb
      .from("panchakarma_sessions")
      .update({
        post_procedure_care_plan: plan,
        post_care_approved_by: userId,
        post_care_approved_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Session signed off — patient can now view the care plan");
    load();
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Post-Procedure Sign-Off
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review the therapist's procedure log, write the post-procedure care plan, and approve. The patient sees the
            care plan only after your sign-off.
          </p>
        </div>
        <Badge variant="secondary">{sessions.length} pending</Badge>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary" />
            All caught up — no sessions awaiting post-care approval.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <Card key={s.id} className={s.adverse_event_flag ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Session · {s.scheduled_date}
                    {s.scheduled_time ? ` @ ${s.scheduled_time.slice(0, 5)}` : ""}
                    {s.room_resource ? ` · ${s.room_resource}` : ""}
                  </CardTitle>
                  {s.adverse_event_flag && <Badge variant="destructive">Adverse event on file</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Pre-procedure assessment</h3>
                  <JsonBlock data={s.pre_procedure_assessment} />
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">Procedure log</h3>
                  <JsonBlock data={s.procedure_log} />
                </div>
                {s.transfer_note && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">Therapist transfer note</h3>
                      <p className="text-sm whitespace-pre-wrap">{s.transfer_note}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Post-procedure care plan (patient will see this after approval)
                  </label>
                  <Textarea
                    rows={6}
                    value={drafts[s.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                    placeholder="Rest for 24h, warm water only, avoid oily food, follow-up on..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => saveDraft(s.id)} disabled={saving === s.id}>
                    Save draft
                  </Button>
                  <Button
                    onClick={() => approve(s.id)}
                    disabled={saving === s.id || s.adverse_event_flag}
                    title={s.adverse_event_flag ? "Resolve the adverse event before sign-off" : ""}
                  >
                    {saving === s.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Approve & sign off
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
