import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Cfg = {
  clinic_name_display: string;
  clinic_logo_url: string | null;
  background_color: string;
  text_color: string;
  accent_color: string;
  show_waiting_count: boolean;
  show_doctor_name: boolean;
  announcement_text: string;
  font_size_token: string;
};

const SIZE: Record<string, string> = { large: "10vw", xlarge: "16vw", xxlarge: "22vw" };

export default function QueueDisplayScreen() {
  const { branchId } = useParams();
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [current, setCurrent] = useState<any>(null);
  const [doctorName, setDoctorName] = useState<string>("");
  const [waiting, setWaiting] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!branchId) return;
    (async () => {
      const { data } = await supabase.from("hms_token_display_config").select("*").eq("branch_id", branchId).maybeSingle();
      setCfg((data as any) ?? {
        clinic_name_display: "Ayuzee Clinic", clinic_logo_url: null,
        background_color: "#065f46", text_color: "#ffffff", accent_color: "#34d399",
        show_waiting_count: true, show_doctor_name: true,
        announcement_text: "Welcome to HMS Tools Ultra | Powered by Ayuzee",
        font_size_token: "xxlarge",
      });
    })();
  }, [branchId]);

  const refresh = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: cur } = await supabase.from("vaidya_queue_tokens")
        .select("*").eq("status", "in_consultation").order("updated_at", { ascending: false }).limit(1);
      const row = (cur as any)?.[0] ?? null;
      setCurrent(row);
      if (row?.doctor_user_id) {
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", row.doctor_user_id).maybeSingle();
        setDoctorName((prof as any)?.full_name || "");
      }
      const { count } = await supabase.from("vaidya_queue_tokens")
        .select("*", { count: "exact", head: true }).eq("status", "waiting").eq("token_date", today);
      setWaiting(count ?? 0);
    } catch {/* graceful */ }
  };

  useEffect(() => {
    refresh();
    const ch = supabase.channel("queue-display")
      .on("postgres_changes", { event: "*", schema: "public", table: "vaidya_queue_tokens" }, refresh)
      .subscribe();
    const poll = setInterval(refresh, 5000);
    return () => { supabase.removeChannel(ch); clearInterval(poll); };
  }, []);

  if (!cfg) {
    return <div className="flex h-screen w-screen items-center justify-center bg-emerald-900 text-white text-2xl">Please wait…</div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ background: cfg.background_color, color: cfg.text_color, fontFamily: "system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-8 py-4" style={{ background: "rgba(0,0,0,0.25)" }}>
        <div className="flex items-center gap-3 text-2xl font-bold">
          {cfg.clinic_logo_url && <img src={cfg.clinic_logo_url} alt="logo" className="h-10" />}
          ⚡ HMS Tools Ultra
        </div>
        <div className="text-2xl font-semibold">{cfg.clinic_name_display}</div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center">
        {current ? (
          <>
            <div className="text-xl uppercase tracking-[0.4em]" style={{ color: cfg.accent_color }}>Now Serving</div>
            <div className="font-bold leading-none my-4" style={{ fontSize: SIZE[cfg.font_size_token] || SIZE.xxlarge }}>
              {String(current.token_no).padStart(2, "0")}
            </div>
            {cfg.show_doctor_name && doctorName && (
              <div className="mt-2 text-3xl opacity-90">Dr. {doctorName.replace(/^Dr\.?\s*/i, "")}{current.visit_type ? ` — ${current.visit_type}` : ""}</div>
            )}
          </>
        ) : (
          <>
            <div className="text-6xl font-bold">WELCOME</div>
            <div className="mt-4 text-3xl">{cfg.clinic_name_display}</div>
            <div className="mt-6 text-4xl font-mono">{now.toLocaleTimeString()}</div>
          </>
        )}
      </main>

      <footer className="flex items-center justify-between gap-6 px-8 py-4 text-xl" style={{ background: "rgba(0,0,0,0.25)" }}>
        {cfg.show_waiting_count ? <div>Waiting: <strong>{waiting}</strong> patients</div> : <div />}
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap" style={{ animation: "ticker 30s linear infinite" }}>
            {cfg.announcement_text} &nbsp; • &nbsp; {cfg.announcement_text}
          </div>
        </div>
      </footer>
      <style>{`@keyframes ticker { from { transform: translateX(100%); } to { transform: translateX(-100%); } }`}</style>
    </div>
  );
}
