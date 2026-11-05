import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown, Printer, Pencil } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Field = { id: string; label: string; field_type: string; required: boolean; options?: string[] };
type Form = { id: string; form_name: string; form_type: string; form_fields: Field[]; is_active: boolean };

const FORM_TYPES = [
  { value: "patient_intake", label: "Patient Intake" },
  { value: "consent", label: "Consent" },
  { value: "feedback", label: "Feedback" },
  { value: "discharge_summary", label: "Discharge" },
  { value: "referral", label: "Referral" },
];

const FIELD_TYPES = ["text", "number", "date", "dropdown", "checkbox", "radio", "textarea"];

const FormMaster = () => {
  const [rows, setRows] = useState<Form[]>([]);
  const [selected, setSelected] = useState<Form | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Form | null>(null);

  const load = async () => {
    const { data } = await supabase.from("hms_custom_forms").select("*").order("form_name");
    setRows(((data as any) ?? []) as Form[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ id: "", form_name: "", form_type: "patient_intake", form_fields: [], is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (f: Form) => {
    setEditing(JSON.parse(JSON.stringify(f)));
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing || !editing.form_name) { toast.error("Name required"); return; }
    const payload: any = { form_name: editing.form_name, form_type: editing.form_type, form_fields: editing.form_fields };
    const q = editing.id
      ? supabase.from("hms_custom_forms").update(payload).eq("id", editing.id)
      : supabase.from("hms_custom_forms").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setDialogOpen(false);
    load();
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("hms_custom_forms").update({ is_active: v }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("hms_custom_forms").delete().eq("id", id);
    load();
  };

  const addField = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      form_fields: [...editing.form_fields, { id: `f${Date.now()}`, label: "", field_type: "text", required: false }],
    });
  };
  const updField = (idx: number, patch: Partial<Field>) => {
    if (!editing) return;
    const fields = [...editing.form_fields];
    fields[idx] = { ...fields[idx], ...patch };
    setEditing({ ...editing, form_fields: fields });
  };
  const moveField = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const fields = [...editing.form_fields];
    const t = idx + dir;
    if (t < 0 || t >= fields.length) return;
    [fields[idx], fields[t]] = [fields[t], fields[idx]];
    setEditing({ ...editing, form_fields: fields });
  };
  const rmField = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, form_fields: editing.form_fields.filter((_, i) => i !== idx) });
  };

  const renderPreview = (f: Form) => (
    <div className="space-y-3">
      {f.form_fields.map((field) => (
        <div key={field.id}>
          <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          {field.field_type === "textarea" ? <Textarea disabled />
            : field.field_type === "checkbox" ? <div className="flex items-center gap-2"><Checkbox disabled /><span className="text-sm">{field.label}</span></div>
            : field.field_type === "radio" ? <div className="flex gap-3">{(field.options || []).map((o) => <label key={o} className="flex items-center gap-1 text-sm"><input type="radio" disabled />{o}</label>)}</div>
            : field.field_type === "dropdown" ? <Select disabled><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></Select>
            : <Input type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"} disabled />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="📝 Form Master"
        description="Custom forms — consent, intake, discharge, referral."
        actions={<Button size="sm" onClick={openNew}><Plus className="mr-2 h-4 w-4" />New Form</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {rows.map((f) => (
            <Card key={f.id} className={`cursor-pointer p-3 ${selected?.id === f.id ? "border-primary" : ""}`} onClick={() => setSelected(f)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{f.form_name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{f.form_type.replace("_", " ")} · {f.form_fields.length} fields</p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={f.is_active} onCheckedChange={(v) => toggle(f.id, v)} />
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(f); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); del(f.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No forms.</p>}
        </div>

        {selected && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{selected.form_name} — Preview</h3>
              <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-3 w-3" />Print</Button>
            </div>
            {renderPreview(selected)}
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} form</DialogTitle></DialogHeader>
          {editing && (
            <Tabs defaultValue="build">
              <TabsList><TabsTrigger value="build">Build</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger></TabsList>
              <TabsContent value="build" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input value={editing.form_name} onChange={(e) => setEditing({ ...editing, form_name: e.target.value })} /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={editing.form_type} onValueChange={(v) => setEditing({ ...editing, form_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FORM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <Label>Fields ({editing.form_fields.length})</Label>
                  <Button size="sm" variant="outline" onClick={addField}><Plus className="mr-1 h-3 w-3" />Add Field</Button>
                </div>
                <div className="space-y-2">
                  {editing.form_fields.map((field, idx) => (
                    <Card key={field.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-1 flex flex-col">
                          <Button size="icon" variant="ghost" className="h-6" onClick={() => moveField(idx, -1)}><ArrowUp className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6" onClick={() => moveField(idx, 1)}><ArrowDown className="h-3 w-3" /></Button>
                        </div>
                        <Input className="col-span-4" placeholder="Label" value={field.label} onChange={(e) => updField(idx, { label: e.target.value })} />
                        <Select value={field.field_type} onValueChange={(v) => updField(idx, { field_type: v })}>
                          <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                          <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                        <label className="col-span-3 flex items-center gap-2 text-sm">
                          <Checkbox checked={field.required} onCheckedChange={(v) => updField(idx, { required: !!v })} /> Required
                        </label>
                        <Button size="icon" variant="ghost" className="col-span-1" onClick={() => rmField(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        {(field.field_type === "dropdown" || field.field_type === "radio") && (
                          <Input className="col-span-12" placeholder="Options (comma-separated)" value={(field.options || []).join(", ")} onChange={(e) => updField(idx, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="preview">{renderPreview(editing)}</TabsContent>
            </Tabs>
          )}
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormMaster;
