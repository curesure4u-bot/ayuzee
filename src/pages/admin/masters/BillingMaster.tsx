import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

const TABS = [
  { key: "payment-types", label: "Payment Types" },
  { key: "discount-categories", label: "Discount Categories" },
  { key: "discount-remarks", label: "Discount Remarks" },
  { key: "expense-categories", label: "Expense Categories" },
  { key: "bill-series", label: "Bill Series" },
];

const BillingMaster = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.replace("#", "");
  const initial = TABS.find((t) => t.key === hash)?.key ?? "payment-types";
  const [tab, setTab] = useState(initial);

  useEffect(() => { if (hash && TABS.find((t) => t.key === hash)) setTab(hash); }, [hash]);
  const onTabChange = (v: string) => { setTab(v); navigate(`#${v}`, { replace: true }); };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader title="💳 Billing Master" description="Payment types, discounts, expenses, and bill series — one place for all billing config." />
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="mb-4 flex flex-wrap">
          {TABS.map((t) => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="payment-types"><PaymentTypesTab /></TabsContent>
        <TabsContent value="discount-categories"><DiscountCategoriesTab /></TabsContent>
        <TabsContent value="discount-remarks"><DiscountRemarksTab /></TabsContent>
        <TabsContent value="expense-categories"><ExpenseCategoriesTab /></TabsContent>
        <TabsContent value="bill-series"><BillSeriesTab /></TabsContent>
      </Tabs>
    </div>
  );
};

/* ---------- PAYMENT TYPES ---------- */
function PaymentTypesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const empty = { id: "", payment_type_name: "", payment_type_code: "", is_online: false, gateway: "other", sort_order: 0 };
  const [form, setForm] = useState<any>(empty);
  const load = async () => { const { data } = await supabase.from("hms_payment_types").select("*").order("sort_order"); setRows(data ?? []); };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.payment_type_name) { toast.error("Name required"); return; }
    const p: any = { ...form }; delete p.id;
    const { error } = form.id ? await supabase.from("hms_payment_types").update(p).eq("id", form.id) : await supabase.from("hms_payment_types").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Payment Type</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} payment type</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.payment_type_name} onChange={(e) => setForm({ ...form, payment_type_name: e.target.value })} /></div>
              <div><Label>Code</Label><Input value={form.payment_type_code} onChange={(e) => setForm({ ...form, payment_type_code: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_online} onCheckedChange={(v) => setForm({ ...form, is_online: v })} /><Label>Online payment</Label></div>
              <div><Label>Gateway</Label><Input value={form.gateway} onChange={(e) => setForm({ ...form, gateway: e.target.value })} /></div>
              <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{r.sort_order}</Badge>
              <span className="font-medium">{r.payment_type_name}</span>
              {r.payment_type_code && <span className="text-xs text-muted-foreground">[{r.payment_type_code}]</span>}
              {r.is_online && <Badge className="bg-blue-100 text-blue-800">Online</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_payment_types").update({ is_active: v }).eq("id", r.id); load(); }} />
              <Button size="icon" variant="ghost" onClick={() => { setForm(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_payment_types").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- DISCOUNT CATEGORIES ---------- */
function DiscountCategoriesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const empty = { id: "", category_name: "", max_discount_percent: 20, requires_approval: false, approval_threshold_percent: 20 };
  const [form, setForm] = useState<any>(empty);
  const load = async () => { const { data } = await supabase.from("hms_discount_categories").select("*").order("category_name"); setRows(data ?? []); };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.category_name) return toast.error("Name required");
    const p: any = { ...form }; delete p.id;
    const { error } = form.id ? await supabase.from("hms_discount_categories").update(p).eq("id", form.id) : await supabase.from("hms_discount_categories").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Discount Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} discount category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} /></div>
              <div><Label>Max discount %</Label><Input type="number" value={form.max_discount_percent} onChange={(e) => setForm({ ...form, max_discount_percent: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2"><Switch checked={form.requires_approval} onCheckedChange={(v) => setForm({ ...form, requires_approval: v })} /><Label>Requires approval</Label></div>
              <div><Label>Approval threshold %</Label><Input type="number" value={form.approval_threshold_percent} onChange={(e) => setForm({ ...form, approval_threshold_percent: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="font-medium">{r.category_name}</span>
              <Badge variant="outline">Max {r.max_discount_percent}%</Badge>
              {r.requires_approval && <Badge className="bg-amber-100 text-amber-800">Approval &gt; {r.approval_threshold_percent}%</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_discount_categories").update({ is_active: v }).eq("id", r.id); load(); }} />
              <Button size="icon" variant="ghost" onClick={() => { setForm(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_discount_categories").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- DISCOUNT REMARKS ---------- */
function DiscountRemarksTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [text, setText] = useState("");
  const load = async () => { const { data } = await supabase.from("hms_discount_remarks").select("*").order("created_at"); setRows(data ?? []); };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!text.trim()) return;
    const { error } = await supabase.from("hms_discount_remarks").insert({ remark_text: text.trim() });
    if (error) return toast.error(error.message);
    setText(""); load();
  };
  return (
    <>
      <div className="mb-3 flex gap-2">
        <Input placeholder="New discount remark" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button onClick={add}><Plus className="mr-2 h-4 w-4" />Add</Button>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-3">
            <span>{r.remark_text}</span>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_discount_remarks").update({ is_active: v }).eq("id", r.id); load(); }} />
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_discount_remarks").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- EXPENSE CATEGORIES ---------- */
function ExpenseCategoriesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const empty = { id: "", category_name: "", category_code: "", parent_category_id: "none" };
  const [form, setForm] = useState<any>(empty);
  const load = async () => { const { data } = await supabase.from("hms_expense_categories").select("*").order("category_name"); setRows(data ?? []); };
  useEffect(() => { load(); }, []);
  const parents = rows.filter((r) => !r.parent_category_id);
  const childrenOf = (pid: string) => rows.filter((r) => r.parent_category_id === pid);
  const save = async () => {
    if (!form.category_name) return toast.error("Name required");
    const p: any = { category_name: form.category_name, category_code: form.category_code || null, parent_category_id: form.parent_category_id === "none" ? null : form.parent_category_id };
    const { error } = form.id ? await supabase.from("hms_expense_categories").update(p).eq("id", form.id) : await supabase.from("hms_expense_categories").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Expense Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} expense category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} /></div>
              <div><Label>Code</Label><Input value={form.category_code} onChange={(e) => setForm({ ...form, category_code: e.target.value })} /></div>
              <div>
                <Label>Parent (optional)</Label>
                <Select value={form.parent_category_id} onValueChange={(v) => setForm({ ...form, parent_category_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None (top-level) —</SelectItem>
                    {parents.map((p) => <SelectItem key={p.id} value={p.id}>{p.category_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {parents.map((p) => (
          <Card key={p.id} className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{p.category_code}</Badge>
                <h4 className="font-semibold">{p.category_name}</h4>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setForm({ ...p, parent_category_id: "none" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 pl-2">
              {childrenOf(p.id).map((c) => (
                <Badge key={c.id} variant="secondary" className="gap-1">
                  {c.category_name}
                  <button onClick={async () => { if (confirm(`Delete ${c.category_name}?`)) { await supabase.from("hms_expense_categories").delete().eq("id", c.id); load(); } }}><Trash2 className="h-3 w-3" /></button>
                </Badge>
              ))}
              {childrenOf(p.id).length === 0 && <span className="text-xs text-muted-foreground">No sub-categories</span>}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- BILL SERIES ---------- */
function BillSeriesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<any>(null);
  const empty = { id: "", series_name: "", prefix: "", branch_id: "", financial_year_start: "2025-04-01" };
  const [form, setForm] = useState<any>(empty);
  const load = async () => {
    const [s, b] = await Promise.all([
      supabase.from("hms_bill_series").select("*, hms_branches(branch_name)").order("prefix"),
      supabase.from("hms_branches").select("id, branch_name").eq("is_active", true).order("branch_name"),
    ]);
    setRows(s.data ?? []); setBranches(b.data ?? []);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.series_name || !form.prefix) return toast.error("Name & prefix required");
    const p: any = { ...form, branch_id: form.branch_id || null };
    delete p.id; delete p.hms_branches;
    const { error } = form.id ? await supabase.from("hms_bill_series").update(p).eq("id", form.id) : await supabase.from("hms_bill_series").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };
  const nextNo = (r: any) => {
    const fy = r.financial_year_start ? `-${String(new Date(r.financial_year_start).getFullYear()).slice(2)}${String(new Date(r.financial_year_start).getFullYear()+1).slice(2)}` : "";
    return `${r.prefix}${fy}-${String(r.current_number).padStart(5, "0")}`;
  };
  const resetCounter = async () => {
    if (!resetTarget) return;
    await supabase.from("hms_bill_series").update({ current_number: 1 }).eq("id", resetTarget.id);
    toast.success("Counter reset to 1"); setResetTarget(null); load();
  };
  return (
    <div id="bill-series">
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Bill Series</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} bill series</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Series name</Label><Input value={form.series_name} onChange={(e) => setForm({ ...form, series_name: e.target.value })} /></div>
              <div><Label>Prefix</Label><Input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} /></div>
              <div>
                <Label>Branch</Label>
                <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                  <SelectTrigger><SelectValue placeholder="— Select branch —" /></SelectTrigger>
                  <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.branch_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Financial year start</Label><Input type="date" value={form.financial_year_start} onChange={(e) => setForm({ ...form, financial_year_start: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.prefix}</Badge>
                <span className="font-medium">{r.series_name}</span>
                {r.hms_branches?.branch_name && <Badge variant="secondary">{r.hms_branches.branch_name}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Next bill number: <span className="font-mono font-semibold text-foreground">{nextNo(r)}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_bill_series").update({ is_active: v }).eq("id", r.id); load(); }} />
              <Button size="sm" variant="outline" onClick={() => setResetTarget(r)}><RotateCcw className="mr-2 h-3 w-3" />Reset Counter</Button>
              <Button size="icon" variant="ghost" onClick={() => { setForm(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete series?")) { await supabase.from("hms_bill_series").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!resetTarget} onOpenChange={(v) => !v && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset bill counter?</DialogTitle>
            <DialogDescription>
              This will reset the counter for <strong>{resetTarget?.prefix}</strong> back to <strong>00001</strong>. New bills will start from {resetTarget?.prefix}-…-00001.
              <br /><br />Type <strong>RESET</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <ConfirmReset onConfirm={resetCounter} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConfirmReset({ onConfirm }: { onConfirm: () => void }) {
  const [text, setText] = useState("");
  return (
    <>
      <Input placeholder="Type RESET" value={text} onChange={(e) => setText(e.target.value)} />
      <DialogFooter><Button variant="destructive" disabled={text !== "RESET"} onClick={onConfirm}>Reset counter</Button></DialogFooter>
    </>
  );
}

export default BillingMaster;
