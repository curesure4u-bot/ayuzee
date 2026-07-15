import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, GraduationCap, Loader2, PlayCircle } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("lms_courses").select("*").eq("is_published", true).order("created_at", { ascending: false })
      .then(({ data }) => { setCourses(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (courses.length === 0) return <Card className="p-12 text-center"><GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 text-muted-foreground">No courses published yet.</p></Card>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <Link key={c.id} to={`/learning/courses/${c.slug}`} className="group">
          <Card className="overflow-hidden transition-smooth hover:-translate-y-1 hover:shadow-elegant">
            <div className="aspect-video overflow-hidden gradient-soft">
              {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.title} className="h-full w-full object-cover transition-smooth group-hover:scale-105"  loading="lazy" decoding="async" /> : <div className="grid h-full place-items-center"><PlayCircle className="h-16 w-16 text-primary/30" /></div>}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-primary">{c.category}</span>
                <span className="text-muted-foreground">· {c.level}</span>
              </div>
              <h3 className="mt-3 font-display text-xl leading-tight">{c.title}</h3>
              {c.instructor_name && <p className="mt-1 text-sm text-muted-foreground">by {c.instructor_name}</p>}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {c.total_lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration_minutes} min</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Courses;
