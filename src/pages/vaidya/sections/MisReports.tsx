import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  FileSpreadsheet,
  IndianRupee,
  Stethoscope,
  Users,
  Wallet,
  Zap,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type ReportType = "summary" | "bills" | "consultations" | "appointments" | "medicines";
type Preset = "7" | "30" | "90" | "mtd" | "ytd" | "custom";

const fmtINR = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function rangeFromPreset(p: Preset): { from: string; to: string } {
  const today = new Date();
  const to = isoDay(today);
  if (p === "mtd") return { from: isoDay(new Date(today.getFullYear(), today.getMonth(), 1)), to };
  if (p === "ytd") return { from: isoDay(new Date(today.getFullYear(), 0, 1)), to };
  if (p === "custom") return { from: isoDay(new Date(today.getTime() - 29 * 86400000)), to };
  const days = parseInt(p, 10);
  return { from: isoDay(new Date(today.getTime() - (days - 1) * 86400000)), to };
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const MisReports = () => {
  const { userId, doctor } = useDoctor();
  const [preset, setPreset] = useState<Preset>("30");
  const [from, setFrom] = useState(rangeFromPreset("30").from);
  const [to, setTo] = useState(rangeFromPreset("30").to);
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [paymentMode, setPaymentMode] = useState<string>("all");
  const [billType, setBillType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [bills, setBills] = useState<any[]>([]);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [cons, setCons] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    if (preset === "custom") return;
    const r = rangeFromPreset(preset);
    setFrom(r.from);
    setTo(r.to);
  }, [preset]);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const fromISO = new Date(from).toISOString();
    const toEnd = new Date(to + "T23:59:59").toISOString();

    const [bRes, cRes, aRes] = await Promise.all([
      supabase
        .from("vaidya_bills")
        .select("id,bill_no,total,subtotal,discount,payment_mode,status,bill_type,bill_date,created_at,patient_name")
        .eq("doctor_user_id", userId)
        .gte("created_at", fromISO)
        .lte("created_at", toEnd)
        .order("created_at", { ascending: true }),
      supabase
        .from("vaidya_consultations")
        .select("id,visit_date,diagnosis,fee,patient_id,created_at")
        .eq("doctor_user_id", userId)
        .gte("visit_date", from)
        .lte("visit_date", to)
        .order("visit_date", { ascending: true }),
      doctor?.id
        ? supabase
            .from("appointments")
            .select("id,appointment_date,status,fee,payment_status,mode,patient_name")
            .eq("doctor_id", doctor.id)
            .gte("appointment_date", from)
            .lte("appointment_date", to)
        : Promise.resolve({ data: [] as any[] } as any),
    ]);

    setBills(bRes.data ?? []);
    setCons(cRes.data ?? []);
    setAppts((aRes as any).data ?? []);

    const billIds = (bRes.data ?? []).map((b: any) => b.id);
    if (billIds.length) {
      const { data: items } = await supabase
        .from("vaidya_bill_items")
        .select("medicine_name,quantity,line_total,bill_id,unit_price")
        .in("bill_id", billIds);
      setBillItems(items ?? []);
    } else {
      setBillItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, doctor?.id, from, to]);

  // Apply filters
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (billType !== "all" && b.bill_type !== billType) return false;
      if (paymentMode !== "all" && (b.payment_mode || "").toLowerCase() !== paymentMode) return false;
      return true;
    });
  }, [bills, billType, paymentMode]);

  // Summary KPIs
  const kpis = useMemo(() => {
    const billRev = filteredBills.reduce((s, b) => s + (b.total ?? 0), 0);
    const apptRev = appts.filter((a) => a.payment_status === "paid").reduce((s, a) => s + (a.fee ?? 0), 0);
    const total = billRev + apptRev;
    const opCount = cons.length + appts.length;
    const uniquePts = new Set([
      ...cons.map((c) => c.patient_id).filter(Boolean),
      ...appts.map((a: any) => a.id),
    ]).size;
    const avgBill = filteredBills.length ? Math.round(billRev / filteredBills.length) : 0;
    return { total, billRev, apptRev, opCount, uniquePts, avgBill, billCount: filteredBills.length };
  }, [filteredBills, appts, cons]);

  // Daily revenue series
  const dailySeries = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; opd: number }> = {};
    const start = new Date(from);
    const end = new Date(to);
    for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
      const k = isoDay(new Date(t));
      map[k] = { date: k.slice(5), revenue: 0, opd: 0 };
    }
    filteredBills.forEach((b) => {
      const k = (b.created_at as string).slice(0, 10);
      if (map[k]) map[k].revenue += b.total ?? 0;
    });
    appts.forEach((a) => {
      const k = a.appointment_date as string;
      if (map[k]) {
        if (a.payment_status === "paid") map[k].revenue += a.fee ?? 0;
        map[k].opd += 1;
      }
    });
    cons.forEach((c) => {
      const k = c.visit_date as string;
      if (map[k]) map[k].opd += 1;
    });
    return Object.values(map);
  }, [filteredBills, appts, cons, from, to]);

  // Export rows by report type
  const exportRows = useMemo<Record<string, any>[]>(() => {
    if (reportType === "bills") {
      return filteredBills.map((b) => ({
        bill_no: b.bill_no,
        date: (b.bill_date || b.created_at)?.slice(0, 10),
        patient: b.patient_name,
        type: b.bill_type,
        subtotal: b.subtotal,
        discount: b.discount,
        total: b.total,
        payment_mode: b.payment_mode,
        status: b.status,
      }));
    }
    if (reportType === "consultations") {
      return cons.map((c) => ({
        date: c.visit_date,
        diagnosis: c.diagnosis,
        fee: c.fee,
        patient_id: c.patient_id,
      }));
    }
    if (reportType === "appointments") {
      return appts.map((a) => ({
        date: a.appointment_date,
        patient: a.patient_name,
        mode: a.mode,
        fee: a.fee,
        payment_status: a.payment_status,
        status: a.status,
      }));
    }
    if (reportType === "medicines") {
      const agg: Record<string, { qty: number; revenue: number }> = {};
      billItems.forEach((it) => {
        const k = (it.medicine_name || "Unknown").trim();
        if (!agg[k]) agg[k] = { qty: 0, revenue: 0 };
        agg[k].qty += it.quantity ?? 0;
        agg[k].revenue += it.line_total ?? 0;
      });
      return Object.entries(agg)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([medicine, v]) => ({ medicine, qty_sold: v.qty, revenue: v.revenue }));
    }
    // summary
    return dailySeries.map((d) => ({
      date: d.date,
      revenue: d.revenue,
      op_visits: d.opd,
    }));
  }, [reportType, filteredBills, cons, appts, billItems, dailySeries]);

  const exportCSV = () => {
    if (!exportRows.length) {
      toast.error("Nothing to export for this filter");
      return;
    }
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    download(`mis-${reportType}-${from}_to_${to}-${ts}.csv`, toCSV(exportRows), "text/csv");
    toast.success(`Exported ${exportRows.length} rows`);
  };

  const exportJSON = () => {
    if (!exportRows.length) {
      toast.error("Nothing to export for this filter");
      return;
    }
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    download(
      `mis-${reportType}-${from}_to_${to}-${ts}.json`,
      JSON.stringify({ report: reportType, from, to, rows: exportRows }, null, 2),
      "application/json",
    );
    toast.success(`Exported ${exportRows.length} rows`);
  };

  const printReport = () => window.print();

  const StatCard = ({ label, value, icon: Icon, gradient, prefix }: any) => (
    <Card className={`bg-gradient-to-br ${gradient} p-4 text-primary-foreground`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-90">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {prefix}
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
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
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">MIS Reports</h1>
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <Zap className="mr-1 h-3 w-3" />HMS Tools Ultra
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Filter, summarise and export operational data for {from} → {to}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={printReport}>
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={exportJSON}>
            <Download className="mr-2 h-4 w-4" />JSON
          </Button>
          <Button size="sm" onClick={exportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label className="text-xs">Date preset</Label>
            <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="mtd">Month to date</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => { setPreset("custom"); setFrom(e.target.value); }} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => { setPreset("custom"); setTo(e.target.value); }} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Report</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary (daily totals)</SelectItem>
                <SelectItem value="bills">Bills register</SelectItem>
                <SelectItem value="consultations">Consultations</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="medicines">Medicine sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Bill type</Label>
              <Select value={billType} onValueChange={setBillType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="patient_bill">Patient bill</SelectItem>
                  <SelectItem value="direct_selling">Direct selling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Payment</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={kpis.total} prefix="₹" icon={IndianRupee} gradient="from-emerald-500/80 to-emerald-600" />
        <StatCard label="OP Visits" value={kpis.opCount} icon={Stethoscope} gradient="from-primary/80 to-primary" />
        <StatCard label="Unique Patients" value={kpis.uniquePts} icon={Users} gradient="from-sky-500/80 to-sky-600" />
        <StatCard label="Avg Bill" value={kpis.avgBill} prefix="₹" icon={Wallet} gradient="from-violet-500/80 to-violet-600" />
      </div>

      {/* Trend */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />Revenue & OP trend
          </h3>
          <Badge variant="outline" className="text-xs">{fmtINR(kpis.total)} · {kpis.billCount} bills</Badge>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries}>
              <defs>
                <linearGradient id="misRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="misOpd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="hsl(var(--primary))" fill="url(#misRev)" strokeWidth={2} />
              <Area yAxisId="right" type="monotone" dataKey="opd" name="OP Visits" stroke="#0ea5e9" fill="url(#misOpd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Preview table */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold capitalize">{reportType.replace("_", " ")} preview</h3>
          <Badge variant="outline" className="text-xs">{exportRows.length} rows</Badge>
        </div>
        {exportRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {loading ? "Loading…" : "No rows match the current filters."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  {Object.keys(exportRows[0]).map((k) => (
                    <th key={k} className="py-2 pr-3 font-medium uppercase tracking-wide">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportRows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {Object.keys(exportRows[0]).map((k) => (
                      <td key={k} className="py-2 pr-3">
                        {typeof r[k] === "number" && /revenue|total|fee|subtotal|discount/i.test(k)
                          ? fmtINR(r[k])
                          : String(r[k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {exportRows.length > 50 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Showing first 50 of {exportRows.length} rows. Export to CSV for the full dataset.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MisReports;
