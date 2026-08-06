import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Banknote, Briefcase, CheckCircle2, Clock, Globe, Loader2, MapPin, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { useFreelanceGigs, type FreelanceGig } from "@/hooks/useFreelanceGigs";

const CATEGORIES = ["All", "Content Writing", "Social Media", "Clinic Management", "Research Assistant", "Translation", "Graphic Design", "Video Editing", "Other"];
const statusColor: Record<string, string> = { applied: "bg-blue-100 text-blue-800", shortlisted: "bg-amber-100 text-amber-800", hired: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };

const FreelanceGigs = () => {
  const { gigs, myApplications, appliedGigIds, loading, applyToGig } = useFreelanceGigs();
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [applyGig, setApplyGig] = useState<FreelanceGig | null>(null);
  const [pitch, setPitch] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [applying, setApplying] = useState(false);

  const filtered = useMemo(() => {
    let list = gigs;
    if (catFilter !== "All") list = list.filter((g) => g.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.skills_required.some((s) => s.toLowerCase().includes(q)));
    }
    return list;
  }, [gigs, search, catFilter]);

  const handleApply = async () => {
    if (!applyGig || !pitch.trim()) { toast.error("Write a pitch"); return; }
    setApplying(true);
    const result = await applyToGig(applyGig.id, pitch.trim(), portfolio.trim() || undefined);
    setApplying(false);
    if (result.success) { toast.success("Application sent!"); setApplyGig(null); setPitch(""); setPortfolio(""); }
    else toast.error(result.error || "Failed");
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" /> Freelance Gigs</h1>
        <p className="text-sm text-muted-foreground mt-1">Content writing, social media, research assistance — earn while you learn</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="browse" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Gigs ({gigs.length})</TabsTrigger>
          <TabsTrigger value="applications" className="gap-1.5"><Send className="h-3.5 w-3.5" /> Applied ({myApplications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search gigs, skills..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="border rounded-md px-3 py-2 text-sm bg-background" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}</select>
          </div>

          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No gigs match your search.</CardContent></Card>
          ) : filtered.map((gig) => {
            const applied = appliedGigIds.includes(gig.id);
            return (
              <Card key={gig.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{gig.title}</h3>
                      {gig.poster_name && <p className="text-xs text-muted-foreground">by {gig.poster_name}</p>}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{gig.category}</Badge>
                        {gig.budget && <span className="flex items-center gap-0.5"><Banknote className="h-3 w-3" /> {gig.budget}</span>}
                        {gig.duration && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {gig.duration}</span>}
                        <span className="flex items-center gap-0.5">{gig.is_remote ? <><Globe className="h-3 w-3" /> Remote</> : <><MapPin className="h-3 w-3" /> {gig.location}</>}</span>
                      </div>
                      {gig.skills_required.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{gig.skills_required.map((s) => <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s}</span>)}</div>}
                    </div>
                    <div className="shrink-0">
                      {applied ? <Badge className="bg-green-100 text-green-800 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Applied</Badge> : <Button size="sm" onClick={() => setApplyGig(gig)}>Apply</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="applications" className="space-y-3 mt-4">
          {myApplications.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No applications yet.</CardContent></Card>
          ) : myApplications.map((app) => (
            <Card key={app.id}><CardContent className="p-3 flex items-center justify-between">
              <div><p className="font-medium text-sm">{app.gig_title}</p><p className="text-xs text-muted-foreground">{new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p></div>
              <Badge className={`text-xs capitalize ${statusColor[app.status] || ""}`}>{app.status}</Badge>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={!!applyGig} onOpenChange={(open) => !open && setApplyGig(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for Gig</DialogTitle></DialogHeader>
          {applyGig && <div className="space-y-4 mt-2">
            <div className="rounded-lg bg-muted/50 p-3"><p className="font-medium text-sm">{applyGig.title}</p><p className="text-xs text-muted-foreground">{applyGig.category} · {applyGig.budget || "Budget TBD"}</p></div>
            <div><label className="text-sm font-medium">Your Pitch *</label><Textarea placeholder="Why are you a good fit? Relevant experience?" value={pitch} onChange={(e) => setPitch(e.target.value)} rows={4} /></div>
            <div><label className="text-sm font-medium">Portfolio URL (optional)</label><Input placeholder="https://..." value={portfolio} onChange={(e) => setPortfolio(e.target.value)} /></div>
            <Button onClick={handleApply} disabled={applying} className="w-full">{applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit Application</Button>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FreelanceGigs;
