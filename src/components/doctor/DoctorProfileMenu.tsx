import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  ShoppingBag,
  ClipboardList,
  Bookmark,
  Wallet,
  MapPin,
  Landmark,
  Gift,
  Building2,
  LayoutGrid,
} from "lucide-react";

const items = [
  { to: "/doctor/profile", label: "My Profile", icon: User },
  { to: "/doctor/orders", label: "My Orders", icon: ShoppingBag },
  { to: "/doctor/medicines", label: "My Medicine List", icon: ClipboardList },
  { to: "/doctor/saved-posts", label: "Saved Posts", icon: Bookmark },
  { to: "/doctor/money", label: "Nirog Money", icon: Wallet },
  { to: "/doctor/addresses", label: "My Addresses", icon: MapPin },
  { to: "/doctor/bank", label: "Bank Details", icon: Landmark },
  { to: "/doctor/rewards", label: "My Rewards", icon: Gift },
  { to: "/doctor/clinic", label: "My Clinic", icon: Building2 },
  { to: "/doctor/category", label: "Category", icon: LayoutGrid },
];

interface Props {
  fullName?: string;
  avatarUrl?: string | null;
}

export const DoctorProfileMenu = ({ fullName, avatarUrl }: Props) => {
  const initials = (fullName ?? "Dr")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
          <AvatarImage src={avatarUrl || undefined} alt={fullName} />
          <AvatarFallback className="bg-accent text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium text-primary md:inline">Profile</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-display">{fullName ?? "Doctor"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.to} asChild>
            <Link to={item.to} className="flex items-center gap-3 py-2.5">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
