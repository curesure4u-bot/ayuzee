import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen, Check, CheckCircle2, Clock, Database, FileUp, Filter,
  Loader2, Plus, Search, Trash2, TrendingUp, X, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQuestionBank, type QuestionFormData, type BankQuestion } from "@/hooks/useQuestionBank";

const SUBJECTS = [
  "Rachana Sharir", "Kriya Sharir", "Dravyaguna", "Rasa Shastra",
  "Kayachikitsa", "Shalya Tantra", "Shalakya Tantra", "Prasuti & Stree Roga",
  "Kaumarabhritya", "Panchakarma", "Swasthavritta", "Agadatantra",
  "Samhita & Siddhant", "Pharmacology", "Pathology", "Anatomy", "Physiology", "General",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUS_FILTERS = ["All", "pending", "approved", "rejected"];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-amber-100 text-amber-800", icon: <Clock className="h-3 w-3" /> },
  approved: { color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
};

// ---------- Add Question Form ----------

function AddQuestionDialog({ onSubmit, saving }: { onSubmit: (data: QuestionFormData) => void; saving: boolean }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("General");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [question, setQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correct, setCorrect] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [reference, setReference] = useState("");
  const [tags, setTags] = useState("");

  const reset = () => {
    setQuestion(""); setOptA(""); setOptB(""); setOptC(""); setOptD("");
    setExplanation(""); setReference(""); setTags(""); setTopic("");
  };

  const handleSubmit = () => {
    if (!question.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      toast.error("Question and all 4 options are required");
      return;
    }
    onSubmit({
      subject, topic: topic.trim() || "General", difficulty, question: question.trim(),
      option_a: optA.trim(), option_b: optB.trim(), option_c: optC.trim(), option_d: optD.trim(),
      correct_option: correct,
      explanation: explanation.trim() || undefined,
      reference_text: reference.trim() || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Question</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Question</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input placeholder="e.g. Asthi Sharir" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty *</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Question *</label>
            <Textarea placeholder="Type the question here..." value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Option A *</label>
              <Input value={optA} onChange={(e) => setOptA(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Option B *</label>
              <Input value={optB} onChange={(e) => setOptB(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Option C *</label>
              <Input value={optC} onChange={(e) => setOptC(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Option D *</label>
              <Input value={optD} onChange={(e) => setOptD(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Correct Answer *</label>
            <div className="flex gap-2 mt-1">
              {["A", "B", "C", "D"].map((opt) => (
                <Button key={opt} variant={correct === opt ? "default" : "outline"} size="sm" onClick={() => setCorrect(opt)}>{opt}</Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Explanation (shown after answering)</label>
            <Textarea placeholder="Why is this the correct answer?" value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Reference</label>
              <Input placeholder="e.g. Charaka Su. 26" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input placeholder="e.g. anatomy, bone, upper limb" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Bulk Import ----------

function BulkImportDialog({ onImport }: { onImport: (questions: QuestionFormData[]) => void }) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<QuestionFormData[]>([]);

  const parseCSV = () => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) { toast.error("Need header + at least 1 row"); return; }

    const parsed: QuestionFormData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("\t").length > 1 ? lines[i].split("\t") : lines[i].split(",");
      if (cols.length >= 7) {
        parsed.push({
          subject: cols[0]?.trim() || "General",
          topic: cols[1]?.trim() || "General",
          difficulty: cols[2]?.trim() || "Medium",
          question: cols[3]?.trim() || "",
          option_a: cols[4]?.trim() || "",
          option_b: cols[5]?.trim() || "",
          option_c: cols[6]?.trim() || "",
          option_d: cols[7]?.trim() || "",
          correct_option: (cols[8]?.trim() || "A").toUpperCase(),
          explanation: cols[9]?.trim() || undefined,
        });
      }
    }
    setPreview(parsed.filter((q) => q.question && q.option_a));
  };

  const handleImport = () => {
    if (preview.length === 0) { toast.error("No valid questions to import"); return; }
    onImport(preview);
    setOpen(false);
    setCsvText("");
    setPreview([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><FileUp className="h-4 w-4" /> Bulk Import</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Bulk Import Questions</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
            <p className="font-medium">Format: Tab or comma separated. One question per line.</p>
            <p className="text-muted-foreground">Columns: Subject, Topic, Difficulty, Question, Option A, Option B, Option C, Option D, Correct (A/B/C/D), Explanation</p>
            <p className="text-muted-foreground">First row should be the header (will be skipped).</p>
          </div>

          <div>
            <label className="text-sm font-medium">Paste CSV/TSV data</label>
            <Textarea placeholder="Subject,Topic,Difficulty,Question,A,B,C,D,Correct,Explanation&#10;Rachana Sharir,Asthi,Easy,How many bones in human body?,206,208,210,212,A,206 bones in adult" value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} className="font-mono text-xs" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={parseCSV}>Preview ({preview.length} questions)</Button>
            {preview.length > 0 && <Button size="sm" onClick={handleImport} className="gap-1.5"><FileUp className="h-3.5 w-3.5" /> Import {preview.length} Questions</Button>}
          </div>

          {preview.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
              {preview.slice(0, 5).map((q, i) => (
                <div key={i} className="rounded bg-muted p-2">
                  <span className="font-medium">{i + 1}.</span> [{q.subject}/{q.difficulty}] {q.question.slice(0, 80)}... → <Badge variant="secondary" className="text-[9px]">{q.correct_option}</Badge>
                </div>
              ))}
              {preview.length > 5 && <p className="text-muted-foreground">...and {preview.length - 5} more</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Question Card ----------

function QuestionCard({
  q, canReview, onApprove, onReject, onDelete,
}: {
  q: BankQuestion;
  canReview: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const config = statusConfig[q.status] || statusConfig.pending;

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{q.question}</p>
            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
              <span className={q.correct_option === "A" ? "text-green-700 font-medium" : "text-muted-foreground"}>A. {q.option_a}</span>
              <span className={q.correct_option === "B" ? "text-green-700 font-medium" : "text-muted-foreground"}>B. {q.option_b}</span>
              <span className={q.correct_option === "C" ? "text-green-700 font-medium" : "text-muted-foreground"}>C. {q.option_c}</span>
              <span className={q.correct_option === "D" ? "text-green-700 font-medium" : "text-muted-foreground"}>D. {q.option_d}</span>
            </div>
            {q.explanation && <p className="text-xs text-muted-foreground mt-1 italic">💡 {q.explanation}</p>}
          </div>
          <Badge className={`text-[10px] gap-1 shrink-0 ${config.color}`}>{config.icon}{q.status}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">{q.subject}</Badge>
            <Badge variant="secondary" className="text-[10px]">{q.difficulty}</Badge>
            {q.topic !== "General" && <span className="text-[10px]">{q.topic}</span>}
            <span>by {q.creator_name}</span>
          </div>

          <div className="flex gap-1">
            {canReview && q.status === "pending" && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => onApprove(q.id)} aria-label="Approve">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setRejectOpen(true)} aria-label="Reject">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {canReview && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(q.id)} aria-label="Delete">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {q.review_note && <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1">Review: {q.review_note}</p>}

        {/* Reject dialog */}
        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Question</AlertDialogTitle>
              <AlertDialogDescription>Provide a reason for rejection (will be shown to the contributor).</AlertDialogDescription>
            </AlertDialogHeader>
            <Input placeholder="Reason for rejection..." value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onReject(q.id); setRejectOpen(false); setRejectNote(""); }}>Reject</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

// ---------- Main Page ----------

const QuestionBankManager = () => {
  const { questions, stats, loading, userRole, createQuestion, bulkImport, approveQuestion, rejectQuestion, deleteQuestion } = useQuestionBank();
  const [tab, setTab] = useState("questions");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [saving, setSaving] = useState(false);

  const canReview = userRole === "mega_admin" || userRole === "quiz_master";
  const canAdd = !!userRole; // Any admin role can add

  const filtered = useMemo(() => {
    let list = questions;
    if (subjectFilter !== "All") list = list.filter((q) => q.subject === subjectFilter);
    if (statusFilter !== "All") list = list.filter((q) => q.status === statusFilter);
    if (difficultyFilter !== "All") list = list.filter((q) => q.difficulty === difficultyFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((q) => q.question.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s) || q.tags.some((t) => t.toLowerCase().includes(s)));
    }
    return list;
  }, [questions, search, subjectFilter, statusFilter, difficultyFilter]);

  const handleCreate = async (data: QuestionFormData) => {
    setSaving(true);
    const result = await createQuestion(data);
    setSaving(false);
    if (result.success) toast.success("Question added!");
    else toast.error(result.error || "Failed");
  };

  const handleBulkImport = async (data: QuestionFormData[]) => {
    setSaving(true);
    const result = await bulkImport(data);
    setSaving(false);
    if (result.success) toast.success(`Imported ${result.count} questions!`);
    else toast.error(result.error || "Import failed");
  };

  const handleApprove = async (id: string) => {
    const ok = await approveQuestion(id);
    if (ok) toast.success("Approved!");
  };

  const handleReject = async (id: string) => {
    const ok = await rejectQuestion(id, "Does not meet quality standards");
    if (ok) toast.success("Rejected");
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteQuestion(id);
    if (ok) toast.success("Deleted");
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (!userRole) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Access Required</h2>
        <p className="text-sm text-muted-foreground mt-2">You need an admin role (Quiz Master, College Admin, or Contributor) to access the Question Bank Manager.</p>
        <p className="text-sm text-muted-foreground mt-1">Ask your Mega Admin to promote you from the Student Admin Panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-primary" /> Question Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage MCQ questions that power quizzes, challenges, and competitions
            <Badge variant="secondary" className="ml-2 text-[10px]">{userRole}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          {canAdd && <AddQuestionDialog onSubmit={handleCreate} saving={saving} />}
          {canAdd && <BulkImportDialog onImport={handleBulkImport} />}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="questions" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="All">All Subjects</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="All">All Difficulty</option>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {canReview && (
              <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
              </select>
            )}
          </div>

          <Badge variant="outline">{filtered.length} questions</Badge>

          {/* Question List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {questions.length === 0 ? "No questions yet. Add your first question!" : "No questions match your filters."}
              </CardContent></Card>
            ) : (
              filtered.slice(0, 50).map((q) => (
                <QuestionCard key={q.id} q={q} canReview={canReview} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
              ))
            )}
            {filtered.length > 50 && <p className="text-xs text-muted-foreground text-center">Showing first 50 of {filtered.length}</p>}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-primary">{stats.total}</p><p className="text-[10px] text-muted-foreground">Total</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">{stats.approved}</p><p className="text-[10px] text-muted-foreground">Approved</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-600">{stats.pending}</p><p className="text-[10px] text-muted-foreground">Pending</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">{stats.rejected}</p><p className="text-[10px] text-muted-foreground">Rejected</p></CardContent></Card>
          </div>

          {stats.bySubject.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">By Subject</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {stats.bySubject.map((s) => (
                  <div key={s.subject} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.subject}</span>
                    <Badge variant="secondary" className="text-[10px]">{s.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {stats.byDifficulty.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">By Difficulty</CardTitle></CardHeader>
              <CardContent className="flex gap-4">
                {stats.byDifficulty.map((d) => (
                  <div key={d.difficulty} className="text-center">
                    <p className="text-lg font-bold">{d.count}</p>
                    <p className="text-[10px] text-muted-foreground">{d.difficulty}</p>
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

export default QuestionBankManager;
