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
import { askClinicalCopilot, isGeminiConfigured } from "@/lib/gemini";

const HmsAiAssist = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [caseInput, setCaseInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState("english");
  const geminiReady = isGeminiConfigured();

  const generateAI = async (type: string) => {
    if (!caseInput.trim() && type !== "prescription") {
      toast.error("Please enter case details first");
      return;
    }

    setIsGenerating(true);

    const prompts: Record<string, string> = {
      summary: `Generate a concise clinical case summary in AYUSH format for:\n\n${caseInput}\n\nInclude: Key findings, Nadi/Prakriti assessment, Ayurvedic diagnosis (Roga), modern correlation, ICD code if applicable.`,
      diagnosis: `Provide differential diagnosis suggestions (Roga Nidana) for:\n\n${caseInput}\n\nList top 3 possibilities with confidence %, reasoning, and recommended investigations.`,
      treatment: `Suggest a treatment protocol (Chikitsa) for:\n\n${caseInput}\n\nInclude: Shamana medicines, Shodhana (Panchakarma if needed), Pathya-Apathya, Yoga/exercise recommendations. Phase-wise plan.`,
      prescription: `Generate prescription suggestions for:\n\n${caseInput}\n\nFormat as table: Medicine | Dose | Frequency | Duration | Anupana (vehicle). Include AFI formulations where applicable.`,
      discharge: `Draft a discharge summary for:\n\n${caseInput}\n\nInclude: Diagnosis, treatment given, condition at discharge, discharge medications, follow-up advice, Pathya instructions.`,
    };

    if (geminiReady) {
      const response = await askClinicalCopilot(prompts[type] || caseInput);
      if (response.error) {
        toast.error(response.error);
        setAiOutput(`Error: ${response.error}`);
      } else {
        setAiOutput(response.text);
        toast.success("AI analysis generated");
      }
    } else {
      // Fallback mock for when API key not set
      setTimeout(() => {
        setAiOutput(`[AI not configured — showing sample]\n\nPlease add VITE_GEMINI_API_KEY to enable live AI responses.\n\nSample output for "${type}" would appear here with real Gemini AI analysis.`);
        toast.info("Using demo mode — configure Gemini API key for live AI");
      }, 1000);
    }

    setIsGenerating(false);
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
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("summary"); generateAI("summary"); }}>
          <CardContent className="p-3 text-center">
            <FileText className="h-5 w-5 mx-auto text-violet-600" />
            <p className="text-xs font-medium mt-1">Case Summary</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("diagnosis"); generateAI("diagnosis"); }}>
          <CardContent className="p-3 text-center">
            <Activity className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-xs font-medium mt-1">Diagnosis Aid</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("treatment"); generateAI("treatment"); }}>
          <CardContent className="p-3 text-center">
            <ClipboardList className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-xs font-medium mt-1">Treatment Plan</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("prescription"); generateAI("prescription"); }}>
          <CardContent className="p-3 text-center">
            <Pill className="h-5 w-5 mx-auto text-emerald-600" />
            <p className="text-xs font-medium mt-1">Rx Suggestion</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-violet-300 transition" onClick={() => { setActiveTab("discharge"); generateAI("discharge"); }}>
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
                onClick={() => generateAI(activeTab)}
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
