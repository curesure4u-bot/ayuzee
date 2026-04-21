import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FeedPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: p } = await supabase.from("feed_posts").select("*").eq("id", id).maybeSingle();
    setPost(p);
    if (p) document.title = `${p.title || "Post"} — Ayuzee Feed`;
    const { data: c } = await supabase.from("feed_comments").select("*").eq("post_id", id).order("created_at");
    setComments(c ?? []);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);
    if (uid) {
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", uid).maybeSingle();
      setUserName(prof?.full_name || sess.session?.user.email?.split("@")[0] || "Anonymous");
      const { data: like } = await supabase.from("feed_likes").select("id").eq("post_id", id).eq("user_id", uid).maybeSingle();
      setLiked(!!like);
    }
    setLoading(false);
  };

  const toggleLike = async () => {
    if (!userId || !post) { navigate("/auth"); return; }
    if (liked) {
      await supabase.from("feed_likes").delete().eq("post_id", post.id).eq("user_id", userId);
      setLiked(false);
      setPost({ ...post, like_count: Math.max(0, post.like_count - 1) });
    } else {
      await supabase.from("feed_likes").insert({ post_id: post.id, user_id: userId });
      setLiked(true);
      setPost({ ...post, like_count: post.like_count + 1 });
    }
  };

  const submitComment = async () => {
    if (!userId) { navigate("/auth"); return; }
    if (!draft.trim()) return;
    const { error } = await supabase.from("feed_comments").insert({
      post_id: post.id, user_id: userId, author_name: userName, body: draft.trim().slice(0, 1000),
    });
    if (error) { toast.error(error.message); return; }
    setDraft("");
    load();
  };

  if (loading) return <div className="min-h-screen bg-background"><SiteNav /><div className="container py-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div></div>;
  if (!post) return <div className="min-h-screen bg-background"><SiteNav /><div className="container py-24 text-center">Post not found</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-8">
        <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to feed</Link>
        <div className="mx-auto mt-6 max-w-2xl space-y-6">
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-leaf font-display text-sm text-primary-foreground">
                  {post.author_name.split(" ").slice(-2).map((p: string) => p[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{post.author_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
              {post.title && <h1 className="mt-4 font-display text-3xl">{post.title}</h1>}
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{post.body}</p>
              {post.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map((t: string) => <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">#{t}</span>)}
                </div>
              )}
            </div>
            {post.image_url && <img src={post.image_url} alt="" className="w-full" />}
            <div className="flex items-center gap-4 border-t border-border px-6 py-3">
              <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm ${liked ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}>
                <Heart className={`h-4 w-4 ${liked ? "fill-secondary" : ""}`} /> {post.like_count} likes
              </button>
              <span className="text-sm text-muted-foreground">{post.comment_count} comments</span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-lg">Comments</h3>
            <div className="mt-4 space-y-4">
              {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first to respond.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">{c.author_name[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-semibold">{c.author_name}</span> <span className="text-xs text-muted-foreground">· {new Date(c.created_at).toLocaleDateString()}</span></p>
                    <p className="mt-0.5 text-sm">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            {userId ? (
              <div className="mt-5 flex gap-2">
                <Textarea placeholder="Write a comment…" value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} maxLength={1000} />
                <Button variant="hero" onClick={submitComment}><Send className="h-4 w-4" /></Button>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground"><Link to="/auth" className="font-semibold text-primary hover:underline">Sign in</Link> to comment.</p>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedPost;
