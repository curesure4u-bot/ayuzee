import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Pill, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SavedRow {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    name: string;
    brand: string | null;
    price: number;
    discount_price: number | null;
    image_url: string | null;
  } | null;
}

const PatientSavedMedicines = () => {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SavedRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return setLoading(false);
      const { data } = await supabase
        .from("doctor_saved_medicines")
        .select("id, product_id, created_at, products(name, brand, price, discount_price, image_url)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      setItems((data as unknown as SavedRow[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">💊 Saved Medicines</h1>
        <p className="text-sm text-muted-foreground">Medicines bookmarked for you and by your doctor.</p>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">No saved medicines yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your doctor will add medicines here after your consultation.
              </p>
            </div>
            <Button asChild>
              <Link to="/shop"><ShoppingBag className="mr-2 h-4 w-4" /> Shop Medicines</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => {
            const p = row.products;
            if (!p) return null;
            const finalPrice = p.discount_price ?? p.price;
            return (
              <Card key={row.id} className="overflow-hidden">
                <div className="aspect-square w-full bg-muted">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <Pill className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                  <p className="line-clamp-2 font-medium">{p.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-lg font-semibold text-primary">₹{finalPrice}</span>
                    {p.discount_price && p.discount_price < p.price && (
                      <span className="text-xs text-muted-foreground line-through">₹{p.price}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      addItem({
                        id: row.product_id,
                        name: p.name,
                        price: finalPrice,
                        image: p.image_url || "",
                      });
                      toast.success("Added to cart");
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientSavedMedicines;
