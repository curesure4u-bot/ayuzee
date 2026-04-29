import { useEffect, useMemo, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ReceiptText, Trash2, Sparkles, FileText, MessageCircle, Printer, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import {
  startAyuzeePdf, addTitle, addPlainTable, addSectionTable,
  finalizeAyuzeePdf, safeFileName,
} from "@/lib/pdf/ayuzeePdf";

interface Props { type: "patient_bill" | "direct_selling" }

interface LineForm {
  item_type: "medicine" | "therapy" | "consultation" | "other";
  medicine_name: string;
  hsn_code: string;
  quantity: string;
  unit_price: string;
}

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "netbanking", label: "Net Banking" },
  { value: "cheque", label: "Cheque" },
  { value: "credit", label: "Credit / Pending" },
];

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const fmtINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);

const BillsPage = ({ type }: Props) => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Clinic profile (used as defaults on new bills)
  const [clinic, setClinic] = useState({ name: "", address: "", gstin: "" });

  // Create / preview state
  const [open, setOpen] = useState(false);
  const [previewBill, setPreviewBill] = useState<any | null>(null);
  const [previewItems, setPreviewItems] = useState<any[]>([]);

  const [form, setForm] = useState({
    bill_date: new Date().toISOString().slice(0, 10),
    patient_name: "",
    patient_phone: "",
    patient_gstin: "",
    payment_mode: "cash",
    payment_reference: "",
    status: "paid",
    notes: "",
    discount: "0",
    gst_rate: "0",
    is_interstate: false,
    clinic_name: "",
    clinic_address: "",
    gstin: "",
  });
  const [lines, setLines] = useState<LineForm[]>([
    { item_type: "medicine", medicine_name: "", hsn_code: "", quantity: "1", unit_price: "0" },
  ]);

  const load = async () => {
    if (!userId) return;
    const [{ data: bills }, { data: inv }, { data: doc }] = await Promise.all([
      supabase.from("vaidya_bills").select("*").eq("doctor_user_id", userId).eq("bill_type", type).order("created_at", { ascending: false }),
      supabase.from("vaidya_inventory").select("id, medicine_name, mrp, quantity").eq("doctor_user_id", userId),
      supabase.from("doctors").select("clinic_name, city").eq("user_id", userId).maybeSingle(),
    ]);
    setItems(bills ?? []);
    setStock(inv ?? []);
    // Last-used GSTIN persists per doctor in localStorage
    const savedGstin = typeof window !== "undefined" ? localStorage.getItem(`vaidya:gstin:${userId}`) || "" : "";
    if (doc) setClinic({ name: doc.clinic_name || "", address: doc.city || "", gstin: savedGstin });
    else setClinic(c => ({ ...c, gstin: savedGstin }));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId, type]);

  // Apply clinic defaults whenever opening the dialog
  useEffect(() => {
    if (open) {
      setForm(f => ({ ...f, clinic_name: f.clinic_name || clinic.name, clinic_address: f.clinic_address || clinic.address, gstin: f.gstin || clinic.gstin }));
    }
  }, [open, clinic]);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0), [lines]);
  const discount = Number(form.discount || 0);
  const taxableValue = Math.max(0, subtotal - discount);
  const gstRate = Number(form.gst_rate || 0);
  const gstAmount = +(taxableValue * gstRate / 100).toFixed(2);
  const cgst = form.is_interstate ? 0 : +(gstAmount / 2).toFixed(2);
  const sgst = form.is_interstate ? 0 : +(gstAmount / 2).toFixed(2);
  const igst = form.is_interstate ? gstAmount : 0;
  const grandTotal = +(taxableValue + gstAmount).toFixed(2);

  const resetForm = () => {
    setForm({
      bill_date: new Date().toISOString().slice(0, 10),
      patient_name: "", patient_phone: "", patient_gstin: "",
      payment_mode: "cash", payment_reference: "", status: "paid", notes: "",
      discount: "0", gst_rate: "0", is_interstate: false,
      clinic_name: clinic.name, clinic_address: clinic.address, gstin: clinic.gstin,
    });
    setLines([{ item_type: "medicine", medicine_name: "", hsn_code: "", quantity: "1", unit_price: "0" }]);
  };

  const submit = async () => {
    if (!userId) return;
    if (!form.patient_name.trim()) return toast.error("Patient name required");
    const validLines = lines.filter(l => l.medicine_name.trim());
    if (validLines.length === 0) return toast.error("Add at least one item");

    const { data: bill, error } = await supabase
      .from("vaidya_bills")
      .insert({
        doctor_user_id: userId,
        patient_name: form.patient_name.trim(),
        patient_phone: form.patient_phone || null,
        patient_gstin: form.patient_gstin || null,
        bill_type: type,
        bill_date: form.bill_date,
        clinic_name: form.clinic_name || null,
        clinic_address: form.clinic_address || null,
        gstin: form.gstin || null,
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        gst_rate: gstRate,
        gst_amount: gstAmount,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        is_interstate: form.is_interstate,
        total: Math.round(grandTotal),
        payment_mode: form.payment_mode,
        payment_reference: form.payment_reference || null,
        status: form.status,
        notes: form.notes || null,
      })
      .select()
      .single();
    if (error || !bill) return toast.error(error?.message || "Failed");

    const itemsRows = validLines.map(l => ({
      bill_id: bill.id,
      item_type: l.item_type,
      medicine_name: l.medicine_name.trim(),
      hsn_code: l.hsn_code || null,
      quantity: Number(l.quantity || 1),
      unit_price: Math.round(Number(l.unit_price || 0)),
      line_total: Math.round(Number(l.quantity || 1) * Number(l.unit_price || 0)),
    }));
    if (itemsRows.length) {
      await supabase.from("vaidya_bill_items").insert(itemsRows);
      // decrement stock for matching medicine items
      for (const l of validLines.filter(x => x.item_type === "medicine")) {
        const match = stock.find(s => s.medicine_name.toLowerCase() === l.medicine_name.toLowerCase());
        if (match) {
          await supabase.from("vaidya_inventory")
            .update({ quantity: Math.max(0, (match.quantity ?? 0) - Number(l.quantity || 0)) })
            .eq("id", match.id);
        }
      }
    }
    toast.success(`Bill ${bill.bill_no || ""} saved`);
    if (form.gstin && userId) localStorage.setItem(`vaidya:gstin:${userId}`, form.gstin);
    setOpen(false);
    resetForm();
    load();
    // Auto-open preview
    openPreview(bill);
  };

  const openPreview = async (bill: any) => {
    const { data } = await supabase.from("vaidya_bill_items").select("*").eq("bill_id", bill.id);
    setPreviewItems(data ?? []);
    setPreviewBill(bill);
  };

  const printBill = () => {
    const node = document.getElementById("bill-print-area");
    if (!node) return;
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${previewBill?.bill_no || "Invoice"}</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,sans-serif;color:#111;padding:24px;max-width:760px;margin:0 auto}
        h1,h2,h3{margin:0}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
        th{background:#f7f7f7}
        .right{text-align:right}
        .muted{color:#666;font-size:12px}
        .totals td{border:none;padding:4px 8px}
        .badge{display:inline-block;padding:2px 8px;border-radius:9999px;background:#eef;font-size:11px}
      </style></head><body>${node.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  const sendWhatsApp = async () => {
    if (!previewBill) return;
    const phone = previewBill.patient_phone?.replace(/\D/g, "").slice(-10);
    if (!phone || phone.length !== 10) {
      toast.error("Patient phone is missing or invalid");
      return;
    }
    const lines = previewItems.map(i => `• ${i.medicine_name} × ${i.quantity} = ${fmtINR(i.line_total)}`).join("\n");
    const msg =
`*${previewBill.clinic_name || "Invoice"}*
${previewBill.gstin ? `GSTIN: ${previewBill.gstin}\n` : ""}Bill No: *${previewBill.bill_no}*
Date: ${new Date(previewBill.bill_date).toLocaleDateString("en-IN")}

Patient: ${previewBill.patient_name}

${lines}

Subtotal: ${fmtINR(previewBill.subtotal)}
Discount: ${fmtINR(previewBill.discount)}
${Number(previewBill.gst_amount) > 0 ? `GST (${previewBill.gst_rate}%): ${fmtINR(Number(previewBill.gst_amount))}\n` : ""}*Total: ${fmtINR(previewBill.total)}*
Payment: ${previewBill.payment_mode?.toUpperCase()}${previewBill.payment_reference ? ` (${previewBill.payment_reference})` : ""}
Status: ${previewBill.status?.toUpperCase()}

Thank you 🙏`;
    // 1) Try Interakt-backed edge function
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { to: phone, message: msg },
      });
      if (!error && (data as any)?.ok && !(data as any)?.simulated) {
        await supabase.from("vaidya_bills").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", previewBill.id);
        toast.success("Bill sent via WhatsApp");
        load();
        return;
      }
    } catch (_) { /* fall through */ }
    // 2) Fallback: open WhatsApp web/app with pre-filled message
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    await supabase.from("vaidya_bills").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", previewBill.id);
    toast.success("Opened WhatsApp — review and send");
    load();
  };

  const filtered = items.filter(b =>
    !search.trim() || `${b.bill_no} ${b.patient_name} ${b.patient_phone || ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">{type === "patient_bill" ? "All Bills" : "Direct Selling"}</h1>
            <p className="text-xs text-muted-foreground">GST invoicing · Auto bill numbers · WhatsApp & Print</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bill no / patient" className="pl-8 w-56" />
            </div>
            <Dialog open={open} onOpenChange={(v)=>{ setOpen(v); if(!v) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-1 h-4 w-4" /> New {type === "patient_bill" ? "Bill" : "Sale"}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New {type === "patient_bill" ? "GST invoice" : "direct sale"}</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                  {/* Clinic / GST */}
                  <div className="rounded-md border p-3 space-y-3">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Clinic / Seller</div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div><Label>Clinic name</Label><Input value={form.clinic_name} onChange={e=>setForm({...form, clinic_name: e.target.value})} /></div>
                      <div className="md:col-span-2"><Label>Clinic address</Label><Input value={form.clinic_address} onChange={e=>setForm({...form, clinic_address: e.target.value})} /></div>
                      <div><Label>GSTIN</Label><Input placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e=>setForm({...form, gstin: e.target.value.toUpperCase()})} /></div>
                      <div><Label>Bill date</Label><Input type="date" value={form.bill_date} onChange={e=>setForm({...form, bill_date: e.target.value})} /></div>
                    </div>
                  </div>

                  {/* Patient */}
                  <div className="rounded-md border p-3 space-y-3">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Bill to (Patient)</div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div><Label>Patient name *</Label><Input value={form.patient_name} onChange={e=>setForm({...form, patient_name: e.target.value})} /></div>
                      <div><Label>Phone</Label><Input value={form.patient_phone} onChange={e=>setForm({...form, patient_phone: e.target.value})} /></div>
                      <div><Label>Patient GSTIN (B2B)</Label><Input value={form.patient_gstin} onChange={e=>setForm({...form, patient_gstin: e.target.value.toUpperCase()})} /></div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <Label>Items</Label>
                    <div className="space-y-2 mt-2">
                      {lines.map((l, idx) => (
                        <div key={idx} className="grid grid-cols-[110px_1fr_90px_70px_100px_auto] gap-2">
                          <Select value={l.item_type} onValueChange={v => { const arr=[...lines]; arr[idx].item_type = v as any; setLines(arr); }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medicine">Medicine</SelectItem>
                              <SelectItem value="therapy">Therapy</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input placeholder="Item / therapy name" list="bill-catalog" value={l.medicine_name}
                            onChange={(e) => {
                              const arr = [...lines]; arr[idx].medicine_name = e.target.value;
                              const m = stock.find(s => s.medicine_name.toLowerCase() === e.target.value.toLowerCase());
                              if (m) { arr[idx].unit_price = String(m.mrp); arr[idx].item_type = "medicine"; }
                              else {
                                const th = AYUSH_THERAPIES.find(t => `${t.code} · ${t.name}`.toLowerCase() === e.target.value.toLowerCase() || t.name.toLowerCase() === e.target.value.toLowerCase());
                                if (th) { arr[idx].unit_price = String(th.price); arr[idx].item_type = "therapy"; }
                              }
                              setLines(arr);
                            }} />
                          <Input placeholder="HSN/SAC" value={l.hsn_code} onChange={e=>{ const arr=[...lines]; arr[idx].hsn_code = e.target.value; setLines(arr); }} />
                          <Input type="number" placeholder="Qty" value={l.quantity} onChange={e=>{ const arr=[...lines]; arr[idx].quantity = e.target.value; setLines(arr); }} />
                          <Input type="number" placeholder="₹ Rate" value={l.unit_price} onChange={e=>{ const arr=[...lines]; arr[idx].unit_price = e.target.value; setLines(arr); }} />
                          <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <datalist id="bill-catalog">
                        {stock.map(s => <option key={`s-${s.id}`} value={s.medicine_name} />)}
                        {AYUSH_THERAPIES.map(t => <option key={`t-${t.code}`} value={`${t.code} · ${t.name}`}>₹{t.price} · {t.system}</option>)}
                      </datalist>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Sparkles className="h-3 w-3" /> Pick a medicine or Ayush therapy — price auto-fills.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setLines([...lines, { item_type: "medicine", medicine_name: "", hsn_code: "", quantity: "1", unit_price: "0" }])}>+ Add line</Button>
                  </div>

                  {/* Totals */}
                  <div className="rounded-md bg-muted/40 p-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm"><span>Subtotal</span><strong>{fmtINR(subtotal)}</strong></div>
                      <div className="flex items-center justify-between gap-2"><Label className="m-0 text-sm">Discount ₹</Label><Input type="number" className="w-28" value={form.discount} onChange={e=>setForm({...form, discount: e.target.value})} /></div>
                      <div className="flex items-center justify-between gap-2"><Label className="m-0 text-sm">GST %</Label>
                        <Select value={form.gst_rate} onValueChange={v=>setForm({...form, gst_rate: v})}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>{["0","5","12","18","28"].map(r => <SelectItem key={r} value={r}>{r}%</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <Label className="m-0">Inter-state (IGST)</Label>
                        <Switch checked={form.is_interstate} onCheckedChange={v=>setForm({...form, is_interstate: v})} />
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Taxable value</span><span>{fmtINR(taxableValue)}</span></div>
                      {!form.is_interstate ? (<>
                        <div className="flex justify-between"><span>CGST</span><span>{fmtINR(cgst)}</span></div>
                        <div className="flex justify-between"><span>SGST</span><span>{fmtINR(sgst)}</span></div>
                      </>) : (
                        <div className="flex justify-between"><span>IGST</span><span>{fmtINR(igst)}</span></div>
                      )}
                      <div className="flex justify-between border-t pt-1 mt-1 text-base"><strong>Grand total</strong><strong className="text-primary">{fmtINR(grandTotal)}</strong></div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Payment mode</Label>
                      <Select value={form.payment_mode} onValueChange={v=>setForm({...form, payment_mode: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PAYMENT_MODES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Reference (UPI / Cheque #)</Label><Input value={form.payment_reference} onChange={e=>setForm({...form, payment_reference: e.target.value})} /></div>
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={v=>setForm({...form, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} /></div>
                </div>
                <DialogFooter><Button onClick={submit}>Save bill</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <ReceiptText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No bills yet.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-2">Bill No</th>
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Patient</th>
                  <th className="py-2 pr-2 text-right">Subtotal</th>
                  <th className="py-2 pr-2 text-right">GST</th>
                  <th className="py-2 pr-2 text-right">Total</th>
                  <th className="py-2 pr-2">Mode</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 pr-2 font-mono text-xs">{b.bill_no || "—"}</td>
                    <td className="py-3 pr-2 text-xs">{new Date(b.bill_date || b.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 pr-2 font-medium">{b.patient_name}<div className="text-[11px] text-muted-foreground">{b.patient_phone || ""}</div></td>
                    <td className="py-3 pr-2 text-right">{fmtINR(b.subtotal)}</td>
                    <td className="py-3 pr-2 text-right">{Number(b.gst_amount) > 0 ? `${fmtINR(Number(b.gst_amount))} (${b.gst_rate}%)` : "—"}</td>
                    <td className="py-3 pr-2 text-right font-semibold text-primary">{fmtINR(b.total)}</td>
                    <td className="py-3 pr-2 capitalize text-xs">{b.payment_mode}</td>
                    <td className="py-3 pr-2">
                      <Badge variant={b.status === "paid" ? "default" : b.status === "pending" ? "destructive" : "secondary"} className="text-[10px] capitalize">{b.status}</Badge>
                    </td>
                    <td className="py-3 pr-2">
                      <Button size="sm" variant="ghost" onClick={() => openPreview(b)}><FileText className="h-4 w-4 mr-1" /> View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Preview / Print / WhatsApp dialog */}
      <Dialog open={!!previewBill} onOpenChange={(v) => { if (!v) { setPreviewBill(null); setPreviewItems([]); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice {previewBill?.bill_no}</DialogTitle></DialogHeader>
          {previewBill && (
            <div id="bill-print-area">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111", paddingBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>{previewBill.clinic_name || "Clinic"}</h2>
                  <div className="muted">{previewBill.clinic_address || ""}</div>
                  {previewBill.gstin && <div className="muted">GSTIN: <strong>{previewBill.gstin}</strong></div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ fontSize: 18 }}>TAX INVOICE</h3>
                  <div className="muted">Bill No: <strong>{previewBill.bill_no}</strong></div>
                  <div className="muted">Date: {new Date(previewBill.bill_date).toLocaleDateString("en-IN")}</div>
                  <span className="badge" style={{ marginTop: 4 }}>{String(previewBill.status).toUpperCase()}</span>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div className="muted">Bill To</div>
                  <div><strong>{previewBill.patient_name}</strong></div>
                  {previewBill.patient_phone && <div className="muted">📞 {previewBill.patient_phone}</div>}
                  {previewBill.patient_gstin && <div className="muted">GSTIN: {previewBill.patient_gstin}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="muted">Payment Mode</div>
                  <div><strong style={{ textTransform: "uppercase" }}>{previewBill.payment_mode}</strong></div>
                  {previewBill.payment_reference && <div className="muted">Ref: {previewBill.payment_reference}</div>}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>HSN/SAC</th>
                    <th className="right">Qty</th>
                    <th className="right">Rate</th>
                    <th className="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {previewItems.map((i, idx) => (
                    <tr key={i.id}>
                      <td>{idx + 1}</td>
                      <td>{i.medicine_name}</td>
                      <td style={{ textTransform: "capitalize" }}>{i.item_type || "medicine"}</td>
                      <td>{i.hsn_code || "—"}</td>
                      <td className="right">{i.quantity}</td>
                      <td className="right">{fmtINR(i.unit_price)}</td>
                      <td className="right">{fmtINR(i.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="totals" style={{ marginTop: 12, width: "50%", marginLeft: "auto", border: "none" }}>
                <tbody>
                  <tr><td>Subtotal</td><td className="right">{fmtINR(previewBill.subtotal)}</td></tr>
                  {Number(previewBill.discount) > 0 && <tr><td>Discount</td><td className="right">− {fmtINR(previewBill.discount)}</td></tr>}
                  {Number(previewBill.gst_amount) > 0 && (previewBill.is_interstate ? (
                    <tr><td>IGST ({previewBill.gst_rate}%)</td><td className="right">{fmtINR(Number(previewBill.igst_amount))}</td></tr>
                  ) : (<>
                    <tr><td>CGST ({Number(previewBill.gst_rate)/2}%)</td><td className="right">{fmtINR(Number(previewBill.cgst_amount))}</td></tr>
                    <tr><td>SGST ({Number(previewBill.gst_rate)/2}%)</td><td className="right">{fmtINR(Number(previewBill.sgst_amount))}</td></tr>
                  </>))}
                  <tr style={{ borderTop: "2px solid #111" }}><td><strong>Grand Total</strong></td><td className="right"><strong>{fmtINR(previewBill.total)}</strong></td></tr>
                </tbody>
              </table>

              {previewBill.notes && <div style={{ marginTop: 16 }}><strong>Notes:</strong> <span className="muted">{previewBill.notes}</span></div>}
              <div style={{ marginTop: 24, textAlign: "center" }} className="muted">Thank you for your visit 🙏</div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={printBill}><Printer className="mr-2 h-4 w-4" /> Print / Save PDF</Button>
            <Button onClick={sendWhatsApp}><MessageCircle className="mr-2 h-4 w-4" /> Send on WhatsApp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsPage;
