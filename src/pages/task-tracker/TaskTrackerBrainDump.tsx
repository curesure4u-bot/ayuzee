import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, Plus, Trash2, Tag, ArrowRight, Search, Lightbulb } from "lucide-react";

type DumpItem = {
  id: string;
  content: string;
  tags: string[];
  created_at: string;
  converted_to_task: boolean;
};

const uid = () => crypto.randomUUID();

const sampleDumps: DumpItem[] = [
  { id: uid(), content: "Research Ashwagandha + cortisol studies for blog post", tags: ["research", "blog"], created_at: new Date().toISOString(), converted_to_task: false },
  { id: uid(), content: "Patient Ramesh - consider switching from Triphala to Avipattikar for acidity", tags: ["patient", "clinical"], created_at: new Date(Date.now() - 3600000).toISOString(), converted_to_task: false },
  { id: uid(), content: "Book: 'Prakriti' by Robert Svoboda - get from library", tags: ["reading"], created_at: new Date(Date.now() - 7200000).toISOString(), converted_to_task: false },
  { id: uid(), content: "Clinic idea: morning yoga session for waiting patients — reduces perceived wait time", tags: ["idea", "clinic"], created_at: new Date(Date.now() - 86400000).toISOString(), converted_to_task: false },
  { id: uid(), content: "Check if insurance covers Panchakarma packages — call TPA coordinator", tags: ["admin"], created_at: new Date(Date.now() - 86400000 * 2).toISOString(), converted_to_task: true },
];

type Props = {
  onConvertToTask?: (content: string) => void;
};

const TaskTrackerBrainDump = ({ onConvertToTask }: Props) => {
  const [items, setItems] = useState<DumpItem[]>(sampleDumps);
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState("");
  const [searchText, setSearchText] = useState("");

  const addItem = () => {
    if (!newContent.trim()) return;
    setItems(prev => [{
      id: uid(),
      content: newContent.trim(),
      tags: currentTags,
      created_at: new Date().toISOString(),
      converted_to_task: false,
    }, ...prev]);
    setNewContent("");
    setCurrentTags([]);
    toast.success("Captured!");
  };

  const addTag = () => {
    if (!newTag.trim() || currentTags.includes(newTag.trim())) return;
    setCurrentTags(prev => [...prev, newTag.trim().toLowerCase()]);
    setNewTag("");
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Removed");
  };

  const convertToTask = (item: DumpItem) => {
    if (onConvertToTask) onConvertToTask(item.content);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, converted_to_task: true } : i));
    toast.success("Converted to task! Check Variable Tasks.");
  };

  // All unique tags
  const allTags = [...new Set(items.flatMap(i => i.tags))].sort();

  // Filtered items
  const filtered = items.filter(i => {
    if (filterTag && !i.tags.includes(filterTag)) return false;
    if (searchText && !i.content.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-violet-600" /> Brain Dump
        </h1>
        <p className="text-sm text-muted-foreground">Capture thoughts, ideas, and snippets. Organize later.</p>
      </div>

      {/* Quick Capture */}
      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Dump your thought here... anything goes. Ideas, links, reminders, observations..."
            rows={3}
            className="resize-none"
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) addItem(); }}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {currentTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                #{tag}
                <button onClick={() => setCurrentTags(prev => prev.filter(t => t !== tag))} className="ml-0.5 hover:text-red-500">&times;</button>
              </Badge>
            ))}
            <div className="flex gap-1">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="Add tag..."
                className="h-6 w-24 text-[10px]"
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addTag}><Tag className="h-3 w-3" /></Button>
            </div>
            <Button onClick={addItem} className="ml-auto bg-violet-600 hover:bg-violet-700" size="sm">
              <Plus className="mr-1 h-3.5 w-3.5" /> Capture
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Tip: Press Cmd+Enter to save quickly</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 max-w-[200px]">
          <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search dumps..." className="pl-7 h-7 text-xs" value={searchText} onChange={e => setSearchText(e.target.value)} />
        </div>
        <Button size="sm" variant={filterTag === "" ? "default" : "outline"} className="h-7 text-[10px]" onClick={() => setFilterTag("")}>All ({items.length})</Button>
        {allTags.slice(0, 8).map(tag => (
          <Button key={tag} size="sm" variant={filterTag === tag ? "default" : "outline"} className="h-7 text-[10px]" onClick={() => setFilterTag(tag)}>
            #{tag} ({items.filter(i => i.tags.includes(tag)).length})
          </Button>
        ))}
      </div>

      {/* Dump List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Lightbulb className="h-10 w-10 mx-auto text-violet-300 mb-3" />
            <p className="text-lg font-medium">Empty mind, clear thoughts</p>
            <p className="text-sm text-muted-foreground">Start dumping ideas above — no structure needed.</p>
          </CardContent></Card>
        ) : filtered.map(item => (
          <Card key={item.id} className={`hover:shadow-sm transition-shadow ${item.converted_to_task ? "opacity-50 border-green-200" : ""}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{item.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[9px]">#{tag}</Badge>
                    ))}
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!item.converted_to_task && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-teal-600" title="Convert to task" onClick={() => convertToTask(item)}>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {item.converted_to_task && <Badge className="text-[9px] bg-green-100 text-green-700">Tasked</Badge>}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskTrackerBrainDump;
