import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mic, MicOff, Sparkles, ArrowRight } from "lucide-react";
import { parseNaturalLanguage } from "./NaturalLanguageParser";
import { getPriorityColor } from "./types";

type Props = {
  onCreateTask: (task: any) => void;
};

/**
 * Voice Input + Natural Language Quick Add.
 * Uses Web Speech API for voice recognition.
 * Also works as a text input with NL parsing.
 */
const VoiceInput = ({ onCreateTask }: Props) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseNaturalLanguage> | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Indian English

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);
      if (result.isFinal) {
        const parsed = parseNaturalLanguage(text);
        setParsed(parsed);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") toast.error("Microphone access denied. Check browser permissions.");
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setParsed(null);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const handleTextInput = (text: string) => {
    setTranscript(text);
    if (text.trim().length > 3) {
      setParsed(parseNaturalLanguage(text));
    } else {
      setParsed(null);
    }
  };

  const createTask = () => {
    if (!parsed) return;
    onCreateTask({
      task_name: parsed.task_name,
      description: "",
      status: "To do",
      priority: parsed.priority,
      person_in_charge: parsed.person_in_charge,
      start_date: new Date().toISOString().split("T")[0],
      due_date: parsed.due_date,
      kanban_category: "To-Do",
      importance: parsed.importance,
      urgency: parsed.urgency,
      progress: 0,
      notes: `Created via ${isListening ? "voice" : "natural language"} input`,
      is_completed: false,
      completed_at: null,
      gantt_color: "",
      project_name: "",
      role_context: "general",
    });
    toast.success(`Task "${parsed.task_name}" created!`);
    setTranscript("");
    setParsed(null);
  };

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-sm font-medium">Smart Input — Voice or Natural Language</p>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={transcript}
            onChange={e => handleTextInput(e.target.value)}
            placeholder='Try: "Call Ramesh tomorrow high priority" or click mic to speak...'
            className="flex-1 text-sm"
            onKeyDown={e => e.key === "Enter" && parsed && createTask()}
          />
          <Button
            size="icon"
            className={`h-9 w-9 rounded-full ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-violet-600 hover:bg-violet-700"}`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Listening... speak your task
          </div>
        )}

        {/* Parsed Preview */}
        {parsed && transcript.trim().length > 3 && (
          <div className="rounded-lg border border-violet-200 bg-white p-3 space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase">Parsed Result:</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold">{parsed.task_name}</span>
              <Badge className={`text-[9px] ${getPriorityColor(parsed.priority)}`}>{parsed.priority}</Badge>
              {parsed.due_date && <Badge variant="outline" className="text-[9px]">Due: {parsed.due_date}</Badge>}
              {parsed.person_in_charge && <Badge variant="secondary" className="text-[9px]">→ {parsed.person_in_charge}</Badge>}
              {parsed.urgency === "Urgent" && <Badge variant="destructive" className="text-[9px]">Urgent</Badge>}
              {parsed.importance === "Important" && <Badge className="text-[9px] bg-amber-100 text-amber-700">Important</Badge>}
            </div>
            <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 mt-2" onClick={createTask}>
              <ArrowRight className="mr-1 h-3.5 w-3.5" /> Create This Task
            </Button>
          </div>
        )}

        {/* Help text */}
        <p className="text-[9px] text-muted-foreground">
          Examples: "Submit report by Friday high priority" · "Buy medicines for Ramesh tomorrow urgent" · "Weekly meeting assign to Priya next Monday"
        </p>
      </CardContent>
    </Card>
  );
};

export default VoiceInput;
