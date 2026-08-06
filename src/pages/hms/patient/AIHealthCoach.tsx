import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Smartphone, Brain, Send, Activity } from "lucide-react";

const messages = [
  { from: "ai", time: "08:00 AM", text: "Good morning! How was your sleep? (Rate 1-5)" },
  { from: "patient", time: "08:05 AM", text: "3 - slept okay but woke up once" },
  { from: "ai", time: "08:05 AM", text: "For Pitta in Varsha Ritu, try warm milk with nutmeg before bed." },
  { from: "patient", time: "08:10 AM", text: "Slight acidity after dinner" },
  { from: "ai", time: "08:10 AM", text: "Avoid sour/spicy. Tonight: Rice + Moong + Ghee + Lauki. Avipattikar Churna 1 tsp before dinner." },
  { from: "ai", time: "12:00 PM", text: "Reminder: Chandraprabha Vati 2 tablets with warm water." },
  { from: "patient", time: "12:05 PM", text: "Taken!" },
  { from: "ai", time: "05:00 PM", text: "Yoga: Sheetali Pranayama (5 min) + Shavasana (10 min) to cool Pitta." },
];

const AIHealthCoach = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Brain className="h-5 w-5" /> AI Health Coach</h2>
        <Badge variant="outline" className="text-green-600"><Activity className="h-3 w-3 mr-1" /> Active</Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-blue-600">42</p><p className="text-[10px] text-muted-foreground">Messages/Week</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">87%</p><p className="text-[10px] text-muted-foreground">Engagement</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-purple-600">+12 pts</p><p className="text-[10px] text-muted-foreground">Wellness Gain</p></CardContent></Card>
      </div>
      <Card className="border-green-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-green-600" /> Coach — Mr. Rajesh Kumar</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto mb-3">{messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "ai" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-xs ${msg.from === "ai" ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}>
                <p>{msg.text}</p><p className="text-[9px] text-muted-foreground mt-0.5 text-right">{msg.time}</p>
              </div>
            </div>
          ))}</div>
          <div className="flex gap-2"><Input className="h-8 text-xs" placeholder="Type..." /><Button size="sm" className="bg-green-600 h-8"><Send className="h-3 w-3" /></Button></div>
        </CardContent>
      </Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Capabilities</CardTitle></CardHeader><CardContent>
        <div className="grid grid-cols-3 gap-2 text-[10px]">{["Diet (Prakriti)", "Yoga reminders", "Med alerts", "Symptom triage", "Ritucharya tips", "Sleep coaching", "Stress mgmt", "Follow-up", "Lab explain"].map((c,i) => <Badge key={i} variant="outline" className="justify-center">{c}</Badge>)}</div>
      </CardContent></Card>
    </div>
  );
};

export default AIHealthCoach;
