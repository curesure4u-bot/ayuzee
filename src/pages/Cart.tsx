import { Link, useNavigate } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

const Cart = () => {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

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
                <article key={i.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
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
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
              <h2 className="font-display text-xl">Order summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>₹{subtotal}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : `₹${shipping}`}</dd></div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>₹{total}</dd></div>
              </dl>
              {subtotal < 499 && subtotal > 0 && (
                <p className="mt-4 rounded-lg bg-accent/60 p-3 text-xs text-muted-foreground">Add ₹{499 - subtotal} more for free shipping.</p>
              )}
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
