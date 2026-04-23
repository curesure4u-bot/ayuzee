import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Stethoscope, CalendarCheck, ShoppingBag,
  Package, Percent, Video, FileText, Bell, CreditCard, GraduationCap, Sparkles, HeartPulse, PhoneCall, Layers, Crown,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Appointments", url: "/admin/appointments", icon: CalendarCheck },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Commissions", url: "/admin/commissions", icon: Percent },
  { title: "Webinars", url: "/admin/webinars", icon: Video },
  { title: "Blogs", url: "/admin/blogs", icon: FileText },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
];

const contentItems = [
  { title: "Therapies", url: "/admin/therapies", icon: Sparkles },
  { title: "Learning", url: "/admin/learning", icon: GraduationCap },
  { title: "Health Conditions", url: "/admin/health-conditions", icon: HeartPulse },
  { title: "Treatment Systems", url: "/admin/treatment-systems", icon: Layers },
  { title: "Condition Leads", url: "/admin/condition-leads", icon: PhoneCall },
];

const governanceItems = [
  { title: "Admin Management", url: "/admin/admins", icon: Crown },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderItem = (item: typeof items[number]) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={item.end ? location.pathname === item.url : location.pathname.startsWith(item.url)}>
        <NavLink to={item.url} end={item.end}>
          <item.icon className="h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{contentItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Governance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{governanceItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
