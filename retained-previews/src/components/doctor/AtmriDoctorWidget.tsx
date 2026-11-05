import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertTriangle, Award, Leaf, ChevronRight } from "lucide-react";

type Pledge = {
  id: string;
  pledged_consultations_per_month: number;
  used_this_month: number;
  total_consultations_donated: number;
  total_fee_value_donated: number;
};

type SponsoredCase = {
  id: string;
  patient_name: string;
  condition_name: string;
  treatment_plan: string;
  treatment_duration_days: number | null;
  treatment_location: string | null;
  sessions_completed: number | null;
  total_sessions_planned: number | null;
  created_at: string;
};

type Props = {
  doctorId: string;
  doctorUserId: string;
  consultationFee: number;
  doctorName?: string;
  registrationNumber?: string | null;
};

const initials = (n: string) =>
  n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

const daysAgo = (iso: string) => {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  return d === 0 ? "today" : `${d} day${d > 1 ? "s" : ""} ago`;
};

export const AtmriDoctorWidget = ({
  doctorId,
  doctorUserId,
  consultationFee,
  doctorName = "",
  registrationNumber = "",
}: Props) => {
  const navigate = useNavigate();
  const [pledge, setPledge] = useState<Pledge | null>(null);
  const [pendingCases, setPendingCases] = useState<SponsoredCase[]>([]);
  const [activeCases, setActiveCases] = useState<SponsoredCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [signCase, setSignCase] = useState<SponsoredCase | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [signing, setSigning] = useState(false);
  const declarationRef = useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    const [pl, pending, active] = await Promise.all([
      supabase
        .from("doctor_charity_pledges")
        .select("id, pledged_consultations_per_month, used_this_month, total_consultations_donated, total_fee_value_donated")
        .eq("doctor_user_id", doctorUserId)
        .maybeSingle(),
      supabase
        .from("atmri_sponsored_cases")
        .select("id, patient_name, condition_name, treatment_plan, treatment_duration_days, treatment_location, sessions_completed, total_sessions_planned, created_at")
        .eq("assigned_doctor_user_id", doctorUserId)
        .eq("doctor_countersigned", false)
        .in("status", ["doctor_assigned", "approved"]),
      supabase
        .from("atmri_sponsored_cases")
        .select("id, patient_name, condition_name, treatment_plan, treatment_duration_days, treatment_location, sessions_completed, total_sessions_planned, created_at")
        .eq("assigned_doctor_user_id", doctorUserId)
        .eq("status", "in_treatment"),
    ]);
    setPledge((pl.data as Pledge | null) ?? null);
    setPendingCases((pending.data as SponsoredCase[]) ?? []);
    setActiveCases((active.data as SponsoredCase[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!doctorUserId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorUserId]);

  const openSignDialog = (c: SponsoredCase) => {
    setSignCase(c);
    setAgreed(false);
    setScrolledToBottom(false);
  };

  const handleScroll = () => {
    const el = declarationRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToBottom(true);
    }
  };

  const handleSign = async () => {
    if (!signCase) return;
    setSigning(true);
    try {
      const { data, error } = await supabase.functions.invoke("atmri-doctor-sign", {
        body: { case_id: signCase.id, consultation_fee: consultationFee },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast.success(`✅ Countersigned! ${signCase.patient_name.split(" ")[0]}'s treatment can now begin.`);
      setSignCase(null);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign";
      toast.error(message);
    } finally {
      setSigning(false);
    }
  };

  if (loading || !doctorUserId) return null;

  const monthUsedPct = pledge
    ? Math.min(100, Math.round((pledge.used_this_month / Math.max(1, pledge.pledged_consultations_per_month)) * 100))
    : 0;
  const showBadgeCard = !!pledge && pledge.total_consultations_donated > 0;

  return (
    <section className="space-y-4">
      {/* Section A — pending signatures */}
      {pendingCases.length > 0 && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                🔴 {pendingCases.length} patient{pendingCases.length > 1 ? "s" : ""} need your countersignature
              </h3>
              <p className="mt-1 text-sm text-red-800/80">
                Please review and sign their ATMRI Trust application. Patients cannot start free treatment until you countersign.
              </p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-red-200/70">
            {pendingCases.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm text-primary">
                  {initials(c.patient_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.patient_name.split(" ")[0]} · <span className="text-muted-foreground">{c.condition_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Submitted {daysAgo(c.created_at)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openSignDialog(c)}>
                  Review &amp; Sign
                </Button>
              </div>
            ))}
          </div>
          {pendingCases.length > 3 && (
            <Link to="/atmri-help/pledge" className="mt-2 inline-flex items-center text-xs font-medium text-red-700 hover:underline">
              See all {pendingCases.length} →
            </Link>
          )}
        </div>
      )}

      {/* Section B — Healing Doctor badge OR pledge CTA */}
      {showBadgeCard ? (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5">
          <div className="text-center">
            <span className="block text-5xl">🏅</span>
            <h3 className="mt-3 font-display text-xl text-amber-900">ATMRI Healing Doctor</h3>
            <p className="mt-1 text-sm text-amber-800/80">Your charitable contributions</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-display text-lg font-semibold text-amber-900">{pledge!.total_consultations_donated}</p>
              <p className="text-[11px] text-amber-800/80">consultations donated</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-display text-lg font-semibold text-emerald-700">
                ₹{(pledge!.total_fee_value_donated || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-700/80">value given</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-display text-lg font-semibold text-sky-700">
                {pledge!.pledged_consultations_per_month}/mo
              </p>
              <p className="text-[11px] text-sky-700/80">pledged</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-amber-900/80">
              <span>This month</span>
              <span>
                {pledge!.used_this_month}/{pledge!.pledged_consultations_per_month} used
              </span>
            </div>
            <Progress value={monthUsedPct} className="mt-1.5 h-2 bg-amber-200/60" />
          </div>
          <div className="mt-3 text-right">
            <Link to="/atmri-help/pledge" className="text-xs font-medium text-primary hover:underline">
              Edit Pledge →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">🌿 Join the ATMRI Healing Doctor Program</h3>
              <p className="mt-1 text-sm text-amber-800/80">
                Pledge free consultations to underprivileged patients. Earn the gold ATMRI Healing Doctor badge on your Ayuzee profile.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => navigate(`/atmri-help/pledge?pledge=${n}`)}
                    className="rounded-full border border-amber-400 bg-white/70 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
                  >
                    {n}/month
                  </button>
                ))}
              </div>
              <Button size="sm" variant="hero" className="mt-3" asChild>
                <Link to="/atmri-help/pledge">Take the Pledge →</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Section C — active cases */}
      {activeCases.length > 0 && (
        <div>
          <h4 className="mt-1 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Leaf className="mr-1 inline h-3.5 w-3.5 text-primary" />
            Patients You Are Treating
          </h4>
          <div className="space-y-3">
            {activeCases.map((c) => {
              const total = c.total_sessions_planned || 0;
              const done = c.sessions_completed || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const parts = c.patient_name.split(" ");
              const display = parts[0] + (parts[1] ? " " + parts[1][0] + "." : "");
              return (
                <div key={c.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm text-primary">
                      {initials(c.patient_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {display} <span className="text-muted-foreground">· {c.condition_name}</span>
                      </p>
                      <p className="text-xs text-emerald-700">🟢 In Treatment</p>
                    </div>
                    <Link
                      to={`/atmri-help/cases/${c.id}`}
                      className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                    >
                      View Case <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  {total > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {done}/{total} sessions
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="mt-1 h-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signature Dialog */}
      <Dialog open={!!signCase} onOpenChange={(o) => !o && setSignCase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ATMRI Trust — Medical Countersignature</DialogTitle>
          </DialogHeader>
          {signCase && (
            <div className="space-y-4">
              <div className="rounded-xl bg-accent/30 p-4 text-sm">
                <p className="font-semibold">
                  {signCase.patient_name.split(" ")[0]} · {signCase.condition_name}
                </p>
                <p className="mt-1 line-clamp-2 text-muted-foreground">{signCase.treatment_plan}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Estimated treatment: {signCase.treatment_duration_days ?? "—"} days
                  {signCase.treatment_location ? ` at ${signCase.treatment_location}` : ""}
                </p>
              </div>

              <div
                ref={declarationRef}
                onScroll={handleScroll}
                className="h-48 overflow-y-auto rounded-xl bg-muted p-4 font-mono text-xs leading-relaxed"
              >
                <p className="font-semibold">LEGAL DECLARATION — ATMRI Trust Medical Countersignature</p>
                <p className="mt-2">
                  I, Dr. {doctorName || "[Doctor Name]"} (Registration No: {registrationNumber || "[Reg No]"}), hereby solemnly declare:
                </p>
                <p className="mt-2">1. I have personally examined the patient named in this ATMRI Trust application.</p>
                <p className="mt-2">
                  2. The stated medical condition ({signCase.condition_name}) has been clinically verified by me through examination and review of provided medical records.
                </p>
                <p className="mt-2">
                  3. The recommended Ayurvedic treatment ({signCase.treatment_plan}) is medically indicated for this patient based on my clinical assessment.
                </p>
                <p className="mt-2">
                  4. I endorse this application for ATMRI Trust (AYUSH &amp; Traditional Medicine Research Institute Trust) sponsored free treatment.
                </p>
                <p className="mt-2">
                  5. I understand that as the countersigning physician, I bear professional responsibility for the accuracy of this declaration.
                </p>
                <p className="mt-2">
                  I make this declaration in good faith and in the spirit of Ayurvedic seva (charitable service) for the benefit of this patient.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Note: False certification is a violation of the Indian Medical Council Act and may be punishable under IPC Section 197.
                </p>
                <p className="mt-3 border-t pt-2">
                  Dr. {doctorName} | Reg: {registrationNumber || "—"} | Signed: {new Date().toLocaleString("en-IN")}
                </p>
              </div>

              {!scrolledToBottom && (
                <p className="animate-bounce text-center text-xs text-muted-foreground">
                  ⬇ Please scroll to read the full declaration
                </p>
              )}

              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={agreed}
                  disabled={!scrolledToBottom}
                  onCheckedChange={(v) => setAgreed(!!v)}
                />
                <span>I have read, understood, and agree to the above legal declaration</span>
              </label>

              <Button
                variant="hero"
                className="w-full"
                disabled={!agreed || signing}
                onClick={handleSign}
              >
                {signing ? "Signing…" : "Sign Countersignature"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AtmriDoctorWidget;
