import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ALL_DISEASES } from "@/lib/astg-search";
import { CATEGORIES } from "@/data/astg";
import { Bookmark, ArrowUpDown, NotebookPen, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Local = { diseaseKey: string; categoryKey: string; notes: string; addedAt: number };
const KEY = "astg:bookmarks";

function load(): Local[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(list: Local[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

export default function ASTGBookmarks() {
  const [items, setItems] = useState<Local[]>([]);
  const [sort, setSort] = useState<"recent" | "alpha" | "category">("recent");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Local | null>(null);

  useEffect(() => { setItems(load()); }, []);

  const enriched = useMemo(() => {
    return items.map(b => {
      const found = ALL_DISEASES.find(d => d.disease.key === b.diseaseKey);
      return { ...b, disease: found?.disease, category: found?.category };
    }).filter(b => b.disease);
  }, [items]);

  const filtered = enriched.filter(b => {
    if (!query) return true;
    const q = query.toLowerCase();
    return b.disease!.name.toLowerCase().includes(q) || b.disease!.modern.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "alpha") return a.disease!.name.localeCompare(b.disease!.name);
    if (sort === "category") return (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
    return b.addedAt - a.addedAt;
  });

  function remove(key: string) {
    const next = items.filter(i => i.diseaseKey !== key);
    save(next); setItems(next);
    toast.success("Removed");
  }

  function saveNote() {
    if (!editing) return;
    const next = items.map(i => i.diseaseKey === editing.diseaseKey ? editing : i);
    save(next); setItems(next); setEditing(null);
    toast.success("Note saved");
  }

  return (
    <div className="container py-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Bookmark className="h-6 w-6" /> My Bookmarks</h1>
          <p className="text-sm text-muted-foreground">Your saved ASTG protocols with personal notes.</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search bookmarks…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
          <Button variant="outline" onClick={() => setSort(s => s === "recent" ? "alpha" : s === "alpha" ? "category" : "recent")}>
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {sort === "recent" ? "Recent" : sort === "alpha" ? "A–Z" : "Category"}
          </Button>
        </div>
      </div>

      {!sorted.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          No bookmarks yet. Open a protocol from <Link to="/doctor/astg-reference" className="underline">ASTG Reference</Link> and tap the bookmark icon.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map(b => (
            <Card key={b.diseaseKey} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{b.disease!.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{b.disease!.modern}</p>
                  </div>
                  {b.category && <Badge variant="outline">{b.category.icon}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {b.notes && <p className="text-sm bg-muted/40 rounded p-2 line-clamp-3">{b.notes}</p>}
                <div className="mt-auto flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to={`/doctor/astg-reference/${b.category?.key}/${b.disease!.key}`}>Open</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(b)}><NotebookPen className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(b.diseaseKey)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Notes — {editing?.diseaseKey}</DialogTitle></DialogHeader>
          <Textarea rows={6} value={editing?.notes ?? ""}
            onChange={(e) => setEditing(editing ? { ...editing, notes: e.target.value } : null)}
            placeholder="Personal notes, dosing tweaks, references…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveNote}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        Browse all categories: {CATEGORIES.map(c => c.name).slice(0, 4).join(" · ")} and more.
      </p>
    </div>
  );
}

// Helper exported for detail page to add/remove bookmarks
export function toggleBookmark(diseaseKey: string, categoryKey: string): boolean {
  const list = load();
  const exists = list.find(i => i.diseaseKey === diseaseKey);
  if (exists) { save(list.filter(i => i.diseaseKey !== diseaseKey)); return false; }
  list.unshift({ diseaseKey, categoryKey, notes: "", addedAt: Date.now() });
  save(list);
  return true;
}

export function isBookmarked(diseaseKey: string): boolean {
  return load().some(i => i.diseaseKey === diseaseKey);
}
