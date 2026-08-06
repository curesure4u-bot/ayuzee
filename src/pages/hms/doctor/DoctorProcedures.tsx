import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Syringe, Calendar, Brain, User, Clock } from "lucide-react";

const procedures = [
  { name: "Kati Basti", category: "Panchakarma", duration: "45 min", sessions: 7 },
  { name: "Janu Basti", category: "Panchakarma", duration: "45 min", sessions: 7 },
  { name: "Greeva Basti", category: "Panchakarma", duration: "45 min", sessions: 7 },
  { name: "Shirodhara", category: "Panchakarma", duration: "60 min", sessions: 7 },
  { name: "Abhyanga + Swedana", category: "Panchakarma", duration: "90 min", sessions: 14 },
  { name: "Nasya", category: "Panchakarma", duration: "30 min", sessions: 7 },
  { name: "Vamana", category: "Panchakarma", duration: "Half day", sessions: 1 },
  { name: "Virechana", category: "Panchakarma", duration: "Half day", sessions: 1 },
  { name: "Basti (Yoga/Karma)", category: "Panchakarma", duration: "60 min", sessions: 16 },
  { name: "Agnikarma", category: "Minor Surgery", duration: "15 min", sessions: 3 },
  { name: "Raktamokshana (Leech)", category: "Minor Surgery", duration: "30 min", sessions: 1 },
  { name: "PRP Therapy", category: "OPT", duration: "45 min", sessions: 3 },
  { name: "Hijama (Cupping)", category: "Therapy", duration: "30 min", sessions: 1 },
];

const activeOrders = [
  { procedure: "Kati Basti", sessions: "3/7 completed", therapist: "Mr. Balasubramanian", room: "PK Room 1", nextDate: "23/07/2026", status: "In Progress" },
  { procedure: "Abhyanga + Swedana", sessions: "5/14 completed", therapist: "Mrs. Rani", room: "PK Room 2", nextDate: "23/07/2026", status: "In Progress" },
  { procedure: "Agnikarma", sessions: "1/3 completed", therapist: "Dr. Saleem (self)", room: "OPD", nextDate: "25/07/2026", status: "Scheduled" },
];

const DoctorProcedures = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [filterCat, setFilterCat] = useState("all");

  const filtered = filterCat === "all" ? procedures : procedures.filter(p => p.category === filterCat);

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Syringe className="h-6 w-6 text-orange-600" /> Procedure & Treatment Orders</h1>
          <p className="text-muted-foreground">Patient: <strong>Mr. Nagaraj (AL-8472)</strong></p>
        </div>
      </div>

      {/* AI Suggestion */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div><p className="font-semibold text-purple-800">AI Protocol Suggestion</p><p className="text-sm text-purple-700 mt-1">For Gridhrasi (Sciatica): Recommended protocol — Kati Basti × 7 days → followed by Tikta Ksheer Basti × 16 days (Anuvasana + Niruha alternate). Add Agnikarma on trigger points × 3 sittings. Expected improvement: 70-80% pain relief.</p></div>
        </CardContent>
      </Card>

      {/* Procedure Selection */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Select Procedures</CardTitle>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="Panchakarma">Panchakarma</SelectItem><SelectItem value="Minor Surgery">Minor Surgery</SelectItem><SelectItem value="OPT">OPT</SelectItem><SelectItem value="Therapy">Therapy</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map(p => (
              <label key={p.name} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 ${selected.includes(p.name) ? "border-orange-400 bg-orange-50/50" : ""}`}>
                <Checkbox checked={selected.includes(p.name)} onCheckedChange={() => toggle(p.name)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.category} · {p.duration} · {p.sessions} sessions</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
              </label>
            ))}
          </div>

          {selected.length > 0 && (
            <>
              <Separator className="my-4" />
              <p className="text-sm font-medium mb-2">Booking Details ({selected.length} procedures selected)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><Label className="text-xs">Start Date</Label><Input type="date" defaultValue="2026-07-23" className="h-8" /></div>
                <div><Label className="text-xs">Time Slot</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="9am">9:00 AM</SelectItem><SelectItem value="10am">10:00 AM</SelectItem><SelectItem value="11am">11:00 AM</SelectItem><SelectItem value="2pm">2:00 PM</SelectItem><SelectItem value="4pm">4:00 PM</SelectItem></SelectContent></Select></div>
                <div><Label className="text-xs">Room</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="pk1">PK Room 1</SelectItem><SelectItem value="pk2">PK Room 2</SelectItem><SelectItem value="opd">OPD</SelectItem></SelectContent></Select></div>
                <div><Label className="text-xs">Therapist</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="bala">Mr. Balasubramanian</SelectItem><SelectItem value="rani">Mrs. Rani</SelectItem><SelectItem value="john">Mr. John</SelectItem></SelectContent></Select></div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={() => { toast.success(`${selected.length} procedures scheduled`); setSelected([]); }}><Calendar className="h-4 w-4 mr-1" /> Schedule Procedure</Button>
                <Button variant="outline" onClick={() => toast.success("Added to bill")}>Add to Bill</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Active Procedure Orders</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Procedure</th><th className="px-3 py-2 text-center">Progress</th><th className="px-3 py-2 text-left">Therapist</th><th className="px-3 py-2 text-left">Room</th><th className="px-3 py-2 text-left">Next</th><th className="px-3 py-2 text-center">Status</th>
            </tr></thead>
            <tbody>{activeOrders.map((o, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{o.procedure}</td>
                <td className="px-3 py-2 text-center text-xs">{o.sessions}</td>
                <td className="px-3 py-2 text-xs">{o.therapist}</td>
                <td className="px-3 py-2 text-xs">{o.room}</td>
                <td className="px-3 py-2 text-xs">{o.nextDate}</td>
                <td className="px-3 py-2 text-center"><Badge variant={o.status === "In Progress" ? "default" : "secondary"} className="text-[10px]">{o.status}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div></CardContent>
      </Card>
    </div>
  );
};

export default DoctorProcedures;
