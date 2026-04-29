import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Minus, Package, Plus, ShieldCheck, Star, Truck } from "lucide-react";
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
  image_url?: string | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
        if (data) document.title = `${(data as Product).name} — Ayuzee`;
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background"><SiteNav /><div className="container py-24 text-center text-muted-foreground">Loading…</div></div>;
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">Product not found</h1>
          <Button asChild variant="hero" className="mt-6"><Link to="/shop">Back to shop</Link></Button>
        </div>
      </div>
    );
  }

  const price = product.discount_price ?? product.price;
  const saving = product.discount_price ? product.price - product.discount_price : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <div className="container py-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Shop
          </Link>
        </div>

        <section className="container pb-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl gradient-soft">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-8" />
              ) : (
                <div className="font-display text-[12rem] leading-none text-primary/20">{product.name[0]}</div>
              )}
              {product.stock <= 0 && (
                <span className="absolute left-6 top-6 rounded-md bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">Out of Stock</span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{product.category}</span>
              <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
              <p className="mt-1 text-muted-foreground">{product.brand} · {product.unit}</p>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-secondary text-secondary" : "text-muted"}`} />)}</div>
                <span>{product.rating} · {product.total_reviews} reviews</span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl">₹{price}</span>
                {product.discount_price && <span className="text-lg text-muted-foreground line-through">₹{product.price}</span>}
                {saving > 0 && <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">Save ₹{saving}</span>}
              </div>

              {product.stock > 0 && product.stock <= 5 && (
                <p className="mt-3 text-sm font-semibold text-amber-600">Hurry! Only {product.stock} left in stock</p>
              )}
              {product.stock > 5 && (
                <p className="mt-3 text-sm font-medium text-emerald-600">In stock</p>
              )}

              {product.description && <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>}

              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center hover:bg-accent" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock || 1, qty + 1))} className="grid h-11 w-11 place-items-center hover:bg-accent" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={product.stock <= 0}
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, brand: product.brand, unit: product.unit, price }, qty);
                    toast.success(`Added ${qty} × ${product.name}`);
                  }}
                >
                  {product.stock <= 0 ? "Out of Stock" : "Add to cart"}
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Perk icon={ShieldCheck} label="100% authentic" desc="Lab-tested quality" />
                <Perk icon={Truck} label="Free delivery over ₹499" desc="Delhivery tracking" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Perk = ({ icon: Icon, label, desc }: { icon: React.ComponentType<{ className?: string }>; label: string; desc: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary"><Icon className="h-5 w-5" /></div>
    <div>
      <p className="font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default ProductDetail;
