import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBadge } from "@/components/astg/DualNameHeader";
import { ArrowRight, Bone, ChevronLeft, Loader2 } from "lucide-react";

interface DiseaseRow {
  id: string;
  name: string;
  name_transliteration: string | null;
  name_modern: string | null;
  namc_code: string | null;
  icd11_tm2_code: string | null;
  icd11_biomedical_code: string | null;
  definition: string | null;
  chapter_number: number | null;
  is_published: boolean;
}

export default function MusculoskeletalReference() {
  usePageSEO({
    title: "Musculoskeletal Disorders — ASTG Reference | Ayuzee",
    description:
      "Ayurvedic Standard Treatment Guidelines for musculoskeletal disorders — dual NAMC / ICD-11 TM2 coded, with intervention tiers and pathya-apathya.",
  });

  const [diseases, setDiseases] = useState<DiseaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase
        .from("astg_categories")
        .select("id")
        .eq("name", "Musculoskeletal Disorders")
        .maybeSingle();
      if (!cat) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("astg_diseases")
        .select(
          "id,name,name_transliteration,name_modern,namc_code,icd11_tm2_code,icd11_biomedical_code,definition,chapter_number,is_published",
        )
        .eq("category_id", cat.id)
        .order("sort_order", { ascending: true });
      setDiseases((data as DiseaseRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container py-6">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
          <Link to="/">
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>

      <header className="mb-6 rounded-xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Bone className="h-6 w-6" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">
              AYUSH STG · 2024
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Musculoskeletal Disorders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sandhi-Asthi-Majja Vyadhi · Ministry of AYUSH Standard Treatment
              Guidelines with dual NAMC / ICD-11 TM2 coding, intervention tiers,
              red-flag screening and pathya-apathya guidance.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : diseases.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No musculoskeletal diseases have been published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {diseases.map((d) => (
            <Link
              key={d.id}
              to={`/astg/musculoskeletal/${d.id}`}
              className="group rounded-xl border bg-card p-4 transition-smooth hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-lg font-semibold">
                      {d.name}
                    </span>
                    {d.name_transliteration && (
                      <span className="text-sm italic text-muted-foreground">
                        {d.name_transliteration}
                      </span>
                    )}
                  </div>
                  {d.name_modern && (
                    <p className="text-sm text-foreground/70">{d.name_modern}</p>
                  )}
                  {d.definition && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {d.definition}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.namc_code && (
                      <CodeBadge label="NAMC" value={d.namc_code} tone="emerald" />
                    )}
                    {d.icd11_tm2_code && (
                      <CodeBadge
                        label="ICD-11 TM2"
                        value={d.icd11_tm2_code}
                        tone="indigo"
                      />
                    )}
                    {!d.is_published && (
                      <Badge variant="outline" className="text-[10px]">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
