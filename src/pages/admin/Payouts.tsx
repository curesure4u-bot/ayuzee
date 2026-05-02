import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Download, IndianRupee, Search, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  computeTds,
  usePayoutAction,
  usePayoutAnalytics,
  usePayoutCounts,
  usePayouts,
  type PayoutRequestRow,
  type PayoutStatus,
} from "@/hooks/usePayouts";
import { PayoutRequestCard } from "@/components/admin/PayoutRequestCard";
import { PayoutApprovalDialog } from "@/components/admin/PayoutApprovalDialog";

const TABS: { value: PayoutStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "hold", label: "On Hold" },
  { value: "processed", label: "Processed" },
  { value: "rejected", label: "Rejected" },
];

const Stat = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-bold truncate">{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const Payouts = () => {
  const [tab, setTab] = useState<PayoutStatus>("pending");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [amountFilter, setAmountFilter] = useState<string>("all");
  const [tdsFilter, setTdsFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogPayout, setDialogPayout] = useState<PayoutRequestRow | null>(null);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | "hold" | "process">("approve");

  const { data: payouts = [], isLoading } = usePayouts(tab);
  const { data: counts } = usePayoutCounts();
  const { data: analytics } = usePayoutAnalytics();
  const action = usePayoutAction();

  const filtered = useMemo(() => {
    return payouts.filter((p) => {
      const q = search.trim().toLowerCase();
      if (q && !`${p.requester?.full_name ?? ""} ${p.account_holder_name ?? ""}`.toLowerCase().includes(q)) return false;
      if (roleFilter !== "all" && p.role !== roleFilter && p.type !== roleFilter) return false;
      const amt = Number(p.amount);
      if (amountFilter === "small" && (amt < 500 || amt > 5000)) return false;
      if (amountFilter === "large" && amt <= 5000) return false;
      const tds = computeTds(amt);
      if (tdsFilter === "yes" && tds === 0) return false;
      if (tdsFilter === "no" && tds > 0) return false;
      return true;
    });
  }, [payouts, search, roleFilter, amountFilter, tdsFilter]);

  const openDialog = (p: PayoutRequestRow, mode: typeof dialogMode) => {
    setDialogPayout(p);
    setDialogMode(mode);
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((s) => {
      const next = new Set(s);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const batchProcess = async () => {
    if (selected.size === 0) return;
    let ok = 0;
    for (const id of selected) {
      try {
        await action.mutateAsync({ payout_request_id: id, action: "process", payment_method: "manual" });
        ok++;
      } catch {}
    }
    setSelected(new Set());
    toast.success(`Processed ${ok}/${selected.size} payouts`);
  };

  const exportCsv = () => {
    const rows = filtered.map((p) => ({
      id: p.id,
      requester: p.requester?.full_name ?? "",
      role: p.role ?? p.type,
      amount: p.amount,
      tds: computeTds(Number(p.amount)),
      net: Number(p.amount) - computeTds(Number(p.amount)),
      status: p.status,
      account_holder: p.account_holder_name ?? "",
      account_number: p.account_number_masked ?? "",
      ifsc: p.ifsc_code ?? "",
      bank: p.bank_name ?? "",
      method: p.payment_method ?? "",
      utr: p.utr_number ?? "",
      created_at: p.created_at,
    }));
    if (rows.length === 0) {
      toast.info("Nothing to export");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-sm text-muted-foreground">Review, approve and process payout requests across the platform.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          <Button onClick={batchProcess} disabled={selected.size === 0 || action.isPending}>
            Batch Process {selected.size > 0 && `(${selected.size})`}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Pending Payouts" value={`₹${(analytics?.totalPending ?? 0).toLocaleString("en-IN")}`} sub={`${analytics?.pendingCount ?? 0} request(s)`} />
        <Stat icon={TrendingUp} label="Processed (this month)" value={`₹${(analytics?.totalProcessedThisMonth ?? 0).toLocaleString("en-IN")}`} />
        <Stat icon={Clock} label="Avg. Processing Time" value={`${analytics?.avgProcessingHours ?? 0} h`} />
        <Stat icon={Users} label="Awaiting Approval" value={String(counts?.pending ?? 0)} sub={`${counts?.hold ?? 0} on hold`} />
      </div>

      <Card>
        <CardContent className="p-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="therapist">Therapist</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={amountFilter} onValueChange={setAmountFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Amount" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any amount</SelectItem>
              <SelectItem value="small">₹500 – ₹5,000</SelectItem>
              <SelectItem value="large">₹5,000+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tdsFilter} onValueChange={setTdsFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="TDS" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">TDS: any</SelectItem>
              <SelectItem value="yes">TDS applicable</SelectItem>
              <SelectItem value="no">No TDS</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => { setTab(v as PayoutStatus); setSelected(new Set()); }}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-2">
              {t.label}
              {counts && <Badge variant="secondary">{counts[t.value] ?? 0}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No {t.label.toLowerCase()} payouts.</CardContent></Card>
            ) : (
              filtered.map((p) => (
                <PayoutRequestCard
                  key={p.id}
                  payout={p}
                  selected={selected.has(p.id)}
                  onSelect={toggleSelect}
                  onApprove={(x) => openDialog(x, "approve")}
                  onReject={(x) => openDialog(x, "reject")}
                  onHold={(x) => openDialog(x, "hold")}
                  onProcess={(x) => openDialog(x, "process")}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <PayoutApprovalDialog
        open={!!dialogPayout}
        onOpenChange={(o) => !o && setDialogPayout(null)}
        payout={dialogPayout}
        mode={dialogMode}
      />
    </div>
  );
};

export default Payouts;
