import { useState, useEffect } from "react";
import {
  Award,
  Heart,
  MessageCircle,
  Plus,
  Send,
  ThumbsUp,
  Trophy,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

const POST_TYPES = [
  { value: "discussion", label: "Discussion", emoji: "💬" },
  { value: "question", label: "Question", emoji: "❓" },
  { value: "win", label: "Share a Win", emoji: "🏆" },
  { value: "resource", label: "Resource", emoji: "📚" },
  { value: "accountability", label: "Accountability", emoji: "🤝" },
];

interface Post {
  id: string;
  user_id: string;
  author_name: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  reply_count: number;
  created_at: string;
}

interface Reply {
  id: string;
  author_name: string;
  content: string;
  upvotes: number;
  created_at: string;
}

const Community = () => {
  const { addXP, addCoins } = useBeyondGamification();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [filter, setFilter] = useState("all");

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("discussion");
  const [posting, setPosting] = useState(false);

  // Reply view
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    const { data } = await (supabase as any)
      .from("beyond_community_posts")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);
    setPosts(data || []);
    setLoading(false);
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error("Title and content required"); return; }
    setPosting(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setPosting(false); return; }

    const { data: profile } = await (supabase as any)
      .from("beyond_profiles")
      .select("full_name")
      .eq("user_id", session.session.user.id)
      .maybeSingle();

    await (supabase as any).from("beyond_community_posts").insert({
      user_id: session.session.user.id,
      author_name: profile?.full_name || "Doctor",
      type: newType,
      title: newTitle,
      content: newContent,
    });

    await addXP(20, "community_post", "Shared in community");
    await addCoins(10, "community_post");

    setNewTitle("");
    setNewContent("");
    setNewType("discussion");
    setShowNewPost(false);
    toast.success("Posted! +20 XP");
    loadPosts();
    setPosting(false);
  };

  const openPost = async (post: Post) => {
    setActivePost(post);
    const { data } = await (supabase as any)
      .from("beyond_community_replies")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at");
    setReplies(data || []);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !activePost) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const { data: profile } = await (supabase as any)
      .from("beyond_profiles")
      .select("full_name")
      .eq("user_id", session.session.user.id)
      .maybeSingle();

    await (supabase as any).from("beyond_community_replies").insert({
      post_id: activePost.id,
      user_id: session.session.user.id,
      author_name: profile?.full_name || "Doctor",
      content: replyText,
    });

    // Update reply count
    await (supabase as any).from("beyond_community_posts").update({ reply_count: activePost.reply_count + 1 }).eq("id", activePost.id);

    await addXP(15, "community_reply", "Helped in community");
    setReplies((prev) => [...prev, { id: crypto.randomUUID(), author_name: profile?.full_name || "Doctor", content: replyText, upvotes: 0, created_at: new Date().toISOString() }]);
    setReplyText("");
    toast.success("Reply sent! +15 XP");
  };

  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading community...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Users className="h-7 w-7 text-pink-500" />
            Community
          </h1>
          <p className="text-muted-foreground">Connect, share wins, ask questions, grow together</p>
        </div>
        <Button onClick={() => setShowNewPost(true)} className="gap-1">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} className="text-xs" onClick={() => setFilter("all")}>All</Button>
        {POST_TYPES.map((t) => (
          <Button key={t.value} size="sm" variant={filter === t.value ? "default" : "outline"} className="text-xs" onClick={() => setFilter(t.value)}>
            {t.emoji} {t.label}
          </Button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No posts yet. Be the first to share!</p>
          </CardContent></Card>
        ) : (
          filteredPosts.map((post) => {
            const typeConfig = POST_TYPES.find((t) => t.value === post.type);
            return (
              <Card key={post.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openPost(post)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{typeConfig?.emoji || "💬"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">{post.author_name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MessageCircle className="h-2.5 w-2.5" /> {post.reply_count}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <ThumbsUp className="h-2.5 w-2.5" /> {post.upvotes}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Textarea placeholder="Share your thoughts..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} />
            <Button onClick={createPost} disabled={posting} className="w-full">
              {posting ? "Posting..." : "Post (+20 XP)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={!!activePost} onOpenChange={() => setActivePost(null)}>
        {activePost && (
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base">{activePost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-sm">{activePost.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">— {activePost.author_name}</p>
              </div>

              {/* Replies */}
              <div className="space-y-2">
                <p className="text-xs font-medium">{replies.length} replies</p>
                {replies.map((reply) => (
                  <div key={reply.id} className="rounded-lg border p-2.5">
                    <p className="text-xs">{reply.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">— {reply.author_name} · {new Date(reply.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="flex gap-2">
                <Input placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} className="flex-1" />
                <Button size="sm" onClick={sendReply} disabled={!replyText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Community;
