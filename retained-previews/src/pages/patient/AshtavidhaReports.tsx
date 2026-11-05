import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Leaf } from "lucide-react";
import { format } from "date-fns";

type Row = {
  id: string;
  exam_date: string;
  dosha_assessment: string | null;
  clinical_impression: string | null;
  recommendations: string | null;
  nadi: any; mutra: any; mala: any; jihva: any;
  shabda: any; sparsha: any; drik: any; akriti: any;
};

const PARIKSHA: { key: keyof Row; label: string }[] = [
  { key: "nadi", label: "Nadi (pulse)" },
  { key: "mutra", label: "Mutra (urine)" },
  { key: "mala", label: "Mala (stool)" },
  { key: "jihva", label: "Jihva (tongue)" },
  { key: "shabda", label: "Shabda (voice)" },
  { key: "sparsha", label: "Sparsha (touch)" },
  { key: "drik", label: "Drik (eyes)" },
  { key: "akriti", label: "Akriti (build)" },
];

const summarize = (v: any): string | null => {
  if (!v || typeof v !== "object") return null;
  const entries = Object.entries(v).filter(([, val]) => val !== null && val !== "" && val !== undefined);
  if (!entries.length) return null;
  return entries.map(([k, val]) => `${k}: ${String(val)}`).join(" · ");
};

type MutraBinduRow = {
  id: string;
  sample_time: string;
  dosha_suggestion_ai: string | null;
  vaidya_notes: string | null;
  photo_url: string;
  signedUrl?: string | null;
};

type JihvaRow = {
  id: string;
  created_at: string;
  ayurvedic_interpretation_ai: any;
  vaidya_notes: string | null;
  photo_url: string;
  signedUrl?: string | null;
};

const PatientAshtavidhaReports = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [mutra, setMutra] = useState<MutraBinduRow[]>([]);
  const [jihva, setJihva] = useState<JihvaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      const [{ data: exams }, { data: mbRows }, { data: jvRows }] = await Promise.all([
        (supabase as any)
          .from("vaidya_ashtavidha_exams")
          .select("id,exam_date,dosha_assessment,clinical_impression,recommendations,nadi,mutra,mala,jihva,shabda,sparsha,drik,akriti")
          .eq("patient_user_id", uid)
          .order("exam_date", { ascending: false }),
        supabase
          .from("mutra_bindu_observations")
          .select("id, sample_time, dosha_suggestion_ai, vaidya_notes, photo_url")
          .eq("patient_id", uid)
          .eq("vaidya_reviewed", true)
          .order("sample_time", { ascending: false }),
        supabase
          .from("jihva_pariksha_observations")
          .select("id, created_at, ayurvedic_interpretation_ai, vaidya_notes, photo_url")
          .eq("patient_id", uid)
          .eq("vaidya_reviewed", true)
          .order("created_at", { ascending: false }),
      ]);
      setRows((exams ?? []) as Row[]);
      const mb = (mbRows ?? []) as MutraBinduRow[];
      const jv = (jvRows ?? []) as JihvaRow[];
      const [withMbUrls, withJvUrls] = await Promise.all([
        Promise.all(mb.map(async (r) => {
          const { data } = await supabase.storage
            .from("mutra-bindu-photos")
            .createSignedUrl(r.photo_url, 60 * 30);
          return { ...r, signedUrl: data?.signedUrl ?? null };
        })),
        Promise.all(jv.map(async (r) => {
          const { data } = await supabase.storage
            .from("jihva-pariksha-photos")
            .createSignedUrl(r.photo_url, 60 * 30);
          return { ...r, signedUrl: data?.signedUrl ?? null };
        })),
      ]);
      setMutra(withMbUrls);
      setJihva(withJvUrls);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ayuzee · Your reports</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[hsl(150,45%,18%)]">Ashtavidha Pareeksha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The eight-fold Ayurvedic examination recorded by your Vaidya.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No Ashtavidha reports yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-lg font-semibold">Examination</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.exam_date}</div>
                </div>

                {r.dosha_assessment && (
                  <div className="mt-2">
                    <Badge variant="outline">{r.dosha_assessment}</Badge>
                  </div>
                )}

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {PARIKSHA.map(({ key, label }) => {
                    const s = summarize(r[key]);
                    if (!s) return null;
                    return (
                      <div key={key} className="rounded-md border bg-muted/40 p-2 text-xs">
                        <div className="font-semibold text-foreground">{label}</div>
                        <div className="text-muted-foreground">{s}</div>
                      </div>
                    );
                  })}
                </div>

                {r.clinical_impression && (
                  <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
                    <div className="font-semibold">Clinical impression</div>
                    <p className="mt-1 text-muted-foreground">{r.clinical_impression}</p>
                  </div>
                )}

                {r.recommendations && (
                  <div className="mt-3 rounded-md border bg-muted/40 p-3 text-sm">
                    <div className="font-semibold">Recommendations</div>
                    <p className="mt-1 text-muted-foreground">{r.recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Droplet className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-semibold">Mutra Bindu Pariksha</h2>
        </div>
        {loading ? null : mutra.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">
            No Mutra Bindu results yet. Approved observations will appear here once your Vaidya has reviewed them.
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {mutra.map((m) => (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold">
                      Sampled {format(new Date(m.sample_time), "d MMM yyyy · h:mm a")}
                    </div>
                    {m.dosha_suggestion_ai && <Badge variant="outline">{m.dosha_suggestion_ai}</Badge>}
                  </div>
                  {m.signedUrl && (
                    <a href={m.signedUrl} target="_blank" rel="noreferrer" className="mt-3 block">
                      <img
                        src={m.signedUrl}
                        alt="Your submitted Mutra Bindu photo"
                        className="max-h-72 rounded-md border object-contain bg-muted/30"
                      />
                    </a>
                  )}
                  {m.vaidya_notes && (
                    <div className="mt-3 rounded-md border bg-muted/40 p-3 text-sm">
                      <div className="font-semibold">Vaidya notes</div>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{m.vaidya_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-semibold">Jihva Pariksha (Tongue)</h2>
        </div>
        {loading ? null : jihva.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">
            No Jihva Pariksha results yet. Approved observations will appear here once your Vaidya has reviewed them.
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {jihva.map((j) => {
              const ai = j.ayurvedic_interpretation_ai ?? {};
              return (
                <Card key={j.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold">
                        Submitted {format(new Date(j.created_at), "d MMM yyyy · h:mm a")}
                      </div>
                      {ai.dosha_suggestion && <Badge variant="outline">{ai.dosha_suggestion}</Badge>}
                    </div>
                    {j.signedUrl && (
                      <a href={j.signedUrl} target="_blank" rel="noreferrer" className="mt-3 block">
                        <img
                          src={j.signedUrl}
                          alt="Your submitted tongue photo"
                          className="max-h-72 rounded-md border object-contain bg-muted/30"
                        />
                      </a>
                    )}
                    {j.vaidya_notes && (
                      <div className="mt-3 rounded-md border bg-muted/40 p-3 text-sm">
                        <div className="font-semibold">Vaidya notes</div>
                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{j.vaidya_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-6 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
        This information supports your understanding — it does not replace direct medical examination or emergency care.
      </p>
    </div>
  );
};

export default PatientAshtavidhaReports;
