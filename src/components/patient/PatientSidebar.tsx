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
  Sparkles,
  Stethoscope,
  Eye,
  Flower2,
  ClipboardCheck,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: typeof User };
type Group = { label?: string; items: Item[] };

const groups: Group[] = [
  {
    items: [
      { to: "/dashboard/profile", label: "My Profile", icon: User },
      { to: "/dashboard/appointments", label: "My Appointments", icon: Calendar },
      { to: "/dashboard/health-locker", label: "Health Locker", icon: FolderOpen },
      { to: "/dashboard/panchakarma", label: "My Therapy Sessions", icon: Flower2 },
      { to: "/dashboard/medicine-diary", label: "Medicine Diary", icon: ClipboardCheck },
      { to: "/dashboard/guidance", label: "My Guidance", icon: Sparkles },
      { to: "/diagnosis/gut-health", label: "Gut Health Check", icon: Sparkles },
      { to: "/task-tracker", label: "My Planner", icon: ClipboardCheck },
    ],
  },
  {
    label: "Health Assessments",
    items: [
      { to: "/diagnosis/prakriti", label: "Prakriti Pareeksha", icon: Stethoscope },
      { to: "/diagnosis/ashtavidha", label: "Ashtavidha Pariksha", icon: Stethoscope },
    ],
  },
  {
    label: "Self-Assessment Diagnostics",
    items: [
      { to: "/diagnosis/gut-health", label: "Gut Health Assessment", icon: Sparkles },
      { to: "/diagnosis/mutra-bindu", label: "Mutra Bindu Pariksha", icon: Sparkles },
      { to: "/diagnosis/jihva", label: "Jihva Pariksha", icon: Stethoscope },
      { to: "/diagnosis/netra", label: "Netra Pariksha", icon: Eye },
    ],
  },
  {
    items: [
      { to: "/dashboard/saved-medicines", label: "Saved Medicines", icon: Pill },
      { to: "/dashboard/saved-posts", label: "Saved Posts", icon: BookmarkCheck },
      { to: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
      { to: "/dashboard/addresses", label: "My Addresses", icon: MapPin },
      { to: "/dashboard/wallet", label: "Ayuzee Money", icon: Wallet },
      { to: "/dashboard/bank", label: "Bank Details", icon: CreditCard },
    ],
  },
];

export const PatientSidebar = () => {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/?welcome=1", { replace: true });
  };

  return (
    <aside className="rounded-2xl border border-border bg-card p-2">
      <nav className="flex flex-col gap-1">
        {groups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-2 pt-2 border-t border-border/60")}>
            {group.label && (
              <div className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {group.label}
              </div>
            )}
            {group.items.map((it) => (
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
          </div>
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
