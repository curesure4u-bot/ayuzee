import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Loader2, Save, Edit } from "lucide-react";
import { SanskritTermInput, SanskritTerm } from "@/components/admin/astg/SanskritTermInput";
import { ArrayStringEditor } from "@/components/admin/astg/ArrayStringEditor";
import { RepeatableRowsEditor, RowFieldDef } from "@/components/admin/astg/RepeatableRowsEditor";

type Category = { id: string; name: string; name_sanskrit: string | null; icon: string | null; sort_order: number };
type Disease = {
  id: string; category_id: string | null; chapter_number: number | null;
  name: string; name_transliteration: string | null; name_modern: string | null;
  namc_code: string | null; namc_subtypes: any;
  icd11_tm2_code: string | null; icd11_biomedical_code: string | null;
  case_definition_ayurvedic: string | null; case_definition_biomedical: string | null;
  introduction_text: string | null; epidemiology_text: string | null;
  diagnostic_criteria: string | null;
  clinical_examination_text: string | null; investigations_text: string | null;
  differential_diagnosis_text: string | null;
  is_published: boolean;
};
type MgmtPrinciples = {
  id?: string; disease_id: string;
  red_flag_signs: string[];
  classical_treatment_text: string | null;
  classical_treatment_citations: any;
  prevention_text: string | null;
  yoga_exercise_text: string | null;
};
type PathyaRow = { id?: string; disease_id: string; category: "diet" | "lifestyle" | "other"; item_text: string; is_recommended: boolean; sort_order: number };
type LevelRow = { id?: string; disease_id: string; level_number: number; level_label: string; facility_type: string | null; facility_description: string | null; management_text: string | null; sort_order: number };
type FormularyRow = { id?: string; disease_id: string; drug_name: string; dosage_form: string | null; dose: string | null; timing: string | null; duration: string | null; anupana: string | null; source_reference: string | null; sort_order: number };

const DEFAULT_GROUP = "Musculoskeletal Disorders";

export default function ASTGGroupEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ [DEFAULT_GROUP]: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: cats }, { data: dxs }] = await Promise.all([
      supabase.from("astg_categories").select("id,name,name_sanskrit,icon,sort_order").order("sort_order"),
      supabase.from("astg_diseases").select("*").order("chapter_number"),
    ]);
    setCategories((cats as Category[]) ?? []);
    setDiseases((dxs as unknown as Disease[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const byCat = new Map<string, Disease[]>();
    for (const d of diseases) {
      const key = d.category_id ?? "uncategorized";
      byCat.set(key, [...(byCat.get(key) ?? []), d]);
    }
    return categories.map((c) => ({ category: c, diseases: byCat.get(c.id) ?? [] }));
  }, [categories, diseases]);

  const toggleGroup = (name: string) => setOpenGroups((s) => ({ ...s, [name]: !s[name] }));

  async function togglePublish(d: Disease) {
    const { error } = await supabase.from("astg_diseases").update({ is_published: !d.is_published }).eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success(`${d.name} ${d.is_published ? "unpublished" : "published"}`);
    load();
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ASTG Group Editor</h1>
        <p className="text-sm text-muted-foreground">
          Admin-only content editor for ASTG disease groups. Includes Musculoskeletal Disorders (AYUSH STG 2024) fields:
          NAMC codes, ICD-11 TM2 mapping, red-flag signs, pathya/apathya, intervention levels and formulary entries.
        </p>
      </div>

      {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      {grouped.map(({ category, diseases: list }) => {
        const isOpen = openGroups[category.name] ?? false;
        return (
          <Card key={category.id}>
            <Collapsible open={isOpen} onOpenChange={() => toggleGroup(category.name)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/40 transition-colors flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <CardTitle className="text-base">
                      {category.icon} {category.name}
                      {category.name_sanskrit && (
                        <span className="text-muted-foreground text-sm ml-2">· {category.name_sanskrit}</span>
                      )}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">{list.length} diseases</Badge>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2">
                  {list.map((d) => (
                    <div key={d.id} className="flex items-center justify-between border rounded p-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {d.name}
                          {d.name_transliteration && <span className="text-muted-foreground"> · {d.name_transliteration}</span>}
                          {d.name_modern && <span className="text-muted-foreground"> — {d.name_modern}</span>}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                          {d.namc_code && <Badge variant="outline">NAMC {d.namc_code}</Badge>}
                          {d.icd11_tm2_code && <Badge variant="outline">TM2 {d.icd11_tm2_code}</Badge>}
                          {d.icd11_biomedical_code && <Badge variant="outline">ICD-11 {d.icd11_biomedical_code}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={d.is_published} onCheckedChange={() => togglePublish(d)} />
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(d.id)}>
                          <Edit className="h-4 w-4 mr-1" />Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!list.length && <p className="text-sm text-muted-foreground py-4 text-center">No diseases in this group.</p>}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      <DiseaseEditorDialog
        diseaseId={editingId}
        onClose={() => setEditingId(null)}
        onSaved={() => { setEditingId(null); load(); }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full editor dialog
// ---------------------------------------------------------------------------

function DiseaseEditorDialog({ diseaseId, onClose, onSaved }: {
  diseaseId: string | null; onClose: () => void; onSaved: () => void;
}) {
  const [disease, setDisease] = useState<Disease | null>(null);
  const [mgmt, setMgmt] = useState<MgmtPrinciples | null>(null);
  const [pathya, setPathya] = useState<PathyaRow[]>([]);
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [formulary, setFormulary] = useState<FormularyRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!diseaseId) return;
    (async () => {
      setLoading(true);
      const [dx, mp, pa, lv, fe] = await Promise.all([
        supabase.from("astg_diseases").select("*").eq("id", diseaseId).single(),
        supabase.from("astg_management_principles").select("*").eq("disease_id", diseaseId).maybeSingle(),
        supabase.from("astg_pathya_apathya").select("*").eq("disease_id", diseaseId).order("sort_order"),
        supabase.from("astg_treatment_levels").select("*").eq("disease_id", diseaseId).order("level_number"),
        supabase.from("astg_formulary_entries").select("*").eq("disease_id", diseaseId).order("sort_order"),
      ]);
      setDisease(dx.data as unknown as Disease);
      setMgmt((mp.data as unknown as MgmtPrinciples) ?? {
        disease_id: diseaseId, red_flag_signs: [],
        classical_treatment_text: "", classical_treatment_citations: [],
        prevention_text: "", yoga_exercise_text: "",
      });
      setPathya((pa.data as unknown as PathyaRow[]) ?? []);
      setLevels((lv.data as unknown as LevelRow[]) ?? []);
      setFormulary((fe.data as unknown as FormularyRow[]) ?? []);
      setLoading(false);
    })();
  }, [diseaseId]);

  const nameTerm: SanskritTerm = {
    devanagari: disease?.name ?? "",
    iast: disease?.name_transliteration ?? "",
    english: disease?.name_modern ?? "",
  };

  async function save() {
    if (!disease) return;
    setSaving(true);
    try {
      const { error: e1 } = await supabase.from("astg_diseases").update({
        name: disease.name, name_transliteration: disease.name_transliteration, name_modern: disease.name_modern,
        namc_code: disease.namc_code, icd11_tm2_code: disease.icd11_tm2_code, icd11_biomedical_code: disease.icd11_biomedical_code,
        case_definition_ayurvedic: disease.case_definition_ayurvedic, case_definition_biomedical: disease.case_definition_biomedical,
        introduction_text: disease.introduction_text, epidemiology_text: disease.epidemiology_text,
        diagnostic_criteria: disease.diagnostic_criteria,
        clinical_examination_text: disease.clinical_examination_text,
        investigations_text: disease.investigations_text,
        differential_diagnosis_text: disease.differential_diagnosis_text,
      }).eq("id", disease.id);
      if (e1) throw e1;

      if (mgmt) {
        const payload = {
          disease_id: disease.id,
          red_flag_signs: mgmt.red_flag_signs ?? [],
          classical_treatment_text: mgmt.classical_treatment_text,
          classical_treatment_citations: mgmt.classical_treatment_citations ?? [],
          prevention_text: mgmt.prevention_text,
          yoga_exercise_text: mgmt.yoga_exercise_text,
        };
        const { error: e2 } = mgmt.id
          ? await supabase.from("astg_management_principles").update(payload).eq("id", mgmt.id)
          : await supabase.from("astg_management_principles").insert(payload);
        if (e2) throw e2;
      }

      // Replace-strategy for child rows: delete all then re-insert.
      await supabase.from("astg_pathya_apathya").delete().eq("disease_id", disease.id);
      if (pathya.length) {
        const { error } = await supabase.from("astg_pathya_apathya").insert(
          pathya.map((r, i) => ({ disease_id: disease.id, category: r.category, item_text: r.item_text, is_recommended: r.is_recommended, sort_order: i }))
        );
        if (error) throw error;
      }

      await supabase.from("astg_treatment_levels").delete().eq("disease_id", disease.id);
      if (levels.length) {
        const { error } = await supabase.from("astg_treatment_levels").insert(
          levels.map((r) => ({
            disease_id: disease.id, level_number: r.level_number, level_label: r.level_label,
            facility_type: r.facility_type, facility_description: r.facility_description,
            management_text: r.management_text, description: r.facility_description, sort_order: r.level_number,
          }))
        );
        if (error) throw error;
      }

      await supabase.from("astg_formulary_entries").delete().eq("disease_id", disease.id);
      if (formulary.length) {
        const { error } = await supabase.from("astg_formulary_entries").insert(
          formulary.map((r, i) => ({
            disease_id: disease.id, drug_name: r.drug_name, dosage_form: r.dosage_form, dose: r.dose,
            timing: r.timing, duration: r.duration, anupana: r.anupana, source_reference: r.source_reference, sort_order: i,
          }))
        );
        if (error) throw error;
      }

      toast.success("Saved");
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  const pathyaFields: RowFieldDef<PathyaRow>[] = [
    { key: "category", label: "Category", type: "select", widthClass: "col-span-3",
      options: [{ value: "diet", label: "Diet" }, { value: "lifestyle", label: "Lifestyle" }, { value: "other", label: "Other" }] },
    { key: "item_text", label: "Item", widthClass: "col-span-5", placeholder: "e.g. Warm cooked food" },
    { key: "is_recommended", label: "Type", type: "boolean", widthClass: "col-span-3" },
  ];
  const levelFields: RowFieldDef<LevelRow>[] = [
    { key: "level_number", label: "Level", type: "number", widthClass: "col-span-1" },
    { key: "level_label", label: "Label", widthClass: "col-span-2", placeholder: "Level 1" },
    { key: "facility_type", label: "Facility", widthClass: "col-span-2", placeholder: "PHC / CHC / DH" },
    { key: "facility_description", label: "Facility description", widthClass: "col-span-3" },
    { key: "management_text", label: "Management text", widthClass: "col-span-3" },
  ];
  const formularyFields: RowFieldDef<FormularyRow>[] = [
    { key: "drug_name", label: "Drug", widthClass: "col-span-2" },
    { key: "dosage_form", label: "Form", widthClass: "col-span-1", placeholder: "churna" },
    { key: "dose", label: "Dose", widthClass: "col-span-1", placeholder: "3g BD" },
    { key: "timing", label: "Timing", widthClass: "col-span-1", placeholder: "AF/BF" },
    { key: "duration", label: "Duration", widthClass: "col-span-1" },
    { key: "anupana", label: "Anupana", widthClass: "col-span-2", placeholder: "Warm water" },
    { key: "source_reference", label: "Source ref", widthClass: "col-span-3", placeholder: "AFI Part I, p.123" },
  ];

  return (
    <Dialog open={!!diseaseId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit ASTG Disease</DialogTitle>
        </DialogHeader>

        {loading || !disease ? (
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
              <TabsTrigger value="pathya">Pathya / Levels</TabsTrigger>
              <TabsTrigger value="formulary">Formulary</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4 pt-4">
              <SanskritTermInput
                label="Disease name (Sanskrit compound support)"
                value={nameTerm}
                onChange={(t) => setDisease({ ...disease, name: t.devanagari, name_transliteration: t.iast, name_modern: t.english })}
                required
                compact
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>NAMC code</Label>
                  <Input value={disease.namc_code ?? ""} onChange={(e) => setDisease({ ...disease, namc_code: e.target.value })} placeholder="AAE-16" />
                </div>
                <div>
                  <Label>ICD-11 TM2</Label>
                  <Input value={disease.icd11_tm2_code ?? ""} onChange={(e) => setDisease({ ...disease, icd11_tm2_code: e.target.value })} placeholder="SP12" />
                </div>
                <div>
                  <Label>ICD-11 biomedical</Label>
                  <Input value={disease.icd11_biomedical_code ?? ""} onChange={(e) => setDisease({ ...disease, icd11_biomedical_code: e.target.value })} placeholder="FA00-FA05" />
                </div>
              </div>
              <div>
                <Label>Introduction / epidemiology</Label>
                <Textarea rows={4} value={disease.introduction_text ?? ""} onChange={(e) => setDisease({ ...disease, introduction_text: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Case definition (Ayurvedic)</Label>
                  <Textarea rows={4} value={disease.case_definition_ayurvedic ?? ""} onChange={(e) => setDisease({ ...disease, case_definition_ayurvedic: e.target.value })} />
                </div>
                <div>
                  <Label>Case definition (Biomedical)</Label>
                  <Textarea rows={4} value={disease.case_definition_biomedical ?? ""} onChange={(e) => setDisease({ ...disease, case_definition_biomedical: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Diagnostic criteria</Label>
                <Textarea rows={4} value={disease.diagnostic_criteria ?? ""} onChange={(e) => setDisease({ ...disease, diagnostic_criteria: e.target.value })} />
              </div>
              <div>
                <Label>Clinical examination</Label>
                <Textarea rows={3} value={disease.clinical_examination_text ?? ""} onChange={(e) => setDisease({ ...disease, clinical_examination_text: e.target.value })} />
              </div>
              <div>
                <Label>Investigations</Label>
                <Textarea rows={3} value={disease.investigations_text ?? ""} onChange={(e) => setDisease({ ...disease, investigations_text: e.target.value })} />
              </div>
              <div>
                <Label>Differential diagnosis</Label>
                <Textarea rows={3} value={disease.differential_diagnosis_text ?? ""} onChange={(e) => setDisease({ ...disease, differential_diagnosis_text: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="management" className="space-y-4 pt-4">
              <div>
                <Label>Red-flag signs (bypass-AI-interpretation triggers)</Label>
                <ArrayStringEditor
                  value={mgmt?.red_flag_signs ?? []}
                  onChange={(v) => setMgmt({ ...(mgmt as MgmtPrinciples), red_flag_signs: v })}
                  redFlag
                  placeholder="e.g. Fever with joint effusion"
                />
              </div>
              <div>
                <Label>Classical treatment (may include shloka + citations)</Label>
                <Textarea rows={5} value={mgmt?.classical_treatment_text ?? ""} onChange={(e) => setMgmt({ ...(mgmt as MgmtPrinciples), classical_treatment_text: e.target.value })}
                  placeholder='e.g. "Charak Samhita Chikitsa Sthan Ch.28 v.75-83"' />
              </div>
              <div>
                <Label>Prevention</Label>
                <Textarea rows={3} value={mgmt?.prevention_text ?? ""} onChange={(e) => setMgmt({ ...(mgmt as MgmtPrinciples), prevention_text: e.target.value })} />
              </div>
              <div>
                <Label>Yoga / exercise</Label>
                <Textarea rows={3} value={mgmt?.yoga_exercise_text ?? ""} onChange={(e) => setMgmt({ ...(mgmt as MgmtPrinciples), yoga_exercise_text: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="pathya" className="space-y-6 pt-4">
              <RepeatableRowsEditor<PathyaRow>
                title="Pathya / Apathya (diet & lifestyle)"
                rows={pathya}
                onChange={setPathya}
                fields={pathyaFields}
                newRow={() => ({ disease_id: disease.id, category: "diet", item_text: "", is_recommended: true, sort_order: pathya.length })}
                addLabel="Add pathya/apathya"
              />
              <RepeatableRowsEditor<LevelRow>
                title="Intervention levels (PHC / CHC / DH)"
                rows={levels}
                onChange={setLevels}
                fields={levelFields}
                newRow={() => ({ disease_id: disease.id, level_number: (levels.at(-1)?.level_number ?? 0) + 1, level_label: `Level ${(levels.at(-1)?.level_number ?? 0) + 1}`, facility_type: "", facility_description: "", management_text: "", sort_order: levels.length })}
                addLabel="Add level"
              />
            </TabsContent>

            <TabsContent value="formulary" className="space-y-4 pt-4">
              <RepeatableRowsEditor<FormularyRow>
                title="Formulary entries"
                rows={formulary}
                onChange={setFormulary}
                fields={formularyFields}
                newRow={() => ({ disease_id: disease.id, drug_name: "", dosage_form: "", dose: "", timing: "", duration: "", anupana: "", source_reference: "", sort_order: formulary.length })}
                addLabel="Add formulary entry"
              />
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || loading || !disease}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
