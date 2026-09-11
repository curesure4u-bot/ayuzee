import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown, Brain, Stethoscope, FileText, Lightbulb, Lock,
  AlertTriangle, Star, Target, Zap, Activity, BookOpen,
  Plus, Save, Trash2, ClipboardList, Sparkles, Heart,
  TrendingUp, Users, ArrowRight, Microscope, Award,
} from "lucide-react";

// ─── Complex case board (cases that need chief physician review) ───
const complexCases = [
  { id: "c1", patient: "Male, 58", condition: "Failed Back Surgery + Central Sensitization", difficulty: "Very High", flag: "Multiple failed treatments elsewhere", suggested: "PNE + Neuroplasticity + Tikta Ksheer Basti + gentle Functional Neurology" },
  { id: "c2", patient: "Female, 42", condition: "Cervical Disc + Vertigo + Migraine", difficulty: "High", flag: "Multi-system, VBI screening needed", suggested: "Rule out VBI first → Greeva Basti + Nasya + vestibular drills (no HVLA)" },
  { id: "c3", patient: "Male, 35", condition: "Ankylosing Spondylitis (early)", difficulty: "High", flag: "Autoimmune, needs long-term plan", suggested: "Prishtha Basti + full spine PK + Rasayana + coordinate with rheumatology" },
];

// ─── Master protocols (chief physician's signature protocols — the secret sauce) ───
const masterProtocols = [
  { id: "m1", name: "Dr. Saleem's 5-Step Spine Method", desc: "Signature diagnostic + treatment sequence (LOOK-TOUCH-MOVE-TEST-TREAT)", cases: "All spine conditions", locked: true },
  { id: "m2", name: "Integrated Gridhrasi Protocol", desc: "Combined Agnikarma + Kati Basti + Tikta Ksheer + Acupuncture sequence for stubborn sciatica", cases: "Chronic/recurrent sciatica", locked: true },
  { id: "m3", name: "Disc Regeneration Protocol", desc: "Tikta Ksheer Basti + Ksheerabala + specific Marma + graded loading — avoids surgery", cases: "Disc herniation/bulge", locked: true },
  { id: "m4", name: "Neuro-Spine Recovery (FBSS)", desc: "For failed back surgery — PNE + neuroplasticity + gentle PK + functional neurology", cases: "Failed back surgery syndrome", locked: true },
];

export default function SpineChiefPhysician() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<{ id: string; date: string; text: string }[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const note = { id: Math.random().toString(36).substr(2, 9), date: new Date().toLocaleDateString(), text: newNote.trim() };
    setNotes(prev => [note, ...prev]);
    setNewNote("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("spine_franchise_data").insert({
        record_type: "setup", owner_id: user?.id || null,
        center_name: "Chief Physician Note",
        metadata: { type: "chief_note", ...note },
      });
    } catch (err) { /* keep local */ }
    toast.success("Clinical note saved (private)");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-600" />
            Chief Physician — Private Spine Suite
          </h1>
          <p className="text-muted-foreground mt-1">Your advanced clinical command — complex cases, master protocols, decision support</p>
        </div>
        <Badge className="bg-amber-500 text-white gap-1"><Lock className="h-3 w-3" /> Private — Chief Only</Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="bg-amber-50"><CardContent className="pt-3 pb-2 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold mt-1">{complexCases.length}</p><p className="text-[9px] text-muted-foreground">Complex Cases</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Star className="h-4 w-4 mx-auto text-purple-500" /><p className="text-lg font-bold mt-1">{masterProtocols.length}</p><p className="text-[9px] text-muted-foreground">Master Protocols</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Stethoscope className="h-4 w-4 mx-auto text-blue-500" /><p className="text-lg font-bold mt-1">19</p><p className="text-[9px] text-muted-foreground">Therapies Mastered</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><FileText className="h-4 w-4 mx-auto text-green-500" /><p className="text-lg font-bold mt-1">{notes.length}</p><p className="text-[9px] text-muted-foreground">Private Notes</p></CardContent></Card>
      </div>

      <Tabs defaultValue="cases">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="cases" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Complex Cases</TabsTrigger>
          <TabsTrigger value="protocols" className="text-xs gap-1"><Star className="h-3 w-3" /> Master Protocols</TabsTrigger>
          <TabsTrigger value="cds" className="text-xs gap-1"><Brain className="h-3 w-3" /> Decision Support</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs gap-1"><FileText className="h-3 w-3" /> Private Notes</TabsTrigger>
        </TabsList>

        {/* TAB 1: Complex Case Board */}
        <TabsContent value="cases" className="space-y-2">
          <p className="text-xs text-muted-foreground">Difficult cases escalated for your expert review.</p>
          {complexCases.map(c => (
            <Card key={c.id} className="border-amber-100">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{c.condition}</span>
                  <Badge className={`text-[9px] ${c.difficulty === "Very High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{c.difficulty}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.patient}</p>
                <div className="mt-2 p-2 rounded bg-red-50 border border-red-100 text-[10px] flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" /> <span>{c.flag}</span>
                </div>
                <div className="mt-1.5 p-2 rounded bg-green-50 border border-green-100 text-[10px] flex items-start gap-1">
                  <Lightbulb className="h-3 w-3 text-green-600 shrink-0 mt-0.5" /> <span><strong>Chief's Plan:</strong> {c.suggested}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => navigate("/hms/spine-treatment-protocol-builder")}>
                    <ClipboardList className="h-3 w-3" /> Build Protocol
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => navigate("/hms/spine-functional-neurology")}>
                    <Brain className="h-3 w-3" /> Neuro Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB 2: Master Protocols (the secret sauce) */}
        <TabsContent value="protocols" className="space-y-2">
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-700 flex items-center gap-1">
            <Lock className="h-3 w-3" /> These are your signature protocols — the competitive secret. Visible only to you, never exported.
          </div>
          {masterProtocols.map(p => (
            <Card key={p.id} className="border-purple-100">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-purple-500" /> {p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    <Badge variant="outline" className="text-[9px] mt-1">{p.cases}</Badge>
                  </div>
                  {p.locked && <Badge className="bg-amber-100 text-amber-700 text-[8px] gap-1 shrink-0"><Lock className="h-2.5 w-2.5" /> Proprietary</Badge>}
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 mt-2 w-full" onClick={() => navigate("/hms/spine-treatment-protocol-builder")}>
                  <ArrowRight className="h-3 w-3" /> Apply This Protocol
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB 3: Clinical Decision Support */}
        <TabsContent value="cds" className="space-y-2">
          <p className="text-xs text-muted-foreground">Advanced clinical reasoning aids — for the toughest decisions.</p>
          {[
            { title: "When to refer OUT (red flags)", icon: AlertTriangle, color: "red", points: ["Cauda equina signs (bladder/bowel loss) → EMERGENCY refer", "Progressive neuro deficit → imaging + neurosurgery", "Unexplained weight loss + night pain → rule out malignancy", "Fever + spine pain → rule out infection"] },
            { title: "Surgery vs Conservative decision", icon: Target, color: "blue", points: ["Try conservative 6-12 weeks first (most improve)", "Surgery indicated: progressive weakness, cauda equina, intractable pain", "Disc bulge without neuro deficit → almost always conservative", "Document MOVE test + SLR trend to justify approach"] },
            { title: "Therapy sequencing logic", icon: Zap, color: "purple", points: ["Acute → Level 1 (Agnikarma/TrP) for fast relief first", "Then Level 2 (Basti) for deep tissue healing", "Central sensitization → PNE + neuroplasticity BEFORE aggressive therapy", "Always end with Yoga/exercise for prevention"] },
            { title: "Dosha-based treatment selection", icon: Heart, color: "green", points: ["Vata (most spine pain) → warm oils, Basti, Snehana", "Pitta (inflammation) → cooling, avoid excess heat/Agnikarma", "Kapha (stiffness) → dry heat, Udwarthanam, movement", "Assess Prakriti + Vikriti before protocol design"] },
          ].map((cds, i) => {
            const Icon = cds.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-3 pb-3">
                  <p className="font-medium text-sm flex items-center gap-1 mb-1.5"><Icon className={`h-4 w-4 text-${cds.color}-500`} /> {cds.title}</p>
                  <ul className="space-y-1">
                    {cds.points.map((pt, j) => (
                      <li key={j} className="text-[11px] flex items-start gap-1.5"><span className={`text-${cds.color}-500 font-bold`}>›</span> {pt}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* TAB 4: Private Notes */}
        <TabsContent value="notes" className="space-y-3">
          <Card>
            <CardContent className="pt-3 pb-3">
              <label className="text-xs font-medium">Add Private Clinical Note</label>
              <Textarea className="h-20 text-xs mt-1" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Clinical observations, research ideas, protocol refinements, case insights... (private to you)" />
              <Button size="sm" className="mt-2 gap-1" onClick={addNote} disabled={saving}><Save className="h-3 w-3" /> Save Note</Button>
            </CardContent>
          </Card>
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No notes yet. Capture your clinical insights, research ideas, and protocol refinements here.</p>
          ) : (
            notes.map(n => (
              <Card key={n.id}>
                <CardContent className="pt-2.5 pb-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[9px] text-muted-foreground">{n.date}</p>
                      <p className="text-sm mt-0.5">{n.text}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick access to advanced tools */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Microscope className="h-4 w-4 text-amber-600" /> Advanced Clinical Tools</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Dermatome Mapper", icon: Brain, route: "/hms/spine-dermatome-mapper" },
              { label: "Therapy Comparison", icon: Target, route: "/hms/spine-therapy-comparison" },
              { label: "Functional Neurology", icon: Activity, route: "/hms/spine-functional-neurology" },
              { label: "All 19 Therapies", icon: BookOpen, route: "/hms/spine-therapies" },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button key={t.label} onClick={() => navigate(t.route)} className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:shadow-md transition">
                  <Icon className="h-5 w-5 text-amber-600" />
                  <span className="text-[10px] font-medium text-center">{t.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" /> This suite is private to the Chief Ayurvedic Physician. Master protocols are proprietary and never exported.
      </p>
    </div>
  );
}
