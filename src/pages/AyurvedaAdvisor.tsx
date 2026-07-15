import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Leaf, AlertTriangle, Stethoscope, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
interface Turn { role: Role; content: string; }

const SUGGESTIONS = [
  "What foods balance Pitta dosha in summer?",
  "Is turmeric good for daily wellness?",
  "How do I build a simple Ayurvedic morning routine?",
  "Which spices help digestion after a heavy meal?",
];

const SYSTEM_PROMPT = `You are the Ayuzee Ayurveda Advisor — a classical Ayurveda knowledge assistant grounded in the tridosha theory (Vata, Pitta, Kapha), dinacharya (daily routine), ritucharya (seasonal routine), ahara (diet), and general lifestyle guidance drawn from the Charaka Samhita, Sushruta Samhita and Ashtanga Hridaya traditions.

Rules — follow strictly:
1. Provide GENERAL wellness, lifestyle, dosha, diet and routine guidance only.
2. Never prescribe specific medicinal dosages, potencies, or treatment courses for a named illness.
3. Never claim to diagnose or treat any disease.
4. If a user's question sounds like a medical complaint (persistent symptoms, pain, disease name, worsening condition, mental-health crisis, pregnancy-related concern, or anything urgent), do NOT attempt to advise. Instead reply briefly with: "This sounds like something a qualified Vaidya should look at. Please book a consultation on Ayuzee so a licensed Ayurveda doctor can guide you properly." and stop.
5. When you do answer, keep replies concise (3–6 short paragraphs or bullets), warm, and rooted in classical Ayurveda vocabulary where useful (mention doshas, agni, ama, rasa, etc.) but always explain terms in plain English.
6. Never contradict allopathic medical advice the user is already on — suggest they consult their doctor before changing anything.
7. Use markdown formatting for readability.
8. End every substantive answer with a one-line reminder: "_General guidance only — not a substitute for a Vaidya consultation._"`;

const AyurvedaAdvisor = () => {
  usePageSEO({
    title: "AI Ayurveda Advisor — Ayuzee",
    description: "Ask general Ayurveda lifestyle, dosha, and diet questions. Grounded in classical texts. Not a substitute for a Vaidya.",
  });

  const [messages, setMessages] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    if (!userId) {
      toast.error("Please sign in to chat with the Ayurveda Advisor");
      return;
    }

    const nextTurns: Turn[] = [...messages, { role: "user", content: q }];
    setMessages(nextTurns);
    setInput("");
    setLoading(true);

    // Build a compact transcript to send as the user prompt.
    const transcript = nextTurns
      .map((t) => `${t.role === "user" ? "User" : "Advisor"}: ${t.content}`)
      .join("\n\n");
    const prompt = `Continue this Ayurveda advisory conversation. Reply as "Advisor" to the last user turn only.

${transcript}

Advisor:`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "ayurveda_advisor",
          prompt,
          system: SYSTEM_PROMPT,
          context: { turn_count: nextTurns.length },
          max_tokens: 800,
        },
      });
      if (error) throw error;
      const reply: string = (data?.response ?? "").trim() || "I couldn't generate a reply. Please try rephrasing.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setMessages((m) => m.slice(0, -1));
      setInput(q);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <main className="container max-w-3xl py-8">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl gradient-leaf text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Classical wisdom, modern chat</span>
            <h1 className="font-display text-3xl leading-tight">Ayurveda Advisor</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Ask lifestyle, dosha, diet and routine questions. For actual health complaints, book a Vaidya instead.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div ref={scrollRef} className="max-h-[60vh] min-h-[320px] overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="font-medium">Namaste 🙏 What would you like to learn today?</p>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these to get started:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Badge key={s} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => send(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[92%] text-sm">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Leaf className="h-3.5 w-3.5" /> Advisor
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Consulting the classical texts…
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about your dosha, diet, seasonal routine…"
              className="min-h-[52px] max-h-40 resize-none"
              maxLength={1000}
              disabled={loading}
            />
            <Button
              variant="hero"
              size="icon"
              className="h-[52px] w-[52px] shrink-0"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Shift + Enter for a new line</span>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> New conversation
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>General wellness guidance only. Not a diagnosis or prescription. For symptoms or ailments, consult a licensed Vaidya.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link to="/doctors?system=ayurveda"><Stethoscope className="mr-2 h-4 w-4" />Book a Vaidya</Link>
        </Button>
      </div>
    </main>
  );
};

export default AyurvedaAdvisor;
