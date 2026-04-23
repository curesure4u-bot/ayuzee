import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, Heart, Share2, ChevronRight, Leaf, Sparkles, FlaskConical, Pill, Flower2, Droplets } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  unit: string | null;
  rating: number;
  total_reviews: number;
  image_url?: string | null;
}

const SHOP_BY = ["OTC Products", "Prescription"];
const CATEGORIES = ["Medicines", "Services", "Herbs & Minerals", "Equipments"];
const CLASSICAL_TYPES = ["Bhasma", "Choorna/ Churna", "Guggulu", "Sinduram Capsule", "Loha / Mandoor"];
const PATENTED_TYPES = ["Ointment", "Syrup", "Soft Gel Capsules", "Gel", "Nasal Drop"];

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Medicines");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    document.title = "Buy Medicine — Ayuzee";
    supabase.from("products").select("*").order("created_at", { ascending: true })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const allBrands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const visibleBrands = useMemo(() => {
    const filtered = allBrands.filter((b) => b.toLowerCase().includes(brandFilter.toLowerCase()));
    return showAllBrands ? filtered : filtered.slice(0, 6);
  }, [allBrands, brandFilter, showAllBrands]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${p.name} ${p.brand} ${p.category} ${p.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedBrands, query]);

  const price = (p: Product) => p.discount_price ?? p.price;
  const discountPct = (p: Product) =>
    p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0;

  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const clearAll = () => {
    setSelectedBrands([]);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />

      {/* Sub navigation strip */}
      <div className="border-b border-border bg-background">
        <div className="container flex items-center gap-4 overflow-x-auto py-3 text-sm">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 flex-1 max-w-2xl">
            <select className="bg-transparent text-sm font-medium outline-none">
              <option>Medicine</option>
              <option>Services</option>
            </select>
            <span className="h-4 w-px bg-border" />
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for medicine"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hero billboard */}
      <section className="border-b border-border bg-gradient-to-r from-primary/95 via-primary to-primary/85 text-primary-foreground">
        <div className="container grid gap-6 py-10 md:grid-cols-[1.4fr_1fr] md:items-center md:py-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Authentic · Lab-tested
            </span>
            <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
              Buy Ayurvedic, Siddha &amp; Unani <br className="hidden md:block" />
              medicines online — at the best price
            </h1>
            <p className="mt-3 max-w-xl text-sm opacity-90 md:text-base">
              Doctor-curated formulations from trusted Indian brands, delivered pan-India with free shipping over ₹499.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="lg" className="rounded-full">
                <a href="#categories">Shop by category</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-background/40 bg-background/10 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground">
                <Link to="/health-conditions">Browse by condition</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-background/10 blur-2xl" />
              <div className="relative grid h-56 w-56 place-items-center rounded-full bg-background/20 backdrop-blur">
                <Leaf className="h-28 w-28 text-background/90" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo banners */}
      <section className="border-b border-border bg-background">
        <div className="container grid gap-4 py-8 md:grid-cols-3">
          {[
            { title: "Ayurveda", sub: "Natural solutions for healthy living", from: "from-emerald-500/15", to2: "to-emerald-500/5", icon: Leaf, accent: "text-emerald-700" },
            { title: "Siddha & Unani", sub: "Time-tested traditional systems", from: "from-amber-500/15", to2: "to-amber-500/5", icon: FlaskConical, accent: "text-amber-700" },
            { title: "Wellness & Cosmetic", sub: "Skin, hair & daily care essentials", from: "from-rose-500/15", to2: "to-rose-500/5", icon: Sparkles, accent: "text-rose-700" },
          ].map((p) => (
            <Link
              key={p.title}
              to="/shop"
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 transition-smooth hover:shadow-elegant",
                p.from, p.to2
              )}
            >
              <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-background/80", p.accent)}>
                <p.icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.sub}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by categories */}
      <section id="categories" className="border-b border-border bg-muted/30">
        <div className="container py-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Shop by Categories</h2>
              <p className="text-sm text-muted-foreground">Explore medicines across systems of healing</p>
            </div>
            <Link to="/shop" className="hidden text-sm font-semibold text-primary hover:underline md:inline">View all →</Link>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {[
              { label: "Ayurveda", icon: Leaf, bg: "bg-emerald-100", fg: "text-emerald-700" },
              { label: "Siddha", icon: FlaskConical, bg: "bg-amber-100", fg: "text-amber-700" },
              { label: "Unani", icon: Droplets, bg: "bg-sky-100", fg: "text-sky-700" },
              { label: "Homeopathy", icon: Pill, bg: "bg-violet-100", fg: "text-violet-700" },
              { label: "Cosmetic", icon: Sparkles, bg: "bg-rose-100", fg: "text-rose-700" },
              { label: "Organic", icon: Flower2, bg: "bg-lime-100", fg: "text-lime-700" },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setQuery(c.label)}
                className="group flex flex-col items-center gap-2"
              >
                <div className={cn("grid h-20 w-20 place-items-center rounded-full transition-smooth group-hover:scale-105 group-hover:shadow-elegant md:h-24 md:w-24", c.bg, c.fg)}>
                  <c.icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium group-hover:text-primary">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured brands strip */}
      {allBrands.length > 0 && (
        <section className="border-b border-border bg-background">
          <div className="container py-8">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-xl md:text-2xl">Featured Brands</h2>
              <span className="text-xs text-muted-foreground">{allBrands.length} brands</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allBrands.slice(0, 12).map((b) => {
                const active = selectedBrands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={cn(
                      "shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-smooth",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary hover:text-primary"
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Filters */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={clearAll} className="text-xs font-semibold text-destructive hover:underline">
                  Clear All
                </button>
              </div>

              {/* Shop by */}
              <FilterSection title="Shop by">
                {SHOP_BY.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                    <Checkbox /> <span>{s}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Categories */}
              <FilterSection title="Categories">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                    <input
                      type="radio"
                      name="cat"
                      checked={category === c}
                      onChange={() => setCategory(c)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Brand */}
              <FilterSection title="Brand" action={<button className="text-xs font-semibold text-destructive">Filter A-Z</button>}>
                <Input
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  placeholder="Search brand"
                  className="mb-2 h-8 text-xs"
                />
                {visibleBrands.map((b) => (
                  <label key={b} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                    <Checkbox checked={selectedBrands.includes(b)} onCheckedChange={() => toggleBrand(b)} />
                    <span>{b}</span>
                  </label>
                ))}
                {allBrands.length > 6 && (
                  <button onClick={() => setShowAllBrands((v) => !v)} className="mt-1 text-xs font-semibold text-primary">
                    {showAllBrands ? "Show less" : `+ ${allBrands.length - 6} more`}
                  </button>
                )}
              </FilterSection>

              <FilterSection title="Classical">
                {CLASSICAL_TYPES.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                    <Checkbox /> <span>{s}</span>
                  </label>
                ))}
                <button className="mt-1 text-xs font-semibold text-primary">+ 39 more</button>
              </FilterSection>

              <FilterSection title="Patented">
                {PATENTED_TYPES.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                    <Checkbox /> <span>{s}</span>
                  </label>
                ))}
                <button className="mt-1 text-xs font-semibold text-primary">+ 49 more</button>
              </FilterSection>

              <FilterSection title="Other" last>
                <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                  <Checkbox /> <span>Saved Medicines</span>
                </label>
              </FilterSection>
            </div>
          </aside>

          {/* Product grid */}
          <section>
            {/* Breadcrumb + active chips */}
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>All Medicine</span>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs">
                {category}
                <button className="text-muted-foreground hover:text-foreground">×</button>
              </span>
              {selectedBrands.map((b) => (
                <span key={b} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs">
                  {b}
                  <button onClick={() => toggleBrand(b)} className="text-muted-foreground hover:text-foreground">×</button>
                </span>
              ))}
            </div>

            <h1 className="mb-5 font-display text-2xl">
              All Medicines <span className="text-sm font-normal text-muted-foreground">- {filtered.length} items</span>
            </h1>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading products…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">
                No products match your filters.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <article key={p.id} className="group relative flex flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft">
                    {/* corner ribbon */}
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                      <ShoppingCart className="h-4 w-4" />
                    </div>

                    <Link to={`/shop/${p.id}`} className="mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-3" loading="lazy" />
                      ) : (
                        <div className="font-display text-5xl text-primary/25">{p.name[0]}</div>
                      )}
                    </Link>

                    <div className="mb-2 flex items-center justify-end gap-1">
                      <button className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-primary">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-primary">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                    <Link to={`/shop/${p.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary">
                      {p.name}
                    </Link>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">Starts From</p>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">₹ {price(p)}</span>
                        {p.discount_price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">₹ {p.price}</span>
                            <span className="text-xs font-semibold text-secondary">{discountPct(p)}% off</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      className="mt-3 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        addItem({ id: p.id, name: p.name, brand: p.brand, unit: p.unit, price: price(p) });
                        toast.success(`${p.name} added to cart`);
                      }}
                    >
                      Add to cart
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const FilterSection = ({
  title,
  children,
  action,
  last,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  last?: boolean;
}) => (
  <div className={cn("border-t border-border pt-4 mt-4 first:border-0 first:pt-0 first:mt-0", last && "pb-1")}>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

export default Shop;
