import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { PincodeWidget } from "@/components/site/PincodeWidget";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, ShoppingCart, Trash2, Gift, Sparkles, RefreshCw } from "lucide-react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { toast } from "sonner";

const Cart = () => {
  usePageSEO({
    title: "Your Cart — Ayuzee",
    description: "Review Ayurvedic medicines and wellness products in your Ayuzee cart before checkout.",
    canonicalPath: "/cart",
    noIndex: true,
  });
  const { items, updateQty, removeItem, subtotal, rewardDiscount, setRewardDiscount } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  const total = Math.max(0, subtotal + shipping - rewardDiscount);

  // Reward points state
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardApplied, setRewardApplied] = useState(rewardDiscount > 0);

  // Medicine substitution suggestions (for out-of-stock items)
  const [substitutions, setSubstitutions] = useState<Record<string, { name: string; price: number; id: string }[]>>({});

  useEffect(() => {
    // Load user reward points
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return;
      const uid = sess.session.user.id;
      const { data } = await supabase.from("gamification_points").select("balance").eq("user_id", uid).maybeSingle();
      if (data) setRewardPoints((data as any).balance ?? 0);
    })();
  }, []);

  useEffect(() => {
    // Load substitution suggestions for cart items
    if (items.length === 0) return;
    (async () => {
      const subs: Record<string, { name: string; price: number; id: string }[]> = {};
      for (const item of items) {
        const { data } = await supabase
          .from("products")
          .select("id, name, price")
          .neq("id", item.id)
          .ilike("category", `%${item.brand}%`)
          .limit(2);
        if (data && data.length > 0) {
          subs[item.id] = (data as { id: string; name: string; price: number }[]);
        }
      }
      setSubstitutions(subs);
    })();
  }, [items]);

  const applyRewards = () => {
    if (rewardPoints <= 0) {
      toast.error("No reward points available");
      return;
    }
    // 1 point = ₹1 discount, max 20% of subtotal
    const maxDiscount = Math.floor(subtotal * 0.2);
    const discount = Math.min(rewardPoints, maxDiscount);
    setRewardDiscount(discount);
    setRewardApplied(true);
    toast.success(`₹${discount} reward discount applied!`);
  };

  const removeRewards = () => {
    setRewardDiscount(0);
    setRewardApplied(false);
    toast.info("Reward discount removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-12">
        <h1 className="mb-8 font-display text-4xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start exploring authentic Ayurvedic medicines.</p>
            <Button variant="hero" asChild className="mt-6"><Link to="/shop">Browse products</Link></Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {items.map((i) => (
                <article key={i.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl gradient-soft font-display text-3xl text-primary/30">
                      {i.name[0]}
                    </div>
                    <div className="flex-1">
                      <Link to={`/shop/${i.id}`} className="font-semibold hover:text-primary">{i.name}</Link>
                      <p className="text-xs text-muted-foreground">{i.brand} · {i.unit}</p>
                      <p className="mt-1 font-display text-lg">₹{i.price}</p>
                    </div>
                    <div className="flex items-center rounded-lg border border-border">
                      <button onClick={() => updateQty(i.id, i.quantity - 1)} className="grid h-9 w-9 place-items-center hover:bg-accent" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                      <button onClick={() => updateQty(i.id, i.quantity + 1)} className="grid h-9 w-9 place-items-center hover:bg-accent" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(i.id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {/* Medicine Substitution Suggestions */}
                  {substitutions[i.id] && substitutions[i.id].length > 0 && (
                    <div className="ml-24 rounded-md border border-dashed border-blue-200 bg-blue-50/50 p-2">
                      <p className="text-[10px] font-semibold uppercase text-blue-600 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Also consider (similar formulations)
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {substitutions[i.id].map((sub) => (
                          <Link key={sub.id} to={`/shop/${sub.id}`} className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[11px] hover:border-primary hover:text-primary transition">
                            {sub.name.slice(0, 25)}{sub.name.length > 25 && "…"} · ₹{sub.price}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
              <h2 className="font-display text-xl">Order summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>₹{subtotal}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : `₹${shipping}`}</dd></div>
                {rewardDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt className="flex items-center gap-1"><Gift className="h-3.5 w-3.5" /> Reward Discount</dt>
                    <dd>-₹{rewardDiscount}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>₹{total}</dd></div>
              </dl>

              {/* Apply Rewards Section */}
              {subtotal > 0 && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                    <Sparkles className="h-4 w-4" /> Your Reward Points: <span className="font-bold">{rewardPoints}</span>
                  </div>
                  {rewardPoints > 0 && !rewardApplied && (
                    <Button size="sm" variant="outline" className="mt-2 w-full gap-1 border-amber-300 text-amber-700 hover:bg-amber-100" onClick={applyRewards}>
                      <Gift className="h-3.5 w-3.5" /> Apply Rewards (up to ₹{Math.min(rewardPoints, Math.floor(subtotal * 0.2))} off)
                    </Button>
                  )}
                  {rewardApplied && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium">✓ ₹{rewardDiscount} applied</span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-red-600" onClick={removeRewards}>Remove</Button>
                    </div>
                  )}
                  {rewardPoints === 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">Earn points from consultations, orders & community activity.</p>
                  )}
                </div>
              )}

              {subtotal < 499 && subtotal > 0 && (
                <p className="mt-4 rounded-lg bg-accent/60 p-3 text-xs text-muted-foreground">Add ₹{499 - subtotal} more for free shipping.</p>
              )}
              <div className="mt-5">
                <p className="mb-2 text-xs text-muted-foreground">Confirm your delivery location before checkout.</p>
                <PincodeWidget variant="inline" />
              </div>
              <Button variant="hero" size="lg" className="mt-6 w-full" onClick={() => navigate("/checkout")}>
                Proceed to checkout
              </Button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
