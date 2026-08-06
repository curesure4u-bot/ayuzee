import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Search, ShoppingCart, Star, TrendingDown, Award, Loader2,
} from "lucide-react";

interface ProductVariant {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount_price: number | null;
  unit: string | null;
  rating: number;
  stock: number;
}

const PriceCompare = () => {
  const { addItem } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price, discount_price, unit, rating, stock")
      .or(`name.ilike.%${query.trim()}%,tags.cs.{${query.trim()}}`)
      .order("price", { ascending: true })
      .limit(20);
    setResults((data ?? []) as ProductVariant[]);
    setLoading(false);
  };

  const cheapest = results.length > 0 ? results[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100">
              <TrendingDown className="h-7 w-7 text-emerald-700" />
            </div>
            <h1 className="font-display text-2xl font-bold">Medicine Price Comparison</h1>
            <p className="mt-2 text-muted-foreground">
              Compare prices for the same formulation across different brands.
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-5">
              <div className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search medicine (e.g., Ashwagandha, Triphala, Guggulu...)"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && !loading && results.length === 0 && (
            <Card className="py-8 text-center">
              <p className="text-muted-foreground">No products found for "{query}". Try a different search.</p>
            </Card>
          )}

          {results.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">{results.length} options found · Sorted by price (lowest first)</p>
              <div className="space-y-3">
                {results.map((p, i) => {
                  const effective = p.discount_price ?? p.price;
                  const isCheapest = i === 0;
                  return (
                    <Card key={p.id} className={isCheapest ? "border-green-300 bg-green-50/30" : ""}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{p.name}</p>
                            {isCheapest && <Badge className="bg-green-100 text-green-700 text-[10px] gap-0.5"><Award className="h-2.5 w-2.5" /> Best Price</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.brand} · {p.unit ?? "—"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}</span>
                            {p.stock <= 0 && <Badge variant="outline" className="text-[9px] text-red-600">Out of stock</Badge>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-lg font-bold text-primary">₹{effective}</p>
                          {p.discount_price && <p className="text-xs text-muted-foreground line-through">₹{p.price}</p>}
                          {!isCheapest && cheapest && (
                            <p className="text-[10px] text-red-600">+₹{effective - (cheapest.discount_price ?? cheapest.price)} more</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isCheapest ? "default" : "outline"}
                          disabled={p.stock <= 0}
                          onClick={() => {
                            addItem({ id: p.id, name: p.name, brand: p.brand, unit: p.unit, price: effective });
                            toast.success(`${p.name} added to cart`);
                          }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PriceCompare;
