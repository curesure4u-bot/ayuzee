import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  Stethoscope,
  Trash2,
  TrendingUp,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useInternshipJournal } from "@/hooks/useInternshipJournal";

const DEPARTMENTS = [
  "Kayachikitsa",
  "Shalya Tantra",
  "Shalakya Tantra",
  "Prasuti & Stree Roga",
  "Kaumarabhritya",
  "Panchakarma",
  "Swasthavritta",
  "Agadatantra",
  "Dravyaguna",
  "Rasa Shastra",
  "Emergency",
  "OPD",
  "IPD",
  "Other",
];

const InternshipJournal = () => {
  const { entries, stats, loading, createEntry, deleteEntry } = useInternshipJournal();
  const [tab, setTab] = useState("entries");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState("All");

  // Form state
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10));
  const [department, setDepartment] = useState("Kayachikitsa");
  const [hospitalName, setHospitalName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [casesSeen, setCasesSeen] = useState("0");
  const [procedures, setProcedures] = useState("");
  const [diagnoses, setDiagnoses] = useState("");
  const [learnings, setLearnings] = useState("");
  const [challenges, setChallenges] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hoursSpent, setHoursSpent] = useState("4");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setPostingDate(new Date().toISOString().slice(0, 10));
    setDepartment("Kayachikitsa");
    setHospitalName("");
    setSupervisorName("");
    setCasesSeen("0");
    setProcedures("");
    setDiagnoses("");
    setLearnings("");
    setChallenges("");
    setFeedback("");
    setHoursSpent("4");
  };

  const handleSave = async () => {
    if (!learnings.trim()) { toast.error("Learnings field is required"); return; }
    setSaving(true);

    const result = await createEntry({
      posting_date: postingDate,
      department,
      hospital_name: hospitalName.trim() || null,
      supervisor_name: supervisorName.trim() || null,
      cases_seen: parseInt(casesSeen) || 0,
      procedures_performed: procedures.split(",").map((p) => p.trim()).filter(Boolean),
      diagnosis_observed: diagnoses.split(",").map((d) => d.trim()).filter(Boolean),
      learnings: learnings.trim(),
      challenges: challenges.trim() || null,
      supervisor_feedback: feedback.trim() || null,
      hours_spent: parseFloat(hoursSpent) || 0,
    });

    setSaving(false);
    if (result) {
      toast.success("Journal entry saved!");
      setDialogOpen(false);
      resetForm();
    } else {
      toast.error("Failed to save entry");
    }
  };

  const filteredEntries = deptFilter === "All" ? entries : entries.filter((e) => e.department === deptFilter);

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Internship Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log your clinical postings, procedures, and learnings
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Log Clinical Posting</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium" htmlFor="j-date">Date</label>
                  <Input id="j-date" type="date" value={postingDate} onChange={(e) => setPostingDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="j-dept">Department *</label>
                  <select id="j-dept" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium" htmlFor="j-hospital">Hospital</label>
                  <Input id="j-hospital" placeholder="e.g. SDM Hospital" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="j-supervisor">Supervisor</label>
                  <Input id="j-supervisor" placeholder="e.g. Dr. Sharma" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium" htmlFor="j-cases">Cases Seen</label>
                  <Input id="j-cases" type="number" min="0" value={casesSeen} onChange={(e) => setCasesSeen(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="j-hours">Hours Spent</label>
                  <Input id="j-hours" type="number" min="0" step="0.5" value={hoursSpent} onChange={(e) => setHoursSpent(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="j-procedures">Procedures (comma separated)</label>
                <Input id="j-procedures" placeholder="e.g. Kati Basti, Nasya, BP check" value={procedures} onChange={(e) => setProcedures(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="j-diagnoses">Diagnoses Observed (comma separated)</label>
                <Input id="j-diagnoses" placeholder="e.g. Sandhivata, Amavata, Pandu" value={diagnoses} onChange={(e) => setDiagnoses(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="j-learnings">Key Learnings *</label>
                <Textarea id="j-learnings" placeholder="What did you learn today?" value={learnings} onChange={(e) => setLearnings(e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="j-challenges">Challenges Faced</label>
                <Textarea id="j-challenges" placeholder="Any difficulties or questions?" value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="j-feedback">Supervisor Feedback</label>
                <Textarea id="j-feedback" placeholder="What did your supervisor say?" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="entries" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Entries ({entries.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Stats
          </TabsTrigger>
        </TabsList>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-4 mt-4">
          <select className="border rounded-md px-3 py-2 text-sm bg-background" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} aria-label="Filter by department">
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {filteredEntries.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              No journal entries yet. Start logging your clinical postings!
            </CardContent></Card>
          ) : filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{entry.department}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.posting_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {entry.hours_spent}h
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" /> {entry.cases_seen} cases
                      </span>
                    </div>
                    {entry.hospital_name && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {entry.hospital_name}
                        {entry.supervisor_name && <> · <User className="h-3 w-3" /> {entry.supervisor_name}</>}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={async () => { const ok = await deleteEntry(entry.id); if (ok) toast.success("Entry deleted"); }}
                    aria-label="Delete entry">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-sm whitespace-pre-wrap">{entry.learnings}</p>

                {(entry.procedures_performed || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.procedures_performed.map((p) => (
                      <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                )}

                {(entry.diagnosis_observed || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.diagnosis_observed.map((d) => (
                      <span key={d} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{d}</span>
                    ))}
                  </div>
                )}

                {entry.challenges && (
                  <p className="text-xs text-muted-foreground italic">Challenge: {entry.challenges}</p>
                )}
                {entry.supervisor_feedback && (
                  <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">Feedback: {entry.supervisor_feedback}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-primary">{stats.totalEntries}</p>
                <p className="text-[10px] text-muted-foreground">Postings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-indigo-600">{stats.totalHours}h</p>
                <p className="text-[10px] text-muted-foreground">Total Hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{stats.totalCases}</p>
                <p className="text-[10px] text-muted-foreground">Cases Seen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-amber-600">{stats.totalProcedures}</p>
                <p className="text-[10px] text-muted-foreground">Procedures</p>
              </CardContent>
            </Card>
          </div>

          {stats.departmentBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Department Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.departmentBreakdown.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{dept.entries} days</Badge>
                      <Badge variant="secondary" className="text-[10px]">{dept.hours}h</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InternshipJournal;
