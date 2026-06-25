import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type W = {
  id: string;
  template_name: string;
  template_code: string;
  trigger_event: string;
  message_template: string;
  variables_list: string[];
  language: string;
  is_active: boolean;
};

export default function WhatsAppMaster() {
  const [rows, setRows] = useState<W[]>([]);
  const [testOpen, setTestOpen] = useState(false);
  const [testRow, setTestRow] = useState<W | null>(null);
  const [testPhone, setTestPhone] = useState("");

  const load = async () => {
    const { data } = await supabase.from("hms_whatsapp_templates").select("*").order("template_name");
    setRows(((data as any) ?? []).map((r: any) => ({ ...r, variables_list: r.variables_list || [] })));
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<W>) => {
    const { error } = await supabase.from("hms_whatsapp_templates").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  };

  const insertVar = (id: string, current: string, v: string) => {
    update(id, { message_template: current + ` {{${v}}}` });
  };

  const sendTest = async () => {
    if (!testRow || !testPhone) return;
    const dummy: Record<string, string> = {
      patient_name: "Test User", doctor_name: "Dr. Test", date: new Date().toLocaleDateString(),
      time: "10:00 AM", token_no: "07", clinic_address: "Ayuzee Clinic", amount: "500",
      bill_no: "INV-2026-000001", payment_mode: "Cash", phone: "+91-99999 99999",
      next_visit: "After 1 week", tracking_no: "TRK123", delivery_date: "Tomorrow",
    };
    const filled = testRow.message_template.replace(/\{\{(\w+)\}\}/g, (_, k) => dummy[k] ?? `{{${k}}}`);
    try {
      const { error } = await supabase.functions.invoke("send-whatsapp", {
        body: { to: testPhone, message: filled, template_code: testRow.template_code, variables: dummy },
      });
      if (error) throw error;
      toast.success("Test message sent");
      setTestOpen(false); setTestPhone("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    }
  };

  return (
    <div className="space-y-4">
      <HmsMasterHeader title="💬 WhatsApp Templates" description="Automated WhatsApp messages for appointments, billing, follow-ups and more." />

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.length === 0 && <Card className="col-span-full p-6 text-center text-sm text-muted-foreground">Loading…</Card>}
        {rows.map((r) => (
          <Card key={r.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold">{r.template_name}</h3>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">{r.trigger_event}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.template_code}</Badge>
                </div>
              </div>
              <Switch checked={r.is_active} onCheckedChange={(c) => update(r.id, { is_active: c })} />
            </div>
            <Textarea
              value={r.message_template}
              onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, message_template: e.target.value } : x))}
              onBlur={(e) => update(r.id, { message_template: e.target.value })}
              rows={5}
              className="text-xs font-mono"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select onValueChange={(v) => insertVar(r.id, r.message_template, v)}>
                <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Insert variable" /></SelectTrigger>
                <SelectContent>{r.variables_list.map((v) => <SelectItem key={v} value={v}>{`{{${v}}}`}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={r.language} onValueChange={(v) => update(r.id, { language: v })}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => { setTestRow(r); setTestOpen(true); }}>
                <Send className="mr-1 h-3 w-3" />Test Send
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Test Message</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Template: <strong>{testRow?.template_name}</strong></p>
            <div><Label>Phone (10-digit)</Label><Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="98765 43210" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestOpen(false)}>Cancel</Button>
            <Button onClick={sendTest}><Send className="mr-1 h-4 w-4" />Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
