import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Eye,
  Loader2,
  Tag,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useCaseStudyList } from "@/hooks/useCaseStudies";

const SYSTEMS = ["All", "Ayurveda", "Siddha", "Unani", "Homeopathy", "Yoga", "Naturopathy"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const difficultyColor: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-800",
  Intermediate: "bg-amber-100 text-amber-800",
  Advanced: "bg-red-100 text-red-800",
};

const CaseStudyLibrary = () => {
  const { caseStudies, bookmarkedIds, loading, toggleBookmark } = useCaseStudyList();
  const [search, setSearch] = useState("");
  const [systemFilter, setSystemFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [showBookmarked, setShowBookmarked] = useState(false);

  const filtered = useMemo(() => {
    let list = caseStudies;

    if (systemFilter !== "All") {
      list = list.filter((cs) => cs.system === systemFilter);
    }
    if (difficultyFilter !== "All") {
      list = list.filter((cs) => cs.difficulty === difficultyFilter);
    }
    if (showBookmarked) {
      list = list.filter((cs) => bookmarkedIds.includes(cs.id));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (cs) =>
          cs.title.toLowerCase().includes(q) ||
          cs.subject.toLowerCase().includes(q) ||
          cs.summary.toLowerCase().includes(q) ||
          (cs.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [caseStudies, search, systemFilter, difficultyFilter, showBookmarked, bookmarkedIds]);

  const handleBookmark = async (id: string) => {
    await toggleBookmark(id);
    const isNowBookmarked = !bookmarkedIds.includes(id);
    toast.success(isNowBookmarked ? "Bookmarked!" : "Bookmark removed");
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
          <BookOpen className="h-6 w-6 text-primary" /> Case Study Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Clinical AYUSH case studies — learn from real patient cases across specialties
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search cases, subjects, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={systemFilter}
          onChange={(e) => setSystemFilter(e.target.value)}
          aria-label="Filter by system"
        >
          {SYSTEMS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Systems" : s}
            </option>
          ))}
        </select>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          aria-label="Filter by difficulty"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Levels" : d}
            </option>
          ))}
        </select>
        <Button
          variant={showBookmarked ? "default" : "outline"}
          size="sm"
          onClick={() => setShowBookmarked(!showBookmarked)}
          className="gap-1.5"
        >
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </Button>
      </div>

      <Badge variant="outline">
        {filtered.length} case{filtered.length !== 1 ? "s" : ""} found
      </Badge>

      {/* Case Study List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {showBookmarked
                ? "No bookmarked case studies yet. Browse and save cases for later!"
                : "No case studies match your filters."}
            </CardContent>
          </Card>
        ) : (
          filtered.map((cs) => {
            const isBookmarked = bookmarkedIds.includes(cs.id);
            return (
              <Card key={cs.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/student/case-studies/${cs.id}`}
                        className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                      >
                        {cs.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {cs.summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {cs.system}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {cs.subject}
                        </Badge>
                        <Badge className={`text-[10px] ${difficultyColor[cs.difficulty] || ""}`}>
                          {cs.difficulty}
                        </Badge>
                        {(cs.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Tag className="h-2.5 w-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {cs.author_name && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> {cs.author_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {cs.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-3 w-3" /> {cs.bookmark_count}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                        onClick={() => handleBookmark(cs.id)}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/student/case-studies/${cs.id}`}>Read</Link>
                      </Button>
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

export default CaseStudyLibrary;
