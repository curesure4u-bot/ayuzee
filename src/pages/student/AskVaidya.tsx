import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  Clock,
  HelpCircle,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useVaidyaQuestions, useVaidyaAnswers, type VaidyaQuestion } from "@/hooks/useAskVaidya";

const SUBJECTS = [
  "All", "General", "Kayachikitsa", "Shalya Tantra", "Shalakya Tantra",
  "Prasuti & Stree Roga", "Kaumarabhritya", "Panchakarma", "Dravyaguna",
  "Rasa Shastra", "Swasthavritta", "Agadatantra", "Research",
];

// ---------- Answer Section ----------

function AnswerSection({ questionId, questionUserId }: { questionId: string; questionUserId: string }) {
  const { answers, loading, userId, createAnswer, deleteAnswer } = useVaidyaAnswers(questionId);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    const result = await createAnswer(answerText.trim());
    setSubmitting(false);
    if (result) { setAnswerText(""); toast.success("Answer posted!"); }
    else toast.error("Failed to post answer");
  };

  if (loading) {
    return <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading answers...</div>;
  }

  return (
    <div className="space-y-3 mt-3">
      {answers.length > 0 && <Separator />}
      <p className="text-xs font-medium text-muted-foreground">{answers.length} answer{answers.length !== 1 ? "s" : ""}</p>

      {answers.map((answer) => (
        <div key={answer.id} className="flex gap-3 pl-4 border-l-2 border-muted">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium text-foreground">{answer.author_name}</span>
              {answer.is_accepted && (
                <Badge className="text-[9px] bg-green-100 text-green-800 gap-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
                </Badge>
              )}
              <Clock className="h-3 w-3" />
              <span>{new Date(answer.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{answer.content}</p>
          </div>
          {userId === answer.user_id && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={async () => { const ok = await deleteAnswer(answer.id); if (ok) toast.success("Deleted"); }}
              aria-label="Delete answer">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}

      {/* Answer input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write your answer..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={3}
          className="text-sm"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!answerText.trim() || submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
          Post Answer
        </Button>
      </div>
    </div>
  );
}

// ---------- Question Card ----------

function QuestionCard({
  question,
  isUpvoted,
  onUpvote,
  userId,
  onMarkResolved,
}: {
  question: VaidyaQuestion;
  isUpvoted: boolean;
  onUpvote: (id: string) => void;
  userId: string | null;
  onMarkResolved: (id: string) => void;
}) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          {/* Upvote button */}
          <button
            className={`flex flex-col items-center gap-0.5 pt-1 ${isUpvoted ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => onUpvote(question.id)}
            aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
          >
            <ChevronUp className="h-5 w-5" />
            <span className="text-xs font-bold">{question.upvotes}</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{question.title}</h3>
              {question.is_resolved && (
                <Badge className="text-[9px] bg-green-100 text-green-800 gap-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Resolved
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{question.body}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px]">{question.subject}</Badge>
              {(question.tags || []).slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
              ))}
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {question.author_name}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(question.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-8">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setShowAnswers(!showAnswers)}>
            <MessageSquare className="h-3.5 w-3.5" />
            {question.answer_count} answer{question.answer_count !== 1 ? "s" : ""}
          </Button>
          {userId === question.user_id && !question.is_resolved && question.answer_count > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-green-600" onClick={() => onMarkResolved(question.id)}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
            </Button>
          )}
        </div>

        {showAnswers && <AnswerSection questionId={question.id} questionUserId={question.user_id} />}
      </CardContent>
    </Card>
  );
}

// ---------- Main Page ----------

const AskVaidya = () => {
  const { questions, myUpvotedIds, loading, userId, createQuestion, toggleUpvote, markResolved } = useVaidyaQuestions();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newTags, setNewTags] = useState("");
  const [posting, setPosting] = useState(false);

  const filtered = questions.filter((q) => {
    if (subjectFilter !== "All" && q.subject !== subjectFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return q.title.toLowerCase().includes(s) || q.body.toLowerCase().includes(s) || (q.tags || []).some((t) => t.toLowerCase().includes(s));
    }
    return true;
  });

  const handleAsk = async () => {
    if (!newTitle.trim() || !newBody.trim()) { toast.error("Title and description are required"); return; }
    setPosting(true);
    const tags = newTags.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await createQuestion(newTitle.trim(), newBody.trim(), newSubject, tags);
    setPosting(false);
    if (result) {
      toast.success("Question posted!");
      setDialogOpen(false);
      setNewTitle(""); setNewBody(""); setNewSubject("General"); setNewTags("");
    } else {
      toast.error("Failed to post question");
    }
  };

  const handleMarkResolved = async (id: string) => {
    const ok = await markResolved(id);
    if (ok) toast.success("Marked as resolved!");
  };

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Ask a Vaidya
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions to practicing doctors and senior students. Get expert answers.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Ask Question</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ask a Question</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium" htmlFor="q-title">Question Title *</label>
                <Input id="q-title" placeholder="e.g. Best approach for Amavata with high Ama?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="q-body">Description *</label>
                <Textarea id="q-body" placeholder="Describe your question in detail..." value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium" htmlFor="q-subject">Subject</label>
                  <select id="q-subject" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                    {SUBJECTS.filter((s) => s !== "All").map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="q-tags">Tags (comma separated)</label>
                  <Input id="q-tags" placeholder="e.g. Amavata, RA, Shodhana" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleAsk} disabled={posting} className="w-full">
                {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Post Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search questions, tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="Filter by subject">
          {SUBJECTS.map((s) => <option key={s} value={s}>{s === "All" ? "All Subjects" : s}</option>)}
        </select>
      </div>

      <Badge variant="outline">{filtered.length} question{filtered.length !== 1 ? "s" : ""}</Badge>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            No questions yet. Be the first to ask!
          </CardContent></Card>
        ) : (
          filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isUpvoted={myUpvotedIds.includes(q.id)}
              onUpvote={toggleUpvote}
              userId={userId}
              onMarkResolved={handleMarkResolved}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AskVaidya;
