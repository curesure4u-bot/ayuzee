import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { setSEO } from "@/lib/seo";

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("health_blogs").select("*").eq("slug", slug).eq("status", "published").maybeSingle()
      .then(({ data }) => {
        setBlog(data); setLoading(false);
        if (data) {
          const desc = (data.excerpt || data.meta_description || data.body || "").toString().replace(/\s+/g, " ").slice(0, 158);
          setSEO(
            `${data.title} — Ayuzee Blogs`,
            desc,
            `/learning/blogs/${data.slug}`,
            {
              ogType: "article",
              ogImage: data.cover_image_url ?? undefined,
              jsonLd: {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: data.title,
                image: data.cover_image_url ?? undefined,
                datePublished: data.published_at ?? undefined,
                dateModified: data.updated_at ?? data.published_at ?? undefined,
                author: { "@type": "Person", name: data.author_name },
                publisher: { "@type": "Organization", name: "Ayuzee", logo: { "@type": "ImageObject", url: "https://ayuzee.com/favicon.ico" } },
                mainEntityOfPage: `https://ayuzee.com/learning/blogs/${data.slug}`,
                articleSection: data.category,
                keywords: Array.isArray(data.tags) ? data.tags.join(", ") : undefined,
              },
            },
          );
          supabase.from("health_blogs").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id).then(() => {});
        }
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background"><SiteNav /><div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  if (!blog) return <div className="min-h-screen bg-background"><SiteNav /><div className="container py-24 text-center">Blog not found.</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-8">
        <Link to="/learning/blogs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All blogs</Link>
        <article className="mx-auto mt-6 max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{blog.category}</span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{blog.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full gradient-leaf text-xs font-semibold text-primary-foreground">{blog.author_name.split(" ").slice(-2).map((p: string) => p[0]).join("")}</div>
              <span>{blog.author_name}</span>
            </div>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {blog.read_minutes} min read</span>
            {blog.published_at && <span>{new Date(blog.published_at).toLocaleDateString()}</span>}
          </div>
          {blog.cover_image_url && <img src={blog.cover_image_url} alt={blog.title} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />}
          <div className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap text-foreground">{blog.body}</div>
          {blog.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {blog.tags.map((t: string) => <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">#{t}</span>)}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
