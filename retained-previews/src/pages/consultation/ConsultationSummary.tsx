import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Printer, CalendarPlus, Pill, Apple, Activity, Sparkles,
  Loader2, FileText, Sun, Moon, Coffee, Star, Clock,
} from "lucide-react";
import { toast } from "sonner";

const TIME_BADGES: Record<string, { label: string; icon: any; color: string }> = {
  morning: { label: "Morning", icon: Sun, color: "bg-amber-100 text-amber-800 border-amber-200" },
  afternoon: { label: "Afternoon", icon: Coffee, color: "bg-orange-100 text-orange-800 border-orange-200" },
  evening: { label: "Evening", icon: Sun, color: "bg-rose-100 text-rose-800 border-rose-200" },
  night: { label: "Night", icon: Moon, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  before_food: { label: "Before food", icon: Clock, color: "bg-slate-100 text-slate-800 border-slate-200" },
  after_food: { label: "After food", icon: Clock, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const TimeBadge = ({ slot }: { slot: string }) => {
  const cfg = TIME_BADGES[slot] || { label: slot, icon: Clock, color: "bg-slate-100 text-slate-700 border-slate-200" };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} gap-1`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </Badge>
  );
};

const ConsultationSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appt, setAppt] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [guidance, setGuidance] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data: a } = await (supabase as any)
        .from("appointments").select("*").eq("id", id).maybeSingle();
      if (!a) { toast.error("Appointment not found"); setLoading(false); return; }
      setAppt(a);

      const [{ data: doc }, { data: pat }, { data: ass }, { data: g }] = await Promise.all([
        (supabase as any).from("profiles").select("user_id, full_name").eq("user_id", a.doctor_id).maybeSingle(),
        (supabase as any).from("profiles").select("user_id, full_name, phone").eq("user_id", a.user_id).maybeSingle(),
        (supabase as any).from("consultation_assessments").select("*").eq("appointment_id", id).maybeSingle(),
        (supabase as any).from("consultation_guidance").select("*").eq("appointment_id", id).order("created_at", { ascending: true }),
      ]);
      setDoctor(doc); setPatient(pat); setAssessment(ass); setGuidance(g || []);
      setLoading(false);
    };
    load();
  }, [id]);

  const dietItems = useMemo(() => guidance.filter((g) => g.guidance_type === "diet"), [guidance]);
  const yogaItems = useMemo(() => guidance.filter((g) => g.guidance_type === "yoga"), [guidance]);
  const medItems = useMemo(() => guidance.filter((g) => g.guidance_type === "medicine_schedule"), [guidance]);
  const otherItems = useMemo(() => guidance.filter((g) => !["diet", "yoga", "medicine_schedule"].includes(g.guidance_type)), [guidance]);

  const printRx = () => window.print();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-3 text-xl font-bold">Summary not yet available</h1>
        <p className="mt-1 text-sm text-slate-600">Your doctor is still completing the consultation notes.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Link to={`/consultation/${id}/post-feedback`}>
            <Button variant="outline" size="sm">
              <Star className="mr-1 h-4 w-4" /> Leave feedback
            </Button>
          </Link>
          <Button size="sm" onClick={printRx}>
            <Printer className="mr-1 h-4 w-4" /> Print prescription
          </Button>
        </div>
      </div>

      <Card className="mb-4 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-700">Consultation Summary</p>
            <h1 className="text-2xl font-bold text-slate-900">{patient?.full_name || "Patient"}</h1>
            <p className="text-sm text-slate-600">
              with Dr. {doctor?.full_name || "—"} · {appt?.appointment_date} {appt?.time_slot}
            </p>
          </div>
          <Badge variant="outline" className="border-emerald-400 text-emerald-700">{appt?.mode}</Badge>
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Sparkles className="h-4 w-4 text-emerald-600" /> Diagnosis
        </h2>
        <p className="whitespace-pre-wrap text-slate-800">
          {assessment.diagnosis || assessment.assessment || "—"}
        </p>
        {assessment.plan && (
          <>
            <Separator className="my-3" />
            <p className="text-xs font-semibold uppercase text-slate-500">Plan</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{assessment.plan}</p>
          </>
        )}
      </Card>

      <Card className="mb-4 p-5 print:shadow-none">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Pill className="h-4 w-4 text-emerald-600" /> Prescription (Rx)
          </h2>
          <Button size="sm" variant="ghost" onClick={printRx} className="print:hidden">
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
        </div>
        {assessment.prescription ? (
          <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 font-mono text-sm text-slate-800">
            {assessment.prescription}
          </pre>
        ) : (
          <p className="text-sm text-slate-500">No prescription added.</p>
        )}
      </Card>

      {medItems.length > 0 && (
        <Card className="mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Clock className="h-4 w-4 text-indigo-600" /> Medicine Schedule
          </h2>
          <div className="space-y-3">
            {medItems.map((m) => (
              <div key={m.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-slate-900">{m.title}</p>
                  {m.start_date && (
                    <span className="text-xs text-slate-500">
                      {m.start_date}{m.end_date ? ` → ${m.end_date}` : ""}
                    </span>
                  )}
                </div>
                {Array.isArray(m.schedule?.items) ? (
                  <div className="space-y-2">
                    {m.schedule.items.map((it: any, i: number) => (
                      <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-slate-800">{it.name}</span>
                        {it.dose && <span className="text-slate-600">— {it.dose}</span>}
                        {(it.times || []).map((t: string, j: number) => <TimeBadge key={j} slot={t} />)}
                      </div>
                    ))}
                  </div>
                ) : m.content?.notes ? (
                  <p className="text-sm text-slate-700">{m.content.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      )}

      {dietItems.length > 0 && (
        <Card className="mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Apple className="h-4 w-4 text-rose-600" /> Diet Advice
          </h2>
          <div className="space-y-3">
            {dietItems.map((d) => (
              <div key={d.id} className="rounded-lg border border-rose-100 bg-rose-50/40 p-3">
                <p className="font-medium text-slate-900">{d.title}</p>
                {d.content?.do_eat?.length ? (
                  <p className="mt-1 text-sm text-slate-700"><span className="font-semibold text-emerald-700">Eat:</span> {d.content.do_eat.join(", ")}</p>
                ) : null}
                {d.content?.avoid?.length ? (
                  <p className="mt-1 text-sm text-slate-700"><span className="font-semibold text-rose-700">Avoid:</span> {d.content.avoid.join(", ")}</p>
                ) : null}
                {d.content?.notes && <p className="mt-1 text-sm text-slate-700">{d.content.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {yogaItems.length > 0 && (
        <Card className="mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Activity className="h-4 w-4 text-amber-600" /> Yoga & Lifestyle
          </h2>
          <div className="space-y-3">
            {yogaItems.map((y) => (
              <div key={y.id} className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                <p className="font-medium text-slate-900">{y.title}</p>
                {y.content?.asanas?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {y.content.asanas.map((a: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800">{a}</Badge>
                    ))}
                  </div>
                ) : null}
                {y.content?.notes && <p className="mt-1 text-sm text-slate-700">{y.content.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {assessment.advice && (
        <Card className="mb-4 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Doctor's Advice</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{assessment.advice}</p>
        </Card>
      )}

      {otherItems.length > 0 && (
        <Card className="mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <FileText className="h-4 w-4 text-slate-600" /> Additional Guidance
          </h2>
          <div className="space-y-2">
            {otherItems.map((o) => (
              <div key={o.id} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{o.title}</p>
                {o.content?.notes && <p className="mt-1 text-sm text-slate-700">{o.content.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-4 border-emerald-200 bg-emerald-50/60 p-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CalendarPlus className="h-4 w-4" /> Follow-up
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              {assessment.follow_up_date
                ? <>Recommended date: <span className="font-semibold">{assessment.follow_up_date}</span></>
                : "No specific follow-up date set — book whenever convenient."}
            </p>
          </div>
          <Link to={`/doctors/${appt?.doctor_id}`}>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" /> Book Follow-up
            </Button>
          </Link>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-400 print:hidden">
        Powered by Ayuzee · This summary is for your reference. Always follow your doctor's advice.
      </p>
    </div>
  );
};

export default ConsultationSummary;
