import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { ChevronRight, ArrowRight, Pill, Stethoscope } from "lucide-react";

interface SystemRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}
interface ConditionCard {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  product_image_url: string | null;
  hero_image_url: string | null;
  price: number;
  discount_price: number | null;
}

const TreatmentSystem = () => {
  const { slug } = useParams<{ slug: string }>();
  const [system, setSystem] = useState<SystemRow | null>(null);
  const [items, setItems] = useState<ConditionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: sys } = await supabase
        .from("treatment_systems")
        .select("id,slug,name,description")
        .eq("slug", slug)
        .maybeSingle();
      setSystem(sys as SystemRow | null);
      document.title = `${(sys as SystemRow | null)?.name ?? "Treatments"} — Ayuzee`;

      if (sys) {
        const { data } = await supabase
          .from("health_conditions")
          .select("id,slug,name,tagline,product_image_url,hero_image_url,price,discount_price")
          .eq("is_published", true)
          .eq("system_id", (sys as SystemRow).id)
          .order("sort_order", { ascending: true });
        setItems((data as ConditionCard[]) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />
      <main className="container py-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Treatments</span>
          {system && <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{system.name}</span>
          </>}
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl">{system?.name ?? "Treatments"}</h1>
            <p className="mt-1 text-muted-foreground">
              {system?.description ?? "Doctor-curated Ayurvedic care for this system."}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <p className="font-medium">No conditions added yet for this system.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon — our team is curating content.</p>
            <Link to="/health-conditions" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Browse all conditions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => {
              const off = c.discount_price ? Math.round(((c.price - c.discount_price) / c.price) * 100) : 0;
              return (
                <Link
                  key={c.id}
                  to={`/health-conditions/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-smooth hover:shadow-elegant"
                >
                  <div className="relative grid aspect-[16/9] place-items-center bg-gradient-to-br from-accent to-muted">
                    {c.hero_image_url || c.product_image_url ? (
                      <img src={c.hero_image_url ?? c.product_image_url ?? ""} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <Pill className="h-14 w-14 text-primary/40" />
                    )}
                    {off > 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{off}% off</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-xl">{c.name}</h3>
                    {c.tagline && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.tagline}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">₹{c.discount_price ?? c.price}</span>
                        {c.discount_price && <span className="text-xs text-muted-foreground line-through">₹{c.price}</span>}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        Explore <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TreatmentSystem;
