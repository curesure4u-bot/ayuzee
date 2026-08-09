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
  { path: "/beyond/academy", label: "Academy (LMS)" },
  { path: "/beyond/events", label: "Events & Webinars" },
  { path: "/beyond/coaching", label: "Coaching Cohorts" },
  { path: "/beyond/store", label: "Digital Store" },
  { path: "/beyond/membership", label: "Membership Plans" },
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
      <Tabs defaultValue="coaching">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coaching"><Crown className="h-3.5 w-3.5 mr-1" /> Coaching Biz</TabsTrigger>
          <TabsTrigger value="beyond"><Rocket className="h-3.5 w-3.5 mr-1" /> Beyond Modules</TabsTrigger>
          <TabsTrigger value="student"><GraduationCap className="h-3.5 w-3.5 mr-1" /> Student</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Settings</TabsTrigger>
        </TabsList>

        {/* Coaching Business Management */}
        <TabsContent value="coaching" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Coaching Business Manager</CardTitle>
              <CardDescription className="text-xs">Manage courses, events, products, cohorts, and memberships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link to="/beyond/academy" className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent transition-colors">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Academy</p>
                    <p className="text-[10px] text-muted-foreground">Courses, lessons, quizzes</p>
                  </div>
                </Link>
                <Link to="/beyond/events" className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent transition-colors">
                  <LayoutDashboard className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Events</p>
                    <p className="text-[10px] text-muted-foreground">Webinars, workshops</p>
                  </div>
                </Link>
                <Link to="/beyond/coaching" className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent transition-colors">
                  <Users className="h-6 w-6 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium">Cohorts</p>
                    <p className="text-[10px] text-muted-foreground">Group coaching batches</p>
                  </div>
                </Link>
                <Link to="/beyond/store" className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent transition-colors">
                  <BookOpen className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Digital Store</p>
                    <p className="text-[10px] text-muted-foreground">PDFs, templates, bundles</p>
                  </div>
                </Link>
                <Link to="/beyond/membership" className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent transition-colors">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Membership</p>
                    <p className="text-[10px] text-muted-foreground">Free / Pro / Elite plans</p>
                  </div>
                </Link>
                <Link to="/beyond/community" className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent transition-colors">
                  <Users className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Community</p>
                    <p className="text-[10px] text-muted-foreground">Moderate posts & replies</p>
                  </div>
                </Link>
              </div>

              {/* Admin Instructions */}
              <div className="rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 p-4 space-y-2">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">How to Manage Content:</p>
                <ul className="text-xs text-violet-600 dark:text-violet-400 space-y-1">
                  <li>• <strong>Add Course:</strong> In Supabase → beyond_academy_courses → Insert row</li>
                  <li>• <strong>Add Lessons:</strong> In Supabase → beyond_academy_lessons → Insert with course_id</li>
                  <li>• <strong>Create Event:</strong> In Supabase → beyond_events → Insert row (set is_published=true)</li>
                  <li>• <strong>Add Product:</strong> In Supabase → beyond_digital_products → Insert row</li>
                  <li>• <strong>Create Cohort:</strong> In Supabase → beyond_coaching_cohorts → Insert row</li>
                  <li>• <strong>Upgrade User:</strong> In Supabase → beyond_membership_subscriptions → Set plan_slug to "pro" or "elite"</li>
                </ul>
              </div>

              {/* Tier Access Info */}
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold">Access Control Summary:</p>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span>Free Users</span>
                    <span className="text-muted-foreground">Core tools only (Wheel, Wellness, Finance, etc.)</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1">
                    <span>Pro Members</span>
                    <span className="text-muted-foreground">+ Academy, Events, Coaching, Store, AI</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1">
                    <span>Elite Members</span>
                    <span className="text-muted-foreground">+ 1-on-1 coaching, priority support</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-amber-600">Hero Admin (You)</span>
                    <span className="text-amber-600">Full access to everything</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <li>✓ See ALL sidebar modules (bypasses tier check)</li>
                  <li>✓ Create & manage Academy courses/lessons/quizzes</li>
                  <li>✓ Create & manage Events & Webinars</li>
                  <li>✓ Create & manage Digital Store products</li>
                  <li>✓ Create & manage Coaching Cohorts</li>
                  <li>✓ Upgrade/downgrade user memberships</li>
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
