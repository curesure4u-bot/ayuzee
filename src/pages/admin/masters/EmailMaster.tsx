import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

type E = {
  id: string;
  template_name: string;
  template_code: string;
  trigger_event: string | null;
  subject_line: string | null;
  body_html: string | null;
  recipient_type: string | null;
  cc_emails: string[];
  is_active: boolean;
};

const empty: Partial<E> = { template_name: "", template_code: "", subject_line: "", body_html: "", cc_emails: [], is_active: true };

const fillSample = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => `[${k}]`);

export default function EmailMaster() {
  const [rows, setRows] = useState<E[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<E>>(empty);
  const [ccText, setCcText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("hms_email_templates").select("*").order("template_name");
    setRows(((data as any) ?? []).map((r: any) => ({ ...r, cc_emails: r.cc_emails || [] })));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setCcText(""); setOpen(true); };
  const openEdit = (r: E) => { setForm(r); setCcText((r.cc_emails || []).join(", ")); setOpen(true); };

  const save = async () => {
    if (!form.template_name || !form.template_code) return toast.error("Name and code required");
    const payload: any = {
      template_name: form.template_name, template_code: form.template_code,
      trigger_event: form.trigger_event, subject_line: form.subject_line,
      body_html: form.body_html, recipient_type: form.recipient_type,
      cc_emails: ccText.split(",").map((s) => s.trim()).filter(Boolean),
      is_active: form.is_active,
    };
    const q = form.id
      ? supabase.from("hms_email_templates").update(payload).eq("id", form.id)
      : supabase.from("hms_email_templates").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("hms_email_templates").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <HmsMasterHeader title="📧 Email Templates" description="Email templates for receipts, follow-ups and reports."
        actions={<Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />New</Button>} />

      <div className="grid gap-3 md:grid-cols-2">
        {rows.length === 0 && <Card className="col-span-full p-6 text-center text-sm text-muted-foreground">No email templates yet.</Card>}
        {rows.map((r) => (
          <Card key={r.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><h3 className="font-semibold">{r.template_name}</h3></div>
                <p className="text-xs text-muted-foreground">{r.template_code} · {r.trigger_event || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
            <p className="text-xs"><strong>Subject:</strong> {r.subject_line}</p>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Email Template</DialogTitle></DialogHeader>
          <Tabs defaultValue="edit">
            <TabsList><TabsTrigger value="edit">Edit</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger></TabsList>
            <TabsContent value="edit" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Name</Label><Input value={form.template_name || ""} onChange={(e) => setForm({ ...form, template_name: e.target.value })} /></div>
                <div><Label>Code (unique)</Label><Input value={form.template_code || ""} onChange={(e) => setForm({ ...form, template_code: e.target.value })} /></div>
                <div><Label>Trigger Event</Label><Input value={form.trigger_event || ""} onChange={(e) => setForm({ ...form, trigger_event: e.target.value })} placeholder="e.g. order_confirmed" /></div>
                <div><Label>Recipient Type</Label><Input value={form.recipient_type || ""} onChange={(e) => setForm({ ...form, recipient_type: e.target.value })} placeholder="patient | doctor | admin" /></div>
              </div>
              <div><Label>Subject (supports {`{{variable}}`})</Label><Input value={form.subject_line || ""} onChange={(e) => setForm({ ...form, subject_line: e.target.value })} /></div>
              <div><Label>CC Emails (comma-separated)</Label><Input value={ccText} onChange={(e) => setCcText(e.target.value)} /></div>
              <div><Label>Body HTML</Label><Textarea rows={10} className="font-mono text-xs" value={form.body_html || ""} onChange={(e) => setForm({ ...form, body_html: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} /><Label>Active</Label></div>
            </TabsContent>
            <TabsContent value="preview">
              <p className="mb-2 text-xs"><strong>Subject:</strong> {fillSample(form.subject_line || "")}</p>
              <div className="rounded border bg-white p-4 text-sm" dangerouslySetInnerHTML={{ __html: fillSample(form.body_html || "") }} />
            </TabsContent>
          </Tabs>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
