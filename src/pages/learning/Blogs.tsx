import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, Loader2, Newspaper } from "lucide-react";

const Blogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("health_blogs").select("*").eq("status", "published").order("published_at", { ascending: false })
      .then(({ data }) => { setBlogs(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (blogs.length === 0) return <Card className="p-12 text-center"><Newspaper className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 text-muted-foreground">No blogs published yet.</p></Card>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((b) => (
        <Link key={b.id} to={`/learning/blogs/${b.slug}`}>
          <Card className="h-full overflow-hidden transition-smooth hover:-translate-y-1 hover:shadow-elegant">
            <div className="aspect-[16/10] gradient-soft">
              {b.cover_image_url ? <img src={b.cover_image_url} alt={b.title} className="h-full w-full object-cover"  loading="lazy" decoding="async" /> : <div className="grid h-full place-items-center font-display text-7xl text-primary/15">A</div>}
            </div>
            <div className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{b.category}</span>
              <h3 className="mt-2 font-display text-xl leading-tight">{b.title}</h3>
              {b.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{b.excerpt}</p>}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>By {b.author_name}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.read_minutes} min</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Blogs;
