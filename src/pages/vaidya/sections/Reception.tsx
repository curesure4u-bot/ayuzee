import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Phone,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Crown,
  Megaphone,
  Ticket,
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type Status = "waiting" | "in_consultation" | "completed" | "cancelled" | "no_show";

interface Token {
  id: string;
  doctor_user_id: string;
  token_no: number;
  token_date: string;
  patient_name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  visit_type: string;
  priority: string;
  reason: string | null;
  status: Status;
  called_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_COLUMNS: { key: Status; label: string; tone: string; icon: any }[] = [
  { key: "waiting", label: "Waiting", tone: "from-amber-500/15 to-amber-500/5 border-amber-500/30", icon: Clock },
  { key: "in_consultation", label: "In Consultation", tone: "from-sky-500/15 to-sky-500/5 border-sky-500/30", icon: PlayCircle },
  { key: "completed", label: "Completed", tone: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30", icon: CheckCircle2 },
  { key: "no_show", label: "No-show / Cancelled", tone: "from-rose-500/15 to-rose-500/5 border-rose-500/30", icon: XCircle },
];

const PRIORITY_BADGE: Record<string, { label: string; cls: string; icon: any }> = {
  normal: { label: "Normal", cls: "bg-muted text-foreground", icon: Activity },
  urgent: { label: "Urgent", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400", icon: AlertTriangle },
  vip: { label: "VIP", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Crown },
};

const today = () => new Date().toISOString().slice(0, 10);

const Reception = () => {
  const { userId } = useDoctor();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [date, setDate] = useState<string>(today());
  const [form, setForm] = useState({
    patient_name: "",
    phone: "",
    age: "",
    gender: "",
    visit_type: "walk_in",
    priority: "normal",
    reason: "",
    notes: "",
  });

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("vaidya_queue_tokens")
      .select("*")
      .eq("doctor_user_id", userId)
      .eq("token_date", date)
      .order("token_no", { ascending: true });
    if (error) toast.error(error.message);
    setTokens((data ?? []) as Token[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, date]);

  // Realtime sync
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("queue-tokens")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vaidya_queue_tokens", filter: `doctor_user_id=eq.${userId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, date]);

  const stats = useMemo(() => {
    const total = tokens.length;
    const waiting = tokens.filter((t) => t.status === "waiting").length;
    const inProg = tokens.filter((t) => t.status === "in_consultation").length;
    const done = tokens.filter((t) => t.status === "completed").length;
    const avgWait =
      tokens
        .filter((t) => t.started_at && t.created_at)
        .reduce((acc, t) => acc + (new Date(t.started_at!).getTime() - new Date(t.created_at).getTime()) / 60000, 0) /
        Math.max(1, tokens.filter((t) => t.started_at).length) || 0;
    return { total, waiting, inProg, done, avgWait: Math.round(avgWait) };
  }, [tokens]);

  const nextTokenNo = useMemo(() => {
    if (!tokens.length) return 1;
    return Math.max(...tokens.map((t) => t.token_no)) + 1;
  }, [tokens]);

  const submitToken = async () => {
    if (!userId) return;
    if (form.patient_name.trim().length < 2) return toast.error("Patient name required");
    const { error } = await supabase.from("vaidya_queue_tokens").insert({
      doctor_user_id: userId,
      created_by: userId,
      token_no: nextTokenNo,
      token_date: date,
      patient_name: form.patient_name.trim(),
      phone: form.phone.trim() || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      visit_type: form.visit_type,
      priority: form.priority,
      reason: form.reason.trim() || null,
      notes: form.notes.trim() || null,
      status: "waiting",
    });
    if (error) return toast.error(error.message);
    toast.success(`Token #${nextTokenNo} issued`);
    setOpenNew(false);
    setForm({ patient_name: "", phone: "", age: "", gender: "", visit_type: "walk_in", priority: "normal", reason: "", notes: "" });
  };

  const updateStatus = async (id: string, status: Status) => {
    const patch: any = { status };
    if (status === "in_consultation") {
      patch.called_at = new Date().toISOString();
      patch.started_at = new Date().toISOString();
    }
    if (status === "completed") patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from("vaidya_queue_tokens").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
  };

  const callToken = async (t: Token) => {
    await supabase.from("vaidya_queue_tokens").update({ called_at: new Date().toISOString() }).eq("id", t.id);
    toast.success(`Calling Token #${t.token_no} — ${t.patient_name}`);
    // Optional voice announcement
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(`Token number ${t.token_no}, ${t.patient_name}, please proceed.`);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const groupByStatus = (s: Status) =>
    tokens
      .filter((t) => t.status === s)
      .sort((a, b) => {
        const pri = (x: string) => (x === "vip" ? 0 : x === "urgent" ? 1 : 2);
        if (pri(a.priority) !== pri(b.priority)) return pri(a.priority) - pri(b.priority);
        return a.token_no - b.token_no;
      });

  const StatCard = ({ label, value, icon: Icon, gradient, suffix }: any) => (
    <Card className={`bg-gradient-to-br ${gradient} p-4 text-primary-foreground`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-90">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {value}
            {suffix && <span className="ml-1 text-sm font-normal opacity-80">{suffix}</span>}
          </p>
        </div>
        <Icon className="h-8 w-8 opacity-80" />
      </div>
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Reception & Queue</h1>
          <p className="text-sm text-muted-foreground">Manage today's tokens, walk-ins and consultation flow.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" /> New Token</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Issue token #{nextTokenNo}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>Patient name *</Label>
                  <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Visit type</Label>
                    <Select value={form.visit_type} onValueChange={(v) => setForm({ ...form, visit_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Reason for visit</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
                <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submitToken}>Issue Token</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Today" value={stats.total} icon={Ticket} gradient="from-primary/80 to-primary" />
        <StatCard label="Waiting" value={stats.waiting} icon={Clock} gradient="from-amber-500/80 to-amber-500" />
        <StatCard label="In Consultation" value={stats.inProg} icon={PlayCircle} gradient="from-sky-500/80 to-sky-500" />
        <StatCard label="Completed" value={stats.done} icon={CheckCircle2} gradient="from-emerald-500/80 to-emerald-500" />
        <StatCard label="Avg Wait" value={stats.avgWait} suffix="min" icon={TrendingUp} gradient="from-violet-500/80 to-violet-500" />
      </div>

      {/* Kanban */}
      <div className="grid gap-4 lg:grid-cols-4">
        {STATUS_COLUMNS.map((col) => {
          const items = groupByStatus(col.key);
          const ColIcon = col.icon;
          return (
            <Card key={col.key} className={`bg-gradient-to-b ${col.tone} p-3`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColIcon className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                </div>
                <Badge variant="outline" className="bg-background/60">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {loading ? (
                  <p className="text-center text-xs text-muted-foreground py-6">Loading…</p>
                ) : items.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">No tokens</p>
                ) : (
                  items.map((t) => {
                    const pri = PRIORITY_BADGE[t.priority] ?? PRIORITY_BADGE.normal;
                    const PriIcon = pri.icon;
                    return (
                      <Card key={t.id} className="bg-background/95 p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {t.token_no}
                            </span>
                            <div>
                              <p className="text-sm font-semibold leading-tight">{t.patient_name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {t.visit_type.replace("_", " ")}
                                {t.age ? ` · ${t.age}y` : ""}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${pri.cls}`}>
                            <PriIcon className="h-3 w-3" />{pri.label}
                          </span>
                        </div>
                        {t.reason && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{t.reason}</p>}
                        {t.phone && (
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Phone className="h-3 w-3" />{t.phone}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {col.key === "waiting" && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => callToken(t)}>
                                <Megaphone className="mr-1 h-3 w-3" />Call
                              </Button>
                              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => updateStatus(t.id, "in_consultation")}>
                                <PlayCircle className="mr-1 h-3 w-3" />Start
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-rose-600" onClick={() => updateStatus(t.id, "no_show")}>
                                No-show
                              </Button>
                            </>
                          )}
                          {col.key === "in_consultation" && (
                            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => updateStatus(t.id, "completed")}>
                              <CheckCircle2 className="mr-1 h-3 w-3" />Complete
                            </Button>
                          )}
                          {(col.key === "completed" || col.key === "no_show") && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateStatus(t.id, "waiting")}>
                              Reopen
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Reception;
