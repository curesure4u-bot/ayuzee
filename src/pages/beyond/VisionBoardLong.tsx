/**
 * Beyond Praxis — Long-Term Vision Board (1-5 years)
 * Life dreams with images, milestones, rewards/SAG,
 * "When I achieve this, I will reward myself with..." field.
 */

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Gift,
  Image,
  Milestone,
  Plus,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

interface MilestoneItem {
  id: string;
  text: string;
  done: boolean;
}

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  vision_type: string;
  category: string;
  image_url: string | null;
  target_date: string | null;
  accountability_partner: string | null;
  milestones: MilestoneItem[];
  sag_planned: string | null;
  sag_claimed: boolean;
  sag_claimed_at: string | null;
  is_completed: boolean;
  completed_at: string | null;
  celebration_note: string | null;
  display_order: number;
  color: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "career", label: "Career Legacy", emoji: "🏆" },
  { value: "health", label: "Lifelong Health", emoji: "💪" },
  { value: "finance", label: "Wealth & Freedom", emoji: "💰" },
  { value: "learning", label: "Mastery", emoji: "🎓" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "impact", label: "Impact & Legacy", emoji: "🌍" },
  { value: "spiritual", label: "Spiritual Growth", emoji: "🧘" },
  { value: "creative", label: "Creative Dreams", emoji: "🎨" },
  { value: "adventure", label: "Life Adventures", emoji: "✈️" },
  { value: "personal", label: "Personal Growth", emoji: "🌱" },
];

const CARD_COLORS = [
  { name: "Indigo", value: "from-indigo-100 to-violet-100 border-indigo-200 dark:from-indigo-900/30 dark:to-violet-900/30 dark:border-indigo-700" },
  { name: "Rose", value: "from-rose-100 to-pink-100 border-rose-200 dark:from-rose-900/30 dark:to-pink-900/30 dark:border-rose-700" },
  { name: "Emerald", value: "from-emerald-100 to-teal-100 border-emerald-200 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-700" },
  { name: "Amber", value: "from-amber-100 to-orange-100 border-amber-200 dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-700" },
  { name: "Sky", value: "from-sky-100 to-blue-100 border-sky-200 dark:from-sky-900/30 dark:to-blue-900/30 dark:border-sky-700" },
  { name: "Purple", value: "from-purple-100 to-fuchsia-100 border-purple-200 dark:from-purple-900/30 dark:to-fuchsia-900/30 dark:border-purple-700" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════

const VisionBoardLong = () => {
  const { addXP, addCoins } = useBeyondGamification();
  const [items, setItems] = useState<VisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Celebration
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebratingItem, setCelebratingItem] = useState<VisionItem | null>(null);

  // Form
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "personal",
    image_url: "",
    target_date: "",
    sag_planned: "",
    color: CARD_COLORS[0].value,
    milestones: "" as string, // comma-separated, split on save
  });

  // ── Load Data ──
  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }

    const { data } = await (supabase as any)
      .from("beyond_vision_board_items")
      .select("*")
      .eq("user_id", session.session.user.id)
      .eq("vision_type", "long_term")
      .order("display_order", { ascending: true });

    if (data) setItems(data.map((d: any) => ({ ...d, milestones: d.milestones || [] })));
    setLoading(false);
  };

  // ── Stats ──
  const completedCount = useMemo(() => items.filter((i) => i.is_completed).length, [items]);
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ── Add Item ──
  const addItem = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    // Parse milestones from comma-separated text
    const milestones: MilestoneItem[] = form.milestones
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ id: crypto.randomUUID(), text, done: false }));

    const { data, error } = await (supabase as any)
      .from("beyond_vision_board_items")
      .insert({
        user_id: session.session.user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        vision_type: "long_term",
        category: form.category,
        image_url: form.image_url.trim() || null,
        target_date: form.target_date || null,
        sag_planned: form.sag_planned.trim() || null,
        color: form.color,
        milestones: milestones,
        display_order: totalCount,
      })
      .select()
      .single();

    if (error) { toast.error("Failed to add vision"); return; }
    if (data) setItems((prev) => [...prev, { ...data, milestones: data.milestones || [] }]);
    setDialogOpen(false);
    setForm({ title: "", description: "", category: "personal", image_url: "", target_date: "", sag_planned: "", color: CARD_COLORS[0].value, milestones: "" });
    toast.success("Long-term vision added!");
  };

  // ── Toggle Milestone ──
  const toggleMilestone = async (itemId: string, milestoneId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const updatedMilestones = item.milestones.map((m) =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    );

    await (supabase as any)
      .from("beyond_vision_board_items")
      .update({ milestones: updatedMilestones })
      .eq("id", itemId);

    setItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, milestones: updatedMilestones } : i)
    );

    const justCompleted = updatedMilestones.find((m) => m.id === milestoneId);
    if (justCompleted?.done) {
      await addXP(15, "vision_milestone", `Milestone: ${justCompleted.text}`);
      toast.success("Milestone reached! +15 XP");
    }
  };

  // ── Complete Item ──
  const completeItem = async (item: VisionItem) => {
    if (item.is_completed) return;

    const { error } = await (supabase as any)
      .from("beyond_vision_board_items")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) { toast.error("Failed to update"); return; }

    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, is_completed: true, completed_at: new Date().toISOString() } : i)
    );

    await addXP(150, "vision_board_long", `Life dream achieved: ${item.title}`);
    await addCoins(30, "vision_board_long", `Long-term vision achieved`);

    setCelebratingItem({ ...item, is_completed: true });
    setCelebrationOpen(true);
  };

  // ── Save Celebration ──
  const saveCelebration = async (note: string, sagClaimed: boolean) => {
    if (!celebratingItem) return;

    const updates: any = {};
    if (note) updates.celebration_note = note;
    if (sagClaimed) { updates.sag_claimed = true; updates.sag_claimed_at = new Date().toISOString(); }

    if (Object.keys(updates).length > 0) {
      await (supabase as any)
        .from("beyond_vision_board_items")
        .update(updates)
        .eq("id", celebratingItem.id);

      setItems((prev) =>
        prev.map((i) => i.id === celebratingItem.id ? { ...i, ...updates } : i)
      );
    }

    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      await (supabase as any).from("beyond_celebration_log").insert({
        user_id: session.session.user.id,
        source_type: "vision_long",
        source_id: celebratingItem.id,
        title: celebratingItem.title,
        sag_description: sagClaimed ? celebratingItem.sag_planned : null,
        celebration_note: note || null,
        xp_earned: 150,
      });
    }

    setCelebrationOpen(false);
    setCelebratingItem(null);
  };

  // ── Delete ──
  const deleteItem = async (id: string) => {
    await (supabase as any).from("beyond_vision_board_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Vision removed");
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading your long-term visions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-500" />
            Long-Term Vision Board
          </h1>
          <p className="text-sm text-muted-foreground">
            1-5 year life dreams with milestones. Think big, plan the steps, reward yourself.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <Plus className="mr-1 h-4 w-4" /> Add Life Dream
        </Button>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                  <Star className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    {completedCount}/{totalCount} dreams realized
                  </p>
                  <p className="text-xs text-muted-foreground">Keep dreaming big — you're making it happen</p>
                </div>
              </div>
              <Badge className="bg-indigo-500 text-white">{progressPct}%</Badge>
            </div>
            <Progress value={progressPct} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Vision Cards */}
      <div className="space-y-4">
        {items.map((item) => {
          const milestoneDone = item.milestones.filter((m) => m.done).length;
          const milestoneTotal = item.milestones.length;
          const milestonePct = milestoneTotal > 0 ? Math.round((milestoneDone / milestoneTotal) * 100) : 0;

          return (
            <Collapsible key={item.id}>
              <Card className={`overflow-hidden border bg-gradient-to-br ${item.color} transition-all hover:shadow-lg ${item.is_completed ? "opacity-80" : ""}`}>
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  {item.image_url && (
                    <div className="relative h-40 w-full sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      {item.is_completed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                          <div className="rounded-full bg-green-500 p-3">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="flex-1 p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-2">
                          {CATEGORY_MAP[item.category]?.emoji || "🌱"} {CATEGORY_MAP[item.category]?.label || item.category}
                        </Badge>
                        <h3 className={`font-display text-xl font-bold leading-tight ${item.is_completed ? "line-through" : ""}`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      {item.is_completed && <Badge className="bg-green-500 text-white shrink-0">✓ Dream Realized</Badge>}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2">
                      {item.target_date && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Calendar className="mr-1 h-2.5 w-2.5" />
                          Target: {new Date(item.target_date).toLocaleDateString()}
                        </Badge>
                      )}
                      {milestoneTotal > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Milestone className="mr-1 h-2.5 w-2.5" />
                          {milestoneDone}/{milestoneTotal} milestones
                        </Badge>
                      )}
                      {item.sag_planned && (
                        <Badge variant="secondary" className="text-[10px] border-pink-200 text-pink-600 dark:text-pink-400">
                          <Gift className="mr-1 h-2.5 w-2.5" /> SAG Planned
                        </Badge>
                      )}
                    </div>

                    {/* Milestone Progress */}
                    {milestoneTotal > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Milestone Progress</span>
                          <span className="font-medium">{milestonePct}%</span>
                        </div>
                        <Progress value={milestonePct} className="h-1.5" />
                      </div>
                    )}

                    {/* SAG */}
                    {item.sag_planned && (
                      <div className="rounded-lg bg-white/60 p-2.5 dark:bg-black/20">
                        <p className="text-[11px] text-pink-600 dark:text-pink-400 flex items-start gap-1.5">
                          <Gift className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span><strong>When I achieve this:</strong> "{item.sag_planned}"</span>
                        </p>
                        {item.sag_claimed && (
                          <Badge className="mt-1.5 bg-pink-500 text-white text-[10px]">🎁 Gift Claimed!</Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {!item.is_completed && (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => completeItem(item)}
                        >
                          <Trophy className="mr-1 h-3.5 w-3.5" /> Dream Achieved!
                        </Button>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button size="sm" variant="outline">
                          <ChevronDown className="mr-1 h-3.5 w-3.5" /> Milestones
                        </Button>
                      </CollapsibleTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </div>

                {/* Collapsible Milestones */}
                <CollapsibleContent>
                  {item.milestones.length > 0 && (
                    <div className="border-t px-5 py-4 space-y-2 bg-white/40 dark:bg-black/10">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Milestone className="h-3.5 w-3.5" /> Milestones to This Dream
                      </p>
                      {item.milestones.map((ms) => (
                        <button
                          key={ms.id}
                          onClick={() => toggleMilestone(item.id, ms.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                            ms.done
                              ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                              : "border-border hover:border-indigo-200 hover:bg-indigo-50/30"
                          }`}
                        >
                          <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                            ms.done ? "bg-green-500 border-green-500" : "border-muted-foreground/30"
                          }`}>
                            {ms.done && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <span className={ms.done ? "line-through text-muted-foreground" : ""}>{ms.text}</span>
                          {ms.done && <Badge className="ml-auto bg-green-100 text-green-700 text-[10px] dark:bg-green-900/30 dark:text-green-400">Done</Badge>}
                        </button>
                      ))}
                    </div>
                  )}
                  {item.celebration_note && (
                    <div className="border-t px-5 py-3 bg-amber-50/50 dark:bg-amber-950/10">
                      <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                        "{item.celebration_note}"
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Rocket className="h-12 w-12 mx-auto text-indigo-300 mb-4" />
            <p className="text-xl font-medium">Dream Big — Plan Your Life Vision</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Where do you see yourself in 1-5 years? Add your life dreams, break them into milestones,
              and plan a Self-Appreciation Gift for when you get there.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4 bg-indigo-500 hover:bg-indigo-600">
              <Plus className="mr-1 h-4 w-4" /> Add Your First Life Dream
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <Rocket className="h-5 w-5" /> Add Long-Term Vision (1-5 years)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Life Dream *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Build a 100-bed Ayurvedic hospital"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Paint a picture of this dream — what does success look like?"
                rows={3}
              />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Inspiration Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://example.com/dream-image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Year/Date</Label>
                <Input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Card Color</Label>
              <Select value={form.color} onValueChange={(v) => setForm((f) => ({ ...f, color: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARD_COLORS.map((c) => (
                    <SelectItem key={c.name} value={c.value}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Milestone className="h-3.5 w-3.5" /> Milestones (comma-separated)</Label>
              <Textarea
                value={form.milestones}
                onChange={(e) => setForm((f) => ({ ...f, milestones: e.target.value }))}
                placeholder="e.g., Get land approved, Raise seed funding, Hire core team, Complete construction, Grand opening"
                rows={2}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Break your dream into achievable steps</p>
            </div>
            <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-3 dark:border-pink-800 dark:bg-pink-950/20">
              <Label className="flex items-center gap-1 text-pink-700 dark:text-pink-300">
                <Gift className="h-3.5 w-3.5" /> Self-Appreciation Gift (SAG)
              </Label>
              <Input
                value={form.sag_planned}
                onChange={(e) => setForm((f) => ({ ...f, sag_planned: e.target.value }))}
                placeholder="When I achieve this, I will reward myself with..."
                className="mt-1.5"
              />
              <p className="text-[11px] text-pink-500 mt-1">Dream big about your reward too — you'll earn it!</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addItem} className="bg-indigo-500 hover:bg-indigo-600">
              <Plus className="mr-1 h-4 w-4" /> Add Dream
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
        xpEarned={150}
      />
    </div>
  );
};

export default VisionBoardLong;
