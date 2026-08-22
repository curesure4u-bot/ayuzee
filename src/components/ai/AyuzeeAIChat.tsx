import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { callGemini, isGeminiConfigured, type GeminiMessage } from "@/lib/gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AyuzeeAIChatProps {
  title?: string;
  subtitle?: string;
  systemPrompt?: string;
  placeholder?: string;
  welcomeMessage?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  suggestions?: string[];
}

const AyuzeeAIChat = ({
  title = "Ayuzee AI",
  subtitle = "AYUSH Health Assistant",
  systemPrompt,
  placeholder = "Type your health question...",
  welcomeMessage = "Namaste! I'm your AYUSH health assistant. I can help with Ayurveda, Siddha, Homeopathy, Yoga & Naturopathy questions. How can I assist you today?",
  icon,
  accentColor = "text-green-600",
  suggestions = [
    "What is my Prakriti type?",
    "Suggest Ayurvedic remedies for joint pain",
    "What Panchakarma is recommended for Vata imbalance?",
    "Explain the concept of Agni in Ayurveda",
  ],
}: AyuzeeAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: welcomeMessage, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const configured = isGeminiConfigured();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Build history for context
    const history: GeminiMessage[] = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        parts: [{ text: m.content }],
      }));

    const response = await callGemini(msg, systemPrompt, history);

    const assistantMessage: Message = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.error
        ? `Sorry, I encountered an error: ${response.error}`
        : response.text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ id: "welcome", role: "assistant", content: welcomeMessage, timestamp: new Date() }]);
  };

  if (!configured) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-amber-600 mb-3" />
          <h3 className="font-semibold">AI Not Configured</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add VITE_GEMINI_API_KEY to environment variables to enable AI features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <CardHeader className="pb-2 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon || <Sparkles className={`h-5 w-5 ${accentColor}`} />}
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <p className="text-[10px] text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[9px] text-green-600">Gemini AI</Badge>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={clearChat} title="Clear chat">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className={`h-7 w-7 rounded-full grid place-items-center shrink-0 bg-green-100 ${accentColor}`}>
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[9px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full grid place-items-center shrink-0 bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className={`h-7 w-7 rounded-full grid place-items-center shrink-0 bg-green-100 ${accentColor}`}>
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted/50 border rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Suggestions (show only when few messages) */}
      {messages.length <= 2 && suggestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {suggestions.map((s, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-auto py-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => sendMessage(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t shrink-0">
        <div className="flex gap-2">
          <Textarea
            className="min-h-[40px] max-h-[100px] resize-none text-sm"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button
            className="shrink-0 h-10 w-10 p-0"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1 text-center">
          AI responses are suggestions only. Always consult a qualified practitioner.
        </p>
      </div>
    </Card>
  );
};

export default AyuzeeAIChat;
