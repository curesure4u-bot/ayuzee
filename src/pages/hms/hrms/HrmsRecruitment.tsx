import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserPlus, Briefcase, Users, CheckCircle2, XCircle,
  Clock, Target, TrendingUp, Plus,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_VACANCIES = [
  { id: "v1", title: "Panchakarma Therapist", department: "Panchakarma", positions: 2, filled: 0, status: "open", priority: "high", postedDate: "2026-08-01", candidates: 5 },
  { id: "v2", title: "Staff Nurse (IPD)", department: "IPD", positions: 1, filled: 0, status: "open", priority: "urgent", postedDate: "2026-08-10", candidates: 3 },
  { id: "v3", title: "Lab Technician", department: "Laboratory", positions: 1, filled: 1, status: "closed", priority: "normal", postedDate: "2026-06-15", candidates: 8 },
  { id: "v4", title: "Receptionist", department: "Front Office", positions: 1, filled: 0, status: "open", priority: "normal", postedDate: "2026-08-15", candidates: 2 },
];

const MOCK_CANDIDATES = [
  { id: "c1", name: "Deepa R", vacancy: "Panchakarma Therapist", qualification: "Diploma in Yoga & Naturopathy", experience: 3, status: "interview", source: "referral", appliedDate: "2026-08-05" },
  { id: "c2", name: "Karthik M", vacancy: "Panchakarma Therapist", qualification: "BSc Yoga", experience: 2, status: "shortlisted", source: "portal", appliedDate: "2026-08-08" },
  { id: "c3", name: "Revathi S", vacancy: "Staff Nurse (IPD)", qualification: "B.Sc Nursing", experience: 5, status: "selected", source: "walk_in", appliedDate: "2026-08-12" },
  { id: "c4", name: "Anand K", vacancy: "Staff Nurse (IPD)", qualification: "GNM", experience: 2, status: "screening", source: "portal", appliedDate: "2026-08-14" },
  { id: "c5", name: "Priya V", vacancy: "Panchakarma Therapist", qualification: "BNYS", experience: 1, status: "applied", source: "website", appliedDate: "2026-08-18" },
  { id: "c6", name: "Santhosh R", vacancy: "Receptionist", qualification: "B.Com", experience: 1, status: "interview", source: "referral", appliedDate: "2026-08-16" },
  { id: "c7", name: "Anita D (Joined)", vacancy: "Lab Technician", qualification: "DMLT", experience: 2, status: "joined", source: "portal", appliedDate: "2026-06-20" },
];

const pipelineStages = ["applied", "screening", "shortlisted", "interview", "selected", "offer", "joined"];
const statusColors: Record<string, string> = {
  applied: "bg-gray-100 text-gray-700",
  screening: "bg-blue-100 text-blue-700",
  shortlisted: "bg-indigo-100 text-indigo-700",
  interview: "bg-amber-100 text-amber-700",
  selected: "bg-green-100 text-green-700",
  offer: "bg-purple-100 text-purple-700",
  joined: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-600",
};
const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const HrmsRecruitment = () => {
  const [vacancies] = useState(MOCK_VACANCIES);
  const [candidates] = useState(MOCK_CANDIDATES);

  const openVacancies = vacancies.filter((v) => v.status === "open");
  const totalCandidates = candidates.length;
  const inPipeline = candidates.filter((c) => !["joined", "rejected", "withdrawn"].includes(c.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" /> Recruitment
          </h1>
          <p className="text-sm text-muted-foreground">Vacancies, candidates & hiring pipeline</p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Post Vacancy</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-100"><CardContent className="p-3 text-center"><Briefcase className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{openVacancies.length}</p><p className="text-[9px] text-muted-foreground">Open Vacancies</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{totalCandidates}</p><p className="text-[9px] text-muted-foreground">Total Candidates</p></CardContent></Card>
        <Card className="border-amber-100"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{inPipeline}</p><p className="text-[9px] text-muted-foreground">In Pipeline</p></CardContent></Card>
        <Card className="border-purple-100"><CardContent className="p-3 text-center"><Target className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{openVacancies.reduce((s, v) => s + v.positions, 0)}</p><p className="text-[9px] text-muted-foreground">Positions to Fill</p></CardContent></Card>
      </div>

      {/* Pipeline Visual */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Hiring Pipeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-1">
            {pipelineStages.map((stage) => {
              const count = candidates.filter((c) => c.status === stage).length;
              return (
                <div key={stage} className="flex-1 text-center">
                  <div className={`rounded-lg p-2 ${statusColors[stage]}`}>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-[9px] capitalize">{stage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vacancies">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="vacancies">Vacancies ({vacancies.length})</TabsTrigger>
          <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vacancies" className="space-y-3">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Position</th>
                  <th className="px-3 py-2 text-left font-medium">Department</th>
                  <th className="px-3 py-2 text-center font-medium">Positions</th>
                  <th className="px-3 py-2 text-center font-medium">Candidates</th>
                  <th className="px-3 py-2 text-center font-medium">Priority</th>
                  <th className="px-3 py-2 text-center font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Posted</th>
                </tr>
              </thead>
              <tbody>
                {vacancies.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium">{v.title}</td>
                    <td className="px-3 py-2">{v.department}</td>
                    <td className="px-3 py-2 text-center">{v.filled}/{v.positions}</td>
                    <td className="px-3 py-2 text-center font-medium">{v.candidates}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] border-0 capitalize ${priorityColors[v.priority]}`}>{v.priority}</Badge></td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] border-0 capitalize ${v.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{v.status}</Badge></td>
                    <td className="px-3 py-2 text-[10px]">{new Date(v.postedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-3">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Candidate</th>
                  <th className="px-3 py-2 text-left font-medium">For Position</th>
                  <th className="px-3 py-2 text-left font-medium">Qualification</th>
                  <th className="px-3 py-2 text-center font-medium">Exp (yrs)</th>
                  <th className="px-3 py-2 text-center font-medium">Source</th>
                  <th className="px-3 py-2 text-center font-medium">Stage</th>
                  <th className="px-3 py-2 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2">{c.vacancy}</td>
                    <td className="px-3 py-2">{c.qualification}</td>
                    <td className="px-3 py-2 text-center">{c.experience}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[8px] capitalize">{c.source?.replace("_", " ")}</Badge></td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] border-0 capitalize ${statusColors[c.status]}`}>{c.status}</Badge></td>
                    <td className="px-3 py-2 text-center">
                      {!["joined", "rejected", "withdrawn"].includes(c.status) && (
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => toast.success("Advanced to next stage")}><CheckCircle2 className="h-3 w-3 text-green-600" /></Button>
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => toast.info("Candidate rejected")}><XCircle className="h-3 w-3 text-red-500" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsRecruitment;
