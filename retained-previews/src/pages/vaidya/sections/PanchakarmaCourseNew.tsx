import { useEffect, useMemo, useRef, useState } from "react";
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
import { AlertTriangle, ArrowLeft, ArrowRight, Eraser, Loader2, ShieldCheck } from "lucide-react";

type TherapyType = {
  id: string;
  name: string;
  description: string | null;
  is_privileged: boolean;
  standard_prep_days: number | null;
};
type Patient = { user_id: string; full_name: string; phone: string | null };
type Venue = {
  id: string;
  name: string;
  city: string | null;
  registration_status: string;
  is_active: boolean;
  offered_therapy_type_ids: string[] | null;
};

const RULE_LABELS: Record<string, string> = {
  start_date_past: "Start date is in the past.",
  planned_sessions_out_of_range: "Planned sessions must be between 1 and 60.",
  vaidya_double_booked: "You already have another commitment inside this window.",
  venue_not_approved: "The selected venue is not approved / active.",
  therapy_not_offered_at_venue: "The venue does not offer this therapy type.",
  consent_not_signed: "Patient consent is not signed.",
  consent_revoked: "Patient consent has been revoked.",
};

const defaultConsent = (t: TherapyType | null, patientName: string, venueName: string) =>
  `PANCHAKARMA CONSENT — ${t?.name ?? ""}

Patient: ${patientName || "___________"}
Venue: ${venueName || "___________"}

I understand that I have been advised to undergo the classical Ayurvedic Panchakarma procedure "${t?.name ?? ""}" as prescribed by my Vaidya. The prescribing Vaidya has explained to me:

1. The nature of the procedure, its purpose, and the sequence of Purva-karma (preparation), Pradhana-karma (main procedure) and Paschat-karma (post-procedure care).
2. The expected therapeutic benefits, along with the possibility of transient symptoms (fatigue, giddiness, loose motions, mild fever, temporary emotional changes) that can occur as part of shodhana.
3. Known contraindications and the importance of disclosing my full medical history, current medications, allergies and pregnancy status.
4. That strict adherence to diet (pathya), rest, and daily instructions is essential; non-compliance may reduce benefit or cause harm.
5. That any adverse event, discomfort or change in symptoms must be reported to the Vaidya or therapy team immediately.

Protocol summary from the treating institution:
${t?.description?.trim() || "(Standard institutional protocol as maintained in the Panchakarma department.)"}

I have had the opportunity to ask questions and have received satisfactory answers. I voluntarily consent to undergo this Panchakarma course under the care of the prescribing Vaidya at the above venue.`;

export default function PanchakarmaCourseNew() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [therapyTypes, setTherapyTypes] = useState<TherapyType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  // form
  const [patientUserId, setPatientUserId] = useState<string>("");
  const [therapyTypeId, setTherapyTypeId] = useState<string>("");
  const [venueId, setVenueId] = useState<string>("");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [plannedSessions, setPlannedSessions] = useState<number>(7);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // consent
  const [consentText, setConsentText] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  // server rejection surface
  const [blockedRule, setBlockedRule] = useState<{ rule: string | null; message: string } | null>(null);

  const selectedTherapy = useMemo(
    () => therapyTypes.find((t) => t.id === therapyTypeId) ?? null,
    [therapyTypes, therapyTypeId]
  );
  const selectedPatient = useMemo(
    () => patients.find((p) => p.user_id === patientUserId) ?? null,
    [patients, patientUserId]
  );
  const eligibleVenues = useMemo(() => {
    if (!therapyTypeId) return [] as Venue[];
    return venues.filter(
      (v) =>
        v.registration_status === "approved" &&
        v.is_active &&
        (v.offered_therapy_type_ids ?? []).includes(therapyTypeId),
    );
  }, [venues, therapyTypeId]);
  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === venueId) ?? null,
    [venues, venueId]
  );

  // Reset venue if therapy changes to one it doesn't offer
  useEffect(() => {
    if (venueId && !eligibleVenues.some((v) => v.id === venueId)) setVenueId("");
  }, [eligibleVenues, venueId]);

  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", u.user.id).maybeSingle();
      setDoctorId(doc?.id ?? null);

      const [tt, appts, vs] = await Promise.all([
        supabase.from("panchakarma_therapy_types").select("id,name,description,is_privileged,standard_prep_days").eq("is_active", true).order("name"),
        doc?.id
          ? supabase.from("appointments").select("user_id").eq("doctor_id", doc.id)
          : Promise.resolve({ data: [] as any[] } as any),
        supabase.from("panchakarma_venues")
          .select("id,name,city,registration_status,is_active,offered_therapy_type_ids")
          .eq("registration_status", "approved")
          .eq("is_active", true)
          .order("name"),
      ]);

      setTherapyTypes((tt.data ?? []) as TherapyType[]);
      setVenues(((vs as any).data ?? []) as Venue[]);

      const uids = Array.from(new Set(((appts as any).data ?? []).map((r: any) => r.user_id).filter(Boolean))) as string[];
      if (uids.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id,full_name,phone").in("user_id", uids);
        setPatients(((profs ?? []) as any[]).map((p) => ({ user_id: p.user_id, full_name: p.full_name || "Unnamed", phone: p.phone })));
      }
      setLoading(false);
    })();
  }, []);

  // Prefill consent text when moving to step 2
  useEffect(() => {
    if (step === 2 && !consentText) {
      setConsentText(defaultConsent(selectedTherapy, selectedPatient?.full_name ?? "", selectedVenue?.name ?? ""));
    }
  }, [step]); // eslint-disable-line

  // Canvas signature setup
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || step !== 2) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, c.clientWidth, c.clientHeight);
  }, [step]);

  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = posFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = posFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) setHasSignature(true);
  };
  const endDraw = () => { drawing.current = false; };
  const clearSig = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, c.clientWidth, c.clientHeight);
    setHasSignature(false);
  };

  const step1Valid = !!(
    patientUserId &&
    therapyTypeId &&
    venueId &&
    provisionalDiagnosis.trim() &&
    plannedSessions > 0 && plannedSessions <= 60 &&
    startDate && startDate >= todayIso
  );

  const submit = async () => {
    if (!doctorId) { toast.error("Vaidya profile not found."); return; }
    if (!hasSignature) { toast.error("Patient signature is required."); return; }
    if (!consentText.trim()) { toast.error("Consent text cannot be empty."); return; }

    // Client-side pre-checks matching the DB trigger rules
    if (startDate < todayIso) {
      setBlockedRule({ rule: "start_date_past", message: RULE_LABELS.start_date_past });
      toast.error(RULE_LABELS.start_date_past); return;
    }
    if (!selectedVenue || selectedVenue.registration_status !== "approved" || !selectedVenue.is_active) {
      setBlockedRule({ rule: "venue_not_approved", message: RULE_LABELS.venue_not_approved });
      toast.error(RULE_LABELS.venue_not_approved); return;
    }
    if (!(selectedVenue.offered_therapy_type_ids ?? []).includes(therapyTypeId)) {
      setBlockedRule({ rule: "therapy_not_offered_at_venue", message: RULE_LABELS.therapy_not_offered_at_venue });
      toast.error(RULE_LABELS.therapy_not_offered_at_venue); return;
    }

    setBlockedRule(null);
    setSaving(true);
    let consentId: string | null = null;
    try {
      // 1. Create consent (unsigned)
      const { data: consent, error: cErr } = await supabase
        .from("panchakarma_consents")
        .insert({
          patient_id: patientUserId,
          vaidya_id: doctorId,
          therapy_type_id: therapyTypeId,
          venue_id: venueId,
          consent_text: consentText.trim(),
        })
        .select("id")
        .single();
      if (cErr || !consent) throw cErr ?? new Error("Consent insert failed");
      consentId = consent.id;

      // 2. Upload signature PNG to private bucket
      const canvas = canvasRef.current!;
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Signature capture failed"))), "image/png")
      );
      const path = `${consent.id}.png`;
      const { error: upErr } = await supabase.storage
        .from("panchakarma-consents")
        .upload(path, blob, { contentType: "image/png", upsert: true });
      if (upErr) throw upErr;

      // 3. Generate a short-lived signed URL (kept alongside the storage path for quick access)
      const { data: signed } = await supabase.storage
        .from("panchakarma-consents")
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

      // 4. Mark consent as signed
      const { error: uErr } = await supabase
        .from("panchakarma_consents")
        .update({
          signature_data: path,
          patient_signature_url: signed?.signedUrl ?? null,
          signed_at: new Date().toISOString(),
        })
        .eq("id", consent.id);
      if (uErr) throw uErr;

      // 5. Create the course referencing the signed consent
      const coursePayload = {
        patient_id: patientUserId,
        prescribing_vaidya_id: doctorId,
        therapy_type_id: therapyTypeId,
        consent_id: consent.id,
        venue_id: venueId,
        provisional_diagnosis: provisionalDiagnosis.trim(),
        planned_sessions: plannedSessions,
        start_date: startDate,
        status: "active",
      };

      const { data: course, error: crErr } = await supabase
        .from("panchakarma_courses")
        .insert(coursePayload)
        .select("id")
        .single();

      if (crErr || !course) {
        // Extract machine-readable rule from trigger DETAIL (e.g. "rule=venue_not_approved").
        const detail = (crErr as any)?.details ?? (crErr as any)?.detail ?? "";
        const ruleMatch = /rule=([a-z_]+)/i.exec(String(detail));
        const failedRule = ruleMatch ? ruleMatch[1] : null;
        const friendly = failedRule && RULE_LABELS[failedRule] ? RULE_LABELS[failedRule] : (crErr?.message ?? "Course creation was blocked by a server safety check.");

        setBlockedRule({ rule: failedRule, message: friendly });

        await supabase.rpc("log_panchakarma_course_attempt", {
          _action: "insert",
          _course_id: null,
          _payload: coursePayload as any,
          _outcome: "blocked",
          _failed_rule: failedRule,
          _error_message: crErr?.message ?? "unknown",
        });

        throw new Error(friendly);
      }
      toast.success("Panchakarma course created with signed consent.");
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
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold">New Panchakarma Course</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prescribe a course, capture the patient's informed consent, then start scheduling sessions.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-xs">
        <Badge variant={step === 1 ? "default" : "secondary"}>1. Prescription</Badge>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <Badge variant={step === 2 ? "default" : "secondary"}>2. Consent & signature</Badge>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Prescription details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Patient</Label>
              <Select value={patientUserId} onValueChange={setPatientUserId}>
                <SelectTrigger><SelectValue placeholder={patients.length ? "Select a patient" : "No patients found — book an appointment first"} /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.full_name}{p.phone ? ` · ${p.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Therapy type</Label>
              <Select value={therapyTypeId} onValueChange={setTherapyTypeId}>
                <SelectTrigger><SelectValue placeholder={therapyTypes.length ? "Select therapy" : "No active therapy types configured"} /></SelectTrigger>
                <SelectContent>
                  {therapyTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}{t.is_privileged ? " · privileged" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTherapy && (
                <div className="rounded-md border bg-muted/40 p-3 mt-2 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold">Current approved protocol</span>
                    {selectedTherapy.standard_prep_days != null && (
                      <span className="text-muted-foreground">· Prep {selectedTherapy.standard_prep_days} d</span>
                    )}
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedTherapy.description?.trim() || "No protocol description recorded for this therapy type."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Select value={venueId} onValueChange={setVenueId} disabled={!therapyTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    !therapyTypeId ? "Select a therapy first"
                    : eligibleVenues.length ? "Select an approved venue"
                    : "No approved venues currently offer this therapy"
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
              {therapyTypeId && !eligibleVenues.length && (
                <p className="text-[11px] text-muted-foreground">
                  Only approved, active venues that list this therapy in their offered types are shown.
                </p>
              )}
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

            <Separator />
            <div className="flex justify-end">
              <Button disabled={!step1Valid} onClick={() => setStep(2)}>
                Continue to consent <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informed consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3 bg-muted/30 text-xs space-y-1">
              <div><span className="font-semibold">Patient:</span> {selectedPatient?.full_name}</div>
              <div><span className="font-semibold">Therapy:</span> {selectedTherapy?.name}</div>
              <div><span className="font-semibold">Venue:</span> {selectedVenue?.name}{selectedVenue?.city ? ` · ${selectedVenue.city}` : ""}</div>
              <div><span className="font-semibold">Provisional diagnosis:</span> {provisionalDiagnosis}</div>
              <div><span className="font-semibold">Planned sessions:</span> {plannedSessions} · starting {startDate}</div>
            </div>

            <div className="space-y-1.5">
              <Label>Consent text (Vaidya to review & explain to patient)</Label>
              <Textarea
                value={consentText}
                onChange={(e) => setConsentText(e.target.value)}
                rows={12}
                className="font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Patient signature</Label>
                <Button type="button" variant="ghost" size="sm" onClick={clearSig}>
                  <Eraser className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>
              <div className="rounded-md border bg-background">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 touch-none rounded-md cursor-crosshair"
                  onPointerDown={startDraw}
                  onPointerMove={draw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Signature is stored privately; only your clinic team can retrieve it via a signed URL.
              </p>
            </div>

            {blockedRule && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" /> Course creation blocked
                </div>
                <p className="text-foreground">{blockedRule.message}</p>
                {blockedRule.rule && (
                  <p className="text-muted-foreground">Server rule: <code className="text-[10px]">{blockedRule.rule}</code></p>
                )}
              </div>
            )}

            <Separator />
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={saving}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={submit} disabled={saving || !hasSignature}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign & create course
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
