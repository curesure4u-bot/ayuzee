import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Send, Loader2, PenSquare } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  author_user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  title: string | null;
  body: string;
  image_url: string | null;
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
}

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<{ name: string; avatar: string | null } | null>(null);
  const [composing, setComposing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newTags, setNewTags] = useState("");
  const [posting, setPosting] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = "Feed — Ayuzee";
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);

    const { data: postsData } = await supabase.from("feed_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(50);
    setPosts((postsData as Post[]) ?? []);

    if (uid) {
      const { data: doc } = await supabase.from("doctors").select("full_name, avatar_url, is_approved").eq("user_id", uid).maybeSingle();
      if (doc?.is_approved) {
        setIsDoctor(true);
        setDoctorInfo({ name: doc.full_name, avatar: doc.avatar_url });
      }
      const { data: likes } = await supabase.from("feed_likes").select("post_id").eq("user_id", uid);
      setLikedSet(new Set((likes ?? []).map((l: any) => l.post_id)));
    }
    setLoading(false);
  };

  const submitPost = async () => {
    if (!userId || !doctorInfo) return;
    if (!newBody.trim()) {
      toast.error("Write something to share");
      return;
    }
    setPosting(true);
    const tags = newTags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("feed_posts").insert({
      author_user_id: userId,
      author_name: doctorInfo.name,
      author_avatar_url: doctorInfo.avatar,
      title: newTitle.trim() || null,
      body: newBody.trim().slice(0, 5000),
      image_url: newImage.trim() || null,
      tags,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Posted to feed");
    setNewTitle(""); setNewBody(""); setNewImage(""); setNewTags(""); setComposing(false);
    load();
  };

  const toggleLike = async (postId: string) => {
    if (!userId) {
      toast.info("Sign in to like posts");
      navigate("/auth");
      return;
    }
    const liked = likedSet.has(postId);
    const next = new Set(likedSet);
    if (liked) {
      next.delete(postId);
      setLikedSet(next);
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, like_count: Math.max(0, x.like_count - 1) } : x));
      await supabase.from("feed_likes").delete().eq("post_id", postId).eq("user_id", userId);
    } else {
      next.add(postId);
      setLikedSet(next);
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, like_count: x.like_count + 1 } : x));
      await supabase.from("feed_likes").insert({ post_id: postId, user_id: userId });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <section className="gradient-soft border-b border-border">
          <div className="container py-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Community Feed</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Insights from Ayurvedic doctors</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Short-form clinical pearls, case notes & wellness wisdom from approved practitioners on Ayuzee.</p>
          </div>
        </section>

        <section className="container py-10">
          <div className="mx-auto max-w-2xl space-y-6">
            {isDoctor && (
              <Card className="p-5">
                {!composing ? (
                  <button onClick={() => setComposing(true)} className="flex w-full items-center gap-3 text-left text-muted-foreground hover:text-foreground">
                    <div className="grid h-10 w-10 place-items-center rounded-full gradient-leaf font-display text-sm text-primary-foreground">
                      {doctorInfo?.name.split(" ").slice(-2).map((p) => p[0]).join("")}
                    </div>
                    <span className="flex-1 rounded-full bg-muted px-4 py-2 text-sm">Share an insight, case note, or tip…</span>
                    <PenSquare className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Input placeholder="Title (optional)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={150} />
                    <Textarea placeholder="What would you like to share with the community?" value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={5} maxLength={5000} />
                    <Input placeholder="Image URL (optional)" value={newImage} onChange={(e) => setNewImage(e.target.value)} />
                    <Input placeholder="Tags, comma separated (e.g. Panchakarma, Diet)" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setComposing(false)}>Cancel</Button>
                      <Button variant="hero" onClick={submitPost} disabled={posting}>
                        {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {!isDoctor && userId && (
              <Card className="p-4 text-sm text-muted-foreground">Only approved doctors can post to the feed. <Link to="/partner/apply" className="font-semibold text-primary hover:underline">Apply as a partner</Link>.</Card>
            )}

            {loading ? (
              <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">No posts yet. Be the first to share!</Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full gradient-leaf font-display text-sm text-primary-foreground">
                        {post.author_name.split(" ").slice(-2).map((p) => p[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{post.author_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {post.title && <h3 className="mt-4 font-display text-xl">{post.title}</h3>}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.body}</p>
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">#{t}</span>)}
                      </div>
                    )}
                  </div>
                  {post.image_url && <img src={post.image_url} alt="" className="w-full max-h-[480px] object-cover" loading="lazy" />}
                  <div className="flex items-center gap-4 border-t border-border px-5 py-3">
                    <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-smooth ${likedSet.has(post.id) ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}>
                      <Heart className={`h-4 w-4 ${likedSet.has(post.id) ? "fill-secondary" : ""}`} /> {post.like_count}
                    </button>
                    <Link to={`/feed/${post.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                      <MessageCircle className="h-4 w-4" /> {post.comment_count}
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
