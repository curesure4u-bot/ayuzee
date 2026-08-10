import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, X, Send, Sparkles, Lightbulb, CheckCircle, Clock, Zap } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const QUICK_PROMPTS = [
  { label: "Prioritize my tasks", icon: Zap, prompt: "What should I focus on today?" },
  { label: "Summarize my week", icon: CheckCircle, prompt: "Give me a summary of my week" },
  { label: "What's overdue?", icon: Clock, prompt: "What tasks are overdue?" },
  { label: "Suggest next action", icon: Lightbulb, prompt: "What should I do next?" },
];

// Smart responses based on context (no API needed — pattern-based)
function generateResponse(prompt: string, pathname: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("prioritize") || lower.includes("focus")) {
    return "Based on the Eisenhower Matrix:\n\n1. **Do First** — Tasks that are Important + Urgent\n2. **Schedule** — Important but Not Urgent (plan these)\n3. **Delegate** — Urgent but Not Important (give to someone else)\n4. **Eliminate** — Neither Important nor Urgent\n\nTip: Check your Decision Matrix page for an auto-sorted view of all your tasks by priority quadrant.";
  }

  if (lower.includes("summary") || lower.includes("week")) {
    return "Here's how to see your weekly performance:\n\n Go to **Weekly Review** in the sidebar — it shows:\n• Tasks completed vs total\n• Daily breakdown chart\n• Accomplishments list\n• Performance score out of 100\n\nTip: Try to maintain an 80%+ completion rate for optimal productivity.";
  }

  if (lower.includes("overdue") || lower.includes("late") || lower.includes("missed")) {
    return "To check overdue tasks:\n\n1. Go to **Notifications** page — it lists all overdue items\n2. Or use **Tasks Filter** → filter by 'Days Left' (negative = overdue)\n3. The **Dashboard** also shows overdue count in the top stats\n\nTip: Tackle the oldest overdue task first — completing even one reduces stress.";
  }

  if (lower.includes("next") || lower.includes("suggest") || lower.includes("what should")) {
    return "Smart suggestions:\n\n• Start your day with the **Pomodoro Timer** (25 min focus)\n• Check today's tasks on the **Dashboard**\n• If overwhelmed, use **Brain Dump** to clear your head first\n• Use **Focus Mode** for your single most important task\n• End the day with **Gratitude** (3 things you're thankful for)\n\nConsistency > perfection.";
  }

  if (lower.includes("habit") || lower.includes("streak")) {
    return "Habit tips:\n\n• Start with just ONE new habit at a time\n• Stack it: tie the new habit to an existing one\n• Track it daily in the **Habits Tracker** — the streak motivates you\n• If you miss a day, never miss two in a row\n• Celebrate small wins — mark it done and feel the dopamine!";
  }

  if (lower.includes("goal") || lower.includes("plan")) {
    return "Goal-setting framework:\n\n1. Set 3-5 quarterly goals in the **Goals** page\n2. Break each into monthly milestones\n3. Create Variable Tasks for each milestone\n4. Track with the **Yearly Planner** for the big picture\n5. Review weekly in **Weekly Review**\n\nRemember: A goal without a plan is just a wish.";
  }

  if (lower.includes("pomodoro") || lower.includes("timer") || lower.includes("focus")) {
    return "Pomodoro technique:\n\n• 25 min focus → 5 min break (classic)\n• After 4 sessions → 15 min long break\n• Link each session to a specific task\n• No distractions during focus time\n\nTry **Focus Mode** for single-task immersion, or **Pomodoro Timer** for timed blocks.";
  }

  if (pathname.includes("task-tracker")) {
    return "You're in the Task Tracker! Here's what you can do:\n\n• **Quick Add** (floating + button) to capture tasks instantly\n• **Kanban Board** for visual workflow\n• **Decision Matrix** to prioritize by importance/urgency\n• **Pomodoro** for focused work sessions\n• **Cmd+K** to search and navigate anywhere fast\n\nWhat would you like help with?";
  }

  return "I'm your Ayuzee productivity assistant. I can help with:\n\n• Task prioritization\n• Weekly summaries\n• Habit building tips\n• Goal planning advice\n• Productivity techniques\n• Navigation help\n\nTry asking: \"What should I focus on today?\" or \"How do I set up goals?\"";
}

/**
 * AI Assistant floating bubble — appears on every page.
 * Provides smart suggestions based on task data and context.
 */
const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hi! I'm your productivity assistant. Ask me anything about tasks, habits, or how to use Ayuzee.", timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const location = useLocation();

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    // Add user message
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: msg, timestamp: new Date().toISOString() };

    // Generate response
    const response = generateResponse(msg, location.pathname);
    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: response, timestamp: new Date().toISOString() };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  // Don't show on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          title="AI Assistant"
        >
          <Brain className="h-5 w-5" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px]">
          <Card className="shadow-2xl border-violet-200 overflow-hidden">
            {/* Header */}
            <CardHeader className="py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Ayuzee AI Assistant
                </CardTitle>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[300px] overflow-y-auto p-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-muted border"
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="border-t px-3 py-2">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {QUICK_PROMPTS.map(qp => (
                    <Button
                      key={qp.label}
                      size="sm"
                      variant="outline"
                      className="h-6 text-[9px] whitespace-nowrap shrink-0"
                      onClick={() => sendMessage(qp.prompt)}
                    >
                      <qp.icon className="mr-0.5 h-2.5 w-2.5" /> {qp.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t px-3 py-2">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Ask anything..."
                    className="h-8 text-xs"
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0 bg-violet-600 hover:bg-violet-700" onClick={() => sendMessage()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
