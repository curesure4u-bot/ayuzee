import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Eye, Upload, Brain, Search, FileText, Download,
  Share2, MessageSquare, Camera, Mic, User, Calendar,
  CheckCircle2, Activity, Droplets, Wind, Flame, Heart,
  Plus, Clock, Scissors, Scan,
} from "lucide-react";

type ParikshaType = "Mutra" | "Netra" | "Jihva" | "Trichoscopy" | "Mala" | "Shabda" | "Sparsha" | "Akriti";

interface ParikshaAssessment {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  type: ParikshaType;
  date: string;
  images: { id: string; fileName: string; thumbnail?: string }[];
  audioFile?: string;
  manualFindings: string;
  aiInterpretation: string;
  doshaCorrelation: { vata: number; pitta: number; kapha: number };
  severity: "Normal" | "Mild" | "Moderate" | "Severe";
  linkedNadiVisit?: string;
  linkedLabOrder?: string;
  recommendations: string[];
  status: "Completed" | "Pending AI" | "Draft";
}

interface ParikshaConfig {
  type: ParikshaType;
  name: string;
  sanskrit: string;
  icon: string;
  description: string;
  inputMethod: "Image" | "Audio" | "Image + Manual" | "Manual";
  aiCapability: string;
}

const parikshaMethods: ParikshaConfig[] = [
  { type: "Mutra", name: "Mutra Bindu Pariksha", sanskrit: "मूत्र परीक्षा", icon: "💧", description: "Urine examination - Oil drop test on urine to assess dosha imbalance from spreading pattern", inputMethod: "Image + Manual", aiCapability: "AI analyzes oil spread pattern (Taila Bindu) to determine Vata/Pitta/Kapha dominance and toxin levels" },
  { type: "Netra", name: "Netra Pariksha", sanskrit: "नेत्र परीक्षा", icon: "👁️", description: "Eye examination - Sclera, iris, conjunctiva color and moisture assessment", inputMethod: "Image", aiCapability: "AI detects redness, yellowness, dryness, vascularity patterns → correlates to organ health and dosha state" },
  { type: "Jihva", name: "Jihva Pariksha", sanskrit: "जिह्वा परीक्षा", icon: "👅", description: "Tongue examination - Coating, color, shape, cracks, tooth marks, moisture", inputMethod: "Image", aiCapability: "AI maps tongue zones to organs, detects Ama coating, identifies dosha patterns from color/texture" },
  { type: "Trichoscopy", name: "Trichoscopy (Hair Scope)", sanskrit: "केश परीक्षा", icon: "💇", description: "Hair & scalp examination using digital dermoscope/trichoscope device", inputMethod: "Image", aiCapability: "AI analyzes hair density, follicle miniaturization, scalp health, dandruff, and correlates with Bhrajaka Pitta/Asthi Dhatu" },
  { type: "Mala", name: "Mala Pariksha", sanskrit: "मल परीक्षा", icon: "🔬", description: "Stool examination - Color, consistency, presence of Ama, floating/sinking", inputMethod: "Manual", aiCapability: "AI correlates stool characteristics with Agni status, Ama levels, and specific dosha imbalance patterns" },
  { type: "Shabda", name: "Shabda Pariksha", sanskrit: "शब्द परीक्षा", icon: "🎙️", description: "Voice/sound examination - Tone, pitch, strength, tremor, nasality", inputMethod: "Audio", aiCapability: "AI voice analysis determines Vata (low/cracking), Pitta (sharp/commanding), Kapha (deep/melodious) patterns" },
  { type: "Sparsha", name: "Sparsha Pariksha", sanskrit: "स्पर्श परीक्षा", icon: "🖐️", description: "Touch/skin examination - Temperature, texture, moisture, elasticity", inputMethod: "Image + Manual", aiCapability: "AI skin analysis for dryness (Vata), warmth/redness (Pitta), oiliness/coolness (Kapha)" },
  { type: "Akriti", name: "Akriti Pariksha", sanskrit: "आकृति परीक्षा", icon: "🧍", description: "Body form/build examination - Posture, proportions, facial features, overall constitution", inputMethod: "Image", aiCapability: "AI body habitus analysis → thin/irregular (Vata), medium/muscular (Pitta), large/solid (Kapha) Prakriti indication" },
];

const mockAssessments: ParikshaAssessment[] = [
  { id: "pa1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", age: 52, gender: "Male", type: "Jihva", date: "2026-07-24", images: [{ id: "img1", fileName: "tongue_front_AL12543.jpg" }, { id: "img2", fileName: "tongue_side_AL12543.jpg" }], manualFindings: "Thick yellowish coating, red tip, central crack, slight tremor on protrusion", aiInterpretation: "Thick yellow coating indicates significant Pitta aggravation with Ama (toxins) in the GI tract. Red tip suggests heart/emotional heat. Central crack indicates chronic Vata in the spine/nervous system. Overall pattern: Pitta-Vata imbalance with medium Ama accumulation. Correlates with renal stress seen in lab reports.", doshaCorrelation: { vata: 35, pitta: 50, kapha: 15 }, severity: "Moderate", linkedNadiVisit: "nv1", linkedLabOrder: "ORD-2026-0047", recommendations: ["Pitta-pacifying diet — avoid spicy, sour, fermented foods", "Tongue scraping with copper scraper morning", "Triphala before bed for Ama digestion", "Cool water gargling (Kavala) with Triphala decoction"], status: "Completed" },
  { id: "pa2", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", age: 52, gender: "Male", type: "Netra", date: "2026-07-24", images: [{ id: "img3", fileName: "eye_right_AL12543.jpg" }, { id: "img4", fileName: "eye_left_AL12543.jpg" }], manualFindings: "Mild yellowish discoloration of sclera, slight redness in conjunctiva, visible blood vessels", aiInterpretation: "Yellowish sclera suggests Pitta accumulation affecting Ranjaka Pitta (liver metabolism). Increased conjunctival vascularity indicates systemic inflammation. Pattern is consistent with hepato-renal stress observed in lab findings (elevated creatinine, potassium). The eye signs confirm Pitta vitiation affecting Alochaka Pitta.", doshaCorrelation: { vata: 20, pitta: 60, kapha: 20 }, severity: "Moderate", linkedLabOrder: "ORD-2026-0047", recommendations: ["Rose water eye wash daily", "Netra Tarpana therapy recommended", "Triphala Ghrita for eye nourishment", "Avoid screen time after 9 PM"], status: "Completed" },
  { id: "pa3", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", age: 52, gender: "Male", type: "Mutra", date: "2026-07-24", images: [{ id: "img5", fileName: "mutra_bindu_AL12543.jpg" }], manualFindings: "Oil drop spreads quickly with irregular edges, yellowish urine, slightly frothy, strong odor", aiInterpretation: "Rapid oil spread with irregular edges (Taila Bindu) indicates Pitta dominance. Yellowish color and strong odor confirm Pitta Mutra. Frothy appearance suggests protein loss consistent with renal involvement seen in lab (Creatinine 3.8). The Mutra findings align with Mutravaha Srotas dysfunction.", doshaCorrelation: { vata: 25, pitta: 55, kapha: 20 }, severity: "Moderate", linkedLabOrder: "ORD-2026-0047", recommendations: ["Increase water intake with cooling herbs (coriander, fennel)", "Gokshuradi Guggulu for Mutra Vaha Srotas", "Avoid salty and protein-heavy meals at night", "Chandraprabha Vati as per physician advice"], status: "Completed" },
  { id: "pa4", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", age: 45, gender: "Female", type: "Trichoscopy", date: "2026-07-20", images: [{ id: "img6", fileName: "scalp_vertex_AL14201.jpg" }, { id: "img7", fileName: "scalp_temporal_AL14201.jpg" }, { id: "img8", fileName: "hair_density_AL14201.jpg" }], manualFindings: "Diffuse thinning, visible scalp, dry brittle hair, white flaky scalp, reduced density at vertex", aiInterpretation: "Significant diffuse hair thinning pattern consistent with iron deficiency anemia (Hb 5.2 g/dL in labs). Dry, brittle texture indicates Vata aggravation affecting Asthi Dhatu (bone/hair tissue). White flaky scalp suggests Vata-Kapha combination. Hair density reduced ~40% from normal. Root cause: severe Raktakshaya (blood tissue depletion) → Asthi Dhatu malnutrition → hair loss.", doshaCorrelation: { vata: 55, pitta: 15, kapha: 30 }, severity: "Severe", linkedLabOrder: "ORD-2026-0048", recommendations: ["Iron supplementation (Loha Bhasma + modern iron)", "Bhringaraj oil scalp massage twice weekly", "Nasya with Anu Taila for hair nourishment", "Protein-rich diet with soaked almonds, dates", "Shirodhara for stress-related hair fall component"], status: "Completed" },
  { id: "pa5", patientId: "AL-15320", patientName: "Mr. Suresh Babu", age: 38, gender: "Male", type: "Sparsha", date: "2026-07-18", images: [{ id: "img9", fileName: "skin_abdomen_AL15320.jpg" }], manualFindings: "Cool, slightly oily skin, thick texture, slow capillary refill, mild pitting edema on ankles", aiInterpretation: "Cool, oily skin with thick texture is classic Kapha Sparsha. Slow capillary refill and mild edema indicate sluggish circulation with Kapha-Meda (fat tissue) accumulation. Consistent with dyslipidemia (TC 245, TG 280) seen in labs. Skin findings confirm Kapha-Meda Dhatu excess with Mandagni (low digestive fire).", doshaCorrelation: { vata: 10, pitta: 20, kapha: 70 }, severity: "Moderate", linkedLabOrder: "ORD-2026-0049", recommendations: ["Dry powder massage (Udvartana) with Triphala", "Warm sesame oil Abhyanga before bath", "Reduce cold, heavy, sweet foods", "Increase bitter and pungent tastes", "Daily brisk walking 30-45 minutes"], status: "Completed" },
  { id: "pa6", patientId: "AL-15320", patientName: "Mr. Suresh Babu", age: 38, gender: "Male", type: "Shabda", date: "2026-07-18", images: [], audioFile: "voice_AL15320_18Jul2026.wav", manualFindings: "Deep, heavy, slow-paced voice, monotone with slight nasal quality, low energy projection", aiInterpretation: "Deep and heavy voice with slow pace is characteristic of Kapha Shabda. Nasal quality suggests upper respiratory Kapha accumulation. Low energy projection indicates Mandagni and possible Rasa Dhatu deficiency despite Kapha dominance. Voice pattern aligns with the metabolic sluggishness seen in lipid profile.", doshaCorrelation: { vata: 15, pitta: 15, kapha: 70 }, severity: "Mild", linkedLabOrder: "ORD-2026-0049", recommendations: ["Singing/chanting (Omkara) to energize Udana Vayu", "Ginger-honey-turmeric morning drink", "Pranayama: Kapalabhati and Bhastrika", "Reduce dairy and cold beverages"], status: "Completed" },
];

const AyushDiagnosticsHub = () => {
  const [assessments] = useState<ParikshaAssessment[]>(mockAssessments);
  const [activeTab, setActiveTab] = useState("hub");
  const [selectedType, setSelectedType] = useState<ParikshaType | "ALL">("ALL");
  const [selectedAssessment, setSelectedAssessment] = useState<ParikshaAssessment | null>(null);
  const [search, setSearch] = useState("");

  const filtered = assessments.filter(a => {
    const matchType = selectedType === "ALL" || a.type === selectedType;
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || a.patientId.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const getSeverityColor = (s: string) => {
    switch (s) { case "Normal": return "bg-green-100 text-green-700"; case "Mild": return "bg-blue-100 text-blue-700"; case "Moderate": return "bg-amber-100 text-amber-700"; case "Severe": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getDoshaBar = (vata: number, pitta: number, kapha: number) => (
    <div className="flex h-3 rounded-full overflow-hidden w-full">
      <div className="bg-blue-400" style={{ width: `${vata}%` }} title={`Vata ${vata}%`} />
      <div className="bg-red-400" style={{ width: `${pitta}%` }} title={`Pitta ${pitta}%`} />
      <div className="bg-green-400" style={{ width: `${kapha}%` }} title={`Kapha ${kapha}%`} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Scan className="h-5 w-5" /> AYUSH Diagnostics Hub — Ashtavidha Pariksha
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Assessment</Button>
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {parikshaMethods.map((method) => {
          const count = assessments.filter(a => a.type === method.type).length;
          return (
            <Card key={method.type} className={`cursor-pointer transition text-center hover:border-purple-300 ${selectedType === method.type ? "border-purple-500 bg-purple-50" : ""}`} onClick={() => setSelectedType(selectedType === method.type ? "ALL" : method.type)}>
              <CardContent className="p-2">
                <span className="text-xl">{method.icon}</span>
                <p className="text-[10px] font-medium mt-0.5">{method.type}</p>
                <p className="text-[9px] text-muted-foreground">{count} done</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Scan className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{assessments.length}</p><p className="text-[10px] text-muted-foreground">Total Assessments</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><Brain className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{assessments.filter(a => a.status === "Completed").length}</p><p className="text-[10px] text-muted-foreground">AI Interpreted</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Camera className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{assessments.reduce((s, a) => s + a.images.length, 0)}</p><p className="text-[10px] text-muted-foreground">Images Captured</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><User className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{new Set(assessments.map(a => a.patientId)).size}</p><p className="text-[10px] text-muted-foreground">Patients Assessed</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hub">Assessments</TabsTrigger>
          <TabsTrigger value="new">New Assessment</TabsTrigger>
          <TabsTrigger value="combined">Combined AYUSH Report</TabsTrigger>
        </TabsList>

        {/* Assessments Tab */}
        <TabsContent value="hub" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="Search patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {selectedType !== "ALL" && <Badge variant="outline" className="text-xs">{selectedType} <button className="ml-1" onClick={() => setSelectedType("ALL")}>×</button></Badge>}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filtered.map((assess) => (
                <Card key={assess.id} className={`cursor-pointer transition hover:border-purple-300 ${selectedAssessment?.id === assess.id ? "border-purple-500 bg-purple-50" : ""}`} onClick={() => setSelectedAssessment(assess)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{parikshaMethods.find(m => m.type === assess.type)?.icon}</span>
                        <div>
                          <p className="text-xs font-medium">{assess.patientName}</p>
                          <p className="text-[10px] text-muted-foreground">{assess.type} Pariksha | {assess.date}</p>
                        </div>
                      </div>
                      <Badge className={`text-[9px] ${getSeverityColor(assess.severity)}`}>{assess.severity}</Badge>
                    </div>
                    <div className="mt-2">
                      {getDoshaBar(assess.doshaCorrelation.vata, assess.doshaCorrelation.pitta, assess.doshaCorrelation.kapha)}
                      <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                        <span className="text-blue-600">V:{assess.doshaCorrelation.vata}%</span>
                        <span className="text-red-600">P:{assess.doshaCorrelation.pitta}%</span>
                        <span className="text-green-600">K:{assess.doshaCorrelation.kapha}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2 space-y-3">
              {!selectedAssessment ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground"><Scan className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Select an assessment to view AI interpretation</p></CardContent></Card>
              ) : (
                <>
                  {/* Header */}
                  <Card className="border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{parikshaMethods.find(m => m.type === selectedAssessment.type)?.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{parikshaMethods.find(m => m.type === selectedAssessment.type)?.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedAssessment.patientName} ({selectedAssessment.patientId}) | {selectedAssessment.age}y/{selectedAssessment.gender} | {selectedAssessment.date}</p>
                          </div>
                        </div>
                        <Badge className={`${getSeverityColor(selectedAssessment.severity)}`}>{selectedAssessment.severity}</Badge>
                      </div>
                      {/* Dosha Bar */}
                      <div className="mt-2">
                        {getDoshaBar(selectedAssessment.doshaCorrelation.vata, selectedAssessment.doshaCorrelation.pitta, selectedAssessment.doshaCorrelation.kapha)}
                        <div className="flex justify-between text-[10px] mt-1">
                          <span className="text-blue-600 font-medium">Vata: {selectedAssessment.doshaCorrelation.vata}%</span>
                          <span className="text-red-600 font-medium">Pitta: {selectedAssessment.doshaCorrelation.pitta}%</span>
                          <span className="text-green-600 font-medium">Kapha: {selectedAssessment.doshaCorrelation.kapha}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Images */}
                  {(selectedAssessment.images.length > 0 || selectedAssessment.audioFile) && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Camera className="h-4 w-4 text-blue-600" /> Captured {selectedAssessment.audioFile ? "Audio" : "Images"} ({selectedAssessment.images.length})</CardTitle></CardHeader>
                      <CardContent>
                        {selectedAssessment.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {selectedAssessment.images.map((img) => (
                              <div key={img.id} className="border rounded p-2 bg-gray-50 text-center">
                                <div className="h-20 bg-gray-200 rounded flex items-center justify-center mb-1"><Camera className="h-6 w-6 text-gray-400" /></div>
                                <p className="text-[9px] text-muted-foreground truncate">{img.fileName}</p>
                                <Button size="sm" variant="outline" className="h-5 text-[9px] mt-1"><Eye className="h-3 w-3 mr-0.5" /> View</Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedAssessment.audioFile && (
                          <div className="border rounded p-3 bg-gray-50 flex items-center gap-3">
                            <Mic className="h-5 w-5 text-purple-600" />
                            <div><p className="text-xs font-medium">Voice Recording</p><p className="text-[10px] text-muted-foreground">{selectedAssessment.audioFile}</p></div>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] ml-auto">▶ Play</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Manual Findings */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Clinical Findings</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-xs">{selectedAssessment.manualFindings}</p>
                    </CardContent>
                  </Card>

                  {/* AI Interpretation */}
                  <Card className="border-purple-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI Interpretation</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs">{selectedAssessment.aiInterpretation}</p>
                      {selectedAssessment.linkedLabOrder && (
                        <div className="flex items-center gap-2 text-[10px] pt-2 border-t">
                          <span className="text-muted-foreground">Lab Correlation:</span>
                          <Badge variant="outline" className="text-[9px] text-blue-600">{selectedAssessment.linkedLabOrder}</Badge>
                        </div>
                      )}
                      {selectedAssessment.linkedNadiVisit && (
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-muted-foreground">Nadi Link:</span>
                          <Badge variant="outline" className="text-[9px] text-purple-600">{selectedAssessment.linkedNadiVisit}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> AYUSH Recommendations</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {selectedAssessment.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs flex items-start gap-1"><CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" /><span>{rec}</span></li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Report shared")}><Share2 className="mr-1 h-3 w-3" /> Share</Button>
                    <Button size="sm" variant="outline" className="text-xs"><Download className="mr-1 h-3 w-3" /> PDF</Button>
                    <Button size="sm" variant="outline" className="text-xs text-green-600"><MessageSquare className="mr-1 h-3 w-3" /> WhatsApp</Button>
                    <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700" onClick={() => toast.info("AI re-analyzing...")}><Brain className="mr-1 h-3 w-3" /> Re-Interpret</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* New Assessment Tab */}
        <TabsContent value="new" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">New AYUSH Diagnostic Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2"><label className="text-xs font-medium">Patient</label><Input className="h-8 text-xs" placeholder="Search patient..." /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Pariksha Type</label>
                  <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>
                    {parikshaMethods.map(m => <SelectItem key={m.type} value={m.type}>{m.icon} {m.name}</SelectItem>)}
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><label className="text-xs font-medium">Date</label><Input className="h-8 text-xs" type="date" defaultValue="2026-07-24" /></div>
              </div>

              {/* Image/Audio Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Upload Images / Audio</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-muted-foreground">Drag & drop images here, or click to capture/upload</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Supports: JPG, PNG, HEIC (images) | WAV, MP3 (audio for Shabda Pariksha)</p>
                  <div className="flex gap-2 justify-center mt-3">
                    <Button size="sm" variant="outline" className="text-xs"><Camera className="mr-1 h-3 w-3" /> Capture Photo</Button>
                    <Button size="sm" variant="outline" className="text-xs"><Upload className="mr-1 h-3 w-3" /> Upload File</Button>
                    <Button size="sm" variant="outline" className="text-xs"><Mic className="mr-1 h-3 w-3" /> Record Audio</Button>
                  </div>
                </div>
              </div>

              {/* Manual Findings */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Clinical Findings (Manual Observation)</label>
                <Textarea className="text-xs min-h-[80px]" placeholder="Describe what you observe... (e.g., for Jihva: thick white coating, scalloped edges, red tip, central crack)" />
              </div>

              {/* Dosha Assessment */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Dosha Correlation (Optional — AI will auto-calculate)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><label className="text-[10px] text-blue-600">Vata %</label><Input className="h-7 text-xs" type="number" placeholder="0-100" /></div>
                  <div className="space-y-1"><label className="text-[10px] text-red-600">Pitta %</label><Input className="h-7 text-xs" type="number" placeholder="0-100" /></div>
                  <div className="space-y-1"><label className="text-[10px] text-green-600">Kapha %</label><Input className="h-7 text-xs" type="number" placeholder="0-100" /></div>
                </div>
              </div>

              {/* Linking */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2"><label className="text-xs font-medium">Link Nadi Visit (Optional)</label><Input className="h-8 text-xs" placeholder="Select Nadi visit..." /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Link Lab Order (Optional)</label><Input className="h-8 text-xs" placeholder="e.g. ORD-2026-0047" /></div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => toast.success("Assessment saved! AI interpretation generating...")}><Brain className="mr-1 h-4 w-4" /> Save & AI Interpret</Button>
                <Button variant="outline" onClick={() => toast.info("Saved as draft")}><FileText className="mr-1 h-4 w-4" /> Save Draft</Button>
              </div>
            </CardContent>
          </Card>

          {/* Method Reference */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pariksha Methods Reference</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {parikshaMethods.map((method) => (
                  <div key={method.type} className="border rounded p-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{method.icon}</span>
                      <div><p className="font-medium">{method.name} <span className="text-muted-foreground">({method.sanskrit})</span></p></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{method.description}</p>
                    <p className="text-[10px] text-purple-600 mt-1"><Brain className="h-3 w-3 inline mr-0.5" />{method.aiCapability}</p>
                    <Badge variant="outline" className="text-[8px] mt-1">{method.inputMethod}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined AYUSH Report Tab */}
        <TabsContent value="combined" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" /> Combined Ashtavidha Pariksha Report</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Generate a comprehensive report combining all AYUSH diagnostic assessments (Nadi + Mutra + Netra + Jihva + Trichoscopy + Mala + Shabda + Sparsha + Akriti) for a patient into one unified AYUSH diagnostic report with AI summary.</p>
              <div className="flex gap-2">
                <Input className="h-8 text-xs max-w-[250px]" placeholder="Search patient for combined report..." />
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => toast.info("Generating combined report...")}><Brain className="mr-1 h-3 w-3" /> Generate Report</Button>
              </div>

              {/* Sample Combined Report for Mr. Rajesh Kumar */}
              <Card className="border-green-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-green-700">Combined AYUSH Diagnostic Report</h4>
                      <p className="text-xs text-muted-foreground">Mr. Rajesh Kumar (AL-12543) | 52y/Male | Date: 2026-07-24</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700"><Brain className="h-3 w-3 mr-1" /> AI Generated</Badge>
                  </div>

                  {/* Assessments Done */}
                  <div>
                    <p className="text-xs font-medium mb-2">Assessments Completed:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge className="bg-purple-50 text-purple-700 text-[10px]">✅ Nadi Pariksha</Badge>
                      <Badge className="bg-purple-50 text-purple-700 text-[10px]">✅ Jihva Pariksha</Badge>
                      <Badge className="bg-purple-50 text-purple-700 text-[10px]">✅ Netra Pariksha</Badge>
                      <Badge className="bg-purple-50 text-purple-700 text-[10px]">✅ Mutra Pariksha</Badge>
                      <Badge variant="outline" className="text-[10px] text-gray-400">⬜ Trichoscopy</Badge>
                      <Badge variant="outline" className="text-[10px] text-gray-400">⬜ Mala</Badge>
                      <Badge variant="outline" className="text-[10px] text-gray-400">⬜ Shabda</Badge>
                      <Badge variant="outline" className="text-[10px] text-gray-400">⬜ Sparsha</Badge>
                    </div>
                  </div>

                  {/* Consolidated Dosha Analysis */}
                  <div className="bg-gradient-to-r from-blue-50 via-red-50 to-green-50 border rounded p-3">
                    <p className="text-xs font-medium mb-2">Consolidated Dosha Analysis (Average across all Pariksha):</p>
                    <div className="flex h-5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: "27%" }}>V: 27%</div>
                      <div className="bg-red-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: "55%" }}>P: 55%</div>
                      <div className="bg-green-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: "18%" }}>K: 18%</div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Primary Vikruti: <strong className="text-red-600">Pitta Dominant</strong> — confirmed by Nadi, Jihva, Netra, and Mutra findings</p>
                  </div>

                  {/* AI Summary */}
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-xs font-medium text-purple-700 flex items-center gap-1 mb-2"><Brain className="h-3 w-3" /> AI Comprehensive Summary:</p>
                    <p className="text-xs">All four AYUSH diagnostic modalities consistently confirm <strong>Pitta Vikruti</strong> in this patient. The Nadi shows Pitta dominance with Manduka Gati and high Agni. Jihva examination reveals yellow coating (Pitta Ama) with red tip (heart heat). Netra shows yellowish sclera (Ranjaka Pitta dysfunction). Mutra Bindu test shows rapid oil spread confirming Pitta in elimination pathways.</p>
                    <p className="text-xs mt-2">Combined with modern lab findings (Creatinine 3.8, Potassium 7.2), this represents a clear case of <strong>Pitta aggravation affecting Mutravaha Srotas</strong> (urinary system) with secondary renal tissue damage. The AYUSH findings provide early warning signs that precede the lab abnormalities, validating the traditional diagnostic approach.</p>
                  </div>

                  {/* Integrated Treatment Plan */}
                  <div className="border rounded p-3">
                    <p className="text-xs font-medium mb-2">Integrated Treatment Recommendations:</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <p className="font-medium text-green-700">AYUSH Therapies:</p>
                        <ul className="space-y-0.5 text-[11px]">
                          <li>• Virechana (therapeutic purgation) for Pitta</li>
                          <li>• Basti with cooling herbs (Guduchi, Shatavari)</li>
                          <li>• Netra Tarpana for eye nourishment</li>
                          <li>• Punarnava + Gokshura for renal support</li>
                          <li>• Pitta-pacifying diet plan</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-blue-700">Modern Interventions:</p>
                        <ul className="space-y-0.5 text-[11px]">
                          <li>• Urgent nephrology consultation</li>
                          <li>• ECG for hyperkalemia monitoring</li>
                          <li>• Fluid management protocol</li>
                          <li>• Dietary potassium restriction</li>
                          <li>• Follow-up RFT in 1 week</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Combined AYUSH report PDF generated")}><FileText className="mr-1 h-3 w-3" /> Generate PDF</Button>
                    <Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> Download</Button>
                    <Button size="sm" variant="outline" className="text-green-600"><MessageSquare className="mr-1 h-3 w-3" /> WhatsApp</Button>
                    <Button size="sm" variant="outline"><Share2 className="mr-1 h-3 w-3" /> Patient Portal</Button>
                    <Button size="sm" variant="outline" className="text-blue-600" onClick={() => toast.info("Pushed to ABDM")}><Upload className="mr-1 h-3 w-3" /> Push to ABDM</Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AyushDiagnosticsHub;
