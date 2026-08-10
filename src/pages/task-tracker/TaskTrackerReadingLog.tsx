import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, Plus, Star, Trash2, Pencil } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  status: "want" | "reading" | "completed";
  rating: number;
  notes: string;
  pages_total: number;
  pages_read: number;
  category: string;
  started_at: string | null;
  finished_at: string | null;
};

const uid = () => crypto.randomUUID();

const sampleBooks: Book[] = [
  { id: uid(), title: "Charaka Samhita (Vol 1)", author: "Agnivesha", status: "reading", rating: 0, notes: "Currently on Sutra Sthana Ch.12", pages_total: 600, pages_read: 280, category: "Ayurveda", started_at: "2025-03-01", finished_at: null },
  { id: uid(), title: "Prakriti: Your Ayurvedic Constitution", author: "Robert Svoboda", status: "completed", rating: 5, notes: "Excellent introduction to constitution typing. Good patient handout reference.", pages_total: 280, pages_read: 280, category: "Ayurveda", started_at: "2025-01-10", finished_at: "2025-02-15" },
  { id: uid(), title: "Atomic Habits", author: "James Clear", status: "completed", rating: 4, notes: "Applied the habit stacking concept to clinic routine.", pages_total: 320, pages_read: 320, category: "Productivity", started_at: "2025-02-01", finished_at: "2025-02-20" },
  { id: uid(), title: "Deep Work", author: "Cal Newport", status: "want", rating: 0, notes: "", pages_total: 296, pages_read: 0, category: "Productivity", started_at: null, finished_at: null },
  { id: uid(), title: "Ashtanga Hridayam", author: "Vagbhata", status: "want", rating: 0, notes: "Reference for clinical practice", pages_total: 900, pages_read: 0, category: "Ayurveda", started_at: null, finished_at: null },
  { id: uid(), title: "The Body Keeps the Score", author: "Bessel van der Kolk", status: "reading", rating: 0, notes: "Ch.5 - trauma and body connection", pages_total: 460, pages_read: 120, category: "Wellness", started_at: "2025-04-10", finished_at: null },
];

const CATEGORIES = ["Ayurveda", "Productivity", "Wellness", "Clinical", "Business", "Self-help", "Research", "Other"];

const TaskTrackerReadingLog = () => {
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState({ title: "", author: "", status: "want" as Book["status"], rating: 0, notes: "", pages_total: 0, pages_read: 0, category: "Ayurveda" });

  const wantCount = books.filter(b => b.status === "want").length;
  const readingCount = books.filter(b => b.status === "reading").length;
  const completedCount = books.filter(b => b.status === "completed").length;

  const filtered = tab === "all" ? books : books.filter(b => b.status === tab);

  const openCreate = () => { setEditingId(null); setForm({ title: "", author: "", status: "want", rating: 0, notes: "", pages_total: 0, pages_read: 0, category: "Ayurveda" }); setDialogOpen(true); };
  const openEdit = (book: Book) => { setEditingId(book.id); setForm({ title: book.title, author: book.author, status: book.status, rating: book.rating, notes: book.notes, pages_total: book.pages_total, pages_read: book.pages_read, category: book.category }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (editingId) {
      setBooks(prev => prev.map(b => b.id === editingId ? { ...b, ...form, finished_at: form.status === "completed" && !b.finished_at ? new Date().toISOString().split("T")[0] : b.finished_at, started_at: form.status === "reading" && !b.started_at ? new Date().toISOString().split("T")[0] : b.started_at } : b));
      toast.success("Updated");
    } else {
      setBooks(prev => [{ id: uid(), ...form, started_at: form.status === "reading" ? new Date().toISOString().split("T")[0] : null, finished_at: form.status === "completed" ? new Date().toISOString().split("T")[0] : null }, ...prev]);
      toast.success("Book added");
    }
    setDialogOpen(false);
  };

  const renderStars = (rating: number, editable = false, onChange?: (r: number) => void) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} ${editable ? "cursor-pointer" : ""}`}
          onClick={() => editable && onChange && onChange(s)} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-emerald-600" /> Reading Log</h1>
          <p className="text-sm text-muted-foreground">Track books, papers, and articles</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="mr-1 h-4 w-4" /> Add Book</Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <Badge variant="outline" className="px-3 py-1.5">Want: {wantCount}</Badge>
        <Badge variant="outline" className="px-3 py-1.5 text-blue-600">Reading: {readingCount}</Badge>
        <Badge variant="outline" className="px-3 py-1.5 text-green-600">Done: {completedCount}</Badge>
        <Badge variant="outline" className="px-3 py-1.5">Total: {books.length}</Badge>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="want">Want to Read</TabsTrigger><TabsTrigger value="reading">Reading</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(book => (
              <Card key={book.id} className="hover:shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(book)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => { setBooks(prev => prev.filter(b => b.id !== book.id)); toast.success("Removed"); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={book.status === "completed" ? "default" : book.status === "reading" ? "secondary" : "outline"} className="text-[9px]">
                      {book.status === "want" ? "Want to Read" : book.status === "reading" ? "Reading" : "Completed"}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">{book.category}</Badge>
                  </div>
                  {book.status !== "want" && book.pages_total > 0 && (
                    <div className="flex items-center gap-2">
                      <Progress value={(book.pages_read / book.pages_total) * 100} className="h-1.5 flex-1" />
                      <span className="text-[10px]">{book.pages_read}/{book.pages_total}p</span>
                    </div>
                  )}
                  {book.status === "completed" && renderStars(book.rating)}
                  {book.notes && <p className="text-[10px] text-muted-foreground line-clamp-2">{book.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-emerald-600">{editingId ? "Edit Book" : "Add Book"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Author</Label><Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} /></div>
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="want">Want</SelectItem><SelectItem value="reading">Reading</SelectItem><SelectItem value="completed">Done</SelectItem></SelectContent></Select></div>
              <div><Label>Total Pages</Label><Input type="number" value={form.pages_total} onChange={e => setForm(f => ({ ...f, pages_total: Number(e.target.value) }))} /></div>
              <div><Label>Pages Read</Label><Input type="number" value={form.pages_read} onChange={e => setForm(f => ({ ...f, pages_read: Number(e.target.value) }))} /></div>
            </div>
            {form.status === "completed" && <div><Label>Rating</Label>{renderStars(form.rating, true, r => setForm(f => ({ ...f, rating: r })))}</div>}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerReadingLog;
