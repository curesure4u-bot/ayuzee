import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Star, Loader2, CheckCircle2, FileText, Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

type RatingKey = "overall" | "listening" | "explanation" | "time" | "video";

const RATING_ROWS: { key: RatingKey; label: string; hint: string }[] = [
  { key: "overall", label: "Overall experience", hint: "How was your consultation overall?" },
  { key: "listening", label: "Doctor's listening", hint: "Did the doctor listen carefully to your concerns?" },
  { key: "explanation", label: "Explanation clarity", hint: "Was the diagnosis & plan explained clearly?" },
  { key: "time", label: "Time given", hint: "Did you get enough time to discuss everything?" },
  { key: "video", label: "Video & audio quality", hint: "How was the call quality?" },
];

const SYMPTOM_SLIDERS = [
  { key: "pain", label: "Pain level", color: "bg-rose-500" },
  { key: "energy", label: "Energy level", color: "bg-amber-500" },
  { key: "sleep", label: "Sleep quality", color: "bg-indigo-500" },
  { key: "mood", label: "Mood", color: "bg-emerald-500" },
];

const StarRow = ({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="p-1 transition-transform hover:scale-110"
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
      >
        <Star
          className={`h-6 w-6 ${
            n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      </button>
    ))}
  </div>
);

const PostConsultationFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appt, setAppt] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [existing, setExisting] = useState<any>(null);

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    overall: 0, listening: 0, explanation: 0, time: 0, video: 0,
  });
  const [symptoms, setSymptoms] = useState<Record<string, number>>({
    pain: 5, energy: 5, sleep: 5, mood: 5,
  });
  const [recommend, setRecommend] = useState(true);
  const [outcome, setOutcome] = useState<"improved" | "same" | "worse" | "too_early">("too_early");
  const [review, setReview] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user || !id) { setLoading(false); return; }

      const { data: a } = await (supabase as any)
        .from("appointments").select("*").eq("id", id).maybeSingle();
      if (!a) { toast.error("Appointment not found"); setLoading(false); return; }
      setAppt(a);

      const [{ data: doc }, { data: ex }] = await Promise.all([
        (supabase as any).from("profiles").select("user_id, full_name").eq("user_id", a.doctor_id).maybeSingle(),
        (supabase as any).from("post_consultation_feedback").select("*").eq("appointment_id", id).maybeSingle(),
      ]);
      setDoctor(doc);

      if (ex) {
        setExisting(ex);
        let extra: any = {};
        try { extra = ex.comments ? JSON.parse(ex.comments).__meta || {} : {}; } catch { /* plain text */ }
        setRatings({
          overall: ex.rating || 0,
          listening: ex.listening_rating || 0,
          explanation: ex.clarity_rating || 0,
          time: extra.time || 0,
          video: extra.video || 0,
        });
        setSymptoms(extra.symptoms || { pain: 5, energy: 5, sleep: 5, mood: 5 });
        setRecommend(ex.would_recommend ?? true);
        setOutcome(ex.outcome_status || "too_early");
        try {
          const parsed = JSON.parse(ex.comments || "{}");
          setReview(parsed.review || ex.comments || "");
        } catch { setReview(ex.comments || ""); }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const submit = async () => {
    if (!appt) return;
    if (ratings.overall === 0) { toast.error("Please rate your overall experience"); return; }

    setSubmitting(true);
    try {
      const commentsPayload = JSON.stringify({
        review,
        __meta: {
          time: ratings.time,
          video: ratings.video,
          symptoms,
        },
      });

      const payload = {
        appointment_id: appt.id,
        patient_user_id: appt.user_id,
        doctor_id: appt.doctor_id,
        rating: ratings.overall,
        doctor_rating: ratings.overall,
        listening_rating: ratings.listening,
        clarity_rating: ratings.explanation,
        would_recommend: recommend,
        outcome_status: outcome,
        comments: commentsPayload,
      };

      const { error } = existing
        ? await (supabase as any).from("post_consultation_feedback").update(payload).eq("id", existing.id)
        : await (supabase as any).from("post_consultation_feedback").insert(payload);
      if (error) throw error;

      await (supabase as any).from("appointments")
        .update({ post_feedback_submitted: true }).eq("id", appt.id);

      toast.success("Thank you! Your feedback was submitted.");
      navigate(`/consultation/${appt.id}/summary`);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit feedback");
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100">
          <Stethoscope className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">How was your consultation?</h1>
          <p className="text-sm text-slate-600">
            with Dr. {doctor?.full_name || "—"} · {appt?.appointment_date} {appt?.time_slot}
          </p>
        </div>
      </div>

      {/* Ratings */}
      <Card className="mb-4 p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Rate your experience</h2>
        <div className="space-y-4">
          {RATING_ROWS.map((r) => (
            <div key={r.key} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{r.label}</p>
                <p className="text-xs text-slate-500">{r.hint}</p>
              </div>
              <StarRow value={ratings[r.key]} onChange={(v) => setRatings({ ...ratings, [r.key]: v })} />
            </div>
          ))}
        </div>
      </Card>

      {/* Symptom sliders */}
      <Card className="mb-4 p-5">
        <h2 className="mb-1 text-base font-semibold text-slate-900">How are you feeling now?</h2>
        <p className="mb-4 text-xs text-slate-500">0 = very poor, 10 = excellent</p>
        <div className="space-y-5">
          {SYMPTOM_SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm">{s.label}</Label>
                <Badge className={`${s.color} text-white`}>{symptoms[s.key]}/10</Badge>
              </div>
              <Slider
                value={[symptoms[s.key]]}
                min={0} max={10} step={1}
                onValueChange={(v) => setSymptoms({ ...symptoms, [s.key]: v[0] })}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Outcome */}
      <Card className="mb-4 p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Since the consultation, you feel…</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            { v: "improved", label: "Improved", emoji: "😊" },
            { v: "same", label: "Same", emoji: "😐" },
            { v: "worse", label: "Worse", emoji: "😟" },
            { v: "too_early", label: "Too early", emoji: "⏳" },
          ] as const).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setOutcome(o.v)}
              className={`rounded-lg border px-3 py-3 text-sm transition ${
                outcome === o.v
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="text-xl">{o.emoji}</div>
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Review */}
      <Card className="mb-4 p-5">
        <Label className="text-sm font-semibold text-slate-900">Write a review (optional)</Label>
        <p className="mb-2 text-xs text-slate-500">Your feedback helps other patients and the doctor improve.</p>
        <Textarea rows={4} value={review} onChange={(e) => setReview(e.target.value)}
          placeholder="What went well? What could be better?" />
      </Card>

      {/* Recommend */}
      <Card className="mb-6 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Would you recommend Dr. {doctor?.full_name || "—"}?</p>
            <p className="text-xs text-slate-500">Helps others discover great Ayurvedic care.</p>
          </div>
          <Switch checked={recommend} onCheckedChange={setRecommend} />
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={submit} disabled={submitting} size="lg" className="flex-1">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          Submit feedback
        </Button>
        <Link to={`/consultation/${appt?.id}/summary`} className="flex-1">
          <Button variant="outline" size="lg" className="w-full">
            <FileText className="mr-2 h-4 w-4" /> Skip & view summary
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PostConsultationFeedback;
