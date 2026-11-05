import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ShieldCheck, FileSignature, PlusCircle } from "lucide-react";

type Consent = {
  id: string;
  patient_id: string;
  therapy_type_id: string;
  venue_id: string | null;
  signed_at: string | null;
  revoked_at: string | null;
  therapy_type: { id: string; name: string; is_privileged: boolean; standard_prep_days: number | null } | null;
};
type Venue = {
  id: string;
  name: string;
  city: string | null;
  registration_status: string;
  is_active: boolean;
  offered_therapy_type_ids: string[] | null;
};

export default function PanchakarmaCourseFromConsent() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const [consents, setConsents] = useState<Consent[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});

  const [consentId, setConsentId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [plannedSessions, setPlannedSessions] = useState<number>(7);
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");

  const selectedConsent = useMemo(
    () => consents.find((c) => c.id === consentId) ?? null,
    [consents, consentId],
  );
  const eligibleVenues = useMemo(() => {
    if (!selectedConsent) return [] as Venue[];
    return venues.filter(
      (v) =>
        v.registration_status === "approved" &&
        v.is_active &&
        (v.offered_therapy_type_ids ?? []).includes(selectedConsent.therapy_type_id),
    );
  }, [venues, selectedConsent]);

  useEffect(() => { setVenueId(""); }, [consentId]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", u.user.id).maybeSingle();
      if (!doc?.id) { setLoading(false); return; }
      setDoctorId(doc.id);

      // Consents this vaidya has signed that are not yet attached to a course
      const [{ data: cs }, { data: vs }, { data: existingCourses }] = await Promise.all([
        supabase
          .from("panchakarma_consents")
          .select("id, patient_id, therapy_type_id, venue_id, signed_at, revoked_at, therapy_type:panchakarma_therapy_types(id,name,is_privileged,standard_prep_days)")
          .eq("vaidya_id", doc.id)
          .not("signed_at", "is", null)
          .is("revoked_at", null)
          .order("signed_at", { ascending: false }),
        supabase
          .from("panchakarma_venues")
          .select("id,name,city,registration_status,is_active,offered_therapy_type_ids")
          .eq("registration_status", "approved")
          .eq("is_active", true)
          .order("name"),
        supabase.from("panchakarma_courses").select("consent_id").eq("prescribing_vaidya_id", doc.id),
      ]);

      const usedConsentIds = new Set(((existingCourses ?? []) as any[]).map((r) => r.consent_id).filter(Boolean));
      const available = ((cs ?? []) as any[]).filter((c) => !usedConsentIds.has(c.id)) as Consent[];
      setConsents(available);
      setVenues((vs ?? []) as Venue[]);

      const patientIds = Array.from(new Set(available.map((c) => c.patient_id))).filter(Boolean);
      if (patientIds.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id,full_name").in("user_id", patientIds);
        const map: Record<string, string> = {};
        ((profs ?? []) as any[]).forEach((p) => { map[p.user_id] = p.full_name || "Unnamed"; });
        setPatientNames(map);
      }
      setLoading(false);
    })();
  }, []);

  const todayIso = new Date().toISOString().slice(0, 10);
  const endDate = useMemo(() => {
    if (!startDate || !plannedSessions) return "";
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + Math.max(0, plannedSessions - 1));
    return d.toISOString().slice(0, 10);
  }, [startDate, plannedSessions]);

  const [conflicts, setConflicts] = useState<{ date: string; label: string }[]>([]);

  const valid =
    !!(consentId && venueId && startDate && plannedSessions > 0 && provisionalDiagnosis.trim()) &&
    plannedSessions >= 1 && plannedSessions <= 60 &&
    startDate >= todayIso;

  const submit = async () => {
    if (!doctorId || !selectedConsent) return;
    if (startDate < todayIso) { toast.error("Start date cannot be in the past."); return; }
    if (plannedSessions < 1 || plannedSessions > 60) {
      toast.error("Planned sessions must be between 1 and 60."); return;
    }
    setSaving(true);
    setConflicts([]);
    try {
      // Preflight: therapist / Vaidya double-booking within the planned window.
      const [{ data: existingSessions }, { data: existingAppts }] = await Promise.all([
        supabase
          .from("panchakarma_sessions")
          .select("scheduled_date, scheduled_time, status")
          .eq("vaidya_id", doctorId)
          .gte("scheduled_date", startDate)
          .lte("scheduled_date", endDate),
        supabase
          .from("appointments")
          .select("appointment_date, time_slot, status")
          .eq("doctor_id", doctorId)
          .gte("appointment_date", startDate)
          .lte("appointment_date", endDate),
      ]);

      const clashes: { date: string; label: string }[] = [];
      ((existingSessions ?? []) as any[])
        .filter((s) => !["missed", "rescheduled", "cancelled"].includes(s.status))
        .forEach((s) => clashes.push({
          date: s.scheduled_date,
          label: `Existing Panchakarma session at ${s.scheduled_time ?? "unspecified time"}`,
        }));
      ((existingAppts ?? []) as any[])
        .filter((a) => !["cancelled", "no_show"].includes(a.status))
        .forEach((a) => clashes.push({
          date: a.appointment_date,
          label: `Appointment at ${a.time_slot ?? "unspecified time"}`,
        }));

      if (clashes.length) {
        setConflicts(clashes);
        toast.error(`Cannot create course — ${clashes.length} scheduling conflict${clashes.length > 1 ? "s" : ""} in the planned window.`);
        return;
      }

      const coursePayload = {
        patient_id: selectedConsent.patient_id,
        prescribing_vaidya_id: doctorId,
        therapy_type_id: selectedConsent.therapy_type_id,
        consent_id: selectedConsent.id,
        venue_id: venueId,
        provisional_diagnosis: provisionalDiagnosis.trim(),
        planned_sessions: plannedSessions,
        start_date: startDate,
        status: "active",
      };

      const { data: course, error } = await supabase
        .from("panchakarma_courses")
        .insert(coursePayload)
        .select("id")
        .single();
      if (error || !course) {
        // Extract machine-readable rule name from the trigger's DETAIL (e.g. "rule=start_date_past").
        const detail = (error as any)?.details ?? (error as any)?.detail ?? "";
        const ruleMatch = /rule=([a-z_]+)/i.exec(String(detail));
        const failedRule = ruleMatch ? ruleMatch[1] : null;

        // Best-effort audit log; never mask the original error if this fails.
        await supabase.rpc("log_panchakarma_course_attempt", {
          _action: "insert",
          _course_id: null,
          _payload: coursePayload as any,
          _outcome: "blocked",
          _failed_rule: failedRule,
          _error_message: error?.message ?? "unknown",
        });

        throw error ?? new Error("Course insert failed");
      }
      toast.success("Panchakarma course created.");
      nav("/vaidya/panchakarma");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }
  if (!doctorId) {
    return <div className="p-6 text-sm text-destructive">Only registered Vaidyas can prescribe Panchakarma courses.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">New Panchakarma Course</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start a course from an existing signed patient consent and assign it to a venue.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => nav("/vaidya/panchakarma/course/new")}>
          <FileSignature className="h-4 w-4" /> Capture new consent
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Course details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Signed consent</Label>
            <Select value={consentId} onValueChange={setConsentId}>
              <SelectTrigger>
                <SelectValue placeholder={consents.length ? "Select a signed consent" : "No unattached signed consents"} />
              </SelectTrigger>
              <SelectContent>
                {consents.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(patientNames[c.patient_id] ?? "Patient")} · {c.therapy_type?.name ?? "Therapy"}
                    {c.signed_at ? ` · signed ${new Date(c.signed_at).toLocaleDateString()}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!consents.length && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                No available consents — capture one first, then return here.
              </p>
            )}
            {selectedConsent && (
              <div className="rounded-md border bg-muted/40 p-3 mt-2 text-xs space-y-1">
                <div><span className="font-semibold">Patient:</span> {patientNames[selectedConsent.patient_id] ?? "Unknown"}</div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">Therapy:</span> {selectedConsent.therapy_type?.name}
                  {selectedConsent.therapy_type?.is_privileged && <Badge variant="secondary">Privileged</Badge>}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Venue</Label>
            <Select value={venueId} onValueChange={setVenueId} disabled={!selectedConsent}>
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedConsent ? "Select a consent first"
                  : eligibleVenues.length ? "Select a venue" : "No approved venues offer this therapy"
                } />
              </SelectTrigger>
              <SelectContent>
                {eligibleVenues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}{v.city ? ` · ${v.city}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Provisional diagnosis</Label>
            <Textarea
              value={provisionalDiagnosis}
              onChange={(e) => setProvisionalDiagnosis(e.target.value.slice(0, 1000))}
              placeholder="e.g. Amavata (Rheumatoid arthritis) with Vata-Kapha predominance"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Planned sessions</Label>
              <Input
                type="number" min={1} max={60}
                value={plannedSessions}
                onChange={(e) => setPlannedSessions(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" min={todayIso} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          {startDate && plannedSessions > 0 && (
            <p className="text-xs text-muted-foreground">
              Planned window: <span className="font-medium">{startDate}</span> → <span className="font-medium">{endDate}</span> ({plannedSessions} day{plannedSessions > 1 ? "s" : ""}).
              {startDate < todayIso && <span className="text-destructive"> Start date is in the past.</span>}
            </p>
          )}

          {conflicts.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs space-y-1">
              <div className="font-semibold text-destructive">Scheduling conflicts in the planned window</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {conflicts.slice(0, 10).map((c, i) => (
                  <li key={i}><span className="font-medium">{c.date}</span> — {c.label}</li>
                ))}
                {conflicts.length > 10 && <li>…and {conflicts.length - 10} more</li>}
              </ul>
              <p className="text-muted-foreground">Resolve or reschedule these before creating the course.</p>
            </div>
          )}

          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => nav("/vaidya/panchakarma")} disabled={saving}>Cancel</Button>
            <Button disabled={!valid || saving} onClick={submit}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
