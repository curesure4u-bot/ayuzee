import { useEffect, useMemo, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Trash2, Search, Save, Printer, FileText } from "lucide-react";
import { toast } from "sonner";
import PrescriptionPrintable from "@/components/vaidya/PrescriptionPrintable";

type Drug = {
  id: string; name: string; category: string;
  indications: string[] | null; dose: string | null;
  precautions: string | null; mode_of_administration: string | null;
};

type Line = {
  drug: Drug;
  dose_override: string;
  frequency: string;
  duration: string;
  anupana: string;
  instructions: string;
};

const FREQ = ["OD (once a day)", "BD (twice)", "TID (thrice)", "QID (4 times)", "HS (bedtime)", "SOS"];
const ANUPANA = ["Warm water", "Honey (Then)", "Milk (Paal)", "Ghee (Nei)", "Buttermilk (Moru)", "Palm sugar (Karuppatti)", "Ginger juice (Inji saaru)"];

const SiddhaPrescription = () => {
  const { userId } = useDoctor();
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");

  const [allDrugs, setAllDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ data: pts }, { data: ds }] = await Promise.all([
        (supabase as any).from("vaidya_patients").select("id, full_name, phone, age, gender").eq("doctor_user_id", userId),
        (supabase as any).from("essential_siddha_drugs").select("id, name, category, indications, dose, precautions, mode_of_administration").order("name"),
      ]);
      setPatients(pts ?? []);
      setAllDrugs(ds ?? []);
    })();
  }, [userId]);

  const matches = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return [];
    return allDrugs.filter((d) => {
      const hay = `${d.name} ${d.category} ${(d.indications ?? []).join(" ")}`.toLowerCase();
      return hay.includes(t);
    }).slice(0, 8);
  }, [allDrugs, search]);

  const addDrug = (d: Drug) => {
    if (lines.find((l) => l.drug.id === d.id)) {
      toast.info("Already in prescription");
      return;
    }
    setLines((prev) => [...prev, {
      drug: d, dose_override: d.dose ?? "", frequency: "BD (twice)",
      duration: "7 days", anupana: "Warm water", instructions: "",
    }]);
    setSearch("");
  };

  const updateLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));

  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!userId) return toast.error("Not signed in");
    if (!patientId) return toast.error("Select a patient");
    if (lines.length === 0) return toast.error("Add at least one drug");
    setSaving(true);
    try {
      const { data: cons, error: cErr } = await (supabase as any).from("vaidya_consultations").insert({
        doctor_user_id: userId, patient_id: patientId, visit_date: visitDate,
        diagnosis: diagnosis || null, assessment: diagnosis || null,
        advice: advice || null, follow_up_date: followUp || null,
        prescription: lines.map((l) =>
          `${l.drug.name} — ${l.dose_override} · ${l.frequency} · ${l.duration} · with ${l.anupana}${l.instructions ? ` (${l.instructions})` : ""}`
        ).join("\n"),
      }).select().single();
      if (cErr) throw cErr;

      const rows = lines.map((l, idx) => ({
        consultation_id: cons.id, drug_id: l.drug.id,
        dose_override: l.dose_override, frequency: l.frequency,
        duration: l.duration, anupana: l.anupana, instructions: l.instructions,
        sort_order: idx,
      }));
      const { error: pErr } = await (supabase as any).from("prescription_essential_siddha_drugs").insert(rows);
      if (pErr) throw pErr;

      toast.success("Prescription saved");
      setLines([]); setDiagnosis(""); setAdvice(""); setFollowUp("");
    } catch (e: any) { toast.error(e.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const printRx = () => window.print();

  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="space-y-4 print:hidden">
      <Card className="p-4 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-display text-xl">Siddha Prescription Writer</h1>
            <p className="text-xs text-muted-foreground">
              Powered by AYUSH Essential Siddha Drugs ({allDrugs.length} formulations) — auto-fills alavu (dose), anupana, precautions.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 print:shadow-none print:border-0">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Patient *</Label>
            <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">— Select —</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div>
            <Label>Visit date</Label>
            <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          </div>
          <div>
            <Label>Follow-up</Label>
            <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <Label>Diagnosis (Noi nirnayam)</Label>
          <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Vatha suram (fever with vatha)" />
        </div>
      </Card>

      <Card className="p-4 print:hidden">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Label className="text-base font-semibold">Add Medicines</Label>
          <a href="/essential-siddha-drugs" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-smooth">
            📋 View Siddha Drug Reference ↗
          </a>
        </div>
        <Label>Search & add drug</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Type name or indication: nilavembu, suram, mega noi…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {matches.length > 0 && (
          <div className="mt-2 space-y-1 rounded-md border border-border bg-popover p-2">
            {matches.map((d) => (
              <button key={d.id} type="button" onClick={() => addDrug(d)}
                className="flex w-full items-start justify-between gap-2 rounded p-2 text-left hover:bg-accent">
                <div className="flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.category}{d.dose ? ` · ${d.dose}` : ""}
                    {d.indications?.length ? ` · ${d.indications.slice(0, 4).join(", ")}` : ""}
                  </p>
                </div>
                <Plus className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {lines.length > 0 && (
        <Card className="p-4 print:shadow-none print:border-0">
          <h2 className="mb-3 flex items-center gap-1 text-sm font-semibold">
            <Pill className="h-4 w-4 text-primary" /> Rx ({lines.length})
          </h2>
          <div className="space-y-3">
            {lines.map((l, i) => (
              <div key={l.drug.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{i + 1}. {l.drug.name}</p>
                    <Badge variant="secondary" className="mt-0.5 text-xs">{l.drug.category}</Badge>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeLine(i)} className="print:hidden">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 print:hidden">
                  <div>
                    <Label className="text-xs">Dose (Alavu)</Label>
                    <Input value={l.dose_override} onChange={(e) => updateLine(i, { dose_override: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Frequency</Label>
                    <select className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                      value={l.frequency} onChange={(e) => updateLine(i, { frequency: e.target.value })}>
                      {FREQ.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Input value={l.duration} onChange={(e) => updateLine(i, { duration: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Anupana</Label>
                    <select className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                      value={l.anupana} onChange={(e) => updateLine(i, { anupana: e.target.value })}>
                      {ANUPANA.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-2 print:hidden">
                  <Label className="text-xs">Instructions</Label>
                  <Input value={l.instructions} onChange={(e) => updateLine(i, { instructions: e.target.value })}
                    placeholder="e.g. after food" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Sig:</span> {l.dose_override} · {l.frequency} · {l.duration} · with {l.anupana}
                  {l.instructions && ` · ${l.instructions}`}
                </p>
                {l.drug.precautions && l.drug.precautions !== "NS" && (
                  <p className="mt-1 text-xs text-destructive">⚠ {l.drug.precautions}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 print:shadow-none print:border-0">
        <Label>Pathiyam / lifestyle advice</Label>
        <Textarea rows={3} value={advice} onChange={(e) => setAdvice(e.target.value)}
          placeholder="Diet, yoga, daily routine, dos & don'ts (pathiyam-apathiyam)…" />
      </Card>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={save} disabled={saving}>
          <Save className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save prescription"}
        </Button>
        <Button variant="outline" onClick={printRx} disabled={lines.length === 0}>
          <Printer className="mr-1 h-4 w-4" /> Print
        </Button>
      </div>
      </div>

      <PrescriptionPrintable
        system="Siddha"
        patientName={selectedPatient?.full_name || ""}
        patientPhone={selectedPatient?.phone}
        patientAge={selectedPatient?.age}
        patientGender={selectedPatient?.gender}
        visitDate={visitDate}
        followUpDate={followUp}
        diagnosis={diagnosis}
        advice={advice}
        lines={lines.map((l) => ({
          name: l.drug.name, category: l.drug.category,
          dose: l.dose_override, frequency: l.frequency,
          duration: l.duration, anupana: l.anupana, instructions: l.instructions,
        }))}
      />
    </div>
  );
};

export default SiddhaPrescription;
