import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  User,
  ShoppingCart,
  ListChecks,
  Bookmark,
  Wallet,
  MapPin,
  Landmark,
  Gift,
  Home,
  LayoutGrid,
  Building2,
  Headphones,
  CalendarDays,
  Users,
  MessageSquareHeart,
  ClipboardList,
  HandCoins,
  Handshake,
  Package,
  Stethoscope,
  Newspaper,
  PenSquare,
} from "lucide-react";

const items = [
  { title: "Home", url: "/doctor", icon: Home, end: true },
  { title: "My Profile", url: "/doctor/profile", icon: User },
  { title: "Appointment Calendar", url: "/doctor/appointments", icon: CalendarDays },
  { title: "My Patients", url: "/doctor/patients", icon: Users },
  { title: "Patient Feedback", url: "/doctor/feedback", icon: MessageSquareHeart },
  { title: "Patient Orders", url: "/doctor/patient-orders", icon: ClipboardList },
  { title: "Bulk Purchase", url: "/bulk", icon: Package },
  { title: "Ayush HMS Tool", url: "/vaidya", icon: Stethoscope },
  { title: "My Orders", url: "/doctor/orders", icon: ShoppingCart },
  { title: "My Medicine List", url: "/doctor/medicines", icon: ListChecks },
  { title: "Saved Posts", url: "/doctor/saved", icon: Bookmark },
  { title: "My Feed Posts", url: "/doctor/feed", icon: PenSquare },
  { title: "My Health Blogs", url: "/doctor/blogs", icon: Newspaper },
  { title: "Ayuzee Money", url: "/doctor/ayuzee-money", icon: Wallet },
  { title: "My Addresses", url: "/doctor/addresses", icon: MapPin },
  { title: "Bank Details", url: "/doctor/bank", icon: Landmark },
  { title: "My Rewards", url: "/doctor/rewards", icon: Gift },
  { title: "My Clinic", url: "/doctor/clinic", icon: Home },
  { title: "Category", url: "/doctor/category", icon: LayoutGrid },
  { title: "Company", url: "/doctor/company", icon: Building2 },
  { title: "Payouts", url: "/doctor/payouts", icon: HandCoins },
  { title: "About Ayuzee Partner", url: "/doctor/about-partner", icon: Handshake },
  { title: "Support", url: "/doctor/support", icon: Headphones },
];

export function DoctorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Doctor Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-muted/50"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
