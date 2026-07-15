import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Heart, Activity, Pill, ClipboardList, Clock, CheckCircle, Plus } from "lucide-react";

const HmsNursing = () => {
  const [marOpen, setMarOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" /> Nursing Station
          </h1>
          <p className="text-sm text-muted-foreground">Medication administration, vitals charting, care plans & nursing notes</p>
        </div>
        <Select defaultValue="ward-gen">
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ward-gen">General Ward (20 beds)</SelectItem>
            <SelectItem value="ward-pk">Panchakarma Suite (12 beds)</SelectItem>
            <SelectItem value="ward-pvt">Private Rooms (8 beds)</SelectItem>
            <SelectItem value="ward-icu">AYUSH ICU (4 beds)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">12</p><p className="text-xs text-muted-foreground">Admitted</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">3</p><p className="text-xs text-muted-foreground">Meds Due Now</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">8</p><p className="text-xs text-muted-foreground">Vitals Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">4</p><p className="text-xs text-muted-foreground">Discharge Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">2</p><p className="text-xs text-muted-foreground">New Admissions</p></CardContent></Card>
      </div>

      <Tabs defaultValue="mar">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="mar">Medication Admin</TabsTrigger>
          <TabsTrigger value="vitals">Vitals Chart</TabsTrigger>
          <TabsTrigger value="care">Care Plans</TabsTrigger>
          <TabsTrigger value="notes">Nursing Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="mar" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4" /> Medication Administration Record (MAR)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { patient: "Ramesh Kumar (Bed 3)", meds: [{ name: "Yogaraja Guggulu 2 tabs", time: "08:00", given: true }, { name: "Rasnasaptakam 15ml", time: "08:00", given: true }, { name: "Yogaraja Guggulu 2 tabs", time: "14:00", given: false }, { name: "Rasnasaptakam 15ml", time: "19:00", given: false }] },
                  { patient: "Sunil Menon (Bed 5)", meds: [{ name: "Guggulutiktakam Kashayam 15ml", time: "07:00", given: true }, { name: "Eranda Tailam 10ml", time: "21:00", given: false }, { name: "Dhanwantharam Cap 2", time: "08:00", given: true }] },
                  { patient: "Meera Nair (PK Suite 2)", meds: [{ name: "Snehapana - Indukantham Ghritam 50ml", time: "06:00", given: true }, { name: "Warm water sips only", time: "All day", given: false }] },
                ].map((p) => (
                  <div key={p.patient} className="rounded-lg border p-3">
                    <p className="font-medium text-sm mb-2">{p.patient}</p>
                    <div className="space-y-1">
                      {p.meds.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Checkbox defaultChecked={m.given} />
                            <span className={`text-xs ${m.given ? "line-through text-muted-foreground" : "font-medium"}`}>{m.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{m.time}</Badge>
                            {m.given && <CheckCircle className="h-3 w-3 text-green-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Vitals Recording</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { patient: "Ramesh Kumar (Bed 3)", latest: { time: "08:00", bp: "130/84", pulse: "78", temp: "98.4", spo2: "97", rr: "16" }, previous: { time: "20:00 (Yesterday)", bp: "138/88", pulse: "82", temp: "98.6", spo2: "96", rr: "18" } },
                  { patient: "Sunil Menon (Bed 5)", latest: { time: "08:00", bp: "122/78", pulse: "72", temp: "98.2", spo2: "98", rr: "14" }, previous: { time: "20:00 (Yesterday)", bp: "126/80", pulse: "74", temp: "98.4", spo2: "98", rr: "15" } },
                  { patient: "Meera Nair (PK Suite 2)", latest: { time: "06:30", bp: "118/74", pulse: "68", temp: "98.0", spo2: "99", rr: "14" }, previous: { time: "18:00 (Yesterday)", bp: "120/76", pulse: "70", temp: "98.2", spo2: "99", rr: "14" } },
                ].map((p) => (
                  <div key={p.patient} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{p.patient}</p>
                      <Button size="sm" variant="outline" className="text-xs h-6"><Plus className="h-3 w-3 mr-1" /> Record</Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-center text-xs">
                      <div><p className="text-muted-foreground">Time</p><p className="font-medium">{p.latest.time}</p></div>
                      <div><p className="text-muted-foreground">BP</p><p className="font-medium">{p.latest.bp}</p></div>
                      <div><p className="text-muted-foreground">Pulse</p><p className="font-medium">{p.latest.pulse}</p></div>
                      <div><p className="text-muted-foreground">Temp</p><p className="font-medium">{p.latest.temp}°F</p></div>
                      <div><p className="text-muted-foreground">SpO2</p><p className="font-medium">{p.latest.spo2}%</p></div>
                      <div><p className="text-muted-foreground">RR</p><p className="font-medium">{p.latest.rr}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Active Care Plans</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { patient: "Ramesh Kumar", plan: "Post-Virechana Care", tasks: ["Monitor stool frequency", "Samsarjana Krama diet (Peya → Vilepi → Akrita Yusha)", "Warm water intake", "Rest - avoid exertion", "Record Agni status"] },
                  { patient: "Meera Nair", plan: "Snehapana Protocol (Day 4)", tasks: ["Give Indukantham Ghritam at 6 AM", "Monitor digestion signs", "Record appetite return time", "No food until hunger", "Observe for Samyak Snigdha Lakshana"] },
                  { patient: "Sunil Menon", plan: "Post-Ksharasutra Change", tasks: ["Dressing change at 10 AM", "Triphala Kwath sitz bath BD", "Observe for bleeding", "Pain score recording", "Diet: High fiber, warm"] },
                ].map((cp) => (
                  <div key={cp.patient} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div><p className="font-medium text-sm">{cp.patient}</p><p className="text-xs text-muted-foreground">{cp.plan}</p></div>
                      <Badge variant="outline" className="text-xs text-green-600">Active</Badge>
                    </div>
                    <div className="space-y-1">
                      {cp.tasks.map((t, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs p-1 hover:bg-muted/30 rounded cursor-pointer">
                          <Checkbox /><span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Nursing Notes</CardTitle>
                <Button size="sm"><Plus className="mr-1 h-3 w-3" /> Add Note</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { time: "08:15", nurse: "Nurse Priya", patient: "Ramesh Kumar", note: "Morning medications administered. Patient reports mild abdominal discomfort post-Virechana. Vitals stable. Informed Dr. Sharma." },
                  { time: "07:00", nurse: "Nurse Anu", patient: "Meera Nair", note: "Snehapana Day 4 - 50ml Indukantham Ghritam given. Patient tolerated well. No nausea. Previous dose digested by 4 AM (10 hr). Appetite delayed." },
                  { time: "06:30", nurse: "Nurse Kavitha", patient: "Sunil Menon", note: "Night was uneventful. Slept well. Dressing intact. No fresh bleeding. Pain 3/10. Morning vitals recorded." },
                ].map((n, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{n.time}</Badge>
                        <span className="text-xs font-medium">{n.nurse}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{n.patient}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsNursing;
