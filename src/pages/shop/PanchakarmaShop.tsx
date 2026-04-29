import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, Package, Share2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/site/Footer";
import { SiteNav } from "@/components/site/SiteNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount_price: number | null;
  stock: number;
  unit: string | null;
  image_url?: string | null;
  treatment_use?: string | null;
  dosage_form?: string | null;
  bulk_brand?: string | null;
}

const PANCHAKARMA_CATEGORIES = [
  "🫙 Medicated Oils & Tailam",
  "🌿 Herbal Powders & Churna",
  "🍯 Medicated Ghee (Ghrita)",
  "💊 Kashayam & Decoctions",
  "🧴 Bhasma & Mineral Formulations",
  "🌱 Raw Herbs & Roots",
  "📦 Panchakarma Kits",
];

const PanchakarmaShop = () => {
  const { addItem } = useCart();
  const { isSaved, toggle: toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    document.title = "Panchakarma Medicines & Therapy Oils — Ayuzee";
    supabase
      .from("products")
      .select("id,name,brand,category,price,discount_price,stock,unit,image_url,treatment_use,dosage_form,bulk_brand")
      .or("product_type.eq.panchakarma,tags.cs.{panchakarma}")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return products;
    const needle = category.replace(/^[^\w]+\s*/, "").trim().toLowerCase().split(" ")[0];
    return products.filter((p) => `${p.category} ${p.dosage_form ?? ""} ${p.name}`.toLowerCase().includes(needle));
  }, [category, products]);

  const price = (p: Product) => p.discount_price ?? p.price;
  const discountPct = (p: Product) => (p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0);

  const addToCart = (p: Product, qty = 1) => {
    addItem({ id: p.id, name: p.name, brand: p.brand, unit: p.unit, price: price(p) }, qty);
    toast.success(qty > 1 ? `${p.name} added (bulk × ${qty})` : `${p.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />
      <section className="border-b border-border bg-background">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop" className="text-primary hover:underline">Medicines</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Panchakarma</span>
          </div>
          <h1 className="max-w-4xl font-display text-3xl md:text-5xl">Panchakarma Medicines &amp; Therapy Oils</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">Doctor-prescribed formulations for authentic Panchakarma</p>
          <div className="mt-6 rounded-xl border border-border bg-primary/10 p-4 text-sm font-medium text-foreground">
            🩺 Doctor prescribed? Your doctor can add these directly to your cart after prescription.
          </div>
        </div>
      </section>

      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-border bg-background p-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 font-semibold">Categories</h2>
            <button onClick={() => setCategory("All")} className={cn("mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth", category === "All" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>All Panchakarma</button>
            {PANCHAKARMA_CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={cn("mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth", category === item ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>{item}</button>
            ))}
          </aside>

          <section>
            <h2 className="mb-5 font-display text-2xl">
              {category === "All" ? "All Panchakarma" : category} <span className="text-sm font-normal text-muted-foreground">- {filtered.length} items</span>
            </h2>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading Panchakarma medicines…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
                <Package className="mx-auto h-14 w-14 text-primary/30" />
                <p className="mt-4 font-semibold">No Panchakarma products available yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Our team is sourcing classical formulations — check back soon.</p>
                <Button asChild variant="outline" className="mt-4 rounded-full">
                  <Link to="/shop">Browse all medicines</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <article key={p.id} className="group relative flex flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft">
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                      <ShoppingCart className="h-4 w-4" />
                    </div>

                    <Link to={`/shop/${p.id}`} className="relative mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className={cn("h-full w-full object-contain p-3", p.stock <= 0 && "opacity-40")} loading="lazy" />
                      ) : (
                        <div className={cn("font-display text-5xl text-primary/25", p.stock <= 0 && "opacity-40")}>{p.name[0]}</div>
                      )}
                      {p.stock <= 0 && (
                        <span className="absolute inset-x-3 top-3 rounded-md bg-destructive/90 px-2 py-1 text-center text-xs font-semibold text-destructive-foreground">Out of Stock</span>
                      )}
                    </Link>

                    <div className="mb-2 flex flex-wrap items-center gap-1">
                      {p.treatment_use && <Badge variant="secondary" className="rounded-full text-[10px]">{p.treatment_use}</Badge>}
                      {p.dosage_form && <Badge variant="outline" className="rounded-full text-[10px]">{p.dosage_form}</Badge>}
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          aria-label={isSaved(p.id) ? "Remove from wishlist" : "Save to wishlist"}
                          className={cn("grid h-7 w-7 place-items-center rounded-full transition", isSaved(p.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500")}
                        >
                          <Heart className={cn("h-4 w-4", isSaved(p.id) && "fill-rose-500")} />
                        </button>
                        <button className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-primary">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                    <Link to={`/shop/${p.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary">{p.name}</Link>
                    {p.unit && <p className="mt-1 text-xs text-muted-foreground">{p.unit}</p>}

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
                      {p.stock > 0 && p.stock <= 5 && (
                        <p className="mt-1 text-xs font-semibold text-amber-600">Only {p.stock} left!</p>
                      )}
                      {p.bulk_brand && <p className="mt-1 text-xs font-medium text-secondary">Bulk pricing available</p>}
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button className="rounded-full" disabled={p.stock <= 0} onClick={() => addToCart(p)}>
                        {p.stock <= 0 ? "Out of Stock" : "Add"}
                      </Button>
                      <Button variant="outline" className="rounded-full" disabled={p.stock < 10} onClick={() => addToCart(p, 10)}>
                        Bulk × 10
                      </Button>
                    </div>
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

export default PanchakarmaShop;
