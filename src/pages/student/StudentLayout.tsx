import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import OnboardingWizard from "@/components/OnboardingWizard";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Coins,
  Database,
  Dna,
  Droplets,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  HelpCircle,
  Home,
  Leaf,
  Loader2,
  MessageSquare,
  Newspaper,
  NotebookPen,
  Pill,
  Radio,
  Rocket,
  Settings,
  Shield,
  Stethoscope,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isHeroAdminEmail } from "@/services/heroAdmin";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const studentLinks = [
  { to: "/student", label: "Dashboard", icon: Home, end: true },
  { to: "/student/courses", label: "My Courses", icon: BookOpen },
  { to: "/student/daily-quiz", label: "Daily Quiz", icon: Brain },
  { to: "/student/weekly-challenge", label: "Weekly Challenge", icon: Trophy },
  { to: "/student/subject-quiz", label: "Subject Practice", icon: BookOpen },
  { to: "/student/my-progress", label: "My Progress & XP", icon: Trophy },
  { to: "/student/webinars", label: "Webinars & CME", icon: Radio },
  { to: "/student/jobs", label: "Job Board", icon: BriefcaseBusiness },
  { to: "/student/colleges", label: "College Directory", icon: GraduationCap },
  { to: "/student/chapters", label: "College Chapters", icon: MessageSquare },
  { to: "/student/competitions", label: "Quiz Competition", icon: Swords },
  { to: "/student/case-studies", label: "Case Studies", icon: FileText },
  { to: "/student/coin-store", label: "Coin Store", icon: Coins },
  { to: "/student/study-planner", label: "Study Planner", icon: NotebookPen },
  { to: "/task-tracker", label: "Task Tracker Pro", icon: NotebookPen },
  { to: "/student/mentorship", label: "Mentorship", icon: Handshake },
  { to: "/student/study-groups", label: "Study Groups", icon: Users },
  { to: "/student/ask-vaidya", label: "Ask a Vaidya", icon: HelpCircle },
  { to: "/student/internship-journal", label: "Internship Journal", icon: Award },
  { to: "/student/internship-marketplace", label: "Internships", icon: BriefcaseBusiness },
  { to: "/student/research-collaboration", label: "Research Collab", icon: FlaskConical },
  { to: "/student/startup-incubator", label: "Startup Incubator", icon: Rocket },
  { to: "/student/freelance-gigs", label: "Freelance Gigs", icon: BriefcaseBusiness },
  { to: "/student/marma-explorer", label: "Marma Explorer", icon: Dna },
  { to: "/student/drug-interactions", label: "Drug Interactions", icon: Pill },
  { to: "/student/panchakarma-simulator", label: "Panchakarma Sim", icon: Droplets },
  { to: "/student/herb-identifier", label: "Herb Identifier", icon: Leaf },
  { to: "/student/pulse-reading", label: "Pulse Reading", icon: Activity },
  { to: "/student/question-bank", label: "Question Bank", icon: Database },
  { to: "/student/admin-panel", label: "Admin Panel", icon: Shield },
  { to: "/student/research", label: "Research & Blogs", icon: Newspaper },
  { to: "/diagnosis/prakriti", label: "Prakriti Quiz", icon: Dna },
  { to: "/student/certificates", label: "My Certificates", icon: Award },
  { to: "/feed", label: "Community Feed", icon: Users },
  { to: "/doctors", label: "Consult a Doctor", icon: Stethoscope },
  { to: "/health-conditions", label: "Health Conditions", icon: Activity },
  { to: "/student/profile", label: "My Profile", icon: Settings },
];

type StudentProfile = {
  full_name: string;
  course: string | null;
  year_of_study: number | null;
  college_name: string | null;
};

const initials = (name?: string) =>
  (name || "Ayuzee Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StudentLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        navigate("/student/auth", { replace: true });
        return;
      }

      // Hero Admin bypass — skip student role check
      const userEmail = sessionData.session?.user.email;
      if (isHeroAdminEmail(userEmail)) {
        if (!active) return;
        setProfile({ full_name: "Hero Admin (Jasir)", course: "Admin", year_of_study: null, college_name: "Beyond.Praxis" });
        setLoading(false);
        return;
      }

      const { data: roleRow, error: roleError } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "student")
        .maybeSingle();

      if (!active) return;

      if (roleError || !roleRow) {
        toast.error("Please sign in as a student");
        navigate("/student/auth", { replace: true });
        return;
      }

      const { data: studentProfile } = await (supabase as any)
        .from("student_profiles")
        .select("full_name, course, year_of_study, college_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;
      setProfile(studentProfile ?? null);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/student/auth", { replace: true });
    });

    loadStudent();

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

  if (accessDenied) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30 px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <GraduationCap className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl">Access denied</h1>
          <p className="mt-2 text-muted-foreground">Access denied, please sign in as a student.</p>
          <Button asChild className="mt-6">
            <Link to="/student/auth">Student sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-20 flex h-auto flex-col border-b border-border bg-card/95 px-4 py-4 shadow-soft backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
        <Link to="/student" className="flex items-center gap-3 px-2 font-display text-2xl font-semibold">
          <span className="grid h-11 w-11 place-items-center rounded-full gradient-leaf text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          Student Hub
        </Link>

        <nav className="mt-5 grid gap-1 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-col">
          {studentLinks.map((item) => (
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
        <Button variant="ghost" size="sm" asChild className="justify-start text-muted-foreground hidden lg:flex">
          <Link to="/login">⇄ Switch Portal</Link>
        </Button>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/60 p-3 lg:mt-0">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">{initials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile?.full_name || "Ayuzee Student"}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {profile?.course && <Badge variant="outline">{profile.course}</Badge>}
              {profile?.year_of_study && <Badge variant="secondary">Year {profile.year_of_study}</Badge>}
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <OnboardingWizard portal="student" />
    </div>
  );
};

export default StudentLayout;
