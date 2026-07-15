import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

type T = {
  id: string;
  template_name: string;
  template_type: string;
  ayush_system: string;
  content_html: string;
  is_default: boolean;
  is_active: boolean;
  language: string;
};

const TYPES = [
  { v: "prescription", l: "Prescription" },
  { v: "discharge_summary", l: "Discharge Summary" },
  { v: "referral_letter", l: "Referral Letter" },
  { v: "fitness_certificate", l: "Fitness Certificate" },
  { v: "sick_leave", l: "Sick Leave" },
  { v: "consent_form", l: "Consent Form" },
  { v: "ip_admission_form", l: "IP Admission" },
  { v: "lab_request", l: "Lab Request" },
];

const VARIABLES = [
  "patient_name","age","gender","doctor_name","date","diagnosis","medicines",
  "clinic_name","clinic_address","reg_no","admission_date","discharge_date",
  "treatment_summary","next_visit","mobile","address",
];

const SAMPLE: Record<string, string> = {
  patient_name: "Ravi Kumar", age: "42", gender: "M", doctor_name: "Dr. Saleem",
  date: new Date().toLocaleDateString(), diagnosis: "Sandhivata (Osteoarthritis)",
  medicines: "Yogaraja Guggulu 500mg BD x 30 days", clinic_name: "Ayuzee Clinic — Chennai",
  clinic_address: "12, Anna Salai, Chennai", reg_no: "TN-AY-12345",
  admission_date: "01-Jan-2026", discharge_date: "07-Jan-2026",
  treatment_summary: "Abhyanga + Swedana + Basti x 7 days", next_visit: "After 15 days",
  mobile: "+91-98765 43210", address: "T Nagar, Chennai",
};

const fill = (html: string, data: Record<string, string> = SAMPLE) =>
  html.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? `{{${k}}}`);

const empty: Partial<T> = {
  template_name: "", template_type: "prescription", ayush_system: "all",
  content_html: "", is_default: false, is_active: true, language: "english",
};

export default function TemplateMaster() {
  const [rows, setRows] = useState<T[]>([]);
  const [tab, setTab] = useState("prescription");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<T>>(empty);
  const editorRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase.from("hms_document_templates").select("*").order("template_type").order("template_name");
    setRows((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => r.template_type === tab), [rows, tab]);

  const openNew = () => { setForm({ ...empty, template_type: tab }); setOpen(true); };
  const openEdit = (r: T) => { setForm(r); setOpen(true); };

  const save = async () => {
    if (!form.template_name) return toast.error("Name required");
    const html = editorRef.current?.innerHTML || form.content_html || "";
    const payload: any = {
      template_name: form.template_name, template_type: form.template_type,
      content_html: html, is_default: form.is_default, is_active: form.is_active,
      language: form.language, ayush_system: form.ayush_system || "all",
    };
    if (form.is_default && form.template_type) {
      await supabase.from("hms_document_templates").update({ is_default: false }).eq("template_type", form.template_type);
    }
    const q = form.id
      ? supabase.from("hms_document_templates").update(payload).eq("id", form.id)
      : supabase.from("hms_document_templates").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete template?")) return;
    const { error } = await supabase.from("hms_document_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const insertVar = (v: string) => {
    const text = `{{${v}}}`;
    document.execCommand("insertText", false, text);
    editorRef.current?.focus();
  };

  const exec = (cmd: string) => document.execCommand(cmd, false);

  const downloadPdf = (t: T) => {
    const doc = new jsPDF();
    const txt = fill(t.content_html).replace(/<[^>]+>/g, "\n").replace(/\n\s*\n/g, "\n").trim();
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(txt, 180), 15, 20);
    doc.save(`${t.template_name}.pdf`);
  };

  return (
    <div className="space-y-4">
      <HmsMasterHeader
        title="📋 Document Templates"
        description="Prescription, discharge, referral, fitness, consent and lab request templates."
        actions={<Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />New Template</Button>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          {TYPES.map((t) => <TabsTrigger key={t.v} value={t.v}>{t.l}</TabsTrigger>)}
        </TabsList>

        {TYPES.map((t) => (
          <TabsContent key={t.v} value={t.v} className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.length === 0 && (
                <Card className="col-span-full p-6 text-center text-sm text-muted-foreground">No templates yet. Click "New Template" to add one.</Card>
              )}
              {filtered.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{r.template_name}</h3>
                        {r.is_default && <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Default</span>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{r.language} · {r.ayush_system}</p>
                    </div>
                  </div>
                  <div className="mt-3 max-h-32 overflow-hidden rounded border bg-muted/30 p-2 text-[10px]"
                       dangerouslySetInnerHTML={{ __html: fill(r.content_html) }} />
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(r)}><Download className="mr-1 h-3 w-3" />PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{form.id ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
          <Tabs defaultValue="edit">
            <TabsList><TabsTrigger value="edit">Edit</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger></TabsList>
            <TabsContent value="edit" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Name</Label><Input value={form.template_name || ""} onChange={(e) => setForm({ ...form, template_name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.template_type} onValueChange={(v) => setForm({ ...form, template_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="tamil">Tamil</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex items-center gap-2"><Switch checked={!!form.is_default} onCheckedChange={(c) => setForm({ ...form, is_default: c })} /><Label>Default</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} /><Label>Active</Label></div>
                </div>
              </div>
              <div className="rounded border">
                <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => exec("bold")}><strong>B</strong></Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => exec("italic")}><em>I</em></Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => exec("underline")}><span className="underline">U</span></Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => exec("insertHorizontalRule")}>HR</Button>
                  <Select onValueChange={insertVar}>
                    <SelectTrigger className="h-8 w-44"><SelectValue placeholder="Insert variable…" /></SelectTrigger>
                    <SelectContent>{VARIABLES.map((v) => <SelectItem key={v} value={v}>{`{{${v}}}`}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div ref={editorRef} contentEditable suppressContentEditableWarning
                     className="min-h-[280px] p-3 text-sm focus:outline-none"
                     dangerouslySetInnerHTML={{ __html: form.content_html || "" }} />
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="rounded border bg-white p-4" dangerouslySetInnerHTML={{ __html: fill(editorRef.current?.innerHTML || form.content_html || "") }} />
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
