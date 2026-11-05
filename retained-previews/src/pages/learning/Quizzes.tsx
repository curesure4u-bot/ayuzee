import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";

const Quizzes = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("lms_quizzes").select("*, lms_courses!inner(slug, title, thumbnail_url, category, is_published)").eq("is_published", true);
      setItems((data ?? []).filter((q: any) => q.lms_courses?.is_published));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (items.length === 0) return <Card className="p-12 text-center"><BookOpen className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 text-muted-foreground">No quizzes available yet.</p></Card>;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((q) => (
        <Card key={q.id} className="overflow-hidden">
          {q.lms_courses.thumbnail_url && <img src={q.lms_courses.thumbnail_url} alt={q.title} className="aspect-video w-full object-cover"  loading="lazy" decoding="async" />}
          <div className="p-5">
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{q.lms_courses.category}</span>
            <h3 className="mt-3 font-display text-lg leading-tight">{q.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">From: {q.lms_courses.title}</p>
            <p className="mt-2 text-xs text-muted-foreground">Passing score: {q.passing_score}%</p>
            <Button asChild variant="hero" className="mt-4 w-full"><Link to={`/learning/courses/${q.lms_courses.slug}/quiz`}>Take quiz</Link></Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Quizzes;
