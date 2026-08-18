import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

// System prompt — policy text distilled from /refund-policy, /medical-disclaimer,
// /terms-of-use and /privacy-policy pages.
const SYSTEM_PROMPT = `You are Ayuzee's FAQ assistant. Ayuzee is an AYUSH healthcare aggregator covering Ayurveda, Yoga, Unani, Siddha and Homeopathy. You help visitors understand how the platform works.

## Platform overview
- Patients can book online/in-person consultations with verified AYUSH doctors (Vaidyas, Homeopaths, Unani/Siddha practitioners), book therapy sessions (Panchakarma, Yoga, Hijama, etc.) at partner venues or with therapists, and shop AYUSH medicines & wellness products.
- Doctors, therapists, venues, colleges and manufacturers can join as partners after verification.
- Payments are processed via Razorpay. Refunds go back to the original payment method.

## Booking flow
1. Browse doctors/therapies/venues → pick a slot → pay → get confirmation.
2. Consultations happen via in-app video room or in person, per doctor's setup.
3. Prescriptions and reports are stored in the patient dashboard.

## E-commerce flow
1. Add products to cart → checkout → pay via Razorpay → delivery via partner logistics (Delhivery).
2. Order status is tracked from the patient's Orders page.

## Refund & cancellation policy (from /refund-policy)
- **Medicines**: 7-day return window from delivery if unopened, unused, in original packaging. Refund in 5–7 business days after inspection. Broken seals, used items, perishables and personalised prescriptions are non-refundable. Shipping charges non-refundable unless our error.
- **Consultations**: Full refund if cancelled ≥24h before appointment. <24h may be partial at Ayuzee's discretion. No-show (patient doesn't join within 15 min) = no refund. If doctor cancels/no-shows, full refund is automatic.
- **Therapy sessions**: Governed by therapist/venue policy; most allow full refund ≥24h in advance. Late cancellations may forfeit fee. Completed sessions non-refundable except documented quality issues.
- **Non-refundable**: opened/used products, gift cards, wallet top-ups, consumed services, final-sale items.
- Support: support@ayuzee.com, +91 86103 02794.

## Medical safety rules — CRITICAL
- You DO NOT give medical advice, diagnoses, drug dosages, or treatment recommendations.
- If a visitor describes symptoms or asks "what should I take for X", redirect them to the **Symptom Checker** (/diagnosis) or to **book a consultation** (/doctors). Do not answer the medical question.
- For Ayurveda lifestyle/dosha/diet questions, point them to the **Ayurveda Advisor** (/ayurveda-advisor).
- For emergencies, tell them to contact local emergency services immediately.

## Style
- Concise, friendly, 2–4 sentences unless a list is genuinely needed.
- Link with plain paths like /doctors, /shop, /refund-policy — the UI renders them.
- If you don't know something platform-specific, say so and suggest emailing support@ayuzee.com.`;

const HIDDEN_PREFIXES = ["/admin", "/homeo", "/vaidya", "/doctor", "/consultation"];

export const FAQChatbot = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Ayuzee's assistant. Ask me about bookings, orders, refunds, or how the platform works. For medical questions, I'll point you to the Symptom Checker or a doctor.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const hidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (hidden) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const history = next
        .slice(1) // drop the greeting
        .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
        .join("\n\n");
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "faq_chatbot",
          system: SYSTEM_PROMPT,
          prompt: history,
          max_tokens: 500,
        },
      });
      if (error) throw error;
      const reply = (data as { response?: string })?.response?.trim() || "Sorry, I couldn't generate a reply. Please email support@ayuzee.com.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong. Please try again or email support@ayuzee.com." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Ayuzee assistant"
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full gradient-leaf text-primary-foreground shadow-elegant transition hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant",
            "h-[min(80vh,560px)]",
          )}
        >
          <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ayuzee Assistant</p>
              <p className="text-[11px] text-muted-foreground">Bookings · Orders · Policies</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </header>

          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="space-y-3 p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
            </div>
          </ScrollArea>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about bookings, orders, refunds…"
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
            AI assistant — for medical questions, use the Symptom Checker or book a consultation.
          </p>
        </div>
      )}
    </>
  );
};

export default FAQChatbot;
