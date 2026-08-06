import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Mic, MicOff, Brain, CheckCircle, Edit, Pill } from "lucide-react";

const mockTranscript = "Patient has joint pain and morning stiffness for 2 months. Give Simhanada Guggulu 2 tablets twice daily, Rasnasaptakam Kashayam 15 ml twice daily before food, and Ashwagandha churna 3 grams at night with milk. External application Kottamchukkadi Taila. Follow up after 30 days. Order ESR and CRP.";

const mockParsedRx = [
  { name: "Simhanada Guggulu", dose: "2 tablets", frequency: "BD (twice daily)", duration: "30 days", route: "Oral" },
  { name: "Rasnasaptakam Kashayam", dose: "15 ml", frequency: "BD before food", duration: "30 days", route: "Oral" },
  { name: "Ashwagandha Churna", dose: "3 grams", frequency: "HS (at night) with milk", duration: "30 days", route: "Oral" },
  { name: "Kottamchukkadi Taila", dose: "QS", frequency: "Daily", duration: "30 days", route: "External" },
];

const DoctorVoiceRx = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(false);

  const startRecording = () => { setIsRecording(true); toast.info("Listening... speak your prescription"); setTimeout(() => { setIsRecording(false); setTranscript(mockTranscript); toast.success("Voice captured. AI parsing..."); setTimeout(() => setParsed(true), 1000); }, 3000); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Mic className="h-6 w-6 text-red-500" /> Voice-to-Prescription (AI)</h1>
          <p className="text-muted-foreground mt-1">Speak naturally — AI converts your voice into a structured prescription</p>
        </div>
      </div>

      <Card className="text-center">
        <CardContent className="py-8">
          <button onClick={startRecording} disabled={isRecording} className={`h-24 w-24 rounded-full mx-auto grid place-items-center transition ${isRecording ? "bg-red-500 animate-pulse" : "bg-red-100 hover:bg-red-200"}`}>
            {isRecording ? <MicOff className="h-10 w-10 text-white" /> : <Mic className="h-10 w-10 text-red-500" />}
          </button>
          <p className="mt-3 text-sm text-muted-foreground">{isRecording ? "Recording... speak your prescription" : "Tap to start voice prescription"}</p>
        </CardContent>
      </Card>

      {transcript && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Voice Transcript</CardTitle></CardHeader>
          <CardContent><p className="text-sm bg-muted p-3 rounded italic">"{transcript}"</p></CardContent>
        </Card>
      )}

      {parsed && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI-Parsed Prescription</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Medicine</th><th className="p-2 text-left">Dose</th><th className="p-2 text-left">Frequency</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">Route</th></tr></thead>
              <tbody>{mockParsedRx.map((r, i) => <tr key={i} className="border-b"><td className="p-2 font-medium">{r.name}</td><td className="p-2">{r.dose}</td><td className="p-2">{r.frequency}</td><td className="p-2">{r.duration}</td><td className="p-2"><Badge variant="outline" className="text-[10px]">{r.route}</Badge></td></tr>)}</tbody>
            </table>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground mb-2">AI also detected: Follow-up: 30 days | Lab orders: ESR, CRP</p>
            <div className="flex gap-2">
              <Button onClick={() => toast.success("Prescription confirmed and saved")}><CheckCircle className="h-4 w-4 mr-1" /> Confirm & Save Rx</Button>
              <Button variant="outline"><Edit className="h-4 w-4 mr-1" /> Edit Before Saving</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorVoiceRx;
