import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StickyNote, Plus, Trash2, Pin, PinOff, Search } from "lucide-react";

type Note = { id: string; content: string; pinned: boolean; color: string; created_at: string };
const uid = () => crypto.randomUUID();
const COLORS = ["bg-yellow-50 border-yellow-200", "bg-blue-50 border-blue-200", "bg-green-50 border-green-200", "bg-pink-50 border-pink-200", "bg-purple-50 border-purple-200", "bg-orange-50 border-orange-200"];

const sampleNotes: Note[] = [
  { id: uid(), content: "Patient Mrs. Lakshmi — needs Triphala refill next visit. Check blood pressure too.", pinned: true, color: COLORS[0], created_at: new Date().toISOString() },
  { id: uid(), content: "Lab guy's number: 98765-43210 (Mr. Suresh from Metropolis)", pinned: true, color: COLORS[1], created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: uid(), content: "Idea: Start Monday Meditation sessions for waiting patients — 10 min guided session", pinned: false, color: COLORS[2], created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: uid(), content: "Conference abstract deadline: Sep 1. Topic: Panchakarma outcomes in chronic pain.", pinned: false, color: COLORS[3], created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: uid(), content: "Reorder point for Ashwagandha capsules: 50 units. Current stock ~30.", pinned: false, color: COLORS[4], created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
];

const TaskTrackerQuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [newNote, setNewNote] = useState("");
  const [search, setSearch] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [{ id: uid(), content: newNote, pinned: false, color: COLORS[Math.floor(Math.random() * COLORS.length)], created_at: new Date().toISOString() }, ...prev]);
    setNewNote("");
    toast.success("Note saved");
  };

  const togglePin = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const deleteNote = (id: string) => { setNotes(prev => prev.filter(n => n.id !== id)); toast.success("Deleted"); };

  const filtered = notes.filter(n => !search || n.content.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><StickyNote className="h-6 w-6 text-yellow-500" /> Quick Notes</h1>
          <p className="text-sm text-muted-foreground">Instant scratchpad — jot anything, find it later</p>
        </div>
        <Badge variant="outline">{notes.length} notes</Badge>
      </div>

      {/* Quick capture */}
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardContent className="p-4 space-y-2">
          <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Jot something quick... (Ctrl+Enter to save)" rows={2} className="resize-none" onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }} />
          <div className="flex justify-between items-center">
            <p className="text-[9px] text-muted-foreground">Ctrl+Enter to save</p>
            <Button size="sm" onClick={addNote} className="bg-yellow-600 hover:bg-yellow-700"><Plus className="mr-1 h-3.5 w-3.5" /> Save Note</Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search notes..." className="pl-7 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map(note => (
              <Card key={note.id} className={`${note.color} hover:shadow-sm`}>
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-amber-600" onClick={() => togglePin(note.id)}><PinOff className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => deleteNote(note.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All notes */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {unpinned.map(note => (
          <Card key={note.id} className={`${note.color} hover:shadow-sm`}>
            <CardContent className="p-3">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => togglePin(note.id)}><Pin className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => deleteNote(note.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskTrackerQuickNotes;
