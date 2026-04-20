import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(15),
  address_line1: z.string().trim().min(4).max(200),
  address_line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{4,10}$/, "Invalid pincode"),
});

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    full_name: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", pincode: "",
  });

  useEffect(() => {
    document.title = "Checkout — Ayuzee";
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (items.length === 0 && !submitting) navigate("/cart", { replace: true });
  }, [items.length, submitting, navigate]);

  if (authed === false) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl">Sign in to check out</h1>
          <p className="mt-2 text-muted-foreground">Your cart will be saved.</p>
          <Button asChild variant="hero" className="mt-6"><Link to="/auth?mode=signup">Sign in / Sign up</Link></Button>
        </div>
      </div>
    );
  }

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please check your details");
      return;
    }
    setSubmitting(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { navigate("/auth"); return; }

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: s.session.user.id,
          subtotal,
          shipping,
          total,
          payment_status: "pending",
          order_status: "placed",
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          address_line1: parsed.data.address_line1,
          address_line2: parsed.data.address_line2 ?? null,
          city: parsed.data.city,
          state: parsed.data.state,
          pincode: parsed.data.pincode,
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
        }))
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed! 🌿");
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not place order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-12">
        <h1 className="mb-8 font-display text-4xl">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Shipping address</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label htmlFor="full_name">Full name</Label><Input id="full_name" value={form.full_name} onChange={onChange("full_name")} required /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={form.phone} onChange={onChange("phone")} required /></div>
              <div><Label htmlFor="pincode">Pincode</Label><Input id="pincode" value={form.pincode} onChange={onChange("pincode")} required /></div>
              <div className="sm:col-span-2"><Label htmlFor="address_line1">Address line 1</Label><Input id="address_line1" value={form.address_line1} onChange={onChange("address_line1")} required /></div>
              <div className="sm:col-span-2"><Label htmlFor="address_line2">Address line 2 (optional)</Label><Input id="address_line2" value={form.address_line2} onChange={onChange("address_line2")} /></div>
              <div><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={onChange("city")} required /></div>
              <div><Label htmlFor="state">State</Label><Input id="state" value={form.state} onChange={onChange("state")} required /></div>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-xl bg-accent/60 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              Razorpay payment wiring comes next — for now your order is placed with status <strong className="mx-1 text-foreground">pending</strong>.
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="font-display text-xl">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3">
                  <span className="flex-1 truncate">{i.name} <span className="text-muted-foreground">× {i.quantity}</span></span>
                  <span>₹{i.price * i.quantity}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>₹{subtotal}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : `₹${shipping}`}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>₹{total}</dd></div>
            </dl>
            <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Placing order…" : `Place order · ₹${total}`}
            </Button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
