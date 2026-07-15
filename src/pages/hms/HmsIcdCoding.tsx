import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen, Search, Plus, Copy, CheckCircle, Tag,
  ArrowRight, Download, Filter,
} from "lucide-react";

type IcdMapping = {
  id: string;
  ayushName: string;
  ayushSystem: string;
  sanskritName: string;
  icd10Code: string;
  icd10Name: string;
  icd11Code: string;
  icd11Name: string;
  category: string;
  chapter: string;
  commonSymptoms: string[];
  frequency: number; // how often used in hospital
};

const mockMappings: IcdMapping[] = [
  { id: "1", ayushName: "Sandhivata", ayushSystem: "Ayurveda", sanskritName: "सन्धिवात", icd10Code: "M17", icd10Name: "Gonarthrosis [arthrosis of knee]", icd11Code: "FA02", icd11Name: "Osteoarthritis of knee", category: "Musculoskeletal", chapter: "XIII", commonSymptoms: ["Joint pain", "Stiffness", "Crepitus", "Swelling"], frequency: 42 },
  { id: "2", ayushName: "Gridhrasi", ayushSystem: "Ayurveda", sanskritName: "गृध्रसी", icd10Code: "M54.3", icd10Name: "Sciatica", icd11Code: "ME84.2", icd11Name: "Lumbar radiculopathy", category: "Musculoskeletal", chapter: "XIII", commonSymptoms: ["Radiating leg pain", "Low back pain", "Numbness", "SLR positive"], frequency: 28 },
  { id: "3", ayushName: "Amavata", ayushSystem: "Ayurveda", sanskritName: "आमवात", icd10Code: "M06.9", icd10Name: "Rheumatoid arthritis, unspecified", icd11Code: "FA20", icd11Name: "Rheumatoid arthritis", category: "Musculoskeletal", chapter: "XIII", commonSymptoms: ["Multiple joint pain", "Morning stiffness", "Swelling", "Symmetrical"], frequency: 18 },
  { id: "4", ayushName: "Pandu", ayushSystem: "Ayurveda", sanskritName: "पाण्डु", icd10Code: "D50.9", icd10Name: "Iron deficiency anaemia, unspecified", icd11Code: "3A00", icd11Name: "Iron deficiency anaemia", category: "Blood", chapter: "III", commonSymptoms: ["Pallor", "Fatigue", "Breathlessness", "Weakness"], frequency: 15 },
  { id: "5", ayushName: "Madhumeha", ayushSystem: "Ayurveda", sanskritName: "मधुमेह", icd10Code: "E11", icd10Name: "Type 2 diabetes mellitus", icd11Code: "5A11", icd11Name: "Type 2 diabetes mellitus", category: "Endocrine", chapter: "IV", commonSymptoms: ["Polyuria", "Polydipsia", "Weight loss", "Fatigue"], frequency: 14 },
  { id: "6", ayushName: "Kushtha (Psoriasis)", ayushSystem: "Ayurveda", sanskritName: "कुष्ठ", icd10Code: "L40.0", icd10Name: "Psoriasis vulgaris", icd11Code: "EA90.0", icd11Name: "Psoriasis vulgaris", category: "Skin", chapter: "XII", commonSymptoms: ["Scaly patches", "Itching", "Dry skin", "Red plaques"], frequency: 11 },
  { id: "7", ayushName: "Tamaka Shwasa", ayushSystem: "Ayurveda", sanskritName: "तमक श्वास", icd10Code: "J45.9", icd10Name: "Asthma, unspecified", icd11Code: "CA23", icd11Name: "Asthma", category: "Respiratory", chapter: "X", commonSymptoms: ["Wheezing", "Dyspnea", "Cough", "Chest tightness"], frequency: 12 },
  { id: "8", ayushName: "Sthoulya", ayushSystem: "Ayurveda", sanskritName: "स्थौल्य", icd10Code: "E66.9", icd10Name: "Obesity, unspecified", icd11Code: "5B81", icd11Name: "Obesity", category: "Endocrine", chapter: "IV", commonSymptoms: ["BMI > 30", "Excess weight", "Fatigue", "Joint pain"], frequency: 8 },
  { id: "9", ayushName: "Arsha", ayushSystem: "Ayurveda", sanskritName: "अर्श", icd10Code: "K64.9", icd10Name: "Haemorrhoids, unspecified", icd11Code: "DB60", icd11Name: "Haemorrhoidal disease", category: "Digestive", chapter: "XI", commonSymptoms: ["Bleeding PR", "Prolapse", "Pain", "Itching"], frequency: 7 },
  { id: "10", ayushName: "Vatakantaka", ayushSystem: "Ayurveda", sanskritName: "वातकण्टक", icd10Code: "M72.2", icd10Name: "Plantar fascial fibromatosis", icd11Code: "FB40.2", icd11Name: "Plantar fasciitis", category: "Musculoskeletal", chapter: "XIII", commonSymptoms: ["Heel pain", "Morning first-step pain", "Tenderness"], frequency: 6 },
  { id: "11", ayushName: "Avabahuka", ayushSystem: "Ayurveda", sanskritName: "अवबाहुक", icd10Code: "M75.0", icd10Name: "Adhesive capsulitis of shoulder", icd11Code: "FB51.0", icd11Name: "Frozen shoulder", category: "Musculoskeletal", chapter: "XIII", commonSymptoms: ["Shoulder stiffness", "Pain", "Limited ROM", "Night pain"], frequency: 9 },
  { id: "12", ayushName: "Unmada / Chittodvega", ayushSystem: "Ayurveda", sanskritName: "उन्माद / चित्तोद्वेग", icd10Code: "F41.1", icd10Name: "Generalized anxiety disorder", icd11Code: "6B00", icd11Name: "Generalised anxiety disorder", category: "Mental", chapter: "V", commonSymptoms: ["Anxiety", "Restlessness", "Insomnia", "Palpitations"], frequency: 9 },
  { id: "13", ayushName: "Vali (Vatham) Azhal", ayushSystem: "Siddha", sanskritName: "வலி (வாதம்) அழல்", icd10Code: "M79.3", icd10Name: "Panniculitis, unspecified", icd11Code: "ME80", icd11Name: "Soft tissue pain", category: "Musculoskeletal", chapter: "XIII", commonSymptoms: ["Body pain", "Joint pain", "Inflammation"], frequency: 5 },
  { id: "14", ayushName: "Khalitya", ayushSystem: "Ayurveda", sanskritName: "खालित्य", icd10Code: "L65.9", icd10Name: "Nonscarring hair loss, unspecified", icd11Code: "ED70", icd11Name: "Alopecia", category: "Skin", chapter: "XII", commonSymptoms: ["Hair fall", "Thinning", "Scalp dryness"], frequency: 5 },
  { id: "15", ayushName: "Pakshaghata", ayushSystem: "Ayurveda", sanskritName: "पक्षाघात", icd10Code: "I63.9", icd10Name: "Cerebral infarction, unspecified", icd11Code: "8B20", icd11Name: "Ischaemic stroke", category: "Nervous", chapter: "VI", commonSymptoms: ["Hemiplegia", "Speech difficulty", "Facial droop", "Weakness"], frequency: 4 },
];

const CHAPTERS = ["All", "III - Blood", "IV - Endocrine", "V - Mental", "VI - Nervous", "X - Respiratory", "XI - Digestive", "XII - Skin", "XIII - Musculoskeletal"];
const SYSTEMS = ["All", "Ayurveda", "Siddha", "Homeopathy", "Unani", "Yoga"];

const HmsIcdCoding = () => {
  const [mappings] = useState<IcdMapping[]>(mockMappings);
  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState("All");
  const [filterChapter, setFilterChapter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<IcdMapping | null>(null);

  const filtered = mappings.filter((m) => {
    const matchSearch = m.ayushName.toLowerCase().includes(search.toLowerCase()) ||
      m.icd10Code.toLowerCase().includes(search.toLowerCase()) ||
      m.icd10Name.toLowerCase().includes(search.toLowerCase()) ||
      m.sanskritName.includes(search);
    const matchSystem = filterSystem === "All" || m.ayushSystem === filterSystem;
    const matchChapter = filterChapter === "All" || filterChapter.includes(m.chapter);
    return matchSearch && matchSystem && matchChapter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" /> ICD Coding for AYUSH
          </h1>
          <p className="text-sm text-muted-foreground">
            AYUSH-to-ICD-10/ICD-11 mapping · Dual coding · Insurance & ABDM compliant · NABH ready
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export Codes</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Mapping</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mappings.length}</p><p className="text-xs text-muted-foreground">Total Mappings</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mappings.filter(m => m.ayushSystem === "Ayurveda").length}</p><p className="text-xs text-muted-foreground">Ayurveda</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{new Set(mappings.map(m => m.chapter)).size}</p><p className="text-xs text-muted-foreground">ICD Chapters</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mappings.reduce((s, m) => s + m.frequency, 0)}</p><p className="text-xs text-muted-foreground">Uses This Month</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Badge className="bg-green-100 text-green-700 border-green-300 text-xs">ICD-10 + ICD-11</Badge><p className="text-xs text-muted-foreground mt-1">Dual Coding</p></CardContent></Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search AYUSH name, Sanskrit, ICD code, or disease name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{SYSTEMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterChapter} onValueChange={setFilterChapter}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>{CHAPTERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mapping Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">AYUSH Diagnosis</th>
                  <th className="px-3 py-2 text-left font-medium">System</th>
                  <th className="px-3 py-2 text-left font-medium">ICD-10</th>
                  <th className="px-3 py-2 text-left font-medium">ICD-11</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Uses</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedMapping(m)}>
                    <td className="px-3 py-2">
                      <p className="font-medium">{m.ayushName}</p>
                      <p className="text-[10px] text-muted-foreground">{m.sanskritName}</p>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{m.ayushSystem}</Badge></td>
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs font-bold text-blue-600">{m.icd10Code}</p>
                      <p className="text-[10px] text-muted-foreground">{m.icd10Name}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs font-bold text-purple-600">{m.icd11Code}</p>
                      <p className="text-[10px] text-muted-foreground">{m.icd11Name}</p>
                    </td>
                    <td className="px-3 py-2"><Badge variant="secondary" className="text-[9px]">{m.category}</Badge></td>
                    <td className="px-3 py-2 font-medium">{m.frequency}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="h-6" onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(`${m.ayushName} (${m.icd10Code})`); toast.success("Copied!"); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMapping} onOpenChange={() => setSelectedMapping(null)}>
        <DialogContent className="max-w-lg">
          {selectedMapping && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  {selectedMapping.ayushName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{selectedMapping.sanskritName}</p>
                  <p className="text-xs text-muted-foreground">{selectedMapping.ayushSystem} Diagnosis</p>
                </div>

                {/* Dual Coding Display */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-[10px] text-blue-600 uppercase font-medium">ICD-10-CM</p>
                    <p className="text-xl font-mono font-bold text-blue-700 mt-1">{selectedMapping.icd10Code}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{selectedMapping.icd10Name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Chapter {selectedMapping.chapter}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-[10px] text-purple-600 uppercase font-medium">ICD-11 (WHO 2022)</p>
                    <p className="text-xl font-mono font-bold text-purple-700 mt-1">{selectedMapping.icd11Code}</p>
                    <p className="text-xs text-purple-600 mt-0.5">{selectedMapping.icd11Name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Category: {selectedMapping.category}</p>
                  </div>
                </div>

                {/* Common Symptoms */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Common Symptoms</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMapping.commonSymptoms.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>

                {/* Usage */}
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Used in this hospital</span>
                  <span className="font-bold">{selectedMapping.frequency} times this month</span>
                </div>

                {/* Copy Formats */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Quick Copy Formats</p>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => { navigator.clipboard?.writeText(`${selectedMapping.ayushName} [${selectedMapping.icd10Code}]`); toast.success("Copied!"); }}>
                      <span>{selectedMapping.ayushName} [{selectedMapping.icd10Code}]</span><Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => { navigator.clipboard?.writeText(`${selectedMapping.icd10Code} - ${selectedMapping.icd10Name}`); toast.success("Copied!"); }}>
                      <span>{selectedMapping.icd10Code} - {selectedMapping.icd10Name}</span><Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => { navigator.clipboard?.writeText(`${selectedMapping.ayushName} (${selectedMapping.sanskritName}) | ICD-10: ${selectedMapping.icd10Code} | ICD-11: ${selectedMapping.icd11Code}`); toast.success("Copied!"); }}>
                      <span>Full format (AYUSH + ICD-10 + ICD-11)</span><Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Mapping Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add AYUSH-ICD Mapping</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>AYUSH Diagnosis Name *</Label><Input placeholder="e.g., Sandhivata" /></div>
              <div><Label>Sanskrit / Original Name</Label><Input placeholder="e.g., सन्धिवात" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Medical System *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ayurveda">Ayurveda</SelectItem>
                    <SelectItem value="Siddha">Siddha</SelectItem>
                    <SelectItem value="Homeopathy">Homeopathy</SelectItem>
                    <SelectItem value="Unani">Unani</SelectItem>
                    <SelectItem value="Yoga">Yoga & Naturopathy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Musculoskeletal">Musculoskeletal</SelectItem>
                    <SelectItem value="Digestive">Digestive</SelectItem>
                    <SelectItem value="Respiratory">Respiratory</SelectItem>
                    <SelectItem value="Endocrine">Endocrine</SelectItem>
                    <SelectItem value="Skin">Skin</SelectItem>
                    <SelectItem value="Nervous">Nervous</SelectItem>
                    <SelectItem value="Mental">Mental</SelectItem>
                    <SelectItem value="Blood">Blood</SelectItem>
                    <SelectItem value="Reproductive">Reproductive</SelectItem>
                    <SelectItem value="Urinary">Urinary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ICD-10 Code *</Label><Input placeholder="e.g., M17" /></div>
              <div><Label>ICD-10 Description *</Label><Input placeholder="e.g., Gonarthrosis" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ICD-11 Code</Label><Input placeholder="e.g., FA02" /></div>
              <div><Label>ICD-11 Description</Label><Input placeholder="e.g., Osteoarthritis of knee" /></div>
            </div>
            <div><Label>Common Symptoms (comma separated)</Label><Input placeholder="Joint pain, Stiffness, Crepitus..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("ICD mapping added"); setAddOpen(false); }}>Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-700">
            <p className="font-medium">Why AYUSH-ICD Coding?</p>
            <ul className="mt-1 space-y-0.5 text-indigo-600">
              <li>• <strong>Insurance Claims:</strong> TPA and PMJAY require ICD codes for reimbursement</li>
              <li>• <strong>ABDM Compliance:</strong> Health records shared via ABDM need standardized codes</li>
              <li>• <strong>NABH Accreditation:</strong> Mandates ICD coding for all diagnoses</li>
              <li>• <strong>Research:</strong> Enables outcome tracking and clinical audit by disease</li>
              <li>• <strong>ICD-11 Module 1:</strong> WHO 2022 includes Traditional Medicine chapter (TM1) with AYUSH conditions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsIcdCoding;
