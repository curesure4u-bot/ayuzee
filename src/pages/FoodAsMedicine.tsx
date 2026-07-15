import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Search, Leaf, ShieldAlert, ChefHat, Sparkles, ArrowLeft, Baby, HeartPulse } from "lucide-react";

type Recipe = {
  id: string; slug: string; name: string; subtitle: string | null;
  system: string; category: string; description: string | null;
  ingredients: { item: string; qty: string }[]; servings: string | null;
  method: string; health_benefits: string; contraindications: string | null;
  precautions: string | null; indications: string[]; suitable_doshas: string[];
  diabetic_friendly: boolean; pregnancy_safe: boolean; lactation_friendly: boolean; children_friendly: boolean;
  source: string;
};

const CATEGORIES = ["All", "Drink", "Soup", "Side", "Sweet", "Chutney"];

const FoodAsMedicine = () => {
  usePageSEO({ title: "Food as Medicine — AYUSH Traditional Recipes | Ayuzee" });
  const { slug } = useParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [active, setActive] = useState<Recipe | null>(null);

  useEffect(() => { (async () => {
      const { data } = await supabase
        .from("food_recipes" as any)
        .select("*")
        .eq("is_published", true)
        .order("display_order");
      setRecipes((data ?? []) as any);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (slug && recipes.length) setActive(recipes.find(r => r.slug === slug) ?? null);
  }, [slug, recipes]);

  const filtered = useMemo(() => recipes.filter(r =>
    (cat === "All" || r.category === cat) &&
    (!q.trim() || r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.indications.some(i => i.toLowerCase().includes(q.toLowerCase())) ||
      r.health_benefits.toLowerCase().includes(q.toLowerCase()))
  ), [recipes, q, cat]);

  if (active) return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav appLevel />
      <main className="container max-w-4xl py-8 space-y-6">
        <button onClick={() => { setActive(null); window.history.replaceState(null, "", "/food-as-medicine"); }}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to library
        </button>
        <header className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Leaf className="h-3.5 w-3.5" /> {active.system} · {active.category}
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{active.name}</h1>
          {active.subtitle && <p className="text-muted-foreground mt-1">{active.subtitle}</p>}
          {active.description && <p className="mt-3 text-sm md:text-base">{active.description}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {active.diabetic_friendly && <Badge tone="emerald">Diabetic-friendly</Badge>}
            {active.lactation_friendly && <Badge tone="pink">Boosts lactation</Badge>}
            {active.pregnancy_safe && <Badge tone="amber">Pregnancy-safe</Badge>}
            {active.children_friendly && <Badge tone="sky">Kids OK</Badge>}
            {active.suitable_doshas.map(d => <Badge key={d} tone="violet">{d}</Badge>)}
          </div>
        </header>
        <section className="grid md:grid-cols-2 gap-5">
          <Card title="Ingredients" icon={<ChefHat className="h-4 w-4" />}>
            <ul className="space-y-1.5 text-sm">
              {active.ingredients.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-3 border-b border-border/50 pb-1.5">
                  <span>{i.item}</span><span className="text-muted-foreground">{i.qty}</span>
                </li>
              ))}
            </ul>
            {active.servings && <p className="mt-3 text-xs text-muted-foreground italic">Yield: {active.servings}</p>}
          </Card>
          <Card title="Method" icon={<Sparkles className="h-4 w-4" />}>
            <p className="text-sm whitespace-pre-line leading-relaxed">{active.method}</p>
          </Card>
        </section>
        <Card title="Health benefits" icon={<HeartPulse className="h-4 w-4" />}>
          <p className="text-sm leading-relaxed">{active.health_benefits}</p>
          {active.indications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.indications.map(i => <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">{i}</span>)}
            </div>
          )}
        </Card>
        {(active.contraindications || active.precautions) && (
          <Card title="Caution" icon={<ShieldAlert className="h-4 w-4" />} tone="warn">
            {active.contraindications && <p className="text-sm"><strong>Contraindications:</strong> {active.contraindications}</p>}
            {active.precautions && <p className="text-sm mt-2"><strong>Precautions:</strong> {active.precautions}</p>}
          </Card>
        )}
        <p className="text-xs text-muted-foreground italic">Source: {active.source}</p>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav appLevel />
      <section className="border-b bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20">
        <div className="container py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5" /> Ministry of AYUSH · Government of India
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl max-w-3xl">Food as Medicine — Traditional AYUSH Recipes</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
            29 time-tested recipes from Ayurveda, Yoga, Siddha and Unani. Search by health condition, dietary need or dosha — and ask your Ayuzee doctor to add them to your prescription.
          </p>
        </div>
      </section>
      <main className="container py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by name, condition, or benefit (e.g. anaemia, lactation, diabetes)…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium border transition ${cat === c ? "bg-emerald-700 text-white border-emerald-700" : "border-border hover:border-emerald-400"}`}>{c}</button>
            ))}
          </div>
        </div>
        {loading ? <div className="text-center py-16 text-muted-foreground">Loading recipes…</div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <button key={r.id} onClick={() => { setActive(r); window.history.replaceState(null, "", `/food-as-medicine/${r.slug}`); }}
                className="text-left rounded-xl border bg-card p-5 hover:border-emerald-400 hover:shadow-md transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{r.category}</div>
                <h3 className="mt-1 font-display text-lg">{r.name}</h3>
                {r.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>}
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{r.description ?? r.health_benefits}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.diabetic_friendly && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">Diabetic OK</span>}
                  {r.lactation_friendly && <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 inline-flex items-center gap-1"><Baby className="h-2.5 w-2.5" />Lactation</span>}
                  {r.indications.slice(0, 2).map(i => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{i}</span>)}
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No recipes match your search.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const Badge = ({ children, tone }: { children: React.ReactNode; tone: string }) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
    pink: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[tone]}`}>{children}</span>;
};

const Card = ({ title, icon, children, tone }: { title: string; icon: React.ReactNode; children: React.ReactNode; tone?: "warn" }) => (
  <div className={`rounded-xl border p-5 ${tone === "warn" ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : "bg-card"}`}>
    <h2 className="font-display text-lg flex items-center gap-2 mb-3">{icon}{title}</h2>
    {children}
  </div>
);

export default FoodAsMedicine;
