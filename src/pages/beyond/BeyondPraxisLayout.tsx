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
import { isHeroAdminEmail } from "@/services/heroAdmin";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const beyondLinks = [
  { to: "/beyond", label: "Dashboard", icon: Home, end: true },
  { to: "/beyond/wheel-of-life", label: "Wheel of Life", icon: Target },
  // ── Learn & Grow ──
  { to: "/beyond/academy", label: "Academy", icon: GraduationCap },
  { to: "/beyond/pathways", label: "Guided Pathways", icon: Rocket },
  { to: "/beyond/books", label: "Book Library", icon: BookOpen },
  { to: "/beyond/micro-learning", label: "Micro-Learning", icon: Zap },
  { to: "/beyond/ai-companion", label: "AI Companion", icon: Brain },
  // ── Coaching & Events ──
  { to: "/beyond/coaching", label: "Coaching Cohorts", icon: Users },
  { to: "/beyond/events", label: "Events & Webinars", icon: Radio },
  // ── Tools ──
  { to: "/beyond/time-management", label: "Time Management", icon: Timer },
  { to: "/beyond/leadership", label: "Leadership Lab", icon: Compass },
  { to: "/beyond/wellness", label: "Wellness Hub", icon: Heart },
  { to: "/beyond/finance", label: "Finance Toolkit", icon: Coins },
  { to: "/beyond/writing", label: "Writer's Studio", icon: PenTool },
  { to: "/beyond/side-income", label: "Side Income", icon: Coins },
  { to: "/beyond/teaching", label: "Teaching Toolkit", icon: BookOpen },
  { to: "/beyond/legal", label: "Legal Shield", icon: Heart },
  { to: "/beyond/career", label: "Career Navigator", icon: PieChart },
  { to: "/beyond/journal", label: "Journal", icon: PenTool },
  { to: "/beyond/planner", label: "Life Planner", icon: Target },
  { to: "/beyond/habits", label: "Habit Tracker", icon: Activity },
  // ── Challenges & Social ──
  { to: "/beyond/challenges", label: "Challenges", icon: Flame },
  { to: "/beyond/101-challenges", label: "101 Challenges", icon: Flame },
  { to: "/beyond/community", label: "Community", icon: Users },
  { to: "/beyond/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/beyond/badges", label: "My Badges", icon: Award },
  // ── Store & Membership ──
  { to: "/beyond/store", label: "Digital Store", icon: ShoppingBag },
  { to: "/beyond/membership", label: "Membership", icon: Crown },
  // ── Settings ──
  { to: "/beyond/profile", label: "My Profile", icon: Settings },
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

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        // Hero Admin bypass — allow access even without beyond-specific profile
        const email = sessionData.session?.user.email;
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

      if (!active) return;

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
          {beyondLinks.map((item) => (
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
