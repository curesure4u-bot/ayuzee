import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  MessageSquare,
  Plus,
  MapPin,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useCollegeChapters } from "@/hooks/useCollegeChapters";

const CollegeChapters = () => {
  const { chapters, myChapterIds, loading, userId, createChapter, joinChapter, leaveChapter } =
    useCollegeChapters();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCollege, setNewCollege] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newState, setNewState] = useState("");
  const [newCourse, setNewCourse] = useState("BAMS");
  const [creating, setCreating] = useState(false);

  const filtered = chapters.filter((ch) => {
    const q = search.toLowerCase();
    return (
      ch.college_name.toLowerCase().includes(q) ||
      (ch.state || "").toLowerCase().includes(q) ||
      (ch.course || "").toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!newCollege.trim()) {
      toast.error("College name is required");
      return;
    }
    setCreating(true);
    const result = await createChapter(newCollege.trim(), newDescription.trim(), newState.trim(), newCourse.trim());
    setCreating(false);

    if (result && "error" in result) {
      toast.error(result.error.includes("duplicate") ? "This college chapter already exists!" : result.error);
    } else {
      toast.success("College chapter created! You've been auto-joined.");
      setDialogOpen(false);
      setNewCollege("");
      setNewDescription("");
      setNewState("");
      setNewCourse("BAMS");
    }
  };

  const handleJoin = async (chapterId: string) => {
    const ok = await joinChapter(chapterId);
    if (ok) toast.success("Joined chapter!");
    else toast.error("Could not join chapter");
  };

  const handleLeave = async (chapterId: string) => {
    const ok = await leaveChapter(chapterId);
    if (ok) toast.success("Left chapter");
    else toast.error("Could not leave chapter");
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> College Chapters
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join your college's forum to discuss, share notes, and connect with peers
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a College Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium" htmlFor="college-name">College Name *</label>
                <Input
                  id="college-name"
                  placeholder="e.g. SDM College of Ayurveda, Udupi"
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="chapter-desc">Description</label>
                <Textarea
                  id="chapter-desc"
                  placeholder="What's this chapter about?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium" htmlFor="chapter-state">State</label>
                  <Input
                    id="chapter-state"
                    placeholder="e.g. Karnataka"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="chapter-course">Course</label>
                  <Input
                    id="chapter-course"
                    placeholder="e.g. BAMS"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Chapter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search college, state, course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Badge variant="outline">
        {filtered.length} chapter{filtered.length !== 1 ? "s" : ""} found
      </Badge>

      {/* Chapter List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No chapters found. Be the first to create one for your college!
            </CardContent>
          </Card>
        ) : (
          filtered.map((chapter) => {
            const isMember = myChapterIds.includes(chapter.id);
            return (
              <Card key={chapter.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/student/chapters/${chapter.id}`}
                        className="font-semibold text-base hover:text-primary transition-colors"
                      >
                        {chapter.college_name}
                      </Link>
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {chapter.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {chapter.state && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {chapter.state}
                          </span>
                        )}
                        {chapter.course && <Badge variant="outline" className="text-[10px]">{chapter.course}</Badge>}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {chapter.member_count} member{chapter.member_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/student/chapters/${chapter.id}`}>
                          <MessageSquare className="h-4 w-4 mr-1" /> Discuss
                        </Link>
                      </Button>
                      {isMember ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLeave(chapter.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Leave
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleJoin(chapter.id)}>
                          <LogIn className="h-4 w-4 mr-1" /> Join
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CollegeChapters;
