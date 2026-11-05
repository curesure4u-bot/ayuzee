import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, CalendarPlus, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Booking = {
  id: string;
  patient_id: string;
  start_date: string;
  status: string;
  template: { name: string; therapy_type: string } | null;
  patient: { full_name: string | null; phone: string | null } | null;
};

type Alert = {
  feedback_id: string;
  session_id: string;
  booking_id: string;
  scheduled_date: string;
  symptom_severity: number | null;
  improvement_notes: string | null;
  side_effects: string | null;
  submitted_at: string;
  stage_name: string;
  patient_name: string | null;
};

export default function PanchakarmaBookings() {
  const nav = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [shiftDays, setShiftDays] = useState<Record<string, number>>({});
  const [rescheduling, setRescheduling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    setMe(u.user.id);

    const { data: bks } = await supabase
      .from("panchakarma_course_bookings")
      .select("id, patient_id, start_date, status, template:panchakarma_course_templates(name, therapy_type)")
      .eq("vaidya_id", u.user.id)
      .order("start_date", { ascending: false });

    const patientIds = [...new Set((bks ?? []).map(b => (b as any).patient_id))];
    const { data: profs } = patientIds.length
      ? await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", patientIds)
      : { data: [] as any };
    const profMap = new Map((profs ?? []).map((p: any) => [p.user_id, p]));

    const bookingsHydrated = (bks ?? []).map((b: any) => ({ ...b, patient: profMap.get(b.patient_id) ?? null })) as Booking[];
    setBookings(bookingsHydrated);

    // Fetch alerts (needs_review = true) for these bookings' sessions
    const bookingIds = bookingsHydrated.map(b => b.id);
    if (bookingIds.length) {
      const { data: sessions } = await supabase
        .from("panchakarma_sessions")
        .select("id, booking_id, scheduled_date, stage:panchakarma_template_stages(stage_name)")
        .in("booking_id", bookingIds);
      const sessMap = new Map((sessions ?? []).map((s: any) => [s.id, s]));

      const { data: fbs } = await supabase
        .from("panchakarma_session_feedback")
        .select("id, session_id, symptom_severity, improvement_notes, side_effects, submitted_at, needs_review, patient_id")
        .eq("needs_review", true)
        .in("session_id", (sessions ?? []).map((s: any) => s.id));

      const list: Alert[] = (fbs ?? []).map((f: any) => {
        const s = sessMap.get(f.session_id);
        return {
          feedback_id: f.id,
          session_id: f.session_id,
          booking_id: s?.booking_id,
          scheduled_date: s?.scheduled_date,
          symptom_severity: f.symptom_severity,
          improvement_notes: f.improvement_notes,
          side_effects: f.side_effects,
          submitted_at: f.submitted_at,
          stage_name: s?.stage?.stage_name ?? "",
          patient_name: (profMap.get(f.patient_id) as any)?.full_name ?? null,
        };
      }).sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
      setAlerts(list);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clearReview = async (feedback_id: string) => {
    const { error } = await supabase.from("panchakarma_session_feedback")
      .update({ needs_review: false }).eq("id", feedback_id);
    if (error) { toast.error(error.message); return; }
    setAlerts(prev => prev.filter(a => a.feedback_id !== feedback_id));
    toast.success("Marked as reviewed");
  };

  const reschedule = async (bookingId: string) => {
    const days = shiftDays[bookingId];
    if (!days || days === 0) { toast.error("Enter days to shift"); return; }
    setRescheduling(bookingId);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: pending, error: qErr } = await supabase
        .from("panchakarma_sessions")
        .select("id, scheduled_date")
        .eq("booking_id", bookingId)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_date", today);
      if (qErr) throw qErr;

      const updates = (pending ?? []).map(async (s: any) => {
        const d = new Date(s.scheduled_date + "T00:00:00");
        d.setDate(d.getDate() + days);
        return supabase.from("panchakarma_sessions")
          .update({ scheduled_date: d.toISOString().slice(0, 10), status: "rescheduled" })
          .eq("id", s.id);
      });
      const results = await Promise.all(updates);
      const failed = results.filter(r => r.error);
      if (failed.length) throw failed[0].error;

      // Reset rescheduled → pending so patient sees new upcoming dates
      const ids = (pending ?? []).map((s: any) => s.id);
      if (ids.length) {
        await supabase.from("panchakarma_sessions").update({ status: "pending" }).in("id", ids);
      }

      toast.success(`Shifted ${pending?.length ?? 0} session(s) by ${days} day${days > 1 ? "s" : ""}`);
      setShiftDays(prev => ({ ...prev, [bookingId]: 0 }));
    } catch (e: any) {
      toast.error(e?.message || "Reschedule failed");
    } finally {
      setRescheduling(null);
    }
  };

  const alertsByBooking = useMemo(() => {
    const m = new Map<string, Alert[]>();
    for (const a of alerts) {
      if (!a.booking_id) continue;
      const arr = m.get(a.booking_id) ?? [];
      arr.push(a); m.set(a.booking_id, arr);
    }
    return m;
  }, [alerts]);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Panchakarma Course Bookings</h1>
          <p className="text-sm text-muted-foreground">Patient feedback alerts and course rescheduling.</p>
        </div>
        <Button variant="hero" onClick={() => nav("/vaidya/panchakarma/schedule")}>
          <CalendarPlus className="mr-2 h-4 w-4" /> New Course
        </Button>
      </div>

      {alerts.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Patient alerts needing your review ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map(a => (
              <div key={a.feedback_id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{a.patient_name ?? "Patient"}</span>
                      <Badge variant="outline" className="text-[10px]">{a.stage_name}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      {a.symptom_severity != null && a.symptom_severity >= 8 && (
                        <Badge variant="destructive" className="text-[10px]">Severity {a.symptom_severity}/10</Badge>
                      )}
                    </div>
                    {a.side_effects && (
                      <p className="mt-1 text-sm"><span className="font-medium">Side effects:</span> {a.side_effects}</p>
                    )}
                    {a.improvement_notes && (
                      <p className="mt-1 text-sm text-muted-foreground">{a.improvement_notes}</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => clearReview(a.feedback_id)}>Mark reviewed</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {bookings.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No course bookings yet.</CardContent></Card>
        ) : bookings.map(b => {
          const bAlerts = alertsByBooking.get(b.id) ?? [];
          return (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{b.patient?.full_name ?? "Unnamed patient"}</span>
                      <Badge variant="outline" className="capitalize">{b.status}</Badge>
                      {bAlerts.length > 0 && (
                        <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />{bAlerts.length} alert{bAlerts.length>1?"s":""}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {b.template?.name} · started {new Date(b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Reschedule remaining
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle>Shift remaining sessions</DialogTitle></DialogHeader>
                      <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">
                          All upcoming pending/confirmed sessions for this booking will move forward by the number of days you set below.
                        </p>
                        <div>
                          <Label>Shift by (days)</Label>
                          <Input type="number" min={1} value={shiftDays[b.id] ?? ""} placeholder="e.g. 3"
                            onChange={e => setShiftDays(prev => ({ ...prev, [b.id]: Number(e.target.value) }))} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={() => reschedule(b.id)} disabled={rescheduling === b.id}>
                          {rescheduling === b.id ? "Shifting…" : "Confirm shift"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
