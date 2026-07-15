import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const DoctorBlogs = () => {
  const { doctor, userId } = useDoctor();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const blank = { title: "", excerpt: "", body: "", category: "Wellness", cover_image_url: "", tags: "", read_minutes: 4, status: "draft" };

  useEffect(() => { if (userId) load(); }, [userId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("health_blogs").select("*").eq("author_user_id", userId!).order("created_at", { ascending: false });
    setBlogs(data ?? []);
    setLoading(false);
  };

  const save = async () => {
    if (!userId || !doctor || !editing) return;
    if (!editing.title.trim() || !editing.body.trim()) { toast.error("Title and body required"); return; }
    setSaving(true);
    const tags = typeof editing.tags === "string" ? editing.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : (editing.tags ?? []);
    const slug = editing.slug || `${slugify(editing.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const payload: any = {
      author_user_id: userId,
      author_name: doctor.full_name,
      author_avatar_url: doctor.avatar_url,
      title: editing.title.trim().slice(0, 200),
      slug,
      excerpt: editing.excerpt?.trim().slice(0, 300) || null,
      body: editing.body.trim(),
      cover_image_url: editing.cover_image_url?.trim() || null,
      category: editing.category || "Wellness",
      tags,
      read_minutes: Number(editing.read_minutes) || 4,
      status: editing.status,
      published_at: editing.status === "published" ? new Date().toISOString() : null,
    };
    const { error } = editing.id
      ? await supabase.from("health_blogs").update(payload).eq("id", editing.id)
      : await supabase.from("health_blogs").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Blog updated" : "Blog created");
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    await supabase.from("health_blogs").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  if (!doctor) return <Card className="p-8 text-center text-muted-foreground">Approved doctor profile required to publish health blogs.</Card>;

  if (editing) {
    return (
      <Card className="p-6">
        <h2 className="font-display text-2xl">{editing.id ? "Edit blog" : "New blog"}</h2>
        <div className="mt-6 grid gap-4">
          <div><Label>Title *</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} maxLength={200} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Category</Label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
            <div><Label>Read time (min)</Label><Input type="number" value={editing.read_minutes} onChange={(e) => setEditing({ ...editing, read_minutes: e.target.value })} /></div>
          </div>
          <div><Label>Cover image URL</Label><Input value={editing.cover_image_url || ""} onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })} /></div>
          <div><Label>Excerpt (short summary)</Label><Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} maxLength={300} /></div>
          <div><Label>Body *</Label><Textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={14} /></div>
          <div><Label>Tags (comma separated)</Label><Input value={typeof editing.tags === "string" ? editing.tags : (editing.tags ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} /></div>
          <div><Label>Status</Label>
            <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="hero" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">My Health Blogs</h2>
          <p className="text-sm text-muted-foreground">Write articles for patients and the Ayurveda community.</p>
        </div>
        <Button variant="hero" onClick={() => setEditing(blank)}><Plus className="h-4 w-4" /> New blog</Button>
      </div>
      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
        blogs.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No blogs yet. Click "New blog" to start writing.</Card> :
          <div className="space-y-3">
            {blogs.map((b) => (
              <Card key={b.id} className="flex items-center gap-4 p-4">
                {b.cover_image_url ? <img src={b.cover_image_url} alt="" className="h-16 w-24 rounded object-cover" /> : <div className="h-16 w-24 rounded gradient-soft" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{b.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{b.category} · {b.view_count} views · {new Date(b.created_at).toLocaleDateString()}</p>
                </div>
                {b.status === "published" && <Button asChild size="sm" variant="ghost"><Link to={`/learning/blogs/${b.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link></Button>}
                <Button size="sm" variant="ghost" onClick={() => setEditing({ ...b, tags: (b.tags || []).join(", ") })}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>}
    </div>
  );
};

export default DoctorBlogs;
