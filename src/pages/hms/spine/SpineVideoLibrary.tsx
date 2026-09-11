import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Save, Play, Trash2, Share2, Dumbbell, GraduationCap,
  Heart, Sparkles, Video as VideoIcon, X,
} from "lucide-react";

interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description?: string | null;
  category: string;
  condition_tag?: string | null;
  audience?: string | null;
  duration_label?: string | null;
  is_published: boolean;
}

const demoVideos: Video[] = [
  { id: "d1", youtube_id: "2NOsE-VPpkE", title: "Lower Back Pain Relief Stretches", description: "Gentle daily stretches for lumbar pain.", category: "exercise", condition_tag: "lbp", audience: "patient", duration_label: "10 min", is_published: true },
  { id: "d2", youtube_id: "wxRQZ-Yl5jU", title: "Sciatica Nerve Glide Exercises", description: "Nerve flossing routine for sciatic leg pain.", category: "exercise", condition_tag: "sciatica", audience: "patient", duration_label: "8 min", is_published: true },
  { id: "d3", youtube_id: "X3-gKPNyrTA", title: "Neck Pain & Cervical Mobility", description: "Neck mobility drills for desk workers.", category: "exercise", condition_tag: "cervical", audience: "patient", duration_label: "6 min", is_published: true },
];

const catMeta: Record<string, { icon: any; color: string; label: string }> = {
  exercise: { icon: Dumbbell, color: "green", label: "Exercise" },
  education: { icon: GraduationCap, color: "blue", label: "Education" },
  testimonial: { icon: Heart, color: "pink", label: "Testimonial" },
  meditation: { icon: Sparkles, color: "purple", label: "Meditation" },
  condition: { icon: Heart, color: "amber", label: "Condition" },
  webinar: { icon: VideoIcon, color: "indigo", label: "Webinar" },
};

// Extract 11-char YouTube id from a raw id or any YouTube URL form
function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = s.match(p); if (m) return m[1]; }
  return null;
}

const blank = { url: "", title: "", description: "", category: "exercise", condition_tag: "", audience: "patient", duration_label: "" };

export default function SpineVideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from("spine_videos") as any)
        .select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false });
      const rows = (data as Video[]) || [];
      if (rows.length === 0) { setVideos(demoVideos); setUsingDemo(true); }
      else { setVideos(rows); setUsingDemo(false); }
    } catch { setVideos(demoVideos); setUsingDemo(true); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const yid = parseYouTubeId(form.url);
    if (!yid) { toast.error("Enter a valid YouTube URL or 11-character video ID"); return; }
    if (!form.title) { toast.error("Enter a title"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_videos") as any).insert({
        owner_id: user?.id || null,
        youtube_id: yid,
        title: form.title,
        description: form.description || null,
        category: form.category,
        condition_tag: form.condition_tag || null,
        audience: form.audience,
        duration_label: form.duration_label || null,
        is_published: true,
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else { toast.success("Video added to library!"); setForm({ ...blank }); setShowForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const remove = async (v: Video) => {
    if (usingDemo) { toast.info("This is a demo video"); return; }
    try { await (supabase.from("spine_videos") as any).delete().eq("id", v.id); load(); }
    catch { toast.error("Delete failed"); }
  };

  const share = (v: Video) => {
    const text = `▶️ ${v.title} — watch: https://youtu.be/${v.youtube_id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const cats = ["all", ...Object.keys(catMeta)];
  const shown = filter === "all" ? videos : videos.filter((v) => v.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><VideoIcon className="h-6 w-6 text-red-600" /> Video Library</h1>
          <p className="text-muted-foreground mt-1">Curated exercise, education & testimonial videos — share with patients in one tap.</p>
        </div>
        <div className="flex items-center gap-2">
          {usingDemo && <Badge variant="outline" className="text-[10px]">Demo data</Badge>}
          <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> Add Video</Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-red-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><VideoIcon className="h-4 w-4 text-red-600" /> Add YouTube Video</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs font-medium">YouTube URL or Video ID</label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://youtu.be/... or 11-char ID" /></div>
            <div><label className="text-xs font-medium">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sciatica Relief Stretches" /></div>
            <div><label className="text-xs font-medium">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-14" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(catMeta).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Audience</label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="patient">Patient</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Condition Tag</label><Input value={form.condition_tag} onChange={(e) => setForm({ ...form, condition_tag: e.target.value })} placeholder="sciatica" /></div>
              <div><label className="text-xs font-medium">Duration</label><Input value={form.duration_label} onChange={(e) => setForm({ ...form, duration_label: e.target.value })} placeholder="6 min" /></div>
            </div>
            <Button className="w-full gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Adding..." : "Add to Library"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${filter === c ? "bg-red-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {c === "all" ? "All" : catMeta[c]?.label || c}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
        shown.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No videos in this category yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((v) => {
              const meta = catMeta[v.category] || catMeta.exercise;
              return (
                <Card key={v.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-black">
                    {playing === v.id ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${v.youtube_id}?autoplay=1`}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button className="w-full h-full group relative" onClick={() => setPlaying(v.id)}>
                        <img src={`https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute inset-0 grid place-items-center bg-black/20 group-hover:bg-black/40 transition">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600"><Play className="h-6 w-6 text-white fill-white ml-0.5" /></span>
                        </span>
                        {v.duration_label && <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">{v.duration_label}</span>}
                      </button>
                    )}
                    {playing === v.id && (
                      <button onClick={() => setPlaying(null)} className="absolute top-1 right-1 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white"><X className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                  <CardContent className="pt-3">
                    <div className="flex items-center gap-1.5">
                      <Badge className={`bg-${meta.color}-100 text-${meta.color}-700 text-[9px]`}>{meta.label}</Badge>
                      {v.condition_tag && <Badge variant="secondary" className="text-[9px]">{v.condition_tag}</Badge>}
                    </div>
                    <p className="font-medium text-sm mt-1.5 line-clamp-2">{v.title}</p>
                    {v.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{v.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={() => share(v)}><Share2 className="h-3.5 w-3.5" /> Share</Button>
                      {!usingDemo && <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => remove(v)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
