import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Star, Heart, TrendingDown, Quote, Plus, Save, Trophy,
  CheckCircle2, Share2, Sparkles,
} from "lucide-react";

interface Story {
  id: string;
  patient_name: string;
  patient_initial?: string | null;
  condition: string;
  age_group?: string | null;
  story: string;
  pain_before?: number | null;
  pain_after?: number | null;
  sessions_taken?: number | null;
  duration_weeks?: number | null;
  therapies_used?: string[] | null;
  rating?: number | null;
  is_published: boolean;
  is_featured?: boolean;
}

const demoStories: Story[] = [
  { id: "d1", patient_name: "Ramesh K.", patient_initial: "R.K.", condition: "Chronic Sciatica (Gridhrasi)", age_group: "45-55", story: "After 8 months of unbearable leg pain and two doctors suggesting surgery, I tried the spine program. Within 4 sessions the pain reduced dramatically. Today I walk 5km every morning, pain-free.", pain_before: 9, pain_after: 1, sessions_taken: 12, duration_weeks: 6, therapies_used: ["Kati Basti", "Agnikarma", "Acupuncture"], rating: 5, is_published: true, is_featured: true },
  { id: "d2", patient_name: "Fathima S.", patient_initial: "F.S.", condition: "Cervical Spondylosis", age_group: "35-45", story: "Constant neck pain and headaches from desk work. The combination of Greeva Basti and home exercises changed everything. My headaches are gone and I sleep well now.", pain_before: 7, pain_after: 2, sessions_taken: 8, duration_weeks: 4, therapies_used: ["Greeva Basti", "Nasya", "Marma Therapy"], rating: 5, is_published: true, is_featured: false },
  { id: "d3", patient_name: "Anil M.", patient_initial: "A.M.", condition: "Lumbar Disc Herniation", age_group: "50-60", story: "I could not bend or sit for more than 10 minutes. The doctor's protocol with cupping and Panchakarma brought me back to normal life in under two months.", pain_before: 8, pain_after: 2, sessions_taken: 14, duration_weeks: 8, therapies_used: ["Cupping", "Kati Basti", "Panchakarma"], rating: 5, is_published: true, is_featured: false },
];

const blank = {
  patient_name: "", patient_initial: "", condition: "", age_group: "",
  story: "", pain_before: "", pain_after: "", sessions_taken: "", duration_weeks: "",
  therapies: "", rating: "5",
};

export default function SpineSuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from("spine_success_stories") as any)
        .select("*")
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      const rows = (data as Story[]) || [];
      if (rows.length === 0) { setStories(demoStories); setUsingDemo(true); }
      else { setStories(rows); setUsingDemo(false); }
    } catch {
      setStories(demoStories); setUsingDemo(true);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.patient_name || !form.condition || !form.story) {
      toast.error("Enter patient name, condition and story");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_success_stories") as any).insert({
        owner_id: user?.id || null,
        patient_name: form.patient_name,
        patient_initial: form.patient_initial || null,
        condition: form.condition,
        age_group: form.age_group || null,
        story: form.story,
        pain_before: form.pain_before ? parseInt(form.pain_before) : null,
        pain_after: form.pain_after ? parseInt(form.pain_after) : null,
        sessions_taken: form.sessions_taken ? parseInt(form.sessions_taken) : null,
        duration_weeks: form.duration_weeks ? parseInt(form.duration_weeks) : null,
        therapies_used: form.therapies ? form.therapies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        rating: parseInt(form.rating) || 5,
        is_published: true,
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else { toast.success("Success story published!"); setForm({ ...blank }); setShowForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const togglePublish = async (s: Story) => {
    if (usingDemo) { toast.info("This is a demo story"); return; }
    try {
      await (supabase.from("spine_success_stories") as any).update({ is_published: !s.is_published }).eq("id", s.id);
      load();
    } catch { toast.error("Update failed"); }
  };

  const share = (s: Story) => {
    const drop = s.pain_before != null && s.pain_after != null ? ` Pain went from ${s.pain_before}/10 to ${s.pain_after}/10.` : "";
    const text = `⭐ ${s.condition} recovery story: "${s.story}"${drop} — ${s.patient_initial || s.patient_name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const totalRecovered = stories.length;
  const avgDrop = (() => {
    const withPain = stories.filter((s) => s.pain_before != null && s.pain_after != null);
    if (!withPain.length) return 0;
    return Math.round(withPain.reduce((a, s) => a + ((s.pain_before || 0) - (s.pain_after || 0)), 0) / withPain.length);
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Success Stories
          </h1>
          <p className="text-muted-foreground mt-1">Real patient recoveries — build trust, convert leads, inspire hope.</p>
        </div>
        <div className="flex items-center gap-2">
          {usingDemo && <Badge variant="outline" className="text-[10px]">Demo data</Badge>}
          <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Story
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalRecovered}</p>
          <p className="text-xs text-muted-foreground">Recovery Stories</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avgDrop} pts</p>
          <p className="text-xs text-muted-foreground">Avg Pain Reduction (VAS)</p>
        </CardContent></Card>
        <Card className="col-span-2 sm:col-span-1"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-pink-600 flex items-center justify-center gap-1">5.0 <Star className="h-4 w-4 fill-pink-600" /></p>
          <p className="text-xs text-muted-foreground">Avg Patient Rating</p>
        </CardContent></Card>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Sparkles className="h-4 w-4" /> New Success Story</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Patient Name</label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} placeholder="Full name (internal)" /></div>
              <div><label className="text-xs font-medium">Public Initials</label><Input value={form.patient_initial} onChange={(e) => setForm({ ...form, patient_initial: e.target.value })} placeholder="e.g. R.K." /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Condition</label><Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g. Sciatica" /></div>
              <div><label className="text-xs font-medium">Age Group</label><Input value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} placeholder="e.g. 45-55" /></div>
            </div>
            <div><label className="text-xs font-medium">Story</label><Textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="In the patient's words..." className="h-24" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Pain Before</label><Input type="number" value={form.pain_before} onChange={(e) => setForm({ ...form, pain_before: e.target.value })} placeholder="0-10" /></div>
              <div><label className="text-xs font-medium">Pain After</label><Input type="number" value={form.pain_after} onChange={(e) => setForm({ ...form, pain_after: e.target.value })} placeholder="0-10" /></div>
              <div><label className="text-xs font-medium">Sessions</label><Input type="number" value={form.sessions_taken} onChange={(e) => setForm({ ...form, sessions_taken: e.target.value })} placeholder="e.g. 12" /></div>
              <div><label className="text-xs font-medium">Weeks</label><Input type="number" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })} placeholder="e.g. 6" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Therapies (comma-separated)</label><Input value={form.therapies} onChange={(e) => setForm({ ...form, therapies: e.target.value })} placeholder="Kati Basti, Acupuncture" /></div>
              <div><label className="text-xs font-medium">Rating</label>
                <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[5, 4, 3].map((n) => <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Publishing..." : "Publish Story"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Story cards */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((s) => (
            <Card key={s.id} className={s.is_featured ? "border-amber-300" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: s.rating || 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="font-semibold text-sm mt-1">{s.condition}</p>
                    <p className="text-[11px] text-muted-foreground">{s.patient_initial || s.patient_name}{s.age_group ? ` · ${s.age_group}` : ""}</p>
                  </div>
                  {s.is_featured && <Badge className="bg-amber-100 text-amber-700 text-[9px]">Featured</Badge>}
                </div>

                <div className="relative mt-2">
                  <Quote className="h-4 w-4 text-muted-foreground/30 absolute -left-1 -top-1" />
                  <p className="text-sm text-muted-foreground pl-4 italic">{s.story}</p>
                </div>

                {(s.pain_before != null && s.pain_after != null) && (
                  <div className="flex items-center gap-3 mt-3 rounded-md bg-green-50 p-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <div className="text-xs">
                      <span className="font-semibold text-green-700">Pain {s.pain_before} → {s.pain_after}</span>
                      <span className="text-muted-foreground"> · {s.sessions_taken || "?"} sessions · {s.duration_weeks || "?"} weeks</span>
                    </div>
                  </div>
                )}

                {s.therapies_used && s.therapies_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.therapies_used.map((t) => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={() => share(s)}><Share2 className="h-3.5 w-3.5" /> Share</Button>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">{s.is_published ? "Published" : "Draft"}</span>
                    <Switch checked={s.is_published} onCheckedChange={() => togglePublish(s)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
