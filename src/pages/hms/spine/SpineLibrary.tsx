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
  BookOpen, Plus, Save, Dumbbell, Salad, Sparkles, GraduationCap, FileText,
  Headphones, Link2, Share2, Trash2, ChevronDown, ChevronRight, Play,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  category: string;
  resource_type: string;
  content?: string | null;
  url?: string | null;
  youtube_id?: string | null;
  condition_tag?: string | null;
  is_published: boolean;
}

const demoResources: Resource[] = [
  { id: "d1", title: "Daily Spine Care Routine (5 min)", category: "exercise", resource_type: "article", content: "Morning: cat-cow x5, knee-to-chest x30s each side, gentle twist. Evening: pelvic tilts x10, child pose x60s. Do daily before getting out of bed.", is_published: true },
  { id: "d2", title: "Anti-Inflammatory Diet for Back Pain", category: "diet", resource_type: "article", content: "Favour: turmeric, ginger, leafy greens, warm cooked foods, sesame oil. Avoid: cold/raw foods, excess caffeine, fried foods, curd at night.", is_published: true },
  { id: "d3", title: "Breath & Relaxation for Pain", category: "meditation", resource_type: "article", content: "4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 8 rounds. Reduces muscle guarding and pain. Practice twice daily.", is_published: true },
  { id: "d4", title: "Posture at Work — Do's and Don'ts", category: "education", resource_type: "article", content: "Screen at eye level, feet flat, hips slightly above knees, stand every 30 min. Avoid slouching and phone-neck.", condition_tag: "cervical", is_published: true },
];

const catMeta: Record<string, { icon: any; color: string; label: string }> = {
  exercise: { icon: Dumbbell, color: "green", label: "Exercises" },
  diet: { icon: Salad, color: "amber", label: "Diet & Nutrition" },
  meditation: { icon: Sparkles, color: "purple", label: "Meditation" },
  education: { icon: GraduationCap, color: "blue", label: "Education" },
  pdf: { icon: FileText, color: "red", label: "Documents" },
  audio: { icon: Headphones, color: "indigo", label: "Audio" },
  protocol: { icon: FileText, color: "cyan", label: "Protocols" },
};

const typeIcon: Record<string, any> = { article: FileText, pdf: FileText, video: Play, audio: Headphones, link: Link2 };

const blank = { title: "", category: "exercise", resource_type: "article", content: "", url: "", condition_tag: "" };

export default function SpineLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from("spine_library_resources") as any)
        .select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false });
      const rows = (data as Resource[]) || [];
      if (rows.length === 0) { setResources(demoResources); setUsingDemo(true); }
      else { setResources(rows); setUsingDemo(false); }
    } catch { setResources(demoResources); setUsingDemo(true); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) { toast.error("Enter a title"); return; }
    if (form.resource_type === "article" && !form.content) { toast.error("Enter the content/instructions"); return; }
    if (form.resource_type !== "article" && !form.url) { toast.error("Enter the file/link URL"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_library_resources") as any).insert({
        owner_id: user?.id || null, title: form.title, category: form.category,
        resource_type: form.resource_type, content: form.content || null, url: form.url || null,
        condition_tag: form.condition_tag || null, audience: "patient", is_published: true,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Resource added to library"); setForm({ ...blank }); setShowForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const remove = async (r: Resource) => {
    if (usingDemo) { toast.info("Demo data"); return; }
    try { await (supabase.from("spine_library_resources") as any).delete().eq("id", r.id); load(); } catch { toast.error("Delete failed"); }
  };

  const share = (r: Resource) => {
    const body = r.url ? r.url : (r.content || "").slice(0, 300);
    const text = `📚 ${r.title}\n\n${body}\n\n— Your Spine Care Team`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const cats = ["all", ...Object.keys(catMeta)];
  const shown = filter === "all" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-emerald-600" /> Patient Library</h1>
          <p className="text-muted-foreground mt-1">Exercises, diet, meditation & guides patients can follow at home — share in one tap.</p>
        </div>
        <div className="flex items-center gap-2">
          {usingDemo && <Badge variant="outline" className="text-[10px]">Demo data</Badge>}
          <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> Add Resource</Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Add Library Resource</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs font-medium">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sciatica Home Exercises" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div><label className="text-xs font-medium">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(catMeta).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Type</label>
                <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article / Instructions</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video Link</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Condition Tag</label><Input value={form.condition_tag} onChange={(e) => setForm({ ...form, condition_tag: e.target.value })} placeholder="sciatica" /></div>
            </div>
            {form.resource_type === "article" ? (
              <div><label className="text-xs font-medium">Content / Instructions</label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="h-24" placeholder="Step-by-step instructions in simple language..." /></div>
            ) : (
              <div><label className="text-xs font-medium">File / Link URL</label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
            )}
            <Button className="w-full gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Adding..." : "Add to Library"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${filter === c ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {c === "all" ? "All" : catMeta[c]?.label || c}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
        shown.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No resources in this category yet.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {shown.map((r) => {
              const meta = catMeta[r.category] || catMeta.exercise;
              const Icon = meta.icon;
              const TIcon = typeIcon[r.resource_type] || FileText;
              const isArticle = r.resource_type === "article";
              const open = expanded === r.id;
              return (
                <Card key={r.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded bg-${meta.color}-100 grid place-items-center shrink-0`}><Icon className={`h-4 w-4 text-${meta.color}-600`} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{r.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-[9px]">{meta.label}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><TIcon className="h-2.5 w-2.5" /> {r.resource_type}</span>
                          {r.condition_tag && <Badge variant="outline" className="text-[9px]">{r.condition_tag}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isArticle ? (
                          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => setExpanded(open ? null : r.id)}>
                            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />} Read
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => r.url && window.open(r.url, "_blank")}><Link2 className="h-3.5 w-3.5" /> Open</Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => share(r)}><Share2 className="h-3.5 w-3.5" /></Button>
                        {!usingDemo && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(r)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                      </div>
                    </div>
                    {open && isArticle && r.content && (
                      <div className="mt-2 pl-12 text-sm text-muted-foreground whitespace-pre-wrap">{r.content}</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
