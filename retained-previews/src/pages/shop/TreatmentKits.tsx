import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, PackageCheck, Share2, ShoppingCart, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/site/Footer";
import { SiteNav } from "@/components/site/SiteNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface KitProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  unit: string | null;
  health_conditions: string[] | null;
  rating: number;
  total_reviews: number;
}

const GROUPS = ["All Kits", "Panchakarma Kits", "Disease Kits", "Wellness Kits", "Seasonal Kits"];

const TreatmentKits = () => {
  usePageSEO({ title: "Ayurvedic Treatment Kits — Ayuzee" });
  const { addItem } = useCart();
  const { isSaved, toggle: toggleWishlist } = useWishlist();
  const [kits, setKits] = useState<KitProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("All Kits");

  useEffect(() => { supabase
      .from("products")
      .select("id,name,brand,category,description,price,discount_price,stock,image_url,unit,health_conditions,rating,total_reviews")
      .eq("product_type", "treatment_kit")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setKits((data as KitProduct[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filteredKits = useMemo(() => {
    if (activeGroup === "All Kits") return kits;
    const needle = activeGroup.split(" ")[0].toLowerCase();
    return kits.filter((k) => `${k.name} ${k.category} ${(k.health_conditions ?? []).join(" ")}`.toLowerCase().includes(needle));
  }, [activeGroup, kits]);

  const price = (k: KitProduct) => k.discount_price ?? k.price;
  const discountPct = (k: KitProduct) => (k.discount_price ? Math.round(((k.price - k.discount_price) / k.price) * 100) : 0);

  const buyKit = (kit: KitProduct) => {
    addItem({ id: kit.id, name: kit.name, brand: kit.brand, unit: kit.unit, price: price(kit) }, 1);
    toast.success(`${kit.name} added to cart`);
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
            <span>Treatment Kits</span>
          </div>
          <h1 className="max-w-4xl font-display text-3xl md:text-5xl">Ayurvedic Treatment Kits</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">Complete medicine packages for specific health conditions, curated by doctors</p>
        </div>
      </section>

      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-border bg-background p-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 font-semibold">Kit Categories</h2>
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={cn(
                  "mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth",
                  activeGroup === g ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                {g}
              </button>
            ))}
          </aside>

          <section>
            <h2 className="mb-5 font-display text-2xl">
              {activeGroup} <span className="text-sm font-normal text-muted-foreground">- {filteredKits.length} items</span>
            </h2>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading treatment kits…</p>
            ) : filteredKits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
                <PackageCheck className="mx-auto h-14 w-14 text-primary/30" />
                <p className="mt-4 font-semibold">No treatment kits available yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Check back soon — our doctors are curating new kits.</p>
                <Button asChild variant="outline" className="mt-4 rounded-full">
                  <Link to="/shop">Browse all medicines</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredKits.map((p) => (
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

                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="rounded-full text-[10px]"><Stethoscope className="mr-1 h-3 w-3" /> Doctor curated</Badge>
                      <div className="flex items-center gap-1">
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
                    </div>

                    <Button
                      className="mt-3 w-full rounded-full"
                      disabled={p.stock <= 0}
                      onClick={() => buyKit(p)}
                    >
                      {p.stock <= 0 ? "Out of Stock" : "Buy Kit"}
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

export default TreatmentKits;
