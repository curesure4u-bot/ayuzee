import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Send,
  Loader2,
  Trash2,
  User,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useChapterPosts, useChapterReplies, type ChapterPost } from "@/hooks/useCollegeChapters";

// ---------- Reply Section Component ----------

function RepliesSection({ postId, userId }: { postId: string; userId: string | null }) {
  const { replies, loading, createReply, deleteReply } = useChapterReplies(postId);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    const result = await createReply(replyText.trim());
    setSending(false);
    if (result) {
      setReplyText("");
    } else {
      toast.error("Failed to post reply");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading replies...
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-3">
      {replies.length > 0 && <Separator />}
      {replies.map((reply) => (
        <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-muted">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium text-foreground">{reply.author_name || "Anonymous"}</span>
              <Clock className="h-3 w-3" />
              <span>{new Date(reply.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
          </div>
          {userId === reply.user_id && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={async () => {
                const ok = await deleteReply(reply.id);
                if (ok) toast.success("Reply deleted");
              }}
              aria-label="Delete reply"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}

      {/* Reply input */}
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmitReply();
            }
          }}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleSubmitReply}
          disabled={!replyText.trim() || sending}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// ---------- Post Card Component ----------

function PostCard({ post, userId, onDelete }: { post: ChapterPost; userId: string | null; onDelete: (id: string) => void }) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{post.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <User className="h-3 w-3" />
              <span>{post.author_name || "Anonymous"}</span>
              <Clock className="h-3 w-3" />
              <span>{new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
          {userId === post.user_id && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onDelete(post.id)}
              aria-label="Delete post"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setShowReplies(!showReplies)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
        </Button>

        {showReplies && <RepliesSection postId={post.id} userId={userId} />}
      </CardContent>
    </Card>
  );
}

// ---------- Main Page ----------

const ChapterDetail = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { posts, loading, userId, createPost, deletePost } = useChapterPosts(chapterId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setPosting(true);
    const result = await createPost(postTitle.trim(), postContent.trim());
    setPosting(false);

    if (result) {
      toast.success("Post created!");
      setDialogOpen(false);
      setPostTitle("");
      setPostContent("");
    } else {
      toast.error("Failed to create post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    const ok = await deletePost(postId);
    if (ok) toast.success("Post deleted");
    else toast.error("Failed to delete post");
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/student/chapters" aria-label="Back to chapters">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Chapter Discussion</h1>
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} in this forum
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Discussion Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium" htmlFor="post-title">Title *</label>
                <Input
                  id="post-title"
                  placeholder="e.g. Best study resources for Dravyaguna?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="post-content">Content *</label>
                <Textarea
                  id="post-content"
                  placeholder="Share your thoughts, questions, or notes..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={handleCreatePost} disabled={posting} className="w-full">
                {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Post Discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No posts yet. Start the discussion!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} userId={userId} onDelete={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
};

export default ChapterDetail;
