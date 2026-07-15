import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Heart, FileText, Pill, FlaskConical, Calendar, Bell,
  Sparkles, Download, Share2, QrCode, Clock, TrendingUp,
  Apple, Dumbbell, Activity,
} from "lucide-react";

type TimelineEvent = {
  id: string;
  date: string;
  type: "consultation" | "prescription" | "lab" | "panchakarma" | "admission" | "followup";
  title: string;
  doctor: string;
  facility: string;
  details: string;
};

type MedicineReminder = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  time: string[];
  remaining: number;
  totalDays: number;
};

const mockTimeline: TimelineEvent[] = [
  { id: "1", date: "2026-07-15", type: "consultation", title: "OPD Follow-up - Sandhivata", doctor: "Dr. Arun Sharma", facility: "Ayuzee Main Hospital", details: "Pain reduced to 3/10. ROM improved. Continue current medications." },
  { id: "2", date: "2026-07-10", type: "lab", title: "Blood Investigation", doctor: "Dr. Arun Sharma", facility: "Ayuzee Lab", details: "ESR: 18 (↓), CRP: 4.2 (↓), Vit D3: 22 ng/ml (Low)" },
  { id: "3", date: "2026-07-01", type: "panchakarma", title: "Janu Basti Completed (7 days)", doctor: "Dr. Meena Patel", facility: "Ayuzee Panchakarma Center", details: "7 sessions completed. Kottamchukkadi Tailam used. 65% pain relief." },
  { id: "4", date: "2026-06-25", type: "prescription", title: "Ayurveda Prescription", doctor: "Dr. Arun Sharma", facility: "Ayuzee Main Hospital", details: "Yogaraja Guggulu, Rasnasaptakam Kashayam, Dhanwantharam Tailam (ext)" },
  { id: "5", date: "2026-06-25", type: "consultation", title: "OPD New Visit - Knee Pain", doctor: "Dr. Arun Sharma", facility: "Ayuzee Main Hospital", details: "Bilateral knee pain 2 years. Diagnosed: Sandhivata Grade 2. Prakruti: Vata-Kapha." },
  { id: "6", date: "2026-06-10", type: "lab", title: "X-Ray Knee Bilateral", doctor: "Dr. Nair", facility: "Sunrise Imaging", details: "Grade 2 OA changes bilateral. Osteophytes present. Joint space mildly narrowed." },
  { id: "7", date: "2025-12-20", type: "admission", title: "Panchakarma Admission (14 days)", doctor: "Dr. Meena Patel", facility: "Kottakkal AVS Hospital", details: "Full Panchakarma for Sandhivata. Virechana + Vasti course completed." },
];

const mockMedicines: MedicineReminder[] = [
  { id: "1", name: "Yogaraja Guggulu", dose: "2 tablets", frequency: "TDS", time: ["08:00", "14:00", "20:00"], remaining: 18, totalDays: 30 },
  { id: "2", name: "Rasnasaptakam Kashayam", dose: "15ml", frequency: "BD", time: ["07:00", "19:00"], remaining: 18, totalDays: 30 },
  { id: "3", name: "Ashwagandha Churnam", dose: "3g", frequency: "HS", time: ["21:30"], remaining: 22, totalDays: 30 },
  { id: "4", name: "Dhanwantharam Tailam", dose: "Q.S.", frequency: "Daily", time: ["07:30"], remaining: 25, totalDays: 30 },
];

const HmsPhr = () => {
  const [timeline] = useState<TimelineEvent[]>(mockTimeline);
  const [medicines] = useState<MedicineReminder[]>(mockMedicines);

  const getTypeIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "consultation": return <Activity className="h-4 w-4 text-blue-600" />;
      case "prescription": return <Pill className="h-4 w-4 text-emerald-600" />;
      case "lab": return <FlaskConical className="h-4 w-4 text-purple-600" />;
      case "panchakarma": return <Sparkles className="h-4 w-4 text-amber-600" />;
      case "admission": return <Heart className="h-4 w-4 text-red-600" />;
      case "followup": return <Calendar className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" /> Patient Health Records
          </h1>
          <p className="text-sm text-muted-foreground">
            Your health, all in one place · Carry your health history everywhere
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><QrCode className="mr-1 h-4 w-4" /> Health Card</Button>
          <Button variant="outline" size="sm"><Share2 className="mr-1 h-4 w-4" /> Share</Button>
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
        </div>
      </div>

      {/* Patient Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="font-bold text-lg">Ramesh Kumar</p>
              <p className="text-xs text-muted-foreground">UHID: AYZ-2026-001 · Male, 51y</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ABHA</p>
              <p className="font-mono text-sm font-medium">91-1234-5678-9012</p>
              <Badge variant="outline" className="text-xs text-green-600 mt-1">Verified</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prakruti</p>
              <p className="font-medium">Vata-Kapha</p>
              <p className="text-xs text-muted-foreground">Sandhivata (OA Knee)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Treatment</p>
              <p className="font-medium">Shamana + Panchakarma</p>
              <p className="text-xs text-muted-foreground">Since Jun 25, 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="timeline">Health Timeline</TabsTrigger>
          <TabsTrigger value="medicines">My Medicines</TabsTrigger>
          <TabsTrigger value="reports">Reports & Labs</TabsTrigger>
          <TabsTrigger value="diet">Diet & Lifestyle</TabsTrigger>
          <TabsTrigger value="journey">Panchakarma Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Complete Health Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative pl-10">
                      <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-card border-2 border-border grid place-items-center">
                        {getTypeIcon(event.type)}
                      </div>
                      <div className="rounded-lg border p-3 hover:bg-muted/30 transition">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <span className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{event.doctor} · {event.facility}</p>
                        <p className="text-sm mt-1">{event.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Medicine Reminders
                </CardTitle>
                <Badge variant="outline" className="text-xs">{medicines.length} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicines.map((med) => (
                  <div key={med.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dose} · {med.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{med.remaining} days left</p>
                        <div className="w-20 bg-muted rounded-full h-1.5 mt-1">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(med.remaining / med.totalDays) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {med.time.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Lab Results & Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { test: "ESR", values: [{ date: "Jul 10", value: "18", status: "normal" }, { date: "Jun 25", value: "28", status: "high" }], unit: "mm/hr", ref: "0-20" },
                  { test: "CRP", values: [{ date: "Jul 10", value: "4.2", status: "normal" }, { date: "Jun 25", value: "12.5", status: "high" }], unit: "mg/L", ref: "<5" },
                  { test: "Vitamin D3", values: [{ date: "Jul 10", value: "22", status: "low" }], unit: "ng/ml", ref: "30-100" },
                  { test: "Hemoglobin", values: [{ date: "Jul 10", value: "13.2", status: "normal" }], unit: "g/dL", ref: "12-16" },
                  { test: "Fasting Sugar", values: [{ date: "Jul 10", value: "98", status: "normal" }, { date: "Jun 25", value: "142", status: "high" }], unit: "mg/dL", ref: "70-110" },
                ].map((lab) => (
                  <div key={lab.test} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{lab.test}</p>
                      <span className="text-xs text-muted-foreground">Ref: {lab.ref} {lab.unit}</span>
                    </div>
                    <div className="flex gap-3">
                      {lab.values.map((v, i) => (
                        <div key={i} className={`px-3 py-1 rounded text-xs font-medium ${
                          v.status === "normal" ? "bg-green-50 text-green-700 border border-green-200" :
                          v.status === "high" ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {v.date}: <strong>{v.value}</strong> {lab.unit}
                          {i > 0 && <TrendingUp className="inline h-3 w-3 ml-1" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Apple className="h-4 w-4" /> Pathya-Apathya (Diet Plan)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-medium text-sm text-green-700 mb-2">Pathya (Beneficial)</p>
                  <ul className="space-y-1 text-xs text-green-600">
                    <li>• Warm, freshly cooked food</li>
                    <li>• Wheat, rice, green gram dal</li>
                    <li>• Ginger, garlic, turmeric</li>
                    <li>• Warm water throughout day</li>
                    <li>• Sesame seeds, drumstick</li>
                    <li>• Milk with Ashwagandha at night</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="font-medium text-sm text-red-700 mb-2">Apathya (Avoid)</p>
                  <ul className="space-y-1 text-xs text-red-600">
                    <li>• Cold, raw, leftover food</li>
                    <li>• Curd (especially at night)</li>
                    <li>• Fried and heavy foods</li>
                    <li>• Cold beverages, ice cream</li>
                    <li>• Excess salt and sour items</li>
                    <li>• Rajma, chana, heavy pulses</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="font-medium text-sm text-blue-700 mb-2 flex items-center gap-2"><Dumbbell className="h-4 w-4" /> Exercise Prescription</p>
                <ul className="space-y-1 text-xs text-blue-600">
                  <li>• Gentle walking: 20 min morning + 15 min evening</li>
                  <li>• Knee strengthening exercises (as shown): 10 reps x 3 sets</li>
                  <li>• Avoid stair climbing, squatting, prolonged standing</li>
                  <li>• Warm sesame oil massage to knees before exercise</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-600" /> Panchakarma Journey</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Active Course */}
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">Janu Basti + Podikizhi Course</p>
                      <p className="text-xs text-muted-foreground">Dr. Meena Patel · Ayuzee Panchakarma Center</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">Completed</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 rounded bg-card border"><p className="text-lg font-bold">7/7</p><p className="text-[10px] text-muted-foreground">Sessions Done</p></div>
                    <div className="text-center p-2 rounded bg-card border"><p className="text-lg font-bold text-green-600">65%</p><p className="text-[10px] text-muted-foreground">Pain Relief</p></div>
                    <div className="text-center p-2 rounded bg-card border"><p className="text-lg font-bold">120°</p><p className="text-[10px] text-muted-foreground">ROM Improved</p></div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                {/* Past Course */}
                <div className="rounded-lg border p-4 opacity-80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">Full Panchakarma (14 days)</p>
                      <p className="text-xs text-muted-foreground">Dec 2025 · Kottakkal AVS Hospital</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-green-600">Completed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Virechana + Vasti course. Significant improvement in mobility. Weight reduced by 3kg.</p>
                </div>

                {/* Upcoming */}
                <div className="rounded-lg border border-dashed border-blue-300 p-4 bg-blue-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">Recommended: Abhyanga + Elakizhi (7 days)</p>
                      <p className="text-xs text-muted-foreground">Suggested by Dr. Arun Sharma for next month</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">Book Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ABDM Connected Notice */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 flex items-center gap-3">
          <Heart className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Connected to ABDM · Your records travel with you</p>
            <p className="text-blue-600 mt-0.5">Health records from all hospitals you've visited are securely linked via ABDM. Share your complete history with any new doctor instantly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsPhr;
