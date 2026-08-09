import { useState, useEffect } from "react";
import {
  Award,
  BookCheck,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Filter,
  Lightbulb,
  Search,
  Star,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

const CATEGORIES = [
  { value: "all", label: "All Books" },
  { value: "mindset", label: "Mindset & Psychology" },
  { value: "finance", label: "Finance & Wealth" },
  { value: "productivity", label: "Productivity & Time" },
  { value: "leadership", label: "Leadership" },
  { value: "communication", label: "Communication" },
  { value: "wellness", label: "Wellness & Resilience" },
  { value: "career", label: "Career & Entrepreneurship" },
  { value: "medical", label: "Medical Leadership" },
];

const CATEGORY_COLORS: Record<string, string> = {
  mindset: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  finance: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  productivity: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  leadership: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  communication: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  wellness: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  career: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  medical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  summary_short: string;
  summary_full: string | null;
  key_takeaways: string[];
  apply_it_challenge: string | null;
  applicable_spokes: string[];
  career_stages: string[];
}

interface ReadingLog {
  book_id: string;
  status: "want_to_read" | "reading" | "finished";
  apply_it_done: boolean;
  rating: number | null;
}

const BookLibrary = () => {
  const { addXP, addCoins, recordStreak, grantBadge } = useBeyondGamification();
  const [books, setBooks] = useState<Book[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [applyItText, setApplyItText] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [booksRes, logsRes] = await Promise.all([
      (supabase as any).from("beyond_books").select("*").eq("is_published", true).order("category").order("title"),
      session.session
        ? (supabase as any).from("beyond_reading_logs").select("book_id, status, apply_it_done, rating").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setBooks(booksRes.data || []);
    setReadingLogs(logsRes.data || []);
    setLoading(false);
  };

  const getBookStatus = (bookId: string) => readingLogs.find((l) => l.book_id === bookId);

  const updateBookStatus = async (bookId: string, status: "want_to_read" | "reading" | "finished") => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in"); return; }
    const userId = session.session.user.id;

    const existing = readingLogs.find((l) => l.book_id === bookId);

    const record: any = {
      user_id: userId,
      book_id: bookId,
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "reading" && !existing?.status) record.started_at = new Date().toISOString();
    if (status === "finished") record.finished_at = new Date().toISOString();

    await (supabase as any)
      .from("beyond_reading_logs")
      .upsert(record, { onConflict: "user_id,book_id" });

    // Gamification
    if (status === "want_to_read" && !existing) {
      await addXP(10, "book_added", "Added book to reading list");
      await grantBadge("Bookworm Begins");
    } else if (status === "reading" && existing?.status !== "reading") {
      await addXP(15, "book_started", "Started reading a book");
    } else if (status === "finished" && existing?.status !== "finished") {
      await addXP(150, "book_finished", "Finished reading a book!");
      await addCoins(30, "book_finished", "Completed a book");
      await recordStreak("reading");
      toast.success("Book finished! +150 XP, +30 coins 🎉");

      // Check for Library Card badge (12 books)
      const finishedCount = readingLogs.filter((l) => l.status === "finished").length + 1;
      if (finishedCount >= 12) await grantBadge("Library Card");
    }

    // Update local state
    setReadingLogs((prev) => {
      const filtered = prev.filter((l) => l.book_id !== bookId);
      return [...filtered, { book_id: bookId, status, apply_it_done: existing?.apply_it_done || false, rating: existing?.rating || null }];
    });

    if (status !== "finished") toast.success(`Book marked as "${status.replace("_", " ")}"`);
  };

  const completeApplyIt = async (bookId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    await (supabase as any)
      .from("beyond_reading_logs")
      .update({ apply_it_done: true, apply_it_reflection: applyItText || null, updated_at: new Date().toISOString() })
      .eq("user_id", session.session.user.id)
      .eq("book_id", bookId);

    await addXP(75, "apply_it_done", "Completed Apply-It challenge");
    await addCoins(20, "apply_it_done");

    setReadingLogs((prev) => prev.map((l) => l.book_id === bookId ? { ...l, apply_it_done: true } : l));
    setApplyItText("");
    toast.success("Apply-It challenge complete! +75 XP");
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const booksReading = readingLogs.filter((l) => l.status === "reading").length;
  const booksFinished = readingLogs.filter((l) => l.status === "finished").length;
  const applyItDone = readingLogs.filter((l) => l.apply_it_done).length;

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading library...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-green-500" />
            Book Library
          </h1>
          <p className="text-muted-foreground">Curated reads for doctors who want more from life</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><BookMarked className="h-3 w-3" /> {booksReading} reading</Badge>
          <Badge variant="secondary" className="gap-1"><BookCheck className="h-3 w-3" /> {booksFinished} finished</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{booksReading}</p>
          <p className="text-xs text-muted-foreground">Reading</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{booksFinished}</p>
          <p className="text-xs text-muted-foreground">Finished</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{applyItDone}</p>
          <p className="text-xs text-muted-foreground">Applied</p>
        </CardContent></Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Book Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map((book) => {
          const log = getBookStatus(book.id);
          return (
            <Card key={book.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-sm leading-tight">{book.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{book.author}</CardDescription>
                  </div>
                  {log?.status === "finished" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </div>
                <Badge className={`w-fit text-xs mt-1 ${CATEGORY_COLORS[book.category] || ""}`}>
                  {book.category}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-3">
                <p className="text-xs text-muted-foreground line-clamp-3">{book.summary_short}</p>

                <div className="space-y-2">
                  {/* Applicable spokes */}
                  {book.applicable_spokes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {book.applicable_spokes.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] capitalize">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => setSelectedBook(book)}
                    >
                      Details
                    </Button>
                    {!log && (
                      <Button size="sm" className="flex-1 text-xs" onClick={() => updateBookStatus(book.id, "want_to_read")}>
                        + Add
                      </Button>
                    )}
                    {log?.status === "want_to_read" && (
                      <Button size="sm" className="flex-1 text-xs" onClick={() => updateBookStatus(book.id, "reading")}>
                        Start Reading
                      </Button>
                    )}
                    {log?.status === "reading" && (
                      <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateBookStatus(book.id, "finished")}>
                        Finish ✓
                      </Button>
                    )}
                    {log?.status === "finished" && !log.apply_it_done && book.apply_it_challenge && (
                      <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => setSelectedBook(book)}>
                        Apply It
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No books match your search</p>
        </div>
      )}

      {/* Book Detail Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        {selectedBook && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBook.title}</DialogTitle>
              <DialogDescription>{selectedBook.author}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Badge className={`${CATEGORY_COLORS[selectedBook.category] || ""}`}>
                {selectedBook.category}
              </Badge>

              {/* Summary */}
              <div>
                <p className="text-sm font-medium mb-1">Summary</p>
                <p className="text-sm text-muted-foreground">{selectedBook.summary_short}</p>
              </div>

              {/* Key Takeaways */}
              {selectedBook.key_takeaways.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Key Takeaways
                  </p>
                  <ul className="space-y-1">
                    {selectedBook.key_takeaways.map((t, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary shrink-0">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply-It Challenge */}
              {selectedBook.apply_it_challenge && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Target className="h-3 w-3" /> Apply-It Challenge (+75 XP)
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                    {selectedBook.apply_it_challenge}
                  </p>

                  {(() => {
                    const log = getBookStatus(selectedBook.id);
                    if (log?.apply_it_done) {
                      return <Badge variant="secondary" className="mt-2 text-xs">✓ Completed</Badge>;
                    }
                    if (log?.status === "reading" || log?.status === "finished") {
                      return (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            placeholder="What did you do? What happened? (optional)"
                            value={applyItText}
                            onChange={(e) => setApplyItText(e.target.value)}
                            rows={2}
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => { completeApplyIt(selectedBook.id); setSelectedBook(null); }}
                          >
                            Mark Challenge Done
                          </Button>
                        </div>
                      );
                    }
                    return <p className="text-xs text-muted-foreground mt-1">Start reading to unlock this challenge</p>;
                  })()}
                </div>
              )}

              {/* Applicable Spokes */}
              {selectedBook.applicable_spokes.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Improves these Wheel spokes:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedBook.applicable_spokes.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs capitalize">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {!getBookStatus(selectedBook.id) && (
                  <Button className="flex-1" onClick={() => { updateBookStatus(selectedBook.id, "want_to_read"); setSelectedBook(null); }}>
                    Add to List
                  </Button>
                )}
                {getBookStatus(selectedBook.id)?.status === "want_to_read" && (
                  <Button className="flex-1" onClick={() => { updateBookStatus(selectedBook.id, "reading"); setSelectedBook(null); }}>
                    Start Reading
                  </Button>
                )}
                {getBookStatus(selectedBook.id)?.status === "reading" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { updateBookStatus(selectedBook.id, "finished"); setSelectedBook(null); }}>
                    Mark as Finished
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default BookLibrary;
