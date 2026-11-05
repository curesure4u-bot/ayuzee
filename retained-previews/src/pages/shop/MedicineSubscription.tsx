import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  RefreshCw, Plus, Calendar, Pill, Pause, Play, X,
  TrendingUp, IndianRupee, Truck, CheckCircle2,
} from "lucide-react";

interface Subscription {
  id: string;
  plan_name: string;
  medicines: { name: string; quantity: number; price: number }[];
  frequency_days: number;
  next_delivery_date: string;
  total_monthly_value: number;
  discount_percentage: number;
  status: string;
  total_deliveries: number;
  last_delivered_at: string | null;
}

const MedicineSubscription = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { setLoading(false); return; }
      const { data } = await supabase
        .from("medicine_subscriptions")
        .select("*")
        .eq("patient_id", sess.session.user.id)
        .order("created_at", { ascending: false });
      setSubs((data ?? []) as Subscription[]);
      setLoading(false);
    })();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "paused" : "active";
    await supabase.from("medicine_subscriptions").update({ status: next }).eq("id", id);
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status: next } : s));
    toast.success(next === "active" ? "Subscription resumed!" : "Subscription paused");
  };

  const cancel = async (id: string) => {
    await supabase.from("medicine_subscriptions").update({ status: "cancelled" }).eq("id", id);
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status: "cancelled" } : s));
    toast.success("Subscription cancelled");
  };

  const activeSubs = subs.filter((s) => s.status === "active");
  const totalMonthly = activeSubs.reduce((s, sub) => s + sub.total_monthly_value, 0);
  const totalSavings = Math.round(totalMonthly * 0.05);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold">Medicine Subscriptions</h1>
              <p className="text-muted-foreground">Auto-refill your regular medicines. Save 5% on every delivery.</p>
            </div>
            <Button asChild><Link to="/shop"><Plus className="mr-1 h-4 w-4" /> Add from Shop</Link></Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <RefreshCw className="mx-auto h-5 w-5 text-primary mb-1" />
                <p className="font-display text-2xl font-bold">{activeSubs.length}</p>
                <p className="text-xs text-muted-foreground">Active Plans</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <IndianRupee className="mx-auto h-5 w-5 text-emerald-600 mb-1" />
                <p className="font-display text-2xl font-bold">₹{totalMonthly.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Monthly Value</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <TrendingUp className="mx-auto h-5 w-5 text-amber-600 mb-1" />
                <p className="font-display text-2xl font-bold text-green-600">₹{totalSavings}</p>
                <p className="text-xs text-muted-foreground">Monthly Savings (5%)</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions List */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : subs.length === 0 ? (
            <Card className="py-12 text-center">
              <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No subscriptions yet. Set up auto-refill for your regular medicines.</p>
              <Button asChild className="mt-4"><Link to="/shop">Browse Medicines</Link></Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {subs.map((sub) => (
                <Card key={sub.id} className={sub.status === "cancelled" ? "opacity-60" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{sub.plan_name}</h3>
                          <Badge className={sub.status === "active" ? "bg-green-100 text-green-700" : sub.status === "paused" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}>
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Every {sub.frequency_days} days · {sub.total_deliveries} deliveries so far
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold">₹{sub.total_monthly_value}</p>
                        <p className="text-xs text-green-600">Save ₹{Math.round(sub.total_monthly_value * sub.discount_percentage / 100)}</p>
                      </div>
                    </div>

                    {/* Medicines List */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {sub.medicines.map((med: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          <Pill className="mr-0.5 h-2.5 w-2.5" /> {med.name} ×{med.quantity}
                        </Badge>
                      ))}
                    </div>

                    {/* Next Delivery */}
                    {sub.status === "active" && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" />
                        Next delivery: <span className="font-medium text-foreground">{new Date(sub.next_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    )}

                    {/* Actions */}
                    {sub.status !== "cancelled" && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(sub.id, sub.status)}>
                          {sub.status === "active" ? <><Pause className="mr-1 h-3.5 w-3.5" /> Pause</> : <><Play className="mr-1 h-3.5 w-3.5" /> Resume</>}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => cancel(sub.id)}>
                          <X className="mr-1 h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* How it works */}
          <Card>
            <CardHeader><CardTitle className="text-base">How Medicine Subscription Works</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              {[
                { icon: Pill, label: "Choose Medicines", desc: "Select from your past orders or shop" },
                { icon: Calendar, label: "Set Frequency", desc: "Monthly, bi-weekly, or custom" },
                { icon: Truck, label: "Auto-Delivery", desc: "Delivered on schedule, every time" },
                { icon: TrendingUp, label: "Save 5%", desc: "Flat discount on every subscription" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-2 text-xs font-semibold">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MedicineSubscription;
