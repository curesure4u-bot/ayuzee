import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Building2, Coins, Wallet,
  Settings, PackageCheck, CreditCard, Link2, BookOpen, BarChart3,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard",              url: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { title: "User Management",        url: "/admin/users",     icon: Users },
  { title: "Products",               url: "/admin/products",  icon: Package },
  { title: "Product Approvals",      url: "/admin/products/approvals", icon: PackageCheck },
  { title: "Manufacturer Approvals", url: "/admin/manufacturers/approvals", icon: Building2 },
  { title: "Commission Rules",       url: "/admin/commission-rules", icon: Coins },
  { title: "Payout Requests",        url: "/admin/payouts",   icon: CreditCard },
  { title: "Payments",               url: "/admin/payments",  icon: Wallet },
  { title: "Backlink Monitor",       url: "/admin/backlinks", icon: Link2 },
  { title: "ASTG Content",           url: "/admin/astg-management", icon: BookOpen },
  { title: "Platform Settings",      url: "/admin/settings",  icon: Settings },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.end
                  ? pathname === item.url
                  : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end={item.end} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-emerald-500" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
