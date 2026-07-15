import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bookmark, Trash2 } from "lucide-react";

interface Med {
  id: string;
  product_id: string;
  product?: { name: string; brand: string; price: number; discount_price: number | null; unit: string | null; image_url: string | null };
}

const DoctorMedicines = () => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<Med[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("doctor_saved_medicines")
        .select("id, product_id, product:products(name, brand, price, discount_price, unit, image_url)")
        .eq("user_id", userId);
      setItems((data ?? []) as unknown as Med[]);
    })();
  }, [userId]);

  const remove = async (id: string) => {
    await supabase.from("doctor_saved_medicines").delete().eq("id", id);
    setItems((p) => p.filter((i) => i.id !== id));
    toast.success("Removed");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="p-6">
        <h1 className="mb-4 font-display text-2xl flex items-center gap-2"><Bookmark className="h-6 w-6 text-primary" /> My Medicine List</h1>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Save medicines from the shop to build your prescription list.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <div key={m.id} className="rounded-lg border p-3">
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  {m.product?.image_url && <img src={m.product.image_url} alt={m.product?.name} className="h-full w-full object-cover" />}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{m.product?.brand}</p>
                <p className="font-medium">{m.product?.name}</p>
                {m.product?.unit && <p className="text-xs text-muted-foreground">{m.product.unit}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-primary">₹{m.product?.discount_price ?? m.product?.price}</span>
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorMedicines;
