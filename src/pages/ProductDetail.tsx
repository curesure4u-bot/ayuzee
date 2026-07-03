import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductReviews from "@/components/shop/ProductReviews";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  Share2,
  Heart,
  AlertCircle,
  Leaf,
  Pill,
  FlaskConical,
  Droplets,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setSEO } from "@/lib/seo";
import { OptimizedImage } from "@/components/common/OptimizedImage";

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
  image_url: string | null;
  ayush_system: string | null;
  health_conditions: string[] | null;
  tags: string[] | null;
  dosage_form: string | null;
  is_prescription_required: boolean | null;
  treatment_use: string | null;
  product_type: string | null;
}

type RelatedProduct = Pick<
  Product,
  "id" | "name" | "brand" | "price" | "discount_price" | "image_url" | "stock" | "ayush_system" | "unit"
>;

const SYSTEM_STYLES: Record<string, { Icon: typeof Leaf; cls: string }> = {
  Ayurveda: { Icon: Leaf, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  Homeopathy: { Icon: Pill, cls: "text-violet-700 bg-violet-50 border-violet-200" },
  Siddha: { Icon: FlaskConical, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  Unani: { Icon: Droplets, cls: "text-sky-700 bg-sky-50 border-sky-200" },
};

const SystemBadge = ({ system }: { system: string | null }) => {
  if (!system) return null;
  const s = SYSTEM_STYLES[system];
  if (!s) return <Badge variant="outline">{system}</Badge>;
  const { Icon, cls } = s;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}>
      <Icon className="h-3.5 w-3.5" />
      {system}
    </span>
  );
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");
  const { addItem } = useCart();
  const { isSaved, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgError(false);
    setQty(1);

    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as Product | null;
        setProduct(p);
        setLoading(false);
        if (!p) return;

        const priceVal = p.discount_price ?? p.price;
        const desc = (p.description || `${p.name} by ${p.brand} — authentic ${p.ayush_system ?? "AYUSH"} medicine on Ayuzee.`).slice(0, 158);
        setSEO(
          `${p.name} — ${p.brand} | Ayuzee`,
          desc,
          `/shop/${p.id}`,
          {
            ogType: "product",
            ogImage: p.image_url ?? undefined,
            jsonLd: {
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              brand: { "@type": "Brand", name: p.brand },
              category: p.category,
              description: p.description ?? undefined,
              image: p.image_url ?? undefined,
              aggregateRating: p.total_reviews > 0 ? {
                "@type": "AggregateRating",
                ratingValue: p.rating,
                reviewCount: p.total_reviews,
              } : undefined,
              offers: {
                "@type": "Offer",
                price: priceVal,
                priceCurrency: "INR",
                availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                url: `https://ayuzee.com/shop/${p.id}`,
              },
            },
          },
        );

        if (refCode) {
          try {
            localStorage.setItem("ayuzee_referral_code", refCode);
          } catch {
            /* ignore */
          }
        }

        try {
          const KEY = "ayuzee_recently_viewed";
          const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
          localStorage.setItem(
            KEY,
            JSON.stringify([id, ...prev.filter((x) => x !== id)].slice(0, 8)),
          );
        } catch {
          /* ignore */
        }

        supabase
          .from("products")
          .select("id,name,brand,price,discount_price,image_url,stock,ayush_system,unit")
          .or(`brand.eq.${p.brand},category.eq.${p.category}`)
          .neq("id", id)
          .gt("stock", 0)
          .limit(6)
          .then(({ data: rel }) => setRelated(((rel as RelatedProduct[]) ?? [])));
      });
  }, [id, refCode]);

  const price = product ? product.discount_price ?? product.price : 0;
  const saving = product?.discount_price ? product.price - product.discount_price : 0;
  const discPct = product?.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const inStock = (product?.stock ?? 0) > 0;
  const lowStock = inStock && (product?.stock ?? 0) <= 10;

  const shareProduct = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name ?? "Ayuzee", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch {
      /* user dismissed */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">Product not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This product may have been removed or is no longer available.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const saved = isSaved(product.id);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main>
        <div className="container py-6">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            {product.ayush_system && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="hover:text-primary">{product.ayush_system}</span>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="truncate font-medium text-foreground">{product.name}</span>
          </nav>
        </div>

        <section className="container pb-12">
          <Link
            to="/shop"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* LEFT — image + alerts */}
            <div className="space-y-4">
              <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl gradient-soft">
                {product.image_url && !imgError ? (
                  <OptimizedImage
                    src={product.image_url}
                    alt={product.name}
                    optimizedWidth={800}
                    srcWidths={[400, 800, 1200]}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    width={800}
                    height={800}
                    className="h-full w-full object-contain p-8"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="font-display text-[10rem] leading-none text-primary/20">
                    {product.name[0]}
                  </div>
                )}

                {discPct > 0 && inStock && (
                  <span className="absolute left-5 top-5 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground shadow-soft">
                    {discPct}% OFF
                  </span>
                )}

                {!inStock && (
                  <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
                    <span className="rounded-md bg-destructive px-4 py-1.5 text-sm font-semibold text-destructive-foreground">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {product.is_prescription_required && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900">Prescription Required</p>
                    <p className="mt-0.5 text-amber-800">
                      This medicine requires a valid prescription from a registered AYUSH doctor.{" "}
                      <Link to="/shop/prescription" className="font-semibold underline">
                        Upload prescription →
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {refCode && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-accent p-4">
                  <span className="text-xl">🩺</span>
                  <div className="text-sm">
                    <p className="font-semibold text-primary">Recommended by your Doctor</p>
                    <p className="mt-0.5 text-muted-foreground">
                      This product was selected for your treatment plan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — details */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <SystemBadge system={product.ayush_system} />
                <Badge variant="secondary">{product.category}</Badge>
                {product.dosage_form && <Badge variant="outline">{product.dosage_form}</Badge>}
                {product.product_type && product.product_type !== "medicine" && (
                  <Badge variant="outline" className="capitalize">{product.product_type}</Badge>
                )}
              </div>

              <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.brand}
                {product.unit && <> · {product.unit}</>}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(product.rating) ? "fill-secondary text-secondary" : "text-muted",
                      )}
                    />
                  ))}
                </div>
                <span>
                  {product.rating > 0 ? product.rating.toFixed(1) : "New"}
                  {product.total_reviews > 0 && ` · ${product.total_reviews} reviews`}
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-4xl">{formatINR(price)}</span>
                {product.discount_price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatINR(product.price)}</span>
                    <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                      Save {formatINR(saving)}
                    </span>
                  </>
                )}
              </div>
              {product.discount_price && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Inclusive of all taxes · MRP {formatINR(product.price)}
                </p>
              )}

              <div className="mt-4 text-sm font-medium">
                {!inStock ? (
                  <span className="text-destructive">❌ Out of stock</span>
                ) : lowStock ? (
                  <span className="text-amber-600">⚡ Only {product.stock} left — order soon!</span>
                ) : (
                  <span className="text-emerald-600">✅ In stock</span>
                )}
              </div>

              {product.description && (
                <div className="mt-6">
                  <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    About this product
                  </h3>
                  <p className="leading-relaxed text-foreground/90">{product.description}</p>
                </div>
              )}

              {product.treatment_use && (
                <div className="mt-5">
                  <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Indicated for
                  </h3>
                  <p className="text-sm text-foreground/90">{product.treatment_use}</p>
                </div>
              )}

              {product.health_conditions && product.health_conditions.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Health conditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.health_conditions.map((c, i) => (
                      <Badge key={i} variant="outline">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="my-6 border-t border-border" />

              {/* Qty + Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-border">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={!inStock}
                    className="grid h-12 w-12 place-items-center rounded-l-xl transition-colors hover:bg-accent disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={!inStock}
                    className="grid h-12 w-12 place-items-center rounded-r-xl transition-colors hover:bg-accent disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={!inStock}
                  onClick={() => {
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        brand: product.brand,
                        unit: product.unit,
                        price,
                      },
                      qty,
                    );
                    toast.success(`Added ${qty} × ${product.name} to cart`);
                  }}
                >
                  {inStock ? `Add ${qty > 1 ? `${qty} items ` : ""}to Cart` : "Out of Stock"}
                </Button>
              </div>

              {/* Wishlist + Share */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all",
                    saved
                      ? "border-rose-300 bg-rose-50 text-rose-600"
                      : "border-border hover:border-primary hover:text-primary",
                  )}
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={shareProduct}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-all hover:border-primary hover:text-primary"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              {/* Trust perks */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, label: "100% Authentic", desc: "Lab-tested, verified AYUSH" },
                  { icon: Truck, label: "Free above ₹499", desc: "Pan-India Delhivery shipping" },
                  { icon: Package, label: "Genuine Packaging", desc: "Sealed, tamper-proof" },
                  { icon: Star, label: "Quality Assured", desc: "GMP certified brands only" },
                ].map((p) => (
                  <div key={p.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                      <p.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border bg-muted/30">
            <div className="container py-12">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-2xl">Related Products</h2>
                  <p className="text-sm text-muted-foreground">
                    More from {product.brand} and similar items
                  </p>
                </div>
                <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {related.map((r) => {
                  const rp = r.discount_price ?? r.price;
                  return (
                    <Link
                      key={r.id}
                      to={`/shop/${r.id}`}
                      className="group flex flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft"
                    >
                      <div className="mb-2 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
                        {r.image_url ? (
                          <OptimizedImage
                            src={r.image_url}
                            alt={r.name}
                            optimizedWidth={200}
                            srcWidths={[100, 200, 400]}
                            sizes="(max-width: 640px) 50vw, 16vw"
                            width={200}
                            height={200}
                            className="h-full w-full object-contain p-2"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                          />
                        ) : (
                          <div className="font-display text-4xl text-primary/25">{r.name[0]}</div>
                        )}
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{r.brand}</p>
                      <p className="line-clamp-2 min-h-[2.25rem] text-sm font-semibold group-hover:text-primary">
                        {r.name}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary">{formatINR(rp)}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: r.id,
                            name: r.name,
                            brand: r.brand,
                            unit: r.unit ?? null,
                            price: rp,
                          });
                          toast.success(`${r.name} added!`);
                        }}
                        className="mt-2 rounded-lg border border-border py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary"
                      >
                        + Add
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
