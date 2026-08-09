import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Crown,
  GraduationCap,
  LayoutDashboard,
  Rocket,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { HERO_ADMIN_EMAIL, isHeroAdminEmail } from "@/services/heroAdmin";

const BEYOND_MODULES = [
  { path: "/beyond", label: "Dashboard" },
  { path: "/beyond/wheel-of-life", label: "Wheel of Life" },
  { path: "/beyond/time-management", label: "Time Management" },
  { path: "/beyond/leadership", label: "Leadership Lab" },
  { path: "/beyond/pathways", label: "Guided Pathways" },
  { path: "/beyond/books", label: "Book Library" },
  { path: "/beyond/wellness", label: "Wellness Hub" },
  { path: "/beyond/finance", label: "Finance Toolkit" },
  { path: "/beyond/writing", label: "Writer's Studio" },
  { path: "/beyond/career", label: "Career Navigator" },
  { path: "/beyond/journal", label: "Journal" },
  { path: "/beyond/planner", label: "Life Planner" },
  { path: "/beyond/101-challenges", label: "101 Challenges" },
  { path: "/beyond/habits", label: "Habit Tracker" },
  { path: "/beyond/micro-learning", label: "Micro-Learning" },
  { path: "/beyond/challenges", label: "Challenges" },
  { path: "/beyond/leaderboard", label: "Leaderboard" },
  { path: "/beyond/badges", label: "My Badges" },
  { path: "/beyond/community", label: "Community" },
  { path: "/beyond/profile", label: "Profile" },
];

const STUDENT_MODULES = [
  { path: "/student", label: "Student Dashboard" },
  { path: "/student/daily-quiz", label: "Daily Quiz" },
  { path: "/student/courses", label: "Courses" },
  { path: "/student/case-studies", label: "Case Studies" },
  { path: "/student/mentorship", label: "Mentorship" },
  { path: "/student/study-planner", label: "Study Planner" },
  { path: "/student/competitions", label: "Competitions" },
  { path: "/student/research-collaboration", label: "Research Collab" },
  { path: "/student/startup-incubator", label: "Startup Incubator" },
  { path: "/student/freelance-gigs", label: "Freelance Gigs" },
  { path: "/student/ask-vaidya", label: "Ask a Vaidya" },
  { path: "/student/study-groups", label: "Study Groups" },
];

const HeroAdmin = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, beyondUsers: 0, studentUsers: 0, totalPosts: 0 });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { navigate("/auth"); return; }
    const email = data.session.user.email;
    setUserEmail(email || "");
    if (!isHeroAdminEmail(email)) {
      navigate("/beyond");
      return;
    }
    setAuthorized(true);
    loadStats();
    setLoading(false);
  };

  const loadStats = async () => {
    const [profilesRes, beyondRes, studentRes, postsRes] = await Promise.all([
      (supabase as any).from("beyond_profiles").select("id", { count: "exact", head: true }),
      (supabase as any).from("beyond_user_xp").select("id", { count: "exact", head: true }),
      (supabase as any).from("beyond_pathway_enrollments").select("id", { count: "exact", head: true }),
      (supabase as any).from("beyond_community_posts").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      totalUsers: profilesRes.count || 0,
      beyondUsers: beyondRes.count || 0,
      studentUsers: studentRes.count || 0,
      totalPosts: postsRes.count || 0,
    });
  };

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><p className="animate-pulse text-muted-foreground">Verifying Hero Admin access...</p></div>;
  if (!authorized) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            Hero Admin
            <Badge className="bg-amber-500 text-white">Jasir Sajidh</Badge>
          </h1>
          <p className="text-xs text-muted-foreground">{userEmail} · Full platform control</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card><CardContent className="p-3 text-center">
          <Users className="mx-auto h-5 w-5 text-blue-500 mb-1" />
          <p className="text-lg font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Zap className="mx-auto h-5 w-5 text-violet-500 mb-1" />
          <p className="text-lg font-bold">{stats.beyondUsers}</p>
          <p className="text-xs text-muted-foreground">Beyond Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <GraduationCap className="mx-auto h-5 w-5 text-green-500 mb-1" />
          <p className="text-lg font-bold">{stats.studentUsers}</p>
          <p className="text-xs text-muted-foreground">Enrollments</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <BookOpen className="mx-auto h-5 w-5 text-pink-500 mb-1" />
          <p className="text-lg font-bold">{stats.totalPosts}</p>
          <p className="text-xs text-muted-foreground">Community Posts</p>
        </CardContent></Card>
      </div>

      {/* Module Access */}
      <Tabs defaultValue="beyond">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beyond"><Rocket className="h-3.5 w-3.5 mr-1" /> Beyond Modules</TabsTrigger>
          <TabsTrigger value="student"><GraduationCap className="h-3.5 w-3.5 mr-1" /> Student Modules</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="beyond" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4 text-violet-500" /> Beyond.Praxis Modules ({BEYOND_MODULES.length})</CardTitle>
              <CardDescription className="text-xs">Direct access to all modules — no auth check needed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {BEYOND_MODULES.map((mod) => (
                  <Link key={mod.path} to={mod.path} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    {mod.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-green-500" /> Student Hub Modules ({STUDENT_MODULES.length})</CardTitle>
              <CardDescription className="text-xs">Access student tools with Hero Admin bypass</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {STUDENT_MODULES.map((mod) => (
                  <Link key={mod.path} to={mod.path} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    {mod.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Hero Admin Access</p>
                <p className="text-xs text-muted-foreground mt-1">Email: {HERO_ADMIN_EMAIL}</p>
                <p className="text-xs text-muted-foreground">Role: Full platform bypass (Beyond + Student)</p>
                <p className="text-xs text-muted-foreground">Instagram: <a href="https://www.instagram.com/beyond.praxis/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@beyond.praxis</a></p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" asChild><Link to="/admin">Main Admin Panel</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/beyond/community">Moderate Community</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/beyond/leaderboard">View Leaderboard</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/student/admin-panel">Student Admin</Link></Button>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Hero Admin Powers</p>
                <ul className="text-xs text-amber-600 dark:text-amber-300 mt-1 space-y-0.5">
                  <li>✓ Bypass login for all Beyond.Praxis modules</li>
                  <li>✓ Bypass student role check for Student Hub</li>
                  <li>✓ View all user data and activity</li>
                  <li>✓ Moderate community posts and replies</li>
                  <li>✓ Manage challenges, badges, and pathways</li>
                  <li>✓ Access platform analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeroAdmin;
