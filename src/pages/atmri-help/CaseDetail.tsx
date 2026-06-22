import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Case = any;
type Update = { id: string; update_type: string; update_text: string; photo_urls: string[]; created_at: string };
type Sig = { id: string; legal_declaration: string; signed_at: string; doctor_registration_number: string | null; doctor_id: string };
type Doctor = { id: string; full_name: string; specialization: string; avatar_url: string | null };

const statusBadge: Record<string, { label: string; cls: string }> = {
  in_treatment: { label: "🟢 In Treatment", cls: "bg-green-500 text-white" },
  approved: { label: "🟡 Treatment Starting", cls: "bg-amber-500 text-white" },
  completed: { label: "✅ Healed", cls: "bg-primary text-primary-foreground" },
};

const CaseDetail = () => {
  const { id } = useParams();
  const [c, setC] = useState<Case | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [sig, setSig] = useState<Sig | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const sb = supabase as any;
      // Public case detail uses the PII-free view; only the assigned doctor,
      // submitter, or admin can read the full row via the base table.
      const { data: caseData } = await sb.from("atmri_sponsored_cases_public").select("*").eq("id", id).maybeSingle();
      setC(caseData);
      if (caseData) {
        document.title = `${caseData.patient_name}'s Journey — ATMRI Trust`;
        const [u, s] = await Promise.all([
          sb.from("atmri_case_updates").select("*").eq("case_id", id).eq("is_public", true).order("created_at", { ascending: false }),
          sb.from("atmri_doctor_signatures").select("*").eq("case_id", id).maybeSingle(),
        ]);
        setUpdates((u.data ?? []) as Update[]);
        setSig(s.data as Sig | null);
        if (caseData.assigned_doctor_id) {
          const { data: doc } = await sb.from("doctors").select("id,full_name,specialization,avatar_url").eq("id", caseData.assigned_doctor_id).maybeSingle();
          setDoctor(doc as Doctor);
        }
      }
    })();
  }, [id]);

  if (!c) return <main className="container py-20 text-center text-muted-foreground">Loading…</main>;

  const sb = statusBadge[c.status];

  return (
    <main className="min-h-screen bg-background">
      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        {/* LEFT */}
        <div>
          <div className="overflow-hidden rounded-2xl">
            {c.patient_photo_url ? (
              <img src={c.patient_photo_url} alt={c.patient_name} className="max-h-96 w-full object-cover" />
            ) : (
              <div className="grid h-72 place-items-center bg-gradient-to-br from-primary/20 to-accent font-display text-7xl text-primary">{c.patient_name.charAt(0)}</div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{c.condition_name}</Badge>
            {sb && <span className={`rounded-full px-3 py-1 text-xs ${sb.cls}`}>{sb.label}</span>}
            {c.is_urgent && <span className="rounded-full bg-red-500 px-3 py-1 text-xs text-white">🔴 URGENT</span>}
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold">{c.patient_name}'s Journey</h1>
          <p className="mt-1 text-muted-foreground">📍 {c.patient_city}, {c.patient_state}</p>

          {c.is_urgent && (
            <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
              🔴 Urgent — Treatment must begin within 14 days
            </div>
          )}

          <p className="mt-6 leading-relaxed text-foreground">{c.patient_story}</p>

          <Card className="mt-8 border-accent bg-accent/50 p-6">
            <p className="font-display text-xl font-semibold">🌿 Treatment Plan</p>
            <p className="mt-2 text-foreground">{c.treatment_plan}</p>
            {c.treatment_duration_days && (
              <p className="mt-2 text-sm text-muted-foreground">{c.treatment_duration_days} days planned</p>
            )}
          </Card>

          {c.checkpoint_doctor_signed && doctor && sig && (
            <Card className="mt-6 border-2 border-green-200 bg-green-50 p-6 text-green-900">
              <p className="font-semibold">✅ Medically Verified by Dr. {doctor.full_name}</p>
              <p className="mt-1 text-sm">
                {doctor.specialization}
                {sig.doctor_registration_number && ` · Reg: ${sig.doctor_registration_number}`}
                {` · Signed ${new Date(sig.signed_at).toLocaleDateString()}`}
              </p>
              <p className="mt-3 text-sm italic opacity-80">"{sig.legal_declaration}"</p>
            </Card>
          )}

          <Card className="mt-8 p-6">
            <h3 className="font-display text-xl font-semibold">🏛️ How ATMRI Trust is Helping</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {c.doctor_fee_waived > 0 && <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-900">🩺 Doctor fee waived: ₹{c.doctor_fee_waived.toLocaleString("en-IN")}</div>}
              {c.medicines_cost > 0 && <div className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">💊 Medicines (free): ₹{c.medicines_cost.toLocaleString("en-IN")}</div>}
              {c.therapy_sessions_cost > 0 && <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-900">🫙 Therapy sessions: ₹{c.therapy_sessions_cost.toLocaleString("en-IN")}</div>}
              {c.transport_allowance > 0 && <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">🚗 Transport support: ₹{c.transport_allowance.toLocaleString("en-IN")}</div>}
            </div>
            <p className="mt-4 font-semibold text-green-700">Total Trust contribution: ₹{(c.corpus_amount_allocated || 0).toLocaleString("en-IN")}</p>
            <p className="mt-1 text-xs text-muted-foreground">🏛️ Funded entirely by ATMRI Trust — no crowdfunding involved</p>
          </Card>

          <div className="mt-10">
            <h3 className="font-display text-xl font-semibold">📢 Treatment Updates</h3>
            {updates.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Updates will be posted as treatment progresses.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {updates.map((u) => (
                  <Card key={u.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
                      <Badge variant="outline">{u.update_type.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm">{u.update_text}</p>
                    {u.photo_urls?.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {u.photo_urls.map((url, i) => <img key={i} src={url} alt="" className="h-24 w-full rounded-lg object-cover" />)}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {c.medical_report_urls?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold">📋 Medical Documents</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.medical_report_urls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-lg border bg-card px-3 py-1.5 text-sm text-primary hover:bg-accent">
                    📄 Document {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="font-display text-lg font-semibold">🏛️ About This Case</p>
            <div className="mt-4 space-y-3 text-sm">
              <div><span className="text-muted-foreground">Condition:</span> <Badge variant="outline" className="ml-1">{c.condition_name}</Badge></div>
              <div><span className="text-muted-foreground">Status:</span> {sb && <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${sb.cls}`}>{sb.label}</span>}</div>
              {(c.patient_age || c.patient_gender) && <div><span className="text-muted-foreground">Patient:</span> {c.patient_age} y/o · {c.patient_gender}</div>}
              {c.treatment_duration_days && <div><span className="text-muted-foreground">Duration:</span> {c.treatment_duration_days} days</div>}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">Corpus allocated</p>
                <p className="font-display text-2xl text-primary">₹{(c.corpus_amount_allocated || 0).toLocaleString("en-IN")}</p>
              </div>
              {c.status === "in_treatment" && c.total_sessions_planned > 0 && (
                <div className="rounded-xl bg-accent/50 p-3 text-center">
                  <p className="font-display text-xl text-primary">{c.sessions_completed}/{c.total_sessions_planned}</p>
                  <p className="text-xs text-muted-foreground">sessions completed</p>
                </div>
              )}
              {c.medicines_dispatched && c.medicines_dispatched_at && (
                <p className="text-xs text-muted-foreground">💊 Medicines dispatched on {new Date(c.medicines_dispatched_at).toLocaleDateString()}</p>
              )}
              {c.treatment_location && <p className="text-xs text-muted-foreground">🏥 {c.treatment_location}</p>}
            </div>

            {doctor && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border bg-accent/30 p-3">
                {doctor.avatar_url ? <img src={doctor.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary">{doctor.full_name.charAt(0)}</div>}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{doctor.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{doctor.specialization}</p>
                  <p className="text-xs text-amber-700">🏅 ATMRI Healing Doctor</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="mt-4 border-dashed border-primary/40 bg-primary/5 p-5 text-center">
            <p className="font-semibold">🩺 Are you an AYUSH doctor?</p>
            <p className="mt-1 text-xs text-muted-foreground">Pledge free consultations to help patients like {c.patient_name.split(" ")[0]}.</p>
            <Button asChild size="sm" className="mt-3 w-full"><Link to="/atmri-help/pledge">Pledge Now →</Link></Button>
            <div className="my-4 border-t" />
            <p className="font-semibold">🏥 Are you a hospital?</p>
            <p className="mt-1 text-xs text-muted-foreground">Partner with ATMRI Trust to host treatments.</p>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full"><Link to="/atmri-help/hospitals">Partner →</Link></Button>
          </Card>
        </aside>
      </div>
    </main>
  );
};

export default CaseDetail;
