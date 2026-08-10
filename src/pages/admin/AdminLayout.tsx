import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ADMIN_ROLES = [
  "admin", "product_admin", "orders_admin", "accounts_admin",
  "doctor_admin", "content_admin", "ayush_admin", "support_admin",
] as const;
type AdminRole = typeof ADMIN_ROLES[number];

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Super Admin",
  product_admin: "Product Admin",
  orders_admin: "Orders Admin",
  accounts_admin: "Accounts Admin",
  doctor_admin: "Doctor Admin",
  content_admin: "Content Admin",
  ayush_admin: "AYUSH Admin",
  support_admin: "Support Admin",
};

const allGroups = [
  { label: "Overview", roles: ["admin"] as AdminRole[], items: [
    { title: "🏠 Dashboard", url: "/admin", end: true },
    { title: "🗺️ Super App Roadmap", url: "/admin/roadmap" },
  ]},
  { label: "User Management", roles: ["admin","doctor_admin","support_admin"] as AdminRole[], items: [
    { title: "🏢 Team Management", url: "/admin/team" },
    { title: "👥 All Users", url: "/admin/users" },
    { title: "🩺 Doctors", url: "/admin/doctors" },
    { title: "🤲 Therapists", url: "/admin/therapists" },
    { title: "🏥 Venues", url: "/admin/venues" },
    { title: "🌿 Panchakarma Ops", url: "/admin/panchakarma" },
    { title: "🎓 Students", url: "/admin/students" },
  ]},
  { label: "Operations", roles: ["admin","orders_admin"] as AdminRole[], items: [
    { title: "📅 Appointments", url: "/admin/appointments" },
    { title: "🫙 Therapy Sessions", url: "/admin/sessions" },
    { title: "📦 Orders", url: "/admin/orders" },
    { title: "💊 Prescription Orders", url: "/admin/prescriptions" },
  ]},
  { label: "Content & Store", roles: ["admin","product_admin","content_admin"] as AdminRole[], items: [
    { title: "🌿 Therapies Catalog", url: "/admin/therapies" },
    { title: "📚 Learning & Webinars", url: "/admin/learning" },
    { title: "🛒 Products / Store", url: "/admin/products" },
    { title: "✅ Product Approvals", url: "/admin/products/approvals" },
    { title: "🏭 Manufacturer Approvals", url: "/admin/manufacturers/approvals" },
    { title: "📝 Blogs & Content", url: "/admin/blogs" },
    { title: "💼 Jobs Board", url: "/admin/jobs" },
  ]},
  { label: "Finance", roles: ["admin","accounts_admin"] as AdminRole[], items: [
    { title: "💰 Commissions & Payouts", url: "/admin/commissions" },
    { title: "📐 Commission Rules", url: "/admin/commission-rules" },
    { title: "💸 Payout Requests", url: "/admin/payouts" },
    { title: "💳 Payments & Transactions", url: "/admin/payments" },
    { title: "📊 Reports & Analytics", url: "/admin/reports" },
  ]},
  { label: "❤️ AYUSH Help", roles: ["admin","ayush_admin"] as AdminRole[], items: [
    { title: "🌿 ATMRI Model 3", url: "/admin/atmri-help" },
  ]},
  { label: "⚡ HMS Tools Ultra", roles: ["admin"] as AdminRole[], items: [
    { title: "🛡️ HMS Access", url: "/admin/hms-access" },
    { title: "⚙️ Master Management", url: "/admin/master-management" },
    { title: "💊 Pharmacy Orders", url: "/admin/pharmacy-orders" },
    { title: "🛏️ IP Admissions", url: "/admin/ip-admissions" },
    { title: "🏥 Ward Status", url: "/admin/ward-status" },
  ]},
  { label: "Safety & Config", roles: ["admin","ayush_admin"] as AdminRole[], items: [
    { title: "🚨 Safety Flags", url: "/admin/safety" },
    { title: "🔔 Notifications", url: "/admin/notifications" },
    { title: "⚙️ Settings", url: "/admin/settings" },
    { title: "📋 Task Tracker", url: "/task-tracker" },
  ]},
];




const AdminLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("admin");

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Sign in required");
        navigate("/admin/auth", { replace: true });
        return;
      }
      const uid = data.session.user.id;
      const roleChecks = await Promise.all(
        ADMIN_ROLES.map(r =>
          supabase.rpc("has_role", { _user_id: uid, _role: r as any })
            .then(({ data }) => (data ? r : null))
        )
      );
      const userAdminRole = roleChecks.find((r): r is AdminRole => r !== null);
      if (!userAdminRole) {
        toast.error("Access denied");
        navigate("/admin/auth", { replace: true });
        return;
      }
      if (active) {
        setAdminRole(userAdminRole);
        setEmail(data.session.user.email ?? "Admin user");
        setChecking(false);
      }
    };
    verify();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/auth", { replace: true });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const initials = useMemo(() => email.slice(0, 2).toUpperCase(), [email]);

  const groups = useMemo(() => {
    return allGroups
      .filter(g => g.roles.includes(adminRole))
      .map(g => ({
        label: g.label,
        items: adminRole === "admin"
          ? g.items
          : g.items.filter(item => {
              if (adminRole === "support_admin") return ["/admin/users"].includes(item.url);
              if (adminRole === "doctor_admin") return ["/admin/doctors","/admin/therapists","/admin/venues","/admin/appointments"].includes(item.url);
              return true;
            }),
      }))
      .filter(g => g.items.length > 0);
  }, [adminRole]);

  if (checking) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-admin-sidebar text-admin-sidebar-foreground">
        <div className="border-b border-admin-sidebar-foreground/10 p-5">
          <Link to="/admin" className="flex items-center gap-2 font-display text-xl font-semibold tracking-normal">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-admin-sidebar-accent"><Sparkles className="h-5 w-5" /></span>
            Ayuzee
          </Link>
          <Badge className="mt-3 border-transparent bg-admin-danger text-destructive-foreground hover:bg-admin-danger">
            {ROLE_LABELS[adminRole]}
          </Badge>
        </div>
        <div className="border-b border-admin-sidebar-foreground/10 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-admin-sidebar-foreground/10 text-sm font-semibold">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{email}</p>
              <p className="text-xs text-admin-sidebar-muted">{ROLE_LABELS[adminRole]}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-admin-sidebar-muted">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item: any) => (
                  <NavLink key={item.url} to={item.url} end={item.end} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-admin-sidebar-accent text-primary-foreground" : "text-admin-sidebar-muted hover:bg-admin-sidebar-foreground/10 hover:text-admin-sidebar-foreground"}`}>
                    {item.title}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-admin-sidebar-foreground/10">
          <Link to="/" className="block p-5 pb-2 text-sm text-admin-sidebar-muted hover:text-admin-sidebar-foreground">← Back to main site</Link>
          <Link to="/login" className="block px-5 pb-5 text-sm text-admin-sidebar-muted hover:text-admin-sidebar-foreground">⇄ Switch Portal</Link>
        </div>
      </aside>
      <main className="ml-64 min-h-screen p-6 lg:p-8"><Outlet /></main>
    </div>
  );
};

export default AdminLayout;
