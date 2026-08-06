import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Pill,
  Search,
  ShoppingCart,
  User,
  Users,
  Wallet,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export const PatientHeader = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const [name, setName] = useState("");
  const [pincode, setPincode] = useState(() => localStorage.getItem("ayuzee_pincode") || "110030");
  const [editingPin, setEditingPin] = useState(false);
  const [pinDraft, setPinDraft] = useState(pincode);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", uid)
        .maybeSingle();
      setName(prof?.full_name ?? data.session?.user.email ?? "");
    });
  }, []);

  const savePincode = () => {
    if (!/^\d{6}$/.test(pinDraft)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setPincode(pinDraft);
    localStorage.setItem("ayuzee_pincode", pinDraft);
    setEditingPin(false);
    toast.success("Location updated");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/?welcome=1", { replace: true });
  };

  const initials = (name || "U").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-semibold">Ayuzee</span>
        </Link>

        {/* Location */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 min-w-[180px]">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          {editingPin ? (
            <div className="flex items-center gap-1">
              <Input
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value)}
                maxLength={6}
                className="h-7 w-20 text-sm"
              />
              <Button size="sm" variant="ghost" onClick={savePincode} className="h-7 px-2">OK</Button>
            </div>
          ) : (
            <button onClick={() => setEditingPin(true)} className="text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">Deliver to</div>
              <div className="text-sm font-medium leading-tight">{pincode}</div>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Doctor, disease, symptoms…"
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value;
                navigate(q ? `/doctors?q=${encodeURIComponent(q)}` : "/doctors");
              }
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Saved medicines">
            <Link to="/dashboard/saved-medicines"><BookmarkCheck className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <span className="grid h-8 w-8 place-items-center rounded-full gradient-leaf text-xs font-semibold text-primary-foreground">
                  {initials}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{name || "Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/dashboard/profile"><User className="mr-2 h-4 w-4" />My Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/appointments"><Calendar className="mr-2 h-4 w-4" />My Appointments</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/saved-medicines"><Pill className="mr-2 h-4 w-4" />Saved Medicines</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/health-locker"><FileText className="mr-2 h-4 w-4" />Health Locker</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/saved-posts"><BookmarkCheck className="mr-2 h-4 w-4" />Saved Posts</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/orders"><FileText className="mr-2 h-4 w-4" />My Orders</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/addresses"><MapPin className="mr-2 h-4 w-4" />My Addresses</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/wallet"><Wallet className="mr-2 h-4 w-4" />Ayuzee Money</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/bank"><CreditCard className="mr-2 h-4 w-4" />Bank Details</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/referral"><Users className="mr-2 h-4 w-4" />Refer & Earn</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/help"><HelpCircle className="mr-2 h-4 w-4" />Help & Support</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
