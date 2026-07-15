import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles, ShieldAlert, Pencil } from "lucide-react";

type Remedy = { remedy: string; score: number };
export type EmotionalTheme = {
  id: string;
  emotional_theme: string;
  slug: string;
  short_description: string;
  trigger_patterns: string[];
  dominant_reaction: string[];
  body_correlations: string[];
  likely_remedies_ranked: Remedy[];
  differential_remedies: string[];
  followup_questions: string[];
  caution_notes: string;
  doctor_notes: string;
  sort_order: number;
};

const EmotionalEngine = () => {
  const [themes, setThemes] = useState<EmotionalTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<EmotionalTheme | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: themesData } = await supabase
        .from("homeo_emotional_themes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data: adm } = await supabase.rpc("is_admin_or_super", { _user_id: session.session.user.id });
        if (mounted) setIsAdmin(!!adm);
      }
      if (mounted) {
        setThemes((themesData ?? []) as unknown as EmotionalTheme[]);
        setActive(((themesData ?? [])[0] ?? null) as unknown as EmotionalTheme | null);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return themes;
    const needle = q.toLowerCase();
    return themes.filter((t) =>
      [t.emotional_theme, t.short_description, ...(t.trigger_patterns ?? []), ...(t.dominant_reaction ?? []),
       ...(t.likely_remedies_ranked ?? []).map((r) => r.remedy), ...(t.differential_remedies ?? [])]
        .join(" ").toLowerCase().includes(needle)
    );
  }, [themes, q]);

  if (loading) {
    return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[hsl(45_85%_60%)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[hsl(45_40%_55%/0.18)] bg-gradient-to-br from-[hsl(160_30%_5%)] via-[hsl(160_25%_8%)] to-[hsl(142_55%_10%)] p-6 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[hsl(45_85%_60%/0.8)]">Ayuzee Homeo AI</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-[hsl(45_85%_75%)] md:text-3xl">
              Emotional Remedy Engine
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[hsl(45_15%_80%)]">
              Perception-based theme → remedy mapping. Search 50 emotional patterns to shortlist similimum candidates with weighted scores, differentials, and follow-up prompts.
            </p>
          </div>
          {isAdmin && (
            <Button asChild size="sm" className="bg-gradient-to-r from-[hsl(142_55%_38%)] to-[hsl(45_85%_55%)] text-[hsl(160_30%_4%)] hover:brightness-110">
              <Link to="/homeo/emotional/admin"><Pencil className="mr-2 h-4 w-4" /> Edit Mappings</Link>
            </Button>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-[hsl(45_15%_75%)]">
          <Badge variant="outline" className="border-[hsl(45_85%_55%/0.4)] bg-[hsl(45_85%_55%/0.08)] text-[hsl(45_85%_75%)]">{themes.length} themes</Badge>
          <Badge variant="outline" className="border-[hsl(142_55%_45%/0.4)] bg-[hsl(142_55%_30%/0.15)] text-[hsl(142_55%_75%)]">Doctor-curated</Badge>
          <Badge variant="outline" className="border-[hsl(45_40%_55%/0.3)] text-[hsl(45_40%_70%)]">Public-domain principles</Badge>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-[hsl(45_40%_55%/0.15)] bg-[hsl(160_30%_4%)] p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(45_40%_55%/0.7)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search themes, triggers, remedies…"
              className="border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] pl-9 text-[hsl(45_30%_94%)] placeholder:text-[hsl(45_15%_55%)]"
            />
          </div>
          <p className="mb-2 px-1 text-[10px] uppercase tracking-widest text-[hsl(45_40%_55%/0.7)]">{filtered.length} results</p>
          <div className="max-h-[65vh] space-y-1 overflow-y-auto pr-1">
            {filtered.map((t) => {
              const isOn = active?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isOn
                      ? "border-[hsl(45_85%_55%/0.5)] bg-gradient-to-r from-[hsl(142_55%_30%/0.4)] to-[hsl(45_85%_55%/0.15)] text-[hsl(45_85%_75%)]"
                      : "border-transparent text-[hsl(45_15%_80%)] hover:bg-[hsl(45_85%_55%/0.06)] hover:text-[hsl(45_85%_75%)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t.emotional_theme}</span>
                    <span className="text-[10px] text-[hsl(45_40%_55%/0.7)]">#{t.sort_order}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[hsl(45_15%_65%)]">{t.short_description}</p>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-[hsl(45_15%_60%)]">No themes match.</p>
            )}
          </div>
        </aside>

        <main className="space-y-4">
          {active ? <ThemeDetail theme={active} /> : (
            <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-[hsl(45_40%_55%/0.2)] text-sm text-[hsl(45_15%_60%)]">Select a theme to view mapping.</div>
          )}
          <div className="rounded-xl border border-[hsl(45_85%_55%/0.25)] bg-[hsl(45_85%_55%/0.05)] p-4 text-xs text-[hsl(45_30%_85%)]">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-[hsl(45_85%_60%)]" />
              <p>
                <strong className="text-[hsl(45_85%_75%)]">Clinical disclaimer:</strong> The Emotional Remedy Engine is educational decision-support. Final remedy selection is the prescribing physician's responsibility.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const ThemeDetail = ({ theme }: { theme: EmotionalTheme }) => {
  const top = (theme.likely_remedies_ranked ?? []).slice().sort((a, b) => b.score - a.score);
  const max = top[0]?.score || 100;
  return (
    <article className="space-y-4 rounded-2xl border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_30%_4%)] p-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[hsl(45_85%_60%/0.8)]">
          <Sparkles className="h-3 w-3" /> Theme #{theme.sort_order}
        </div>
        <h2 className="mt-1 font-display text-2xl font-semibold text-[hsl(45_85%_75%)]">{theme.emotional_theme}</h2>
        <p className="mt-1 text-sm text-[hsl(45_15%_85%)]">{theme.short_description}</p>
      </header>

      <section>
        <h3 className="mb-2 text-xs uppercase tracking-widest text-[hsl(45_40%_55%/0.85)]">Likely Remedies (ranked)</h3>
        <div className="space-y-2">
          {top.map((r) => (
            <div key={r.remedy} className="rounded-lg border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_25%_7%)] p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[hsl(45_85%_75%)]">{r.remedy}</span>
                <span className="text-xs font-semibold text-[hsl(142_55%_70%)]">{r.score}/100</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(160_25%_12%)]">
                <div
                  className="h-full bg-gradient-to-r from-[hsl(142_55%_45%)] to-[hsl(45_85%_55%)]"
                  style={{ width: `${Math.round((r.score / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Trigger Patterns" items={theme.trigger_patterns} tone="amber" />
        <Block title="Dominant Reaction" items={theme.dominant_reaction} tone="green" />
        <Block title="Body Correlations" items={theme.body_correlations} tone="amber" />
        <Block title="Differential Remedies" items={theme.differential_remedies} tone="green" />
      </div>

      {theme.followup_questions?.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs uppercase tracking-widest text-[hsl(45_40%_55%/0.85)]">Suggested Follow-up Questions</h3>
          <ul className="space-y-1.5 text-sm text-[hsl(45_15%_88%)]">
            {theme.followup_questions.map((q, i) => (
              <li key={i} className="rounded border border-[hsl(45_40%_55%/0.15)] bg-[hsl(160_25%_7%)] px-3 py-2">{q}</li>
            ))}
          </ul>
        </section>
      )}

      {theme.caution_notes && (
        <section className="rounded-lg border border-[hsl(0_70%_50%/0.3)] bg-[hsl(0_70%_30%/0.1)] p-3 text-sm text-[hsl(0_70%_85%)]">
          <strong className="text-[hsl(0_70%_80%)]">Caution:</strong> {theme.caution_notes}
        </section>
      )}

      {theme.doctor_notes && (
        <section className="rounded-lg border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_25%_7%)] p-3 text-sm text-[hsl(45_15%_85%)]">
          <strong className="text-[hsl(45_85%_70%)]">Doctor notes:</strong> {theme.doctor_notes}
        </section>
      )}
    </article>
  );
};

const Block = ({ title, items, tone }: { title: string; items: string[]; tone: "amber" | "green" }) => {
  if (!items?.length) return null;
  const cls = tone === "amber"
    ? "border-[hsl(45_85%_55%/0.3)] bg-[hsl(45_85%_55%/0.08)] text-[hsl(45_85%_80%)]"
    : "border-[hsl(142_55%_45%/0.3)] bg-[hsl(142_55%_30%/0.12)] text-[hsl(142_55%_80%)]";
  return (
    <div>
      <h3 className="mb-2 text-xs uppercase tracking-widest text-[hsl(45_40%_55%/0.85)]">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className={`rounded-full border px-2.5 py-1 text-xs ${cls}`}>{it}</span>
        ))}
      </div>
    </div>
  );
};

export default EmotionalEngine;
