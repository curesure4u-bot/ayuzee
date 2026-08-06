import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Clock,
  FileText,
  Loader2,
  Pause,
  Pin,
  PinOff,
  Play,
  Plus,
  Timer,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useStudyNotes, useStudySessions } from "@/hooks/useStudyPlanner";

const SUBJECTS = [
  "General",
  "Rachana Sharir",
  "Kriya Sharir",
  "Dravyaguna",
  "Rasa Shastra",
  "Kayachikitsa",
  "Shalya Tantra",
  "Shalakya Tantra",
  "Prasuti & Stree Roga",
  "Kaumarabhritya",
  "Panchakarma",
  "Swasthavritta",
  "Agadatantra",
  "Samhita & Siddhant",
  "Pharmacology",
  "Pathology",
  "Anatomy",
  "Physiology",
];

// ---------- Study Timer Component ----------

function StudyTimer({ onSessionComplete }: { onSessionComplete: (subject: string, minutes: number, notes?: string) => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [subject, setSubject] = useState("General");
  const [sessionNotes, setSessionNotes] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStop = () => {
    setIsRunning(false);
    const minutes = Math.max(1, Math.round(seconds / 60));
    onSessionComplete(subject, minutes, sessionNotes || undefined);
    setSeconds(0);
    setSessionNotes("");
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Timer className="h-4 w-4 text-indigo-600" /> Study Timer
          </h3>
          <span className="text-2xl font-mono font-bold text-indigo-800">
            {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="flex gap-2">
          <select
            className="border rounded-md px-2 py-1.5 text-sm bg-background flex-1"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isRunning}
            aria-label="Select subject"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {!isRunning ? (
            <Button size="sm" onClick={() => setIsRunning(true)} className="gap-1.5">
              <Play className="h-3.5 w-3.5" /> Start
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleStop} className="gap-1.5">
              <Pause className="h-3.5 w-3.5" /> Stop & Save
            </Button>
          )}
        </div>

        {isRunning && (
          <Input
            placeholder="What are you studying? (optional)"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="text-sm"
          />
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Stats Overview ----------

function StatsOverview({ stats }: { stats: { totalMinutes: number; totalSessions: number; todayMinutes: number; weekMinutes: number; subjectBreakdown: { subject: string; minutes: number }[] } }) {
  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-primary">{formatTime(stats.todayMinutes)}</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-indigo-600">{formatTime(stats.weekMinutes)}</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">{formatTime(stats.totalMinutes)}</p>
            <p className="text-[10px] text-muted-foreground">All Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{stats.totalSessions}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
      </div>

      {stats.subjectBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Subject Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.subjectBreakdown.slice(0, 8).map((entry) => (
              <div key={entry.subject} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{entry.subject}</span>
                <Badge variant="secondary" className="text-xs">{formatTime(entry.minutes)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------- Main Page ----------

const StudyPlanner = () => {
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote, togglePin } = useStudyNotes();
  const { sessions, stats, loading: sessionsLoading, logSession, deleteSession } = useStudySessions();

  const [tab, setTab] = useState("notes");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubject, setNoteSubject] = useState("General");
  const [saving, setSaving] = useState(false);

  const loading = notesLoading || sessionsLoading;

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);

    if (editingNote) {
      const ok = await updateNote(editingNote, { title: noteTitle.trim(), content: noteContent, subject: noteSubject });
      if (ok) toast.success("Note updated");
      else toast.error("Failed to update note");
    } else {
      const result = await createNote(noteTitle.trim(), noteContent, noteSubject, []);
      if (result) toast.success("Note created");
      else toast.error("Failed to create note");
    }

    setSaving(false);
    setNoteDialogOpen(false);
    resetNoteForm();
  };

  const resetNoteForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNoteSubject("General");
    setEditingNote(null);
  };

  const openEditNote = (note: { id: string; title: string; content: string; subject: string }) => {
    setEditingNote(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubject(note.subject);
    setNoteDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    const ok = await deleteNote(noteId);
    if (ok) toast.success("Note deleted");
    else toast.error("Failed to delete");
  };

  const handleSessionComplete = async (subject: string, minutes: number, sessionNotes?: string) => {
    const result = await logSession(subject, minutes, sessionNotes);
    if (result) toast.success(`Logged ${minutes} min of ${subject} study!`);
    else toast.error("Failed to log session");
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Study Planner
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your study time, take notes, and stay organized
        </p>
      </div>

      {/* Timer */}
      <StudyTimer onSessionComplete={handleSessionComplete} />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="notes" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Stats
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-3 mt-4">
          <div className="flex justify-end">
            <Dialog open={noteDialogOpen} onOpenChange={(open) => { setNoteDialogOpen(open); if (!open) resetNoteForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="note-title">Title *</label>
                    <Input
                      id="note-title"
                      placeholder="e.g. Dravyaguna Varga Classification"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="note-subject">Subject</label>
                    <select
                      id="note-subject"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value)}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="note-content">Content</label>
                    <Textarea
                      id="note-content"
                      placeholder="Write your notes here..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button onClick={handleSaveNote} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingNote ? "Update Note" : "Save Note"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {notes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                No notes yet. Start taking notes to stay organized!
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditNote(note)}>
                      <div className="flex items-center gap-2">
                        {note.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                        <h3 className="font-semibold text-sm line-clamp-1">{note.title}</h3>
                      </div>
                      {note.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{note.subject}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(note.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => togglePin(note.id)}
                        aria-label={note.is_pinned ? "Unpin" : "Pin"}
                      >
                        {note.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteNote(note.id)}
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-3 mt-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                No study sessions logged yet. Use the timer above to start tracking!
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.studied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {session.notes && ` · ${session.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {session.duration_minutes} min
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        const ok = await deleteSession(session.id);
                        if (ok) toast.success("Session deleted");
                      }}
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-4">
          <StatsOverview stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyPlanner;
