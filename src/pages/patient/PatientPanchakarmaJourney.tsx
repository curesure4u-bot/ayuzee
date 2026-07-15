import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarDays, ChevronDown, Clock, Sparkles, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PanchakarmaProgress } from "@/components/patient/PanchakarmaProgress";
import { PanchakarmaFeedbackDialog } from "@/components/patient/PanchakarmaFeedbackDialog";

type Session = {
  id: string;
  booking_id: string;
  stage_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: string;
  room_resource: string | null;
  completion_notes: string | null;
  precautions_read_at: string | null;
  post_procedure_care_plan: string | null;
  post_care_approved_at: string | null;
  stage: {
    stage_name: string;
    day_offset: number;
    duration_minutes: number | null;
    pre_procedure_instructions: string | null;
    post_procedure_instructions: string | null;
  };
};

type Booking = {
  id: string;
  start_date: string;
  status: string;
  template: { name: string; therapy_type: string; total_days: number; description: string | null };
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function phaseFromName(name: string): "purva" | "pradhana" | "paschat" | "other" {
  const n = name.toLowerCase();
  if (n.includes("purva")) return "purva";
  if (n.includes("pradhana")) return "pradhana";
  if (n.includes("paschat") || n.includes("samsarjana")) return "paschat";
  return "other";
}

const phaseMeta: Record<string, { label: string; color: string }> = {
  purva: { label: "Purva Karma", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  pradhana: { label: "Pradhana Karma", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  paschat: { label: "Paschat Karma", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  other: { label: "Session", color: "bg-muted text-foreground border-border" },
};

const statusMeta: Record<string, { label: string; className: string }> = {
  pending:     { label: "Upcoming",  className: "bg-primary/10 text-primary" },
  confirmed:   { label: "Confirmed", className: "bg-primary/10 text-primary" },
  completed:   { label: "Completed", className: "bg-emerald-500/10 text-emerald-700" },
  missed:      { label: "Missed",    className: "bg-destructive/10 text-destructive" },
  rescheduled: { label: "Rescheduled", className: "bg-muted text-foreground" },
};

export default function PatientPanchakarmaJourney() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feedback, setFeedback] = useState<{ session_id: string; symptom_severity: number | null; submitted_at: string }[]>([]);
  const [me, setMe] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    setMe(u.user.id);

    const { data: bookings } = await supabase
      .from("panchakarma_course_bookings")
      .select("id, start_date, status, template:panchakarma_course_templates(name, therapy_type, total_days, description)")
      .eq("patient_id", u.user.id)
      .in("status", ["scheduled", "in_progress", "paused"])
      .order("start_date", { ascending: false })
      .limit(1);

    const b = (bookings ?? [])[0] as any;
    setBooking(b ?? null);

    if (b) {
      const { data: sess } = await supabase
        .from("panchakarma_sessions")
        .select("id, booking_id, stage_id, scheduled_date, scheduled_time, status, room_resource, completion_notes, precautions_read_at, post_procedure_care_plan, post_care_approved_at, stage:panchakarma_template_stages(stage_name, day_offset, duration_minutes, pre_procedure_instructions, post_procedure_instructions)")
        .eq("booking_id", b.id)
        .order("scheduled_date", { ascending: true });
      const sessRows = (sess ?? []) as any as Session[];
      setSessions(sessRows);

      if (sessRows.length) {
        const { data: fb } = await supabase
          .from("panchakarma_session_feedback")
          .select("session_id, symptom_severity, submitted_at")
          .in("session_id", sessRows.map(s => s.id));
        setFeedback((fb ?? []) as any);
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = todayStr();
  const todaySession = useMemo(() => sessions.find(s => s.scheduled_date === today), [sessions, today]);
  const upcoming = useMemo(() => sessions.filter(s => s.scheduled_date > today), [sessions, today]);
  const past = useMemo(() => sessions.filter(s => s.scheduled_date < today), [sessions, today]);

  const markRead = async (s: Session, checked: boolean) => {
    const { error } = await supabase
      .from("panchakarma_sessions")
      .update({ precautions_read_at: checked ? new Date().toISOString() : null })
      .eq("id", s.id);
    if (error) { toast.error(error.message); return; }
    setSessions(prev => prev.map(x => x.id === s.id ? { ...x, precautions_read_at: checked ? new Date().toISOString() : null } : x));
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading your journey…</div>;
  if (!booking) {
    return (
      <div className="p-8 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <h1 className="font-display text-xl font-semibold">No active Panchakarma course</h1>
        <p className="text-sm text-muted-foreground mt-2">Your Vaidya will schedule one when you're ready.</p>
      </div>
    );
  }

  const feedbackSet = new Set(feedback.map(f => f.session_id));

  const SessionCard = ({ s, highlight = false }: { s: Session; highlight?: boolean }) => {
    const phase = phaseFromName(s.stage.stage_name);
    const pm = phaseMeta[phase];
    const sm = statusMeta[s.status] ?? statusMeta.pending;
    const isPast = s.scheduled_date < today;
    const eligibleForFeedback = (isPast || s.status === "completed") && !feedbackSet.has(s.id);
    const showInstructions = isPast ? s.stage.post_procedure_instructions : s.stage.pre_procedure_instructions;
    const instructionsLabel = isPast ? "Post-procedure care" : "Pre-procedure instructions";

    return (
      <Card className={highlight ? "border-primary ring-2 ring-primary/20" : ""}>
        <Collapsible defaultOpen={highlight}>
          <CollapsibleTrigger className="w-full text-left">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className={pm.color}>{pm.label}</Badge>
                  <Badge variant="secondary" className={sm.className}>{sm.label}</Badge>
                  {highlight && <Badge className="bg-primary text-primary-foreground">Today</Badge>}
                </div>
                <div className="font-medium text-sm">{s.stage.stage_name}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />
                    {new Date(s.scheduled_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  {s.scheduled_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.scheduled_time.slice(0,5)}</span>}
                  {s.room_resource && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.room_resource}</span>}
                  {s.stage.duration_minutes && <span>{s.stage.duration_minutes} min</span>}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 space-y-3 text-sm">
              {showInstructions ? (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
                    <AlertCircle className="h-3 w-3" /> {instructionsLabel}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{showInstructions}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No instructions recorded.</p>
              )}
              {isPast && (
                s.post_care_approved_at && s.post_procedure_care_plan ? (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
                      <CheckCircle2 className="h-3 w-3" /> Your Vaidya's post-procedure care plan
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{s.post_procedure_care_plan}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Approved {new Date(s.post_care_approved_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                ) : s.status === "completed" || s.completion_notes ? (
                  <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground italic flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Awaiting your Vaidya's post-procedure sign-off. Your personalised care plan will appear here once approved.
                  </div>
                ) : null
              )}
              {s.completion_notes && (
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs font-semibold mb-1">Vaidya's notes</div>
                  <p className="text-sm">{s.completion_notes}</p>
                </div>
              )}
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={!!s.precautions_read_at} onCheckedChange={(v) => markRead(s, !!v)} />
                <span>I have read and understood these {isPast ? "post-procedure care instructions" : "precautions"}</span>
                {s.precautions_read_at && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
              </label>
              {eligibleForFeedback && me && (
                <PanchakarmaFeedbackDialog
                  sessionId={s.id}
                  patientId={me}
                  onSubmitted={load}
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold">My Panchakarma Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {booking.template.name} · started {new Date(booking.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        {booking.template.description && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{booking.template.description}</p>
        )}
      </div>

      <PanchakarmaProgress sessions={sessions} feedback={feedback} />

      {todaySession && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Today</h2>
          <SessionCard s={todaySession} highlight />
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Upcoming ({upcoming.length})</h2>
          <div className="space-y-2">
            {upcoming.map(s => <SessionCard key={s.id} s={s} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Completed & past ({past.length})</h2>
          <div className="space-y-2">
            {past.map(s => <SessionCard key={s.id} s={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
