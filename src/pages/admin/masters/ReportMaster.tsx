import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Send, Clock } from "lucide-react";
import { toast } from "sonner";

const REPORT_TYPES = [
  { v: "daily_collection", l: "Daily Collection Summary" },
  { v: "patient_count", l: "Patient Count (New / Total)" },
  { v: "appointments", l: "Appointment Summary" },
  { v: "pending_bills", l: "Pending Bills Alert" },
  { v: "expiring_stock", l: "Expiring Stock Alert" },
  { v: "followups_tomorrow", l: "Follow-ups Due Tomorrow" },
  { v: "bed_occupancy", l: "Bed Occupancy Status" },
];

type Branch = { id: string; branch_name: string };
type Config = {
  id?: string;
  branch_id: string;
  recipient_emails: string[];
  report_types: string[];
  send_time: string;
  is_active: boolean;
};
type Log = { id: string; sent_at: string; status: string; recipient_emails: string[]; error_msg: string | null };

export default function ReportMaster() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [configs, setConfigs] = useState<Record<string, Config>>({});
  const [logs, setLogs] = useState<Record<string, Log[]>>({});
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});

  const load = async () => {
    const { data: b } = await supabase.from("hms_branches").select("id,branch_name").order("branch_name");
    setBranches((b as any) ?? []);
    const { data: c } = await supabase.from("hms_report_configs").select("*");
    const cmap: Record<string, Config> = {};
    ((c as any) ?? []).forEach((x: any) => {
      cmap[x.branch_id] = {
        id: x.id, branch_id: x.branch_id,
        recipient_emails: x.recipient_emails || [],
        report_types: x.report_types || [],
        send_time: (x.send_time || "21:00:00").slice(0, 5),
        is_active: x.is_active,
      };
    });
    setConfigs(cmap);
    const { data: lg } = await supabase.from("hms_report_logs").select("*").order("sent_at", { ascending: false }).limit(60);
    const lmap: Record<string, Log[]> = {};
    ((lg as any) ?? []).forEach((x: any) => {
      lmap[x.branch_id] = lmap[x.branch_id] || [];
      if (lmap[x.branch_id].length < 10) lmap[x.branch_id].push(x);
    });
    setLogs(lmap);
  };
  useEffect(() => { load(); }, []);

  const getCfg = (bid: string): Config => configs[bid] || { branch_id: bid, recipient_emails: [], report_types: [], send_time: "21:00", is_active: true };

  const update = (bid: string, patch: Partial<Config>) => setConfigs({ ...configs, [bid]: { ...getCfg(bid), ...patch } });

  const addEmail = (bid: string) => {
    const v = (emailInputs[bid] || "").trim();
    if (!v) return;
    const cfg = getCfg(bid);
    update(bid, { recipient_emails: [...cfg.recipient_emails, v] });
    setEmailInputs({ ...emailInputs, [bid]: "" });
  };
  const removeEmail = (bid: string, em: string) => {
    const cfg = getCfg(bid);
    update(bid, { recipient_emails: cfg.recipient_emails.filter((x) => x !== em) });
  };
  const toggleType = (bid: string, t: string) => {
    const cfg = getCfg(bid);
    const has = cfg.report_types.includes(t);
    update(bid, { report_types: has ? cfg.report_types.filter((x) => x !== t) : [...cfg.report_types, t] });
  };

  const save = async (bid: string) => {
    const cfg = getCfg(bid);
    const payload = {
      branch_id: bid, recipient_emails: cfg.recipient_emails,
      report_types: cfg.report_types, send_time: cfg.send_time + ":00",
      is_active: cfg.is_active,
    };
    const q = cfg.id
      ? supabase.from("hms_report_configs").update(payload).eq("id", cfg.id)
      : supabase.from("hms_report_configs").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved"); load();
  };

  const sendTest = async (bid: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-eod-report", { body: { branch_id: bid } });
      if (error) throw error;
      toast.success("Test report sent"); load();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <HmsMasterHeader title="📊 EOD Reports Config" description="Daily auto-email summary reports per branch." />
      <Accordion type="multiple" className="space-y-2">
        {branches.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">No branches.</Card>}
        {branches.map((b) => {
          const cfg = getCfg(b.id);
          return (
            <AccordionItem key={b.id} value={b.id} className="rounded-lg border bg-card">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{b.branch_name}</span>
                  <Badge variant="outline" className="text-[10px]">{cfg.recipient_emails.length} recipients</Badge>
                  <Badge variant="outline" className="text-[10px]"><Clock className="mr-1 h-3 w-3" />{cfg.send_time}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 px-4 pb-4">
                <div>
                  <Label>Recipient Emails</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cfg.recipient_emails.map((em) => (
                      <Badge key={em} variant="secondary" className="gap-1">
                        {em}<button onClick={() => removeEmail(b.id, em)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input placeholder="add@email.com" value={emailInputs[b.id] || ""}
                      onChange={(e) => setEmailInputs({ ...emailInputs, [b.id]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail(b.id))} />
                    <Button size="sm" onClick={() => addEmail(b.id)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div>
                  <Label>Report Sections</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {REPORT_TYPES.map((rt) => (
                      <label key={rt.v} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={cfg.report_types.includes(rt.v)} onCheckedChange={() => toggleType(b.id, rt.v)} />
                        {rt.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div><Label>Send Time</Label><Input type="time" value={cfg.send_time} onChange={(e) => update(b.id, { send_time: e.target.value })} /></div>
                  <Button onClick={() => save(b.id)}>Save Config</Button>
                  <Button variant="outline" onClick={() => sendTest(b.id)}><Send className="mr-1 h-4 w-4" />Send Test Now</Button>
                </div>
                <div>
                  <Label>Recent Sends</Label>
                  <div className="mt-1 space-y-1">
                    {(logs[b.id] || []).length === 0 && <p className="text-xs text-muted-foreground">No sends yet.</p>}
                    {(logs[b.id] || []).map((l) => (
                      <div key={l.id} className="flex items-center justify-between rounded border bg-muted/30 p-2 text-xs">
                        <span>{new Date(l.sent_at).toLocaleString()}</span>
                        <Badge variant={l.status === "sent" ? "default" : "destructive"} className="text-[10px]">{l.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
