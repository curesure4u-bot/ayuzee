import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type ShoutOut = {
  id: string; from: string; fromRole: string; fromEmoji: string;
  to: string; toRole: string; toEmoji: string;
  message: string; emoji: string; coins: number;
  date: string; reactions: { emoji: string; count: number }[];
};

const mockShoutOuts: ShoutOut[] = [
  { id: "1", from: "Ramesh Kumar", fromRole: "Patient", fromEmoji: "👤", to: "Dr. Arun Sharma", toRole: "Doctor", toEmoji: "🩺", message: "Thank you for the amazing treatment! My knee pain is 80% better after Janu Basti. You're the best doctor! 🙏", emoji: "🌟", coins: 5, date: "Jul 15, 2026", reactions: [{ emoji: "❤️", count: 12 }, { emoji: "👏", count: 8 }, { emoji: "🙌", count: 5 }] },
  { id: "2", from: "Dr. Meena Patel", fromRole: "Doctor", fromEmoji: "🩺", to: "Suresh Therapist", toRole: "Therapist", toEmoji: "💆", message: "Outstanding work on the Pizhichil sessions this week. Patients consistently report excellent experience with you. Keep it up! 💪", emoji: "⭐", coins: 5, date: "Jul 14, 2026", reactions: [{ emoji: "❤️", count: 8 }, { emoji: "🔥", count: 6 }, { emoji: "💯", count: 4 }] },
  { id: "3", from: "Kavitha (Admin)", fromRole: "HMS Staff", fromEmoji: "🏥", to: "Rajesh K (Reception)", toRole: "HMS Staff", toEmoji: "🏥", message: "Zero billing errors this entire month! Your accuracy and speed are impressive. The whole front office team benefits from your dedication. 🎯", emoji: "🏆", coins: 5, date: "Jul 13, 2026", reactions: [{ emoji: "👏", count: 15 }, { emoji: "💪", count: 7 }, { emoji: "🎉", count: 4 }] },
  { id: "4", from: "Dr. Arun Sharma", fromRole: "Doctor", fromEmoji: "🩺", to: "Dr. Priya (PG Student)", toRole: "Student", toEmoji: "🎓", message: "Excellent case presentation today on Amavata management. Your research on Guggulu preparations was thorough. Future AYUSH champion! 📚", emoji: "🎓", coins: 5, date: "Jul 12, 2026", reactions: [{ emoji: "❤️", count: 10 }, { emoji: "📚", count: 6 }, { emoji: "🙌", count: 3 }] },
  { id: "5", from: "Priya Menon", fromRole: "Patient", fromEmoji: "👤", to: "Ayuzee Main Hospital", toRole: "Service Provider", toEmoji: "🏨", message: "Best wellness experience ever! Clean rooms, caring staff, amazing food during Samsarjana. Will recommend to all friends. 🌟🏨", emoji: "💎", coins: 5, date: "Jul 11, 2026", reactions: [{ emoji: "❤️", count: 20 }, { emoji: "🌟", count: 12 }, { emoji: "🏆", count: 8 }] },
];

const REACTION_EMOJIS = ["❤️", "👏", "🔥", "💪", "🙌", "💯", "🎉", "🌟"];

const ShoutOuts = () => {
  const [shoutOuts] = useState<ShoutOut[]>(mockShoutOuts);
  const [giveOpen, setGiveOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">💝 Shout Outs</h1>
          <p className="text-sm text-muted-foreground">Peer recognition across all roles · Give appreciation · Earn coins by recognizing others</p>
        </div>
        <Button onClick={() => setGiveOpen(true)}>🎉 Give a Shout Out (+5🪙)</Button>
      </div>

      {/* Shout Out Feed */}
      <div className="space-y-4">
        {shoutOuts.map((so) => (
          <Card key={so.id} className="hover:shadow-lg transition">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{so.emoji}</div>
                <div className="flex-1">
                  {/* From → To */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-medium text-sm">{so.fromEmoji} {so.from}</span>
                    <Badge variant="outline" className="text-[9px]">{so.fromRole}</Badge>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-bold text-sm">{so.toEmoji} {so.to}</span>
                    <Badge variant="outline" className="text-[9px]">{so.toRole}</Badge>
                  </div>
                  {/* Message */}
                  <p className="text-sm leading-relaxed">{so.message}</p>
                  {/* Meta */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      {so.reactions.map((r) => (
                        <Button key={r.emoji} size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-muted">{r.emoji} {r.count}</Button>
                      ))}
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-muted">+</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]">+{so.coins}🪙 earned</Badge>
                      <span className="text-[10px] text-muted-foreground">{so.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Give Shout Out Dialog */}
      <Dialog open={giveOpen} onOpenChange={setGiveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>🎉 Give a Shout Out</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Who do you want to appreciate? *</Label><Input placeholder="Search name..." /></div>
            <div><Label>Choose an emoji</Label>
              <div className="flex gap-2 mt-1">{["🌟", "⭐", "🏆", "💎", "🎓", "💪", "❤️", "🔥"].map(e => <Button key={e} variant="outline" size="sm" className="text-xl h-10 w-10 p-0">{e}</Button>)}</div>
            </div>
            <div><Label>Your message *</Label><Textarea placeholder="What did they do that impressed you? Be specific! 🙏" rows={3} /></div>
            <p className="text-xs text-muted-foreground">✨ Both you AND the person you appreciate earn +5 Ayuzee Coins!</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiveOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("🎉 Shout Out sent! You earned +5🪙"); setGiveOpen(false); }}>Send Shout Out 🎉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="p-4 text-center">
          <p className="text-2xl mb-1">💝</p>
          <p className="font-bold text-pink-700">Recognition is a two-way reward!</p>
          <p className="text-xs text-pink-600 mt-1">When you give a shout out, BOTH you and the recipient earn +5 Ayuzee Coins. Spread positivity across the Ayuzee community — doctors, patients, therapists, students, everyone!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoutOuts;
