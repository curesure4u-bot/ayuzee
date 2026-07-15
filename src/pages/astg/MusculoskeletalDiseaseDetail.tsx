import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, BookOpen, Loader2, Printer, Sparkles } from "lucide-react";
import DualNameHeader from "@/components/astg/DualNameHeader";
import RedFlagCallout from "@/components/astg/RedFlagCallout";
import InterventionLevelsPanel, {
  type InterventionLevel,
} from "@/components/astg/InterventionLevelsPanel";
import PathyaApathyaTable, {
  type PathyaApathyaRow,
} from "@/components/astg/PathyaApathyaTable";

interface Disease {
  id: string;
  name: string;
  name_transliteration: string | null;
  name_modern: string | null;
  namc_code: string | null;
  namc_subtypes: any;
  icd11_tm2_code: string | null;
  icd11_biomedical_code: string | null;
  chapter_number: number | null;
  definition: string | null;
  introduction_text: string | null;
  epidemiology_text: string | null;
  case_definition_ayurvedic: string | null;
  case_definition_biomedical: string | null;
  nidana: string | null;
  lakshana: any;
  clinical_examination_text: string | null;
  investigations_text: string | null;
  differential_diagnosis_text: string | null;
  diagnostic_criteria: string | null;
  pathya: string | null;
  apathya: string | null;
  prognosis: string | null;
  reference_text: string | null;
  category_id: string;
}

interface Management {
  red_flag_signs: string[] | null;
  classical_treatment_text: string | null;
  classical_treatment_citations: any;
  prevention_text: string | null;
  yoga_exercise_text: string | null;
}

interface FormularyEntry {
  id: string;
  drug_name: string;
  dosage_form: string | null;
  dose: string | null;
  timing: string | null;
  duration: string | null;
  anupana: string | null;
  source_reference: string | null;
}

export default function MusculoskeletalDiseaseDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [disease, setDisease] = useState<Disease | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [management, setManagement] = useState<Management | null>(null);
  const [levels, setLevels] = useState<InterventionLevel[]>([]);
  const [pathyaRows, setPathyaRows] = useState<PathyaApathyaRow[]>([]);
  const [formulary, setFormulary] = useState<FormularyEntry[]>([]);

  usePageSEO({
    title: disease
      ? `${disease.name} (${disease.name_modern ?? ""}) — ASTG | Ayuzee`
      : "ASTG Disease | Ayuzee",
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [{ data: d }, { data: m }, { data: lv }, { data: pa }, { data: fx }] =
        await Promise.all([
          supabase.from("astg_diseases").select("*").eq("id", id).maybeSingle(),
          supabase
            .from("astg_management_principles")
            .select("*")
            .eq("disease_id", id)
            .maybeSingle(),
          supabase
            .from("astg_treatment_levels")
            .select("*")
            .eq("disease_id", id)
            .order("level_number", { ascending: true }),
          supabase
            .from("astg_pathya_apathya")
            .select("*")
            .eq("disease_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("astg_formulary_entries")
            .select("*")
            .eq("disease_id", id)
            .order("sort_order", { ascending: true }),
        ]);
      setDisease(d as Disease);
      setManagement(m as Management);
      setLevels((lv as InterventionLevel[]) ?? []);
      setPathyaRows((pa as PathyaApathyaRow[]) ?? []);
      setFormulary((fx as FormularyEntry[]) ?? []);
      if (d?.category_id) {
        const { data: c } = await supabase
          .from("astg_categories")
          .select("name")
          .eq("id", d.category_id)
          .maybeSingle();
        setCategoryName(c?.name ?? "");
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="mb-4 text-muted-foreground">
              Disease not found or not yet published.
            </p>
            <Button asChild>
              <Link to="/astg/musculoskeletal">Back to reference</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lakshanaList: string[] = Array.isArray(disease.lakshana)
    ? disease.lakshana
    : [];
  const subtypes: Array<{ code?: string; name?: string; description?: string }> =
    Array.isArray(disease.namc_subtypes) ? disease.namc_subtypes : [];
  const citations: Array<{ text?: string; source?: string }> = Array.isArray(
    management?.classical_treatment_citations,
  )
    ? management!.classical_treatment_citations
    : [];

  return (
    <div className="container py-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1"
          onClick={() => navigate("/astg/musculoskeletal")}
        >
          <ArrowLeft className="h-4 w-4" />
          Musculoskeletal Reference
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <DualNameHeader
        nameDevanagari={disease.name}
        nameTransliteration={disease.name_transliteration}
        nameModern={disease.name_modern}
        namcCode={disease.namc_code}
        icd11Tm2Code={disease.icd11_tm2_code}
        icd11BiomedicalCode={disease.icd11_biomedical_code}
        chapter={disease.chapter_number}
        categoryLabel={categoryName}
      />

      {disease.definition && (
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {disease.definition}
        </p>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="levels">Intervention Levels</TabsTrigger>
          <TabsTrigger value="diet">Pathya / Apathya</TabsTrigger>
          <TabsTrigger value="formulary">Formulary</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {disease.introduction_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Introduction</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.introduction_text}
              </CardContent>
            </Card>
          )}
          {disease.epidemiology_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Epidemiology</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.epidemiology_text}
              </CardContent>
            </Card>
          )}
          {disease.nidana && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nidana (Aetiology)</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.nidana}
              </CardContent>
            </Card>
          )}
          {subtypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  NAMC Subtypes ({disease.namc_code})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {subtypes.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {s.code && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {s.code}
                        </Badge>
                      )}
                      <div>
                        <span className="font-medium">{s.name}</span>
                        {s.description && (
                          <span className="ml-1 text-muted-foreground">
                            — {s.description}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diagnosis */}
        <TabsContent value="diagnosis" className="space-y-4">
          {(disease.case_definition_ayurvedic ||
            disease.case_definition_biomedical) && (
            <div className="grid gap-4 md:grid-cols-2">
              {disease.case_definition_ayurvedic && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Case Definition · Ayurvedic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                    {disease.case_definition_ayurvedic}
                  </CardContent>
                </Card>
              )}
              {disease.case_definition_biomedical && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Case Definition · Biomedical
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                    {disease.case_definition_biomedical}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {lakshanaList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Lakshana (Clinical Features)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {lakshanaList.map((l, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {disease.clinical_examination_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clinical Examination</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.clinical_examination_text}
              </CardContent>
            </Card>
          )}
          {disease.investigations_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investigations</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.investigations_text}
              </CardContent>
            </Card>
          )}
          {disease.differential_diagnosis_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Differential Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.differential_diagnosis_text}
              </CardContent>
            </Card>
          )}
          {disease.diagnostic_criteria && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Diagnostic Criteria</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.diagnostic_criteria}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Principles of Management */}
        <TabsContent value="management" className="space-y-4">
          <RedFlagCallout signs={management?.red_flag_signs ?? []} />

          {management?.classical_treatment_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classical Treatment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed">
                <p className="whitespace-pre-line">
                  {management.classical_treatment_text}
                </p>
                {citations.length > 0 && (
                  <div className="rounded-md border bg-muted/30 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Shloka citations
                    </div>
                    <ul className="space-y-2">
                      {citations.map((c, i) => (
                        <li key={i} className="text-xs">
                          <span className="italic">{c.text}</span>
                          {c.source && (
                            <span className="ml-2 text-muted-foreground">
                              — {c.source}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {management?.prevention_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prevention</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {management.prevention_text}
              </CardContent>
            </Card>
          )}
          {management?.yoga_exercise_text && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Yoga & Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {management.yoga_exercise_text}
              </CardContent>
            </Card>
          )}
          {disease.prognosis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Sadhya-Asadhyata (Prognosis)
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">
                {disease.prognosis}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Intervention Levels */}
        <TabsContent value="levels">
          <InterventionLevelsPanel levels={levels} />
        </TabsContent>

        {/* Pathya / Apathya */}
        <TabsContent value="diet">
          <PathyaApathyaTable
            rows={pathyaRows}
            fallbackPathya={disease.pathya}
            fallbackApathya={disease.apathya}
          />
        </TabsContent>

        {/* Formulary */}
        <TabsContent value="formulary">
          {formulary.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Formulary entries have not been captured yet.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drug</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Dose</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Anupana</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formulary.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.drug_name}</TableCell>
                      <TableCell>{f.dosage_form ?? "—"}</TableCell>
                      <TableCell>{f.dose ?? "—"}</TableCell>
                      <TableCell>{f.timing ?? "—"}</TableCell>
                      <TableCell>{f.duration ?? "—"}</TableCell>
                      <TableCell>{f.anupana ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {f.source_reference ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* References */}
        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                Source References
              </CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line text-sm leading-relaxed">
              {disease.reference_text ?? (
                <span className="text-muted-foreground">
                  Ministry of AYUSH · AYUSH Standard Treatment Guidelines, 2024
                  (ISBN 978-81-974231-0-9)
                </span>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
