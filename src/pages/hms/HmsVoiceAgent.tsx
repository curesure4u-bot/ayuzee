import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  Bot, Globe, Activity, Users, CheckCircle, Clock,
  MessageSquare, Calendar, Pill, AlertTriangle, Sparkles,
  Radio, Waves
} from "lucide-react";

type VoiceSession = {
  id: string;
  patient_name: string;
  language: string;
  duration: string;
  outcome: string;
  status: "completed" | "active" | "dropped";
  time: string;
  transcript_preview: string;
};

const recentSessions: VoiceSession[] = [
  { id: "1", patient_name: "Rajesh Kumar", language: "Hindi", duration: "3:42", outcome: "Appointment Booked", status: "completed", time: "10:15 AM", transcript_preview: "Patient asked about availability for Panchakarma consultation tomorrow..." },
  { id: "2", patient_name: "Priya Sharma", language: "Tamil", duration: "2:18", outcome: "Symptom Collected", status: "completed", time: "09:45 AM", transcript_preview: "Patient reported headache for 3 days with mild fever. Recommended consultation..." },
  { id: "3", patient_name: "Unknown Caller", language: "English", duration: "1:05", outcome: "Information Provided", status: "completed", time: "09:20 AM", transcript_preview: "Caller asked about clinic timings and Panchakarma package pricing..." },
  { id: "4", patient_name: "Meera Devi", language: "Hindi", duration: "0:45", outcome: "Reminder Acknowledged", status: "completed", time: "08:30 AM", transcript_preview: "Outbound: Medicine reminder. Patient confirmed she took morning dose..." },
  { id: "5", patient_name: "Active Call", language: "Tamil", duration: "1:23+", outcome: "—", status: "active", time: "Now", transcript_preview: "Patient describing joint pain symptoms..." },
];

const languageOptions = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "ta", label: "Tamil", flag: "🇮🇳" },
  { value: "te", label: "Telugu", flag: "🇮🇳" },
  { value: "kn", label: "Kannada", flag: "🇮🇳" },
  { value: "ml", label: "Malayalam", flag: "🇮🇳" },
  { value: "mr", label: "Marathi", flag: "🇮🇳" },
  { value: "gu", label: "Gujarati", flag: "🇮🇳" },
  { value: "bn", label: "Bengali", flag: "🇮🇳" },
];

const HmsVoiceAgent = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [language, setLanguage] = useState("en");
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setLiveTranscript(["🤖 Namaste! I'm your Ayuzee health assistant. How can I help you today?"]);
    intervalRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    toast.success("Voice agent active — speak naturally in your preferred language");

    // Simulate AI responses
    setTimeout(() => setLiveTranscript(prev => [...prev, "👤 I've been having headaches for the past 3 days..."]), 3000);
    setTimeout(() => setLiveTranscript(prev => [...prev, "🤖 I'm sorry to hear that. Can you tell me — is the headache constant or does it come and go?"]), 5000);
    setTimeout(() => setLiveTranscript(prev => [...prev, "👤 It comes and goes, mostly in the evening..."]), 8000);
    setTimeout(() => setLiveTranscript(prev => [...prev, "🤖 Got it. Any other symptoms like fever, nausea, or vision changes?"]), 10000);
  };

  const endCall = () => {
    setIsCallActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setLiveTranscript(prev => [...prev, "🤖 Thank you for calling! I've noted your symptoms and booked a consultation with Dr. Saleem for tomorrow at 10 AM. Get well soon! 🙏"]);
    toast.success("Call ended. Symptoms captured. Appointment auto-booked.");
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const stats = { total: 156, today: 12, avgDuration: "2:45", appointmentsBooked: 8, satisfaction: 4.3 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" /> Voice Agent (AI-Powered)
          </h1>
          <p className="text-sm text-muted-foreground">
            WebRTC voice bot — Patients speak in Indian languages, AI handles booking, symptoms, reminders
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/medassist"}>Chat Bot</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/patient/call-center"}>Call Center</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Calls</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.today}</p><p className="text-xs text-muted-foreground">Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.appointmentsBooked}</p><p className="text-xs text-muted-foreground">Appointments Booked</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.avgDuration}</p><p className="text-xs text-muted-foreground">Avg Duration</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.satisfaction}/5</p><p className="text-xs text-muted-foreground">Satisfaction</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Agent Control Panel */}
        <Card className={`border-2 ${isCallActive ? "border-green-400 bg-green-50/30" : "border-muted"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isCallActive ? <Radio className="h-4 w-4 text-green-600 animate-pulse" /> : <Bot className="h-4 w-4" />}
              Voice Agent {isCallActive ? "— Active Call" : "— Ready"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language selector */}
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.flag} {l.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Patient speaks in this language</span>
            </div>

            {/* Call controls */}
            <div className="flex items-center justify-center gap-4 py-6">
              {!isCallActive ? (
                <Button size="lg" className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700" onClick={startCall}>
                  <Phone className="h-7 w-7" />
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="outline" className={`h-12 w-12 rounded-full ${isMuted ? "bg-red-100" : ""}`}
                    onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button size="lg" className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700" onClick={endCall}>
                    <PhoneOff className="h-7 w-7" />
                  </Button>
                  <Button size="lg" variant="outline" className={`h-12 w-12 rounded-full ${!isSpeakerOn ? "bg-gray-100" : ""}`}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}>
                    {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </Button>
                </>
              )}
            </div>

            {isCallActive && (
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-green-700">{formatDuration(callDuration)}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Waves key={i} className="h-4 w-4 text-green-500 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Live Transcript */}
            {liveTranscript.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-white space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Live Transcript</p>
                {liveTranscript.map((line, i) => (
                  <p key={i} className={`text-xs ${line.startsWith("🤖") ? "text-primary" : "text-foreground"}`}>{line}</p>
                ))}
              </div>
            )}

            {/* Capabilities */}
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px]"><Calendar className="h-2.5 w-2.5 mr-0.5" /> Book Appointments</Badge>
              <Badge variant="outline" className="text-[10px]"><MessageSquare className="h-2.5 w-2.5 mr-0.5" /> Symptom Collection</Badge>
              <Badge variant="outline" className="text-[10px]"><Pill className="h-2.5 w-2.5 mr-0.5" /> Medicine Reminders</Badge>
              <Badge variant="outline" className="text-[10px]"><Activity className="h-2.5 w-2.5 mr-0.5" /> Follow-up Calls</Badge>
              <Badge variant="outline" className="text-[10px]"><Sparkles className="h-2.5 w-2.5 mr-0.5" /> 10+ Languages</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Voice Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSessions.map(session => (
              <div key={session.id} className={`rounded-lg border p-3 ${session.status === "active" ? "bg-green-50 border-green-200" : "hover:bg-muted/20"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.status === "active" ? <Radio className="h-3.5 w-3.5 text-green-600 animate-pulse" /> : <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                    <div>
                      <p className="text-sm font-medium">{session.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{session.language} · {session.duration} · {session.time}</p>
                    </div>
                  </div>
                  <Badge variant={session.status === "active" ? "default" : "outline"} className="text-xs">
                    {session.outcome}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 italic truncate">{session.transcript_preview}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">How Voice Agent Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <div className="text-center p-2 rounded bg-white border"><Phone className="h-5 w-5 mx-auto text-primary mb-1" /><p className="font-medium text-foreground">Patient Calls</p><p>Via phone, widget, or app</p></div>
            <div className="text-center p-2 rounded bg-white border"><Mic className="h-5 w-5 mx-auto text-primary mb-1" /><p className="font-medium text-foreground">AI Listens</p><p>Real-time speech-to-text in 10+ languages</p></div>
            <div className="text-center p-2 rounded bg-white border"><Bot className="h-5 w-5 mx-auto text-primary mb-1" /><p className="font-medium text-foreground">AI Responds</p><p>Natural voice, understands medical context</p></div>
            <div className="text-center p-2 rounded bg-white border"><CheckCircle className="h-5 w-5 mx-auto text-primary mb-1" /><p className="font-medium text-foreground">Action Taken</p><p>Books apt, logs symptoms, sends reminders</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsVoiceAgent;
