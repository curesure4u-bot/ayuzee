import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Video, Camera, Globe, MessageSquare, Share2,
  Plus, Save, ExternalLink, Trash2, Users, Link2, Image as ImageIcon,
} from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  handle?: string | null;
  url: string;
  follower_label?: string | null;
  is_active: boolean;
}
interface SocialPost {
  id: string;
  platform: string;
  post_url: string;
  caption?: string | null;
  thumbnail_url?: string | null;
  is_published: boolean;
}

const platMeta: Record<string, { icon: any; color: string; label: string }> = {
  youtube: { icon: Video, color: "text-red-600", label: "YouTube" },
  instagram: { icon: Camera, color: "text-pink-600", label: "Instagram" },
  facebook: { icon: Globe, color: "text-blue-600", label: "Facebook" },
  linkedin: { icon: Users, color: "text-sky-700", label: "LinkedIn" },
  whatsapp: { icon: MessageSquare, color: "text-green-600", label: "WhatsApp" },
  website: { icon: Globe, color: "text-slate-600", label: "Website" },
  x: { icon: Globe, color: "text-slate-900", label: "X" },
};

const demoLinks: SocialLink[] = [
  { id: "d1", platform: "youtube", handle: "@ayuzeespine", url: "https://youtube.com/@ayuzee", follower_label: "5.2K", is_active: true },
  { id: "d2", platform: "instagram", handle: "@ayuzee", url: "https://instagram.com/ayuzee", follower_label: "12.5K", is_active: true },
  { id: "d3", platform: "facebook", handle: "Ayuzee", url: "https://facebook.com/ayuzee", follower_label: "8.1K", is_active: true },
  { id: "d4", platform: "whatsapp", handle: "Clinic", url: "https://wa.me/919999999999", follower_label: "Chat", is_active: true },
];

const blankLink = { platform: "instagram", handle: "", url: "", follower_label: "" };
const blankPost = { platform: "instagram", post_url: "", caption: "", thumbnail_url: "" };

export default function SpineSocialHub() {
  const [tab, setTab] = useState("links");
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linkForm, setLinkForm] = useState({ ...blankLink });
  const [postForm, setPostForm] = useState({ ...blankPost });
  const [showLink, setShowLink] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: l } = await (supabase.from("spine_social_links") as any).select("*").order("display_order", { ascending: true });
      const { data: p } = await (supabase.from("spine_social_posts") as any).select("*").order("display_order", { ascending: true });
      const lr = (l as SocialLink[]) || [];
      if (lr.length === 0) { setLinks(demoLinks); setUsingDemo(true); } else { setLinks(lr); setUsingDemo(false); }
      setPosts((p as SocialPost[]) || []);
    } catch { setLinks(demoLinks); setUsingDemo(true); setPosts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveLink = async () => {
    if (!linkForm.url) { toast.error("Enter the profile URL"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_social_links") as any).insert({
        owner_id: user?.id || null, platform: linkForm.platform, handle: linkForm.handle || null,
        url: linkForm.url, follower_label: linkForm.follower_label || null, is_active: true,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Profile link added"); setLinkForm({ ...blankLink }); setShowLink(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const savePost = async () => {
    if (!postForm.post_url) { toast.error("Enter the post URL"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_social_posts") as any).insert({
        owner_id: user?.id || null, platform: postForm.platform, post_url: postForm.post_url,
        caption: postForm.caption || null, thumbnail_url: postForm.thumbnail_url || null, is_published: true,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Post featured"); setPostForm({ ...blankPost }); setShowPost(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const removeLink = async (l: SocialLink) => {
    if (usingDemo) { toast.info("Demo data"); return; }
    try { await (supabase.from("spine_social_links") as any).delete().eq("id", l.id); load(); } catch { toast.error("Delete failed"); }
  };
  const removePost = async (p: SocialPost) => {
    try { await (supabase.from("spine_social_posts") as any).delete().eq("id", p.id); load(); } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Share2 className="h-6 w-6 text-pink-600" /> Social Hub</h1>
          <p className="text-muted-foreground mt-1">All your clinic's social profiles and featured posts in one place — no API setup needed.</p>
        </div>
        {usingDemo && <Badge variant="outline" className="text-[10px]">Demo data</Badge>}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="links" className="text-xs gap-1"><Link2 className="h-3 w-3" /> Profiles</TabsTrigger>
          <TabsTrigger value="posts" className="text-xs gap-1"><ImageIcon className="h-3 w-3" /> Featured Posts</TabsTrigger>
        </TabsList>

        {/* PROFILE LINKS */}
        <TabsContent value="links" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowLink((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> Add Profile</Button>
          </div>
          {showLink && (
            <Card className="border-pink-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Add Social Profile</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Platform</label>
                    <Select value={linkForm.platform} onValueChange={(v) => setLinkForm({ ...linkForm, platform: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(platMeta).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs font-medium">Handle</label><Input value={linkForm.handle} onChange={(e) => setLinkForm({ ...linkForm, handle: e.target.value })} placeholder="@ayuzee" /></div>
                </div>
                <div><label className="text-xs font-medium">Profile URL</label><Input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="https://instagram.com/..." /></div>
                <div><label className="text-xs font-medium">Follower count (manual)</label><Input value={linkForm.follower_label} onChange={(e) => setLinkForm({ ...linkForm, follower_label: e.target.value })} placeholder="12.5K" /></div>
                <Button className="w-full gap-1" onClick={saveLink} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Add Profile"}</Button>
              </CardContent>
            </Card>
          )}

          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {links.map((l) => {
                const meta = platMeta[l.platform] || platMeta.website;
                const Icon = meta.icon;
                return (
                  <Card key={l.id}>
                    <CardContent className="pt-4 text-center">
                      <Icon className={`h-7 w-7 mx-auto ${meta.color}`} />
                      <p className="font-semibold text-sm mt-2">{meta.label}</p>
                      {l.handle && <p className="text-[11px] text-muted-foreground">{l.handle}</p>}
                      {l.follower_label && <p className="text-xs font-medium mt-1 flex items-center justify-center gap-1"><Users className="h-3 w-3" /> {l.follower_label}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        <Button size="sm" variant="outline" className="gap-1 flex-1 text-[11px]" onClick={() => window.open(l.url, "_blank")}><ExternalLink className="h-3 w-3" /> Visit</Button>
                        {!usingDemo && <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => removeLink(l)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* FEATURED POSTS */}
        <TabsContent value="posts" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowPost((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> Feature Post</Button>
          </div>
          {showPost && (
            <Card className="border-pink-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Feature a Social Post</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Platform</label>
                    <Select value={postForm.platform} onValueChange={(v) => setPostForm({ ...postForm, platform: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="facebook">Facebook</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs font-medium">Thumbnail URL (optional)</label><Input value={postForm.thumbnail_url} onChange={(e) => setPostForm({ ...postForm, thumbnail_url: e.target.value })} placeholder="https://..." /></div>
                </div>
                <div><label className="text-xs font-medium">Post URL</label><Input value={postForm.post_url} onChange={(e) => setPostForm({ ...postForm, post_url: e.target.value })} placeholder="https://instagram.com/p/..." /></div>
                <div><label className="text-xs font-medium">Caption</label><Textarea value={postForm.caption} onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })} className="h-14" /></div>
                <Button className="w-full gap-1" onClick={savePost} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Feature Post"}</Button>
              </CardContent>
            </Card>
          )}

          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
            posts.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No featured posts yet. Add your best social posts to showcase them here.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((p) => {
                  const meta = platMeta[p.platform] || platMeta.instagram;
                  const Icon = meta.icon;
                  return (
                    <Card key={p.id} className="overflow-hidden">
                      {p.thumbnail_url ? (
                        <div className="aspect-square bg-muted"><img src={p.thumbnail_url} alt={p.caption || "post"} className="w-full h-full object-cover" loading="lazy" /></div>
                      ) : (
                        <div className="aspect-square bg-muted grid place-items-center"><Icon className={`h-10 w-10 ${meta.color}`} /></div>
                      )}
                      <CardContent className="pt-3">
                        <div className="flex items-center gap-1.5"><Icon className={`h-3.5 w-3.5 ${meta.color}`} /><Badge variant="secondary" className="text-[9px]">{meta.label}</Badge></div>
                        {p.caption && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.caption}</p>}
                        <div className="flex items-center gap-1 mt-2">
                          <Button size="sm" variant="outline" className="gap-1 flex-1 text-[11px]" onClick={() => window.open(p.post_url, "_blank")}><ExternalLink className="h-3 w-3" /> View</Button>
                          <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => removePost(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
