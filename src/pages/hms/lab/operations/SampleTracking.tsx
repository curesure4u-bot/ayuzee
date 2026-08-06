import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  MapPin, Search, Scan, CheckCircle2, Clock, Truck,
  FlaskConical, Package, AlertTriangle, RefreshCw,
  ArrowRight, User, Thermometer, Camera,
} from "lucide-react";

type SampleStage = "Collected" | "In Transit" | "Received at Lab" | "Processing" | "Completed" | "Stored" | "Disposed";

interface SampleTrack {
  id: string;
  barcodeNo: string;
  patientName: string;
  patientId: string;
  testName: string;
  orderNo: string;
  sampleType: string;
  collectedBy: string;
  collectedAt: string;
  collectionLocation: string;
  currentStage: SampleStage;
  temperature?: string;
  chain: ChainEvent[];
  isHomeCollection: boolean;
  riderName?: string;
  riderGPS?: string;
  priority: "Routine" | "Urgent" | "STAT";
  alerts: string[];
}

interface ChainEvent {
  stage: SampleStage;
  timestamp: string;
  performedBy: string;
  location: string;
  scannedBarcode: boolean;
  temperature?: string;
  notes?: string;
  photo?: boolean;
}

const mockSamples: SampleTrack[] = [
  {
    id: "s1", barcodeNo: "260200100000024", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", testName: "RFT + Electrolytes", orderNo: "ORD-2026-0047", sampleType: "Blood (EDTA + Plain)", collectedBy: "Tech. Arun", collectedAt: "2026-07-24 08:30 AM", collectionLocation: "Lab - Kadayanallur", currentStage: "Processing", isHomeCollection: false, priority: "Urgent", alerts: [],
    chain: [
      { stage: "Collected", timestamp: "2026-07-24 08:30 AM", performedBy: "Tech. Arun", location: "Lab Counter", scannedBarcode: true, temperature: "Room Temp" },
      { stage: "Processing", timestamp: "2026-07-24 08:45 AM", performedBy: "Tech. Arun", location: "Biochemistry Dept", scannedBarcode: true, temperature: "2-8°C", notes: "Centrifuged, serum separated" },
    ],
  },
  {
    id: "s2", barcodeNo: "260200100000025", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", testName: "CBC + Iron Studies", orderNo: "ORD-2026-0048", sampleType: "Blood (EDTA)", collectedBy: "Tech. Meena", collectedAt: "2026-07-24 09:15 AM", collectionLocation: "Lab - Kadayanallur", currentStage: "Completed", isHomeCollection: false, priority: "Routine", alerts: [],
    chain: [
      { stage: "Collected", timestamp: "2026-07-24 09:15 AM", performedBy: "Tech. Meena", location: "Lab Counter", scannedBarcode: true },
      { stage: "Processing", timestamp: "2026-07-24 09:30 AM", performedBy: "Tech. Meena", location: "Haematology Dept", scannedBarcode: true },
      { stage: "Completed", timestamp: "2026-07-24 11:00 AM", performedBy: "Tech. Meena", location: "Haematology Dept", scannedBarcode: true },
    ],
  },
  {
    id: "s3", barcodeNo: "260200100000027", patientName: "Mr. Gopal K", patientId: "AL-18045", testName: "HbA1c + Lipid Profile", orderNo: "ORD-2026-0053", sampleType: "Blood (Plain + Fluoride)", collectedBy: "Phlebotomist Ravi", collectedAt: "2026-07-24 08:45 AM", collectionLocation: "Home - 45 North St, Rajapalayam", currentStage: "In Transit", isHomeCollection: true, riderName: "Ravi (Rider)", riderGPS: "9.4523° N, 77.5565° E", priority: "Routine", alerts: ["Temperature alert: Box opened 2 min ago"],
    chain: [
      { stage: "Collected", timestamp: "2026-07-24 08:45 AM", performedBy: "Phlebotomist Ravi", location: "Home - Rajapalayam", scannedBarcode: true, temperature: "2-8°C", photo: true, notes: "Patient OTP verified. Sample in cold box." },
      { stage: "In Transit", timestamp: "2026-07-24 09:00 AM", performedBy: "Ravi (Rider)", location: "En route to Lab", scannedBarcode: true, temperature: "4°C" },
    ],
  },
  {
    id: "s4", barcodeNo: "260200100000028", patientName: "Mrs. Meena K", patientId: "AL-19201", testName: "Thyroid + HbA1c", orderNo: "ORD-2026-0054", sampleType: "Blood (Plain)", collectedBy: "Collection Center SKL", collectedAt: "2026-07-24 07:50 AM", collectionLocation: "CC - Sankarankovil", currentStage: "Received at Lab", isHomeCollection: false, priority: "Routine", alerts: [],
    chain: [
      { stage: "Collected", timestamp: "2026-07-24 07:50 AM", performedBy: "CC Staff", location: "Collection Center - Sankarankovil", scannedBarcode: true, temperature: "2-8°C" },
      { stage: "In Transit", timestamp: "2026-07-24 08:15 AM", performedBy: "Transport - Bike", location: "SKL → KDY", scannedBarcode: true, temperature: "5°C" },
      { stage: "Received at Lab", timestamp: "2026-07-24 09:00 AM", performedBy: "Tech. Arun", location: "Lab - Kadayanallur", scannedBarcode: true, temperature: "6°C", notes: "Condition OK. Labels intact." },
    ],
  },
  {
    id: "s5", barcodeNo: "260200100000029", patientName: "Mr. Venkat Rao", patientId: "AL-16025", testName: "Culture & Sensitivity", orderNo: "ORD-2026-0051", sampleType: "Urine (Mid-stream)", collectedBy: "Tech. Arun", collectedAt: "2026-07-24 09:30 AM", collectionLocation: "Lab - Kadayanallur", currentStage: "Processing", isHomeCollection: false, priority: "Routine", alerts: ["TAT Warning: 48hr elapsed"],
    chain: [
      { stage: "Collected", timestamp: "2026-07-22 09:30 AM", performedBy: "Tech. Arun", location: "Lab Counter", scannedBarcode: true },
      { stage: "Processing", timestamp: "2026-07-22 10:00 AM", performedBy: "Micro Lab", location: "Microbiology Dept", scannedBarcode: true, notes: "Inoculated on culture media" },
    ],
  },
];

const SampleTracking = () => {
  const [samples] = useState<SampleTrack[]>(mockSamples);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [selectedSample, setSelectedSample] = useState<SampleTrack | null>(null);

  const filtered = samples.filter(s => {
    const matchSearch = s.patientName.toLowerCase().includes(search.toLowerCase()) || s.barcodeNo.includes(search) || s.orderNo.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "ALL" || s.currentStage === stageFilter;
    return matchSearch && matchStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) { case "Collected": return "bg-blue-100 text-blue-700"; case "In Transit": return "bg-purple-100 text-purple-700"; case "Received at Lab": return "bg-amber-100 text-amber-700"; case "Processing": return "bg-orange-100 text-orange-700"; case "Completed": return "bg-green-100 text-green-700"; case "Stored": return "bg-gray-100 text-gray-700"; case "Disposed": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) { case "Collected": return <Scan className="h-3 w-3" />; case "In Transit": return <Truck className="h-3 w-3" />; case "Received at Lab": return <Package className="h-3 w-3" />; case "Processing": return <FlaskConical className="h-3 w-3" />; case "Completed": return <CheckCircle2 className="h-3 w-3" />; case "Stored": return <Thermometer className="h-3 w-3" />; default: return <Clock className="h-3 w-3" />; }
  };

  const allStages: SampleStage[] = ["Collected", "In Transit", "Received at Lab", "Processing", "Completed", "Stored", "Disposed"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><MapPin className="h-5 w-5" /> Sample Tracking & Chain of Custody</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Scan className="mr-1 h-3 w-3" /> Scan Barcode</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Scan className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{samples.filter(s => s.currentStage === "Collected").length}</p><p className="text-[10px] text-muted-foreground">Collected</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Truck className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{samples.filter(s => s.currentStage === "In Transit").length}</p><p className="text-[10px] text-muted-foreground">In Transit</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{samples.filter(s => s.currentStage === "Received at Lab").length}</p><p className="text-[10px] text-muted-foreground">Received</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><FlaskConical className="h-4 w-4 mx-auto text-orange-600" /><p className="text-xl font-bold text-orange-600 mt-1">{samples.filter(s => s.currentStage === "Processing").length}</p><p className="text-[10px] text-muted-foreground">Processing</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{samples.filter(s => s.currentStage === "Completed").length}</p><p className="text-[10px] text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[280px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Scan barcode or search patient/order..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Stages</SelectItem>{allStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sample List */}
        <div className="space-y-2 max-h-[550px] overflow-y-auto">
          {filtered.map((sample) => (
            <Card key={sample.id} className={`cursor-pointer transition hover:border-orange-300 ${selectedSample?.id === sample.id ? "border-orange-500 bg-orange-50" : ""} ${sample.alerts.length > 0 ? "border-red-300" : ""}`} onClick={() => setSelectedSample(sample)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{sample.patientName}</p>
                  <Badge className={`text-[9px] ${getStageColor(sample.currentStage)}`}>{getStageIcon(sample.currentStage)} {sample.currentStage}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{sample.testName}</p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>🏷️ {sample.barcodeNo}</span>
                  {sample.isHomeCollection && <Badge variant="outline" className="text-[8px] text-orange-600">Home</Badge>}
                </div>
                {sample.alerts.length > 0 && <p className="text-[9px] text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{sample.alerts[0]}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail + Chain */}
        <div className="lg:col-span-2 space-y-3">
          {!selectedSample ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Select a sample or scan barcode to track</p></CardContent></Card>
          ) : (
            <>
              {/* Sample Info */}
              <Card className="border-blue-200">
                <CardContent className="p-3">
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <p><span className="text-muted-foreground">Patient:</span> <strong>{selectedSample.patientName}</strong> ({selectedSample.patientId})</p>
                    <p><span className="text-muted-foreground">Order:</span> {selectedSample.orderNo}</p>
                    <p><span className="text-muted-foreground">Barcode:</span> <code className="bg-gray-100 px-1 rounded">{selectedSample.barcodeNo}</code></p>
                    <p><span className="text-muted-foreground">Sample:</span> {selectedSample.sampleType}</p>
                    <p><span className="text-muted-foreground">Test:</span> {selectedSample.testName}</p>
                    <p><span className="text-muted-foreground">Priority:</span> <Badge className={`text-[9px] ${selectedSample.priority === "STAT" ? "bg-red-600 text-white" : selectedSample.priority === "Urgent" ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"}`}>{selectedSample.priority}</Badge></p>
                    <p><span className="text-muted-foreground">Collected:</span> {selectedSample.collectedAt}</p>
                    <p><span className="text-muted-foreground">Location:</span> {selectedSample.collectionLocation}</p>
                  </div>
                  {selectedSample.isHomeCollection && selectedSample.riderName && (
                    <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs">
                      <Truck className="h-4 w-4 text-purple-600" />
                      <span>Rider: <strong>{selectedSample.riderName}</strong></span>
                      {selectedSample.riderGPS && <Badge variant="outline" className="text-[9px]"><MapPin className="h-3 w-3 mr-0.5" /> GPS: {selectedSample.riderGPS}</Badge>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chain of Custody Timeline */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Chain of Custody</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {selectedSample.chain.map((event, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${idx === selectedSample.chain.length - 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}>{getStageIcon(event.stage)}</div>
                          {idx < selectedSample.chain.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{event.stage}</span>
                            {event.scannedBarcode && <Badge className="bg-green-100 text-green-700 text-[8px]">✓ Scanned</Badge>}
                            {event.photo && <Badge variant="outline" className="text-[8px]"><Camera className="h-2.5 w-2.5 mr-0.5" /> Photo</Badge>}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{event.timestamp} | {event.performedBy} | {event.location}</p>
                          {event.temperature && <p className="text-[10px] text-blue-600">🌡️ {event.temperature}</p>}
                          {event.notes && <p className="text-[10px] text-muted-foreground italic">{event.notes}</p>}
                        </div>
                      </div>
                    ))}
                    {/* Next expected stage */}
                    {selectedSample.currentStage !== "Completed" && (
                      <div className="flex gap-3 opacity-40">
                        <div className="flex flex-col items-center"><div className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300"><Clock className="h-3 w-3" /></div></div>
                        <p className="text-[10px] text-muted-foreground pt-1">Next: {allStages[allStages.indexOf(selectedSample.currentStage) + 1]}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Stage advanced")}><ArrowRight className="mr-1 h-3 w-3" /> Advance Stage</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Barcode scanned")}><Scan className="mr-1 h-3 w-3" /> Scan</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Temperature logged")}><Thermometer className="mr-1 h-3 w-3" /> Log Temp</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Photo captured")}><Camera className="mr-1 h-3 w-3" /> Photo</Button>
                {selectedSample.alerts.length > 0 && <Button size="sm" variant="outline" className="text-red-600"><AlertTriangle className="mr-1 h-3 w-3" /> View Alerts</Button>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleTracking;
