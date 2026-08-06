import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dna, Upload, Brain, Shield, AlertTriangle, CheckCircle2,
  FileText, Eye, Download, Share2, Activity, Heart,
} from "lucide-react";

// Reference: CSIR-TRISUTRA Study (2015, Nature) | AYUSH Prakriti-Genomics Research
// Simple approach: Upload external genetic report + enter key variants + AI correlates

interface GeneVariant {
  gene: string;
  variant: string;
  impact: "Normal" | "Carrier" | "Risk" | "High Risk";
  modernMeaning: string;
  ayushCorrelation: string;
  drugResponse: string;
}

const mockVariants: GeneVariant[] = [
  { gene: "CYP2D6", variant: "Intermediate Metabolizer", impact: "Risk", modernMeaning: "Slower drug metabolism — needs dose adjustment for many drugs", ayushCorrelation: "Mandagni tendency — slower processing of Tikta/Katu rasa herbs. May need longer duration for Guggulu-based formulations.", drugResponse: "Ashwagandha: Normal | Guggulu: Slow response | Brahmi: Normal" },
  { gene: "CYP3A4", variant: "Normal Metabolizer", impact: "Normal", modernMeaning: "Normal metabolism of most drugs including statins, calcium blockers", ayushCorrelation: "Samagni — balanced digestive capacity for most herbal formulations", drugResponse: "All herbs: Normal metabolism expected" },
  { gene: "MTHFR", variant: "C677T Heterozygous", impact: "Carrier", modernMeaning: "Reduced folate metabolism (40-60%). Higher homocysteine risk.", ayushCorrelation: "Vata-Asthi Dhatu vulnerability. Prone to nerve/bone disorders. Majja Dhatu requires nourishment.", drugResponse: "Needs: Brahmi, Shankhpushpi (nerve support). Avoid: excessive Tikta rasa" },
  { gene: "APOE", variant: "E3/E4 (One copy E4)", impact: "Risk", modernMeaning: "1.5-3x Alzheimer risk. Higher LDL cholesterol tendency.", ayushCorrelation: "Kapha-Meda Dhatu predisposition. Prone to Prameha, Sthaulya. Medodhatvagni likely weak.", drugResponse: "Guggulu: Highly recommended | Triphala: Essential | Avoid: excess Snigdha/Guru foods" },
  { gene: "HLA-B*5801", variant: "Negative", impact: "Normal", modernMeaning: "No allopurinol hypersensitivity risk", ayushCorrelation: "No specific Vatarakta drug sensitivity", drugResponse: "All uric acid herbs: Safe" },
  { gene: "COMT", variant: "Val/Met (Intermediate)", impact: "Carrier", modernMeaning: "Moderate dopamine/estrogen clearance. Mild stress sensitivity.", ayushCorrelation: "Rajas-Sattvic Manas — moderate stress resilience. Benefits from Medhya Rasayana.", drugResponse: "Brahmi: Highly effective | Jatamansi: Recommended | Ashwagandha: Good response" },
  { gene: "FTO", variant: "Risk Allele (A/A)", impact: "High Risk", modernMeaning: "30% higher obesity risk. Increased appetite, fat storage tendency.", ayushCorrelation: "Strong Kapha Prakriti indicator. Meda Dhatu accumulation genetic tendency. Agni likely Manda type.", drugResponse: "Triphala: Essential daily | Guggulu: Required | Honey: Beneficial | Lekhaniya herbs: Priority" },
  { gene: "IL6", variant: "GG (Pro-inflammatory)", impact: "Risk", modernMeaning: "Higher inflammatory markers. Increased autoimmune disease risk.", ayushCorrelation: "Pitta-Rakta Dhatu inflammation tendency. Prone to Raktapitta, skin disorders, Amavata.", drugResponse: "Guduchi: Essential | Turmeric: High dose beneficial | Avoid: Vidahi/Ushna herbs excess" },
];

const prakritiGenomicMap = {
  vataGenes: ["MTHFR (nerve)", "COMT (stress)", "CYP2D6 (slow)"],
  pittaGenes: ["IL6 (inflammation)", "CYP3A4 (fast)", "HLA variants"],
  kaphaGenes: ["FTO (obesity)", "APOE-E4 (cholesterol)", "TCF7L2 (diabetes)"],
  overallPrakriti: "Pitta-Kapha (Genomic confirmation)",
  confidence: 82,
  matchWithNadi: "85% match with Nadi Pariksha Prakriti assessment",
};

const GenomicProfile = () => {
  const [variants] = useState<GeneVariant[]>(mockVariants);
  const [activeTab, setActiveTab] = useState("profile");
  const [reportUploaded] = useState(true);

  const getImpactColor = (impact: string) => {
    switch (impact) { case "Normal": return "bg-green-100 text-green-700"; case "Carrier": return "bg-blue-100 text-blue-700"; case "Risk": return "bg-amber-100 text-amber-700"; case "High Risk": return "bg-red-100 text-red-700"; default: return "bg-gray-100"; }
  };

  const riskCount = variants.filter(v => v.impact === "Risk" || v.impact === "High Risk").length;
  const normalCount = variants.filter(v => v.impact === "Normal").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Dna className="h-5 w-5" /> Genetic / Genomic Profile</h2>
        <Badge variant="outline" className="text-purple-600 border-purple-300"><Brain className="h-3 w-3 mr-1" /> Prakriti-Genomics</Badge>
      </div>
      <p className="text-[10px] text-muted-foreground italic">Ref: CSIR-TRISUTRA Study (Nature, 2015) | AYUSH Prakriti-Genomics Research Program</p>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{normalCount}</p><p className="text-[10px] text-muted-foreground">Normal</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{riskCount}</p><p className="text-[10px] text-muted-foreground">Risk Variants</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Dna className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{variants.length}</p><p className="text-[10px] text-muted-foreground">Genes Analyzed</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Brain className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{prakritiGenomicMap.confidence}%</p><p className="text-[10px] text-muted-foreground">Prakriti Match</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="profile">Genomic Profile</TabsTrigger><TabsTrigger value="upload">Upload Report</TabsTrigger><TabsTrigger value="prakriti">Prakriti-Genomics</TabsTrigger></TabsList>

        {/* Genomic Profile Tab */}
        <TabsContent value="profile" className="space-y-3">
          <div className="space-y-3">{variants.map((v) => (
            <Card key={v.gene} className={v.impact === "High Risk" ? "border-red-200 bg-red-50" : v.impact === "Risk" ? "border-amber-200" : ""}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Dna className="h-4 w-4 text-purple-600" /><span className="text-sm font-bold">{v.gene}</span><Badge className={`text-[9px] ${getImpactColor(v.impact)}`}>{v.impact}</Badge></div>
                  <Badge variant="outline" className="text-[9px]">{v.variant}</Badge>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 text-[10px]">
                  <div className="border rounded p-2"><p className="font-medium text-blue-700 mb-0.5">Modern Medicine:</p><p className="text-muted-foreground">{v.modernMeaning}</p></div>
                  <div className="border rounded p-2 bg-purple-50"><p className="font-medium text-purple-700 mb-0.5">AYUSH Correlation:</p><p className="text-muted-foreground">{v.ayushCorrelation}</p></div>
                  <div className="border rounded p-2 bg-green-50"><p className="font-medium text-green-700 mb-0.5">Drug Response:</p><p className="text-muted-foreground">{v.drugResponse}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}</div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Upload Genetic Test Report</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs">Upload genetic report PDF (from Mapmygenome, MedGenome, SRL, 23andMe)</p>
                <Button size="sm" variant="outline" className="mt-2"><Upload className="mr-1 h-3 w-3" /> Choose File</Button>
              </div>
              {reportUploaded && <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs"><CheckCircle2 className="h-4 w-4 text-green-600" /><span>Report uploaded: <strong>Rajesh_Mapmygenome_Jul2026.pdf</strong></span><Button size="sm" variant="outline" className="ml-auto h-5 text-[9px]"><Eye className="h-3 w-3" /></Button></div>}
              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">Enter Key Gene Variants (from report):</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {["CYP2D6", "CYP3A4", "MTHFR", "APOE", "HLA-B*5801", "COMT", "FTO", "IL6"].map((gene) => (
                    <div key={gene} className="space-y-1"><label className="text-[10px] text-muted-foreground">{gene}</label><Select><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select variant" /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="carrier">Carrier / Heterozygous</SelectItem><SelectItem value="risk">Risk Variant</SelectItem><SelectItem value="high">High Risk / Homozygous</SelectItem></SelectContent></Select></div>
                  ))}
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => toast.success("Genomic profile saved! AI correlation generated.")}><Brain className="mr-1 h-4 w-4" /> Save & Generate AI Correlation</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prakriti-Genomics Tab */}
        <TabsContent value="prakriti" className="space-y-3">
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI: Prakriti-Genomics Correlation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="border rounded p-3 bg-blue-50"><p className="text-xs font-medium text-blue-700">Vata Genes:</p><div className="mt-1 space-y-0.5">{prakritiGenomicMap.vataGenes.map((g,i) => <Badge key={i} variant="outline" className="text-[8px] mr-1 text-blue-600">{g}</Badge>)}</div></div>
                <div className="border rounded p-3 bg-red-50"><p className="text-xs font-medium text-red-700">Pitta Genes:</p><div className="mt-1 space-y-0.5">{prakritiGenomicMap.pittaGenes.map((g,i) => <Badge key={i} variant="outline" className="text-[8px] mr-1 text-red-600">{g}</Badge>)}</div></div>
                <div className="border rounded p-3 bg-green-50"><p className="text-xs font-medium text-green-700">Kapha Genes:</p><div className="mt-1 space-y-0.5">{prakritiGenomicMap.kaphaGenes.map((g,i) => <Badge key={i} variant="outline" className="text-[8px] mr-1 text-green-600">{g}</Badge>)}</div></div>
              </div>
              <div className="border rounded p-3">
                <p className="text-xs"><strong>Genomic Prakriti:</strong> <Badge className="bg-purple-100 text-purple-700">{prakritiGenomicMap.overallPrakriti}</Badge></p>
                <p className="text-xs mt-1"><strong>Confidence:</strong> {prakritiGenomicMap.confidence}%</p>
                <p className="text-xs mt-1 text-green-700"><strong>Nadi Match:</strong> {prakritiGenomicMap.matchWithNadi}</p>
              </div>
              <div className="border border-purple-200 rounded p-3 bg-purple-50">
                <p className="text-xs font-medium text-purple-800 mb-1">AI Insight:</p>
                <p className="text-[11px]">Genomic analysis confirms Pitta-Kapha constitution with strong IL6 inflammation markers (Pitta-Rakta) and FTO obesity gene (Kapha-Meda). The MTHFR carrier status adds Vata-nerve vulnerability. This triple genomic signature validates the clinical Prakriti from Nadi Pariksha (85% match). Treatment should prioritize: anti-inflammatory Rasayanas, Meda-reducing protocols, and nerve-protective herbs.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> Download Report</Button>
                <Button size="sm" variant="outline" className="text-green-600"><Share2 className="mr-1 h-3 w-3" /> Share with Patient</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenomicProfile;
