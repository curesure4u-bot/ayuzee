import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Intent = {
  action: "navigate" | "search" | "add_to_cart" | "start_booking" | "open_symptom_checker" | "unknown";
  route: string;
  params: { query?: string; specialty?: string };
  speech: string;
};

const HIDDEN_PREFIXES = ["/admin", "/homeo", "/vaidya", "/doctor", "/consultation"];

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export const VoiceAssistant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastHeard, setLastHeard] = useState<string>("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const hidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => () => {
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  if (hidden) return null;

  const executeIntent = (intent: Intent) => {
    if (intent.speech && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(intent.speech));
      } catch { /* ignore */ }
    }
    switch (intent.action) {
      case "navigate":
        if (intent.route?.startsWith("/")) navigate(intent.route);
        break;
      case "search":
        navigate(`/search?q=${encodeURIComponent(intent.params.query || "")}`);
        break;
      case "add_to_cart":
        navigate(`/shop?q=${encodeURIComponent(intent.params.query || "")}`);
        toast({ title: "Find your product", description: "Add it to cart from the results." });
        break;
      case "start_booking":
        navigate(intent.route?.startsWith("/") ? intent.route : "/doctors");
        break;
      case "open_symptom_checker":
        navigate("/diagnosis");
        break;
      default:
        toast({ title: "Didn't catch that", description: intent.speech || "Please try again." });
    }
  };

  const sendAudio = async (blob: Blob) => {
    setBusy(true);
    try {
      const audioBase64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke("voice-command", {
        body: { audioBase64, mime: blob.type || "audio/webm" },
      });
      if (error) throw error;
      const { transcript, intent } = data as { transcript: string; intent: Intent };
      setLastHeard(transcript);
      executeIntent(intent);
    } catch (e) {
      toast({ title: "Voice assistant error", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        if (blob.size < 1000) {
          toast({ title: "Nothing recorded", description: "Hold the mic and speak your command." });
          return;
        }
        void sendAudio(blob);
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast({ title: "Microphone blocked", description: "Allow mic access to use voice commands.", variant: "destructive" });
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const toggle = () => (recording ? stop() : start());

  return (
    <div className="fixed bottom-5 right-24 z-50 flex flex-col items-end gap-2">
      {lastHeard && !recording && !busy && (
        <div className="max-w-[220px] rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm">
          Heard: "{lastHeard}"
        </div>
      )}
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={recording ? "Stop recording" : "Start voice command"}
        className={cn(
          "grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-elegant transition hover:scale-105",
          recording ? "bg-destructive animate-pulse" : "gradient-leaf",
          busy && "opacity-70",
        )}
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : recording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
