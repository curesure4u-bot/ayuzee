import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase, Building2, Calendar, CheckCircle2, Clock, Loader2, MapPin, Search, Send, Users,
} from "lucide-react";
import { toast } from "sonner";
import { useInternshipMarketplace, type InternshipListing } from "@/hooks/useInternshipMarketplace";

const statusColor: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  shortlisted: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const InternshipMarketplace = () => {
  const { listings, myApplications, appliedListingIds, loading, apply } = useInternshipMarketplace();
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [applyListing, setApplyListing] = useState<InternshipListing | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return listings;
    const q = search.toLowerCase();
    return listings.filter((l) =>
      l.title.toLowerCase().includes(q) || l.hospital_name.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) || l.department.toLowerCase().includes(q)
    );
  }, [listings, search]);

  const handleApply = async () => {
    if (!applyListing || !coverNote.trim()) { toast.error("Please write a cover note"); return; }
    setApplying(true);
    const result = await apply(applyListing.id, coverNote.trim());
    setApplying(false);
    if (result.success) {
      toast.success("Application submitted!");
      setApplyListing(null);
      setCoverNote("");
    } else {
      toast.error(result.error || "Failed to apply");
    }
  };

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" /> Internship Marketplace
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Find clinical internships at AYUSH hospitals across India</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="browse" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Browse ({listings.length})</TabsTrigger>
          <TabsTrigger value="applications" className="gap-1.5"><Send className="h-3.5 w-3.5" /> My Applications ({myApplications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by title, hospital, location, department..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No internships match your search.</CardContent></Card>
          ) : filtered.map((listing) => {
            const applied = appliedListingIds.includes(listing.id);
            const deadlinePassed = listing.application_deadline && new Date(listing.application_deadline) < new Date();
            return (
              <Card key={listing.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{listing.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {listing.hospital_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.location}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{listing.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{listing.department}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" /> {listing.duration_weeks} weeks</span>
                        {listing.stipend && <Badge variant="secondary" className="text-[10px]">{listing.stipend}</Badge>}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Users className="h-3 w-3" /> {listing.spots_available} spots</span>
                        {listing.application_deadline && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar className="h-3 w-3" /> Deadline: {new Date(listing.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {applied ? (
                        <Badge className="bg-green-100 text-green-800 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Applied</Badge>
                      ) : deadlinePassed ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Closed</Badge>
                      ) : (
                        <Button size="sm" onClick={() => setApplyListing(listing)}>Apply</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="applications" className="space-y-3 mt-4">
          {myApplications.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No applications yet. Browse and apply!</CardContent></Card>
          ) : myApplications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{app.listing_title}</p>
                  <p className="text-xs text-muted-foreground">{app.hospital_name} · {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <Badge className={`text-xs capitalize ${statusColor[app.status] || ""}`}>{app.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={!!applyListing} onOpenChange={(open) => !open && setApplyListing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for Internship</DialogTitle></DialogHeader>
          {applyListing && (
            <div className="space-y-4 mt-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium text-sm">{applyListing.title}</p>
                <p className="text-xs text-muted-foreground">{applyListing.hospital_name} · {applyListing.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="cover-note">Cover Note *</label>
                <Textarea id="cover-note" placeholder="Why are you interested? What relevant experience do you have?" value={coverNote} onChange={(e) => setCoverNote(e.target.value)} rows={4} />
              </div>
              <Button onClick={handleApply} disabled={applying} className="w-full">
                {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit Application
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipMarketplace;
