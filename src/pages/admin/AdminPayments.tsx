import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Payment = { id: string; razorpay_payment_id: string | null; full_name: string; total: number; created_at: string; payment_status: string; order_status: string };
const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const monthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

const AdminPayments = () => {
  usePageSEO({ title: "Payments — Admin", noIndex: true });
  const [rows, setRows] = useState<Payment[]>([]); const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [status, setStatus] = useState("all"); const [min, setMin] = useState(""); const [max, setMax] = useState("");
  const load = async () => { setLoading(true); const { data, error } = await supabase.from("orders").select("id,razorpay_payment_id,full_name,total,created_at,payment_status,order_status").order("created_at", { ascending: false }).limit(500); if (error) toast.error(error.message); setRows((data ?? []) as Payment[]); setLoading(false); };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => rows.filter((r) => { const day = r.created_at.slice(0, 10); if (from && day < from) return false; if (to && day > to) return false; if (status !== "all" && r.payment_status !== status) return false; if (min && r.total < Number(min)) return false; if (max && r.total > Number(max)) return false; return true; }), [rows, from, to, status, min, max]);
  const refund = async (r: Payment) => { await supabase.functions.invoke("razorpay-refund", { body: { payment_id: r.razorpay_payment_id, order_id: r.id, amount: r.total } }); const { error } = await supabase.from("orders").update({ payment_status: "refunded" }).eq("id", r.id); if (error) return toast.error(error.message); toast.success("Refund requested"); load(); };
  const exportCsv = () => { const csv = [["Payment ID","Order ID","Patient","Amount","Date","Status"], ...filtered.map(r => [r.razorpay_payment_id || "", r.id, r.full_name, r.total, r.created_at, r.payment_status])].map(row => row.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const a = document.createElement("a"); a.href = url; a.download = "payments.csv"; a.click(); URL.revokeObjectURL(url); };
  const total = rows.filter(r => r.payment_status === "paid").reduce((s, r) => s + r.total, 0); const thisMonth = rows.filter(r => r.payment_status === "paid" && r.created_at >= monthStart()).reduce((s, r) => s + r.total, 0); const refunds = rows.filter(r => r.payment_status === "refunded" && r.created_at >= monthStart()).reduce((s, r) => s + r.total, 0); const pending = rows.filter(r => ["paid", "refund_pending"].includes(r.payment_status)).length;
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-3xl">Payments & Transactions</h1><p className="text-sm text-muted-foreground">Review medicine order payments, refunds, and settlements.</p></div><Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button></div>
    <div className="grid gap-4 md:grid-cols-4"><Stat label="Total revenue" value={money(total)} /><Stat label="This month" value={money(thisMonth)} /><Stat label="Refunds this month" value={money(refunds)} /><Stat label="Pending settlements" value={String(pending)} /></div>
    <Card><CardContent className="flex flex-wrap gap-3 p-4"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{["paid","refunded","failed","pending","refund_pending"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><Input type="number" placeholder="Min amount" value={min} onChange={(e) => setMin(e.target.value)} className="w-36" /><Input type="number" placeholder="Max amount" value={max} onChange={(e) => setMax(e.target.value)} className="w-36" /></CardContent></Card>
    <Card><CardContent className="p-0">{loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : <Table><TableHeader><TableRow><TableHead>Razorpay payment ID</TableHead><TableHead>Order ID</TableHead><TableHead>Patient</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{filtered.map(r => <TableRow key={r.id}><TableCell className="font-mono text-xs">{r.razorpay_payment_id || "—"}</TableCell><TableCell className="font-mono">{r.id.slice(0, 8)}</TableCell><TableCell>{r.full_name}</TableCell><TableCell className="text-right font-semibold">{money(r.total)}</TableCell><TableCell>{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell><TableCell><Badge variant={r.payment_status === "paid" ? "default" : r.payment_status === "refunded" ? "secondary" : "outline"}>{r.payment_status === "paid" ? "success" : r.payment_status}</Badge></TableCell><TableCell className="text-right">{r.payment_status === "paid" && <Button size="sm" variant="destructive" onClick={() => refund(r)}>Refund</Button>}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
  </div>;
};
const Stat = ({ label, value }: { label: string; value: string }) => <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl">{value}</p></CardContent></Card>;
export default AdminPayments;
