import { useEffect, useMemo, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Filter } from "lucide-react";
import { Link } from "react-router-dom";

interface OrderRow {
  id: string;
  user_id: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  appointment_id: string | null;
}
interface ApptRow {
  id: string;
  user_id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  payment_status: string;
}
type MedicineFilter = "all" | "delivered" | "in-transit" | "returned";
type ConsultationFilter = "all" | "transferred" | "pending";

const Empty = ({ msg }: { msg: string }) => (
  <div className="py-16 text-center">
    <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/40" />
    <p className="mt-4 font-semibold">{msg}</p>
  </div>
);

const PatientOrders = () => {
  const { doctor } = useDoctor();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [appts, setAppts] = useState<ApptRow[]>([]);
  const [patients, setPatients] = useState<Record<string, string>>({});
  const [medFilter, setMedFilter] = useState<MedicineFilter>("all");
  const [consultFilter, setConsultFilter] = useState<ConsultationFilter>("all");

  useEffect(() => {
    if (!doctor?.id) return;
    (async () => {
      const { data: appData } = await supabase
        .from("appointments")
        .select("id, user_id, appointment_date, time_slot, status, payment_status")
        .eq("doctor_id", doctor.id)
        .order("appointment_date", { ascending: false });
      const apList = (appData ?? []) as ApptRow[];
      setAppts(apList);

      const userIds = Array.from(new Set(apList.map((a) => a.user_id)));
      if (userIds.length) {
        const { data: ord } = await supabase
          .from("orders")
          .select("id, user_id, total, order_status, payment_status, created_at, appointment_id")
          .in("user_id", userIds)
          .order("created_at", { ascending: false });
        setOrders((ord ?? []) as OrderRow[]);

        const { data: profs } = await supabase
          .from("profiles").select("user_id, full_name").in("user_id", userIds);
        const m: Record<string, string> = {};
        (profs ?? []).forEach((p) => { m[p.user_id] = p.full_name ?? "Patient"; });
        setPatients(m);
      }
    })();
  }, [doctor?.id]);

  const medicineOrders = useMemo(() => {
    if (medFilter === "all") return orders;
    if (medFilter === "delivered") return orders.filter((o) => o.order_status === "delivered");
    if (medFilter === "in-transit") return orders.filter((o) => ["shipped", "placed", "processing"].includes(o.order_status));
    return orders.filter((o) => o.order_status === "returned");
  }, [orders, medFilter]);

  const consultations = useMemo(() => {
    if (consultFilter === "all") return appts;
    if (consultFilter === "transferred") return appts.filter((a) => a.payment_status === "paid");
    return appts.filter((a) => a.payment_status !== "paid");
  }, [appts, consultFilter]);

  const draftAppts = useMemo(() => {
    const orderedIds = new Set(orders.map((o) => o.appointment_id).filter(Boolean));
    return appts.filter((a) => !orderedIds.has(a.id) && a.status !== "cancelled");
  }, [appts, orders]);

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/doctor"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="font-display text-2xl">Patient Orders</h1>
          </div>
          <Button variant="ghost" size="icon"><Filter className="h-4 w-4 text-primary" /></Button>
        </div>

        <Tabs defaultValue="medicine">
          <TabsList>
            <TabsTrigger value="medicine">Medicine Orders</TabsTrigger>
            <TabsTrigger value="consultation">Consultation Orders</TabsTrigger>
            <TabsTrigger value="draft">Draft Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="medicine" className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {(["all", "delivered", "in-transit", "returned"] as MedicineFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setMedFilter(f)}
                  className={`rounded-full border px-4 py-1 text-sm capitalize transition ${
                    medFilter === f ? "border-primary text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {f === "all" ? "All Orders" : f}
                </button>
              ))}
            </div>
            {medicineOrders.length === 0 ? (
              <Empty msg="No order found. Please change filter" />
            ) : (
              <div className="space-y-3">
                {medicineOrders.map((o) => (
                  <Card key={o.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-primary">{patients[o.user_id] || "Patient"}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          AYZ-{o.id.slice(0, 8).toUpperCase()} • {new Date(o.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{o.order_status}</Badge>
                        <Badge variant={o.payment_status === "paid" ? "default" : "outline"}>{o.payment_status}</Badge>
                        <span className="font-semibold">₹{o.total}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="consultation" className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {(["all", "transferred", "pending"] as ConsultationFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setConsultFilter(f)}
                  className={`rounded-full border px-4 py-1 text-sm capitalize transition ${
                    consultFilter === f ? "border-primary text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {f === "all" ? "All Orders" : f}
                </button>
              ))}
            </div>
            {consultations.length === 0 ? (
              <Empty msg="No order found. Please change filter" />
            ) : (
              <div className="space-y-3">
                {consultations.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-primary">{patients[a.user_id] || "Patient"}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.appointment_date} • {a.time_slot}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{a.status}</Badge>
                        <Badge variant={a.payment_status === "paid" ? "default" : "outline"}>{a.payment_status}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-4">
            {draftAppts.length === 0 ? (
              <Empty msg="No draft orders." />
            ) : (
              <div className="space-y-3">
                {draftAppts.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary">{patients[a.user_id] || "Patient"}</p>
                        <p className="text-xs text-muted-foreground">
                          Appt ID: AT-{a.id.slice(0, 6).toUpperCase()} • Created on {a.appointment_date}
                        </p>
                      </div>
                      <Button size="sm" variant="hero" asChild>
                        <Link to="/shop">Order Now</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PatientOrders;
