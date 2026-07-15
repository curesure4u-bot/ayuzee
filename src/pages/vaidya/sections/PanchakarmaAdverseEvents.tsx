import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

type EventRow = {
  id: string;
  session_id: string;
  reported_by: string | null;
  severity: string | null;
  description: string | null;
  root_cause: string | null;
  corrective_action: string | null;
  vaidya_notified_at: string | null;
  resolved: boolean;
  created_at: string;
  session?: {
    id: string;
    status: string;
    scheduled_date: string;
    course_id: string | null;
    vaidya_id: string;
  } | null;
};

const severityColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  near_miss: "outline",
  minor: "secondary",
  major: "destructive",
  critical: "destructive",
};

export default function PanchakarmaAdverseEvents() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { root_cause: string; corrective_action: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const _uid = auth.user?.id ?? null;
    setUid(_uid);

    const { data, error } = await sb
      .from("panchakarma_adverse_events")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);

    const rows = (data ?? []) as EventRow[];
    const sessionIds = Array.from(new Set(rows.map((r) => r.session_id).filter(Boolean)));
    let sessionMap: Record<string, EventRow["session"]> = {};
    if (sessionIds.length > 0) {
      const { data: sessions } = await sb
        .from("panchakarma_sessions")
        .select("id,status,scheduled_date,course_id,vaidya_id")
        .in("id", sessionIds);
      sessionMap = Object.fromEntries((sessions ?? []).map((s: any) => [s.id, s]));
    }
    const withSessions = rows.map((r) => ({ ...r, session: sessionMap[r.session_id] ?? null }));
    // Only show events where this Vaidya supervises the session (or no session filter if admin)
    const mine = _uid ? withSessions.filter((r) => !r.session || r.session.vaidya_id === _uid) : withSessions;
    setEvents(mine);
    setDrafts(
      Object.fromEntries(
        mine.map((r) => [r.id, { root_cause: r.root_cause ?? "", corrective_action: r.corrective_action ?? "" }]),
      ),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (evt: EventRow, action: "resume" | "discontinue") => {
    const d = drafts[evt.id];
    if (!d || d.root_cause.trim().length < 10 || d.corrective_action.trim().length < 10) {
      toast.error("Please enter both root cause and corrective action (min 10 characters each).");
      return;
    }
    setBusy(evt.id);
    // 1. Mark event resolved
    const { error: e1 } = await sb
      .from("panchakarma_adverse_events")
      .update({
        root_cause: d.root_cause.trim(),
        corrective_action: d.corrective_action.trim(),
        resolved: true,
      })
      .eq("id", evt.id);
    if (e1) {
      setBusy(null);
      return toast.error(e1.message);
    }

    // 2. Clear the flag on the session and move status forward
    if (evt.session_id) {
      const newSessionStatus = action === "resume" ? "in_progress" : "discontinued";
      await sb
        .from("panchakarma_sessions")
        .update({ adverse_event_flag: false, status: newSessionStatus })
        .eq("id", evt.session_id);

      // 3. If discontinuing, mark the whole course discontinued
      if (action === "discontinue" && evt.session?.course_id) {
        await sb
          .from("panchakarma_courses")
          .update({ status: "discontinued" })
          .eq("id", evt.session.course_id);
      }
    }

    setBusy(null);
    toast.success(action === "resume" ? "Event resolved — session can continue" : "Event resolved — course discontinued");
    load();
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Adverse Event Resolution
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Flagged Panchakarma sessions awaiting your review. Record root cause and corrective action, then either
            allow the session to continue or discontinue the course.
          </p>
        </div>
        <Badge variant="destructive">{events.length} open</Badge>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary" />
            No open adverse events. 
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {events.map((e) => {
            const d = drafts[e.id] ?? { root_cause: "", corrective_action: "" };
            const sev = e.severity ?? "minor";
            return (
              <Card key={e.id} className="border-destructive/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      {e.session?.scheduled_date ? `Session · ${e.session.scheduled_date}` : "Session"}
                    </CardTitle>
                    <div className="flex gap-2 items-center">
                      <Badge variant={severityColor[sev] ?? "secondary"}>{sev.replace("_", " ")}</Badge>
                      <Badge variant="outline">Reported {new Date(e.created_at).toLocaleString()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Therapist's description</h3>
                    <p className="text-sm whitespace-pre-wrap">{e.description || <span className="italic text-muted-foreground">No description provided.</span>}</p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Root cause</label>
                      <Textarea
                        rows={4}
                        value={d.root_cause}
                        onChange={(ev) =>
                          setDrafts((prev) => ({ ...prev, [e.id]: { ...d, root_cause: ev.target.value } }))
                        }
                        placeholder="What went wrong and why?"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Corrective action</label>
                      <Textarea
                        rows={4}
                        value={d.corrective_action}
                        onChange={(ev) =>
                          setDrafts((prev) => ({ ...prev, [e.id]: { ...d, corrective_action: ev.target.value } }))
                        }
                        placeholder="Immediate steps taken and preventive measures for future sessions."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={busy === e.id}>
                          <XCircle className="h-4 w-4 mr-2" /> Discontinue course
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Discontinue this Panchakarma course?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The session will be marked discontinued and the parent course status set to discontinued.
                            The patient will be notified via standard workflows.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => resolve(e, "discontinue")}>Confirm discontinue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => resolve(e, "resume")} disabled={busy === e.id}>
                      {busy === e.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      Resolve & resume session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
