import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Brain, Zap, AlertTriangle, Pill, Stethoscope, Activity,
  TrendingUp, FileText, Shield, Heart, Search, Send,
  CheckCircle, Clock, BarChart3, Sparkles, MessageCircle,
  ThumbsUp, ThumbsDown, Loader2,
} from "lucide-react";

type AiModule = {
  id: string; name: string; description: string; icon: React.ReactNode;
  status: "active" | "beta" | "coming-soon"; usageToday: number; accuracy: number;
};

const aiModules: AiModule[] = [
  { id: "diag", name: "AI Diagnosis Assist", description: "Symptom analysis, differential diagnosis with AYUSH + Allopathy correlation", icon: <Stethoscope className="h-5 w-5" />, status: "active", usageToday: 28, accuracy: 92 },
  { id: "drug", name: "Drug Interaction Checker", description: "Cross-system (Ayurveda + Allopathy + Homeopathy) interaction detection", icon: <Pill className="h-5 w-5" />, status: "active", usageToday: 45, accuracy: 97 },
  { id: "treatment", name: "Treatment Recommendation", description: "AI-suggested treatment protocols based on Prakriti, condition, and evidence", icon: <Heart className="h-5 w-5" />, status: "active", usageToday: 18, accuracy: 88 },
  { id: "predict", name: "Predictive Analytics", description: "Patient readmission risk, no-show prediction, disease progression", icon: <TrendingUp className="h-5 w-5" />, status: "active", usageToday: 12, accuracy: 85 },
  { id: "cdss", name: "Clinical Decision Support", description: "Real-time alerts during prescribing — dosage, allergy, contraindication", icon: <Shield className="h-5 w-5" />, status: "active", usageToday: 62, accuracy: 99 },
  { id: "scribe", name: "AI Medical Scribe", description: "Auto-generate consultation notes from voice/text conversation", icon: <FileText className="h-5 w-5" />, status: "active", usageToday: 15, accuracy: 90 },
  { id: "vitals", name: "Vitals Trend Analyzer", description: "Detect anomalies and deterioration patterns in patient vitals", icon: <Activity className="h-5 w-5" />, status: "beta", usageToday: 8, accuracy: 87 },
  { id: "report", name: "Lab Report Interpreter", description: "AI interpretation of blood work, urine analysis with Ayurvedic correlation", icon: <BarChart3 className="h-5 w-5" />, status: "active", usageToday: 22, accuracy: 94 },
];

// --- CDS Types ---
type CdsSuggestions = {
  differentials: Array<{ diagnosis: string; rationale: string; dosha: string }>;
  interactions: string[];
  classical_refs: string[];
  red_flags: string[];
};

// --- Drug Interaction Check Types ---
type InteractionResult = {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
  recommendation: string;
  system1?: string;
  system2?: string;
};

const HmsAiHub = () => {
  // AI Query state
  const [queryText, setQueryText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // CDS state
  const [cdsInput, setCdsInput] = useState({ chief_complaint: "", history: "", examination: "", assessment: "", prescription: "", prakriti: "" });
  const [cdsResult, setCdsResult] = useState<CdsSuggestions | null>(null);
  const [cdsLoading, setCdsLoading] = useState(false);

  // Drug interaction check state
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [interactionResults, setInteractionResults] = useState<InteractionResult[]>([]);
  const [interactionLoading, setInteractionLoading] = useState(false);

  // Feedback state
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});

  // --- Real AI Query (calls ai-gateway) ---
  const handleAiQuery = async () => {
    if (!queryText.trim()) return;
    setIsThinking(true);
    setAiResponse("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "ai-hub-query",
          system: `You are Ayuzee's senior AYUSH clinical intelligence assistant. You help doctors with:
- Differential diagnosis (Ayurvedic dosha-based + modern)
- Treatment protocol suggestions (Panchakarma, formulations, lifestyle)
- Drug/herb interaction analysis
- Classical reference lookup (Charaka, Sushruta, Ashtanga Hridaya)
- Lab interpretation with Ayurvedic correlation

Always cite classical references where applicable. Use markdown formatting. End with a confidence level and a note that clinical judgment remains primary.`,
          prompt: queryText,
          max_tokens: 1500,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiResponse(data?.response || "No response received.");
      toast.success("AI analysis complete");
    } catch (e: any) {
      toast.error(e.message || "AI query failed");
      setAiResponse("");
    } finally {
      setIsThinking(false);
    }
  };

  // --- Real CDS (calls ai-cds edge function) ---
  const runCDS = async () => {
    if (!cdsInput.chief_complaint.trim() && !cdsInput.assessment.trim()) {
      return toast.error("Enter at least a chief complaint or assessment");
    }
    setCdsLoading(true);
    setCdsResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-cds", {
        body: cdsInput,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCdsResult(data?.suggestions || null);
      toast.success("Clinical suggestions ready");
    } catch (e: any) {
      toast.error(e.message || "CDS analysis failed");
    } finally {
      setCdsLoading(false);
    }
  };

  // --- Real Drug Interaction Check (calls ai-gateway) ---
  const checkInteraction = async () => {
    if (!drug1.trim() || !drug2.trim()) return toast.error("Enter both drugs/herbs to check");
    setInteractionLoading(true);
    setInteractionResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "drug-interaction-check",
          system: `You are an AYUSH pharmacology expert specializing in cross-system drug interactions (Ayurveda, Homeopathy, Siddha, Unani, and Allopathy). Analyze the interaction between the given substances. Consider:
- Pharmacological interactions (modern evidence)
- Viruddha Ahara / incompatible combinations (Ayurvedic principles)
- Rasa-Guna-Veerya-Vipaka analysis
- Classical references (Charaka, Sushruta, Bhavaprakasha)
Return STRICT JSON matching the schema.`,
          prompt: `Check interaction between: "${drug1.trim()}" and "${drug2.trim()}". Include severity, mechanism, and clinical recommendation.`,
          response_schema: {
            name: "drug_interactions",
            description: "Drug/herb interaction analysis results",
            parameters: {
              type: "object",
              properties: {
                interactions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      drug1: { type: "string" },
                      drug2: { type: "string" },
                      severity: { type: "string", enum: ["high", "moderate", "low"] },
                      description: { type: "string" },
                      recommendation: { type: "string" },
                      system1: { type: "string" },
                      system2: { type: "string" },
                    },
                    required: ["drug1", "drug2", "severity", "description", "recommendation"],
                  },
                },
              },
              required: ["interactions"],
            },
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const results = data?.result?.interactions || [];
      setInteractionResults(results);
      if (results.length === 0) toast.info("No significant interactions found");
      else toast.success(`Found ${results.length} interaction(s)`);
    } catch (e: any) {
      toast.error(e.message || "Interaction check failed");
    } finally {
      setInteractionLoading(false);
    }
  };

  // --- Feedback handler ---
  const submitFeedback = async (featureId: string, type: "up" | "down") => {
    setFeedbackGiven((prev) => ({ ...prev, [featureId]: type }));
    try {
      await supabase.from("ai_feedback" as any).insert({
        feature: featureId,
        rating: type === "up" ? 1 : -1,
        context: { query: queryText, cds_input: cdsInput },
      });
    } catch {
      // Best-effort feedback logging
    }
    toast.success(type === "up" ? "Thanks for the positive feedback!" : "Noted — we'll improve this");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" /> AI Intelligence Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Diagnosis assist · Drug interactions · Treatment AI · Predictive analytics · Clinical decision support
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
          <Sparkles className="h-3 w-3 mr-1" /> All AI Systems Online
        </Badge>
      </div>

      {/* AI Modules Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {aiModules.slice(0, 4).map((m) => (
          <Card key={m.id} className="hover:shadow-md transition cursor-pointer">
            <CardContent className="p-3 text-center">
              <div className="text-purple-600 mx-auto w-fit">{m.icon}</div>
              <p className="text-xs font-medium mt-1">{m.name}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{m.usageToday} uses today</span>
                <Badge variant="outline" className="text-[9px] text-green-600">{m.accuracy}%</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cds">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="cds">Clinical Decision Support</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="query">AI Query</TabsTrigger>
          <TabsTrigger value="modules">All Modules</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
        </TabsList>

        {/* Real CDS — Clinical Decision Support */}
        <TabsContent value="cds" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" /> AI Clinical Decision Support
              </CardTitle>
              <p className="text-xs text-muted-foreground">Enter patient details to get AI-powered differential diagnosis, interaction warnings, classical references, and red flags.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Chief Complaint *</label>
                  <Input placeholder="e.g. Bilateral knee pain, morning stiffness" value={cdsInput.chief_complaint} onChange={(e) => setCdsInput((p) => ({ ...p, chief_complaint: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium">Prakriti</label>
                  <Input placeholder="e.g. Vata-Kapha" value={cdsInput.prakriti} onChange={(e) => setCdsInput((p) => ({ ...p, prakriti: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">History</label>
                <Textarea placeholder="Patient history..." rows={2} value={cdsInput.history} onChange={(e) => setCdsInput((p) => ({ ...p, history: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Examination Findings</label>
                  <Textarea placeholder="Nadi, Jihva, joint examination..." rows={2} value={cdsInput.examination} onChange={(e) => setCdsInput((p) => ({ ...p, examination: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium">Assessment / Diagnosis</label>
                  <Textarea placeholder="e.g. Sandhivata" rows={2} value={cdsInput.assessment} onChange={(e) => setCdsInput((p) => ({ ...p, assessment: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Current/Proposed Prescription</label>
                <Textarea placeholder="e.g. Yogaraja Guggulu 2 tabs BD, Rasnasaptakam Kashayam 15ml BD" rows={2} value={cdsInput.prescription} onChange={(e) => setCdsInput((p) => ({ ...p, prescription: e.target.value }))} />
              </div>
              <Button onClick={runCDS} disabled={cdsLoading}>
                {cdsLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Brain className="mr-1 h-4 w-4" />}
                {cdsLoading ? "Analyzing..." : "Get Clinical Suggestions"}
              </Button>
            </CardContent>
          </Card>

          {/* CDS Results */}
          {cdsResult && (
            <div className="space-y-3">
              {/* Differentials */}
              {cdsResult.differentials?.length > 0 && (
                <Card className="border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Stethoscope className="h-4 w-4 text-purple-600" /> Differential Diagnoses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cdsResult.differentials.map((d, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-purple-50/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{d.diagnosis}</span>
                            <Badge variant="outline" className="text-[10px]">{d.dosha}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{d.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interactions */}
              {cdsResult.interactions?.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Interaction Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cdsResult.interactions.map((w, i) => (
                        <div key={i} className="p-2 rounded border border-red-200 bg-red-50/30 text-xs text-red-800">{w}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Classical References */}
              {cdsResult.classical_refs?.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-amber-600" /> Classical References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {cdsResult.classical_refs.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Red Flags */}
              {cdsResult.red_flags?.length > 0 && (
                <Card className="border-red-300 bg-red-50/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Red Flags — When to Refer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {cdsResult.red_flags.map((f, i) => (
                        <div key={i} className="p-2 rounded border border-red-200 bg-red-50 text-xs text-red-800 font-medium">⚠️ {f}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <Button size="sm" variant={feedbackGiven["cds"] === "up" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("cds", "up")} disabled={!!feedbackGiven["cds"]}>
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant={feedbackGiven["cds"] === "down" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("cds", "down")} disabled={!!feedbackGiven["cds"]}>
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Drug Interactions — Real AI Check */}
        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-purple-600" /> AI Drug / Herb Interaction Checker
              </CardTitle>
              <p className="text-xs text-muted-foreground">Cross-system analysis: Ayurveda × Allopathy × Homeopathy × Siddha × Unani. Powered by AI with classical Ayurvedic and modern pharmacology references.</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input placeholder="Drug/Herb 1 (e.g. Ashwagandha)" value={drug1} onChange={(e) => setDrug1(e.target.value)} className="flex-1" />
                <span className="self-center text-muted-foreground font-bold hidden sm:block">×</span>
                <Input placeholder="Drug/Herb 2 (e.g. Levothyroxine)" value={drug2} onChange={(e) => setDrug2(e.target.value)} className="flex-1" />
                <Button onClick={checkInteraction} disabled={interactionLoading}>
                  {interactionLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
                  {interactionLoading ? "Checking..." : "Check"}
                </Button>
              </div>

              {/* Quick check suggestions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <p className="text-xs text-muted-foreground w-full">Quick checks:</p>
                {[
                  ["Guggulu", "Warfarin"],
                  ["Ashwagandha", "Levothyroxine"],
                  ["Triphala", "Metformin"],
                  ["Brahmi", "SSRIs"],
                  ["Ksheerabala Taila", "Atorvastatin"],
                ].map(([a, b]) => (
                  <Button key={`${a}-${b}`} variant="outline" size="sm" className="text-xs h-7" onClick={() => { setDrug1(a); setDrug2(b); }}>
                    {a} × {b}
                  </Button>
                ))}
              </div>

              {/* Results */}
              {interactionResults.length > 0 && (
                <div className="space-y-3">
                  {interactionResults.map((inter, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      inter.severity === "high" ? "border-red-300 bg-red-50/30" :
                      inter.severity === "moderate" ? "border-amber-300 bg-amber-50/30" :
                      "border-green-200 bg-green-50/20"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {inter.system1 && <Badge variant="outline" className="text-xs">{inter.system1}</Badge>}
                          <span className="text-sm font-medium">{inter.drug1}</span>
                          <span className="text-muted-foreground">×</span>
                          {inter.system2 && <Badge variant="outline" className="text-xs">{inter.system2}</Badge>}
                          <span className="text-sm font-medium">{inter.drug2}</span>
                        </div>
                        <Badge variant={inter.severity === "high" ? "destructive" : inter.severity === "moderate" ? "default" : "secondary"} className="text-[10px] capitalize">
                          {inter.severity} risk
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{inter.description}</p>
                      <div className="mt-2 p-2 rounded bg-white/70 border">
                        <p className="text-xs"><span className="font-medium text-blue-700">Recommendation:</span> {inter.recommendation}</p>
                      </div>
                    </div>
                  ))}

                  {/* Feedback */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Accurate?</span>
                    <Button size="sm" variant={feedbackGiven["interaction"] === "up" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("interaction", "up")} disabled={!!feedbackGiven["interaction"]}>
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant={feedbackGiven["interaction"] === "down" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("interaction", "down")} disabled={!!feedbackGiven["interaction"]}>
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-3 flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">AI-Powered Cross-System Analysis</p>
                <p className="text-blue-600 mt-0.5">
                  This checker uses AI trained on classical AYUSH texts (Charaka Samhita, Sushruta Samhita, Bhavaprakasha Nighantu, Rasa Tarangini) and modern pharmacology databases. Always verify with clinical judgment.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Query */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-600" /> Ask AI — Clinical Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask anything clinical... e.g., 'Best Panchakarma protocol for Vata-predominant RA patient on Methotrexate?' or 'Suggest differential diagnosis for chronic fatigue with Pitta constitution'"
                  rows={3}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAiQuery} disabled={isThinking || !queryText.trim()}>
                    {isThinking ? <Clock className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                    {isThinking ? "Analyzing..." : "Ask AI"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setQueryText("Patient with Vata Prakriti presenting with bilateral knee pain, morning stiffness >1hr, elevated ESR. Currently on Methotrexate 15mg weekly. What Ayurvedic adjunct therapy is safe?")}>
                    Example Query
                  </Button>
                </div>

                {aiResponse && (
                  <div className="mt-4 p-4 rounded-lg border bg-purple-50/30 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">AI Response</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant={feedbackGiven["query"] === "up" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("query", "up")} disabled={!!feedbackGiven["query"]}>
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant={feedbackGiven["query"] === "down" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("query", "down")} disabled={!!feedbackGiven["query"]}>
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 italic">⚠️ AI-assisted guidance — clinical judgment of the treating physician remains primary.</p>
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Quick Queries:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Check drug interaction",
                      "Suggest treatment protocol",
                      "Interpret lab report",
                      "Prakriti-based diet plan",
                      "Differential diagnosis",
                      "Panchakarma contraindications",
                    ].map((q) => (
                      <Button key={q} variant="outline" size="sm" className="text-xs h-7" onClick={() => setQueryText(q)}>
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Modules */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiModules.map((m) => (
              <Card key={m.id} className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 grid place-items-center text-purple-600 shrink-0">
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{m.name}</p>
                        <Badge variant={m.status === "active" ? "outline" : m.status === "beta" ? "default" : "secondary"} className={`text-[10px] capitalize ${m.status === "active" ? "text-green-600" : ""}`}>
                          {m.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3" /> {m.usageToday} uses today
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" /> {m.accuracy}% accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">AI Usage This Month</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { module: "Clinical Decision Support", calls: 1850, trend: "+12%" },
                    { module: "Drug Interaction Checks", calls: 1340, trend: "+25%" },
                    { module: "Diagnosis Assist", calls: 840, trend: "+8%" },
                    { module: "Lab Interpretation", calls: 660, trend: "+15%" },
                    { module: "Treatment Recommendations", calls: 540, trend: "+5%" },
                    { module: "AI Scribe (Dictation)", calls: 450, trend: "+45%" },
                    { module: "Predictive Analytics", calls: 360, trend: "+30%" },
                    { module: "Vitals Trend Analysis", calls: 240, trend: "New" },
                  ].map((item) => (
                    <div key={item.module} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{item.module}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.calls.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[10px] text-green-600">{item.trend}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">AI Impact Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: "Drug Interactions Prevented", value: "23", impact: "Potential ADRs avoided", color: "text-red-600" },
                    { metric: "Avg. Diagnosis Time Reduced", value: "40%", impact: "Faster treatment initiation", color: "text-blue-600" },
                    { metric: "No-Shows Prevented (AI calls)", value: "67", impact: "₹3.2L revenue saved", color: "text-green-600" },
                    { metric: "Documentation Time Saved", value: "120 hrs", impact: "AI Scribe efficiency", color: "text-purple-600" },
                    { metric: "Readmissions Prevented", value: "8", impact: "AI follow-up alerts", color: "text-amber-600" },
                    { metric: "Cost Optimization Suggestions", value: "₹4.5L", impact: "Generic substitution + stock AI", color: "text-green-600" },
                  ].map((item) => (
                    <div key={item.metric} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.metric}</span>
                        <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsAiHub;
