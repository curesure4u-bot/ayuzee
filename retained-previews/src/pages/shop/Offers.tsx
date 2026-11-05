import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { BadgePercent, ChevronRight, Heart, Package, ShoppingCart, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  offer_label: string | null;
  rating: number;
  unit: string | null;
  is_bulk: boolean;
  is_offers: boolean | null;
  created_at: string;
}
interface Tier { id: string; product_id: string; min_qty: number; unit_price: number; }

type Tab = "All Offers" | "Buy 2 Get 1" | "Flat Discounts" | "Combo Packs" | "New Arrivals" | "Clearance";
const tabs: Tab[] = ["All Offers", "Buy 2 Get 1", "Flat Discounts", "Combo Packs", "New Arrivals", "Clearance"];
const WISHLIST_KEY = "ayuzee_offer_wishlist_v1";

const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const discountPercent = (p: Product) => p.discount_price ? Math.max(0, Math.round(((p.price - p.discount_price) / p.price) * 100)) : 0;
const timeToMidnight = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000).toString().padStart(2, "0");
  const minutes = Math.floor((diff % 3_600_000) / 60_000).toString().padStart(2, "0");
  const seconds = Math.floor((diff % 60_000) / 1000).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const Offers = () => {
  usePageSEO({ title: "Today's Deals — Ayuzee" });
  const { addItem } = useCart();
  const [countdown, setCountdown] = useState(timeToMidnight());
  const [products, setProducts] = useState<Product[]>([]);
  const [bulkProduct, setBulkProduct] = useState<Product | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [qty, setQty] = useState(5);
  const [activeTab, setActiveTab] = useState<Tab>("All Offers");
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { const timer = window.setInterval(() => setCountdown(timeToMidnight()), 1000);
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,brand,category,price,discount_price,image_url,offer_label,rating,unit,is_bulk,is_offers,created_at")
        .or("is_offers.eq.true,discount_price.not.is.null")
        .gt("stock", 0)
        .order("created_at", { ascending: false });
      const offerRows = ((data as Product[]) ?? [])
        .filter((p) => p.is_offers || (p.discount_price !== null && p.discount_price < p.price * 0.85))
        .sort((a, b) => discountPercent(b) - discountPercent(a));
      setProducts(offerRows);

      const featured = offerRows.find((p) => p.is_bulk) ?? null;
      setBulkProduct(featured);
      if (featured) {
        const { data: tierRows } = await supabase.from("product_bulk_tiers").select("*").eq("product_id", featured.id).order("min_qty");
        setTiers((tierRows as Tier[]) ?? []);
      }
    })();
    return () => window.clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeTab === "All Offers") return products;
    if (activeTab === "Flat Discounts") return products.filter((p) => discountPercent(p) >= 15);
    if (activeTab === "New Arrivals") return products.filter((p) => Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24 * 30);
    const needle = activeTab.toLowerCase();
    return products.filter((p) => `${p.offer_label ?? ""} ${p.category} ${p.name}`.toLowerCase().includes(needle.split(" ")[0]));
  }, [activeTab, products]);

  const selectedTier = [...tiers].reverse().find((tier) => qty >= tier.min_qty);
  const bulkPrice = selectedTier?.unit_price ?? bulkProduct?.discount_price ?? bulkProduct?.price ?? 0;

  const toggleWishlist = (id: string) => {
    const next = wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id];
    setWishlist(next);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    toast.success(next.includes(id) ? "Added to wishlist" : "Removed from wishlist");
  };

  const addProduct = (product: Product, quantity = 1, price = product.discount_price ?? product.price) => {
    addItem({ id: product.id, name: product.name, brand: product.brand, unit: product.unit, price }, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Link to="/" className="text-primary hover:underline">Home</Link><ChevronRight className="h-3.5 w-3.5" /><Link to="/shop" className="text-primary hover:underline">Medicines</Link><ChevronRight className="h-3.5 w-3.5" /><span>Offers</span></div>
          <h1 className="font-display text-3xl md:text-5xl">Today's Deals</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">Exclusive offers on Ayurvedic medicines & wellness products</p>
        </div>
      </section>

      <main className="container py-8">
        <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground shadow-elegant">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3"><Zap className="h-8 w-8" /><p className="font-display text-2xl">Flash Sale — Up to 40% off on selected products</p></div>
            <div className="rounded-lg bg-background/20 px-4 py-2 font-mono text-xl font-bold backdrop-blur-sm">Ends in: {countdown}</div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => <Button key={tab} variant={activeTab === tab ? "default" : "outline"} className="shrink-0 rounded-full" onClick={() => setActiveTab(tab)}>{tab}</Button>)}
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const effectivePrice = product.discount_price ?? product.price;
            const savings = Math.max(0, product.price - effectivePrice);
            return (
              <Card key={product.id} className="overflow-hidden transition-smooth hover:shadow-soft">
                <CardContent className="p-3">
                  <Link to={`/shop/${product.id}`} className="relative mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-accent to-muted">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-3" loading="lazy" /> : <Package className="h-16 w-16 text-primary/30" />}
                    <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground">{product.offer_label || `${discountPercent(product)}% OFF`}</Badge>
                  </Link>
                  <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p><button type="button" onClick={() => toggleWishlist(product.id)} className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-primary"><Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? "fill-primary text-primary" : ""}`} /></button></div>
                  <Link to={`/shop/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary">{product.name}</Link>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> {product.rating || 4.6}</div>
                  <div className="mt-3 flex items-baseline gap-2"><span className="text-lg font-bold text-primary">{formatINR(effectivePrice)}</span><span className="text-xs text-muted-foreground line-through">{formatINR(product.price)}</span></div>
                  <p className="mt-1 text-sm font-medium text-secondary">You save {formatINR(savings)}</p>
                  <Button className="mt-3 w-full rounded-full" onClick={() => addProduct(product)}><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {bulkProduct && (
          <section className="mt-10 rounded-xl border border-border bg-background p-6 shadow-soft">
            <div className="grid gap-6 lg:grid-cols-[220px_1fr_auto] lg:items-center">
              <Link to={`/shop/${bulkProduct.id}`} className="grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted/40">{bulkProduct.image_url ? <img src={bulkProduct.image_url} alt={bulkProduct.name} className="h-full w-full object-contain p-3" loading="lazy" /> : <BadgePercent className="h-16 w-16 text-primary/30" />}</Link>
              <div><Badge variant="secondary" className="mb-3">Bulk Deal of the Day</Badge><h2 className="font-display text-2xl">{bulkProduct.name}</h2><p className="mt-1 text-sm text-muted-foreground">Extra discount for buying 5+ units from {bulkProduct.brand}</p><div className="mt-4 flex flex-wrap gap-2">{[5, 10, 25, 50].map((amount) => <Button key={amount} variant={qty === amount ? "default" : "outline"} size="sm" onClick={() => setQty(amount)}>{amount}</Button>)}</div></div>
              <div className="rounded-lg bg-accent p-5 text-center"><p className="text-sm text-muted-foreground">Tier price</p><p className="font-display text-3xl text-primary">{formatINR(bulkPrice)}</p><p className="text-xs text-muted-foreground">per unit × {qty}</p><Button className="mt-4 rounded-full" onClick={() => addProduct(bulkProduct, qty, bulkPrice)}>Add bulk deal</Button></div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Offers;
