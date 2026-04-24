import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldAlert, ShoppingCart, Stethoscope } from "lucide-react";
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
  surgical_category?: string | null;
  is_prescription_required?: boolean | null;
  bulk_brand?: string | null;
}

const SURGICAL_CATEGORIES = [
  "🔪 Ksharasutra Kits — for anorectal procedures",
  "🔥 Agnikarma Instruments — for heat therapy",
  "🩹 Wound Care & Bandaging — Ayurvedic dressings",
  "🧤 Disposables & PPE — gloves, sheets, covers",
  "🔬 Diagnostic Instruments — tongue depressors, pulse meters",
  "💉 Panchakarma Disposables — enema kits, neti pots, nasya droppers",
  "🏥 OT Accessories — Ayurvedic OT setup tools",
];

const AyushSurgicals = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    document.title = "AYUSH Surgical Instruments & Disposables — Ayuzee";
    supabase
      .from("products")
      .select("id,name,brand,category,price,discount_price,stock,unit,image_url,surgical_category,is_prescription_required,bulk_brand")
      .eq("is_surgical", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return products;
    const label = category.split("—")[0].replace(/^[^\w]+\s*/, "").trim().toLowerCase();
    return products.filter((product) => `${product.surgical_category ?? ""} ${product.category} ${product.name}`.toLowerCase().includes(label.split(" ")[0]));
  }, [category, products]);

  const addToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, brand: product.brand, unit: product.unit, price: product.discount_price ?? product.price });
    toast.success(`${product.name} added to cart`);
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
            <span>AYUSH Surgicals</span>
          </div>
          <h1 className="max-w-4xl font-display text-3xl md:text-5xl">AYUSH Surgical Instruments &amp; Disposables</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">Certified tools for Ayurveda &amp; Shalya Tantra practitioners</p>
          <div className="mt-6 rounded-xl border border-border bg-primary/10 p-4 text-sm font-medium text-foreground">
            🔒 Some surgical items require doctor/therapist account to purchase. Sign in with your professional account.
          </div>
        </div>
      </section>

      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-border bg-background p-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 font-semibold">Surgical Categories</h2>
            <button onClick={() => setCategory("All")} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth ${category === "All" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>All surgicals</button>
            {SURGICAL_CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth ${category === item ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{item}</button>
            ))}
          </aside>

          <section>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading surgical products…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">No surgical products found yet.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <article key={product.id} className="flex flex-col rounded-xl border border-border bg-background p-3 transition-smooth hover:shadow-soft">
                    <Link to={`/shop/${product.id}`} className="mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-3" loading="lazy" /> : <Stethoscope className="h-16 w-16 text-primary/25" />}
                    </Link>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {product.surgical_category && <Badge variant="secondary" className="rounded-full">{product.surgical_category}</Badge>}
                      {product.is_prescription_required && <Badge variant="outline" className="rounded-full"><ShieldAlert className="mr-1 h-3 w-3" /> For professional use only</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <Link to={`/shop/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary">{product.name}</Link>
                    {product.unit && <p className="mt-2 text-xs text-muted-foreground">{product.unit}</p>}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">₹ {product.discount_price ?? product.price}</span>
                      {product.discount_price && <span className="text-xs text-muted-foreground line-through">₹ {product.price}</span>}
                    </div>
                    {product.bulk_brand && <p className="mt-1 text-xs font-medium text-secondary">Bulk pricing available for clinics</p>}
                    <Button className="mt-3 rounded-full" onClick={() => addToCart(product)}><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</Button>
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

export default AyushSurgicals;
