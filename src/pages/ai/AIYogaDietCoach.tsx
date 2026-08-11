import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const meals = [
  { time: "6:00 AM", name: "Warm Lemon Water", desc: "Hydrates and stimulates Agni without aggravating Pitta" },
  { time: "7:30 AM", name: "Coconut Oat Porridge", desc: "Cooling grains with sweet taste — balances Pitta-Vata" },
  { time: "10:30 AM", name: "Mint Buttermilk", desc: "Digestive support, cooling, light on Kapha" },
  { time: "12:30 PM", name: "Basmati Rice + Mung Dal + Ghee", desc: "Sattvic lunch — largest meal of the day" },
  { time: "4:00 PM", name: "Dates & Almonds (soaked)", desc: "Nourishing Vata, grounding energy for evening" },
  { time: "7:00 PM", name: "Vegetable Soup + Chapati", desc: "Light dinner, easy to digest before sleep" },
];

const poses = [
  { name: "Sheetali Pranayama", duration: "5 min", benefit: "Cools Pitta, calms mind" },
  { name: "Ardha Matsyendrasana", duration: "3 min each side", benefit: "Stimulates digestion, detoxifies" },
  { name: "Viparita Karani", duration: "5 min", benefit: "Reduces Vata, calms nervous system" },
  { name: "Bhujangasana", duration: "3 min", benefit: "Opens chest, balances Kapha" },
  { name: "Shavasana with Yoga Nidra", duration: "10 min", benefit: "Deep restoration for Pitta-Vata" },
  { name: "Surya Namaskar (slow)", duration: "10 min", benefit: "Full body activation without overheating" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AIYogaDietCoach() {
  const [checkedDays, setCheckedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu"]);

  const toggleDay = (day: string) => {
    setCheckedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    toast.success(`Progress updated!`);
  };

  const streak = checkedDays.length;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">AI Yoga & Diet Coach</h1>
      <p className="text-muted-foreground">Personalized for <Badge>Pitta-Vata</Badge> constitution</p>

      <Tabs defaultValue="diet">
        <TabsList>
          <TabsTrigger value="diet">Diet Plan</TabsTrigger>
          <TabsTrigger value="yoga">Yoga Routine</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="diet" className="space-y-3 mt-4">
          {meals.map((m) => (
            <Card key={m.time}>
              <CardContent className="pt-4 flex gap-4 items-start">
                <Badge variant="outline" className="shrink-0">{m.time}</Badge>
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="yoga" className="space-y-3 mt-4">
          {poses.map((p) => (
            <Card key={p.name}>
              <CardContent className="pt-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.benefit}</p>
                </div>
                <Badge variant="secondary">{p.duration}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Weekly Check-In</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition ${
                      checkedDays.includes(day) ? "bg-primary text-primary-foreground border-primary" : "border-muted"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold">{streak} days</p>
              <p className="text-muted-foreground">Current streak this week</p>
              <Badge className="mt-2" variant={streak >= 5 ? "default" : "secondary"}>
                {streak >= 5 ? "🔥 On Fire!" : "Keep going!"}
              </Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
