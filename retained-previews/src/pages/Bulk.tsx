import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Search, Star, Tag, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { BULK_BRANDS, CLASSICAL_TYPES, PATENTED_TYPES } from "@/data/bulkCatalog";

interface BulkProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount_price: number | null;
  unit: string | null;
  bulk_brand: string | null;
  bulk_classical_type: string | null;
  bulk_patented_type: string | null;
  rating: number;
}
interface Tier { product_id: string; min_qty: number; unit_price: number }
interface VolumeSlab { id: string; slab_name: string; min_order_value: number; max_order_value: number | null; margin_percentage: number; bonus_reward_points: number; description: string | null }

const Bulk = () => {
  const [params, setParams] = useSearchParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [tiers, setTiers] = useState<Record<string, Tier[]>>({});
  const [slabs, setSlabs] = useState<VolumeSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const brand = params.get("brand") ?? "";
  const classical = params.get("classical") ?? "";
  const patented = params.get("patented") ?? "";
  const cat = params.get("cat") ?? "";

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k); else next.set(k, v);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = supabase.from("products").select("*").eq("is_bulk", true);
      if (brand) q = q.eq("bulk_brand", brand);
      if (classical) q = q.eq("bulk_classical_type", classical);
      if (patented) q = q.eq("bulk_patented_type", patented);
      if (cat) q = q.eq("category", cat);
      const { data, error } = await q.order("name");
      if (error) { toast.error(error.message); setLoading(false); return; }
      const list = (data ?? []) as BulkProduct[];
      setProducts(list);
      if (list.length) {
        const ids = list.map((p) => p.id);
        const { data: t } = await supabase.from("product_bulk_tiers").select("*").in("product_id", ids).order("min_qty");
        const map: Record<string, Tier[]> = {};
        (t ?? []).forEach((row: Tier) => { (map[row.product_id] ||= []).push(row); });
        setTiers(map);
      }
      // Load volume discount slabs
      const { data: slabData } = await supabase.from("volume_discount_slabs").select("*").eq("is_active", true).order("sort_order");
      setSlabs((slabData ?? []) as VolumeSlab[]);
      setLoading(false);
    };
    load();
  }, [brand, classical, patented, cat]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
  }, [products, search]);

  const breadcrumb = brand || classical || patented || "All Medicines";

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="bg-muted/30">
        <div className="container py-6">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/bulk" className="hover:text-primary">Bulk Purchase</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{breadcrumb}</span>
          </nav>
        </div>
      </div>

      <main className="container grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-destructive"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
              >
                Clear All
              </Button>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold">Categories</h3>
              <div className="space-y-2">
                {[
                  { v: "", l: "All" },
                  { v: "classical", l: "Classical" },
                  { v: "patented", l: "Patented" },
                ].map((c) => (
                  <label key={c.l} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={cat === c.v} onCheckedChange={() => setParam("cat", c.v || null)} />
                    {c.l}
                  </label>
                ))}
              </div>
            </div>

            <FilterGroup
              title="Brand"
              options={BULK_BRANDS as readonly string[]}
              selected={brand}
              onSelect={(v) => setParam("brand", v === brand ? null : v)}
            />
            <FilterGroup
              title="Classical"
              options={CLASSICAL_TYPES as readonly string[]}
              selected={classical}
              onSelect={(v) => setParam("classical", v === classical ? null : v)}
            />
            <FilterGroup
              title="Patented"
              options={PATENTED_TYPES as readonly string[]}
              selected={patented}
              onSelect={(v) => setParam("patented", v === patented ? null : v)}
            />
          </Card>
        </aside>

        {/* Products */}
        <section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold">
                {breadcrumb} <span className="text-muted-foreground">- {filtered.length} items</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Wholesale pricing for verified Ayurveda doctors. Bulk tiers shown on each product.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bulk medicines"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Volume Discount Slabs Widget */}
          {slabs.length > 0 && (
            <Card className="mb-6 overflow-hidden border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-0">
              <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-100/50 px-5 py-3">
                <TrendingUp className="h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-display text-sm font-bold text-emerald-900">Volume-Based Margins — Order More, Earn More!</h3>
                  <p className="text-xs text-emerald-700">Your margin increases automatically based on order value</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-emerald-200 sm:grid-cols-5">
                {slabs.map((slab, i) => (
                  <div key={slab.id} className="flex flex-col items-center justify-center bg-white p-4 text-center">
                    <Award className={`h-5 w-5 mb-1 ${i === 0 ? "text-gray-400" : i === 1 ? "text-gray-500" : i === 2 ? "text-amber-500" : i === 3 ? "text-violet-500" : "text-cyan-500"}`} />
                    <p className="text-xs font-bold text-foreground">{slab.slab_name}</p>
                    <p className="mt-1 font-display text-lg font-bold text-emerald-700">{slab.margin_percentage}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {slab.max_order_value ? `₹${slab.min_order_value.toLocaleString()} – ₹${slab.max_order_value.toLocaleString()}` : `₹${slab.min_order_value.toLocaleString()}+`}
                    </p>
                    {slab.bonus_reward_points > 0 && (
                      <Badge variant="secondary" className="mt-1 text-[9px]">+{slab.bonus_reward_points} pts</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No products match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => {
                const effective = p.discount_price ?? p.price;
                const off = p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0;
                const productTiers = tiers[p.id] ?? [];
                return (
                  <Card key={p.id} className="group flex flex-col overflow-hidden p-0 transition-smooth hover:shadow-elegant">
                    <div className="grid aspect-square place-items-center gradient-soft">
                      <span className="font-display text-6xl text-primary/25">{p.name[0]}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-xs font-medium text-muted-foreground">{p.brand}</p>
                      <h3 className="mt-0.5 line-clamp-2 font-semibold">{p.name}</h3>
                      {p.unit && <p className="text-xs text-muted-foreground">{p.unit}</p>}
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-secondary text-secondary" /> {p.rating}
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Starts From</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">₹ {effective}</span>
                          {p.discount_price && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">₹ {p.price}</span>
                              <span className="text-xs font-semibold text-secondary-foreground">{off}% off</span>
                            </>
                          )}
                        </div>
                      </div>

                      {productTiers.length > 0 && (
                        <div className="mt-3 rounded-md border border-dashed border-border bg-muted/30 p-2">
                          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            <Tag className="h-3 w-3" /> Bulk tiers
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center text-[11px]">
                            {productTiers.map((t) => (
                              <div key={t.min_qty} className="rounded bg-background px-1 py-1">
                                <div className="font-semibold">{t.min_qty}+</div>
                                <div className="text-primary">₹{t.unit_price}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{p.category}</Badge>
                      </div>

                      <Button
                        variant="hero"
                        className="mt-4 w-full"
                        onClick={() => {
                          addItem({ id: p.id, name: p.name, brand: p.brand, unit: p.unit, price: effective });
                          toast.success(`${p.name} added to cart`);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" /> Add to cart
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

const FilterGroup = ({
  title, options, selected, onSelect,
}: { title: string; options: readonly string[]; selected: string; onSelect: (v: string) => void }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 6);
  return (
    <div className="mt-5 border-t border-border pt-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">
        {visible.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={selected === o} onCheckedChange={() => onSelect(o)} />
            <span className="line-clamp-1">{o}</span>
          </label>
        ))}
      </div>
      {options.length > 6 && (
        <Button
          variant="link"
          size="sm"
          className="mt-2 h-auto p-0 text-primary"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? "Show less" : `+ ${options.length - 6} more`}
        </Button>
      )}
    </div>
  );
};

export default Bulk;
