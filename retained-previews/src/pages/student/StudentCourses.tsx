import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Clock, GraduationCap, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = ["all", "Panchakarma", "Dravyaguna", "Clinical", "Research", "Yoga"];
const levels = ["all", "Beginner", "Intermediate", "Advanced"];
const prices = ["all", "free", "paid"];

type Course = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  level: string | null;
  duration_minutes: number | null;
  instructor_name: string | null;
  thumbnail_url: string | null;
  description?: string | null;
  price?: number | null;
};

type Enrollment = {
  id: string;
  course_id: string;
  progress_percent: number;
  lms_courses?: Course | null;
};

const StudentCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [price, setPrice] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);

    const [courseRes, enrollmentRes, certificateRes] = await Promise.all([
      supabase.from("lms_courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      uid ? (supabase as any).from("lms_progress").select("id, course_id, progress_percent, lms_courses(*)").eq("user_id", uid).order("completed_at", { ascending: false }) : Promise.resolve({ data: [] }),
      uid ? supabase.from("lms_certificates").select("id, course_id, course_title, certificate_no").eq("user_id", uid) : Promise.resolve({ data: [] }),
    ]);

    setCourses((courseRes.data ?? []) as Course[]);
    setEnrollments((enrollmentRes.data ?? []) as Enrollment[]);
    setCertificates(certificateRes.data ?? []);
    setLoading(false);
  };

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((item) => item.course_id)), [enrollments]);
  const certificateByCourse = useMemo(() => new Map(certificates.map((cert) => [cert.course_id, cert])), [certificates]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = category === "all" || course.category === category;
      const matchesLevel = level === "all" || course.level === level;
      const coursePrice = Number(course.price ?? 0);
      const matchesPrice = price === "all" || (price === "free" ? coursePrice === 0 : coursePrice > 0);
      const matchesQuery = !query.trim() || [course.title, course.instructor_name, course.category].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesLevel && matchesPrice && matchesQuery;
    });
  }, [courses, category, level, price, query]);

  const enroll = async (course: Course) => {
    if (!userId) {
      navigate("/student/auth");
      return;
    }

    if (enrolledCourseIds.has(course.id)) {
      navigate(`/learning/courses/${course.slug}`);
      return;
    }

    const { data: firstLesson } = await supabase.from("lms_lessons").select("id").eq("course_id", course.id).order("sort_order", { ascending: true }).limit(1).maybeSingle();
    if (!firstLesson?.id) {
      toast.error("This course has no lessons yet.");
      return;
    }

    const { error } = await (supabase as any).from("lms_progress").insert({
      user_id: userId,
      course_id: course.id,
      lesson_id: firstLesson.id,
      progress_percent: 0,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Course enrolled successfully");
    navigate(`/learning/courses/${course.slug}`);
  };

  if (loading) return <Loading />;

  const completed = enrollments.filter((item) => (item.progress_percent ?? 0) >= 100);

  return (
    <div className="space-y-6">
      <Header title="My Courses" subtitle="Explore Ayush learning modules and continue your enrolled courses." />
      <FilterBar category={category} level={level} price={price} query={query} setCategory={setCategory} setLevel={setLevel} setPrice={setPrice} setQuery={setQuery} />

      <Tabs defaultValue="all" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="all">All Courses</TabsTrigger><TabsTrigger value="enrolled">My Enrolled Courses</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList>
        <TabsContent value="all">
          <CourseGrid courses={filteredCourses} action={(course) => <Button onClick={() => enroll(course)}>{enrolledCourseIds.has(course.id) ? "Continue" : "Enroll"}</Button>} />
        </TabsContent>
        <TabsContent value="enrolled">
          {enrollments.length === 0 ? <Empty text="You have not enrolled in any courses yet." /> : <div className="grid gap-5 lg:grid-cols-2">{enrollments.map((item) => <ProgressCourseCard key={item.id} item={item} />)}</div>}
        </TabsContent>
        <TabsContent value="completed">
          {completed.length === 0 ? <Empty text="Completed courses will appear here." /> : <div className="grid gap-5 lg:grid-cols-2">{completed.map((item) => <ProgressCourseCard key={item.id} item={item} certificate={certificateByCourse.get(item.course_id)} />)}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => <div><h1 className="font-display text-3xl">{title}</h1><p className="mt-2 text-muted-foreground">{subtitle}</p></div>;

const FilterBar = ({ category, level, price, query, setCategory, setLevel, setPrice, setQuery }: any) => (
  <Card><CardContent className="grid gap-3 p-4 md:grid-cols-4">
    <Input placeholder="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} />
    <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item === "all" ? "All categories" : item}</SelectItem>)}</SelectContent></Select>
    <Select value={level} onValueChange={setLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{levels.map((item) => <SelectItem key={item} value={item}>{item === "all" ? "All levels" : item}</SelectItem>)}</SelectContent></Select>
    <Select value={price} onValueChange={setPrice}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{prices.map((item) => <SelectItem key={item} value={item}>{item === "all" ? "Free/Paid" : item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select>
  </CardContent></Card>
);

const CourseGrid = ({ courses, action }: { courses: Course[]; action: (course: Course) => React.ReactNode }) => {
  if (courses.length === 0) return <Empty text="No courses match these filters." />;
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} action={action(course)} />)}</div>;
};

const CourseCard = ({ course, action }: { course: Course; action: React.ReactNode }) => (
  <Card className="overflow-hidden">
    <div className="aspect-video bg-muted">{course.thumbnail_url ? <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><PlayCircle className="h-12 w-12 text-primary/40" /></div>}</div>
    <CardContent className="p-5">
      <div className="flex flex-wrap gap-2"><Badge variant="outline">{course.category || "Course"}</Badge><Badge variant="secondary">{course.level || "Beginner"}</Badge></div>
      <h3 className="mt-3 font-display text-xl leading-tight">{course.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{course.instructor_name || "Ayuzee Faculty"}</p>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration_minutes || 0} min</span><span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{course.level || "Beginner"}</span></div>
      <div className="mt-5">{action}</div>
    </CardContent>
  </Card>
);

const ProgressCourseCard = ({ item, certificate }: { item: Enrollment; certificate?: any }) => {
  const course = item.lms_courses;
  if (!course) return null;
  const progress = Math.max(0, Math.min(100, item.progress_percent ?? 0));
  return <Card><CardContent className="p-5"><Badge variant="outline">{course.category || "Course"}</Badge><h3 className="mt-3 font-display text-xl">{course.title}</h3><div className="mt-4 flex items-center gap-3"><Progress value={progress} className="h-2" /><span className="w-10 text-right text-xs font-semibold">{progress}%</span></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild><Link to={`/learning/courses/${course.slug}`}>Continue Learning</Link></Button>{progress >= 100 && certificate && <Button asChild variant="outline"><Link to={`/learning/certificates/${certificate.id}`}>View Certificate</Link></Button>}</div></CardContent></Card>;
};

const Empty = ({ text }: { text: string }) => <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground">{text}</div>;
const Loading = () => <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

export default StudentCourses;
