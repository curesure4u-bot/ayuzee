import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles, Plus, Trash2, Heart, Target } from "lucide-react";

type VisionCard = {
  id: string;
  title: string;
  description: string;
  category: string;
  affirmation: string;
  color: string;
};

const uid = () => crypto.randomUUID();
const CATEGORIES = ["Career", "Health", "Learning", "Finance", "Relationships", "Wellness", "Travel", "Personal Growth"];
const COLORS = [
  { name: "Teal", value: "from-teal-100 to-emerald-100 border-teal-200" },
  { name: "Rose", value: "from-rose-100 to-pink-100 border-rose-200" },
  { name: "Amber", value: "from-amber-100 to-yellow-100 border-amber-200" },
  { name: "Blue", value: "from-blue-100 to-sky-100 border-blue-200" },
  { name: "Purple", value: "from-purple-100 to-violet-100 border-purple-200" },
  { name: "Green", value: "from-green-100 to-lime-100 border-green-200" },
  { name: "Indigo", value: "from-indigo-100 to-blue-100 border-indigo-200" },
  { name: "Orange", value: "from-orange-100 to-amber-100 border-orange-200" },
];

const sampleCards: VisionCard[] = [
  { id: uid(), title: "Own a Multi-Branch Clinic", description: "Expand to 3 branches in the state by 2027. Serve 5000+ patients. Be the go-to AYUSH clinic brand.", category: "Career", affirmation: "I am building a healthcare institution that transforms lives.", color: COLORS[0].value },
  { id: uid(), title: "Publish Research in International Journal", description: "Submit 2 papers on Panchakarma outcomes to peer-reviewed journals. Collaborate with university researchers.", category: "Learning", affirmation: "My clinical observations contribute to global Ayurvedic knowledge.", color: COLORS[4].value },
  { id: uid(), title: "Financial Freedom by 40", description: "Build emergency fund of ₹25L. Invest in mutual funds. Zero debt. Passive income streams from courses.", category: "Finance", affirmation: "I attract abundance and manage resources wisely.", color: COLORS[3].value },
  { id: uid(), title: "Vibrant Health & Energy", description: "Daily yoga practice. Maintain ideal weight. Regular health checkups. Sleep 7+ hours. No processed food.", category: "Health", affirmation: "My body is strong, my mind is clear, my spirit is at peace.", color: COLORS[5].value },
  { id: uid(), title: "Mentor 10 AYUSH Students Annually", description: "Take on mentees from colleges. Guide their clinical skills, research, and career choices.", category: "Relationships", affirmation: "I give generously of my knowledge and time.", color: COLORS[1].value },
  { id: uid(), title: "Attend International Conference", description: "Present a paper at ICMR or WHO Traditional Medicine summit. Network globally.", category: "Travel", affirmation: "I belong on the global stage of traditional medicine.", color: COLORS[6].value },
];

const TaskTrackerVisionBoard = () => {
  const [cards, setCards] = useState<VisionCard[]>(sampleCards);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Career", affirmation: "", color: COLORS[0].value });

  const addCard = () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setCards(prev => [...prev, { id: uid(), ...form }]);
    setDialogOpen(false);
    setForm({ title: "", description: "", category: "Career", affirmation: "", color: COLORS[0].value });
    toast.success("Vision added to your board!");
  };

  const deleteCard = (id: string) => { setCards(prev => prev.filter(c => c.id !== id)); toast.success("Removed"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-amber-500" /> Vision Board</h1>
          <p className="text-sm text-muted-foreground">Visualize your goals — what does your ideal future look like?</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600"><Plus className="mr-1 h-4 w-4" /> Add Vision</Button>
      </div>

      {/* Board */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <Card key={card.id} className={`bg-gradient-to-br ${card.color} overflow-hidden hover:shadow-md transition-shadow`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="text-[10px]">{card.category}</Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => deleteCard(card.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold leading-tight">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.description}</p>
              </div>
              {card.affirmation && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs italic text-muted-foreground flex items-start gap-1">
                    <Heart className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" />
                    "{card.affirmation}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {cards.length === 0 && (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-amber-300 mb-4" />
          <p className="text-xl font-medium">Your vision board is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add cards representing your goals, dreams, and aspirations.</p>
        </CardContent></Card>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-amber-600 flex items-center gap-2"><Sparkles className="h-5 w-5" /> Add to Vision Board</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Vision Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Own a Multi-Branch Clinic" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe your vision in detail..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Card Color</Label><Select value={form.color} onValueChange={v => setForm(f => ({ ...f, color: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COLORS.map(c => <SelectItem key={c.name} value={c.value}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Affirmation (optional)</Label><Input value={form.affirmation} onChange={e => setForm(f => ({ ...f, affirmation: e.target.value }))} placeholder="I am... I have... I create..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addCard} className="bg-amber-500 hover:bg-amber-600">Add Vision</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerVisionBoard;
