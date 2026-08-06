import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Upload, Camera, Eye, Droplets, Save, GitCompare,
  Loader2, AlertTriangle, ThumbsUp, ThumbsDown,
} from "lucide-react";

type TongueAnalysis = {
  color: { finding: string; interpretation: string };
  coating: { finding: string; interpretation: string };
  shape: { finding: string; interpretation: string };
  moisture: { finding: string; interpretation: string };
  cracks: { finding: string; interpretation: string };
  dosha_assessment: string;
  ama_status: string;
  agni_status: string;
  recommendations: string[];
  correlations: string[];
  confidence: string;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const DoctorJihva = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TongueAnalysis | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(null);
    setFeedbackGiven("");
    // Auto-analyze
    analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const mime = file.type || "image/jpeg";

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "jihva-pareeksha",
          system: `You are an expert Ayurvedic physician performing Jihva Pareeksha (tongue diagnosis). Analyze the tongue image and assess:
1. Color (Varna) — pale/red/bluish/yellow and its dosha significance
2. Coating (Upadeha) — thin/thick/white/yellow/absent and Ama indication
3. Shape (Aakruti) — swollen/thin/teeth marks/pointed and dosha correlation
4. Moisture (Snigdhata) — dry/moist/excessive and Vata/Kapha indication
5. Cracks (Vidarana) — pattern and Vata/Pitta significance
6. Overall Dosha assessment
7. Ama (toxin) status
8. Agni (digestive fire) assessment
9. Treatment recommendations based on findings
10. Correlation with other Pareekshas (Nadi, Mala, Mutra)

Be specific and clinical. Base analysis on visible features only — do not fabricate findings.`,
          prompt: "Analyze this tongue image for Jihva Pareeksha. Provide structured Ayurvedic assessment.",
          attachments: [{ mime, data_base64: base64, filename: file.name }],
          max_tokens: 1200,
          response_schema: {
            name: "jihva_analysis",
            description: "Structured Jihva Pareeksha analysis",
            parameters: {
              type: "object",
              properties: {
                color: {
                  type: "object",
                  properties: { finding: { type: "string" }, interpretation: { type: "string" } },
                  required: ["finding", "interpretation"],
                },
                coating: {
                  type: "object",
                  properties: { finding: { type: "string" }, interpretation: { type: "string" } },
                  required: ["finding", "interpretation"],
                },
                shape: {
                  type: "object",
                  properties: { finding: { type: "string" }, interpretation: { type: "string" } },
                  required: ["finding", "interpretation"],
                },
                moisture: {
                  type: "object",
                  properties: { finding: { type: "string" }, interpretation: { type: "string" } },
                  required: ["finding", "interpretation"],
                },
                cracks: {
                  type: "object",
                  properties: { finding: { type: "string" }, interpretation: { type: "string" } },
                  required: ["finding", "interpretation"],
                },
                dosha_assessment: { type: "string" },
                ama_status: { type: "string" },
                agni_status: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } },
                correlations: { type: "array", items: { type: "string" } },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["color", "coating", "shape", "moisture", "cracks", "dosha_assessment", "ama_status", "agni_status", "recommendations", "correlations", "confidence"],
            },
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data?.result as TongueAnalysis;
      if (!result?.color) throw new Error("AI did not return valid analysis");
      setAnalysis(result);
      toast.success("Jihva Pareeksha AI analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed. Please try with a clearer image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImageFile(null);
    setImagePreview("");
    setAnalysis(null);
    setFeedbackGiven("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Eye className="h-6 w-6 text-pink-600" />
            Jihva Pareeksha — Tongue Assessment (AI)
          </CardTitle>
          <p className="text-muted-foreground">
            Upload a tongue photo for AI-powered Jihva Pareeksha with dosha, Ama, and Agni analysis.
          </p>
        </CardHeader>
        <CardContent>
          {!imagePreview && !analyzing && (
            <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex justify-center gap-4">
                <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Upload Tongue Photo
                </Button>
                <Button variant="outline" onClick={() => { fileInputRef.current?.setAttribute("capture", "environment"); fileInputRef.current?.click(); }} className="gap-2">
                  <Camera className="h-4 w-4" /> Capture Photo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ensure good lighting. Tongue should be fully extended without strain. Natural daylight preferred.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-pink-600" />
              <p className="text-lg font-medium">AI analyzing tongue characteristics...</p>
              <p className="text-sm text-muted-foreground">Assessing Varna, Upadeha, Aakruti, Snigdhata, Vidarana</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <Card>
              <CardHeader><CardTitle>Tongue Image</CardTitle></CardHeader>
              <CardContent>
                {imagePreview ? (
                  <img src={imagePreview} alt="Tongue" className="rounded-lg w-full h-64 object-cover border" />
                ) : (
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border">
                    <Eye className="h-12 w-12 opacity-30" />
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-3" onClick={reset}>
                  Upload New Image
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Analysis Results</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Confidence: {analysis.confidence}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  color: analysis.color,
                  coating: analysis.coating,
                  shape: analysis.shape,
                  moisture: analysis.moisture,
                  cracks: analysis.cracks,
                }).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-sm text-muted-foreground">{value.finding}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2 max-w-[160px] text-right">
                      {value.interpretation}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Dosha Interpretation */}
          <Card>
            <CardHeader><CardTitle>Dosha Interpretation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-amber-900">{analysis.dosha_assessment}</p>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  <p className="text-sm text-amber-700"><strong>Ama Status:</strong> {analysis.ama_status}</p>
                  <p className="text-sm text-amber-700"><strong>Agni Status:</strong> {analysis.agni_status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Correlation with Other Pareekshas</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {analysis.correlations.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 shrink-0">{i + 1}</Badge>
                      <span className="text-sm">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => toast.success("Saved to case sheet")} className="gap-2">
                  <Save className="h-4 w-4" /> Save to Case Sheet
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" /> New Assessment
                </Button>
                {/* Feedback */}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Accurate?</span>
                  <Button size="sm" variant={feedbackGiven === "up" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => setFeedbackGiven("up")} disabled={!!feedbackGiven}>
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant={feedbackGiven === "down" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => setFeedbackGiven("down")} disabled={!!feedbackGiven}>
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>AI-assisted Jihva Pareeksha — verify findings with clinical examination. Image quality and lighting affect accuracy.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorJihva;
