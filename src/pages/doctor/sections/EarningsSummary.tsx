import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Stethoscope, ShoppingCart, Gift, TrendingUp, ArrowUpRight, Calendar, Wallet } from "lucide-react";

interface EarningsData {
  consultationEarnings: number;
  partnerMargins: number;
  rewardsCredited: number;
  totalThisMonth: number;
  totalLifetime: number;
  pendingPayout: number;
  consultationCount: number;
  orderCount: number;
}

const EarningsSummary = () => {
  const { doctor, userId } = useDoctor();
  const [data, setData] = useState<EarningsData>({
    consultationEarnings: 0, partnerMargins: 0, rewardsCredited: 0,
    totalThisMonth: 0, totalLifetime: 0, pendingPayout: 0,
    consultationCount: 0, orderCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctor?.id) return;
    loadEarnings();
  }, [doctor?.id]);

  const loadEarnings = async () => {
    setLoading(true);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [apptRes, ordersRes, payoutsRes] = await Promise.all([
      supabase.from("appointments").select("fee, status").eq("doctor_id", doctor!.id).eq("status", "completed").gte("appointment_date", monthStart),
      supabase.from("orders").select("total, commission_amount, created_at").eq("placed_by_doctor_id", doctor!.id).gte("created_at", monthStart),
      supabase.from("doctor_payouts").select("amount, status").eq("doctor_id", doctor!.id),
    ]);

    const appts = (apptRes.data ?? []) as { fee: number; status: string }[];
    const orders = (ordersRes.data ?? []) as { total: number; commission_amount: number | null; created_at: string }[];
    const payouts = (payoutsRes.data ?? []) as { amount: number; status: string }[];

    const consultEarnings = appts.reduce((s, a) => s + (a.fee ?? 0), 0);
    const margins = orders.reduce((s, o) => s + (o.commission_amount ?? Math.round(o.total * 0.12)), 0);
    const pending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
    const lifetime = payouts.reduce((s, p) => s + p.amount, 0);

    setData({
      consultationEarnings: consultEarnings,
      partnerMargins: margins,
      rewardsCredited: 0,
      totalThisMonth: consultEarnings + margins,
      totalLifetime: lifetime + consultEarnings + margins,
      pendingPayout: pending,
      consultationCount: appts.length,
      orderCount: orders.length,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const monthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Earnings Summary</h1>
        <p className="text-muted-foreground">All your earnings at a glance — consultations, partner margins, and rewards.</p>
      </div>

      {/* Total This Month — Hero Card */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">{monthName}</p>
              <p className="font-display text-4xl font-bold mt-1">₹{data.totalThisMonth.toLocaleString("en-IN")}</p>
              <p className="text-sm opacity-80 mt-1">Total earned this month</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100">
                <Stethoscope className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Consultations</p>
                <p className="font-display text-xl font-bold">₹{data.consultationEarnings.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">{data.consultationCount} sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100">
                <ShoppingCart className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Partner Margins</p>
                <p className="font-display text-xl font-bold text-emerald-700">₹{data.partnerMargins.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">{data.orderCount} orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100">
                <Gift className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Payout</p>
                <p className="font-display text-xl font-bold text-amber-700">₹{data.pendingPayout.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">Processes every Monday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm"><Link to="/doctor/payouts">View Payout History</Link></Button>
        <Button asChild variant="outline" size="sm"><Link to="/doctor/dispensing">Dispensing Dashboard</Link></Button>
        <Button asChild variant="outline" size="sm"><Link to="/doctor/rewards">Reward Points</Link></Button>
      </div>
    </div>
  );
};

export default EarningsSummary;
