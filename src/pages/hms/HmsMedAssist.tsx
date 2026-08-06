import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Bot, Send, User, Sparkles, Languages, Mic, Image,
  Calendar, Pill, Heart, Stethoscope, Brain, Activity
} from "lucide-react";
import { processMessage, getGreeting, getOrCreateSession, persistUserMessage, type ChatMessage, type MedAssistContext } from "@/services/medAssistService";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "ta", label: "தமிழ்" },
  { value: "te", label: "తెలుగు" },
  { value: "kn", label: "ಕನ್ನಡ" },
  { value: "ml", label: "മലയാളം" },
  { value: "mr", label: "मराठी" },
  { value: "gu", label: "ગુજરાતી" },
  { value: "bn", label: "বাংলা" },
];

const HmsMedAssist = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState("en");
  const [sessionStats, setSessionStats] = useState({ total: 847, today: 23, resolved: 19, escalated: 2 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const context: MedAssistContext = {
    patient_name: "Patient",
    language,
    session_type: "general",
    symptoms_collected: [],
    session_id: sessionId || undefined,
  };

  useEffect(() => {
    // Initial greeting + create session
    const greeting = getGreeting(language);
    setMessages([greeting]);
    getOrCreateSession(language, "symptom_check").then((id) => {
      if (id) setSessionId(id);
    });
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      content_type: "text",
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Persist user message
    if (sessionId) persistUserMessage(sessionId, messageText);

    try {
      const response = await processMessage(messageText, context, messages);
      setMessages(prev => [...prev, response]);
    } catch {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> MedAssist AI Agent
          </h1>
          <p className="text-sm text-muted-foreground">
            Patient-facing health bot — Symptom check, appointments, medicine info, AYUSH guidance
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/chatbot"}>Admin View</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{sessionStats.total}</p><p className="text-xs text-muted-foreground">Total Conversations</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{sessionStats.today}</p><p className="text-xs text-muted-foreground">Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{sessionStats.resolved}</p><p className="text-xs text-muted-foreground">Self-Resolved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{sessionStats.escalated}</p><p className="text-xs text-muted-foreground">Escalated to Doctor</p></CardContent></Card>
      </div>

      {/* Chat Interface */}
      <Card className="border-2">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-blue-50/50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary grid place-items-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Ayuzee Health Assistant</CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Online · {languageOptions.find(l => l.value === language)?.label}
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              <Badge variant="outline" className="text-xs"><Stethoscope className="h-3 w-3 mr-0.5" /> Symptom Check</Badge>
              <Badge variant="outline" className="text-xs"><Calendar className="h-3 w-3 mr-0.5" /> Booking</Badge>
              <Badge variant="outline" className="text-xs"><Heart className="h-3 w-3 mr-0.5" /> AYUSH</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[420px] overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                  {/* Quick Replies */}
                  {msg.role === "assistant" && msg.quick_replies && msg.quick_replies.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {msg.quick_replies.map((reply, i) => (
                        <Button key={i} size="sm" variant="outline" className="text-xs h-7 rounded-full"
                          onClick={() => handleQuickReply(reply)}>
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-blue-100 grid place-items-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="h-7 w-7 rounded-full bg-primary/10 grid place-items-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2.5 rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="shrink-0" onClick={() => toast.info("Voice input activated — speak your symptoms")}>
                <Mic className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="shrink-0" onClick={() => toast.info("Upload a photo of your report or prescription")}>
                <Image className="h-4 w-4" />
              </Button>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your health question..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button size="sm" onClick={() => sendMessage()} disabled={!inputText.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              This AI assistant provides general guidance only. For medical emergencies, call 108. Always consult a qualified doctor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsMedAssist;
