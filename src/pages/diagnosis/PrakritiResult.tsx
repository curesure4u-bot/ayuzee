import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { PrakritiResultView, type PrakritiResultData } from "@/components/diagnosis/PrakritiResultView";

const PrakritiResult = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PrakritiResultData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("prakriti_assessments")
      .select("id, dominant_dosha, vata_score, pitta_score, kapha_score, total_questions")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setLoading(false);
        if (!data || !data.dominant_dosha) {
          setNotFound(true);
          return;
        }
        const total = data.total_questions || (data.vata_score + data.pitta_score + data.kapha_score) || 1;
        setResult({
          id: data.id,
          dominant: data.dominant_dosha,
          vata: data.vata_score,
          pitta: data.pitta_score,
          kapha: data.kapha_score,
          vataPct: Math.round((data.vata_score / total) * 100),
          pittaPct: Math.round((data.pitta_score / total) * 100),
          kaphaPct: Math.round((data.kapha_score / total) * 100),
          total,
        });
      });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 container py-12 max-w-4xl">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your Prakriti result…</p>
        ) : notFound || !result ? (
          <div className="rounded-xl border p-8 text-center">
            <h1 className="font-display text-2xl font-semibold">Result not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This Prakriti assessment may have been removed or you don't have access to it.
            </p>
            <Link to="/diagnosis/prakriti" className="mt-4 inline-block text-sm text-primary hover:underline">
              Take a new assessment →
            </Link>
          </div>
        ) : (
          <PrakritiResultView result={result} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PrakritiResult;
