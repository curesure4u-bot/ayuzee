import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Coins,
  Compass,
  Crown,
  Flame,
  GraduationCap,
  Heart,
  Home,
  Lock,
  Loader2,
  PenTool,
  PieChart,
  Radio,
  Rocket,
  Settings,
  ShoppingBag,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isHeroAdminEmail, SUPER_ADMIN_EMAILS } from "@/services/heroAdmin";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// minTier: 0 = free (everyone), 1 = pro, 2 = elite, -1 = admin only
const beyondLinks = [
  { to: "/beyond", label: "Dashboard", icon: Home, end: true, minTier: 0 },
  { to: "/beyond/wheel-of-life", label: "Wheel of Life", icon: Target, minTier: 0 },
  // ── Learn & Grow (Pro+) ──
  { to: "/beyond/academy", label: "Academy", icon: GraduationCap, minTier: 1 },
  { to: "/beyond/pathways", label: "Guided Pathways", icon: Rocket, minTier: 0 },
  { to: "/beyond/books", label: "Book Library", icon: BookOpen, minTier: 0 },
  { to: "/beyond/micro-learning", label: "Micro-Learning", icon: Zap, minTier: 0 },
  { to: "/beyond/ai-companion", label: "AI Companion", icon: Brain, minTier: 1 },
  // ── Coaching & Events (Pro+) ──
  { to: "/beyond/coaching", label: "Coaching Cohorts", icon: Users, minTier: 1 },
  { to: "/beyond/events", label: "Events & Webinars", icon: Radio, minTier: 1 },
  // ── Tools (Free) ──
  { to: "/beyond/time-management", label: "Time Management", icon: Timer, minTier: 0 },
  { to: "/beyond/leadership", label: "Leadership Lab", icon: Compass, minTier: 0 },
  { to: "/beyond/wellness", label: "Wellness Hub", icon: Heart, minTier: 0 },
  { to: "/beyond/finance", label: "Finance Toolkit", icon: Coins, minTier: 0 },
  { to: "/beyond/writing", label: "Writer's Studio", icon: PenTool, minTier: 0 },
  { to: "/beyond/side-income", label: "Side Income", icon: Coins, minTier: 0 },
  { to: "/beyond/teaching", label: "Teaching Toolkit", icon: BookOpen, minTier: 0 },
  { to: "/beyond/legal", label: "Legal Shield", icon: Heart, minTier: 0 },
  { to: "/beyond/career", label: "Career Navigator", icon: PieChart, minTier: 0 },
  { to: "/beyond/journal", label: "Journal", icon: PenTool, minTier: 0 },
  { to: "/beyond/planner", label: "Life Planner", icon: Target, minTier: 0 },
  { to: "/beyond/habits", label: "Habit Tracker", icon: Activity, minTier: 0 },
  // ── Challenges & Social ──
  { to: "/beyond/challenges", label: "Challenges", icon: Flame, minTier: 0 },
  { to: "/beyond/101-challenges", label: "101 Challenges", icon: Flame, minTier: 0 },
  { to: "/beyond/community", label: "Community", icon: Users, minTier: 0 },
  { to: "/beyond/leaderboard", label: "Leaderboard", icon: Trophy, minTier: 0 },
  { to: "/beyond/badges", label: "My Badges", icon: Award, minTier: 0 },
  // ── Store & Membership ──
  { to: "/beyond/store", label: "Digital Store", icon: ShoppingBag, minTier: 1 },
  { to: "/beyond/membership", label: "Membership", icon: Crown, minTier: 0 },
  // ── Settings ──
  { to: "/beyond/profile", label: "My Profile", icon: Settings, minTier: 0 },
  { to: "/beyond/hero-admin", label: "Hero Admin", icon: Crown, minTier: -1 },
];

const initials = (name?: string) =>
  (name || "Praxis User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const BeyondPraxisLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; career_stage: string; current_level: number; total_xp: number; level_title: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<number>(0); // 0=free, 1=pro, 2=elite

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      const email = sessionData.session?.user.email || null;

      if (!active) return;
      setUserEmail(email);

      if (!userId) {
        // Hero Admin bypass — allow access even without beyond-specific profile
        if (!isHeroAdminEmail(email)) {
          navigate("/beyond/landing", { replace: true });
          return;
        }
      }

      // Try to load beyond profile
      const { data: beyondProfile } = await (supabase as any)
        .from("beyond_profiles")
        .select("full_name, career_stage")
        .eq("user_id", userId)
        .maybeSingle();

      const { data: xpData } = await (supabase as any)
        .from("beyond_user_xp")
        .select("total_xp, current_level, level_title")
        .eq("user_id", userId)
        .maybeSingle();

      // Load membership tier
      const { data: subData } = await (supabase as any)
        .from("beyond_membership_subscriptions")
        .select("plan_slug")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (!active) return;

      const tierMap: Record<string, number> = { free: 0, pro: 1, elite: 2 };
      setUserTier(subData ? (tierMap[subData.plan_slug] ?? 0) : 0);

      setProfile({
        full_name: beyondProfile?.full_name || sessionData.session?.user.email?.split("@")[0] || "Praxis User",
        career_stage: beyondProfile?.career_stage || "student",
        current_level: xpData?.current_level || 1,
        total_xp: xpData?.total_xp || 0,
        level_title: xpData?.level_title || "Intern",
      });
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth", { replace: true });
    });

    loadProfile();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate XP progress percentage for current level
  const levelThresholds = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 55000, 80000];
  const currentLevelIdx = (profile?.current_level || 1) - 1;
  const currentThreshold = levelThresholds[currentLevelIdx] || 0;
  const nextThreshold = levelThresholds[currentLevelIdx + 1] || 80000;
  const xpInLevel = (profile?.total_xp || 0) - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progressPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  // Filter sidebar links based on membership tier + admin status
  const isAdmin = isHeroAdminEmail(userEmail);
  const visibleLinks = beyondLinks.filter((item) => {
    if (isAdmin) return true; // Admins see everything
    if (item.minTier < 0) return false; // Admin-only items hidden from non-admins
    return userTier >= item.minTier;
  });

  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-20 flex h-auto flex-col border-b border-border bg-card/95 px-4 py-4 shadow-soft backdrop-blur lg:h-screen lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <Link to="/beyond" className="flex items-center gap-3 px-2 font-display text-xl font-semibold">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Zap className="h-5 w-5" />
          </span>
          Beyond.Praxis
        </Link>

        {/* XP Progress Bar */}
        <div className="mt-4 rounded-xl bg-muted/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Level {profile?.current_level}</span>
            <span className="text-muted-foreground">{profile?.total_xp} XP</span>
          </div>
          <Progress value={progressPct} className="mt-1.5 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">{profile?.level_title}</p>
        </div>

        <nav className="mt-4 grid gap-0.5 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-col">
          {visibleLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-accent-foreground"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Separator className="my-4 hidden lg:block" />
        <div className="hidden lg:flex flex-col gap-1">
          <Button variant="ghost" size="sm" asChild className="justify-start text-muted-foreground">
            <Link to="/login">⇄ Switch Portal</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="justify-start text-muted-foreground">
            <a href="https://www.instagram.com/beyond.praxis/" target="_blank" rel="noopener noreferrer">📸 @beyond.praxis</a>
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/60 p-3 lg:mt-0">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              {initials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile?.full_name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs capitalize">{profile?.career_stage?.replace("_", " ")}</Badge>
              <Badge variant="secondary" className="text-xs">
                <Activity className="mr-1 h-3 w-3" />
                Lv.{profile?.current_level}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default BeyondPraxisLayout;
