import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

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
  "📦 Panchakarma Kits (complete treatment packs)",
];

const PanchakarmaShop = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    document.title = "Panchakarma Medicines & Therapy Oils — Ayuzee";
    supabase
      .from("products")
      .select("id,name,brand,category,price,discount_price,stock,unit,image_url,treatment_use,dosage_form,bulk_brand")
      .or("product_type.eq.panchakarma,tags.cs.{panchakarma}")
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return products;
    const needle = category.replace(/^[^\w]+\s*/, "").toLowerCase();
    return products.filter((product) => `${product.category} ${product.dosage_form ?? ""} ${product.name}`.toLowerCase().includes(needle.split(" ")[0]));
  }, [category, products]);

  const addToCart = (product: Product, qty = 1) => {
    addItem({ id: product.id, name: product.name, brand: product.brand, unit: product.unit, price: product.discount_price ?? product.price }, qty);
    toast.success(qty > 1 ? `${product.name} added to bulk cart` : `${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-muted/30">
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
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-xl border border-border bg-background p-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 font-semibold">Categories</h2>
            <button onClick={() => setCategory("All")} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth ${category === "All" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>All Panchakarma</button>
            {PANCHAKARMA_CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth ${category === item ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{item}</button>
            ))}
          </aside>

          <section>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading Panchakarma medicines…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">No Panchakarma products found yet.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <article key={product.id} className="flex flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft">
                    <Link to={`/shop/${product.id}`} className="mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-3" loading="lazy" /> : <Package className="h-16 w-16 text-primary/25" />}
                    </Link>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {product.treatment_use && <Badge variant="secondary" className="rounded-full">{product.treatment_use}</Badge>}
                      {product.dosage_form && <Badge variant="outline" className="rounded-full">{product.dosage_form}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <Link to={`/shop/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary">{product.name}</Link>
                    {product.unit && <p className="mt-2 text-xs text-muted-foreground">{product.unit}</p>}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">₹ {product.discount_price ?? product.price}</span>
                      {product.discount_price && <span className="text-xs text-muted-foreground line-through">₹ {product.price}</span>}
                    </div>
                    {product.bulk_brand && <p className="mt-1 text-xs font-medium text-secondary">Bulk pricing available</p>}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button className="rounded-full" onClick={() => addToCart(product)}><ShoppingCart className="mr-2 h-4 w-4" /> Add</Button>
                      <Button variant="outline" className="rounded-full" onClick={() => addToCart(product, 10)}>Bulk Cart</Button>
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
