import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
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
  HeartHandshake,
  Pill,
  Sparkles,
  Briefcase,
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
  { title: "HMS ↔ Ayuzee Bridge", url: "/hms/bridge", icon: Stethoscope },
  { title: "Gut Health Queue", url: "/doctor/gut-health-queue", icon: HeartHandshake },
  { title: "Self-Assessment Reviews", url: "/doctor/self-assessment-queue", icon: ClipboardList },
  { title: "Para-Surgical AI", url: "/vaidya/parasurgical", icon: Sparkles },
  { title: "ASTG Reference", url: "/doctor/astg-reference", icon: ClipboardList },
  { title: "ASTG Bookmarks", url: "/doctor/astg-bookmarks", icon: Bookmark },
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
  { title: "AYUSH Jobs Board", url: "/jobs", icon: Briefcase },
  { title: "Post a Job / Hire Staff", url: "/jobs/post", icon: Briefcase },
  { title: "Support", url: "/doctor/support", icon: Headphones },
];

export function DoctorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [pendingSignatureCount, setPendingSignatureCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { count } = await supabase
        .from("atmri_sponsored_cases")
        .select("id", { count: "exact", head: true })
        .eq("assigned_doctor_user_id", uid)
        .eq("doctor_countersigned", false)
        .in("status", ["doctor_assigned", "approved"]);
      if (mounted) setPendingSignatureCount(count ?? 0);
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

        <SidebarGroup>
          <SidebarGroupLabel>Homeopathy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/homeo"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Pill className="mr-2 h-4 w-4" />
                    {!collapsed && <span>💊 Homeo Console</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/homeo/case-form"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    {!collapsed && <span>New Case</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/homeo/repertorisation"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Repertorisation</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/homeo/materia-medica"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Newspaper className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Materia Medica</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ATMRI Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/atmri-help/pledge"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    {!collapsed && <span className="flex-1">❤️ ATMRI Help</span>}
                    {pendingSignatureCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                        {pendingSignatureCount}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Clinical Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/doctor/formulary"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Pill className="mr-2 h-4 w-4" />
                    {!collapsed && <span>💊 Formulary</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/doctor/formulary/ingredients"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Newspaper className="mr-2 h-4 w-4" />
                    {!collapsed && <span>📖 Ingredients</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/doctor/afi-formulary"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Pill className="mr-2 h-4 w-4" />
                    {!collapsed && <span>📚 AFI Formulary</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/doctor/afi-formulary/disease-index"
                    className="hover:bg-muted/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    {!collapsed && <span>🔎 Disease Index</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
