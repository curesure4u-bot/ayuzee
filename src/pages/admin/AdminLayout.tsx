import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const productAdminGroups = [
  {
    label: "Store Management",
    items: [
      { title: "🛒 Products / Store", url: "/admin/products" },
      { title: "📝 Blogs & Content", url: "/admin/blogs" },
    ],
  },
];

const adminGroups = [
  { label: "Overview", items: [{ title: "🏠 Dashboard", url: "/admin", end: true }, { title: "🗺️ Super App Roadmap", url: "/admin/roadmap" }] },
  { label: "User Management", items: [{ title: "👥 All Users", url: "/admin/users" }, { title: "🩺 Doctors", url: "/admin/doctors" }, { title: "🤲 Therapists", url: "/admin/therapists" }, { title: "🏥 Venues", url: "/admin/venues" }, { title: "🎓 Students", url: "/admin/students" }] },
  { label: "Operations", items: [{ title: "📅 Appointments", url: "/admin/appointments" }, { title: "🫙 Therapy Sessions", url: "/admin/sessions" }, { title: "📦 Orders", url: "/admin/orders" }, { title: "💊 Prescription Orders", url: "/admin/prescriptions" }] },
  { label: "Content & Store", items: [{ title: "🌿 Therapies Catalog", url: "/admin/therapies" }, { title: "📚 Learning & Webinars", url: "/admin/learning" }, { title: "🛒 Products / Store", url: "/admin/products" }, { title: "📝 Blogs & Content", url: "/admin/blogs" }, { title: "💼 Jobs Board", url: "/admin/jobs" }] },
  { label: "Finance", items: [{ title: "💰 Commissions & Payouts", url: "/admin/commissions" }, { title: "💳 Payments & Transactions", url: "/admin/payments" }, { title: "📊 Reports & Analytics", url: "/admin/reports" }] },
  { label: "❤️ AYUSH Help", items: [{ title: "🌿 ATMRI Model 3", url: "/admin/atmri-help" }] },
  { label: "Safety & Config", items: [{ title: "🚨 Safety Flags", url: "/admin/safety" }, { title: "🔔 Notifications", url: "/admin/notifications" }, { title: "⚙️ Settings", url: "/admin/settings" }] },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "product_admin" | null>(null);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Sign in required");
        navigate("/admin/auth", { replace: true });
        return;
      }
      const [{ data: isAdmin }, { data: isProductAdmin }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: data.session.user.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: data.session.user.id, _role: "product_admin" as any }),
      ]);
      if (!isAdmin && !isProductAdmin) {
        toast.error("Access denied");
        navigate("/admin/auth", { replace: true });
        return;
      }
      if (active) {
        setUserRole(isAdmin ? "admin" : "product_admin");
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
  const groups = userRole === "product_admin" ? productAdminGroups : adminGroups;

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
            {userRole === "product_admin" ? "Product Admin" : "Super Admin"}
          </Badge>
        </div>
        <div className="border-b border-admin-sidebar-foreground/10 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-admin-sidebar-foreground/10 text-sm font-semibold">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{email}</p>
              <p className="text-xs text-admin-sidebar-muted">{userRole === "product_admin" ? "Product Admin" : "Admin"}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => <div key={group.label} className="mb-5"><p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-admin-sidebar-muted">{group.label}</p><div className="space-y-1">{group.items.map((item: any) => <NavLink key={item.url} to={item.url} end={item.end} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-admin-sidebar-accent text-primary-foreground" : "text-admin-sidebar-muted hover:bg-admin-sidebar-foreground/10 hover:text-admin-sidebar-foreground"}`}>{item.title}</NavLink>)}</div></div>)}
        </nav>
        <div className="border-t border-admin-sidebar-foreground/10">
          <Link to="/" className="block p-5 pb-2 text-sm text-admin-sidebar-muted hover:text-admin-sidebar-foreground">← Back to main site</Link>
          <Link to="/login-picker" className="block px-5 pb-5 text-sm text-admin-sidebar-muted hover:text-admin-sidebar-foreground">⇄ Switch Portal</Link>
        </div>
      </aside>
      <main className="ml-64 min-h-screen p-6 lg:p-8"><Outlet /></main>
    </div>
  );
};

export default AdminLayout;
