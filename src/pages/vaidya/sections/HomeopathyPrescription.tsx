import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Printer } from "lucide-react";
import PrescriptionPrintable from "@/components/vaidya/PrescriptionPrintable";

interface Drug {
  id: string; name: string; kingdom: string;
  available_potencies: string[]; available_forms: string[];
}
interface Line { drug: Drug; potency: string; dose: string; frequency: string; repetition: string; instructions: string; }

const HomeopathyPrescription = () => {
  const [patientName, setPatientName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Drug[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      (supabase as any).from("essential_homeopathy_drugs")
        .select("id, name, kingdom, available_potencies, available_forms")
        .ilike("name", `%${search}%`).limit(10)
        .then(({ data }: any) => setResults(data || []));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const addDrug = (d: Drug) => {
    setLines([...lines, {
      drug: d, potency: d.available_potencies?.[0] || "30",
      dose: "4 globules", frequency: "TDS", repetition: "", instructions: "",
    }]);
    setSearch(""); setResults([]);
  };
  const updateLine = (i: number, patch: Partial<Line>) => {
    setLines(lines.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!patientName.trim()) return toast.error("Enter patient name");
    if (lines.length === 0) return toast.error("Add at least one remedy");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return toast.error("Not signed in"); }
    const { data: cons, error: e1 } = await (supabase as any).from("vaidya_consultations").insert({
      doctor_user_id: user.id, patient_name: patientName, system: "homeopathy",
    }).select().single();
    if (e1 || !cons) { setSaving(false); return toast.error(e1?.message || "Failed"); }
    const rows = lines.map((l, idx) => ({
      consultation_id: cons.id, drug_id: l.drug.id, potency: l.potency,
      dose: l.dose, frequency: l.frequency, repetition: l.repetition,
      instructions: l.instructions, sort_order: idx,
    }));
    const { error: e2 } = await (supabase as any).from("prescription_homeopathy_drugs").insert(rows);
    setSaving(false);
    if (e2) return toast.error(e2.message);
    toast.success("Homeopathy prescription saved");
    setPatientName(""); setLines([]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="space-y-6 print:hidden">
      <div>
        <h1 className="text-2xl font-bold">💧 Homeopathy Prescription Writer</h1>
        <p className="text-sm text-muted-foreground mt-1">Select remedies and potencies from the official Essential Drugs list.</p>
      </div>

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <Input placeholder="Patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
      </div>

      <div className="bg-card border rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold">Add Remedies</h3>
          <a href="/essential-homeopathy-drugs" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-smooth">
            📋 View Homeopathy Drug Reference ↗
          </a>
        </div>
        <Input placeholder="Search remedy (e.g. Arnica, Belladonna)..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {results.length > 0 && (
          <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
            {results.map((d) => (
              <button key={d.id} onClick={() => addDrug(d)}
                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between text-sm">
                <span>{d.name}</span>
                <Badge variant="outline" className="text-[10px]">{d.kingdom}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">Prescription</h3>
          {lines.map((l, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{l.drug.name}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{l.drug.kingdom}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Potency</label>
                  <select value={l.potency} onChange={(e) => updateLine(i, { potency: e.target.value })}
                    className="w-full border rounded-md px-2 py-2 text-sm bg-background">
                    {l.drug.available_potencies?.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Dose</label>
                  <Input value={l.dose} onChange={(e) => updateLine(i, { dose: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Frequency</label>
                  <Input value={l.frequency} onChange={(e) => updateLine(i, { frequency: e.target.value })} placeholder="TDS / BD / Single dose" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Repetition</label>
                  <Input value={l.repetition} onChange={(e) => updateLine(i, { repetition: e.target.value })} placeholder="Wait 3 weeks…" />
                </div>
              </div>
              <Input value={l.instructions} onChange={(e) => updateLine(i, { instructions: e.target.value })} placeholder="Instructions (optional)" />
            </div>
          ))}
        </div>
      )}

      <Button onClick={save} disabled={saving} className="w-full md:w-auto">
        <Plus className="h-4 w-4 mr-2" /> {saving ? "Saving…" : "Save Prescription"}
      </Button>
    </div>
  );
};
export default HomeopathyPrescription;
