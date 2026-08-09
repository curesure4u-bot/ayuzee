import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Coins,
  Download,
  FileSpreadsheet,
  FileText,
  Gift,
  Layout,
  Package,
  ShoppingBag,
  Star,
  Table2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { spendCoins } from "@/services/beyondGamification";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

interface Product {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  product_type: string;
  category: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  file_url: string;
  file_size_kb: number;
  price_coins: number;
  is_free: boolean;
  download_count: number;
  rating_avg: number;
  rating_count: number;
  author_name: string;
  tags: string[];
  is_featured: boolean;
}

interface Purchase {
  product_id: string;
  coins_spent: number;
  purchased_at: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string | null;
  created_at: string;
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function getProductIcon(type: string) {
  switch (type) {
    case "pdf": return <FileText className="h-5 w-5" />;
    case "template": return <Layout className="h-5 w-5" />;
    case "worksheet": return <Table2 className="h-5 w-5" />;
    case "ebook": return <BookOpen className="h-5 w-5" />;
    case "spreadsheet": return <FileSpreadsheet className="h-5 w-5" />;
    case "notion_template": return <Layout className="h-5 w-5" />;
    case "checklist": return <CheckCircle2 className="h-5 w-5" />;
    case "toolkit": return <Package className="h-5 w-5" />;
    case "bundle": return <Gift className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
}

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    clinical: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    finance: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    leadership: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    wellness: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    time: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
    side_income: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    general: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  };
  return colors[cat] || colors.general;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sz} ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

const DigitalStore = () => {
  const [view, setView] = useState<"store" | "detail" | "library">("store");
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Detail state
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");

  const sb = supabase as any;

  useEffect(() => { loadStore(); }, []);

  const loadStore = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [productsRes, purchasesRes, coinsRes] = await Promise.all([
      sb.from("beyond_digital_products").select("*").eq("is_published", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false }),
      session.session
        ? sb.from("beyond_digital_purchases").select("product_id, coins_spent, purchased_at").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
      session.session
        ? sb.from("beyond_coin_balance").select("balance").eq("user_id", session.session.user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setProducts(productsRes.data || []);
    setPurchases(purchasesRes.data || []);
    setCoinBalance(coinsRes.data?.balance || 0);
    setLoading(false);
  };

  const openProduct = async (product: Product) => {
    setActiveProduct(product);
    setView("detail");
    const { data } = await sb.from("beyond_digital_reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const purchaseProduct = async (product: Product) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in first"); return; }
    const userId = session.session.user.id;

    // Check if already purchased
    if (purchases.some((p) => p.product_id === product.id)) {
      toast.info("You already own this product!");
      return;
    }

    // Check coins (skip for free products)
    if (!product.is_free && product.price_coins > 0) {
      if (coinBalance < product.price_coins) {
        toast.error(`Not enough coins! You need ${product.price_coins} but have ${coinBalance}.`);
        return;
      }
      // Spend coins
      const result = await spendCoins(userId, product.price_coins, "digital_store", `Purchased: ${product.title}`);
      if (!result.success) {
        toast.error("Purchase failed. Not enough coins.");
        return;
      }
      setCoinBalance(result.newBalance);
    }

    // Record purchase
    await sb.from("beyond_digital_purchases").insert({
      user_id: userId,
      product_id: product.id,
      coins_spent: product.is_free ? 0 : product.price_coins,
    });

    // Increment download count
    await sb.from("beyond_digital_products").update({ download_count: product.download_count + 1 }).eq("id", product.id);

    setPurchases((prev) => [...prev, { product_id: product.id, coins_spent: product.is_free ? 0 : product.price_coins, purchased_at: new Date().toISOString() }]);
    toast.success(product.is_free ? "Added to your library!" : `Purchased for ${product.price_coins} coins! Added to library.`);
  };

  const downloadProduct = (product: Product) => {
    window.open(product.file_url, "_blank");
  };

  const submitReview = async () => {
    if (!activeProduct || userRating === 0) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;

    const { data: profile } = await sb.from("beyond_profiles").select("full_name").eq("user_id", userId).maybeSingle();

    await sb.from("beyond_digital_reviews").upsert({
      user_id: userId,
      product_id: activeProduct.id,
      rating: userRating,
      review_text: userReview.trim() || null,
      reviewer_name: profile?.full_name || "Member",
    }, { onConflict: "user_id,product_id" });

    toast.success("Review submitted! Thank you.");
    setUserRating(0);
    setUserReview("");
    // Reload reviews
    const { data } = await sb.from("beyond_digital_reviews").select("*").eq("product_id", activeProduct.id).order("created_at", { ascending: false });
    setReviews(data || []);
  };

  // ─── RENDER: Store ────────────────────────────────────────
  const renderStore = () => {
    const ownedIds = purchases.map((p) => p.product_id);
    const featured = products.filter((p) => p.is_featured);
    const free = products.filter((p) => p.is_free);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
              <ShoppingBag className="h-7 w-7 text-violet-500" />
              Digital Store
            </h1>
            <p className="text-muted-foreground">Templates, workbooks, and tools for your growth</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3 text-yellow-500" /> {coinBalance} coins
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Download className="h-3 w-3" /> {purchases.length} owned
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="free">Free ({free.length})</TabsTrigger>
            <TabsTrigger value="library">My Library ({purchases.length})</TabsTrigger>
          </TabsList>

          {/* All Products */}
          <TabsContent value="all" className="mt-4">
            {featured.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Featured
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((product) => (
                    <ProductCard key={product.id} product={product} owned={ownedIds.includes(product.id)} onOpen={() => openProduct(product)} onBuy={() => purchaseProduct(product)} onDownload={() => downloadProduct(product)} />
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">All Products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} owned={ownedIds.includes(product.id)} onOpen={() => openProduct(product)} onBuy={() => purchaseProduct(product)} onDownload={() => downloadProduct(product)} />
              ))}
            </div>
          </TabsContent>

          {/* Free */}
          <TabsContent value="free" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {free.map((product) => (
                <ProductCard key={product.id} product={product} owned={ownedIds.includes(product.id)} onOpen={() => openProduct(product)} onBuy={() => purchaseProduct(product)} onDownload={() => downloadProduct(product)} />
              ))}
            </div>
            {free.length === 0 && (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No free products available right now</p></CardContent></Card>
            )}
          </TabsContent>

          {/* My Library */}
          <TabsContent value="library" className="mt-4">
            {purchases.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Your library is empty</p>
                <p className="text-xs text-muted-foreground mt-1">Purchase or claim free products to see them here</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter((p) => ownedIds.includes(p.id)).map((product) => (
                  <ProductCard key={product.id} product={product} owned={true} onOpen={() => openProduct(product)} onBuy={() => {}} onDownload={() => downloadProduct(product)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ─── RENDER: Product Detail ───────────────────────────────
  const renderDetail = () => {
    if (!activeProduct) return null;
    const owned = purchases.some((p) => p.product_id === activeProduct.id);

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setView("store"); setActiveProduct(null); }}>
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Button>

        {/* Product Header */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className={`grid h-24 w-24 sm:h-32 sm:w-32 shrink-0 place-items-center rounded-2xl ${getCategoryColor(activeProduct.category)}`}>
            {getProductIcon(activeProduct.product_type)}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] capitalize">{activeProduct.product_type.replace("_", " ")}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize">{activeProduct.category.replace("_", " ")}</Badge>
              {activeProduct.is_free && <Badge variant="secondary" className="text-[10px]">Free</Badge>}
              {activeProduct.is_featured && <Badge className="text-[10px] bg-amber-500">Featured</Badge>}
            </div>
            <h2 className="text-2xl font-bold">{activeProduct.title}</h2>
            {activeProduct.subtitle && <p className="text-muted-foreground">{activeProduct.subtitle}</p>}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">by {activeProduct.author_name}</span>
              <span className="flex items-center gap-1"><Download className="h-3 w-3" />{activeProduct.download_count} downloads</span>
              {activeProduct.rating_count > 0 && (
                <span className="flex items-center gap-1">
                  <StarRating rating={activeProduct.rating_avg} />
                  <span className="text-xs">({activeProduct.rating_count})</span>
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {owned ? (
                <Button onClick={() => downloadProduct(activeProduct)} className="gap-2">
                  <Download className="h-4 w-4" /> Download
                </Button>
              ) : activeProduct.is_free ? (
                <Button onClick={() => purchaseProduct(activeProduct)} className="gap-2">
                  <Gift className="h-4 w-4" /> Get Free
                </Button>
              ) : (
                <Button onClick={() => purchaseProduct(activeProduct)} className="gap-2">
                  <Coins className="h-4 w-4" /> Buy for {activeProduct.price_coins} coins
                </Button>
              )}
              {owned && <Badge variant="outline" className="gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /> Owned</Badge>}
            </div>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader><CardTitle className="text-lg">About This Product</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{activeProduct.description}</p>
            {activeProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {activeProduct.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Reviews ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Write Review (if owned) */}
            {owned && (
              <div className="space-y-3 pb-4 border-b">
                <p className="text-sm font-medium">Rate this product:</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setUserRating(i)} className="p-0.5">
                      <Star className={`h-6 w-6 transition-colors ${i <= userRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 hover:text-amber-200"}`} />
                    </button>
                  ))}
                </div>
                <Textarea placeholder="Write a short review (optional)..." value={userReview} onChange={(e) => setUserReview(e.target.value)} className="text-sm min-h-[60px]" />
                <Button size="sm" onClick={submitReview} disabled={userRating === 0}>Submit Review</Button>
              </div>
            )}

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 rounded-lg border p-3">
                    <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 grid place-items-center text-xs font-bold text-violet-600 shrink-0">
                      {(review.reviewer_name || "U").charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium">{review.reviewer_name || "Member"}</p>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.review_text && <p className="text-xs text-muted-foreground mt-1">{review.review_text}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading store...</div>
      </div>
    );
  }

  return view === "detail" ? renderDetail() : renderStore();
};

// ════════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
// ════════════════════════════════════════════════════════════

function ProductCard({ product, owned, onOpen, onBuy, onDownload }: {
  product: Product;
  owned: boolean;
  onOpen: () => void;
  onBuy: () => void;
  onDownload: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className={`p-4 ${getCategoryColor(product.category)}`}>
          <div className="flex items-start justify-between">
            {getProductIcon(product.product_type)}
            {product.is_free ? (
              <Badge variant="secondary" className="text-[10px]">Free</Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-[10px] bg-white/80 dark:bg-gray-900/80">
                <Coins className="h-3 w-3 text-yellow-500" /> {product.price_coins}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm cursor-pointer hover:text-violet-600 transition-colors" onClick={onOpen}>
            {product.title}
          </h3>
          {product.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{product.subtitle}</p>}

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />{product.download_count}</span>
            {product.rating_count > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />{product.rating_avg}
              </span>
            )}
            <span className="capitalize">{product.product_type.replace("_", " ")}</span>
          </div>

          {/* Action */}
          <div className="pt-2">
            {owned ? (
              <Button size="sm" variant="outline" className="w-full gap-1" onClick={onDownload}>
                <Download className="h-3 w-3" /> Download
              </Button>
            ) : (
              <Button size="sm" className="w-full gap-1" onClick={onBuy}>
                {product.is_free ? <><Gift className="h-3 w-3" /> Get Free</> : <><Coins className="h-3 w-3" /> {product.price_coins} coins</>}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DigitalStore;
