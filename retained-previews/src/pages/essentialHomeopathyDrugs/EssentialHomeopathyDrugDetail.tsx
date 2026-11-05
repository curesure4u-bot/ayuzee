import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const EssentialHomeopathyDrugDetail = () => {
  const { slug } = useParams();
  const [drug, setDrug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any).from("essential_homeopathy_drugs").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }: any) => { setDrug(data); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background"><SiteNav appLevel /><p className="text-center py-20">Loading…</p></div>;
  if (!drug) return <div className="min-h-screen bg-background"><SiteNav appLevel /><p className="text-center py-20">Remedy not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/essential-homeopathy-drugs" className="text-sm text-primary">← Back to library</Link>
        <div className="flex items-start justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold">{drug.name}</h1>
            {drug.latin_name && <p className="text-muted-foreground italic">{drug.latin_name}</p>}
          </div>
          <Badge variant="outline">{drug.kingdom}</Badge>
        </div>

        <section className="mt-8">
          <h2 className="font-semibold mb-2">Available Potencies</h2>
          <div className="flex flex-wrap gap-2">
            {drug.available_potencies?.map((p: string) => (
              <span key={p} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm">{p}</span>
            ))}
          </div>
        </section>

        {drug.available_forms?.length > 0 && (
          <section className="mt-6">
            <h2 className="font-semibold mb-2">Available Forms</h2>
            <div className="flex flex-wrap gap-2">
              {drug.available_forms.map((f: string) => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="font-semibold mb-2">Clinical Indications</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {drug.indications?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
          </ul>
        </section>

        {drug.dose && <section className="mt-6"><h2 className="font-semibold mb-1">Dose</h2><p className="text-sm">{drug.dose}</p></section>}
        {drug.mode_of_administration && <section className="mt-4"><h2 className="font-semibold mb-1">Mode of Administration</h2><p className="text-sm">{drug.mode_of_administration}</p></section>}
        {drug.precautions && <section className="mt-4"><h2 className="font-semibold mb-1">Precautions</h2><p className="text-sm">{drug.precautions}</p></section>}
        {drug.reference_text && <p className="mt-8 text-xs text-muted-foreground italic">Reference: {drug.reference_text}</p>}
      </div>
      <Footer />
    </div>
  );
};
export default EssentialHomeopathyDrugDetail;
