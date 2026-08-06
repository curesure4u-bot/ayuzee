import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Mic, MicOff, RotateCcw, Save, Edit, Loader2, FileText,
} from "lucide-react";

type RecordingState = "idle" | "recording" | "processing";

const mockTranscript = `Doctor: Good morning, what brings you in today?
Patient: I've been having lower back pain radiating to my left leg for about 3 weeks now.
Doctor: Can you describe the pain? Is it sharp, dull, or burning?
Patient: It's a sharp, shooting pain that goes from my lower back down to my calf. Worse when sitting.
Doctor: Any numbness or tingling in the leg?
Patient: Yes, tingling in my left foot, especially the outer side.
Doctor: Let me examine your spine. I'll check for tenderness and do some neurological tests.`;

const mockSOAP = {
  subjective: "Patient reports 3-week history of lower back pain radiating to left leg (L5-S1 distribution). Sharp, shooting quality. Aggravated by sitting. Associated tingling in left foot (lateral aspect).",
  objective: "Tenderness at L4-L5, L5-S1. Positive SLR left at 40°. Reduced ankle jerk left. Sensory deficit lateral foot.",
  assessment: "Lumbar disc herniation L5-S1 with left S1 radiculopathy. Gridhrasi (Vataja type).",
  plan: "MRI lumbar spine. Start Kati Basti x 7 days. Yogaraja Guggulu 2 tab BD. Rasna Saptak Kwath 20ml BD. Review in 1 week.",
};

const mockAyush = {
  nidana: "Prolonged sitting (desk job), Vata-aggravating diet (excess dry/cold foods), suppression of natural urges (Vegadharana).",
  rupa: "Sphik-Kati-Prishtha-Uru-Janu-Jangha-Pada kramena Vedana (pain radiating from buttock to foot). Toda (pricking pain). Stambha (stiffness).",
  samprapti: "Vata prakopa → Sthana samshraya in Kati-pradesha → Snayu-Kandara involvement → Gridhrasi manifestation.",
  chikitsa: "Snehana (Kati Basti with Mahanarayana Taila), Swedana (Nadi Sweda), Basti (Erandamooladi Niruha + Anuvasana with Sahacharadi Taila). Internal: Yogaraja Guggulu, Rasna Saptak Kwath.",
};

const AIScribe = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState(mockTranscript);
  const [isEditing, setIsEditing] = useState(false);

  const handleRecord = () => {
    if (recordingState === "idle") {
      setRecordingState("recording");
      toast.info("Recording started...");
    } else if (recordingState === "recording") {
      setRecordingState("processing");
      setTimeout(() => {
        setRecordingState("idle");
        toast.success("Transcription complete");
      }, 2000);
    }
  };

  const handleSave = () => toast.success("Clinical notes saved to patient record");
  const handleReRecord = () => {
    setTranscript("");
    setRecordingState("idle");
    toast.info("Ready to re-record");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Clinical Scribe</h1>
        <Badge variant={recordingState === "recording" ? "destructive" : "secondary"}>
          {recordingState === "idle" ? "Ready" : recordingState === "recording" ? "Recording" : "Processing"}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Voice Capture</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleRecord} variant={recordingState === "recording" ? "destructive" : "default"} className="gap-2">
              {recordingState === "idle" && <><Mic className="h-4 w-4" /> Start Recording</>}
              {recordingState === "recording" && <><MicOff className="h-4 w-4" /> Stop Recording</>}
              {recordingState === "processing" && <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>}
            </Button>
            <Button variant="outline" onClick={handleReRecord} className="gap-2"><RotateCcw className="h-4 w-4" /> Re-record</Button>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="gap-2"><Edit className="h-4 w-4" /> Edit</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
          </div>
          <div className="rounded-md border bg-muted/50 p-4 min-h-[120px] whitespace-pre-wrap text-sm">
            {transcript || <span className="text-muted-foreground">Transcript will appear here...</span>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="soap">
        <TabsList><TabsTrigger value="soap">SOAP Format</TabsTrigger><TabsTrigger value="ayush">AYUSH Format</TabsTrigger></TabsList>
        <TabsContent value="soap">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(mockSOAP).map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase flex items-center gap-2"><FileText className="h-4 w-4" />{key}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{value}</p></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ayush">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(mockAyush).map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase flex items-center gap-2"><FileText className="h-4 w-4" />{key}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{value}</p></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIScribe;
