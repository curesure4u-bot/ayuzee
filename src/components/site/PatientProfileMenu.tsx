import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  LayoutDashboard,
} from "lucide-react";

interface ProfileLite {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export const PatientProfileMenu = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id;
      setSession(!!uid);
      if (uid) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, email")
          .eq("user_id", uid)
          .maybeSingle();
        setProfile((p as ProfileLite) ?? { full_name: data.session!.user.email ?? null, avatar_url: null, email: data.session!.user.email ?? null });
      }
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === null) return null;
  if (!session) {
    return (
      <>
        <Button variant="ghost" asChild className="hidden sm:inline-flex">
          <Link to="/login">Sign in</Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/login">Sign up</Link>
        </Button>
      </>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const initials = (profile?.full_name || profile?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/profile", label: "My Profile", icon: User },
    { to: "/dashboard/appointments", label: "My Appointments", icon: Calendar },
    { to: "/dashboard/saved-medicines", label: "Saved Medicines", icon: Pill },
    { to: "/dashboard/saved-posts", label: "Saved Posts", icon: BookmarkCheck },
    { to: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
    { to: "/dashboard/addresses", label: "My Addresses", icon: MapPin },
    { to: "/dashboard/wallet", label: "Ayuzee Money", icon: Wallet },
    { to: "/dashboard/bank", label: "Bank Details", icon: CreditCard },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-accent" aria-label="Profile menu">
          <Avatar className="h-9 w-9 border border-border">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "User"} />}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{profile?.full_name || "Welcome"}</span>
          {profile?.email && <span className="truncate text-xs font-normal text-muted-foreground">{profile.email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it) => (
          <DropdownMenuItem key={it.to} asChild>
            <Link to={it.to} className="flex items-center gap-2 cursor-pointer">
              <it.icon className="h-4 w-4 text-muted-foreground" />
              {it.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
