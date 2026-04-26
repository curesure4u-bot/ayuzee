import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, LayoutDashboard, UserPlus, ClipboardList, Search, BookOpen, CalendarCheck, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

const nav = [
  { to: "/homeo", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/homeo/patients/new", label: "New Patient", icon: UserPlus },
  { to: "/homeo/case-taking", label: "Case Taking", icon: ClipboardList },
  { to: "/homeo/repertory", label: "Repertory", icon: Search },
  { to: "/homeo/materia-medica", label: "Materia Medica", icon: BookOpen },
  { to: "/homeo/follow-up", label: "Follow Up", icon: CalendarCheck },
  { to: "/homeo/reports", label: "Reports", icon: FileText },
];

const HomeoLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"doctor" | "admin" | null>(null);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Sign in to access Ayuzee Homeo AI");
        navigate("/doctor/auth", { replace: true });
        return;
      }
      const uid = data.session.user.id;
      const [doc, adm] = await Promise.all([
        supabase.rpc("has_role", { _user_id: uid, _role: "doctor" }),
        supabase.rpc("has_role", { _user_id: uid, _role: "admin" }),
      ]);
      const isDoctor = !!doc.data;
      const isAdmin = !!adm.data;
      if (!isDoctor && !isAdmin) {
        toast.error("Doctors only — please sign in with a doctor account");
        navigate("/doctor/auth", { replace: true });
        return;
      }
      if (active) {
        setEmail(data.session.user.email ?? "");
        setRole(isAdmin ? "admin" : "doctor");
        setChecking(false);
      }
    };
    verify();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/doctor/auth", { replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[hsl(160_25%_6%)]">
        <Loader2 className="h-7 w-7 animate-spin text-[hsl(45_85%_60%)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(160_25%_6%)] text-[hsl(45_30%_94%)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[hsl(45_40%_55%/0.15)] bg-[hsl(160_30%_4%)] md:flex">
        <div className="border-b border-[hsl(45_40%_55%/0.15)] p-5">
          <Link to="/homeo" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[hsl(142_60%_38%)] to-[hsl(45_85%_55%)]">
              <Sparkles className="h-5 w-5 text-[hsl(160_30%_4%)]" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-[hsl(45_85%_70%)]">
                Ayuzee Homeo
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(45_40%_55%/0.7)]">
                AI Repertory · Case AI
              </p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[hsl(142_55%_30%/0.4)] to-[hsl(45_85%_55%/0.15)] text-[hsl(45_85%_75%)] shadow-[inset_0_0_0_1px_hsl(45_85%_55%/0.25)]"
                    : "text-[hsl(45_15%_75%)] hover:bg-[hsl(45_85%_55%/0.08)] hover:text-[hsl(45_85%_75%)]"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[hsl(45_40%_55%/0.15)] p-4 text-xs text-[hsl(45_15%_70%)]">
          <p className="truncate">{email}</p>
          <p className="mt-1 inline-block rounded bg-[hsl(142_55%_30%/0.4)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[hsl(45_85%_70%)]">
            {role}
          </p>
          <div className="mt-3 space-y-1">
            <Link to="/doctor" className="block text-[hsl(45_40%_55%/0.7)] hover:text-[hsl(45_85%_70%)]">
              ← Doctor portal
            </Link>
            <button onClick={signOut} className="flex items-center gap-2 text-[hsl(45_40%_55%/0.7)] hover:text-[hsl(45_85%_70%)]">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="md:ml-64 min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[hsl(45_40%_55%/0.15)] bg-[hsl(160_30%_4%/0.85)] px-6 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[hsl(45_85%_60%/0.7)]">
              Premium Homeopathy Suite
            </p>
            <h1 className="font-display text-xl font-semibold text-[hsl(45_85%_75%)]">Ayuzee Homeo AI</h1>
          </div>
          <Button asChild size="sm" className="bg-gradient-to-r from-[hsl(142_55%_38%)] to-[hsl(45_85%_55%)] text-[hsl(160_30%_4%)] hover:brightness-110">
            <Link to="/homeo/patients/new">+ New Patient</Link>
          </Button>
        </header>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HomeoLayout;
