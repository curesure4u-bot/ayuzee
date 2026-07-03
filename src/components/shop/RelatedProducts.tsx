import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/common/OptimizedImage";

interface MiniProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  stock: number;
}

interface RelatedProductsProps {
  productId: string;
  brand: string;
  category: string;
}

const RECENT_KEY = "ayuzee_recently_viewed";
const RECENT_LIMIT = 12;

const trackRecentlyViewed = (productId: string) => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...ids.filter((x) => x !== productId)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
};

const formatPrice = (p: MiniProduct) => p.discount_price ?? p.price;

const ProductCard = ({ p }: { p: MiniProduct }) => (
  <Link
    to={`/shop/${p.id}`}
    className="group flex w-44 shrink-0 flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft"
  >
    <div className="relative mb-2 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
      {p.image_url ? (
        <OptimizedImage
          src={p.image_url}
          alt={p.name}
          optimizedWidth={176}
          srcWidths={[88, 176, 352]}
          sizes="176px"
          width={176}
          height={176}
          className={cn("h-full w-full object-contain p-2", p.stock <= 0 && "opacity-40")}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      ) : (
        <div className={cn("font-display text-4xl text-primary/25", p.stock <= 0 && "opacity-40")}>
          {p.name[0]}
        </div>
      )}
      {p.stock <= 0 && (
        <span className="absolute inset-x-2 top-2 rounded bg-destructive/90 px-1.5 py-0.5 text-center text-[10px] font-semibold text-destructive-foreground">
          Out of Stock
        </span>
      )}
    </div>
    <p className="truncate text-[11px] text-muted-foreground">{p.brand}</p>
    <p className="line-clamp-2 min-h-[2.25rem] text-sm font-semibold group-hover:text-primary">{p.name}</p>
    <p className="mt-1 text-sm font-bold text-primary">₹ {formatPrice(p)}</p>
  </Link>
);

const RelatedProducts = ({ productId, brand, category }: RelatedProductsProps) => {
  const [related, setRelated] = useState<MiniProduct[]>([]);
  const [recent, setRecent] = useState<MiniProduct[]>([]);

  // Track current product in localStorage on mount/param change
  useEffect(() => {
    if (productId) trackRecentlyViewed(productId);
  }, [productId]);

  // Fetch related products (same brand OR same category, excluding self)
  useEffect(() => {
    if (!productId) return;
    const cols = "id,name,brand,category,price,discount_price,image_url,stock";
    supabase
      .from("products")
      .select(cols)
      .or(`brand.eq.${brand},category.eq.${category}`)
      .neq("id", productId)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => setRelated((data as MiniProduct[]) ?? []));
  }, [productId, brand, category]);

  // Fetch recently-viewed details (excluding current)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const others = ids.filter((x) => x !== productId).slice(0, 8);
      if (!others.length) {
        setRecent([]);
        return;
      }
      supabase
        .from("products")
        .select("id,name,brand,category,price,discount_price,image_url,stock")
        .in("id", others)
        .then(({ data }) => {
          const list = (data as MiniProduct[]) ?? [];
          // Preserve recency order
          const ordered = others
            .map((id) => list.find((p) => p.id === id))
            .filter((p): p is MiniProduct => Boolean(p));
          setRecent(ordered);
        });
    } catch {
      setRecent([]);
    }
  }, [productId]);

  if (!related.length && !recent.length) return null;

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="container space-y-10 py-12">
        {related.length > 0 && (
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl">Related Products</h2>
                <p className="text-sm text-muted-foreground">More from {brand} or {category}</p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {related.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-2xl">Recently Viewed</h2>
              <button
                onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                Clear history
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {recent.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedProducts;
