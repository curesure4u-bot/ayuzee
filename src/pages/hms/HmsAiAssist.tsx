import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain, Sparkles, FileText, Pill, ClipboardList,
  Languages, Mic, Scan, Activity, Send,
} from "lucide-react";

const HmsAiAssist = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [caseInput, setCaseInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState("english");

  const simulateAI = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      switch (type) {
        case "summary":
          setAiOutput(`**Case Summary**\n\nPatient presents with chronic joint pain (Sandhivata/Osteoarthritis) of both knees for 3 years with recent worsening. Constitutional assessment suggests Vata-Kapha Prakruti with current Vata Vriddhi. Agni is Vishama type with moderate Ama.\n\n**Key Findings:**\n- Nadi: Vata-dominant pulse\n- Joint crepitus bilateral knee\n- Limited ROM (flexion 90°)\n- ESR elevated (28 mm/hr)\n- X-ray: Grade 2 OA changes\n\n**Ayurvedic Diagnosis:** Sandhivata (Vataja)\n**Modern Correlation:** Bilateral Knee Osteoarthritis (Grade 2)`);
          break;
        case "diagnosis":
          setAiOutput(`**AI Diagnosis Suggestions**\n\n1. **Primary:** Sandhivata (Osteoarthritis) - 92% confidence\n   - Based on: Joint crepitus, pain on movement, stiffness, X-ray findings\n\n2. **Differential 1:** Amavata (Rheumatoid Arthritis) - 35% confidence\n   - Consider if: Morning stiffness > 30 min, symmetric involvement, positive RF\n\n3. **Differential 2:** Vatarakta (Gouty Arthritis) - 15% confidence\n   - Consider if: Acute onset, uric acid elevated, toe involvement\n\n**Recommended Investigations:**\n- RA Factor, Anti-CCP\n- Serum Uric Acid\n- CRP (Quantitative)\n- Vitamin D3 levels`);
          break;
        case "treatment":
          setAiOutput(`**AI Treatment Plan Draft**\n\n**Phase 1: Ama Pachana (Days 1-7)**\n- Guggulutiktakam Kashayam 15ml BD before food\n- Chitrakadi Vati 2 tabs BD\n- Light, warm diet (Laghu ahara)\n\n**Phase 2: Panchakarma (Days 8-21)**\n- Abhyanga with Dhanwantharam Tailam (7 days)\n- Janu Basti with Kottamchukkadi Tailam (7 days)\n- Podikizhi / Elakizhi (alternate days, 7 sessions)\n- Virechana on Day 14 (if Ama cleared)\n\n**Phase 3: Shamana (Days 22-60)**\n- Yogaraja Guggulu 2 tabs TDS\n- Rasnasaptakam Kashayam 15ml BD\n- Ashwagandha Churnam 3g HS with milk\n\n**Pathya (Diet):**\n- Warm food, avoid cold/raw\n- Include ginger, garlic, turmeric\n- Avoid curd, heavy foods, fried items\n\n**Vyayama (Exercise):**\n- Gentle knee exercises\n- Walking 20 min/day\n- Avoid stair climbing`);
          break;
        case "prescription":
          setAiOutput(`**AI Prescription Suggestions**\n\n(Doctor review required before finalizing)\n\n| Medicine | Dose | Frequency | Duration | Instructions |\n|----------|------|-----------|----------|-------------|\n| Yogaraja Guggulu | 2 tabs | TDS | 30 days | After food with warm water |\n| Rasnasaptakam Kashayam | 15ml | BD | 30 days | Before food with honey |\n| Simhanada Guggulu | 2 tabs | BD | 15 days | After food |\n| Ashwagandha Churnam | 3g | HS | 30 days | With warm milk |\n| Dhanwantharam Tailam | Q.S. | External | - | Apply to joints, warm |\n\n**Anupana:** Warm water for Guggulu preparations\n**Pathya:** Avoid Viruddha Ahara, cold items\n**Review:** After 15 days with labs`);
          break;
        case "discharge":
          setAiOutput(`**Discharge Summary (AI Draft)**\n\n**Patient:** [Name] | **UHID:** [Auto-fill]\n**Admitted:** [Date] | **Discharged:** [Date]\n**Duration:** 14 days\n\n**Diagnosis:** Sandhivata (Bilateral Knee Osteoarthritis Grade 2)\n\n**Treatment Given:**\n- 7 days Snehapana with Indukantham Ghritam\n- 7 days Janu Basti + Podikizhi\n- Virechana on Day 8\n- Internal medicines throughout stay\n\n**Condition at Discharge:**\n- Pain reduced from 8/10 to 3/10 (VAS)\n- ROM improved to 120° flexion\n- Walking distance improved\n- ESR reduced from 28 to 18 mm/hr\n\n**Discharge Medications:**\n[As per prescription tab]\n\n**Follow-up:** After 15 days with repeat ESR, CRP\n\n**Advice:**\n- Continue medications for 30 days\n- Avoid heavy weight lifting\n- Daily warm oil application to joints\n- Gentle exercises as prescribed`);
          break;
        default:
          setAiOutput("AI analysis complete.");
      }
      toast.success("AI analysis generated");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-violet-600" /> AI Clinical Support
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-assisted case summarization, diagnosis, treatment planning & documentation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
              <SelectItem value="tamil">Tamil</SelectItem>
              <SelectItem value="malayalam">Malayalam</SelectItem>
              <SelectItem value="kannada">Kannada</SelectItem>
              <SelectItem value="telugu">Telugu</SelectItem>
              <SelectItem value="marathi">Marathi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("summary"); simulateAI("summary"); }}>
          <CardContent className="p-3 text-center">
            <FileText className="h-5 w-5 mx-auto text-violet-600" />
            <p className="text-xs font-medium mt-1">Case Summary</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("diagnosis"); simulateAI("diagnosis"); }}>
          <CardContent className="p-3 text-center">
            <Activity className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-xs font-medium mt-1">Diagnosis Aid</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("treatment"); simulateAI("treatment"); }}>
          <CardContent className="p-3 text-center">
            <ClipboardList className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-xs font-medium mt-1">Treatment Plan</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("prescription"); simulateAI("prescription"); }}>
          <CardContent className="p-3 text-center">
            <Pill className="h-5 w-5 mx-auto text-emerald-600" />
            <p className="text-xs font-medium mt-1">Rx Suggestion</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("discharge"); simulateAI("discharge"); }}>
          <CardContent className="p-3 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-xs font-medium mt-1">Discharge</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition">
          <CardContent className="p-3 text-center">
            <Scan className="h-5 w-5 mx-auto text-red-600" />
            <p className="text-xs font-medium mt-1">OCR Records</p>
          </CardContent>
        </Card>
      </div>

      {/* Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Clinical Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Patient / Case Context</Label>
              <Textarea
                value={caseInput}
                onChange={(e) => setCaseInput(e.target.value)}
                placeholder="Paste or type patient case details, symptoms, examination findings, investigation results... Or select a patient from the registry."
                rows={8}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Mic className="mr-1 h-3 w-3" /> Voice Input
              </Button>
              <Button variant="outline" size="sm">
                <Scan className="mr-1 h-3 w-3" /> Scan Document
              </Button>
              <Button variant="outline" size="sm">
                <Languages className="mr-1 h-3 w-3" /> Translate
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => simulateAI(activeTab)}
                disabled={isGenerating}
                className="flex-1"
              >
                <Send className="mr-1 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate AI Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" /> AI Output
              </CardTitle>
              <Badge variant="outline" className="text-xs capitalize">{activeTab}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 mx-auto border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground mt-3">AI is analyzing the case...</p>
                </div>
              </div>
            ) : aiOutput ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/30 p-4 rounded-lg border overflow-auto max-h-[400px]">
                  {aiOutput}
                </pre>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Copied to clipboard")}>
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Added to patient EMR")}>
                    Add to EMR
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit & Approve
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto opacity-20" />
                <p className="text-sm mt-3">Select an AI tool above or click "Generate AI Analysis"</p>
                <p className="text-xs mt-1">All AI suggestions require doctor review before use</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            <strong>Important:</strong> AI suggestions are assistive tools only. All clinical decisions must be reviewed and approved by a qualified AYUSH practitioner. AI-generated content should not replace clinical judgment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsAiAssist;
