import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { ArrowLeft, Save, FileDown, Loader2, GitCompareArrows } from "lucide-react";
import jsPDF from "jspdf";

interface Remedy {
  id: string; name: string; common_name: string | null; abbreviation: string;
  latin_name: string | null; source: string | null; kingdom: string | null;
  key_personality: string | null; mental_emotional_picture: string | null;
  general_symptoms: string | null; thermal: string | null; thirst: string | null;
  food_cravings: string[] | null; food_aversions: string[] | null;
  cravings: string[] | null; aversions: string[] | null;
  sleep_pattern: string | null; dreams: string | null; sweat: string | null;
  digestive_symptoms: string | null; respiratory_symptoms: string | null;
  skin_symptoms: string | null; female_symptoms: string | null;
  male_symptoms: string | null; children_indications: string | null;
  modalities_better: string[] | null; modalities_worse: string[] | null;
  keynote_symptoms: string[] | null; keynotes: string[] | null;
  common_clinical_uses: string[] | null;
  complementary_remedies: string[] | null; antidotes: string[] | null; compare_with: string[] | null;
  usual_potencies: string[] | null; common_potencies: string[] | null;
  safety_notes: string | null; short_description: string | null;
  detail_level: string | null;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={`${t.card} p-5`}>
    <p className={`${t.label} mb-2`}>{title}</p>
    <div className="text-sm text-[hsl(45_30%_94%)] leading-relaxed">{children}</div>
  </div>
);

const Chips = ({ items }: { items?: string[] | null }) => {
  if (!items?.length) return <span className={t.mutedText}>—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x, i) => <span key={i} className={t.pill}>{x}</span>)}
    </div>
  );
};

const RemedyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState<Remedy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("homeo_remedies").select("*").eq("id", id!).maybeSingle();
      if (error || !data) { toast.error("Remedy not found"); navigate("/homeo/materia-medica"); return; }
      setR(data as Remedy);
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data: n } = await supabase
          .from("homeo_doctor_remedy_notes")
          .select("notes")
          .eq("doctor_user_id", u.user.id)
          .eq("remedy_id", id!)
          .maybeSingle();
        setNotes(n?.notes ?? "");
      }
      setLoading(false);
    };
    if (id) load();
  }, [id, navigate]);

  const saveNotes = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return toast.error("Sign in required");
    setSavingNotes(true);
    const { error } = await supabase
      .from("homeo_doctor_remedy_notes")
      .upsert({ doctor_user_id: u.user.id, remedy_id: id!, notes }, { onConflict: "doctor_user_id,remedy_id" });
    setSavingNotes(false);
    if (error) toast.error(error.message); else toast.success("Notes saved");
  };

  const exportPDF = () => {
    if (!r) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 50;
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text(`${r.name} (${r.abbreviation})`, 40, y); y += 18;
    if (r.common_name) { doc.setFont("helvetica", "italic"); doc.setFontSize(11); doc.text(r.common_name, 40, y); y += 16; }
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Source: ${r.source ?? "—"}  ·  Kingdom: ${r.kingdom ?? "—"}`, 40, y); y += 18;
    doc.setDrawColor(180); doc.line(40, y, W - 40, y); y += 14;

    const block = (label: string, value?: string | string[] | null) => {
      const text = Array.isArray(value) ? value.filter(Boolean).join(", ") : value ?? "—";
      if (!text || text === "—") return;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(label, 40, y); y += 12;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const lines = doc.splitTextToSize(text, W - 80);
      lines.forEach((l: string) => { if (y > 780) { doc.addPage(); y = 50; } doc.text(l, 40, y); y += 12; });
      y += 6;
    };

    block("Key personality", r.key_personality);
    block("Mind & emotional picture", r.mental_emotional_picture);
    block("General symptoms", r.general_symptoms);
    block("Thermal / Thirst", `${r.thermal ?? "—"} | ${r.thirst ?? "—"}`);
    block("Cravings", r.food_cravings ?? r.cravings);
    block("Aversions", r.food_aversions ?? r.aversions);
    block("Sleep / Dreams / Sweat", `${r.sleep_pattern ?? "—"} | ${r.dreams ?? "—"} | ${r.sweat ?? "—"}`);
    block("Digestive", r.digestive_symptoms);
    block("Respiratory", r.respiratory_symptoms);
    block("Skin", r.skin_symptoms);
    block("Female", r.female_symptoms);
    block("Male", r.male_symptoms);
    block("Children", r.children_indications);
    block("Better", r.modalities_better);
    block("Worse", r.modalities_worse);
    block("Keynotes", r.keynote_symptoms ?? r.keynotes);
    block("Common clinical uses", r.common_clinical_uses);
    block("Complementary", r.complementary_remedies);
    block("Antidotes", r.antidotes);
    block("Compare with", r.compare_with);
    block("Usual potencies", r.usual_potencies ?? r.common_potencies);
    block("Safety notes", r.safety_notes);
    if (notes) block("Doctor private notes", notes);

    doc.setFont("helvetica", "italic"); doc.setFontSize(8);
    if (y > 770) { doc.addPage(); y = 50; }
    doc.text("Educational and clinical decision-support only. Final prescription by qualified homeopath.", 40, 800);
    doc.save(`${r.name.replace(/\s+/g, "_")}.pdf`);
  };

  if (loading || !r) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/homeo/materia-medica" className="inline-flex items-center gap-1 text-xs text-[hsl(45_15%_70%)] hover:text-[hsl(45_85%_75%)]">
            <ArrowLeft className="h-3 w-3" /> Back to library
          </Link>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[hsl(45_85%_78%)]">
            {r.name} <span className="text-[hsl(45_15%_70%)] text-xl">({r.abbreviation})</span>
          </h2>
          {r.common_name && <p className="text-sm italic text-[hsl(142_55%_55%)]">{r.common_name}</p>}
          <p className={`mt-1 text-xs ${t.mutedText}`}>
            Source: {r.source ?? "—"} · Kingdom: {r.kingdom ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/homeo/materia-medica/compare?ids=${r.id}`} className={t.ghostBtn}>
            <GitCompareArrows className="h-4 w-4" /> Compare
          </Link>
          <button onClick={exportPDF} className={t.primaryBtn}><FileDown className="h-4 w-4" /> Export PDF</button>
        </div>
      </div>

      {r.detail_level !== "full" && (
        <div className="rounded-md border border-[hsl(45_85%_55%/0.3)] bg-[hsl(45_85%_55%/0.06)] p-3 text-xs text-[hsl(45_85%_75%)]">
          ⚠ This remedy is a <strong>placeholder</strong>. Add doctor notes below or expand fields directly via Materia Medica AI.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Key personality">{r.key_personality || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Mind & emotional picture">{r.mental_emotional_picture || <span className={t.mutedText}>—</span>}</Section>
        <Section title="General symptoms">{r.general_symptoms || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Thermal & Thirst">
          <div className="grid grid-cols-2 gap-3">
            <div><p className={t.label}>Thermal</p><p>{r.thermal ?? "—"}</p></div>
            <div><p className={t.label}>Thirst</p><p>{r.thirst ?? "—"}</p></div>
          </div>
        </Section>
        <Section title="Food cravings"><Chips items={r.food_cravings ?? r.cravings} /></Section>
        <Section title="Food aversions"><Chips items={r.food_aversions ?? r.aversions} /></Section>
        <Section title="Sleep / Dreams / Sweat">
          <div className="space-y-2">
            <div><span className={t.label}>Sleep:</span> <span className="ml-1">{r.sleep_pattern || "—"}</span></div>
            <div><span className={t.label}>Dreams:</span> <span className="ml-1">{r.dreams || "—"}</span></div>
            <div><span className={t.label}>Sweat:</span> <span className="ml-1">{r.sweat || "—"}</span></div>
          </div>
        </Section>
        <Section title="Modalities — Better"><Chips items={r.modalities_better} /></Section>
        <Section title="Modalities — Worse"><Chips items={r.modalities_worse} /></Section>
        <Section title="Keynotes"><Chips items={r.keynote_symptoms ?? r.keynotes} /></Section>
        <Section title="Common clinical uses"><Chips items={r.common_clinical_uses} /></Section>
        <Section title="Digestive">{r.digestive_symptoms || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Respiratory">{r.respiratory_symptoms || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Skin">{r.skin_symptoms || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Female complaints">{r.female_symptoms || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Male complaints">{r.male_symptoms || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Children indications">{r.children_indications || <span className={t.mutedText}>—</span>}</Section>
        <Section title="Complementary"><Chips items={r.complementary_remedies} /></Section>
        <Section title="Antidotes"><Chips items={r.antidotes} /></Section>
        <Section title="Compare with"><Chips items={r.compare_with} /></Section>
        <Section title="Usual potencies"><Chips items={r.usual_potencies ?? r.common_potencies} /></Section>
      </div>

      <Section title="Safety notes">{r.safety_notes || <span className={t.mutedText}>No specific safety notes recorded.</span>}</Section>

      <div className={`${t.card} p-5`}>
        <div className="flex items-center justify-between mb-2">
          <p className={t.label}>Your private notes</p>
          <button onClick={saveNotes} disabled={savingNotes} className={t.primaryBtn}>
            {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingNotes ? "Saving…" : "Save notes"}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Add your clinical observations, cases where this remedy worked, dosing preferences…"
          className={`${t.input} min-h-[120px]`}
        />
        <p className={`mt-2 text-[10px] ${t.mutedText}`}>Visible only to you. Stored privately per-doctor.</p>
      </div>

      <p className={`text-[11px] italic ${t.mutedText} pt-4 border-t border-[hsl(45_40%_55%/0.12)]`}>
        ⚠ This database is for professional educational and clinical decision-support use only. Final prescription should be made by a qualified homeopathy physician.
      </p>
    </div>
  );
};

export default RemedyDetail;
