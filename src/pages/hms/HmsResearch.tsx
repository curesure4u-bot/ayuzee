import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GraduationCap, Plus, BookOpen, FileText, Award,
  Users, Calendar, TrendingUp, ClipboardList,
} from "lucide-react";

type ResearchProject = {
  id: string;
  title: string;
  pi: string;
  type: "clinical_trial" | "case_series" | "observational" | "review";
  status: "active" | "completed" | "planning" | "published";
  startDate: string;
  subjects: number;
};

type Publication = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: "original" | "review" | "case_report";
};

const mockProjects: ResearchProject[] = [
  { id: "1", title: "Efficacy of Panchakarma in Grade 2 Knee OA - RCT", pi: "Dr. Arun Sharma", type: "clinical_trial", status: "active", startDate: "2026-01-15", subjects: 60 },
  { id: "2", title: "Case Series: Shirodhara in Chronic Insomnia", pi: "Dr. Meena Patel", type: "case_series", status: "active", startDate: "2026-04-01", subjects: 25 },
  { id: "3", title: "Observational Study: Prakruti and Disease Susceptibility", pi: "Dr. Arun Sharma", type: "observational", status: "planning", startDate: "2026-08-01", subjects: 200 },
  { id: "4", title: "Kottamchukkadi Tailam in Lumbar Spondylosis", pi: "Dr. Nair", type: "clinical_trial", status: "completed", startDate: "2025-06-01", subjects: 40 },
  { id: "5", title: "Review: AI in Ayurvedic Diagnosis - Systematic Review", pi: "Dr. Arun Sharma", type: "review", status: "published", startDate: "2025-09-01", subjects: 0 },
];

const mockPublications: Publication[] = [
  { id: "1", title: "AI-Assisted Prakruti Assessment: A Validation Study", authors: "Sharma A, Patel M et al.", journal: "J Ayurveda Integr Med", year: "2026", type: "original" },
  { id: "2", title: "Panchakarma Outcomes in Osteoarthritis: 5-Year Data", authors: "Sharma A, Nair K", journal: "Anc Sci Life", year: "2025", type: "original" },
  { id: "3", title: "Case Report: Complete Remission of Psoriasis with Shodhana", authors: "Patel M", journal: "Ayu Journal", year: "2025", type: "case_report" },
  { id: "4", title: "Digital Health in AYUSH: Opportunities & Challenges", authors: "Sharma A", journal: "Indian J Trad Knowledge", year: "2025", type: "review" },
];

const HmsResearch = () => {
  const [projects] = useState<ResearchProject[]>(mockProjects);
  const [publications] = useState<Publication[]>(mockPublications);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" /> Research & Academic Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Clinical Trials, Case Documentation, Publications, Thesis & CME Tracking
          </p>
        </div>
        <Button onClick={() => setNewProjectOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><ClipboardList className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{projects.filter(p => p.status === "active").length}</p><p className="text-xs text-muted-foreground">Active Studies</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><FileText className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{publications.length}</p><p className="text-xs text-muted-foreground">Publications</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{projects.reduce((s, p) => s + p.subjects, 0)}</p><p className="text-xs text-muted-foreground">Total Subjects</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Award className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">12</p><p className="text-xs text-muted-foreground">CME Credits</p></CardContent></Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="projects">Research Projects</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="academic">Academic & CME</TabsTrigger>
          <TabsTrigger value="thesis">Thesis & Logbook</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Research Projects & Clinical Trials</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="rounded-lg border p-4 hover:bg-muted/30 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{project.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PI: {project.pi} · Started: {new Date(project.startDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Badge variant={
                        project.status === "active" ? "default" :
                        project.status === "completed" ? "outline" :
                        project.status === "published" ? "secondary" : "outline"
                      } className={`text-xs capitalize ${project.status === "completed" || project.status === "published" ? "text-green-600" : ""}`}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">{project.type.replace("_", " ")}</Badge>
                      {project.subjects > 0 && (
                        <span className="text-xs text-muted-foreground">{project.subjects} subjects enrolled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Publications & Presentations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {publications.map((pub) => (
                  <div key={pub.id} className="rounded-lg border p-3 hover:bg-muted/30 transition">
                    <p className="font-medium text-sm">{pub.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{pub.authors}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{pub.journal}</Badge>
                      <span className="text-xs text-muted-foreground">{pub.year}</span>
                      <Badge variant="secondary" className="text-xs capitalize">{pub.type.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">CME (Continuing Medical Education)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Advanced Panchakarma Techniques Workshop", date: "2026-08-15", credits: 4, status: "upcoming" },
                  { title: "AI in AYUSH Practice - Webinar", date: "2026-07-20", credits: 2, status: "registered" },
                  { title: "Evidence-Based Ayurveda Conference", date: "2026-06-10", credits: 6, status: "completed" },
                ].map((cme) => (
                  <div key={cme.title} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <p className="text-sm font-medium">{cme.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(cme.date).toLocaleDateString("en-IN")} · {cme.credits} credits</p>
                    </div>
                    <Badge variant={cme.status === "completed" ? "outline" : "secondary"} className={`text-xs capitalize ${cme.status === "completed" ? "text-green-600" : ""}`}>
                      {cme.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Student Logbooks</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Track internship and PG student clinical exposure</p>
                {[
                  { student: "Dr. Priya (PG-1)", cases: 45, procedures: 12, presentations: 3 },
                  { student: "Dr. Rahul (PG-2)", cases: 78, procedures: 28, presentations: 5 },
                  { student: "Dr. Ananya (Intern)", cases: 22, procedures: 4, presentations: 1 },
                ].map((s) => (
                  <div key={s.student} className="p-2 rounded border">
                    <p className="text-sm font-medium">{s.student}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{s.cases} cases</span>
                      <span className="text-xs text-muted-foreground">{s.procedures} procedures</span>
                      <span className="text-xs text-muted-foreground">{s.presentations} presentations</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="thesis" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Thesis & Dissertation Management</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { student: "Dr. Priya Menon", title: "Role of Janu Basti in Grade 2 OA Knee - Clinical Study", guide: "Dr. Arun Sharma", status: "data_collection", progress: 45 },
                { student: "Dr. Rahul Kumar", title: "Comparative Study of Virechana Yogas in Kushtha", guide: "Dr. Meena Patel", status: "writing", progress: 72 },
                { student: "Dr. Ananya S", title: "Effect of Nasya in Allergic Rhinitis - Pilot Study", guide: "Dr. Nair", status: "protocol_approved", progress: 20 },
              ].map((thesis) => (
                <div key={thesis.student} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{thesis.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Student: {thesis.student} · Guide: {thesis.guide}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">{thesis.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span><span>{thesis.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${thesis.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Research Project</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Project Title</Label><Input placeholder="Study title" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Principal Investigator</Label><Input placeholder="PI Name" /></div>
              <div><Label>Study Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical_trial">Randomized Clinical Trial</SelectItem>
                    <SelectItem value="case_series">Case Series</SelectItem>
                    <SelectItem value="observational">Observational Study</SelectItem>
                    <SelectItem value="review">Systematic Review</SelectItem>
                    <SelectItem value="case_control">Case-Control Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target Sample Size</Label><Input type="number" placeholder="e.g., 60" /></div>
              <div><Label>Start Date</Label><Input type="date" /></div>
            </div>
            <div><Label>Objectives</Label><Textarea placeholder="Primary and secondary objectives..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Research project created"); setNewProjectOpen(false); }}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsResearch;
