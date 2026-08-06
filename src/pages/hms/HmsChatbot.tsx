import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  MessageCircle, Send, Bot, User, Stethoscope, Calendar,
  Pill, Clock, Phone, Brain, Zap, Settings, BarChart3,
  Heart, Shield, Activity, HelpCircle, Sparkles,
} from "lucide-react";

type ChatMessage = {
  id: string; role: "user" | "bot"; text: string; timestamp: string;
  actions?: { label: string; action: string }[];
};

type ChatSession = {
  id: string; user: string; type: "patient" | "staff";
  channel: "web" | "whatsapp" | "in-app"; status: "active" | "resolved" | "escalated";
  topic: string; messages: number; startedAt: string; lastMessage: string;
};

const patientBotResponses: Record<string, string> = {
  "book appointment": "I can help you book an appointment! 📅\n\nAvailable doctors today:\n• Dr. Arun Sharma (Ayurveda) — 3:00 PM, 4:30 PM\n• Dr. Meena Patel (Panchakarma) — 2:00 PM\n• Dr. Priya Das (Homeopathy) — 4:00 PM, 5:30 PM\n\nWhich doctor would you like to see? Or tell me your health concern and I'll suggest the right specialist.",
  "medicine reminder": "I've set up your medicine reminders! 💊\n\nYour schedule:\n• 6:00 AM — Rasnasaptakam Kashayam (before food)\n• 8:00 AM — Simhanada Guggulu 2 tab (with breakfast)\n• 6:00 PM — Simhanada Guggulu 2 tab (with dinner)\n• 9:00 PM — Kottamchukkadi Taila (external application)\n\nYou'll receive WhatsApp reminders 15 minutes before each dose. Reply DONE after taking each medicine to track adherence.",
  "symptoms": "I understand you're not feeling well. Let me ask a few questions to help guide you:\n\n1. What symptoms are you experiencing?\n2. How long have you had them?\n3. On a scale of 1-10, how severe?\n4. Are you currently on any medication?\n\nBased on your answers, I can:\n• Suggest which department to visit\n• Check if it needs urgent attention\n• Book an appointment with the right specialist\n\n⚠️ Note: This is AI-assisted guidance, not a diagnosis. For emergencies, call 108.",
  "default": "I'm Ayuzee AI Assistant! 🙏 I can help you with:\n\n📅 **Book/reschedule appointments**\n💊 **Medicine reminders & schedule**\n🩺 **Symptom guidance & specialist recommendation**\n📋 **View your reports & prescriptions**\n💰 **Bill inquiries & payment**\n🏥 **Hospital info (timings, directions, services)**\n\nJust tell me what you need, or tap one of the quick options below!",
};

const staffBotResponses: Record<string, string> = {
  "drug interaction": "🔍 **Drug Interaction Check**\n\nPlease enter the medicines to check:\n• Format: Drug1 + Drug2\n• Example: Guggulu + Warfarin\n\nI'll check across all systems (Ayurveda, Allopathy, Homeopathy, Siddha) and provide:\n• Severity level\n• Mechanism of interaction\n• Clinical recommendation\n• Timing separation advice",
  "protocol": "📋 **Treatment Protocol Query**\n\nI can provide evidence-based protocols for:\n• Combined AYUSH + Allopathy protocols\n• Standard Panchakarma sequences\n• Department-specific SOPs\n• NABH compliance procedures\n\nTell me the condition or procedure name, and I'll pull up the latest protocol with dosages and monitoring schedule.",
  "bed status": "🛏️ **Current Bed Status**\n\n• **General Ward:** 12/18 occupied (67%)\n• **Panchakarma Rooms:** 8/10 occupied (80%)\n• **Private Rooms:** 4/6 occupied (67%)\n• **ICU:** 1/2 occupied (50%)\n\nTotal: 25/36 beds occupied (69%)\n\n3 discharges expected today, 2 admissions scheduled.\nNext available Panchakarma room: Tomorrow 10 AM.",
  "default": "I'm the HMS Staff Assistant! 🏥 I can help with:\n\n💊 **Drug interaction checks** (cross-system)\n📋 **Treatment protocols & SOPs**\n🛏️ **Bed/room availability**\n📊 **Quick MIS data** (today's numbers)\n👨‍⚕️ **Doctor schedule lookup**\n🔬 **Lab report status**\n📝 **Documentation templates**\n⚡ **Emergency protocols**\n\nWhat do you need?",
};

const mockSessions: ChatSession[] = [
  { id: "1", user: "Ramesh Kumar", type: "patient", channel: "whatsapp", status: "active", topic: "Medicine reminder setup", messages: 5, startedAt: "10:30 AM", lastMessage: "Thanks, reminders are set!" },
  { id: "2", user: "Priya Menon", type: "patient", channel: "web", status: "active", topic: "Book follow-up appointment", messages: 3, startedAt: "11:00 AM", lastMessage: "Can I book for Thursday 4 PM?" },
  { id: "3", user: "Nurse Bhavani", type: "staff", channel: "in-app", status: "resolved", topic: "Checked Guggulu + Warfarin interaction", messages: 4, startedAt: "09:15 AM", lastMessage: "HIGH RISK - avoid combination" },
  { id: "4", user: "Unknown Caller", type: "patient", channel: "whatsapp", status: "escalated", topic: "Severe chest pain inquiry", messages: 2, startedAt: "08:45 AM", lastMessage: "Escalated to emergency — called 108" },
  { id: "5", user: "Dr. Arun Sharma", type: "staff", channel: "in-app", status: "resolved", topic: "Protocol for Virechana in diabetic patient", messages: 6, startedAt: "08:00 AM", lastMessage: "Protocol with modifications provided" },
  { id: "6", user: "Lakshmi Devi", type: "patient", channel: "whatsapp", status: "active", topic: "Lab report inquiry", messages: 3, startedAt: "11:30 AM", lastMessage: "Your CBC report is ready. View link sent." },
];

const HmsChatbot = () => {
  const [mode, setMode] = useState<"patient" | "staff">("patient");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "0", role: "bot", text: patientBotResponses["default"], timestamp: "Now", actions: [
      { label: "📅 Book Appointment", action: "book appointment" },
      { label: "💊 Medicine Reminder", action: "medicine reminder" },
      { label: "🩺 Symptom Check", action: "symptoms" },
    ]},
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: "user", text: msgText, timestamp: "Now",
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = mode === "patient" ? patientBotResponses : staffBotResponses;
      const key = Object.keys(responses).find(k => msgText.toLowerCase().includes(k)) || "default";
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: "bot", text: responses[key],
        timestamp: "Now",
        actions: key === "default" ? undefined : [
          { label: "✅ Helpful", action: "helpful" },
          { label: "👨‍⚕️ Talk to Human", action: "escalate" },
        ],
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleAction = (action: string) => {
    if (action === "escalate") {
      toast.info("Connecting you to a staff member...");
      return;
    }
    if (action === "helpful") {
      toast.success("Thank you for your feedback!");
      return;
    }
    handleSend(action);
  };

  const switchMode = (newMode: "patient" | "staff") => {
    setMode(newMode);
    const responses = newMode === "patient" ? patientBotResponses : staffBotResponses;
    setMessages([{
      id: "0", role: "bot", text: responses["default"], timestamp: "Now",
      actions: newMode === "patient" ? [
        { label: "📅 Book Appointment", action: "book appointment" },
        { label: "💊 Medicine Reminder", action: "medicine reminder" },
        { label: "🩺 Symptom Check", action: "symptoms" },
      ] : [
        { label: "💊 Drug Interaction", action: "drug interaction" },
        { label: "📋 Protocol Lookup", action: "protocol" },
        { label: "🛏️ Bed Status", action: "bed status" },
      ],
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" /> AI Chatbot & Virtual Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Patient-facing (appointments, symptoms, reminders) · Staff-facing (protocols, drug info, scheduling) · WhatsApp integrated
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
          <Sparkles className="h-3 w-3 mr-1" /> Online — 6 active sessions
        </Badge>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="config">Bot Config</TabsTrigger>
        </TabsList>

        {/* Live Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chat Window */}
            <div className="lg:col-span-2">
              <Card className="h-[550px] flex flex-col">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full grid place-items-center ${mode === "patient" ? "bg-blue-100" : "bg-purple-100"}`}>
                        {mode === "patient" ? <User className="h-4 w-4 text-blue-600" /> : <Stethoscope className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{mode === "patient" ? "Patient Chatbot" : "Staff Assistant"}</p>
                        <p className="text-[10px] text-muted-foreground">{mode === "patient" ? "Appointments, symptoms, reminders" : "Protocols, drug info, bed status"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant={mode === "patient" ? "default" : "outline"} className="h-7 text-xs" onClick={() => switchMode("patient")}>Patient</Button>
                      <Button size="sm" variant={mode === "staff" ? "default" : "outline"} className="h-7 text-xs" onClick={() => switchMode("staff")}>Staff</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] ${msg.role === "user" ? "order-2" : ""}`}>
                            <div className={`rounded-lg p-3 text-sm whitespace-pre-line ${
                              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              {msg.text}
                            </div>
                            {msg.actions && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {msg.actions.map((a) => (
                                  <Button key={a.action} size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAction(a.action)}>
                                    {a.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3 text-sm">
                            <span className="animate-pulse">AI is typing...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t p-3 flex gap-2">
                    <Input
                      placeholder={mode === "patient" ? "Ask about appointments, medicines, symptoms..." : "Ask about protocols, drug info, bed status..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Today's Bot Stats</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Total Conversations", value: "48", icon: <MessageCircle className="h-3 w-3" /> },
                    { label: "Auto-Resolved", value: "38 (79%)", icon: <Bot className="h-3 w-3" /> },
                    { label: "Escalated to Human", value: "6", icon: <User className="h-3 w-3" /> },
                    { label: "Appointments Booked", value: "12", icon: <Calendar className="h-3 w-3" /> },
                    { label: "Reminders Set", value: "22", icon: <Clock className="h-3 w-3" /> },
                    { label: "Avg. Response Time", value: "1.2s", icon: <Zap className="h-3 w-3" /> },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">{s.icon} {s.label}</span>
                      <span className="font-bold">{s.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Top Queries Today</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {[
                    { query: "Book appointment", count: 15 },
                    { query: "Medicine schedule", count: 12 },
                    { query: "Lab report status", count: 8 },
                    { query: "Doctor availability", count: 7 },
                    { query: "Bill payment", count: 5 },
                    { query: "Drug interaction", count: 4 },
                  ].map(q => (
                    <div key={q.query} className="flex items-center justify-between text-xs p-1.5 rounded border">
                      <span>{q.query}</span>
                      <Badge variant="secondary" className="text-[9px]">{q.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active & Recent Chat Sessions</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] text-green-600">{mockSessions.filter(s => s.status === "active").length} Active</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-600">{mockSessions.filter(s => s.status === "escalated").length} Escalated</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockSessions.map((session) => (
                  <div key={session.id} className={`p-4 hover:bg-muted/30 transition ${session.status === "escalated" ? "bg-red-50/30" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full grid place-items-center ${
                          session.type === "patient" ? "bg-blue-100" : "bg-purple-100"
                        }`}>
                          {session.type === "patient" ? <User className="h-4 w-4 text-blue-600" /> : <Stethoscope className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{session.user}</p>
                          <p className="text-xs text-muted-foreground">{session.topic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.status === "active" ? "outline" : session.status === "escalated" ? "destructive" : "secondary"} className={`text-[10px] capitalize ${session.status === "active" ? "text-green-600" : ""}`}>
                          {session.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">{session.startedAt} · {session.messages} msgs</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{session.channel}</Badge>
                      <Badge variant="outline" className="text-[9px]">{session.type}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">{session.lastMessage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Patient Bot Capabilities</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { feature: "Appointment Booking / Reschedule", enabled: true, channel: "WhatsApp + Web" },
                    { feature: "Medicine Reminders (3x daily)", enabled: true, channel: "WhatsApp" },
                    { feature: "Symptom Triage & Specialist Suggest", enabled: true, channel: "WhatsApp + Web" },
                    { feature: "Lab Report Delivery", enabled: true, channel: "WhatsApp" },
                    { feature: "Bill Inquiry & Payment Link", enabled: true, channel: "WhatsApp + Web" },
                    { feature: "Follow-up Reminder Nudge", enabled: true, channel: "WhatsApp" },
                    { feature: "Diet Chart / Pathya Guidance", enabled: true, channel: "Web" },
                    { feature: "Emergency Escalation (auto-detect)", enabled: true, channel: "All" },
                    { feature: "Multi-language Support (Hindi/Tamil/Malayalam)", enabled: false, channel: "Coming Soon" },
                    { feature: "Voice Message Interpretation", enabled: false, channel: "Coming Soon" },
                  ].map(f => (
                    <div key={f.feature} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${f.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">{f.feature}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px]">{f.channel}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Staff Bot Capabilities</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { feature: "Drug Interaction Checker (Cross-system)", enabled: true },
                    { feature: "Treatment Protocol Lookup", enabled: true },
                    { feature: "Bed/Room Availability", enabled: true },
                    { feature: "Quick MIS Data (Today's Revenue, Footfall)", enabled: true },
                    { feature: "Doctor Schedule & Availability", enabled: true },
                    { feature: "Lab Report Status Check", enabled: true },
                    { feature: "Emergency Protocol Reference", enabled: true },
                    { feature: "NABH Documentation Templates", enabled: true },
                    { feature: "Ayurveda Formulary Quick Reference", enabled: true },
                    { feature: "AI-Generated Discharge Summary", enabled: true },
                  ].map(f => (
                    <div key={f.feature} className="flex items-center gap-2 p-2 rounded border">
                      <div className={`h-2 w-2 rounded-full ${f.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-sm">{f.feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-3 flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">AI Safety Rules</p>
                <p className="text-blue-600 mt-0.5">
                  The chatbot never provides diagnoses — only guidance to the right specialist. Emergency keywords 
                  (chest pain, breathlessness, unconscious, bleeding) trigger immediate escalation to human staff + 108 alert.
                  All conversations are logged and auditable. Patient data is never exposed beyond verified identity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsChatbot;
