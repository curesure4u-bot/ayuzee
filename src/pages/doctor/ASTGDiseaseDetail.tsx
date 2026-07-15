import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  BookOpen,
  Printer,
  Languages,
} from "lucide-react";
import { findDisease } from "@/data/astg";
import { exportDiseasePDF } from "@/lib/astg-search";
import ASTGClinicalAssistant from "@/components/astg/ASTGClinicalAssistant";
import AddToPatientNotes from "@/components/astg/AddToPatientNotes";
import MedicineTable from "@/components/astg/MedicineTable";
import BookPanchakarmaButton from "@/components/astg/BookPanchakarmaButton";
import PatientHandoutDialog from "@/components/astg/PatientHandoutDialog";
import { pushRecent, cacheProtocol } from "@/lib/astg-history";
import { toggleBookmark as toggleBookmarkLS, isBookmarked } from "./ASTGBookmarks";
import { useEffect as useEffectReact } from "react";

export default function ASTGDiseaseDetail() {
  const { categoryKey = "", diseaseKey = "" } = useParams();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(diseaseKey));
  const [handoutOpen, setHandoutOpen] = useState(false);

  const match = useMemo(
    () => findDisease(categoryKey, diseaseKey),
    [categoryKey, diseaseKey],
  );

  useEffectReact(() => {
    if (match) {
      pushRecent({
        categoryKey: match.category.key,
        diseaseKey: match.disease.key,
        name: match.disease.name,
        modern: match.disease.modern,
      });
      cacheProtocol(`${match.category.key}/${match.disease.key}`, match.disease);
    }
  }, [match]);


  if (!match) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="mb-4 text-muted-foreground">
              We couldn't find that disease in the ASTG reference.
            </p>
            <Button asChild>
              <Link to="/doctor/astg-reference">Back to reference</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { category, disease } = match;
  const levels = disease.levels ?? [];

  return (
    <div className="container py-6">
      {/* Breadcrumb + actions */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1"
            onClick={() => navigate("/doctor/astg-reference")}
          >
            <ArrowLeft className="h-4 w-4" />
            ASTG Reference
          </Button>
          <span>/</span>
          <span className="flex items-center gap-1">
            <span>{category.icon}</span>
            {category.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setBookmarked(toggleBookmarkLS(diseaseKey, categoryKey))}
          >
            {bookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-primary" />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Bookmark
              </>
            )}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => exportDiseasePDF(match.category, match.disease)}
          >
            <Printer className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setHandoutOpen(true)}
          >
            <Languages className="h-4 w-4" />
            Patient Handout
          </Button>
          <ASTGClinicalAssistant
            variant="inline"
            diseaseContext={`${disease.name} (${disease.modern})`}
          />
          <AddToPatientNotes
            diseaseName={`${disease.name} (${disease.modern})`}
            summary={`${disease.definition ?? ""}\n\nLakshana: ${(disease.lakshana ?? []).join(", ")}\nPathya: ${disease.pathya ?? "—"}\nApathya: ${disease.apathya ?? "—"}`}
          />
        </div>
      </div>


      {/* Header */}
      <header className="mb-6 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start gap-3">
          <Badge variant="outline">Chapter {disease.ch}</Badge>
          <Badge variant="secondary">{category.modern}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {disease.name}
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          {disease.modern}
        </p>
        {disease.definition && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed">
            {disease.definition}
          </p>
        )}
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Levels</TabsTrigger>
          <TabsTrigger value="diet">Pathya / Apathya</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {disease.nidana && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nidana (Aetiology)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                {disease.nidana}
              </CardContent>
            </Card>
          )}
          {disease.lakshana && disease.lakshana.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Lakshana (Clinical Features)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {disease.lakshana.map((l, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
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
              <CardContent className="text-sm leading-relaxed">
                {disease.prognosis}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diagnosis */}
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diagnostic Criteria</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              {disease.diagnostic ?? (
                <span className="text-muted-foreground">
                  Diagnostic criteria not yet captured for this chapter.
                </span>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Levels */}
        <TabsContent value="treatment">
          {levels.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Treatment levels coming soon.
              </CardContent>
            </Card>
          ) : (
            <Accordion
              type="single"
              collapsible
              defaultValue={`level-${levels[0].level}`}
              className="space-y-2"
            >
              {levels.map((lvl) => (
                <AccordionItem
                  key={lvl.level}
                  value={`level-${lvl.level}`}
                  className="rounded-lg border bg-card px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center gap-3 text-left">
                      <Badge>{lvl.label}</Badge>
                      <div>
                        <div className="font-medium">{lvl.facility}</div>
                        {lvl.description && (
                          <div className="text-xs font-normal text-muted-foreground">
                            {lvl.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {lvl.panchakarma && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                        <div>
                          <span className="font-semibold">Panchakarma: </span>
                          {lvl.panchakarma}
                        </div>
                        {lvl.level >= 3 && (
                          <BookPanchakarmaButton
                            diseaseName={`${disease.name} (${disease.modern})`}
                            diseaseKey={`${category.key}/${disease.key}`}
                            protocol={lvl.panchakarma}
                          />
                        )}
                      </div>
                    )}
                    <MedicineTable
                      categoryKey={category.key}
                      diseaseKey={disease.key}
                      level={lvl.level}
                      medicines={lvl.medicines}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        {/* Diet */}
        <TabsContent value="diet" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pathya (Wholesome)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              {disease.pathya ?? (
                <span className="text-muted-foreground">
                  Not yet captured.
                </span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <XCircle className="h-4 w-4 text-destructive" />
                Apathya (Unwholesome)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              {disease.apathya ?? (
                <span className="text-muted-foreground">
                  Not yet captured.
                </span>
              )}
            </CardContent>
          </Card>
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
            <CardContent className="text-sm leading-relaxed">
              {disease.references ?? (
                <span className="text-muted-foreground">
                  Ministry of AYUSH ASTG, 2017 Edition — chapter reference
                  pending.
                </span>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PatientHandoutDialog
        open={handoutOpen}
        onOpenChange={setHandoutOpen}
        categoryKey={category.key}
        diseaseKey={disease.key}
        diseaseName={disease.name}
        diseaseModern={disease.modern}
        pathya={disease.pathya}
        apathya={disease.apathya}
      />
    </div>
  );
}
