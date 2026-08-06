import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Pill, Brain, Sparkles, Plus, Search, Printer,
  Star, Package, AlertTriangle, CheckCircle, X,
  Mic, MicOff, Volume2,
} from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

interface RxItem {
  sNo: number; type: string; name: string; genericName: string; dosage: string;
  frequency: string; duration: string; instruction: string; notes: string; laterality: string;
}

const mockPrescription: RxItem[] = [
  { sNo: 1, type: "", name: "KATI 450 ML", genericName: "", dosage: "10ml", frequency: "15 - 0 - 15 - 0", duration: "× 15 days", instruction: "Before Food", notes: "", laterality: "N/A" },
  { sNo: 2, type: "", name: "DHANWANTHARAM GRITHAM", genericName: "", dosage: "", frequency: "0 - 0 - 0 - 0", duration: "× 15 days", instruction: "N/A", notes: "", laterality: "N/A" },
  { sNo: 3, type: "", name: "SWASAMRUTH CAP", genericName: "", dosage: "", frequency: "1 - 0 - 0 - 1", duration: "× 15 days", instruction: "After Food", notes: "", laterality: "N/A" },
];

const mockPastPrescriptions = [
  { sNo: 1, name: "11/04/2026 11:04", medicines: "KATI 450 ML 0 x 0 x 0 x 0 for 15 days\nLaterality:N/A DHANWANTHARAM GRITHAM 1tspn x 0 x 0 x tspn for 15 days\nLaterality:N/A SWASAMRUTH CAP 1 x 0 x 0 x 1 for 15 days\nLaterality:N/A LUMBATONE CAP 1 x 0 x 0 x 1 for 15 days" },
];

const mockMedicineStock = [
  { name: "DR RELAXI CAP", brand: "ALSHIFA", stock: 10067, pcode: 2103 },
  { name: "DISC-O-CART TABLET", brand: "ALSHIFA", stock: 5149, pcode: 3085 },
  { name: "DASAMOOLAKATRAYAM KASAYAM TABLET", brand: "AVN", stock: 4073, pcode: 2828 },
  { name: "DHANWANTRA GULIKA", brand: "LSS", stock: 4070, pcode: 2406 },
  { name: "DANTADBHEDGADANTAK RAS", brand: "ALSHIFA", stock: 3698, pcode: 3307 },
  { name: "SHADDHARNAM DS TABLET", brand: "ALSHIFA", stock: 3322, pcode: 3495 },
  { name: "DHANWANTARAM KASAYAM TABLET", brand: "AVN", stock: 2845, pcode: 2831 },
];

const mockPackages = [
  { name: "LBA", medicines: [
    { name: "KATI 450 ML", intake: 2, time: "N/A", duration: "2 Days" },
    { name: "LUMBATONE CAP", intake: 60, time: "N/A", duration: "60 Days" },
    { name: "SAHACHARATHI THAILAM 200ML", intake: 1, time: "N/A", duration: "1 Day" },
    { name: "VEDHANAMRUTH CAP", intake: 30, time: "N/A", duration: "30 Days" },
    { name: "VATHAMRUTH CAP", intake: 60, time: "N/A", duration: "60 Days" },
    { name: "GANDHARVAHASTHA ERANDA THAILAM CAPSULE", intake: 30, time: "N/A", duration: "30 Days" },
  ]},
];

const medicineTypes = ["Tablet", "Capsule", "Cream", "Drops", "Gel", "Inhaler", "Syrup", "Kashayam", "Churnam", "Thailam"];

const PatientPrescription = () => {
  const [rxTab, setRxTab] = useState("op");
  const [showFavorites, setShowFavorites] = useState(true);
  const [showPastRx, setShowPastRx] = useState(true);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showPharmacyDialog, setShowPharmacyDialog] = useState(false);
  const [medSearch, setMedSearch] = useState("");
  const [showStockOnly, setShowStockOnly] = useState(true);
  const [store, setStore] = useState("");
  const [prescription, setPrescription] = useState<RxItem[]>(mockPrescription);

  // New medicine input
  const [newMedName, setNewMedName] = useState("");
  const [newMedType, setNewMedType] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFreqMorn, setNewMedFreqMorn] = useState("0");
  const [newMedFreqNoon, setNewMedFreqNoon] = useState("0");
  const [newMedFreqEve, setNewMedFreqEve] = useState("0");
  const [newMedFreqNight, setNewMedFreqNight] = useState("0");
  const [newMedDur, setNewMedDur] = useState("");
  const [newMedDurUnit, setNewMedDurUnit] = useState("Days");
  const [newMedInstruction, setNewMedInstruction] = useState("N/A");
  const [newMedLaterality, setNewMedLaterality] = useState("N/A");
  const [newMedNotes, setNewMedNotes] = useState("");

  // ─── AI Voice-to-Prescription State ───────────────────────
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // AI Voice Parser: converts spoken text into structured prescription
  const parseVoiceToPrescription = useCallback((transcript: string) => {
    setVoiceProcessing(true);
    const text = transcript.toLowerCase().trim();

    // AI Pattern matching for medicine dictation
    // Supported patterns: "[medicine name] [dose] [frequency] [duration] [instruction]"
    // Example: "Yogaraja Guggulu 2 tablets twice a day for 30 days after food"
    const medicinePatterns = [
      // Pattern: name + dose + frequency + duration + instruction
      /(.+?)\s+(\d+\s*(?:tablet|capsule|ml|mg|gm|tsp|teaspoon)s?)\s+(.+?)\s+(?:for\s+)?(\d+\s*(?:day|week|month)s?)\s+(before food|after food|with food|empty stomach)?/i,
      // Simpler: name + frequency + duration
      /(.+?)\s+(once|twice|thrice|one time|two times|three times|bd|tds|od|hs)\s+(?:a day\s+)?(?:for\s+)?(\d+\s*(?:day|week|month)s?)/i,
      // Simplest: just the medicine name
      /^(.+)$/i,
    ];

    let parsed = false;

    for (const pattern of medicinePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const medName = match[1].trim().toUpperCase();
        // Try to match against stock
        const stockMatch = mockMedicineStock.find((m) =>
          m.name.toLowerCase().includes(medName.toLowerCase()) ||
          medName.toLowerCase().includes(m.name.toLowerCase().split(" ")[0])
        );

        const finalName = stockMatch?.name ?? medName;
        const dose = match[2] ?? "";
        let freq = "1 - 0 - 1 - 0"; // default BD
        const freqText = (match[3] ?? "").toLowerCase();
        if (freqText.includes("once") || freqText === "od") freq = "1 - 0 - 0 - 0";
        else if (freqText.includes("twice") || freqText === "bd") freq = "1 - 0 - 1 - 0";
        else if (freqText.includes("thrice") || freqText === "tds") freq = "1 - 1 - 1 - 0";
        else if (freqText === "hs") freq = "0 - 0 - 0 - 1";

        const durMatch = (match[4] ?? "30 days").match(/(\d+)/);
        const duration = durMatch ? durMatch[1] : "30";
        const durUnit = text.includes("month") ? "Months" : text.includes("week") ? "Weeks" : "Days";

        let instruction = "N/A";
        if (text.includes("before food")) instruction = "Before Food";
        else if (text.includes("after food")) instruction = "After Food";
        else if (text.includes("with food")) instruction = "With Food";
        else if (text.includes("empty stomach")) instruction = "Before Food";

        setPrescription((prev) => [...prev, {
          sNo: prev.length + 1,
          type: "",
          name: finalName,
          genericName: "",
          dosage: dose,
          frequency: freq,
          duration: `× ${duration} ${durUnit}`,
          instruction,
          notes: "🎤 Voice added",
          laterality: "N/A",
        }]);

        toast.success(`Voice Rx: ${finalName} added`, {
          description: `${dose} | ${freq} | ${duration} ${durUnit} | ${instruction}`,
        });
        parsed = true;
        break;
      }
    }

    if (!parsed) {
      toast.error("Could not parse voice input. Try: '[medicine] [dose] [frequency] for [duration] [before/after food]'");
    }

    setVoiceProcessing(false);
    setVoiceTranscript("");
  }, []);

  // Start/Stop Voice Recognition
  const toggleVoice = useCallback(() => {
    if (isVoiceActive) {
      // Stop
      recognitionRef.current?.stop();
      setIsVoiceActive(false);
      if (voiceTranscript.trim()) {
        parseVoiceToPrescription(voiceTranscript);
      }
      return;
    }

    // Start - check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser. Use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Indian English

    recognition.onstart = () => {
      setIsVoiceActive(true);
      setVoiceTranscript("");
      toast.info("🎤 Listening... Speak the medicine name, dose, and frequency");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }
      setVoiceTranscript(finalTranscript || interimTranscript);

      // Auto-parse when we get a final result with enough words
      if (finalTranscript && finalTranscript.split(" ").length >= 3) {
        recognition.stop();
        setIsVoiceActive(false);
        parseVoiceToPrescription(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Voice error:", event.error);
      setIsVoiceActive(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permission.");
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isVoiceActive, voiceTranscript, parseVoiceToPrescription]);

  const filteredStock = mockMedicineStock.filter((m) =>
    m.name.toLowerCase().includes(medSearch.toLowerCase())
  );

  const handleAddMedicine = () => {
    if (!newMedName) return toast.error("Select a medicine");
    const freq = `${newMedFreqMorn} - ${newMedFreqNoon} - ${newMedFreqEve} - ${newMedFreqNight}`;
    setPrescription([...prescription, {
      sNo: prescription.length + 1, type: newMedType, name: newMedName,
      genericName: "", dosage: newMedDosage, frequency: freq,
      duration: `× ${newMedDur} ${newMedDurUnit}`, instruction: newMedInstruction,
      notes: newMedNotes, laterality: newMedLaterality,
    }]);
    setNewMedName(""); setNewMedDosage(""); setNewMedDur("");
    toast.success(`${newMedName} added to prescription`);
  };

  const handleAiSuggest = () => {
    toast.info("AI analyzing patient history for prescription suggestions...");
    setTimeout(() => {
      setPrescription([...prescription,
        { sNo: prescription.length + 1, type: "Guggulu", name: "YOGARAJA GUGGULU", genericName: "", dosage: "2 tabs", frequency: "1 - 0 - 1 - 0", duration: "× 30 Days", instruction: "After Food", notes: "AI suggested for joint pain", laterality: "N/A" },
        { sNo: prescription.length + 2, type: "Kashayam", name: "RASNASAPTAKAM KASHAYAM", genericName: "", dosage: "15ml", frequency: "1 - 0 - 1 - 0", duration: "× 30 Days", instruction: "Before Food", notes: "AI suggested - anti-inflammatory", laterality: "N/A" },
      ]);
      toast.success("AI added 2 medicine suggestions based on diagnosis");
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Prescription</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* Rx Tabs: OP / IP / Discharge */}
      <Tabs value={rxTab} onValueChange={setRxTab}>
        <TabsList>
          <TabsTrigger value="op">OP</TabsTrigger>
          <TabsTrigger value="ip">IP</TabsTrigger>
          <TabsTrigger value="discharge">Discharge Summary</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Allergy Alert */}
      <div className="flex items-center justify-end text-sm text-red-600 font-medium">
        <AlertTriangle className="h-4 w-4 mr-1" /> Allergies: No known allergies
      </div>

      {/* Add Medicines Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              Add Medicines <Badge className="bg-green-600 text-white text-xs">Vital Charts</Badge>
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isVoiceActive ? "destructive" : "outline"}
                onClick={toggleVoice}
                className={isVoiceActive ? "" : "text-green-600 border-green-300"}
              >
                {isVoiceActive ? <MicOff className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                {isVoiceActive ? "Stop" : "Voice Rx"}
              </Button>
              <Button size="sm" variant="outline" className="text-violet-600 border-violet-300" onClick={handleAiSuggest}>
                <Brain className="h-3 w-3 mr-1" /> AI Suggest
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowPharmacyDialog(true)}>Open Past Pharmacy Bills</Button>
            <Button size="sm" className="bg-blue-600 text-xs" onClick={() => setShowPackageDialog(true)}><Package className="h-3 w-3 mr-1" /> Packages</Button>
            <Button size="sm" className="bg-teal-600 text-xs">Diagnosis Specific Medicines</Button>
            <Button size="sm" className="bg-amber-600 text-xs" onClick={() => setShowFavorites(!showFavorites)}>
              <Star className="h-3 w-3 mr-1" /> Show / Hide Favorites
            </Button>
            <Button size="sm" variant="outline" className="text-xs ml-auto" onClick={() => setShowPastRx(!showPastRx)}>Show / Hide Past Prescription</Button>
          </div>

          {/* Voice Transcript Panel */}
          {(isVoiceActive || voiceTranscript || voiceProcessing) && (
            <Card className={`border-2 ${isVoiceActive ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {isVoiceActive && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                      <Volume2 className="h-4 w-4 text-red-600 animate-pulse" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {isVoiceActive ? "🎤 Listening... Speak medicine name, dose, frequency, duration" : voiceProcessing ? "⏳ Processing..." : "✓ Voice captured"}
                    </p>
                    {voiceTranscript && (
                      <p className="text-sm font-medium text-gray-800 bg-white rounded px-2 py-1 border">
                        "{voiceTranscript}"
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Example: "Yogaraja Guggulu 2 tablets twice a day for 30 days after food"
                    </p>
                  </div>
                  {voiceTranscript && !isVoiceActive && (
                    <Button size="sm" className="bg-green-600 h-7 text-xs" onClick={() => parseVoiceToPrescription(voiceTranscript)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Favorites & Past Rx Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showFavorites && (
              <div className="border rounded p-3">
                <h4 className="text-xs font-semibold mb-2">Favorites</h4>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Search By Name</span>
                  <Input className="h-6 text-xs w-32" />
                </div>
                <table className="w-full text-xs"><thead><tr><th className="text-left text-orange-600">S.No</th><th className="text-left text-orange-600">Name</th><th className="text-left text-orange-600">Medicines</th><th className="text-left text-orange-600">Generic Name</th></tr></thead><tbody><tr><td colSpan={4} className="text-muted-foreground py-2">No favorites saved</td></tr></tbody></table>
              </div>
            )}
            {showPastRx && (
              <div className="border rounded p-3">
                <h4 className="text-xs font-semibold mb-2">Past Prescriptions</h4>
                <table className="w-full text-xs"><thead><tr><th className="text-left text-orange-600">S.No</th><th className="text-left text-orange-600">Name</th><th className="text-left text-orange-600">Medicines</th><th className="text-left text-orange-600">Generic Name</th><th></th></tr></thead>
                  <tbody>
                    {mockPastPrescriptions.map((p) => (
                      <tr key={p.sNo} className="border-t"><td className="py-1">{p.sNo}</td><td className="py-1">{p.name}</td><td className="py-1 whitespace-pre-line max-w-[200px] truncate">{p.medicines}</td><td></td><td><Button size="sm" className="h-5 text-xs bg-green-600">Add</Button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-xs text-blue-600">
              <input type="checkbox" checked={showStockOnly} onChange={(e) => setShowStockOnly(e.target.checked)} />
              Show medicines only from stock
            </label>
            <div className="flex items-center gap-2 text-sm">
              <strong>Store:</strong>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="w-[160px] h-7"><SelectValue placeholder="Select a Store" /></SelectTrigger>
                <SelectContent><SelectItem value="main">Main Store</SelectItem><SelectItem value="branch">Branch Store</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          {/* Medicine Input Row */}
          <div className="border rounded p-3 space-y-3">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
              <span>Morn</span><span>Noon</span><span>Eve</span><span>Night</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input value={newMedFreqMorn} onChange={(e) => setNewMedFreqMorn(e.target.value)} className="h-7 text-center" />
              <Input value={newMedFreqNoon} onChange={(e) => setNewMedFreqNoon(e.target.value)} className="h-7 text-center" />
              <Input value={newMedFreqEve} onChange={(e) => setNewMedFreqEve(e.target.value)} className="h-7 text-center" />
              <Input value={newMedFreqNight} onChange={(e) => setNewMedFreqNight(e.target.value)} className="h-7 text-center" />
            </div>
            <div className="text-center text-xs text-muted-foreground">(or)</div>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="relative">
                <Input value={newMedName} onChange={(e) => { setNewMedName(e.target.value); setMedSearch(e.target.value); }} placeholder="Name" className="h-8 w-40" />
                {medSearch && filteredStock.length > 0 && (
                  <div className="absolute top-9 left-0 z-50 bg-white border rounded shadow-lg w-72 max-h-48 overflow-y-auto">
                    {filteredStock.map((m) => (
                      <div key={m.pcode} className="px-3 py-2 hover:bg-orange-50 cursor-pointer border-b flex justify-between" onClick={() => { setNewMedName(m.name); setMedSearch(""); }}>
                        <div><p className="text-xs font-medium">{m.name}</p><p className="text-xs text-orange-600">{m.brand}</p></div>
                        <div className="text-right"><p className="text-xs text-green-600">Stock: {m.stock}</p><p className="text-xs text-muted-foreground">pcode:{m.pcode}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select value={newMedType} onValueChange={setNewMedType}>
                <SelectTrigger className="w-24 h-8"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>{medicineTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} placeholder="Dosage" className="h-8 w-20" />
              <Select defaultValue="">
                <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Frequency" /></SelectTrigger>
                <SelectContent><SelectItem value="od">OD</SelectItem><SelectItem value="bd">BD</SelectItem><SelectItem value="tds">TDS</SelectItem></SelectContent>
              </Select>
              <Input value={newMedDur} onChange={(e) => setNewMedDur(e.target.value)} placeholder="Dur" className="h-8 w-14" />
              <Select value={newMedDurUnit} onValueChange={setNewMedDurUnit}>
                <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Days">Days</SelectItem><SelectItem value="Weeks">Weeks</SelectItem><SelectItem value="Months">Months</SelectItem></SelectContent>
              </Select>
              <Input value={newMedNotes} onChange={(e) => setNewMedNotes(e.target.value)} placeholder="Instruction" className="h-8 w-24" />
              <Input placeholder="Additional notes" className="h-8 w-28" />
              <Button size="sm" onClick={handleAddMedicine} className="bg-blue-600 h-8"><Plus className="h-3 w-3 mr-1" /> Add</Button>
            </div>
            <div className="flex gap-4 text-xs">
              <span>◯ Before Food ◯ After Food</span><span>◯ With Food ◉ N/A</span>
            </div>
            <div className="text-xs">
              <strong>Laterality ⓘ</strong> <span>◯ Left ◯ Right ◯ Both ◉ N/A</span>
            </div>
          </div>

          {/* Prescription Table */}
          <Separator />
          <h3 className="font-semibold text-sm">Prescription</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-2 py-2 text-left text-orange-600">S.No</th>
                  <th className="px-2 py-2 text-left text-orange-600">Type</th>
                  <th className="px-2 py-2 text-left text-orange-600">Name</th>
                  <th className="px-2 py-2 text-left text-orange-600">Generic Name</th>
                  <th className="px-2 py-2 text-left text-orange-600">Dosage</th>
                  <th className="px-2 py-2 text-left text-orange-600">Frequency</th>
                  <th className="px-2 py-2 text-left text-orange-600">Duration</th>
                  <th className="px-2 py-2 text-left text-orange-600">Instruction</th>
                  <th className="px-2 py-2 text-left text-orange-600">Notes</th>
                  <th className="px-2 py-2 text-center text-orange-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {prescription.map((rx) => (
                  <tr key={rx.sNo} className="border-t hover:bg-muted/30">
                    <td className="px-2 py-2">{rx.sNo} ✏️ ✏️</td>
                    <td className="px-2 py-2">{rx.type}</td>
                    <td className="px-2 py-2 font-medium">{rx.name} {rx.notes?.includes("AI") && <Badge className="bg-violet-100 text-violet-700 text-[9px] ml-1">AI</Badge>}</td>
                    <td className="px-2 py-2">{rx.genericName}</td>
                    <td className="px-2 py-2">{rx.dosage} ✏️</td>
                    <td className="px-2 py-2">{rx.frequency}</td>
                    <td className="px-2 py-2">{rx.duration} ✏️</td>
                    <td className="px-2 py-2">{rx.instruction} ✏️</td>
                    <td className="px-2 py-2">{rx.notes} ✏️</td>
                    <td className="px-2 py-2 text-center">
                      <button className="text-red-600 font-bold" onClick={() => setPrescription(prescription.filter((p) => p.sNo !== rx.sNo))}>✕</button>
                    </td>
                  </tr>
                ))}
                {prescription.length > 0 && (
                  <tr className="border-t"><td colSpan={10} className="px-2 py-1 text-xs">Laterality: N/A ✏️</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline"><Star className="h-3 w-3 mr-1" /> Save as Favorite</Button>
            <Button size="sm" className="bg-red-500 hover:bg-red-600"><Printer className="h-3 w-3 mr-1" /> Print</Button>
            <Button size="sm" variant="outline">Whatsapp</Button>
            <Button size="sm" variant="outline">Email</Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => toast.success("Rx sent to Pharmacy counter — patient can collect now")}>Send to Pharmacy</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => toast.success("'Buy from Ayuzee' link sent to patient WhatsApp — pre-filled cart with prescribed medicines")}>Buy from Ayuzee (Online)</Button>
          </div>
          {/* Platform Connection Note */}
          <p className="text-xs text-muted-foreground mt-1">💡 "Buy from Ayuzee" sends patient a link to ayuzee.com/shop with these medicines pre-added to cart. Billed by Agency (separate entity). For refill/courier patients.</p>
        </CardContent>
      </Card>

      {/* Package Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Package list</DialogTitle></DialogHeader>
          {mockPackages.map((pkg) => (
            <div key={pkg.name} className="border rounded p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{pkg.name}</h4>
                <Button size="sm" className="bg-green-600 text-xs">Add All</Button>
              </div>
              <table className="w-full text-xs">
                <thead><tr><th className="text-left font-medium">Name/Unit</th><th className="text-center">Intake</th><th className="text-left">Medicine</th><th className="text-center">Duration</th><th></th></tr></thead>
                <tbody>
                  {pkg.medicines.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{m.name}</td>
                      <td className="py-1 text-center">{m.intake}</td>
                      <td className="py-1">◯ Before Food ◯ After Food ◉ N/A</td>
                      <td className="py-1 text-center">{m.duration}</td>
                      <td className="py-1"><Button size="sm" className="h-5 text-xs bg-green-600">Add</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* Pharmacy Bills Dialog */}
      <Dialog open={showPharmacyDialog} onOpenChange={setShowPharmacyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Pharmacy based Medicine lists</DialogTitle></DialogHeader>
          <table className="w-full text-xs">
            <thead><tr><th className="text-left font-semibold">Bill Date</th><th className="text-left font-semibold">Consultant</th><th className="text-left font-semibold">Medicine</th></tr></thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">21/07/2026 15:03</td>
                <td className="py-2">Dr. Mohamad Saleem MD (AYURVEDA)</td>
                <td className="py-2">
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>KATI 450 ML</span><span>1</span><span>◯ Before Food ◯ After Food ◉ N/A</span><span>1 Day</span><Button size="sm" className="h-5 text-xs bg-green-600">Add</Button></div>
                    <div className="flex justify-between"><span>DR RELAXI CAP</span><span>30</span><span>◯ Before Food ◯ After Food ◉ N/A</span><span>30 Days</span><Button size="sm" className="h-5 text-xs bg-green-600">Add</Button></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientPrescription;
