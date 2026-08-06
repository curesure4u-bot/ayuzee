import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Clock, FlaskConical, Loader2, Plus, Search, Send, User, Users } from "lucide-react";
import { toast } from "sonner";
import { useResearchCollaboration, type ResearchProject } from "@/hooks/useResearchCollaboration";

const AREAS = ["All", "Clinical Research", "Pharmacology", "Literary Review", "Survey", "Multi-center Trial", "Case Series", "Experimental", "Other"];

const ResearchCollaboration = () => {
  const { projects, myRequests, requestedProjectIds, loading, userId, createProject, sendRequest } = useResearchCollaboration();
  const [tab, setTab] = useState("projects");
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("All");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newArea, setNewArea] = useState("Clinical Research");
  const [newLooking, setNewLooking] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [creating, setCreating] = useState(false);

  // Collab request dialog
  const [requestProject, setRequestProject] = useState<ResearchProject | null>(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = useMemo(() => {
    let list = projects;
    if (areaFilter !== "All") list = list.filter((p) => p.research_area === areaFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.skills_needed.some((s) => s.toLowerCase().includes(q)));
    }
    return list;
  }, [projects, search, areaFilter]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !newLooking.trim()) { toast.error("Fill required fields"); return; }
    setCreating(true);
    const skills = newSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const result = await createProject({ title: newTitle.trim(), description: newDesc.trim(), research_area: newArea, looking_for: newLooking.trim(), skills_needed: skills });
    setCreating(false);
    if (result) { toast.success("Project posted!"); setCreateOpen(false); setNewTitle(""); setNewDesc(""); setNewLooking(""); setNewSkills(""); }
    else toast.error("Failed to create project");
  };

  const handleRequest = async () => {
    if (!requestProject || !requestMsg.trim()) { toast.error("Write a message"); return; }
    setSending(true);
    const result = await sendRequest(requestProject.id, requestMsg.trim());
    setSending(false);
    if (result.success) { toast.success("Request sent!"); setRequestProject(null); setRequestMsg(""); }
    else toast.error(result.error || "Failed");
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-primary" /> Research Collaboration</h1>
          <p className="text-sm text-muted-foreground mt-1">Find co-authors, join multi-center studies, collaborate on research</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Post Project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post Research Project</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><label className="text-sm font-medium">Title *</label><Input placeholder="e.g. RCT on Kshara Sutra for Fistula" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Description *</label><Textarea placeholder="Describe the study..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Research Area</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newArea} onChange={(e) => setNewArea(e.target.value)}>
                    {AREAS.filter((a) => a !== "All").map((a) => <option key={a} value={a}>{a}</option>)}
                  </select></div>
                <div><label className="text-sm font-medium">Skills Needed (comma)</label><Input placeholder="e.g. Statistics, Data Collection" value={newSkills} onChange={(e) => setNewSkills(e.target.value)} /></div>
              </div>
              <div><label className="text-sm font-medium">Looking For *</label><Input placeholder="e.g. Co-author with stats knowledge" value={newLooking} onChange={(e) => setNewLooking(e.target.value)} /></div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">{creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Post Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="projects" className="gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Projects</TabsTrigger>
          <TabsTrigger value="myrequests" className="gap-1.5"><Send className="h-3.5 w-3.5" /> My Requests ({myRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="border rounded-md px-3 py-2 text-sm bg-background" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>{AREAS.map((a) => <option key={a} value={a}>{a === "All" ? "All Areas" : a}</option>)}</select>
          </div>

          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No projects found.</CardContent></Card>
          ) : filtered.map((p) => {
            const isOwner = p.user_id === userId;
            const requested = requestedProjectIds.includes(p.id);
            return (
              <Card key={p.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{p.research_area}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{p.author_name}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.collaborator_count} collaborators</span>
                      </div>
                      <p className="text-xs mt-1"><strong>Looking for:</strong> {p.looking_for}</p>
                      {p.skills_needed.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{p.skills_needed.map((s) => <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s}</span>)}</div>}
                    </div>
                    <div className="shrink-0">
                      {isOwner ? <Badge variant="outline" className="text-xs">Your Project</Badge> :
                       requested ? <Badge className="bg-green-100 text-green-800 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Requested</Badge> :
                       p.status === "open" ? <Button size="sm" onClick={() => setRequestProject(p)}>Collaborate</Button> :
                       <Badge variant="outline" className="text-xs">{p.status}</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="myrequests" className="space-y-3 mt-4">
          {myRequests.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No collaboration requests sent yet.</CardContent></Card>
          ) : myRequests.map((r) => (
            <Card key={r.id}><CardContent className="p-3 flex items-center justify-between">
              <div><p className="font-medium text-sm">{r.project_title}</p><p className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-0.5" />{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p></div>
              <Badge className={`text-xs capitalize ${r.status === "accepted" ? "bg-green-100 text-green-800" : r.status === "declined" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{r.status}</Badge>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={!!requestProject} onOpenChange={(open) => !open && setRequestProject(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request to Collaborate</DialogTitle></DialogHeader>
          {requestProject && <div className="space-y-4 mt-2">
            <div className="rounded-lg bg-muted/50 p-3"><p className="font-medium text-sm">{requestProject.title}</p><p className="text-xs text-muted-foreground">Looking for: {requestProject.looking_for}</p></div>
            <div><label className="text-sm font-medium">Your Message *</label><Textarea placeholder="Describe your experience and how you can contribute..." value={requestMsg} onChange={(e) => setRequestMsg(e.target.value)} rows={4} /></div>
            <Button onClick={handleRequest} disabled={sending} className="w-full">{sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Send Request</Button>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchCollaboration;
