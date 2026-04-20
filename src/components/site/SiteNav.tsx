import { Leaf, ShoppingCart } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { BulkPurchaseMenu } from "@/components/site/BulkPurchaseMenu";
import { PartnershipMenu } from "@/components/site/PartnershipMenu";

const links = [
  { to: "/doctors", label: "Find a Doctor" },
  { to: "/shop", label: "Medicines" },
  { to: "/#therapies", label: "Therapies" },
  { to: "/#learning", label: "Learning" },
];

export const SiteNav = () => {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf shadow-soft">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">Ayuzee</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <BulkPurchaseMenu />
          <PartnershipMenu />
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-smooth hover:text-primary ${
                  isActive && !l.to.includes("#") ? "text-primary" : "text-muted-foreground"
                }`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>
          <Button variant="hero" asChild><Link to="/auth?mode=signup">Sign up</Link></Button>
        </div>
      </div>
    </header>
  );
};
