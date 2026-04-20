import { Button } from "@/components/ui/button";
import { Leaf, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Find a Doctor", href: "#doctors" },
  { label: "Therapies", href: "/therapies" },
  { label: "Medicines", href: "#products" },
  { label: "Learning", href: "#learning" },
  { label: "Blog", href: "#blog" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf shadow-soft">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">Ayuzee</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" aria-label="Cart"><ShoppingCart className="h-5 w-5" /></Button>
          <Button variant="ghost" asChild><a href="/doctor/auth">For Doctors</a></Button>
          <Button variant="ghost" asChild><a href="/auth">Sign in</a></Button>
          <Button variant="hero" asChild><a href="/auth?mode=signup">Book Consultation</a></Button>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-foreground">
                {l.label}
              </a>
            ))}
            <Button variant="hero" className="mt-3" asChild><a href="/auth?mode=signup">Book Consultation</a></Button>
          </nav>
        </div>
      )}
    </header>
  );
};
