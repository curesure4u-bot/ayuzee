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
  Upload, FileText, Search, Eye, Download, Share2,
  MessageSquare, Mail, Brain, Activity, Heart, Clock,
  User, Calendar, Plus, Trash2, CheckCircle2, Flame,
  Droplets, Shield, Zap, Wind,
} from "lucide-react";

interface NadiVisit {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  visitDate: string;
  visitTime: string;
  // Key Parameters (manually entered)
  vikruti: "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" | "Pitta-Kapha" | "Vata-Kapha" | "";
  prakruti: string;
  pulseRate: number | null;
  rhythm: "Regular" | "Irregular" | "";
  agniLevel: "High" | "Medium" | "Low" | "";
  toxinLevel: "High" | "Medium" | "Low" | "";
  immunityLevel: "High" | "Medium" | "Low" | "";
  stressLevel: "High" | "Medium" | "Low" | "";
  innerHealthQuotient: number | null;
  gutHealthQuotient: number | null;
  mindHealthQuotient: number | null;
  // Uploaded Reports
  reports: NadiReport[];
  // Correlation
  linkedLabOrders: string[];
  aiCorrelation?: string;
  notes?: string;
}

interface NadiReport {
  id: string;
  type: "Aarogya Darshika" | "Full Report" | "NT Report" | "Swasthya Darshika";
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  status: "Uploaded" | "Processing" | "Ready";
}

const mockVisits: NadiVisit[] = [
  {
    id: "nv1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", age: 52, gender: "Male",
    visitDate: "2026-07-24", visitTime: "07:05 PM", vikruti: "Pitta", prakruti: "Pitta-Vata",
    pulseRate: 80, rhythm: "Regular", agniLevel: "High", toxinLevel: "Medium",
    immunityLevel: "Medium", stressLevel: "Medium", innerHealthQuotient: 40,
    gutHealthQuotient: 80, mindHealthQuotient: 40,
    reports: [
      { id: "r1", type: "Aarogya Darshika", fileName: "AL-12543_AarogyaDarshika_24Jul2026.pdf", uploadedAt: "2026-07-24 07:30 PM", fileSize: "2.4 MB", status: "Ready" },
      { id: "r2", type: "Full Report", fileName: "AL-12543_FullReport_24Jul2026.pdf", uploadedAt: "2026-07-24 07:30 PM", fileSize: "3.1 MB", status: "Ready" },
      { id: "r3", type: "NT Report", fileName: "AL-12543_NTReport_24Jul2026.pdf", uploadedAt: "2026-07-24 07:32 PM", fileSize: "1.8 MB", status: "Ready" },
      { id: "r4", type: "Swasthya Darshika", fileName: "AL-12543_SwasthyaDarshika_24Jul2026.pdf", uploadedAt: "2026-07-24 07:32 PM", fileSize: "4.2 MB", status: "Ready" },
    ],
    linkedLabOrders: ["ORD-2026-0047"],
    aiCorrelation: "Pitta Vikruti correlates with elevated liver enzymes and renal stress observed in RFT. The high Agni with medium toxin suggests metabolic overload. Recommend Virechana therapy alongside modern renal management.",
    notes: "Patient reports burning sensation and hyperacidity. Nadi confirms Pitta aggravation with Manduka gati dominant.",
  },
  {
    id: "nv2", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", age: 45, gender: "Female",
    visitDate: "2026-07-20", visitTime: "10:30 AM", vikruti: "Vata-Kapha", prakruti: "",
    pulseRate: 72, rhythm: "Regular", agniLevel: "Low", toxinLevel: "High",
    immunityLevel: "Low", stressLevel: "High", innerHealthQuotient: 30,
    gutHealthQuotient: 45, mindHealthQuotient: 35,
    reports: [
      { id: "r5", type: "Aarogya Darshika", fileName: "AL-14201_AarogyaDarshika_20Jul2026.pdf", uploadedAt: "2026-07-20 11:00 AM", fileSize: "2.3 MB", status: "Ready" },
      { id: "r6", type: "Full Report", fileName: "AL-14201_FullReport_20Jul2026.pdf", uploadedAt: "2026-07-20 11:00 AM", fileSize: "3.0 MB", status: "Ready" },
    ],
    linkedLabOrders: ["ORD-2026-0048"],
    aiCorrelation: "Vata-Kapha Vikruti with low Agni and high toxins correlates with severe anemia (Hb 5.2). Low immunity (Ojas) is consistent with chronic iron deficiency. Mandagni causing poor iron absorption. Suggest Deepana-Pachana followed by Loha Bhasma.",
    notes: "Chronic fatigue, cold extremities, heavy periods. Nadi shows weak pulse with Vata dominance.",
  },
  {
    id: "nv3", patientId: "AL-15320", patientName: "Mr. Suresh Babu", age: 38, gender: "Male",
    visitDate: "2026-07-18", visitTime: "09:00 AM", vikruti: "Kapha", prakruti: "Kapha-Pitta",
    pulseRate: 68, rhythm: "Regular", agniLevel: "Low", toxinLevel: "High",
    immunityLevel: "Medium", stressLevel: "Low", innerHealthQuotient: 55,
    gutHealthQuotient: 40, mindHealthQuotient: 65,
    reports: [
      { id: "r7", type: "Aarogya Darshika", fileName: "AL-15320_AarogyaDarshika_18Jul2026.pdf", uploadedAt: "2026-07-18 09:30 AM", fileSize: "2.5 MB", status: "Ready" },
      { id: "r8", type: "NT Report", fileName: "AL-15320_NTReport_18Jul2026.pdf", uploadedAt: "2026-07-18 09:30 AM", fileSize: "1.7 MB", status: "Ready" },
      { id: "r9", type: "Swasthya Darshika", fileName: "AL-15320_SwasthyaDarshika_18Jul2026.pdf", uploadedAt: "2026-07-18 09:32 AM", fileSize: "4.0 MB", status: "Ready" },
    ],
    linkedLabOrders: ["ORD-2026-0049"],
    aiCorrelation: "Kapha Vikruti with low Agni and high toxins aligns perfectly with dyslipidemia (TC 245, TG 280). Medadhatvagni impairment causing lipid accumulation. Recommend Lekhaniya therapy + Guggulu-based formulations alongside statins.",
  },
];

const NadiPariksha = () => {
  const [visits] = useState<NadiVisit[]>(mockVisits);
  const [activeTab, setActiveTab] = useState("visits");
  const [selectedVisit, setSelectedVisit] = useState<NadiVisit | null>(mockVisits[0]);
  const [search, setSearch] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  const filteredVisits = visits.filter(v =>
    v.patientName.toLowerCase().includes(search.toLowerCase()) ||
    v.patientId.toLowerCase().includes(search.toLowerCase())
  );

  const getVikrutiColor = (v: string) => {
    if (v.includes("Vata")) return "bg-blue-100 text-blue-700 border-blue-300";
    if (v.includes("Pitta")) return "bg-red-100 text-red-700 border-red-300";
    if (v.includes("Kapha")) return "bg-green-100 text-green-700 border-green-300";
    return "bg-gray-100 text-gray-700";
  };

  const getLevelColor = (level: string) => {
    switch (level) { case "High": return "text-red-600"; case "Medium": return "text-amber-600"; case "Low": return "text-green-600"; default: return "text-gray-500"; }
  };

  const getQuotientColor = (val: number | null) => {
    if (!val) return "bg-gray-200";
    if (val >= 70) return "bg-green-500";
    if (val >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "Aarogya Darshika": return "🏥";
      case "Full Report": return "📋";
      case "NT Report": return "🤖";
      case "Swasthya Darshika": return "🌿";
      default: return "📄";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Activity className="h-5 w-5" /> Nadi Pariksha (Nadi Tarangini Integration)
        </h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <Activity className="h-3 w-3 mr-1" /> Nadi Tarangini Device
          </Badge>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowUploadForm(true)}>
            <Plus className="mr-1 h-3 w-3" /> New Nadi Assessment
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Activity className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{visits.length}</p><p className="text-[10px] text-muted-foreground">Total Assessments</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><FileText className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{visits.reduce((s, v) => s + v.reports.length, 0)}</p><p className="text-[10px] text-muted-foreground">Reports Uploaded</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><Brain className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{visits.filter(v => v.aiCorrelation).length}</p><p className="text-[10px] text-muted-foreground">AI Correlated</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Heart className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{visits.filter(v => v.linkedLabOrders.length > 0).length}</p><p className="text-[10px] text-muted-foreground">Lab Linked</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visits">Nadi Visits</TabsTrigger>
          <TabsTrigger value="upload">Upload Reports</TabsTrigger>
          <TabsTrigger value="correlation">AI Correlation</TabsTrigger>
        </TabsList>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-3">
          <div className="relative max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input className="pl-8 h-8 text-xs" placeholder="Search patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Visit List */}
            <div className="space-y-2">
              {filteredVisits.map((visit) => (
                <Card key={visit.id} className={`cursor-pointer transition hover:border-purple-300 ${selectedVisit?.id === visit.id ? "border-purple-500 bg-purple-50" : ""}`} onClick={() => setSelectedVisit(visit)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{visit.patientName}</p>
                      <Badge className={`text-[9px] ${getVikrutiColor(visit.vikruti)}`}>{visit.vikruti || "N/A"}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{visit.patientId} | {visit.age}y / {visit.gender}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {visit.visitDate} {visit.visitTime}</span>
                      <span className="text-[10px] text-muted-foreground">{visit.reports.length} reports</span>
                    </div>
                    {visit.pulseRate && (
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-red-500" /> {visit.pulseRate} bpm</span>
                        <span>{visit.rhythm}</span>
                        {visit.linkedLabOrders.length > 0 && <Badge variant="outline" className="text-[8px] text-green-600">Lab Linked</Badge>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Visit Detail */}
            <div className="lg:col-span-2 space-y-3">
              {!selectedVisit ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground"><Activity className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Select a visit to view details</p></CardContent></Card>
              ) : (
                <>
                  {/* Patient & Nadi Summary */}
                  <Card className="border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center"><User className="h-5 w-5 text-purple-600" /></div>
                          <div>
                            <p className="font-medium text-sm">{selectedVisit.patientName}</p>
                            <p className="text-xs text-muted-foreground">{selectedVisit.patientId} | {selectedVisit.age}y / {selectedVisit.gender} | {selectedVisit.visitDate} {selectedVisit.visitTime}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getVikrutiColor(selectedVisit.vikruti)}`}>Vikruti: {selectedVisit.vikruti || "N/A"}</Badge>
                          {selectedVisit.prakruti && <p className="text-[10px] text-muted-foreground mt-0.5">Prakruti: {selectedVisit.prakruti}</p>}
                        </div>
                      </div>

                      {/* Key Parameters Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                        <div className="border rounded p-2"><Heart className="h-3 w-3 mx-auto text-red-500" /><p className="text-sm font-bold mt-0.5">{selectedVisit.pulseRate || "-"}</p><p className="text-[9px] text-muted-foreground">Pulse</p></div>
                        <div className="border rounded p-2"><Flame className="h-3 w-3 mx-auto text-orange-500" /><p className={`text-sm font-bold mt-0.5 ${getLevelColor(selectedVisit.agniLevel)}`}>{selectedVisit.agniLevel || "-"}</p><p className="text-[9px] text-muted-foreground">Agni</p></div>
                        <div className="border rounded p-2"><Droplets className="h-3 w-3 mx-auto text-purple-500" /><p className={`text-sm font-bold mt-0.5 ${getLevelColor(selectedVisit.toxinLevel)}`}>{selectedVisit.toxinLevel || "-"}</p><p className="text-[9px] text-muted-foreground">Toxins</p></div>
                        <div className="border rounded p-2"><Shield className="h-3 w-3 mx-auto text-green-500" /><p className={`text-sm font-bold mt-0.5 ${getLevelColor(selectedVisit.immunityLevel)}`}>{selectedVisit.immunityLevel || "-"}</p><p className="text-[9px] text-muted-foreground">Immunity</p></div>
                        <div className="border rounded p-2"><Zap className="h-3 w-3 mx-auto text-amber-500" /><p className={`text-sm font-bold mt-0.5 ${getLevelColor(selectedVisit.stressLevel)}`}>{selectedVisit.stressLevel || "-"}</p><p className="text-[9px] text-muted-foreground">Stress</p></div>
                        <div className="border rounded p-2"><Wind className="h-3 w-3 mx-auto text-blue-500" /><p className="text-sm font-bold mt-0.5">{selectedVisit.rhythm || "-"}</p><p className="text-[9px] text-muted-foreground">Rhythm</p></div>
                      </div>

                      {/* Health Quotients */}
                      {(selectedVisit.innerHealthQuotient || selectedVisit.gutHealthQuotient || selectedVisit.mindHealthQuotient) && (
                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t">
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Inner Health</p>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${getQuotientColor(selectedVisit.innerHealthQuotient)}`} style={{ width: `${selectedVisit.innerHealthQuotient || 0}%` }} /></div>
                            <p className="text-xs font-bold mt-0.5">{selectedVisit.innerHealthQuotient}/100</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Gut Health</p>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${getQuotientColor(selectedVisit.gutHealthQuotient)}`} style={{ width: `${selectedVisit.gutHealthQuotient || 0}%` }} /></div>
                            <p className="text-xs font-bold mt-0.5">{selectedVisit.gutHealthQuotient}/100</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Mind Health</p>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${getQuotientColor(selectedVisit.mindHealthQuotient)}`} style={{ width: `${selectedVisit.mindHealthQuotient || 0}%` }} /></div>
                            <p className="text-xs font-bold mt-0.5">{selectedVisit.mindHealthQuotient}/100</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Uploaded Reports */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Nadi Tarangini Reports ({selectedVisit.reports.length}/4)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {["Aarogya Darshika", "Full Report", "NT Report", "Swasthya Darshika"].map((type) => {
                          const report = selectedVisit.reports.find(r => r.type === type);
                          return (
                            <div key={type} className={`border rounded p-3 ${report ? "border-green-200 bg-green-50" : "border-dashed border-gray-300 bg-gray-50"}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getReportTypeIcon(type)}</span>
                                  <div>
                                    <p className="text-xs font-medium">{type}</p>
                                    {report ? (
                                      <p className="text-[10px] text-muted-foreground">{report.fileName} ({report.fileSize})</p>
                                    ) : (
                                      <p className="text-[10px] text-red-500">Not uploaded</p>
                                    )}
                                  </div>
                                </div>
                                {report ? (
                                  <Badge className="bg-green-100 text-green-700 text-[9px]"><CheckCircle2 className="h-3 w-3 mr-0.5" /> Ready</Badge>
                                ) : (
                                  <Button size="sm" variant="outline" className="h-6 text-[9px]"><Upload className="h-3 w-3 mr-0.5" /> Upload</Button>
                                )}
                              </div>
                              {report && (
                                <div className="flex gap-1 mt-2">
                                  <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info(`Viewing ${type}`)}><Eye className="h-3 w-3" /> View</Button>
                                  <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Download started")}><Download className="h-3 w-3" /></Button>
                                  <Button size="sm" variant="outline" className="h-5 text-[9px] text-green-600" onClick={() => toast.success(`${type} sent via WhatsApp`)}><MessageSquare className="h-3 w-3" /></Button>
                                  <Button size="sm" variant="outline" className="h-5 text-[9px] text-red-600" onClick={() => toast.success("Emailed to patient")}><Mail className="h-3 w-3" /></Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Correlation */}
                  {selectedVisit.aiCorrelation && (
                    <Card className="border-purple-200">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI: Nadi + Lab Correlation</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-xs">{selectedVisit.aiCorrelation}</p>
                        {selectedVisit.linkedLabOrders.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                            <span className="text-[10px] text-muted-foreground">Linked Lab Orders:</span>
                            {selectedVisit.linkedLabOrders.map((ord, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] text-blue-600">{ord}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  {selectedVisit.notes && (
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-xs font-medium mb-1">Clinical Notes:</p>
                        <p className="text-xs text-muted-foreground">{selectedVisit.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("All reports shared via WhatsApp")}><Share2 className="mr-1 h-3 w-3" /> Share All</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("Patient portal updated")}><Eye className="mr-1 h-3 w-3" /> Publish to Portal</Button>
                    <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700" onClick={() => toast.info("AI re-analyzing with latest lab results...")}><Brain className="mr-1 h-3 w-3" /> Re-Correlate with Lab</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Upload Nadi Tarangini Reports</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Patient</label>
                  <Input className="h-8 text-xs" placeholder="Search patient by name or ID..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Visit Date & Time</label>
                  <div className="flex gap-2">
                    <Input className="h-8 text-xs" type="date" defaultValue="2026-07-24" />
                    <Input className="h-8 text-xs" type="time" defaultValue="19:05" />
                  </div>
                </div>
              </div>

              {/* 4 Report Upload Slots */}
              <div className="grid sm:grid-cols-2 gap-3">
                {["Aarogya Darshika", "Full Report", "NT Report", "Swasthya Darshika"].map((type) => (
                  <div key={type} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition cursor-pointer">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs font-medium">{getReportTypeIcon(type)} {type}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Click or drag PDF here</p>
                    <Input type="file" accept=".pdf" className="hidden" />
                    <Button size="sm" variant="outline" className="mt-2 h-6 text-[10px]">Choose File</Button>
                  </div>
                ))}
              </div>

              {/* Optional Key Parameters */}
              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">Key Parameters (Optional - for AI Correlation)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Vikruti</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Vata">Vata</SelectItem><SelectItem value="Pitta">Pitta</SelectItem><SelectItem value="Kapha">Kapha</SelectItem><SelectItem value="Vata-Pitta">Vata-Pitta</SelectItem><SelectItem value="Pitta-Kapha">Pitta-Kapha</SelectItem><SelectItem value="Vata-Kapha">Vata-Kapha</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Pulse Rate</label><Input className="h-7 text-xs" type="number" placeholder="e.g. 80" /></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Rhythm</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Irregular">Irregular</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Agni Level</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Toxin Level</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Immunity Level</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Stress Level</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Inner Health Quotient</label><Input className="h-7 text-xs" type="number" placeholder="0-100" /></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Gut Health Quotient</label><Input className="h-7 text-xs" type="number" placeholder="0-100" /></div>
                  <div className="space-y-1"><label className="text-[10px] text-muted-foreground">Mind Health Quotient</label><Input className="h-7 text-xs" type="number" placeholder="0-100" /></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Link to Lab Order (Optional)</label>
                <Input className="h-8 text-xs" placeholder="Enter order number, e.g. ORD-2026-0047" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Clinical Notes</label>
                <Textarea className="text-xs min-h-[60px]" placeholder="Enter observations from Nadi assessment..." />
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => toast.success("Nadi assessment saved with reports!")}>
                <Upload className="mr-1 h-4 w-4" /> Save Nadi Assessment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Correlation Tab */}
        <TabsContent value="correlation" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI: Nadi Pariksha + Modern Lab Correlation Engine</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">When both Nadi assessment and lab reports exist for a patient, AI generates clinical correlations bridging AYUSH pulse diagnosis with modern pathology findings.</p>

              {visits.filter(v => v.aiCorrelation).map((visit) => (
                <Card key={visit.id} className="border-purple-100">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${getVikrutiColor(visit.vikruti)}`}>{visit.vikruti}</Badge>
                        <span className="text-sm font-medium">{visit.patientName}</span>
                        <span className="text-[10px] text-muted-foreground">({visit.patientId})</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{visit.visitDate}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-2">
                      {/* Nadi Findings */}
                      <div className="bg-purple-50 border border-purple-200 rounded p-2">
                        <p className="text-[10px] font-medium text-purple-700 mb-1">Nadi Findings:</p>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <span>Vikruti: <strong>{visit.vikruti}</strong></span>
                          <span>Agni: <strong className={getLevelColor(visit.agniLevel)}>{visit.agniLevel}</strong></span>
                          <span>Toxins: <strong className={getLevelColor(visit.toxinLevel)}>{visit.toxinLevel}</strong></span>
                          <span>Immunity: <strong className={getLevelColor(visit.immunityLevel)}>{visit.immunityLevel}</strong></span>
                          <span>Stress: <strong className={getLevelColor(visit.stressLevel)}>{visit.stressLevel}</strong></span>
                          <span>Pulse: <strong>{visit.pulseRate} bpm</strong></span>
                        </div>
                      </div>
                      {/* Lab Link */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-[10px] font-medium text-blue-700 mb-1">Linked Lab Orders:</p>
                        {visit.linkedLabOrders.map((ord, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] text-blue-600 mr-1">{ord}</Badge>
                        ))}
                        <p className="text-[10px] text-muted-foreground mt-1">Lab results used for correlation analysis</p>
                      </div>
                    </div>

                    {/* AI Correlation Output */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded p-3">
                      <p className="text-[10px] font-medium text-purple-700 flex items-center gap-1 mb-1"><Brain className="h-3 w-3" /> AI Clinical Correlation:</p>
                      <p className="text-xs">{visit.aiCorrelation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NadiPariksha;
