import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Heart, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface HealthCondition {
  id: string;
  name: string;
  slug: string;
  system_category: string | null;
  icon: string | null;
}

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
  ayush_system?: string | null;
  dosage_form?: string | null;
  created_at?: string;
}

const AYUSH_SYSTEMS = ["Ayurveda", "Homeopathy", "Unani", "Siddha"];
const DOSAGE_FORMS = ["Tablet", "Syrup", "Oil", "Powder", "Capsule", "Bhasma"];
const SORT_OPTIONS = ["Newest", "Price low-high", "Price high-low", "Top Rated"];

const ConditionProducts = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [condition, setCondition] = useState<HealthCondition | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("Any");
  const [dosage, setDosage] = useState("Any");
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("health_conditions")
      .select("id,name,slug,system_category,icon")
      .eq("slug", slug)
      .maybeSingle()
      .then(async ({ data }) => {
        const nextCondition = data as HealthCondition | null;
        setCondition(nextCondition);
        document.title = `${nextCondition?.name ?? "Health Condition"} Medicines — Ayuzee`;

        if (!nextCondition) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const { data: productData } = await supabase
          .from("products")
          .select("id,name,brand,category,description,price,discount_price,stock,unit,rating,total_reviews,image_url,ayush_system,dosage_form,created_at")
          .contains("health_conditions", [nextCondition.name])
          .gt("stock", 0);

        const nextProducts = ((productData as Product[]) ?? []).map((product) => ({
          ...product,
          ayush_system: product.ayush_system ?? "Ayurveda",
        }));
        setProducts(nextProducts);
        setMaxPrice(Math.max(500, ...nextProducts.map((product) => product.discount_price ?? product.price)));
        setLoading(false);
      });
  }, [slug]);

  const allBrands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const effectivePrice = product.discount_price ?? product.price;
      if (effectivePrice > maxPrice) return false;
      if (system !== "Any" && product.ayush_system !== system) return false;
      if (dosage !== "Any" && product.dosage_form !== dosage) return false;
      if (brands.length && !brands.includes(product.brand)) return false;
      if (query) {
        const haystack = `${product.name} ${product.brand} ${product.category} ${product.description ?? ""}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "Price low-high") return (a.discount_price ?? a.price) - (b.discount_price ?? b.price);
      if (sort === "Price high-low") return (b.discount_price ?? b.price) - (a.discount_price ?? a.price);
      if (sort === "Top Rated") return (b.rating ?? 0) - (a.rating ?? 0);
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
  }, [brands, dosage, maxPrice, products, query, sort, system]);

  const toggleBrand = (brand: string) => {
    setBrands((current) => current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop" className="text-primary hover:underline">Medicines</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop/conditions" className="text-primary hover:underline">Health Conditions</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{condition?.name ?? "Condition"}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-4xl">{condition?.icon ?? "🌿"}</span>
                {condition?.system_category && <Badge variant="secondary" className="rounded-full">{condition.system_category}</Badge>}
              </div>
              <h1 className="font-display text-3xl md:text-4xl">{condition?.name ?? "Health Condition"} Medicines</h1>
              <p className="mt-2 text-muted-foreground">Curated AYUSH formulations matched to this health concern.</p>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 md:w-80">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medicines" className="h-8 border-0 p-0 shadow-none focus-visible:ring-0" />
            </div>
          </div>
        </div>
      </section>

      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-xl border border-border bg-background p-5 lg:sticky lg:top-24 lg:self-start">
            <FilterBlock title="AYUSH System">
              <select value={system} onChange={(event) => setSystem(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Any</option>
                {AYUSH_SYSTEMS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FilterBlock>
            <FilterBlock title="Dosage Form">
              <select value={dosage} onChange={(event) => setDosage(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Any</option>
                {DOSAGE_FORMS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FilterBlock>
            <FilterBlock title={`Price up to ₹${maxPrice}`}>
              <input type="range" min="100" max="10000" step="100" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="w-full accent-primary" />
            </FilterBlock>
            <FilterBlock title="Brand">
              <div className="space-y-2">
                {allBrands.length === 0 && <p className="text-sm text-muted-foreground">No brands yet.</p>}
                {allBrands.map((brand) => (
                  <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={brands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </FilterBlock>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{filteredProducts.length} medicines found</p>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {SORT_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading medicines…</p>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">
                No medicines found for this condition yet. Check back soon.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={() => {
                  addItem({ id: product.id, name: product.name, brand: product.brand, unit: product.unit, price: product.discount_price ?? product.price });
                  toast.success(`${product.name} added to cart`);
                }} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FilterBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-t border-border pt-4 first:border-0 first:pt-0">
    <h2 className="mb-2 text-sm font-semibold">{title}</h2>
    {children}
  </div>
);

const ProductCard = ({ product, onAdd }: { product: Product; onAdd: () => void }) => {
  const effectivePrice = product.discount_price ?? product.price;
  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft">
      <Link to={`/shop/${product.id}`} className="mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-3" loading="lazy" />
        ) : (
          <div className="font-display text-5xl text-primary/25">{product.name[0]}</div>
        )}
      </Link>
      <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md bg-background/90 text-muted-foreground hover:text-primary">
        <Heart className="h-4 w-4" />
      </button>
      <div className="mb-2 flex flex-wrap gap-2">
        {product.ayush_system && <Badge variant="secondary" className="rounded-full">{product.ayush_system}</Badge>}
        {product.dosage_form && <Badge variant="outline" className="rounded-full">{product.dosage_form}</Badge>}
      </div>
      <p className="text-xs text-muted-foreground">{product.brand}</p>
      <Link to={`/shop/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary">{product.name}</Link>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-lg font-bold text-primary">₹ {effectivePrice}</span>
        {product.discount_price && <span className="text-xs text-muted-foreground line-through">₹ {product.price}</span>}
        {discount > 0 && <span className="text-xs font-semibold text-secondary">{discount}% off</span>}
      </div>
      <Button className={cn("mt-3 w-full rounded-full")} onClick={onAdd}>
        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
      </Button>
    </article>
  );
};

export default ConditionProducts;
