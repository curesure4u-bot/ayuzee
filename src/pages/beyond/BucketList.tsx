/**
 * Beyond Praxis — 101 Bucket List
 * Personal numbered checklist (1-101) with categories, target dates,
 * SAG (Self Appreciation Gift), progress counter, and celebration on completion.
 */

import { useState, useEffect, useMemo } from "react";
import {
  Check,
  ChevronDown,
  Filter,
  Gift,
  Image,
  ListChecks,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";
import CelebrationModal from "@/components/beyond/CelebrationModal";

// ════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════════════════════════

interface BucketListItem {
  id: string;
  item_number: number;
  title: string;
  description: string | null;
  category: string;
  target_date: string | null;
  image_url: string | null;
  is_completed: boolean;
  completed_at: string | null;
  sag_planned: string | null;
  sag_claimed: boolean;
  celebration_note: string | null;
}

const CATEGORIES = [
  { value: "travel", label: "Travel & Adventure", emoji: "✈️" },
  { value: "career", label: "Career & Achievement", emoji: "🏆" },
  { value: "health", label: "Health & Fitness", emoji: "💪" },
  { value: "learning", label: "Learning & Skills", emoji: "📚" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "finance", label: "Financial Goals", emoji: "💰" },
  { value: "creative", label: "Creative & Arts", emoji: "🎨" },
  { value: "spiritual", label: "Spiritual & Mindfulness", emoji: "🧘" },
  { value: "service", label: "Service & Giving Back", emoji: "🤝" },
  { value: "personal", label: "Personal Growth", emoji: "🌱" },
  { value: "fun", label: "Fun & Experiences", emoji: "🎉" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════

const BucketList = () => {
  const { addXP, addCoins } = useBeyondGamification();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Celebration state
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebratingItem, setCelebratingItem] = useState<BucketListItem | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "personal",
    target_date: "",
    image_url: "",
    sag_planned: "",
  });

  // ── Load Data ──
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const userId = session.session.user.id;

    const { data, error } = await (supabase as any)
      .from("beyond_bucket_list_items")
      .select("*")
      .eq("user_id", userId)
      .order("item_number", { ascending: true });

    if (!error && data) setItems(data);
    setLoading(false);
  };

  // ── Stats ──
  const completedCount = useMemo(() => items.filter((i) => i.is_completed).length, [items]);
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / 101) * 100) : 0;

  // ── Filtered items ──
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterStatus === "completed" && !item.is_completed) return false;
      if (filterStatus === "pending" && item.is_completed) return false;
      return true;
    });
  }, [items, filterCategory, filterStatus]);

  // ── Next available number ──
  const nextNumber = useMemo(() => {
    const used = new Set(items.map((i) => i.item_number));
    for (let n = 1; n <= 101; n++) {
      if (!used.has(n)) return n;
    }
    return null; // All 101 filled
  }, [items]);

  // ── Add Item ──
  const addItem = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (nextNumber === null) { toast.error("You've already added all 101 items!"); return; }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const { data, error } = await (supabase as any)
      .from("beyond_bucket_list_items")
      .insert({
        user_id: session.session.user.id,
        item_number: nextNumber,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        target_date: form.target_date || null,
        image_url: form.image_url.trim() || null,
        sag_planned: form.sag_planned.trim() || null,
      })
      .select()
      .single();

    if (error) { toast.error("Failed to add item"); return; }
    if (data) setItems((prev) => [...prev, data].sort((a, b) => a.item_number - b.item_number));
    setDialogOpen(false);
    setForm({ title: "", description: "", category: "personal", target_date: "", image_url: "", sag_planned: "" });
    toast.success(`#${nextNumber} added to your bucket list!`);
  };

  // ── Complete Item (triggers celebration) ──
  const completeItem = async (item: BucketListItem) => {
    if (item.is_completed) return;

    const { error } = await (supabase as any)
      .from("beyond_bucket_list_items")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) { toast.error("Failed to update"); return; }

    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, is_completed: true, completed_at: new Date().toISOString() } : i)
    );

    // Award XP
    await addXP(50, "bucket_list", `Completed: ${item.title}`);
    await addCoins(10, "bucket_list", `Bucket list item #${item.item_number}`);

    // Show celebration
    setCelebratingItem({ ...item, is_completed: true });
    setCelebrationOpen(true);
  };

  // ── Save celebration details ──
  const saveCelebration = async (note: string, sagClaimed: boolean) => {
    if (!celebratingItem) return;

    const updates: any = {};
    if (note) updates.celebration_note = note;
    if (sagClaimed) { updates.sag_claimed = true; updates.sag_claimed_at = new Date().toISOString(); }

    if (Object.keys(updates).length > 0) {
      await (supabase as any)
        .from("beyond_bucket_list_items")
        .update(updates)
        .eq("id", celebratingItem.id);

      setItems((prev) =>
        prev.map((i) => i.id === celebratingItem.id ? { ...i, ...updates } : i)
      );
    }

    // Log celebration
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      await (supabase as any).from("beyond_celebration_log").insert({
        user_id: session.session.user.id,
        source_type: "bucket_list",
        source_id: celebratingItem.id,
        title: celebratingItem.title,
        sag_description: sagClaimed ? celebratingItem.sag_planned : null,
        celebration_note: note || null,
        xp_earned: 50,
      });
    }

    setCelebrationOpen(false);
    setCelebratingItem(null);
  };

  // ── Delete Item ──
  const deleteItem = async (id: string) => {
    await (supabase as any).from("beyond_bucket_list_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item removed");
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading your bucket list...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-violet-500" />
            101 Bucket List
          </h1>
          <p className="text-sm text-muted-foreground">
            Your personal life dreams — one numbered checklist, 101 possibilities.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={nextNumber === null}
          className="bg-violet-500 hover:bg-violet-600"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Dream #{nextNumber || "—"}
        </Button>
      </div>

      {/* Progress Card */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                <Trophy className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                  {completedCount}/101 done!
                </p>
                <p className="text-xs text-muted-foreground">
                  {101 - totalCount} slots remaining • {totalCount - completedCount} in progress
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
              <p className="text-lg font-bold text-violet-600">{progressPct}%</p>
            </div>
          </div>
          <Progress value={progressPct} className="mt-3 h-3" />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="pending">⏳ Pending</SelectItem>
            <SelectItem value="completed">✅ Completed</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="self-center">
          Showing {filteredItems.length} items
        </Badge>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <Collapsible key={item.id}>
            <div
              className={`group rounded-xl border p-4 transition-all hover:shadow-sm ${
                item.is_completed
                  ? "border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/10"
                  : "border-border bg-card hover:border-violet-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Number Badge */}
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    item.is_completed
                      ? "bg-green-500 text-white"
                      : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                  }`}
                >
                  {item.is_completed ? <Check className="h-4 w-4" /> : item.item_number}
                </div>

                {/* Title & Category */}
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORY_MAP[item.category]?.emoji || "🌱"} {CATEGORY_MAP[item.category]?.label || item.category}
                    </Badge>
                    {item.target_date && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Target className="mr-1 h-2.5 w-2.5" />
                        {new Date(item.target_date).toLocaleDateString()}
                      </Badge>
                    )}
                    {item.sag_planned && (
                      <Badge variant="secondary" className="text-[10px] border-pink-200 text-pink-600">
                        <Gift className="mr-1 h-2.5 w-2.5" /> SAG Planned
                      </Badge>
                    )}
                    {item.image_url && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Image className="mr-1 h-2.5 w-2.5" /> Image
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!item.is_completed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-100 hover:text-green-700"
                      onClick={() => completeItem(item)}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Done
                    </Button>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              <CollapsibleContent className="mt-3 border-t pt-3 space-y-2">
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-32 w-full rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {item.sag_planned && (
                  <div className="flex items-start gap-2 rounded-lg bg-pink-50 p-3 dark:bg-pink-950/20">
                    <Gift className="h-4 w-4 shrink-0 text-pink-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-pink-700 dark:text-pink-300">Self-Appreciation Gift:</p>
                      <p className="text-sm italic text-pink-600 dark:text-pink-400">"{item.sag_planned}"</p>
                      {item.sag_claimed && (
                        <Badge className="mt-1 bg-pink-500 text-white text-[10px]">🎁 Gift Claimed!</Badge>
                      )}
                    </div>
                  </div>
                )}
                {item.celebration_note && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">"{item.celebration_note}"</p>
                  </div>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <ListChecks className="h-12 w-12 mx-auto text-violet-300 mb-4" />
            <p className="text-xl font-medium">Start Your 101 Bucket List</p>
            <p className="text-sm text-muted-foreground mt-1">
              What are the 101 things you want to experience, achieve, and create in your lifetime?
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4 bg-violet-500 hover:bg-violet-600">
              <Plus className="mr-1 h-4 w-4" /> Add Your First Dream
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-600">
              <ListChecks className="h-5 w-5" />
              Add Bucket List Item #{nextNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dream / Goal *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Visit all 7 continents"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Why this matters to you..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://example.com/dream-image.jpg"
              />
            </div>
            <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-3 dark:border-pink-800 dark:bg-pink-950/20">
              <Label className="flex items-center gap-1 text-pink-700 dark:text-pink-300">
                <Gift className="h-3.5 w-3.5" /> Self-Appreciation Gift (SAG)
              </Label>
              <Input
                value={form.sag_planned}
                onChange={(e) => setForm((f) => ({ ...f, sag_planned: e.target.value }))}
                placeholder="When I achieve this, I'll reward myself with..."
                className="mt-1.5"
              />
              <p className="text-[11px] text-pink-500 mt-1">Plan a gift for yourself — you deserve it!</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addItem} className="bg-violet-500 hover:bg-violet-600">
              <Plus className="mr-1 h-4 w-4" /> Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Modal */}
      <CelebrationModal
        open={celebrationOpen}
        onClose={() => { setCelebrationOpen(false); setCelebratingItem(null); }}
        title={celebratingItem?.title || ""}
        sagPlanned={celebratingItem?.sag_planned || undefined}
        onSave={saveCelebration}
        xpEarned={50}
      />
    </div>
  );
};

export default BucketList;
