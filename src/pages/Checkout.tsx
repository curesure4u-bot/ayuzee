import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { PincodeWidget } from "@/components/site/PincodeWidget";
import { usePincode } from "@/hooks/usePincode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Check, MapPin, Plus, ShieldCheck, Tag, Truck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed" | "free_shipping";
  discount_amount: number; // computed rupees off subtotal
  free_shipping: boolean;
  description: string | null;
}

interface SavedAddress {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

declare global {
  interface Window { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }
}

const loadRazorpay = (): Promise<boolean> => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

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
  const { pincode: savedPincode, checkPincode } = usePincode();
  const [submitting, setSubmitting] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const FREE_SHIPPING_THRESHOLD = 499;
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = coupon?.discount_amount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const baseShipping = discountedSubtotal === 0 ? 0 : discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const shipping = coupon?.free_shipping ? 0 : baseShipping;
  const total = discountedSubtotal + shipping;
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
  const shipProgress = Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const [form, setForm] = useState({
    full_name: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", pincode: localStorage.getItem("ayuzee_pincode") || "",
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    document.title = "Checkout — Ayuzee";
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load saved addresses once authed
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const { data } = await supabase
        .from("patient_addresses")
        .select("id,label,full_name,phone,address_line1,address_line2,city,state,pincode,is_default")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      const list = (data as SavedAddress[]) ?? [];
      setSavedAddresses(list);
      if (list.length) {
        const def = list.find((a) => a.is_default) ?? list[0];
        applyAddress(def);
        setShowForm(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const applyAddress = (a: SavedAddress) => {
    setSelectedAddressId(a.id);
    setForm({
      full_name: a.full_name,
      phone: a.phone,
      address_line1: a.address_line1,
      address_line2: a.address_line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    });
    checkPincode(a.pincode);
    setSaveAddress(false);
  };

  const startNewAddress = () => {
    setSelectedAddressId("new");
    setShowForm(true);
    setForm({
      full_name: "", phone: "", address_line1: "", address_line2: "",
      city: "", state: "", pincode: localStorage.getItem("ayuzee_pincode") || "",
    });
    setSaveAddress(true);
  };

  useEffect(() => {
    if (items.length === 0 && !submitting) navigate("/cart", { replace: true });
  }, [items.length, submitting, navigate]);

  useEffect(() => {
    if (savedPincode && !form.pincode) setForm((current) => ({ ...current, pincode: savedPincode }));
  }, [savedPincode, form.pincode]);

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

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, [k]: value });
    if (k === "pincode") checkPincode(value);
  };

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
          subtotal, shipping, total,
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
        .select("id").single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id, product_id: i.id, product_name: i.name,
          quantity: i.quantity, unit_price: i.price,
        }))
      );
      if (itemsErr) throw itemsErr;

      // Save the address for next time (best-effort, non-blocking)
      if (saveAddress) {
        try {
          await supabase.from("patient_addresses").insert({
            user_id: s.session.user.id,
            full_name: parsed.data.full_name,
            phone: parsed.data.phone,
            address_line1: parsed.data.address_line1,
            address_line2: parsed.data.address_line2 ?? null,
            city: parsed.data.city,
            state: parsed.data.state,
            pincode: parsed.data.pincode,
            is_default: savedAddresses.length === 0,
          });
        } catch (saveErr) {
          console.warn("Could not save address:", saveErr);
        }
      }

      // Razorpay checkout
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load Razorpay");

      const { data: rzp, error: rzpErr } = await supabase.functions.invoke("razorpay-create-order", {
        body: { order_id: order.id, kind: "order" },
      });
      if (rzpErr || !rzp?.razorpay_order_id) throw new Error(rzpErr?.message || "Payment init failed");

      const rz = new window.Razorpay({
        key: rzp.key_id,
        amount: rzp.amount,
        currency: rzp.currency,
        order_id: rzp.razorpay_order_id,
        name: "Ayuzee",
        description: "Order payment",
        prefill: { name: parsed.data.full_name, contact: parsed.data.phone },
        theme: { color: "#16a34a" },
        handler: async (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const { error: vErr } = await supabase.functions.invoke("razorpay-verify-payment", {
            body: {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              internal_id: order.id,
              kind: "order",
            },
          });
          if (vErr) { toast.error("Payment verification failed"); return; }
          clear();
          toast.success("Payment successful! 🌿");
          navigate("/dashboard");
        },
        modal: { ondismiss: () => { setSubmitting(false); toast.info("Payment cancelled"); } },
      });
      rz.open();
      return; // don't run finally→submitting=false yet; handler will navigate
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

            {savedAddresses.length > 0 && (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">Choose a saved address</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((a) => {
                    const active = selectedAddressId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => { applyAddress(a); setShowForm(false); }}
                        className={cn(
                          "relative rounded-xl border p-4 text-left text-sm transition",
                          active ? "border-primary bg-primary/5 ring-2 ring-primary/40" : "border-border bg-background hover:border-primary/50",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{a.full_name}</span>
                          {a.is_default && <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold text-secondary">Default</span>}
                          {active && <Check className="ml-auto h-4 w-4 text-primary" />}
                        </div>
                        <p className="mt-1 text-muted-foreground">{a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ""}</p>
                        <p className="text-muted-foreground">{a.city}, {a.state} — {a.pincode}</p>
                        <p className="mt-1 text-xs text-muted-foreground">📞 {a.phone}</p>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={startNewAddress}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-4 text-sm transition",
                      selectedAddressId === "new" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
                    )}
                  >
                    <Plus className="h-5 w-5" />
                    Use a new address
                  </button>
                </div>
                {!showForm && selectedAddressId && selectedAddressId !== "new" && (
                  <button type="button" onClick={() => setShowForm(true)} className="text-xs font-semibold text-primary hover:underline">
                    Edit details
                  </button>
                )}
              </div>
            )}

            {(showForm || savedAddresses.length === 0) && (
              <>
                <div className="mt-6"><PincodeWidget variant="inline" /></div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Label htmlFor="full_name">Full name</Label><Input id="full_name" value={form.full_name} onChange={onChange("full_name")} required /></div>
                  <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={form.phone} onChange={onChange("phone")} required /></div>
                  <div><Label htmlFor="pincode">Pincode</Label><Input id="pincode" value={form.pincode} onChange={onChange("pincode")} required /></div>
                  <div className="sm:col-span-2"><Label htmlFor="address_line1">Address line 1</Label><Input id="address_line1" value={form.address_line1} onChange={onChange("address_line1")} required /></div>
                  <div className="sm:col-span-2"><Label htmlFor="address_line2">Address line 2 (optional)</Label><Input id="address_line2" value={form.address_line2} onChange={onChange("address_line2")} /></div>
                  <div><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={onChange("city")} required /></div>
                  <div><Label htmlFor="state">State</Label><Input id="state" value={form.state} onChange={onChange("state")} required /></div>
                </div>

                <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Save this address for future orders
                </label>
              </>
            )}

            <div className="mt-8 flex items-center gap-3 rounded-xl bg-accent/60 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              Secure payment via Razorpay. Test card: <strong className="mx-1 text-foreground">4111 1111 1111 1111</strong>, any CVV/future expiry.
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
