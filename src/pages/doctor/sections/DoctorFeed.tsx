import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Heart, MessageCircle, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const DoctorFeed = () => {
  const { doctor, userId } = useDoctor();
  const [posts, setPosts] = useState<any[]>([]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", image_url: "", tags: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (userId) load(); }, [userId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("feed_posts").select("*").eq("author_user_id", userId!).order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  const post = async () => {
    if (!userId || !doctor) return;
    if (!draft.body.trim()) { toast.error("Write something"); return; }
    setSaving(true);
    const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("feed_posts").insert({
      author_user_id: userId,
      author_name: doctor.full_name,
      author_avatar_url: doctor.avatar_url,
      title: draft.title.trim() || null,
      body: draft.body.trim().slice(0, 5000),
      image_url: draft.image_url.trim() || null,
      tags,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Posted");
    setDraft({ title: "", body: "", image_url: "", tags: "" }); setComposing(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("feed_posts").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  if (!doctor) return <Card className="p-8 text-center text-muted-foreground">Approved doctor profile required to post in the feed.</Card>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">My Feed Posts</h2>
          <p className="text-sm text-muted-foreground">Quick clinical pearls, tips and community updates.</p>
        </div>
        <Button variant="hero" onClick={() => setComposing(!composing)}><Plus className="h-4 w-4" /> New post</Button>
      </div>

      {composing && (
        <Card className="mb-6 p-5">
          <div className="space-y-3">
            <div><Label>Title (optional)</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={150} /></div>
            <div><Label>Body *</Label><Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={5} maxLength={5000} /></div>
            <div><Label>Image URL</Label><Input value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} /></div>
            <div><Label>Tags (comma separated)</Label><Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setComposing(false)}>Cancel</Button>
              <Button variant="hero" onClick={post} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}</Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
        posts.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No posts yet.</Card> :
          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {p.title && <h3 className="font-semibold">{p.title}</h3>}
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{p.body}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {p.like_count}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.comment_count}</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button asChild size="sm" variant="ghost"><Link to={`/feed/${p.id}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>}
    </div>
  );
};

export default DoctorFeed;
