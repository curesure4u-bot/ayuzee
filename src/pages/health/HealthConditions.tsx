import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { ChevronRight, ArrowRight, Pill } from "lucide-react";

interface ConditionCard {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  product_name: string | null;
  product_image_url: string | null;
  hero_image_url: string | null;
  price: number;
  discount_price: number | null;
}

const HealthConditions = () => {
  const [items, setItems] = useState<ConditionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Health Conditions — Ayuzee";
    supabase
      .from("health_conditions")
      .select("id,slug,name,tagline,product_name,product_image_url,hero_image_url,price,discount_price")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setItems((data as ConditionCard[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />
      <main className="container py-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Health Conditions</span>
        </div>

        <h1 className="font-display text-3xl">Health Conditions</h1>
        <p className="mt-1 text-muted-foreground">Doctor-curated Ayurvedic care for chronic and lifestyle conditions.</p>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
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

export default HealthConditions;
