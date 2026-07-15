import { FormEvent, useState } from "react";
import { usePincode } from "@/hooks/usePincode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PincodeWidgetProps = {
  variant: "banner" | "inline" | "mini";
};

export const PincodeWidget = ({ variant }: PincodeWidgetProps) => {
  const { pincode, city, deliveryAvailable, checkPincode, clearPincode } = usePincode();
  const [value, setValue] = useState(pincode);
  const [open, setOpen] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    checkPincode(value);
    setOpen(false);
  };

  if (variant === "mini") {
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen((v) => !v)} className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
          {pincode ? `📍 ${pincode}` : "📍 Set location"}
        </button>
        {open && (
          <form onSubmit={submit} className="absolute right-0 top-full z-[90] mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-elegant">
            <p className="mb-2 text-xs font-semibold text-foreground">Set delivery pincode</p>
            <div className="flex gap-2">
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Pincode" maxLength={6} className="h-9" />
              <Button type="submit" size="sm">Check</Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <section className="rounded-xl border border-border bg-background/60 p-4">
        <h3 className="font-display text-lg">📦 Delivery Location</h3>
        <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="text-sm font-medium text-foreground">Pincode</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter pincode" maxLength={6} className="mt-1" />
          </div>
          <Button type="submit" variant="hero" className="self-end">Check Availability</Button>
        </form>
        {deliveryAvailable === true && <p className="mt-3 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">✅ Delivery available to {pincode} · Estimated delivery: 2-4 business days · Free above ₹999</p>}
        {deliveryAvailable === false && <p className="mt-3 rounded-lg bg-warning/10 p-3 text-sm font-medium text-warning">⚠️ We have limited delivery to this area. You can still order — our team will confirm.</p>}
      </section>
    );
  }

  return (
    <section className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-sm">
      <div className="container flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-foreground">
          {pincode ? <>📍 Delivering to: <span className="font-semibold">{pincode}</span>{city && ` · ${city}`} <button type="button" onClick={clearPincode} className="ml-2 text-primary underline underline-offset-4">Change</button></> : "📍 Enter pincode to check delivery"}
          {deliveryAvailable === true && <span className="ml-3 font-medium text-primary">✅ Free delivery available! Arrives Tomorrow</span>}
          {deliveryAvailable === false && <span className="ml-3 font-medium text-warning">⚠️ Enter a valid 6-digit pincode</span>}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Pincode" maxLength={6} className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none" />
          <button type="submit" className="text-sm font-medium text-primary">Check</button>
        </form>
      </div>
    </section>
  );
};