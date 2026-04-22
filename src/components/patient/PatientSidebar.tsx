import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User,
  Calendar,
  BookmarkCheck,
  ShoppingBag,
  MapPin,
  CreditCard,
  Wallet,
  LogOut,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard/profile", label: "My Profile", icon: User },
  { to: "/dashboard/appointments", label: "My Appointments", icon: Calendar },
  { to: "/dashboard/saved-medicines", label: "Saved Medicines", icon: Pill },
  { to: "/dashboard/saved-posts", label: "Saved Posts", icon: BookmarkCheck },
  { to: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { to: "/dashboard/addresses", label: "My Addresses", icon: MapPin },
  { to: "/dashboard/wallet", label: "Ayuzee Money", icon: Wallet },
  { to: "/dashboard/bank", label: "Bank Details", icon: CreditCard },
];

export const PatientSidebar = () => {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  return (
    <aside className="rounded-2xl border border-border bg-card p-2">
      <nav className="flex flex-col">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </NavLink>
        ))}
        <button
          onClick={signOut}
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
};
