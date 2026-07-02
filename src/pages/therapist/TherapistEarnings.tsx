import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, IndianRupee, Wallet } from "lucide-react";
import type { TherapistContext } from "./TherapistLayout";

interface Row {
  id: string;
  patient_name: string;
  therapy_name: string;
  therapy_code: string;
  scheduled_date: string;
  therapist_earnings: number;
  total_amount: number;
  payment_status: string;
}

interface PayoutRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  notes: string | null;
}

const weekKey = (d: Date) => {
  usePageSEO({ title: "Earnings | Therapist | Ayuzee", noIndex: true });
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week.toString().padStart(2, "0")}`;
};
const monthKey = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;

const TherapistEarnings = () => {
  const { therapist } = useOutletContext<TherapistContext>();
  const [rows, setRows] = useState<Row[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    const { data: sessions } = await supabase.from("therapy_sessions")
      .select("id, patient_name, therapy_name, therapy_code, scheduled_date, therapist_earnings, total_amount, payment_status")
      .eq("therapist_id", therapist.id).eq("status", "completed")
      .order("scheduled_date", { ascending: false });
    setRows((sessions ?? []) as Row[]);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: wallet } = await supabase.from("ayuzee_wallets").select("balance").eq("user_id", user.id).maybeSingle();
      setWalletBalance(Number(wallet?.balance ?? 0));
      const { data: pr } = await supabase.from("payout_requests")
        .select("id, amount, status, created_at, notes")
        .eq("requester_user_id", user.id).eq("type", "therapist")
        .order("created_at", { ascending: false }).limit(10);
      setPayouts((pr ?? []) as PayoutRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapist.id]);

  const { byWeek, byMonth, total } = useMemo(() => {
    const w: Record<string, number> = {};
    const m: Record<string, number> = {};
    let t = 0;
    rows.forEach(r => {
      const d = new Date(r.scheduled_date);
      const amt = Number(r.therapist_earnings || 0);
      w[weekKey(d)] = (w[weekKey(d)] || 0) + amt;
      m[monthKey(d)] = (m[monthKey(d)] || 0) + amt;
      t += amt;
    });
    return { byWeek: w, byMonth: m, total: t };
  }, [rows]);

  const submitPayout = async () => {
    const amt = Math.round(Number(payoutAmount));
    if (!Number.isFinite(amt) || amt <= 0) {
      return toast({ title: "Enter a valid amount", variant: "destructive" });
    }
    if (amt > walletBalance) {
      return toast({ title: "Amount exceeds available balance", variant: "destructive" });
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }
    const { error } = await supabase.from("payout_requests").insert({
      type: "therapist",
      requester_user_id: user.id,
      therapist_id: therapist.id,
      amount: amt,
      notes: payoutNotes || null,
    });
    setSubmitting(false);
    if (error) return toast({ title: "Request failed", description: error.message, variant: "destructive" });
    toast({ title: "Payout requested", description: "Our team will process it within 3 business days." });
    setPayoutOpen(false);
    setPayoutAmount("");
    setPayoutNotes("");
    reload();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-sm text-muted-foreground">Track your completed sessions and payouts.</p>
        </div>
        <Button onClick={() => setPayoutOpen(true)} disabled={walletBalance <= 0}>
          <Wallet className="h-4 w-4 mr-2" />Request payout
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Available balance</div>
              <div className="text-3xl font-bold mt-1 flex items-center"><IndianRupee className="h-6 w-6" />{walletBalance.toLocaleString("en-IN")}</div>
              <Link to="/therapist/profile" className="text-xs text-primary underline mt-1 inline-block">Manage bank details</Link>
            </div>
            <Wallet className="h-12 w-12 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Lifetime earnings</div>
              <div className="text-3xl font-bold mt-1 flex items-center"><IndianRupee className="h-6 w-6" />{total.toLocaleString("en-IN")}</div>
            </div>
            <IndianRupee className="h-12 w-12 text-muted-foreground/30" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BreakdownCard title="By month" data={byMonth} />
        <BreakdownCard title="By week" data={byWeek} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Completed sessions</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No completed sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <div className="font-medium truncate text-sm">{r.therapy_name}</div>
                    <div className="text-xs text-muted-foreground">{r.scheduled_date} · {r.patient_name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">₹{Number(r.therapist_earnings).toLocaleString("en-IN")}</div>
                    <div className="flex gap-1 justify-end mt-1">
                      <Badge variant="outline" className="text-[10px]">{r.therapy_code}</Badge>
                      <Badge variant={r.payment_status === "settled" ? "default" : "secondary"} className="text-[10px]">{r.payment_status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {payouts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Recent payout requests</h2>
            <div className="space-y-2">
              {payouts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">₹{Number(p.amount).toLocaleString("en-IN")}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN")}</div>
                  </div>
                  <Badge variant={p.status === "paid" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request payout</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Available balance: <span className="font-semibold text-foreground">₹{walletBalance.toLocaleString("en-IN")}</span></p>
            <div>
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input id="amt" type="number" min={1} max={walletBalance} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={3} value={payoutNotes} onChange={(e) => setPayoutNotes(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">Funds will be transferred to your registered bank account within 3 business days.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button onClick={submitPayout} disabled={submitting}>{submitting ? "Submitting…" : "Submit request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BreakdownCard = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const entries = Object.entries(data).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);
  const max = Math.max(1, ...Object.values(data));
  return (
    <Card><CardContent className="p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {entries.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{k}</span><span className="font-medium">₹{v.toLocaleString("en-IN")}</span></div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
};

export default TherapistEarnings;
