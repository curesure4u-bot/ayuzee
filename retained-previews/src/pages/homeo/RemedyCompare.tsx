import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface R {
  id: string; name: string; abbreviation: string; common_name: string | null;
  thermal: string | null; thirst: string | null;
  food_cravings: string[] | null; food_aversions: string[] | null;
  cravings: string[] | null; aversions: string[] | null;
  modalities_better: string[] | null; modalities_worse: string[] | null;
  keynote_symptoms: string[] | null; keynotes: string[] | null;
  common_clinical_uses: string[] | null;
  mental_emotional_picture: string | null;
  key_personality: string | null;
}

const fmt = (a?: string[] | null) => (a?.length ? a.join(", ") : "—");

const RemedyCompare = () => {
  const [params] = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const [remedies, setRemedies] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!ids.length) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("homeo_remedies")
        .select("id, name, abbreviation, common_name, thermal, thirst, food_cravings, food_aversions, cravings, aversions, modalities_better, modalities_worse, keynote_symptoms, keynotes, common_clinical_uses, mental_emotional_picture, key_personality")
        .in("id", ids);
      if (error) toast.error(error.message);
      // preserve order of ids
      const map = new Map((data ?? []).map((r) => [r.id, r as R]));
      setRemedies(ids.map((i) => map.get(i)).filter(Boolean) as R[]);
      setLoading(false);
    };
    load();
  }, [params.get("ids")]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows: { label: string; pick: (r: R) => string }[] = [
    { label: "Common name", pick: (r) => r.common_name ?? "—" },
    { label: "Key personality", pick: (r) => r.key_personality ?? "—" },
    { label: "Mind picture", pick: (r) => r.mental_emotional_picture ?? "—" },
    { label: "Thermal", pick: (r) => r.thermal ?? "—" },
    { label: "Thirst", pick: (r) => r.thirst ?? "—" },
    { label: "Cravings", pick: (r) => fmt(r.food_cravings ?? r.cravings) },
    { label: "Aversions", pick: (r) => fmt(r.food_aversions ?? r.aversions) },
    { label: "Better", pick: (r) => fmt(r.modalities_better) },
    { label: "Worse", pick: (r) => fmt(r.modalities_worse) },
    { label: "Keynotes", pick: (r) => fmt(r.keynote_symptoms ?? r.keynotes) },
    { label: "Clinical uses", pick: (r) => fmt(r.common_clinical_uses) },
  ];

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
    const W = doc.internal.pageSize.getWidth();
    let y = 50;
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("Homeopathy Remedy Comparison", 40, y); y += 22;
    doc.setFont("helvetica", "italic"); doc.setFontSize(10);
    doc.text(remedies.map((r) => `${r.name} (${r.abbreviation})`).join("  vs  "), 40, y); y += 20;
    doc.setDrawColor(180); doc.line(40, y, W - 40, y); y += 14;

    rows.forEach((row) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(row.label, 40, y); y += 12;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      remedies.forEach((r) => {
        const txt = `• ${r.abbreviation}: ${row.pick(r)}`;
        const lines = doc.splitTextToSize(txt, W - 80);
        lines.forEach((l: string) => { if (y > 540) { doc.addPage(); y = 50; } doc.text(l, 50, y); y += 11; });
      });
      y += 8;
    });

    doc.setFont("helvetica", "italic"); doc.setFontSize(8);
    doc.text("Educational and clinical decision-support only.", 40, doc.internal.pageSize.getHeight() - 20);
    doc.save("remedy_comparison.pdf");
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" /></div>;

  if (!remedies.length) {
    return (
      <div className={`${t.card} p-8 text-center`}>
        <p className={t.mutedText}>No remedies selected. Pick 2–4 remedies from the library to compare.</p>
        <Link to="/homeo/materia-medica" className={`${t.primaryBtn} mt-4 inline-flex`}>Browse library</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/homeo/materia-medica" className="inline-flex items-center gap-1 text-xs text-[hsl(45_15%_70%)] hover:text-[hsl(45_85%_75%)]">
            <ArrowLeft className="h-3 w-3" /> Back to library
          </Link>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Remedy comparison</h2>
          <p className={`text-sm ${t.mutedText}`}>{remedies.length} remedies side by side</p>
        </div>
        <button onClick={exportPDF} className={t.primaryBtn}><FileDown className="h-4 w-4" /> Export PDF</button>
      </div>

      <div className={`${t.card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(45_40%_55%/0.2)]">
              <th className="text-left p-3 sticky left-0 bg-[hsl(160_30%_5%)] text-[hsl(45_85%_60%)] uppercase tracking-wider text-xs">Field</th>
              {remedies.map((r) => (
                <th key={r.id} className="text-left p-3 min-w-[200px]">
                  <Link to={`/homeo/materia-medica/${r.id}`} className="font-display text-[hsl(45_85%_75%)] hover:underline">
                    {r.name}
                  </Link>
                  <p className="text-xs italic text-[hsl(142_55%_55%)]">{r.abbreviation}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 ? "bg-[hsl(160_30%_4%)]" : ""}>
                <td className="p-3 align-top sticky left-0 bg-inherit text-[hsl(45_85%_60%)] uppercase tracking-wider text-[11px] font-medium whitespace-nowrap">
                  {row.label}
                </td>
                {remedies.map((r) => (
                  <td key={r.id} className="p-3 align-top text-[hsl(45_30%_94%)] leading-relaxed">{row.pick(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={`text-[11px] italic ${t.mutedText} pt-2`}>
        ⚠ Educational and clinical decision-support only. Final prescription by qualified homeopathy physician.
      </p>
    </div>
  );
};

export default RemedyCompare;
