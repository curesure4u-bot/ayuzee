import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronUp, Lightbulb, Loader2, Plus, Rocket, Search, User } from "lucide-react";
import { toast } from "sonner";
import { useStartupIncubator } from "@/hooks/useStartupIncubator";

const CATEGORIES = ["All", "HealthTech", "EdTech", "Wellness", "E-Commerce", "SaaS", "Social Impact", "Other"];
const STAGES = ["idea", "prototype", "mvp", "launched"];
const stageLabel: Record<string, string> = { idea: "💡 Idea", prototype: "🔧 Prototype", mvp: "🚀 MVP", launched: "✅ Launched" };

const StartupIncubator = () => {
  const { ideas, myUpvotedIds, loading, userId, createIdea, toggleUpvote } = useStartupIncubator();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("HealthTech");
  const [newStage, setNewStage] = useState("idea");
  const [newLooking, setNewLooking] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    let list = ideas;
    if (catFilter !== "All") list = list.filter((i) => i.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.tagline.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return list;
  }, [ideas, search, catFilter]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newTagline.trim() || !newDesc.trim()) { toast.error("Fill all required fields"); return; }
    setCreating(true);
    const lookingFor = newLooking.split(",").map((s) => s.trim()).filter(Boolean);
    const result = await createIdea({ title: newTitle.trim(), tagline: newTagline.trim(), description: newDesc.trim(), category: newCategory, stage: newStage, looking_for: lookingFor });
    setCreating(false);
    if (result) { toast.success("Startup idea posted!"); setDialogOpen(false); setNewTitle(""); setNewTagline(""); setNewDesc(""); setNewLooking(""); }
    else toast.error("Failed to post");
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Rocket className="h-6 w-6 text-primary" /> Startup Incubator</h1>
          <p className="text-sm text-muted-foreground mt-1">Pitch AYUSH startup ideas, find co-founders, get feedback</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Pitch Idea</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Pitch Your Startup Idea</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><label className="text-sm font-medium">Title *</label><Input placeholder="e.g. AyurTrack — AI Prakriti Monitoring" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Tagline *</label><Input placeholder="One-line pitch" value={newTagline} onChange={(e) => setNewTagline(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Description *</label><Textarea placeholder="What problem does it solve? How?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={4} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Category</label><select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>{CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-sm font-medium">Stage</label><select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newStage} onChange={(e) => setNewStage(e.target.value)}>{STAGES.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}</select></div>
              </div>
              <div><label className="text-sm font-medium">Looking For (comma separated)</label><Input placeholder="e.g. Developer, Marketing, Doctor Advisor" value={newLooking} onChange={(e) => setNewLooking(e.target.value)} /></div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">{creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Publish Idea</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}</select>
      </div>

      <Badge variant="outline">{filtered.length} idea{filtered.length !== 1 ? "s" : ""}</Badge>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground"><Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />No ideas yet. Be the first to pitch!</CardContent></Card>
        ) : filtered.map((idea) => (
          <Card key={idea.id} className="hover:border-primary/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button className={`flex flex-col items-center gap-0.5 pt-1 ${myUpvotedIds.includes(idea.id) ? "text-primary" : "text-muted-foreground"}`} onClick={() => toggleUpvote(idea.id)} aria-label="Upvote">
                  <ChevronUp className="h-5 w-5" /><span className="text-xs font-bold">{idea.upvotes}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{idea.title}</h3>
                  <p className="text-xs text-muted-foreground italic">{idea.tagline}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{idea.category}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{stageLabel[idea.stage] || idea.stage}</Badge>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{idea.author_name}</span>
                  </div>
                  {idea.looking_for.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{idea.looking_for.map((l) => <span key={l} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{l}</span>)}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StartupIncubator;
