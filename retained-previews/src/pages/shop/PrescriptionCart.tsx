import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Pill, CheckCircle2, AlertCircle, Loader2, FileText, ArrowRight } from "lucide-react";

interface PrescribedMedicine {
  name: string;
  dosage: string;
  duration: string;
  matched_product: { id: string; name: string; brand: string; price: number; unit: string | null; stock: number } | null;
}

const PrescriptionCart = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get("appointment");
  const { addItem } = useCart();
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      if (!appointmentId) { setLoading(false); return; }

      // Fetch prescription from consultation_assessments
      const { data: assessment } = await supabase
        .from("consultation_assessments")
        .select("prescription")
        .eq("appointment_id", appointmentId)
        .maybeSingle();

      if (!assessment?.prescription) {
        setLoading(false);
        return;
      }

      // Parse prescription text into medicine names
      const rxText = assessment.prescription as string;
      const lines = rxText.split(/\n|,|;/).map((l: string) => l.trim()).filter(Boolean);

      // Match each line against products table
      const matched: PrescribedMedicine[] = [];
      for (const line of lines.slice(0, 10)) {
        // Extract medicine name (first meaningful words)
        const namePart = line.replace(/\d+\s*(mg|ml|g|tab|caps|bd|od|tid|hs|af|bf)\b/gi, "").trim();
        if (!namePart || namePart.length < 3) continue;

        const { data: products } = await supabase
          .from("products")
          .select("id, name, brand, price, unit, stock")
          .ilike("name", `%${namePart.slice(0, 20)}%`)
          .limit(1);

        matched.push({
          name: namePart,
          dosage: line.replace(namePart, "").trim() || "As prescribed",
          duration: "",
          matched_product: products && products.length > 0 ? (products[0] as any) : null,
        });
      }

      setMedicines(matched);
      setLoading(false);
    })();
  }, [appointmentId]);

  const addToCart = (med: PrescribedMedicine) => {
    if (!med.matched_product) return;
    addItem({
      id: med.matched_product.id,
      name: med.matched_product.name,
      brand: med.matched_product.brand,
      unit: med.matched_product.unit,
      price: med.matched_product.price,
    });
    setAddedIds((prev) => new Set([...prev, med.matched_product!.id]));
    toast.success(`${med.matched_product.name} added to cart`);
  };

  const addAllToCart = () => {
    let count = 0;
    medicines.forEach((med) => {
      if (med.matched_product && med.matched_product.stock > 0 && !addedIds.has(med.matched_product.id)) {
        addToCart(med);
        count++;
      }
    });
    if (count > 0) toast.success(`${count} medicine(s) added to cart!`);
    else toast.info("All available medicines already in cart");
  };

  const matchedCount = medicines.filter((m) => m.matched_product).length;
  const inStockCount = medicines.filter((m) => m.matched_product && m.matched_product.stock > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Your Prescription</h1>
            <p className="mt-2 text-muted-foreground">We've matched your doctor's prescription to medicines available on Ayuzee.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : medicines.length === 0 ? (
            <Card className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No prescription found for this consultation.</p>
              <Button asChild className="mt-4"><Link to="/shop">Browse Shop</Link></Button>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-4">
                <div>
                  <p className="text-sm font-medium">{matchedCount}/{medicines.length} medicines found · {inStockCount} in stock</p>
                  <p className="text-xs text-muted-foreground">Add all available medicines to your cart in one click</p>
                </div>
                <Button onClick={addAllToCart} className="gap-1">
                  <ShoppingCart className="h-4 w-4" /> Add All to Cart
                </Button>
              </div>

              {/* Medicine List */}
              <div className="space-y-3">
                {medicines.map((med, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${med.matched_product ? "bg-green-100" : "bg-gray-100"}`}>
                        <Pill className={`h-5 w-5 ${med.matched_product ? "text-green-700" : "text-gray-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage}</p>
                        {med.matched_product && (
                          <p className="text-xs text-primary mt-0.5">Matched: {med.matched_product.name} ({med.matched_product.brand}) — ₹{med.matched_product.price}</p>
                        )}
                        {!med.matched_product && (
                          <p className="text-xs text-amber-600 mt-0.5">Not available on platform — <Link to="/shop" className="underline">search manually</Link></p>
                        )}
                      </div>
                      {med.matched_product && med.matched_product.stock > 0 ? (
                        addedIds.has(med.matched_product.id) ? (
                          <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" /> Added</Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => addToCart(med)}>
                            <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Add
                          </Button>
                        )
                      ) : med.matched_product ? (
                        <Badge variant="outline" className="text-red-600">Out of stock</Badge>
                      ) : (
                        <Badge variant="outline">Not found</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Checkout CTA */}
              {addedIds.size > 0 && (
                <div className="text-center">
                  <Button asChild size="lg" variant="hero">
                    <Link to="/cart">Go to Cart ({addedIds.size} items) <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrescriptionCart;
