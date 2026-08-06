import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mic, MicOff, Brain, MessageSquare, Sparkles, Volume2 } from "lucide-react";
import { parseVoiceCommand, type ParsedVoiceCommand } from "@/services/aiStockIntelligence";

interface CommandHistoryItem {
  id: string;
  transcript: string;
  parsed: ParsedVoiceCommand;
  timestamp: string;
}

const AIVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [manualInput, setManualInput] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser. Use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);

      if (current.isFinal) {
        processCommand(text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permissions.");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processCommand = (text: string) => {
    const parsed = parseVoiceCommand(text);
    const item: CommandHistoryItem = {
      id: Date.now().toString(),
      transcript: text,
      parsed,
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => [item, ...prev].slice(0, 10));

    // Speak response
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(parsed.response);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    // Execute action based on intent
    switch (parsed.intent) {
      case "check_stock":
        toast.info(parsed.response);
        break;
      case "add_stock":
        toast.success(parsed.response);
        break;
      case "process_sale":
        toast.success(parsed.response);
        break;
      case "reorder":
        toast.info(parsed.response);
        break;
      case "check_expiry":
        toast.info(parsed.response);
        break;
      default:
        toast.warning(parsed.response);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processCommand(manualInput.trim());
      setManualInput("");
    }
  };

  const intentIcons: Record<string, string> = {
    check_stock: "📦",
    add_stock: "➕",
    process_sale: "🛒",
    reorder: "🔄",
    check_expiry: "⏰",
    find_product: "🔍",
    unknown: "❓",
  };

  const exampleCommands = [
    "Check stock of Dasamoolarishtam",
    "Sell 2 bottles of Kashayam to Mr. Kumar",
    "Add 50 units of Chyawanprash received",
    "Reorder Simhanada Guggulu",
    "Show expiring products",
    "How much Ksheerabala available?",
  ];

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/30 to-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" /> AI Voice Commands
          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs ml-2">
            <Sparkles className="h-3 w-3 mr-1" /> Natural Language
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Microphone Control */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className={`rounded-full h-16 w-16 ${isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {isListening ? "Listening... speak your command" : "Tap to start voice command"}
        </p>

        {/* Live Transcript */}
        {transcript && (
          <div className="bg-white rounded-lg p-3 border text-center">
            <p className="text-sm font-medium">"{transcript}"</p>
          </div>
        )}

        {/* Manual Text Input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 h-9 rounded-md border border-input px-3 text-sm"
            placeholder="Or type a command..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
          />
          <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </form>

        {/* Example Commands */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Try saying:</p>
          <div className="flex flex-wrap gap-1">
            {exampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => processCommand(cmd)}
                className="text-xs bg-white border rounded-full px-2.5 py-1 hover:bg-purple-50 hover:border-purple-300 transition"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Command History */}
        {history.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground">Recent Commands:</p>
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded p-2 border text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{intentIcons[item.parsed.intent]} "{item.transcript}"</span>
                  <span className="text-muted-foreground">{item.timestamp}</span>
                </div>
                <p className="text-muted-foreground mt-0.5">{item.parsed.response}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{item.parsed.intent}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${item.parsed.confidence > 0.8 ? "text-green-600" : "text-amber-600"}`}>
                    {Math.round(item.parsed.confidence * 100)}% conf
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIVoiceCommands;
