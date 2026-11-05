import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { setSEO } from "@/lib/seo";
import { ChevronLeft, AlertCircle } from "lucide-react";

type Doctor = {
  id: string;
  full_name: string;
  registration_number: string | null;
  specialization: string;
  consultation_fee: number;
};

type Pledge = {
  id: string;
  pledged_consultations_per_month: number;
  used_this_month: number;
  total_consultations_donated: number;
  total_fee_value_donated: number;
  pledge_motivation: string | null;
  is_active: boolean;
  pledge_since: string;
};

const PLEDGE_OPTIONS = [1, 2, 5];

const DoctorPledge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [pledge, setPledge] = useState<Pledge | null>(null);
  const [pledgeDoctorCount, setPledgeDoctorCount] = useState(0);
  const [assignedCases, setAssignedCases] = useState<any[]>([]);

  const [selectedCount, setSelectedCount] = useState(2);
  const [motivation, setMotivation] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSEO(
      "ATMRI Healing Doctor Pledge · Ayuzee",
      "Pledge free AYUSH consultations to ATMRI Trust patients and earn the Healing Doctor badge."
    );
  }, []);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id ?? null;
      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const [{ data: roles }, { data: doc }, { count }] = await Promise.all([
        (supabase as any).from("user_roles").select("role").eq("user_id", uid),
        (supabase as any)
          .from("doctors")
          .select("id, full_name, registration_number, specialization, consultation_fee")
          .eq("user_id", uid)
          .maybeSingle(),
        (supabase as any)
          .from("doctor_charity_pledges")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      const doctorRole = !!roles?.some((r: any) => r.role === "doctor");
      setIsDoctor(doctorRole);
      setDoctor(doc ?? null);
      setPledgeDoctorCount(count ?? 0);

      if (doc) {
        const { data: existing } = await (supabase as any)
          .from("doctor_charity_pledges")
          .select("*")
          .eq("doctor_id", doc.id)
          .maybeSingle();
        setPledge(existing ?? null);

        if (existing) {
          const { data: cases } = await (supabase as any)
            .from("atmri_sponsored_cases")
            .select("id, patient_name, condition_name, status, doctor_countersigned")
            .eq("assigned_doctor_user_id", uid)
            .order("created_at", { ascending: false });
          setAssignedCases(cases ?? []);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleTakePledge = async () => {
    if (!userId || !doctor || !agreed) return;
    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any)
        .from("doctor_charity_pledges")
        .insert({
          doctor_id: doctor.id,
          doctor_user_id: userId,
          pledged_consultations_per_month: selectedCount,
          pledge_motivation: motivation.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      setPledge(data);
      toast.success("🎉 Pledge taken! You are now an ATMRI Healing Doctor.");
    } catch (e: any) {
      toast.error(e.message || "Could not save pledge");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePauseToggle = async () => {
    if (!pledge) return;
    const { error } = await (supabase as any)
      .from("doctor_charity_pledges")
      .update({ is_active: !pledge.is_active })
      .eq("id", pledge.id);
    if (error) return toast.error(error.message);
    setPledge({ ...pledge, is_active: !pledge.is_active });
    toast.success(pledge.is_active ? "Pledge paused (30 days notice)" : "Pledge reactivated");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🏅</div>
          <h1 className="font-display text-2xl mb-3">Sign in as a doctor to take the pledge</h1>
          <p className="text-muted-foreground mb-6">Only verified AYUSH doctors can become ATMRI Healing Doctors.</p>
          <Button onClick={() => navigate("/doctor/auth")} size="lg">Doctor Sign In</Button>
        </div>
      </div>
    );
  }

  if (!isDoctor || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-amber-500 mb-3" />
          <h1 className="font-display text-2xl mb-3">This page is for verified AYUSH doctors</h1>
          <p className="text-muted-foreground mb-6">If you're a doctor, please complete your verification first.</p>
          <Button onClick={() => navigate("/doctor/auth")} size="lg">Doctor Sign In / Register</Button>
        </div>
      </div>
    );
  }

  if (pledge) {
    const pendingCountersigns = assignedCases.filter((c) => !c.doctor_countersigned).length;
    const usedPct = pledge.pledged_consultations_per_month > 0
      ? (pledge.used_this_month / pledge.pledged_consultations_per_month) * 100
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background py-10">
        <div className="container max-w-4xl">
          <Link to="/atmri-help" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> ATMRI Help
          </Link>

          <div className="text-center mb-8">
            <div className="rounded-full bg-amber-100 border-2 border-amber-400 h-24 w-24 flex items-center justify-center text-4xl mx-auto mb-4 shadow-elegant">
              🏅
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-amber-700">You are an ATMRI Healing Doctor</h1>
            <p className="text-muted-foreground mt-2">Dr. {doctor.full_name} · Pledged since {new Date(pledge.pledge_since).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="text-3xl font-display text-primary">{pledge.pledged_consultations_per_month}</div>
              <div className="text-xs text-muted-foreground mt-1">Pledged per month</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="text-3xl font-display text-primary">{pledge.used_this_month}/{pledge.pledged_consultations_per_month}</div>
              <div className="text-xs text-muted-foreground mt-1">Used this month</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="text-3xl font-display text-primary">{pledge.total_consultations_donated}</div>
              <div className="text-xs text-muted-foreground mt-1">Lifetime donated</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">This month's progress</span>
              <span className="text-sm text-muted-foreground">₹{pledge.total_fee_value_donated.toLocaleString()} value donated lifetime</span>
            </div>
            <Progress value={usedPct} className="h-2" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="font-display text-xl mb-4">🌿 Your Assigned Cases</h2>
            {pendingCountersigns > 0 && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 mb-4 flex items-center justify-between">
                <span className="text-sm text-destructive font-medium">
                  🔴 {pendingCountersigns} patient(s) need your countersignature
                </span>
              </div>
            )}
            {assignedCases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cases assigned yet. We'll notify you when a patient matches your specialization.</p>
            ) : (
              <div className="space-y-2">
                {assignedCases.map((c) => (
                  <Link
                    key={c.id}
                    to={`/atmri-help/cases/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <div className="font-medium">{c.patient_name.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground">{c.condition_name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!c.doctor_countersigned && (
                        <span className="text-xs rounded-full bg-destructive/10 text-destructive px-2 py-0.5">
                          Sign needed
                        </span>
                      )}
                      <span className="text-xs rounded-full bg-accent px-2 py-0.5 capitalize">
                        {c.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl mb-4">Manage Pledge</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Pledge status</div>
                <div className="text-xs text-muted-foreground">
                  {pledge.is_active ? "Active — accepting case assignments" : "Paused — no new cases"}
                </div>
              </div>
              <Button variant="outline" onClick={handlePauseToggle}>
                {pledge.is_active ? "Pause Pledge" : "Reactivate"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background py-10">
      <div className="container max-w-3xl">
        <Link to="/atmri-help" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> ATMRI Help
        </Link>

        <div className="text-center py-8 max-w-2xl mx-auto">
          <div className="text-5xl mb-4">🏅</div>
          <h1 className="font-display text-3xl md:text-4xl">Take the ATMRI Healing Doctor Pledge</h1>
          <p className="text-muted-foreground mt-3">
            Pledge free consultations to underprivileged patients treated by ATMRI Trust.
            Earn the AYUSH Healing Doctor badge on your Ayuzee profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl mb-2">🌿</div>
            <div className="font-semibold">Real impact</div>
            <p className="text-xs text-muted-foreground mt-1">Your 1 consult = 1 less patient quitting Ayurvedic treatment</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl mb-2">🏅</div>
            <div className="font-semibold">Recognition</div>
            <p className="text-xs text-muted-foreground mt-1">Gold badge on your public Ayuzee profile and case pages</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl mb-2">💫</div>
            <div className="font-semibold">Community</div>
            <p className="text-xs text-muted-foreground mt-1">Join {pledgeDoctorCount} doctors already pledging</p>
          </div>
        </div>

        <div className="max-w-md mx-auto rounded-2xl border border-border bg-card shadow-elegant p-8">
          <h3 className="font-display text-lg mb-4">How many free consultations will you donate each month?</h3>
          <div className="flex gap-3 mb-6">
            {PLEDGE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedCount(n)}
                className={`flex-1 rounded-2xl border-2 p-4 text-center transition-all ${
                  selectedCount === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="font-display text-2xl">{n}</div>
                <div className="text-xs opacity-80">consult{n > 1 ? "s" : ""}/month</div>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium">Why do you want to help? <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Share your motivation..."
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div className="h-40 overflow-y-auto bg-muted rounded-xl p-4 mt-4 text-xs leading-relaxed">
            <div className="font-bold mb-2">DOCTOR CHARITY PLEDGE DECLARATION</div>
            <p className="mb-2">
              I, Dr. {doctor.full_name} (Registration No: {doctor.registration_number || "—"}),
              hereby pledge the following:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>I will provide {selectedCount} free AYUSH consultations per month to patients sponsored by ATMRI Trust (AYUSH & Traditional Medicine Research Institute Trust).</li>
              <li>I will treat each assigned patient with the same standard of care as a paying patient.</li>
              <li>For each assigned patient, I will personally examine them and provide a complete consultation including diagnosis, treatment plan, and prescription.</li>
              <li>I will countersign the patient's ATMRI Trust application with a legal declaration confirming their medical condition.</li>
              <li>I understand this pledge is voluntary and I may pause or stop with 30 days notice to the Trust.</li>
            </ol>
            <p className="mt-2 italic">This pledge is made in the spirit of Ayurvedic seva (service) and charitable care.</p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer mt-4">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-0.5" />
            <span className="text-sm">I have read and agree to the pledge declaration</span>
          </label>

          <Button
            size="lg"
            className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            disabled={!agreed || submitting}
            onClick={handleTakePledge}
          >
            🏅 {submitting ? "Saving…" : "Take the Pledge"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPledge;
