import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HealthCondition {
  id: string;
  name: string;
  slug: string;
  system_category: string | null;
  icon: string | null;
}

const ShopByCondition = () => {
  const [conditions, setConditions] = useState<HealthCondition[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Shop by Health Condition — Ayuzee";
    supabase
      .from("health_conditions")
      .select("id,name,slug,system_category,icon")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setConditions((data as HealthCondition[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = conditions.filter((condition) => {
    const haystack = `${condition.name} ${condition.system_category ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop" className="text-primary hover:underline">Medicines</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Health Conditions</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-5xl">Shop by Health Condition</h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Find the right medicine for your health concern
            </p>
          </div>
          <div className="mt-7 flex max-w-xl items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search condition or category"
              className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <main className="container py-8 md:py-10">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading health conditions…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-10 text-center text-muted-foreground">
            No health conditions found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((condition) => (
              <Link
                key={condition.id}
                to={`/shop/conditions/${condition.slug}`}
                className="group rounded-xl border border-border bg-background p-5 transition-smooth hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-3xl">
                    {condition.icon ?? "🌿"}
                  </div>
                  {condition.system_category && (
                    <Badge variant="secondary" className="rounded-full">{condition.system_category}</Badge>
                  )}
                </div>
                <h2 className="font-display text-lg leading-snug group-hover:text-primary">{condition.name}</h2>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Browse medicines <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShopByCondition;
