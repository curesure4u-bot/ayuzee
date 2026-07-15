import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen, Search, Globe, Tag, Copy, Shield, CheckCircle,
  ArrowRight, Leaf,
} from "lucide-react";

type NamasteCode = {
  id: string;
  namasteCode: string;
  term: string;
  system: string;
  category: string;
  definition: string;
  icd11Tm2: string;
  icd11Tm2Name: string;
  icd11Biomedicine: string;
  icd11BioName: string;
  synonyms: string[];
};

const SYSTEMS = ["All", "Ayurveda", "Siddha", "Unani", "Homeopathy", "Yoga & Naturopathy", "Sowa-Rigpa"];

const mockCodes: NamasteCode[] = [
  { id: "1", namasteCode: "NAM-AY-001", term: "Sandhivata", system: "Ayurveda", category: "Vatavyadhi", definition: "Degenerative joint disease characterized by pain, crepitus, stiffness and swelling in joints due to Vata vitiation in Sandhi (joint)", icd11Tm2: "TM1:SE50", icd11Tm2Name: "Bi syndrome - Bone pattern", icd11Biomedicine: "FA02", icd11BioName: "Osteoarthritis of knee", synonyms: ["Sandhigata Vata", "Jirna Vata", "Asthi-Sandhi Shoola"] },
  { id: "2", namasteCode: "NAM-AY-002", term: "Gridhrasi", system: "Ayurveda", category: "Vatavyadhi", definition: "Pain radiating from hip to foot along the posterior aspect of lower limb, resembling the gait of a vulture (Gridhra)", icd11Tm2: "TM1:SE52", icd11Tm2Name: "Bi syndrome - Sinew pattern", icd11Biomedicine: "ME84.2", icd11BioName: "Lumbar radiculopathy", synonyms: ["Grudhrasi", "Gridhrasi Vata"] },
  { id: "3", namasteCode: "NAM-AY-003", term: "Amavata", system: "Ayurveda", category: "Ama Vyadhi", definition: "Systemic inflammatory joint disease caused by Ama (metabolic toxins) lodging in joints with vitiated Vata, causing pain, swelling and stiffness in multiple joints", icd11Tm2: "TM1:SE51", icd11Tm2Name: "Bi syndrome - Heat pattern", icd11Biomedicine: "FA20", icd11BioName: "Rheumatoid arthritis", synonyms: ["Ama Vata", "Amavata Jwara"] },
  { id: "4", namasteCode: "NAM-AY-004", term: "Pakshaghata", system: "Ayurveda", category: "Vatavyadhi", definition: "Loss of motor and/or sensory function in one half of the body (Paksha) due to obstruction of Vata in its channels", icd11Tm2: "TM1:WB30", icd11Tm2Name: "Wind-stroke patterns", icd11Biomedicine: "8B20", icd11BioName: "Ischaemic stroke", synonyms: ["Paksha Vadha", "Ekanga Vata"] },
  { id: "5", namasteCode: "NAM-AY-005", term: "Madhumeha", system: "Ayurveda", category: "Prameha", definition: "Metabolic disorder characterized by excessive sweet-tasting urine (Madhu = honey), polyuria, and tissue wasting due to impaired Agni and Kapha-Meda-Kleda vitiation", icd11Tm2: "TM1:BG90", icd11Tm2Name: "Xiao-ke disease patterns", icd11Biomedicine: "5A11", icd11BioName: "Type 2 diabetes mellitus", synonyms: ["Prameha", "Ikshu Meha", "Madhu Prameha"] },
  { id: "6", namasteCode: "NAM-SD-001", term: "Vali Azhal Keel Vayu", system: "Siddha", category: "Vata Noi", definition: "Degenerative inflammatory joint disease in Siddha characterized by pain, swelling and difficulty in joint movement due to vitiated Vali (Vatham) and Azhal (Pitham)", icd11Tm2: "TM1:SE50", icd11Tm2Name: "Bi syndrome - Bone pattern", icd11Biomedicine: "FA02", icd11BioName: "Osteoarthritis of knee", synonyms: ["Keel Vayu", "Sandhi Vayu"] },
  { id: "7", namasteCode: "NAM-UN-001", term: "Waja-ul-Mafasil", system: "Unani", category: "Amraz-e-Mafasil", definition: "Joint pain and inflammation in Unani medicine caused by accumulation of abnormal humors (Akhlat-e-Fasida) in the joint spaces", icd11Tm2: "TM1:SE50", icd11Tm2Name: "Bi syndrome - Bone pattern", icd11Biomedicine: "FA20", icd11BioName: "Rheumatoid arthritis", synonyms: ["Waja ul Mafasil Balghami", "Dard-e-Mafasil"] },
  { id: "8", namasteCode: "NAM-HM-001", term: "Arthritis (Miasmatic)", system: "Homeopathy", category: "Chronic Miasm", definition: "Chronic inflammatory joint condition understood through miasmatic layers — Psoric (functional), Sycotic (hypertrophic), Syphilitic (destructive)", icd11Tm2: "—", icd11Tm2Name: "Homeopathy uses symptom totality", icd11Biomedicine: "FA20", icd11BioName: "Rheumatoid arthritis", synonyms: ["Chronic Articular Rheumatism"] },
  { id: "9", namasteCode: "NAM-SR-001", term: "rTsa-dKar Nad", system: "Sowa-Rigpa", category: "rLung Nad", definition: "White channel disease in Tibetan medicine — disorders of the musculoskeletal system caused by rLung (wind) imbalance affecting bones and joints", icd11Tm2: "TM1:SE50", icd11Tm2Name: "Bi syndrome patterns", icd11Biomedicine: "FA02", icd11BioName: "Osteoarthritis", synonyms: ["Rus-Tshigs Nad", "Bone-Joint disease"] },
  { id: "10", namasteCode: "NAM-SR-002", term: "rLung Nad", system: "Sowa-Rigpa", category: "rLung (Wind)", definition: "Wind disorder in Tibetan Sowa-Rigpa medicine — encompasses neurological and musculoskeletal conditions caused by disturbance of rLung humor", icd11Tm2: "TM1:WB30", icd11Tm2Name: "Wind patterns", icd11Biomedicine: "G43", icd11BioName: "Neurological disorders", synonyms: ["Wind disease", "Vayu Roga equivalent"] },
];

const HmsNamaste = () => {
  const [codes] = useState<NamasteCode[]>(mockCodes);
  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState("All");
  const [selectedCode, setSelectedCode] = useState<NamasteCode | null>(null);

  const filtered = codes.filter((c) => {
    const matchSearch = c.term.toLowerCase().includes(search.toLowerCase()) ||
      c.namasteCode.toLowerCase().includes(search.toLowerCase()) ||
      c.definition.toLowerCase().includes(search.toLowerCase()) ||
      c.icd11Biomedicine.toLowerCase().includes(search.toLowerCase());
    const matchSystem = filterSystem === "All" || c.system === filterSystem;
    return matchSearch && matchSystem;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-teal-600" /> NAMASTE & ICD-11 TM2 Coding
          </h1>
          <p className="text-sm text-muted-foreground">
            National AYUSH Morbidity Terminology + WHO ICD-11 Traditional Medicine Module + All 7 AYUSH systems including Sowa-Rigpa
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-teal-100 text-teal-700 border-teal-300">NAMASTE (Govt. of India)</Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">WHO ICD-11 TM2</Badge>
        </div>
      </div>

      {/* System Tabs showing all 7 */}
      <div className="flex flex-wrap gap-2">
        {SYSTEMS.map((sys) => (
          <Button key={sys} size="sm" variant={filterSystem === sys ? "default" : "outline"} onClick={() => setFilterSystem(sys)} className="text-xs">
            {sys === "All" ? "All Systems" : sys}
            {sys !== "All" && <Badge variant="secondary" className="ml-1 text-[9px]">{codes.filter(c => c.system === sys).length}</Badge>}
          </Button>
        ))}
      </div>

      {/* Info Cards for Standards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-teal-200 bg-teal-50/30">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-teal-700">NAMASTE</p>
            <p className="text-[10px] text-teal-600 mt-0.5">National AYUSH Morbidity and Standardized Terminology Electronic — Government of India standard for all AYUSH disease terminology.</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-blue-700">ICD-11 TM2 (WHO)</p>
            <p className="text-[10px] text-blue-600 mt-0.5">WHO Traditional Medicine Module 2 — standardized codes for traditional medicine conditions, enabling cross-system comparability globally.</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-purple-700">Dual Coding at Sign-off</p>
            <p className="text-[10px] text-purple-600 mt-0.5">Every diagnosis coded with NAMASTE + ICD-11 TM2 + ICD-11 Biomedicine equivalent — required for ABDM, insurance, and research.</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search AYUSH term, NAMASTE code, or condition..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Code Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">NAMASTE Code</th>
                  <th className="px-3 py-2 text-left font-medium">AYUSH Term</th>
                  <th className="px-3 py-2 text-left font-medium">System</th>
                  <th className="px-3 py-2 text-left font-medium">ICD-11 TM2</th>
                  <th className="px-3 py-2 text-left font-medium">ICD-11 Biomedicine</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedCode(c)}>
                    <td className="px-3 py-2 font-mono text-xs font-bold text-teal-700">{c.namasteCode}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{c.term}</p>
                      <p className="text-[10px] text-muted-foreground">{c.category}</p>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{c.system}</Badge></td>
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs text-blue-600">{c.icd11Tm2}</p>
                      <p className="text-[10px] text-muted-foreground">{c.icd11Tm2Name}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs text-purple-600">{c.icd11Biomedicine}</p>
                      <p className="text-[10px] text-muted-foreground">{c.icd11BioName}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="h-6" onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(`${c.namasteCode} | ${c.term} | ${c.icd11Biomedicine}`); toast.success("Copied!"); }}>
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
      {selectedCode && (
        <Card className="border-teal-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-teal-600" /> {selectedCode.term}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setSelectedCode(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-center">
                <p className="text-[10px] text-teal-600 uppercase font-medium">NAMASTE Code</p>
                <p className="text-lg font-mono font-bold text-teal-700 mt-1">{selectedCode.namasteCode}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                <p className="text-[10px] text-blue-600 uppercase font-medium">ICD-11 TM2</p>
                <p className="text-lg font-mono font-bold text-blue-700 mt-1">{selectedCode.icd11Tm2}</p>
                <p className="text-[9px] text-blue-600">{selectedCode.icd11Tm2Name}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                <p className="text-[10px] text-purple-600 uppercase font-medium">ICD-11 Bio</p>
                <p className="text-lg font-mono font-bold text-purple-700 mt-1">{selectedCode.icd11Biomedicine}</p>
                <p className="text-[9px] text-purple-600">{selectedCode.icd11BioName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Definition</p>
              <p className="text-sm">{selectedCode.definition}</p>
            </div>
            <div className="flex gap-4">
              <div><p className="text-xs font-medium text-muted-foreground">System</p><Badge variant="outline">{selectedCode.system}</Badge></div>
              <div><p className="text-xs font-medium text-muted-foreground">Category</p><Badge variant="secondary">{selectedCode.category}</Badge></div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Synonyms / Alternate Terms</p>
              <div className="flex flex-wrap gap-1">{selectedCode.synonyms.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(`NAMASTE: ${selectedCode.namasteCode} | Term: ${selectedCode.term} | ICD-11 TM2: ${selectedCode.icd11Tm2} | ICD-11 Bio: ${selectedCode.icd11Biomedicine} (${selectedCode.icd11BioName})`); toast.success("Full coding copied for sign-off"); }}>
                <Copy className="mr-1 h-3 w-3" /> Copy Dual Code (for Sign-off)
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Applied to current consultation")}>
                Apply to EMR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sowa-Rigpa Info */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-3 flex items-start gap-3">
          <Leaf className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-medium">Sowa-Rigpa — The 7th AYUSH System</p>
            <p className="text-amber-600 mt-0.5">
              Sowa-Rigpa (Science of Healing) is the traditional Tibetan medical system recognized by the Ministry of AYUSH, Government of India. 
              It is practiced in Ladakh, Sikkim, Himachal Pradesh, Arunachal Pradesh, and Darjeeling. The system is based on three humors — 
              rLung (Wind), mKhris-pa (Bile), and Bad-kan (Phlegm). Ayuzee supports full Sowa-Rigpa clinical workflows including 
              constitutional assessment, pulse diagnosis, and traditional formulations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsNamaste;
