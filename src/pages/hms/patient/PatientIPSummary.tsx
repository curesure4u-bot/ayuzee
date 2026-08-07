import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { BedDouble, Printer, FileText, Brain, Activity, IndianRupee, Calendar, CheckCircle } from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

const ipAdmissions = [
  { ipNo: 14, doa: "17/04/2025", dod: "23/04/2025", casesheet: true, dischargeSummary: true, billClosed: true, print: true, externalForms: true, doctor: "Dr. Vasumathi BAMS", date: "17/04/2025 11:40" },
  { ipNo: 25, doa: "15/05/2023", dod: "", casesheet: true, dischargeSummary: true, billClosed: true, print: false, externalForms: true, doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "15/05/2023 16:14" },
];

const PatientIPSummary = () => {
  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">IP/Emergency Summary</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          <span className="text-sm text-violet-700">
            Total IP Admissions: {ipAdmissions.length} | All bills closed | Last admission: {ipAdmissions[0].doa}
          </span>
        </CardContent>
      </Card>

      {/* IP Records & Details */}
      <Tabs defaultValue="admissions">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="current">Current Stay</TabsTrigger>
          <TabsTrigger value="progress">Daily Progress</TabsTrigger>
          <TabsTrigger value="billing">Billing Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="admissions" className="space-y-4">
          {ipAdmissions.map((ip) => (
            <Card key={ip.ipNo}>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <BedDouble className="h-4 w-4" /> IP No: {ip.ipNo} <Printer className="h-3 w-3 text-muted-foreground cursor-pointer" />
                    </p>
                  </div>
                  <div className="text-sm"><strong>DOA:</strong> {ip.doa}</div>
                  <div className="text-sm flex items-center gap-2"><strong>DOD:</strong> {ip.dod || "—"}</div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {ip.casesheet && <Badge className="bg-green-600 text-white cursor-pointer" onClick={() => toast.info("Open Casesheet")}>Casesheet</Badge>}
                  {ip.dischargeSummary && <Badge className="bg-orange-500 text-white cursor-pointer" onClick={() => toast.info("Open Discharge Summary")}>Discharge Summary</Badge>}
                  {ip.billClosed && <Badge variant="outline" className="text-green-600">Bill Closed</Badge>}
                  {ip.externalForms && <Badge variant="secondary" className="cursor-pointer">External Forms</Badge>}
                </div>
                <p className="text-right mt-2 text-xs text-muted-foreground">{ip.doctor} · {ip.date}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Current Admission Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Ward / Bed</p><p className="font-bold">PK Suite 2</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Admitted On</p><p className="font-bold">10/07/2026</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Day of Stay</p><p className="font-bold">Day 7 of 14</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Attending Doctor</p><p className="font-bold">Dr. M. Saleem</p></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm"><span>Treatment Progress</span><span className="font-bold">50%</span></div>
                <Progress value={50} className="h-2" />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-green-700">Diagnosis</p>
                    <p className="text-sm mt-1">Gridhrasi (Sciatica) — L4-L5 disc bulge</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-blue-700">Treatment Plan</p>
                    <p className="text-sm mt-1">Kati Basti × 7 + Yoga Basti × 8 + Abhyanga-PPS</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Daily Progress Notes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { day: "Day 7", date: "16/07/2026", pain: "3/10", note: "Significant improvement. Can sit for 30 min without pain. SLR 60° (was 30°). Kati Basti completed. Starting Yoga Basti today.", therapies: "Kati Basti + Abhyanga + PPS", vitals: "BP 128/82, P 74" },
                  { day: "Day 5", date: "14/07/2026", pain: "5/10", note: "Moderate improvement. Morning stiffness reducing. Able to walk without support. Sleep improved.", therapies: "Kati Basti + Abhyanga + PPS", vitals: "BP 132/84, P 78" },
                  { day: "Day 3", date: "12/07/2026", pain: "6/10", note: "Mild relief. Pain radiating less to leg. Internal meds well tolerated. Appetite improving.", therapies: "Kati Basti + Abhyanga + PPS", vitals: "BP 130/86, P 76" },
                  { day: "Day 1", date: "10/07/2026", pain: "8/10", note: "Admission day. Severe radiating pain L-leg. Difficulty sitting. SLR 30° positive. Nadi: Vata aggravated.", therapies: "Abhyanga only (assessment day)", vitals: "BP 142/90, P 82" },
                ].map((d) => (
                  <div key={d.day} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{d.day}</Badge>
                        <span className="text-xs text-muted-foreground">{d.date}</span>
                      </div>
                      <Badge variant={parseInt(d.pain) <= 3 ? "outline" : parseInt(d.pain) <= 5 ? "secondary" : "destructive"} className={`text-xs ${parseInt(d.pain) <= 3 ? "text-green-600" : ""}`}>Pain: {d.pain}</Badge>
                    </div>
                    <p className="text-xs mt-1">{d.note}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>Therapies: {d.therapies}</span>
                      <span>Vitals: {d.vitals}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" /> IP Billing Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { item: "Room Charges (PK Suite × 7 days)", amount: 14000 },
                  { item: "Kati Basti × 7 sessions", amount: 10500 },
                  { item: "Abhyanga + PPS × 7 sessions", amount: 8400 },
                  { item: "Yoga Basti × 3 sessions (ongoing)", amount: 3600 },
                  { item: "Medicines (Internal)", amount: 2800 },
                  { item: "Medicines (External Oils)", amount: 1500 },
                  { item: "Doctor Consultation", amount: 3000 },
                  { item: "Lab Tests (CBC, ESR, X-Ray)", amount: 2200 },
                ].map((b) => (
                  <div key={b.item} className="flex items-center justify-between p-2 rounded border text-sm">
                    <span>{b.item}</span>
                    <span className="font-bold">₹{b.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                <p className="font-bold text-green-700">Total (so far)</p>
                <p className="text-xl font-bold text-green-700">₹46,000</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => toast.info("Opening interim bill...")}>Generate Interim Bill</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Opening insurance claim...")}>Insurance Claim</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientIPSummary;
