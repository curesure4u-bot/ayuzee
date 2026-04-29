import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, ArrowLeft, Wallet, IndianRupee, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { toast } from "sonner";

type Payout = {
  id: string;
  reference: string;
  patient: string;
  amount: number;
  status: "pending" | "processed" | "outstanding";
  date: string;
  type: "medicine" | "consultation";
};

const DoctorPayouts = () => {
  const { doctor } = useDoctor();
  const [query, setQuery] = useState("");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const load = async () => {
      if (!doctor?.id) {
        setLoading(false);
        return;
      }
      // Medicine payouts derived from delivered orders linked to doctor's appointments
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, fee, payment_status, status, appointment_date, user_id")
        .eq("doctor_id", doctor.id);

      const consultPayouts: Payout[] =
        (appts ?? [])
          .filter((a) => a.payment_status === "paid")
          .map((a) => ({
            id: a.id,
            reference: a.id.slice(0, 8).toUpperCase(),
            patient: "Patient",
            amount: Number(a.fee) || 0,
            status: a.status === "completed" ? "processed" : "pending",
            date: a.appointment_date,
            type: "consultation" as const,
          }));

      setPayouts(consultPayouts);
      setLoading(false);
    };
    load();
  }, [doctor?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payouts;
    return payouts.filter(
      (p) =>
        p.reference.toLowerCase().includes(q) ||
        p.patient.toLowerCase().includes(q),
    );
  }, [payouts, query]);

  const medicine = filtered.filter((p) => p.type === "medicine");
  const consultation = filtered.filter((p) => p.type === "consultation");
  const outstanding = filtered.filter(
    (p) => p.status === "pending" || p.status === "outstanding",
  );

  const totalEarned = payouts
    .filter((p) => p.status === "processed")
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts
    .filter((p) => p.status !== "processed")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor"
            className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-2xl">Payouts</h1>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl gradient-leaf">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Lifetime payouts
              </p>
              <p className="font-display text-2xl">₹{totalEarned.toFixed(0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
              <IndianRupee className="h-5 w-5 text-accent-foreground" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Outstanding
              </p>
              <p className="font-display text-2xl">
                ₹{totalPending.toFixed(0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <Tabs defaultValue="medicine">
          <TabsList>
            <TabsTrigger value="medicine">Medicine</TabsTrigger>
            <TabsTrigger value="consultation">Consultation</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding Payouts</TabsTrigger>
          </TabsList>

          <div className="relative mt-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Name, Order ID"
              className="pl-9"
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Order margin payouts are processed every Monday by end of day. Orders
            qualify for payout only after 7 days have passed since the delivery
            date.
          </p>

          <TabsContent value="medicine">
            <PayoutList items={medicine} loading={loading} empty="No medicine payouts yet." />
          </TabsContent>
          <TabsContent value="consultation">
            <PayoutList items={consultation} loading={loading} empty="No consultation payouts yet." />
          </TabsContent>
          <TabsContent value="outstanding">
            <PayoutList items={outstanding} loading={loading} empty="No outstanding payouts." />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const PayoutList = ({
  items,
  loading,
  empty,
}: {
  items: Payout[];
  loading: boolean;
  empty: string;
}) => {
  if (loading) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading…</p>;
  }
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <div className="mt-6 divide-y divide-border rounded-lg border border-border">
      {items.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div>
            <p className="font-medium">#{p.reference}</p>
            <p className="text-xs text-muted-foreground">
              {p.patient} • {new Date(p.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={p.status === "processed" ? "secondary" : "outline"}
              className="capitalize"
            >
              {p.status}
            </Badge>
            <span className="font-display text-lg">₹{p.amount.toFixed(0)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorPayouts;
