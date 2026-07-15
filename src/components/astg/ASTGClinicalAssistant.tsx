import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Copy, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  diseaseContext?: string;
  /** Render as floating button (default) or inline trigger */
  variant?: "floating" | "inline";
};

const SUGGESTIONS = [
  "What symptoms suggest Kaphaja Kasa?",
  "Can I combine Chandraprabha Vati with Yogaraja Guggulu?",
  "55yo with dry skin, constipation, anxiety — likely Prakriti?",
  "Pediatric dose of Sitopaladi for a 5-year-old, 18 kg?",
  "What does Charaka say about Jwara treatment?",
];

export default function ASTGClinicalAssistant({
  diseaseContext,
  variant = "floating",
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("astg-clinical-assistant", {
        body: { messages: next, diseaseContext },
      });
      if (error) throw error;
      const reply = (data as { reply?: string; error?: string })?.reply;
      const errMsg = (data as { error?: string })?.error;
      if (errMsg) throw new Error(errMsg);
      if (!reply) throw new Error("No response from assistant");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to reach assistant";
      toast.error(msg);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${msg}. Please try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const trigger =
    variant === "floating" ? (
      <Button
        size="lg"
        className="fixed bottom-24 right-6 z-40 h-14 gap-2 rounded-full shadow-lg"
        aria-label="Open AI Clinical Assistant"
      >
        <Bot className="h-5 w-5" />
        AI Assist
      </Button>
    ) : (
      <Button variant="outline" size="sm" className="gap-2">
        <Sparkles className="h-4 w-4" />
        AI Assist
      </Button>
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            ASTG Clinical Assistant
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              AYUSH ASTG 2017
            </Badge>
            {diseaseContext && (
              <Badge variant="outline" className="text-xs">
                Context: {diseaseContext}
              </Badge>
            )}
          </div>
          <p className="flex items-start gap-1.5 text-[11px] leading-tight text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            Disclaimer: AI guidance based on ASTG 2017 — Always apply clinical
            judgment and confirm with in-person examination.
          </p>
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ask about symptoms, medicine interactions, dosha determination,
                pediatric dosing, or classical references.
              </p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-md border bg-card px-3 py-2 text-left text-xs hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "group relative max-w-[88%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted",
                )}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    onClick={() => copy(m.content)}
                    className="absolute -bottom-2 -right-2 rounded-full border bg-background p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    aria-label="Copy response"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Consulting ASTG…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t p-3"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Describe symptoms, ask about a medicine, dosha…"
            rows={2}
            className="min-h-[44px] resize-none text-sm"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
