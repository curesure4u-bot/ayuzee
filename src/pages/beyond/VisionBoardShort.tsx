/**
 * Beyond Praxis — Short-Term Vision Board (3-6 months)
 * Image/URL cards with specific deadlines, accountability partner,
 * SAG (Self Appreciation Gift), and celebration on completion.
 */

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  Gift,
  Image,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Users,
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";
import CelebrationModal from "@/components/beyond/CelebrationModal";

// ════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════════════════════════

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  vision_type: string;
  category: string;
  image_url: string | null;
  target_date: string | null;
  accountability_partner: string | null;
  milestones: any[];
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
  { value: "career", label: "Career", emoji: "🏆" },
  { value: "health", label: "Health & Fitness", emoji: "💪" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "wellness", label: "Wellness", emoji: "🧘" },
  { value: "personal", label: "Personal Growth", emoji: "🌱" },
];

const CARD_COLORS = [
  { name: "Violet", value: "from-violet-100 to-indigo-100 border-violet-200 dark:from-violet-900/30 dark:to-indigo-900/30 dark:border-violet-700" },
  { name: "Rose", value: "from-rose-100 to-pink-100 border-rose-200 dark:from-rose-900/30 dark:to-pink-900/30 dark:border-rose-700" },
  { name: "Amber", value: "from-amber-100 to-yellow-100 border-amber-200 dark:from-amber-900/30 dark:to-yellow-900/30 dark:border-amber-700" },
  { name: "Teal", value: "from-teal-100 to-emerald-100 border-teal-200 dark:from-teal-900/30 dark:to-emerald-900/30 dark:border-teal-700" },
  { name: "Blue", value: "from-blue-100 to-sky-100 border-blue-200 dark:from-blue-900/30 dark:to-sky-900/30 dark:border-blue-700" },
  { name: "Orange", value: "from-orange-100 to-amber-100 border-orange-200 dark:from-orange-900/30 dark:to-amber-900/30 dark:border-orange-700" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyBadge(dateStr: string | null) {
  if (!dateStr) return null;
  const days = daysUntil(dateStr);
  if (days < 0) return <Badge variant="destructive" className="text-[10px]">Overdue</Badge>;
  if (days <= 7) return <Badge className="bg-red-500 text-white text-[10px]">{days}d left</Badge>;
  if (days <= 30) return <Badge className="bg-amber-500 text-white text-[10px]">{days}d left</Badge>;
  return <Badge variant="secondary" className="text-[10px]"><Clock className="mr-1 h-2.5 w-2.5" />{days}d left</Badge>;
}

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════

const VisionBoardShort = () => {
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
    accountability_partner: "",
    sag_planned: "",
    color: CARD_COLORS[0].value,
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
      .eq("vision_type", "short_term")
      .order("display_order", { ascending: true });

    if (data) setItems(data);
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

    const { data, error } = await (supabase as any)
      .from("beyond_vision_board_items")
      .insert({
        user_id: session.session.user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        vision_type: "short_term",
        category: form.category,
        image_url: form.image_url.trim() || null,
        target_date: form.target_date || null,
        accountability_partner: form.accountability_partner.trim() || null,
        sag_planned: form.sag_planned.trim() || null,
        color: form.color,
        display_order: totalCount,
      })
      .select()
      .single();

    if (error) { toast.error("Failed to add vision"); return; }
    if (data) setItems((prev) => [...prev, data]);
    setDialogOpen(false);
    setForm({ title: "", description: "", category: "personal", image_url: "", target_date: "", accountability_partner: "", sag_planned: "", color: CARD_COLORS[0].value });
    toast.success("Vision added to your board!");
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

    await addXP(75, "vision_board_short", `Achieved: ${item.title}`);
    await addCoins(15, "vision_board_short", `Short-term vision achieved`);

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

    // Log celebration
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      await (supabase as any).from("beyond_celebration_log").insert({
        user_id: session.session.user.id,
        source_type: "vision_short",
        source_id: celebratingItem.id,
        title: celebratingItem.title,
        sag_description: sagClaimed ? celebratingItem.sag_planned : null,
        celebration_note: note || null,
        xp_earned: 75,
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
        <div className="animate-pulse text-muted-foreground">Loading your vision board...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-teal-500" />
            Short-Term Vision Board
          </h1>
          <p className="text-sm text-muted-foreground">
            3-6 month goals with images, deadlines & accountability. Make it visual, make it real.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-teal-500 hover:bg-teal-600">
          <Plus className="mr-1 h-4 w-4" /> Add Vision
        </Button>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                <span className="text-xl font-bold text-teal-700 dark:text-teal-300">{completedCount}/{totalCount}</span>{" "}
                <span className="text-muted-foreground">visions achieved</span>
              </p>
              <Badge className="bg-teal-500 text-white">{progressPct}%</Badge>
            </div>
            <Progress value={progressPct} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Vision Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`overflow-hidden border bg-gradient-to-br ${item.color} transition-all hover:shadow-lg ${
              item.is_completed ? "opacity-80" : ""
            }`}
          >
            {/* Image */}
            {item.image_url && (
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {item.is_completed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                    <div className="rounded-full bg-green-500 p-3">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <CardContent className="p-4 space-y-3">
              {/* Category & Urgency */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORY_MAP[item.category]?.emoji || "🌱"} {CATEGORY_MAP[item.category]?.label || item.category}
                </Badge>
                {!item.is_completed && urgencyBadge(item.target_date)}
                {item.is_completed && <Badge className="bg-green-500 text-white text-[10px]">✓ Achieved</Badge>}
              </div>

              {/* Title */}
              <h3 className={`font-display text-lg font-bold leading-tight ${item.is_completed ? "line-through" : ""}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap gap-1.5">
                {item.target_date && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Calendar className="mr-1 h-2.5 w-2.5" />
                    {new Date(item.target_date).toLocaleDateString()}
                  </Badge>
                )}
                {item.accountability_partner && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Users className="mr-1 h-2.5 w-2.5" />
                    {item.accountability_partner}
                  </Badge>
                )}
                {item.sag_planned && (
                  <Badge variant="secondary" className="text-[10px] border-pink-200 text-pink-600 dark:text-pink-400">
                    <Gift className="mr-1 h-2.5 w-2.5" /> SAG
                  </Badge>
                )}
              </div>

              {/* SAG display */}
              {item.sag_planned && (
                <div className="rounded-lg bg-white/60 p-2 dark:bg-black/20">
                  <p className="text-[11px] text-pink-600 dark:text-pink-400 flex items-start gap-1">
                    <Gift className="h-3 w-3 shrink-0 mt-0.5" />
                    <span className="italic">"{item.sag_planned}"</span>
                  </p>
                  {item.sag_claimed && (
                    <Badge className="mt-1 bg-pink-500 text-white text-[10px]">🎁 Gift Claimed!</Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {!item.is_completed && (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => completeItem(item)}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Achieved!
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Eye className="h-12 w-12 mx-auto text-teal-300 mb-4" />
            <p className="text-xl font-medium">Your Short-Term Vision Board</p>
            <p className="text-sm text-muted-foreground mt-1">
              What do you want to achieve in the next 3-6 months? Add images, set deadlines, and get an accountability partner.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4 bg-teal-500 hover:bg-teal-600">
              <Plus className="mr-1 h-4 w-4" /> Create Your First Vision
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-600">
              <Eye className="h-5 w-5" /> Add Short-Term Vision (3-6 months)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vision Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Complete Panchakarma certification"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What does achieving this look like?"
                rows={2}
              />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://example.com/vision-image.jpg"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Paste an image URL that represents your vision</p>
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
                <Label>Deadline *</Label>
                <Input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Accountability Partner</Label>
                <Input
                  value={form.accountability_partner}
                  onChange={(e) => setForm((f) => ({ ...f, accountability_partner: e.target.value }))}
                  placeholder="Name or contact"
                />
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
            </div>
            <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-3 dark:border-pink-800 dark:bg-pink-950/20">
              <Label className="flex items-center gap-1 text-pink-700 dark:text-pink-300">
                <Gift className="h-3.5 w-3.5" /> Self-Appreciation Gift (SAG)
              </Label>
              <Input
                value={form.sag_planned}
                onChange={(e) => setForm((f) => ({ ...f, sag_planned: e.target.value }))}
                placeholder="When I achieve this, I'll treat myself to..."
                className="mt-1.5"
              />
              <p className="text-[11px] text-pink-500 mt-1">You deserve a reward — plan it now!</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addItem} className="bg-teal-500 hover:bg-teal-600">
              <Plus className="mr-1 h-4 w-4" /> Add to Board
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
        xpEarned={75}
      />
    </div>
  );
};

export default VisionBoardShort;
