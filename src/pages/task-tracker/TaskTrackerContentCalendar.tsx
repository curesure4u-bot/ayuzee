import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Plus, Pencil, Trash2, FileText } from "lucide-react";

type ContentItem = {
  id: string;
  title: string;
  type: "blog" | "social" | "video" | "research" | "newsletter" | "other";
  status: "idea" | "draft" | "review" | "scheduled" | "published";
  platform: string;
  scheduled_date: string | null;
  published_date: string | null;
  notes: string;
};

const uid = () => crypto.randomUUID();
const STATUS_COLORS: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700", draft: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700", scheduled: "bg-purple-100 text-purple-700",
  published: "bg-green-100 text-green-700",
};

const sampleContent: ContentItem[] = [
  { id: uid(), title: "5 Ayurvedic Herbs for Immunity", type: "blog", status: "published", platform: "Ayuzee Blog", scheduled_date: "2025-05-01", published_date: "2025-05-01", notes: "" },
  { id: uid(), title: "Morning Routine Reel — Dinacharya", type: "social", status: "scheduled", platform: "Instagram", scheduled_date: "2025-05-15", published_date: null, notes: "30s reel format" },
  { id: uid(), title: "Panchakarma Explained: Complete Guide", type: "blog", status: "draft", platform: "Ayuzee Blog", scheduled_date: "2025-05-20", published_date: null, notes: "3000 words, include patient testimonials" },
  { id: uid(), title: "Patient Success Story — Chronic Pain", type: "video", status: "idea", platform: "YouTube", scheduled_date: null, published_date: null, notes: "Get consent from patient first" },
  { id: uid(), title: "Weekly Health Tips — Ritucharya", type: "newsletter", status: "review", platform: "Email", scheduled_date: "2025-05-18", published_date: null, notes: "Seasonal advice for monsoon" },
  { id: uid(), title: "Research: Ashwagandha & Cortisol Meta-analysis", type: "research", status: "draft", platform: "Journal Submission", scheduled_date: "2025-06-01", published_date: null, notes: "Co-author with Dr. Kavitha" },
];

const TaskTrackerContentCalendar = () => {
  const [items, setItems] = useState<ContentItem[]>(sampleContent);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "blog" as ContentItem["type"], status: "idea" as ContentItem["status"], platform: "", scheduled_date: "", notes: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Build calendar for current month
  const calendarDays = useMemo(() => {
    const first = new Date(currentYear, currentMonth, 1);
    const last = new Date(currentYear, currentMonth + 1, 0);
    const days: { day: number; date: string }[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      days.push({ day: d, date: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
    }
    return { days, startOffset: first.getDay() };
  }, [currentMonth, currentYear]);

  const filtered = filterStatus === "all" ? items : items.filter(i => i.status === filterStatus);
  const statusCounts = { idea: items.filter(i => i.status === "idea").length, draft: items.filter(i => i.status === "draft").length, review: items.filter(i => i.status === "review").length, scheduled: items.filter(i => i.status === "scheduled").length, published: items.filter(i => i.status === "published").length };

  const openCreate = () => { setEditingId(null); setForm({ title: "", type: "blog", status: "idea", platform: "", scheduled_date: "", notes: "" }); setDialogOpen(true); };
  const openEdit = (item: ContentItem) => { setEditingId(item.id); setForm({ title: item.title, type: item.type, status: item.status, platform: item.platform, scheduled_date: item.scheduled_date || "", notes: item.notes }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...form, scheduled_date: form.scheduled_date || null, published_date: form.status === "published" ? new Date().toISOString().split("T")[0] : i.published_date } : i));
      toast.success("Updated");
    } else {
      setItems(prev => [{ id: uid(), ...form, scheduled_date: form.scheduled_date || null, published_date: form.status === "published" ? new Date().toISOString().split("T")[0] : null }, ...prev]);
      toast.success("Content added");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-pink-600" /> Content Calendar</h1>
          <p className="text-sm text-muted-foreground">Plan blogs, social posts, videos, and research publications</p>
        </div>
        <Button onClick={openCreate} className="bg-pink-600 hover:bg-pink-700"><Plus className="mr-1 h-4 w-4" /> Add Content</Button>
      </div>

      {/* Status Pipeline */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filterStatus === "all" ? "default" : "outline"} className="h-7 text-[10px]" onClick={() => setFilterStatus("all")}>All ({items.length})</Button>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Button key={status} size="sm" variant={filterStatus === status ? "default" : "outline"} className="h-7 text-[10px]" onClick={() => setFilterStatus(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
          </Button>
        ))}
      </div>

      {/* Mini Calendar View */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">{monthNames[currentMonth]} {currentYear} — Scheduled Content</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d} className="text-[9px] font-medium text-muted-foreground py-1">{d}</span>)}
            {Array(calendarDays.startOffset).fill(null).map((_, i) => <span key={`e-${i}`} />)}
            {calendarDays.days.map(({ day, date }) => {
              const dayContent = items.filter(i => i.scheduled_date === date);
              return (
                <div key={day} className={`rounded p-0.5 min-h-[28px] ${dayContent.length > 0 ? "bg-pink-50 border border-pink-200" : ""}`}>
                  <span className="text-[9px]">{day}</span>
                  {dayContent.slice(0, 2).map(c => (
                    <div key={c.id} className={`text-[7px] rounded px-0.5 truncate mt-0.5 ${STATUS_COLORS[c.status]}`}>{c.title.slice(0, 10)}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="space-y-2">
        {filtered.map(item => (
          <Card key={item.id} className="hover:shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <FileText className="h-5 w-5 text-pink-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  <Badge className={`text-[9px] ${STATUS_COLORS[item.status]}`}>{item.status}</Badge>
                  <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
                  <Badge variant="secondary" className="text-[9px]">{item.platform}</Badge>
                  {item.scheduled_date && <span className="text-[9px] text-muted-foreground">📅 {item.scheduled_date}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => { setItems(prev => prev.filter(i => i.id !== item.id)); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-pink-600">{editingId ? "Edit" : "Add"} Content</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["blog", "social", "video", "research", "newsletter", "other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["idea", "draft", "review", "scheduled", "published"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Platform</Label><Input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="e.g., Instagram" /></div>
              <div><Label>Scheduled Date</Label><Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="bg-pink-600 hover:bg-pink-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerContentCalendar;
