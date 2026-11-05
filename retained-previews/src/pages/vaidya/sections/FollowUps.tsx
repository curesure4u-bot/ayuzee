import { useEffect, useMemo, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, MessageCircle, Phone, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Tab = "today" | "upcoming" | "overdue" | "all";

const FollowUps = () => {
  const { userId, doctor } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [patients, setPatients] = useState<Record<string, { name: string; phone: string | null }>>({});
  const [tab, setTab] = useState<Tab>("today");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("vaidya_consultations")
      .select("*")
      .eq("doctor_user_id", userId)
      .not("follow_up_date", "is", null)
      .order("follow_up_date", { ascending: true });
    setItems(data ?? []);
    const ids = Array.from(new Set((data ?? []).map((d: any) => d.patient_id).filter(Boolean)));
    if (ids.length) {
      const { data: ps } = await supabase.from("vaidya_patients").select("id, full_name, phone").in("id", ids);
      const map: Record<string, { name: string; phone: string | null }> = {};
      (ps ?? []).forEach((p: any) => (map[p.id] = { name: p.full_name, phone: p.phone }));
      setPatients(map);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const today = new Date().toISOString().slice(0, 10);

  const counts = useMemo(() => {
    const t = items.filter((c) => c.follow_up_date === today).length;
    const u = items.filter((c) => c.follow_up_date > today).length;
    const o = items.filter((c) => c.follow_up_date < today).length;
    return { today: t, upcoming: u, overdue: o, all: items.length };
  }, [items, today]);

  const filtered = useMemo(() => {
    if (tab === "today") return items.filter((c) => c.follow_up_date === today);
    if (tab === "upcoming") return items.filter((c) => c.follow_up_date > today);
    if (tab === "overdue") return items.filter((c) => c.follow_up_date < today);
    return items;
  }, [items, tab, today]);

  const buildMessage = (c: any) => {
    const p = patients[c.patient_id];
    const clinicName = doctor?.clinic_name || (doctor?.full_name ? `Dr. ${doctor.full_name}` : "your doctor");
    const dx = c.diagnosis ? ` regarding "${c.diagnosis}"` : "";
    return `Namaste ${p?.name || ""} 🙏\n\nThis is a friendly reminder from ${clinicName}. Your follow-up consultation${dx} is scheduled for ${c.follow_up_date}.\n\nLast visit: ${c.visit_date}\n\nKindly reply to confirm or reschedule. Wishing you good health.\n\n— ${clinicName}`;
  };

  const sendOne = async (c: any) => {
    const p = patients[c.patient_id];
    if (!p?.phone) { toast.error("No phone number on file for this patient"); return; }
    setSendingId(c.id);
    const message = buildMessage(c);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { to: p.phone, message },
      });
      if (error) throw error;
      if ((data as any)?.simulated) {
        toast.success("Reminder queued (simulation mode)");
      } else {
        toast.success(`WhatsApp sent to ${p.name}`);
      }
    } catch (e: any) {
      // Fallback: open wa.me
      const digits = String(p.phone).replace(/\D/g, "").slice(-10);
      const url = `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      toast.message("Opened WhatsApp web as fallback");
    } finally {
      setSendingId(null);
    }
  };

  const sendAll = async () => {
    const targets = filtered.filter((c) => patients[c.patient_id]?.phone);
    if (targets.length === 0) { toast.error("No patients with phone numbers in this view"); return; }
    setBulkSending(true);
    let ok = 0, fail = 0;
    for (const c of targets) {
      try {
        const { error } = await supabase.functions.invoke("send-whatsapp", {
          body: { to: patients[c.patient_id]!.phone, message: buildMessage(c) },
        });
        if (error) throw error;
        ok++;
      } catch { fail++; }
    }
    setBulkSending(false);
    toast.success(`Sent ${ok} reminders${fail ? ` · ${fail} failed` : ""}`);
  };

  const tabBtn = (id: Tab, label: string, count: number, tone?: string) => (
    <button
      onClick={() => setTab(id)}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
        tab === id ? `bg-primary text-primary-foreground border-primary` : "bg-background hover:bg-accent"
      }`}
    >
      {label} <span className={`ml-1 rounded px-1.5 ${tone || "bg-muted text-foreground/70"}`}>{count}</span>
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h1 className="font-display text-2xl">Follow-up list</h1>
          <p className="text-xs text-muted-foreground">Send WhatsApp reminders one-by-one or in bulk.</p>
        </div>
        <Button onClick={sendAll} disabled={bulkSending || filtered.length === 0}>
          {bulkSending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
          Send all WhatsApp
        </Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabBtn("today", "Today", counts.today, "bg-primary/15 text-primary")}
        {tabBtn("upcoming", "Upcoming", counts.upcoming)}
        {tabBtn("overdue", "Overdue", counts.overdue, "bg-destructive/15 text-destructive")}
        {tabBtn("all", "All", counts.all)}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarCheck className="mx-auto h-14 w-14 text-muted-foreground" />
          <p className="mt-4 font-display text-xl text-muted-foreground">There is no follow up right now…</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const p = patients[c.patient_id];
            const overdue = c.follow_up_date < today;
            const isToday = c.follow_up_date === today;
            return (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{p?.name || "Patient"}</p>
                    {overdue && <Badge variant="destructive">Overdue</Badge>}
                    {isToday && <Badge className="bg-primary text-primary-foreground">Today</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.diagnosis || "—"}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {p?.phone || "No phone on file"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{c.follow_up_date}</p>
                  <p className="text-xs text-muted-foreground">Last visit: {c.visit_date}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendOne(c)}
                  disabled={!p?.phone || sendingId === c.id}
                  className="gap-1"
                >
                  {sendingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  WhatsApp
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
