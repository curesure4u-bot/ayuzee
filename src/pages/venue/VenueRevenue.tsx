import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { VenueContext } from "./VenueLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, IndianRupee, Wallet } from "lucide-react";

interface SessionRow {
  id: string;
  scheduled_date: string;
  therapy_name: string;
  scheduled_duration_minutes: number;
  actual_duration_minutes: number | null;
  venue_room: string | null;
  total_amount: number | null;
  venue_earnings: number | null;
  platform_fee: number | null;
  payment_status?: string;
}

const startOfWeek = (d: Date) => {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7; // Monday = 0
  c.setDate(c.getDate() - day);
  c.setHours(0, 0, 0, 0);
  return c;
};

interface PayoutRow { id: string; amount: number; status: string; created_at: string; }

const VenueRevenue = () => {
  const { venue } = useOutletContext<VenueContext>();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    const { data } = await supabase.from("therapy_sessions")
      .select("id, scheduled_date, therapy_name, scheduled_duration_minutes, actual_duration_minutes, venue_room, total_amount, venue_earnings, platform_fee, payment_status")
      .eq("venue_id", venue.id).eq("status", "completed").order("scheduled_date", { ascending: false });
    setSessions((data ?? []) as SessionRow[]);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: pr } = await supabase.from("payout_requests")
        .select("id, amount, status, created_at")
        .eq("requester_user_id", user.id).eq("type", "venue")
        .order("created_at", { ascending: false }).limit(10);
      setPayouts((pr ?? []) as PayoutRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [venue.id]);

  if (loading) return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  // Group by week
  const byWeek = new Map<string, { label: string; total: number; count: number }>();
  for (const s of sessions) {
    const d = new Date(s.scheduled_date);
    const monday = startOfWeek(d);
    const key = monday.toISOString().split("T")[0];
    const label = `Week of ${monday.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
    const cur = byWeek.get(key) ?? { label, total: 0, count: 0 };
    cur.total += Number(s.venue_earnings ?? 0);
    cur.count += 1;
    byWeek.set(key, cur);
  }
  const weeks = Array.from(byWeek.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const totalEarnings = sessions.reduce((s, r) => s + Number(r.venue_earnings ?? 0), 0);
  const totalFees = sessions.reduce((s, r) => s + Number(r.platform_fee ?? 0), 0);
  const settledEarnings = sessions.filter(s => s.payment_status === "settled").reduce((s, r) => s + Number(r.venue_earnings ?? 0), 0);
  const requestedAmount = payouts.filter(p => p.status === "pending" || p.status === "approved").reduce((s, p) => s + Number(p.amount), 0);
  const paidAmount = payouts.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const availableBalance = Math.max(0, settledEarnings - requestedAmount - paidAmount);

  const submitPayout = async () => {
    const amt = Math.round(Number(payoutAmount));
    if (!Number.isFinite(amt) || amt <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (amt > availableBalance) return toast({ title: "Amount exceeds available balance", variant: "destructive" });
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }
    const { error } = await supabase.from("payout_requests").insert({
      type: "venue", requester_user_id: user.id, venue_id: venue.id, amount: amt, notes: payoutNotes || null,
    });
    setSubmitting(false);
    if (error) return toast({ title: "Request failed", description: error.message, variant: "destructive" });
    toast({ title: "Payout requested", description: "Our team will process it within 3 business days." });
    setPayoutOpen(false); setPayoutAmount(""); setPayoutNotes(""); reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Revenue</h1>
          <p className="text-muted-foreground">Earnings from completed therapy sessions at your venue.</p>
        </div>
        <Button onClick={() => setPayoutOpen(true)} disabled={availableBalance <= 0}>
          <Wallet className="h-4 w-4 mr-2" />Request payout
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
        <CardContent className="p-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Available for payout</div>
            <div className="text-3xl font-bold mt-1">₹{availableBalance.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted-foreground mt-1">Settled ₹{settledEarnings.toLocaleString("en-IN")} · Requested ₹{requestedAmount.toLocaleString("en-IN")} · Paid ₹{paidAmount.toLocaleString("en-IN")}</div>
          </div>
          <Wallet className="h-12 w-12 text-primary/40" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3" />Total earnings</div>
          <div className="text-2xl font-bold mt-1">₹{totalEarnings.toLocaleString("en-IN")}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Sessions completed</div>
          <div className="text-2xl font-bold mt-1">{sessions.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Ayuzee fees paid</div>
          <div className="text-2xl font-bold mt-1">₹{totalFees.toLocaleString("en-IN")}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>By week</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {weeks.length === 0 && <p className="text-sm text-muted-foreground">No revenue yet.</p>}
          {weeks.map(([key, w]) => (
            <div key={key} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium">{w.label}</div>
                <div className="text-xs text-muted-foreground">{w.count} session{w.count === 1 ? "" : "s"}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{w.total.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Session-wise earnings</CardTitle></CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No completed sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Therapy</th>
                    <th className="text-left p-3">Duration</th>
                    <th className="text-left p-3">Room</th>
                    <th className="text-right p-3">Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">{new Date(s.scheduled_date).toLocaleDateString("en-IN")}</td>
                      <td className="p-3">{s.therapy_name}</td>
                      <td className="p-3">{s.actual_duration_minutes ?? s.scheduled_duration_minutes} min</td>
                      <td className="p-3">{s.venue_room ?? "—"}</td>
                      <td className="p-3 text-right">
                        <div className="text-xs text-muted-foreground">Ayuzee fee: ₹{Number(s.platform_fee ?? 0).toLocaleString("en-IN")}</div>
                        <div className="font-semibold">Your earnings: ₹{Number(s.venue_earnings ?? 0).toLocaleString("en-IN")}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VenueRevenue;
