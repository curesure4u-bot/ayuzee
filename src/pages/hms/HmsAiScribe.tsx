import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Mic, MicOff, Play, Pause, RotateCcw, Save, Send,
  Languages, Pill, FileText, Clock, Sparkles, Volume2,
  CheckCircle, AlertCircle,
} from "lucide-react";

type TranscriptSegment = {
  id: string;
  speaker: "doctor" | "patient";
  text: string;
  timestamp: string;
  language: string;
};

type GeneratedNote = {
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string;
  prescription: string[];
  advice: string;
  followUp: string;
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

const HmsAiScribe = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState("hi");
  const [medSystem, setMedSystem] = useState("ayurveda");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [patientName, setPatientName] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [transcript, setTranscript] = useState<TranscriptSegment[]>([
    { id: "1", speaker: "doctor", text: "Namaste, aaj kya problem hai aapko?", timestamp: "00:00", language: "hi" },
    { id: "2", speaker: "patient", text: "Doctor sahab, mere dono ghutno mein bahut dard hai, 2 saal se. Subah uthte waqt bahut stiffness hoti hai.", timestamp: "00:05", language: "hi" },
    { id: "3", speaker: "doctor", text: "Kab se hai ye? Koi dawai li hai pehle?", timestamp: "00:18", language: "hi" },
    { id: "4", speaker: "patient", text: "Pehle allopathy ki dawai khata tha but pet kharab hota tha. Isliye Ayurveda try karna hai.", timestamp: "00:25", language: "hi" },
    { id: "5", speaker: "doctor", text: "Theek hai. Nadi pariksha karte hain. Aapki Prakruti Vata-Kapha lag rahi hai. Agni mandh hai. Sandhivata ka diagnosis hai.", timestamp: "00:40", language: "hi" },
  ]);

  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>({
    chiefComplaint: "Bilateral knee joint pain with morning stiffness since 2 years, worsening recently",
    history: "Patient reports bilateral knee pain for 2 years. Morning stiffness lasting 20-30 minutes. Previous allopathic treatment caused GI side effects. No history of trauma. No family history of RA.",
    examination: "Nadi Pariksha: Vata-dominant pulse. Prakruti: Vata-Kapha. Agni: Manda (sluggish). Joint examination: Crepitus bilateral knee, tenderness medial joint line, ROM limited to 100° flexion.",
    diagnosis: "Sandhivata (Osteoarthritis - Bilateral Knee) | Vata Vriddhi with Manda Agni",
    prescription: [
      "Yogaraja Guggulu 2 tabs TDS - After food with warm water - 30 days",
      "Rasnasaptakam Kashayam 15ml BD - Before food - 30 days",
      "Dhanwantharam Tailam - External application to knees - Daily",
      "Janu Basti with Kottamchukkadi Tailam - 7 days course",
    ],
    advice: "Avoid cold food, curd, heavy meals. Take warm water regularly. Gentle knee exercises daily. Apply warm sesame oil before bath.",
    followUp: "Review after 15 days with ESR, CRP reports",
  });

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    toast.success("Recording started. Speak naturally with your patient.");
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success("Recording stopped. AI is processing your consultation...");
  };

  const resetRecording = () => {
    setDuration(0);
    setTranscript([]);
    setGeneratedNote(null);
    toast.info("Session reset");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-violet-600" /> AI Scribe
          </h1>
          <p className="text-sm text-muted-foreground">
            Voice-to-prescription · Consult naturally in 15+ Indian languages · AYUSH terminology aware
          </p>
        </div>
        <Badge className="bg-violet-100 text-violet-700 border-violet-300">
          Save 12+ hours/week
        </Badge>
      </div>

      {/* Configuration Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div>
              <Label>Patient</Label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name" />
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
              <Select defaultValue="en">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="same">Same as consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
              <Label className="text-xs">Auto-generate notes</Label>
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
                {isRecording ? (isPaused ? "Paused" : "Recording...") : "Ready to record"}
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

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button size="lg" onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full h-14 w-14">
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={pauseRecording}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button size="lg" onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full h-14 w-14">
                    <MicOff className="h-6 w-6" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetRecording}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center max-w-md">
              Speak naturally with your patient. AI will identify speakers, transcribe in real-time, and auto-detect AYUSH medical terms like Dosha, Prakruti, Kashayam etc.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transcript & Generated Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Transcript */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4" /> Live Transcript
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {LANGUAGES.find((l) => l.code === language)?.name} → English
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {transcript.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-8 w-8 mx-auto opacity-20" />
                <p className="text-sm mt-2">Start recording to see live transcription</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transcript.map((seg) => (
                  <div key={seg.id} className={`flex gap-3 ${seg.speaker === "doctor" ? "" : "flex-row-reverse"}`}>
                    <div className={`shrink-0 h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${
                      seg.speaker === "doctor" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {seg.speaker === "doctor" ? "Dr" : "Pt"}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 text-sm ${
                      seg.speaker === "doctor" ? "bg-blue-50 border border-blue-100" : "bg-green-50 border border-green-100"
                    }`}>
                      <p>{seg.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{seg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Generated Clinical Notes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" /> AI Generated Notes
              </CardTitle>
              {generatedNote && <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" /> Generated
              </Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedNote ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto opacity-20" />
                <p className="text-sm mt-2">Notes will be auto-generated after recording</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto text-sm">
                <Section title="Chief Complaint" content={generatedNote.chiefComplaint} />
                <Section title="History" content={generatedNote.history} />
                <Section title="Examination" content={generatedNote.examination} />
                <Section title="Diagnosis" content={generatedNote.diagnosis} highlight />
                <div>
                  <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">Prescription</p>
                  <div className="space-y-1">
                    {generatedNote.prescription.map((rx, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-emerald-50 border border-emerald-100">
                        <Pill className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="text-xs">{rx}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Section title="Advice" content={generatedNote.advice} />
                <Section title="Follow-up" content={generatedNote.followUp} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {generatedNote && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Prescription saved to EMR")}>
                <Save className="mr-1 h-4 w-4" /> Save to EMR
              </Button>
              <Button variant="outline" onClick={() => toast.success("Prescription sent via WhatsApp")}>
                <Send className="mr-1 h-4 w-4" /> Send via WhatsApp
              </Button>
              <Button variant="outline" onClick={() => toast.info("Printing prescription...")}>
                <FileText className="mr-1 h-4 w-4" /> Print Prescription
              </Button>
              <Button variant="outline" onClick={() => toast.success("Shared via ABDM")}>
                Share via ABDM
              </Button>
              <Button variant="ghost" onClick={resetRecording}>
                <RotateCcw className="mr-1 h-4 w-4" /> New Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
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

const Section = ({ title, content, highlight }: { title: string; content: string; highlight?: boolean }) => (
  <div>
    <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
    <p className={`text-sm ${highlight ? "font-medium text-primary" : ""}`}>{content}</p>
  </div>
);

export default HmsAiScribe;
