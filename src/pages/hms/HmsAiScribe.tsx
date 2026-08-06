import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Mic, MicOff, Play, Pause, RotateCcw, Save, Send, Upload,
  Pill, FileText, Clock, Sparkles, Volume2, Loader2,
  CheckCircle, ThumbsUp, ThumbsDown, AlertTriangle,
} from "lucide-react";

// --- Types ---
type EMR = {
  transcript?: string;
  chief_complaint?: string;
  history?: string;
  examination?: string;
  vitals?: { bp?: string; pulse?: string; temperature?: string; weight?: string; spo2?: string };
  assessment?: string;
  plan?: string;
  prescription?: string;
  advice?: string;
  follow_up_date?: string;
};

const LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "en", name: "English", native: "English" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "kok", name: "Konkani", native: "कोंकणी" },
];

const AYUSH_TERMS = [
  "Vata", "Pitta", "Kapha", "Prakruti", "Vikruti", "Agni", "Ama", "Ojas",
  "Dosha", "Dhatu", "Mala", "Srotas", "Panchakarma", "Abhyanga", "Shirodhara",
  "Vasti", "Nasya", "Virechana", "Vamana", "Guggulu", "Kashayam", "Arishtam",
  "Churnam", "Tailam", "Ghritam", "Lehyam", "Rasayanam", "Kwath",
];

// --- Helpers ---
const fileToBase64 = (blob: Blob): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// --- Component ---
const HmsAiScribe = () => {
  // Config
  const [language, setLanguage] = useState("hi");
  const [medSystem, setMedSystem] = useState("ayurveda");
  const [patientName, setPatientName] = useState("");
  const [outputLang, setOutputLang] = useState("en");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<"" | "audio" | "text">("");

  // Text input (alternative to voice)
  const [textInput, setTextInput] = useState("");

  // Results
  const [transcript, setTranscript] = useState("");
  const [emr, setEmr] = useState<EMR | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | "">("");

  // --- Recording Logic (Real MediaRecorder → ai-scribe) ---
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        processAudio(blob);
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setEmr(null);
      setTranscript("");
      setFeedbackGiven("");
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      toast.success("Recording started. Speak naturally with your patient.");
    } catch {
      toast.error("Microphone permission denied. Please allow access.");
    }
  }, [language]);

  const pauseRecording = () => {
    if (!mediaRecRef.current) return;
    if (isPaused) {
      mediaRecRef.current.resume();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      setIsPaused(false);
    } else {
      mediaRecRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetSession = () => {
    if (isRecording) {
      mediaRecRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setTranscript("");
    setEmr(null);
    setTextInput("");
    setFeedbackGiven("");
    toast.info("Session reset");
  };

  // --- Process Audio via ai-scribe Edge Function ---
  const processAudio = async (blob: Blob) => {
    setProcessing(true);
    setProcessingMode("audio");
    try {
      const audioBase64 = await fileToBase64(blob);
      const { data, error } = await supabase.functions.invoke("ai-scribe", {
        body: { mode: "audio", audioBase64, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data?.emr as EMR;
      setEmr(result);
      setTranscript(result?.transcript || "");
      toast.success("Audio transcribed & EMR generated");
    } catch (e: any) {
      toast.error(e.message || "AI Scribe processing failed");
    } finally {
      setProcessing(false);
      setProcessingMode("");
    }
  };

  // --- Process Text via ai-scribe Edge Function ---
  const processText = async () => {
    if (!textInput.trim()) return toast.error("Type or paste consultation notes first");
    setProcessing(true);
    setProcessingMode("text");
    setEmr(null);
    setTranscript("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-scribe", {
        body: { mode: "text", text: textInput.trim(), language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data?.emr as EMR;
      setEmr(result);
      setTranscript(result?.transcript || textInput.trim());
      toast.success("EMR generated from text");
    } catch (e: any) {
      toast.error(e.message || "AI Scribe text processing failed");
    } finally {
      setProcessing(false);
      setProcessingMode("");
    }
  };

  // --- Handle file upload ---
  const onAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAudio(file);
    e.target.value = "";
  };

  // --- Feedback ---
  const submitFeedback = async (type: "up" | "down") => {
    setFeedbackGiven(type);
    try {
      await (supabase as any).from("ai_feedback").insert({
        feature: "ai-scribe",
        rating: type === "up" ? 1 : -1,
        context: { language, medSystem, had_transcript: !!transcript },
      });
    } catch { /* best-effort */ }
    toast.success(type === "up" ? "Thanks for the feedback!" : "Noted — we'll improve");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-violet-600" /> AI Scribe
          </h1>
          <p className="text-sm text-muted-foreground">
            Voice-to-EMR · Consult naturally in 15+ Indian languages · AYUSH terminology aware
          </p>
        </div>
        <Badge className="bg-violet-100 text-violet-700 border-violet-300">
          Powered by Gemini 2.5 Pro
        </Badge>
      </div>

      {/* Configuration Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Patient</Label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name (optional)" />
            </div>
            <div>
              <Label>Consultation Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.native} ({l.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Medical System</Label>
              <Select value={medSystem} onValueChange={setMedSystem}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ayurveda">Ayurveda</SelectItem>
                  <SelectItem value="siddha">Siddha</SelectItem>
                  <SelectItem value="homeopathy">Homeopathy</SelectItem>
                  <SelectItem value="unani">Unani</SelectItem>
                  <SelectItem value="yoga">Yoga & Naturopathy</SelectItem>
                  <SelectItem value="integrative">Integrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Output Language</Label>
              <Select value={outputLang} onValueChange={setOutputLang}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="same">Same as consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Controls */}
      <Card className={isRecording ? "border-red-300 bg-red-50/20" : ""}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Timer */}
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-foreground">{formatTime(duration)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {processing ? `Processing ${processingMode}...` :
                 isRecording ? (isPaused ? "Paused" : "Recording...") : "Ready to record"}
              </p>
            </div>

            {/* Waveform Visualization */}
            {isRecording && !isPaused && (
              <div className="flex items-center gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Processing indicator */}
            {processing && (
              <div className="flex items-center gap-2 text-violet-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">AI is transcribing & generating EMR...</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <>
                  <Button size="lg" onClick={startRecording} disabled={processing} className="bg-red-600 hover:bg-red-700 text-white rounded-full h-14 w-14">
                    <Mic className="h-6 w-6" />
                  </Button>
                  <div className="relative">
                    <input type="file" accept="audio/*" onChange={onAudioFile} className="absolute inset-0 opacity-0 cursor-pointer" disabled={processing} />
                    <Button size="sm" variant="outline" disabled={processing}>
                      <Upload className="h-4 w-4 mr-1" /> Upload Audio
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={pauseRecording}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button size="lg" onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full h-14 w-14">
                    <MicOff className="h-6 w-6" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetSession}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center max-w-md">
              Speak naturally with your patient. AI will transcribe the conversation and auto-generate structured clinical notes (SOAP + Prescription).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Text Input Alternative */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Text Input (Alternative to Voice)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste or type consultation notes here... e.g. 'Patient complaining of bilateral knee pain since 2 years. Morning stiffness 30 min. Nadi: Vata dominant. Prakruti: Vata-Kapha. Diagnosis: Sandhivata. Rx: Yogaraja Guggulu 2 tabs BD...'"
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={processing}
          />
          <Button className="mt-2" onClick={processText} disabled={processing || !textInput.trim()}>
            {processing && processingMode === "text" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
            {processing && processingMode === "text" ? "Generating EMR..." : "Generate EMR from Text"}
          </Button>
        </CardContent>
      </Card>

      {/* Results: Transcript + Generated Notes */}
      {(transcript || emr) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Transcript */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Transcript
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {LANGUAGES.find((l) => l.code === language)?.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {transcript ? (
                <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="h-8 w-8 mx-auto opacity-20" />
                  <p className="text-sm mt-2">Transcript will appear here after processing</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Generated Clinical Notes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" /> AI Generated EMR
                </CardTitle>
                {emr && (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" /> Generated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!emr ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto opacity-20" />
                  <p className="text-sm mt-2">EMR will be auto-generated after recording</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto text-sm">
                  {emr.chief_complaint && <Section title="Chief Complaint" content={emr.chief_complaint} />}
                  {emr.history && <Section title="History" content={emr.history} />}
                  {emr.examination && <Section title="Examination" content={emr.examination} />}
                  {emr.vitals && Object.values(emr.vitals).some(Boolean) && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">Vitals</p>
                      <div className="grid grid-cols-3 gap-2">
                        {emr.vitals.bp && <span className="text-xs bg-blue-50 p-1 rounded">BP: {emr.vitals.bp}</span>}
                        {emr.vitals.pulse && <span className="text-xs bg-blue-50 p-1 rounded">Pulse: {emr.vitals.pulse}</span>}
                        {emr.vitals.temperature && <span className="text-xs bg-blue-50 p-1 rounded">Temp: {emr.vitals.temperature}</span>}
                        {emr.vitals.weight && <span className="text-xs bg-blue-50 p-1 rounded">Wt: {emr.vitals.weight}</span>}
                        {emr.vitals.spo2 && <span className="text-xs bg-blue-50 p-1 rounded">SpO2: {emr.vitals.spo2}</span>}
                      </div>
                    </div>
                  )}
                  {emr.assessment && <Section title="Assessment / Diagnosis" content={emr.assessment} highlight />}
                  {emr.plan && <Section title="Plan" content={emr.plan} />}
                  {emr.prescription && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">Prescription</p>
                      <div className="space-y-1">
                        {emr.prescription.split("\n").filter(Boolean).map((rx, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-emerald-50 border border-emerald-100">
                            <Pill className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="text-xs">{rx}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {emr.advice && <Section title="Advice (Pathya/Apathya)" content={emr.advice} />}
                  {emr.follow_up_date && <Section title="Follow-up" content={emr.follow_up_date} />}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {emr && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => toast.success("EMR saved (implement save-to-consultation)")}>
                <Save className="mr-1 h-4 w-4" /> Save to EMR
              </Button>
              <Button variant="outline" onClick={() => toast.info("Print functionality coming soon")}>
                <FileText className="mr-1 h-4 w-4" /> Print Prescription
              </Button>
              <Button variant="ghost" onClick={resetSession}>
                <RotateCcw className="mr-1 h-4 w-4" /> New Consultation
              </Button>

              {/* Feedback */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Quality?</span>
                <Button size="sm" variant={feedbackGiven === "up" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("up")} disabled={!!feedbackGiven}>
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant={feedbackGiven === "down" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => submitFeedback("down")} disabled={!!feedbackGiven}>
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {emr && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>AI-generated clinical notes — <strong>review and verify</strong> all content before signing off. The AI may misinterpret audio or hallucinate details. Clinical judgment of the treating physician is final.</p>
        </div>
      )}

      {/* AYUSH Term Recognition */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AYUSH Terminology Recognition</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            AI Scribe is trained to recognize and correctly transcribe AYUSH-specific medical terminology across all supported languages.
          </p>
          <div className="flex flex-wrap gap-1">
            {AYUSH_TERMS.map((term) => (
              <Badge key={term} variant="secondary" className="text-xs">{term}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Sub-components ---
const Section = ({ title, content, highlight }: { title: string; content: string; highlight?: boolean }) => (
  <div>
    <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
    <p className={`text-sm ${highlight ? "font-medium text-primary" : ""}`}>{content}</p>
  </div>
);

export default HmsAiScribe;
