import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bookmark, Plus, Trash2, ExternalLink, Star } from "lucide-react";

type BookmarkItem = { id: string; label: string; url: string; color: string; is_external: boolean };
const uid = () => crypto.randomUUID();
const COLORS = ["bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-green-500", "bg-indigo-500", "bg-orange-500"];

const sampleBookmarks: BookmarkItem[] = [
  { id: uid(), label: "Task Tracker", url: "/task-tracker", color: COLORS[0], is_external: false },
  { id: uid(), label: "My Appointments", url: "/doctor/appointments", color: COLORS[1], is_external: false },
  { id: uid(), label: "Variable Tasks", url: "/task-tracker/variable-tasks", color: COLORS[2], is_external: false },
  { id: uid(), label: "Kanban Board", url: "/task-tracker/kanban", color: COLORS[3], is_external: false },
  { id: uid(), label: "HMS Dashboard", url: "/hms", color: COLORS[4], is_external: false },
  { id: uid(), label: "Supabase", url: "https://supabase.com/dashboard", color: COLORS[5], is_external: true },
  { id: uid(), label: "Netlify", url: "https://app.netlify.com", color: COLORS[6], is_external: true },
  { id: uid(), label: "WhatsApp Web", url: "https://web.whatsapp.com", color: COLORS[7], is_external: true },
];

const TaskTrackerBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(sampleBookmarks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ label: "", url: "" });

  const addBookmark = () => {
    if (!form.label.trim() || !form.url.trim()) { toast.error("Label and URL required"); return; }
    const is_external = form.url.startsWith("http");
    setBookmarks(prev => [...prev, { id: uid(), label: form.label, url: form.url, color: COLORS[prev.length % COLORS.length], is_external }]);
    setDialogOpen(false);
    setForm({ label: "", url: "" });
    toast.success("Bookmark added");
  };

  const removeBookmark = (id: string) => { setBookmarks(prev => prev.filter(b => b.id !== id)); toast.success("Removed"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Bookmark className="h-6 w-6 text-amber-500" /> My Bookmarks</h1>
          <p className="text-sm text-muted-foreground">Quick-launch bar — your most-used pages in one click</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600"><Plus className="mr-1 h-4 w-4" /> Add Bookmark</Button>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {bookmarks.map(bm => (
          <Card key={bm.id} className="group hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${bm.color}`} />
            <CardContent className="p-4 pt-5 text-center">
              {bm.is_external ? (
                <a href={bm.url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className={`grid h-12 w-12 mx-auto place-items-center rounded-xl ${bm.color} text-white mb-2`}>
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">{bm.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{bm.url}</p>
                </a>
              ) : (
                <Link to={bm.url} className="block">
                  <div className={`grid h-12 w-12 mx-auto place-items-center rounded-xl ${bm.color} text-white mb-2`}>
                    <Star className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">{bm.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{bm.url}</p>
                </Link>
              )}
              <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => removeBookmark(bm.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {bookmarks.length === 0 && (
        <Card className="border-dashed border-2"><CardContent className="py-12 text-center">
          <Bookmark className="h-10 w-10 mx-auto text-amber-300 mb-3" />
          <p className="text-lg font-medium">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground">Add your most-used pages for quick access.</p>
        </CardContent></Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-amber-600">Add Bookmark</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Label *</Label><Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g., My Appointments" /></div>
            <div><Label>URL *</Label><Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="/doctor/appointments or https://..." /></div>
            <p className="text-[9px] text-muted-foreground">Use /path for internal pages, https:// for external links.</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addBookmark} className="bg-amber-500 hover:bg-amber-600">Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerBookmarks;
