import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

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
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const { addItem } = useCart();

  useEffect(() => {
    document.title = "Shop — Ayuzee";
    supabase.from("products").select("*").order("created_at", { ascending: true })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${p.name} ${p.brand} ${p.category} ${p.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, category, query]);

  const price = (p: Product) => p.discount_price ?? p.price;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <section className="gradient-soft border-b border-border">
          <div className="container py-12 md:py-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Authentic Medicines</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Ayurvedic store</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Lab-tested, classical formulations and daily wellness essentials — delivered to your door.</p>

            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search herbs, oils, tablets…" className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <p className="mb-6 text-sm text-muted-foreground">
              {loading ? "Loading products…" : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <article key={p.id} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                  <Link to={`/shop/${p.id}`} className="mb-4 grid aspect-square place-items-center rounded-xl gradient-soft">
                    <div className="font-display text-6xl text-primary/25">{p.name[0]}</div>
                  </Link>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{p.category}</span>
                  <Link to={`/shop/${p.id}`} className="mt-1 font-semibold hover:text-primary">{p.name}</Link>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.unit}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-secondary text-secondary" /> {p.rating} ({p.total_reviews})
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div>
                      <span className="text-lg font-semibold">₹{price(p)}</span>
                      {p.discount_price && <span className="ml-2 text-sm text-muted-foreground line-through">₹{p.price}</span>}
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => {
                        addItem({ id: p.id, name: p.name, brand: p.brand, unit: p.unit, price: price(p) });
                        toast.success(`${p.name} added to cart`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" /> Add
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
