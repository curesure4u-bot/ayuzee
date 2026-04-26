import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  Dna,
  Loader2,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const quickActions = [
  { title: "Browse Courses", to: "/student/courses", icon: BookOpen },
  { title: "Upcoming Webinars", to: "/student/webinars", icon: Radio },
  { title: "Find a Job", to: "/student/jobs", icon: BriefcaseBusiness },
  { title: "Take Prakriti Quiz", to: "/diagnosis/prakriti", icon: Dna },
];

type StudentProfile = {
  full_name: string;
  college_name: string | null;
  course: string | null;
  year_of_study: number | null;
};

type ActiveCourse = {
  id: string;
  progress_percent: number;
  lms_courses?: {
    id: string;
    title: string;
    slug: string;
    category: string | null;
    thumbnail_url: string | null;
    total_lessons: number | null;
  } | null;
};

type Webinar = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  speaker_name: string | null;
};

type Certificate = {
  id: string;
  course_title: string;
  certificate_no: string;
  issued_at: string;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [stats, setStats] = useState({ courses: 0, certificates: 0, webinars: 0, jobs: 0 });
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = "Student Dashboard — Ayuzee";
    loadDashboard();
  }, []);

  const displayName = useMemo(() => profile?.full_name || "Student", [profile]);

  const loadDashboard = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id;
    const email = sessionData.session?.user.email ?? null;

    if (!uid) {
      navigate("/student/auth", { replace: true });
      return;
    }

    setUserId(uid);
    setUserEmail(email);

    const [profileRes, progressRes, certRes, webinarRsvpRes, jobRes, activeCourseRes, webinarRes, recentCertRes] = await Promise.all([
      (supabase as any).from("student_profiles").select("full_name, college_name, course, year_of_study").eq("user_id", uid).maybeSingle(),
      supabase.from("lms_progress").select("course_id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("lms_certificates").select("id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("webinar_rsvps").select("webinar_id", { count: "exact", head: true }).eq("user_id", uid),
      (supabase as any).from("job_applications").select("id", { count: "exact", head: true }).eq("user_id", uid),
      (supabase as any)
        .from("lms_progress")
        .select("id, progress_percent, lms_courses(id, title, slug, category, thumbnail_url, total_lessons)")
        .eq("user_id", uid)
        .order("completed_at", { ascending: false })
        .limit(3),
      supabase
        .from("webinars")
        .select("id, title, scheduled_at, duration_minutes, speaker_name")
        .eq("is_published", true)
        .gt("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(3),
      supabase
        .from("lms_certificates")
        .select("id, course_title, certificate_no, issued_at")
        .eq("user_id", uid)
        .order("issued_at", { ascending: false })
        .limit(2),
    ]);

    const { data: registeredWebinars } = await supabase.from("webinar_rsvps").select("webinar_id").eq("user_id", uid);

    setProfile(profileRes.data ?? null);
    setProfileMissing(!!profileRes.error || !profileRes.data);
    setStats({
      courses: progressRes.count ?? 0,
      certificates: certRes.count ?? 0,
      webinars: webinarRsvpRes.count ?? 0,
      jobs: jobRes.count ?? 0,
    });
    setActiveCourses((activeCourseRes.data ?? []) as ActiveCourse[]);
    setWebinars((webinarRes.data ?? []) as Webinar[]);
    setCertificates((recentCertRes.data ?? []) as Certificate[]);
    setRsvps(new Set((registeredWebinars ?? []).map((item: any) => item.webinar_id)));
    setLoading(false);
  };

  const handleRsvp = async (webinarId: string) => {
    if (!userId) return;
    if (rsvps.has(webinarId)) {
      toast.info("You are already registered for this webinar.");
      return;
    }

    const { error } = await supabase.from("webinar_rsvps").insert({ webinar_id: webinarId, user_id: userId, email: userEmail });
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("You're registered!");
    setRsvps((current) => new Set(current).add(webinarId));
    setStats((current) => ({ ...current, webinars: current.webinars + 1 }));
  };

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Courses Enrolled", value: stats.courses, icon: BookOpen },
    { label: "Certificates Earned", value: stats.certificates, icon: Award },
    { label: "Webinars Attended", value: stats.webinars, icon: Radio },
    { label: "Jobs Applied", value: stats.jobs, icon: BriefcaseBusiness },
  ];

  return (
    <div className="space-y-8">
      {profileMissing && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">
            <strong>Setup needed:</strong> Complete your student profile to access all features.
          </p>
          <Button asChild size="sm" variant="outline" className="border-amber-400 bg-background text-amber-900 hover:bg-amber-100">
            <Link to="/student/profile">Complete Profile</Link>
          </Button>
        </div>
      )}

      <header className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Badge variant="outline">Ayuzee Student Hub</Badge>
        <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
          Welcome back, {displayName} 👋 | {profile?.course || "AYUSH"} · Year {profile?.year_of_study || "—"} · {profile?.college_name || "Your college"}
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">Track your learning, register for CME webinars, build certificates, and discover AYUSH career opportunities.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.to} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
            <action.icon className="h-6 w-6 text-primary" />
            <p className="mt-4 font-semibold group-hover:text-primary">{action.title}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-2xl">My Active Courses</CardTitle>
            <Button asChild variant="outline" size="sm"><Link to="/student/courses">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCourses.length === 0 ? (
              <EmptyState icon={BookOpen} text="No active courses yet." action="Browse Courses" to="/student/courses" />
            ) : (
              activeCourses.map((item) => {
                const course = item.lms_courses;
                if (!course) return null;
                const progress = Math.max(0, Math.min(100, item.progress_percent ?? 0));
                return (
                  <div key={item.id} className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                    <div className="aspect-video overflow-hidden rounded-xl bg-muted sm:aspect-square">
                      {course.thumbnail_url ? <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><BookOpen className="h-8 w-8 text-primary/40" /></div>}
                    </div>
                    <div className="min-w-0">
                      <Badge variant="outline">{course.category || "Course"}</Badge>
                      <h3 className="mt-2 font-semibold">{course.title}</h3>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={progress} className="h-2" />
                        <span className="w-10 text-right text-xs font-semibold text-muted-foreground">{progress}%</span>
                      </div>
                    </div>
                    <Button asChild><Link to={`/learning/courses/${course.slug}`}>Continue</Link></Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Upcoming Webinars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {webinars.length === 0 ? (
              <EmptyState icon={Radio} text="No upcoming webinars right now." action="Explore webinars" to="/student/webinars" />
            ) : (
              webinars.map((webinar) => (
                <div key={webinar.id} className="rounded-2xl border border-border p-4">
                  <h3 className="font-semibold leading-snug">{webinar.title}</h3>
                  {webinar.speaker_name && <p className="mt-1 text-sm text-muted-foreground">with {webinar.speaker_name}</p>}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(webinar.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{webinar.duration_minutes || 60} min</span>
                  </div>
                  <Button className="mt-4 w-full" variant={rsvps.has(webinar.id) ? "outline" : "hero"} onClick={() => handleRsvp(webinar.id)}>
                    {rsvps.has(webinar.id) ? "Registered" : "RSVP"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-display text-2xl">Recent Certificates</CardTitle>
          <Button asChild variant="outline" size="sm"><Link to="/student/certificates">View all</Link></Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {certificates.length === 0 ? (
            <div className="md:col-span-2"><EmptyState icon={Award} text="Certificates you earn will appear here." action="Continue learning" to="/student/courses" /></div>
          ) : (
            certificates.map((certificate) => (
              <div key={certificate.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
                <div>
                  <p className="font-semibold">{certificate.course_title}</p>
                  <p className="text-sm text-muted-foreground">{certificate.certificate_no} · {new Date(certificate.issued_at).toLocaleDateString("en-IN")}</p>
                </div>
                <Button asChild variant="outline" size="sm"><Link to={`/learning/certificates/${certificate.id}`}>View</Link></Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text, action, to }: { icon: typeof BookOpen; text: string; action: string; to: string }) => (
  <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
    <Icon className="mx-auto h-8 w-8 text-primary/60" />
    <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    <Button asChild variant="outline" size="sm" className="mt-4"><Link to={to}>{action}</Link></Button>
  </div>
);

export default StudentDashboard;
