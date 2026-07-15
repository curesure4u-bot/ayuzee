import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, PlayCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabTypes = [
  { value: "article", label: "Articles" },
  { value: "research", label: "Research Papers" },
  { value: "case_study", label: "Case Studies" },
  { value: "video", label: "Videos" },
];

const StudentResearch = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);
    const [blogRes, bookmarkRes] = await Promise.all([
      (supabase as any).from("health_blogs").select("id, title, slug, author_name, category, read_minutes, cover_image_url, type, published_at").eq("status", "published").order("published_at", { ascending: false }),
      uid ? (supabase as any).from("student_bookmarks").select("id, blog_id, health_blogs(id, title, slug, author_name, category, read_minutes, cover_image_url, type)").eq("user_id", uid).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    ]);
    setBlogs(blogRes.data ?? []);
    setBookmarks(bookmarkRes.data ?? []);
    setLoading(false);
  };

  const bookmarkIds = useMemo(() => new Set(bookmarks.map((item) => item.blog_id)), [bookmarks]);

  const toggleBookmark = async (blog: any) => {
    if (!userId) return;
    if (bookmarkIds.has(blog.id)) {
      const { error } = await (supabase as any).from("student_bookmarks").delete().eq("user_id", userId).eq("blog_id", blog.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Bookmark removed");
    } else {
      const { error } = await (supabase as any).from("student_bookmarks").insert({ user_id: userId, blog_id: blog.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Bookmarked");
    }
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Research & Blogs</h1><p className="mt-2 text-muted-foreground">Read articles, research papers, case studies, and video resources curated for AYUSH students.</p></div>
      <Tabs defaultValue="article" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 lg:grid-cols-5">{tabTypes.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}<TabsTrigger value="bookmarks">My Bookmarks</TabsTrigger></TabsList>
        {tabTypes.map((tab) => <TabsContent key={tab.value} value={tab.value}><BlogGrid blogs={blogs.filter((blog) => (blog.type || "article") === tab.value)} bookmarkIds={bookmarkIds} onBookmark={toggleBookmark} /></TabsContent>)}
        <TabsContent value="bookmarks"><BlogGrid blogs={bookmarks.map((item) => item.health_blogs).filter(Boolean)} bookmarkIds={bookmarkIds} onBookmark={toggleBookmark} /></TabsContent>
      </Tabs>
    </div>
  );
};

const BlogGrid = ({ blogs, bookmarkIds, onBookmark }: { blogs: any[]; bookmarkIds: Set<string>; onBookmark: (blog: any) => void }) => {
  if (blogs.length === 0) return <Empty text="No content found here yet." />;
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{blogs.map((blog) => <BlogCard key={blog.id} blog={blog} bookmarked={bookmarkIds.has(blog.id)} onBookmark={() => onBookmark(blog)} />)}</div>;
};

const BlogCard = ({ blog, bookmarked, onBookmark }: { blog: any; bookmarked: boolean; onBookmark: () => void }) => <Card className="overflow-hidden"><div className="aspect-video bg-muted">{blog.cover_image_url ? <img src={blog.cover_image_url} alt={blog.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center">{blog.type === "video" ? <PlayCircle className="h-12 w-12 text-primary/40" /> : <BookOpen className="h-12 w-12 text-primary/40" />}</div>}</div><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><Badge variant="outline">{blog.category || blog.type || "Article"}</Badge><Button type="button" variant="ghost" size="icon" onClick={onBookmark} aria-label="Bookmark"><Star className={bookmarked ? "h-4 w-4 fill-current text-secondary" : "h-4 w-4"} /></Button></div><Link to={`/learning/blogs/${blog.slug}`}><h3 className="mt-3 font-display text-xl leading-tight hover:text-primary">{blog.title}</h3></Link><p className="mt-2 text-sm text-muted-foreground">{blog.author_name || "Ayuzee Editorial"} · {blog.read_minutes || 4} min read</p></CardContent></Card>;
const Empty = ({ text }: { text: string }) => <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground"><BookOpen className="mx-auto mb-3 h-8 w-8 text-primary/50" />{text}</div>;
const Loading = () => <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

export default StudentResearch;
