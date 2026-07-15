import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, AlertTriangle, Hash } from "lucide-react";

const EssentialSiddhaDrugDetail = () => {
  const { slug } = useParams();
  const [drug, setDrug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("essential_siddha_drugs").select("*").eq("slug", slug).maybeSingle();
      setDrug(data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="container mx-auto p-8 text-sm text-muted-foreground">Loading…</div>;
  if (!drug) return <div className="container mx-auto p-8">Not found. <Link className="text-primary underline" to="/essential-siddha-drugs">Back</Link></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/essential-siddha-drugs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <Card className="mt-4 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Pill className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl">{drug.name}</h1>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge>{drug.category}</Badge>
              {drug.preferred_use && <Badge variant="outline">Use: {drug.preferred_use}</Badge>}
              {drug.serial_no && <Badge variant="secondary"><Hash className="mr-1 h-3 w-3" />{drug.serial_no}</Badge>}
            </div>
          </div>
        </div>

        {drug.indications?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-muted-foreground">Indications (Noi)</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {drug.indications.map((i: string) => <Badge key={i} variant="outline">{i}</Badge>)}
            </div>
          </section>
        )}

        {drug.dose && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Dose (Alavu)</h2>
            <p className="mt-1 text-sm">{drug.dose}</p>
          </section>
        )}

        {drug.mode_of_administration && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Mode of administration</h2>
            <p className="mt-1 text-sm">{drug.mode_of_administration}</p>
          </section>
        )}

        {drug.pack_size && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Pack size</h2>
            <p className="mt-1 text-sm">{drug.pack_size}</p>
          </section>
        )}

        {drug.precautions && drug.precautions !== "NS" && (
          <section className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <h2 className="flex items-center gap-1 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" /> Precautions
            </h2>
            <p className="mt-1 text-sm">{drug.precautions}</p>
          </section>
        )}

        {drug.reference_text && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold text-muted-foreground">Reference</h2>
            <p className="mt-1 text-xs text-muted-foreground">{drug.reference_text}</p>
          </section>
        )}

        <div className="mt-6 flex gap-2">
          <Button asChild><Link to="/vaidya/siddha-prescription">Use in prescription</Link></Button>
          <Button variant="outline" asChild><Link to="/essential-siddha-drugs">Browse more</Link></Button>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Source: Ministry of AYUSH — Essential Drugs List of Siddha. For qualified practitioner use.
      </p>
    </div>
  );
};

export default EssentialSiddhaDrugDetail;
