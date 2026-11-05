import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ExternalLink, Trash2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SavedPost {
  id: string;
  post_title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  post_url: string | null;
  created_at: string;
}

const PatientSavedPosts = () => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase
        .from("doctor_saved_posts")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      setPosts((data as SavedPost[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = posts.filter((p) =>
    p.post_title.toLowerCase().includes(q.toLowerCase()) ||
    (p.excerpt ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const remove = async (id: string) => {
    const { error } = await supabase.from("doctor_saved_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setPosts((x) => x.filter((p) => p.id !== id));
    toast.success("Removed from saved");
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 font-display text-xl font-semibold">Saved Posts</h1>
        <div className="relative w-56 max-w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search saved" className="h-9 pl-8" />
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="font-medium">No saved posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bookmark posts from the feed and blogs to read later.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/feed">Browse Feed</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((p) => (
              <li key={p.id} className="flex gap-4 py-4">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.post_title} className="h-20 w-28 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-20 w-28 place-items-center rounded-lg bg-muted">
                    <Bookmark className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">{p.post_title}</h3>
                  {p.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Saved {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-start gap-1">
                  {p.post_url && (
                    <Button asChild size="icon" variant="ghost">
                      <a href={p.post_url} target="_blank" rel="noreferrer" aria-label="Open">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default PatientSavedPosts;
