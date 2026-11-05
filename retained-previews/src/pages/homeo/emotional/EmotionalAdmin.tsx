import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { EmotionalTheme } from "./EmotionalEngine";

type Remedy = { remedy: string; score: number };

const EmotionalAdmin = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<EmotionalTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmotionalTheme | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) { navigate("/doctor/auth"); return; }
      const { data: adm } = await supabase.rpc("is_admin_or_super", { _user_id: session.session.user.id });
      if (!adm) { toast.error("Admin access required"); navigate("/homeo/emotional"); return; }
      const { data } = await supabase.from("homeo_emotional_themes").select("*").order("sort_order");
      setThemes((data ?? []) as unknown as EmotionalTheme[]);
      const first = (data ?? [])[0] as unknown as EmotionalTheme | undefined;
      if (first) { setActiveId(first.id); setDraft(structuredClone(first)); }
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = useMemo(() => themes, [themes]);

  const select = (t: EmotionalTheme) => {
    setActiveId(t.id);
    setDraft(structuredClone(t));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase.from("homeo_emotional_themes").update({
      emotional_theme: draft.emotional_theme,
      short_description: draft.short_description,
      trigger_patterns: draft.trigger_patterns,
      dominant_reaction: draft.dominant_reaction,
      body_correlations: draft.body_correlations,
      likely_remedies_ranked: draft.likely_remedies_ranked as unknown as never,
      differential_remedies: draft.differential_remedies,
      followup_questions: draft.followup_questions,
      caution_notes: draft.caution_notes,
      doctor_notes: draft.doctor_notes,
    }).eq("id", draft.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setThemes((prev) => prev.map((t) => (t.id === draft.id ? draft : t)));
  };

  const updateList = (key: keyof EmotionalTheme, value: string) => {
    if (!draft) return;
    const arr = value.split("\n").map((s) => s.trim()).filter(Boolean);
    setDraft({ ...draft, [key]: arr } as EmotionalTheme);
  };

  const updateRemedy = (idx: number, patch: Partial<Remedy>) => {
    if (!draft) return;
    const next = draft.likely_remedies_ranked.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setDraft({ ...draft, likely_remedies_ranked: next });
  };

  const addRemedy = () => {
    if (!draft) return;
    setDraft({ ...draft, likely_remedies_ranked: [...draft.likely_remedies_ranked, { remedy: "", score: 70 }] });
  };

  const removeRemedy = (idx: number) => {
    if (!draft) return;
    setDraft({ ...draft, likely_remedies_ranked: draft.likely_remedies_ranked.filter((_, i) => i !== idx) });
  };

  if (loading) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[hsl(45_85%_60%)]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-[hsl(45_40%_70%)] hover:text-[hsl(45_85%_75%)]">
          <Link to="/homeo/emotional"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Engine</Link>
        </Button>
        <Badge className="border-[hsl(0_70%_50%/0.4)] bg-[hsl(0_70%_30%/0.2)] text-[hsl(0_70%_85%)]">Admin Editor</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="max-h-[75vh] space-y-1 overflow-y-auto rounded-xl border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_30%_4%)] p-3">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => select(t)}
              className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                activeId === t.id
                  ? "bg-gradient-to-r from-[hsl(142_55%_30%/0.4)] to-[hsl(45_85%_55%/0.15)] text-[hsl(45_85%_75%)]"
                  : "text-[hsl(45_15%_80%)] hover:bg-[hsl(45_85%_55%/0.06)]"
              }`}
            >
              <span className="text-[10px] text-[hsl(45_40%_55%/0.7)]">#{t.sort_order}</span> {t.emotional_theme}
            </button>
          ))}
        </aside>

        {draft && (
          <main className="space-y-4 rounded-xl border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_30%_4%)] p-5">
            <div className="space-y-2">
              <Field label="Theme name">
                <Input value={draft.emotional_theme} onChange={(e) => setDraft({ ...draft, emotional_theme: e.target.value })} className="border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
              </Field>
              <Field label="Short description">
                <Textarea value={draft.short_description} onChange={(e) => setDraft({ ...draft, short_description: e.target.value })} className="border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
              </Field>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-[hsl(45_40%_55%/0.85)]">Likely Remedies (ranked)</h3>
                <Button size="sm" variant="outline" onClick={addRemedy} className="h-7 border-[hsl(45_85%_55%/0.4)] bg-transparent text-[hsl(45_85%_75%)] hover:bg-[hsl(45_85%_55%/0.1)]"><Plus className="mr-1 h-3 w-3" /> Add</Button>
              </div>
              {draft.likely_remedies_ranked.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={r.remedy} placeholder="Remedy name" onChange={(e) => updateRemedy(i, { remedy: e.target.value })} className="flex-1 border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
                  <Input type="number" min={0} max={100} value={r.score} onChange={(e) => updateRemedy(i, { score: Number(e.target.value) })} className="w-24 border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
                  <Button size="icon" variant="ghost" onClick={() => removeRemedy(i)} className="text-[hsl(0_70%_70%)] hover:bg-[hsl(0_70%_30%/0.2)] hover:text-[hsl(0_70%_80%)]"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ListField label="Trigger patterns (one per line)" value={draft.trigger_patterns} onChange={(v) => updateList("trigger_patterns", v)} />
              <ListField label="Dominant reaction" value={draft.dominant_reaction} onChange={(v) => updateList("dominant_reaction", v)} />
              <ListField label="Body correlations" value={draft.body_correlations} onChange={(v) => updateList("body_correlations", v)} />
              <ListField label="Differential remedies" value={draft.differential_remedies} onChange={(v) => updateList("differential_remedies", v)} />
              <ListField label="Follow-up questions" value={draft.followup_questions} onChange={(v) => updateList("followup_questions", v)} />
            </div>

            <Field label="Caution notes">
              <Textarea value={draft.caution_notes} onChange={(e) => setDraft({ ...draft, caution_notes: e.target.value })} className="border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
            </Field>
            <Field label="Doctor notes (private)">
              <Textarea value={draft.doctor_notes} onChange={(e) => setDraft({ ...draft, doctor_notes: e.target.value })} className="border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
            </Field>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-[hsl(142_55%_38%)] to-[hsl(45_85%_55%)] text-[hsl(160_30%_4%)] hover:brightness-110">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save changes
              </Button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-xs uppercase tracking-widest text-[hsl(45_40%_55%/0.85)]">{label}</span>
    {children}
  </label>
);

const ListField = ({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string) => void }) => (
  <Field label={label}>
    <Textarea value={value.join("\n")} onChange={(e) => onChange(e.target.value)} rows={4} className="border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_25%_8%)] text-[hsl(45_30%_94%)]" />
  </Field>
);

export default EmotionalAdmin;
