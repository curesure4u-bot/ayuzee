import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope, Sparkles } from "lucide-react";

interface AppointmentRow {
  id: string;
  appointment_date: string;
  time_slot: string;
  mode: string;
  fee: number;
  status: string;
  payment_status: string;
}
interface OrderRow {
  id: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
}
interface TherapyRow {
  id: string;
  therapy_name: string;
  booking_date: string;
  time_slot: string;
  price: number;
  status: string;
  payment_status: string;
}

const DoctorOrders = () => {
  const { userId } = useDoctor();
  const [appts, setAppts] = useState<AppointmentRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [therapies, setTherapies] = useState<TherapyRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [a, o, t] = await Promise.all([
        supabase.from("appointments").select("*").order("appointment_date", { ascending: false }),
        supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("therapy_bookings").select("*").eq("user_id", userId).order("booking_date", { ascending: false }),
      ]);
      setAppts((a.data ?? []) as AppointmentRow[]);
      setOrders((o.data ?? []) as OrderRow[]);
      setTherapies((t.data ?? []) as TherapyRow[]);
    })();
  }, [userId]);

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="p-6">
        <h1 className="mb-4 font-display text-2xl">My Orders & Bookings</h1>
        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments"><Stethoscope className="mr-1 h-4 w-4" />Patient Appointments</TabsTrigger>
            <TabsTrigger value="medicine"><Calendar className="mr-1 h-4 w-4" />Medicine Orders</TabsTrigger>
            <TabsTrigger value="therapy"><Sparkles className="mr-1 h-4 w-4" />Therapy Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4 space-y-3">
            {appts.length === 0 ? (
              <Empty msg="No appointments yet." />
            ) : appts.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{new Date(a.appointment_date).toLocaleDateString()} • {a.time_slot}</p>
                    <p className="text-sm text-muted-foreground capitalize">{a.mode} consultation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === "confirmed" ? "default" : "secondary"}>{a.status}</Badge>
                    <Badge variant={a.payment_status === "paid" ? "default" : "outline"}>{a.payment_status}</Badge>
                    <span className="font-semibold">₹{a.fee}</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="medicine" className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <Empty msg="No medicine orders yet." />
            ) : orders.map((o) => (
              <Card key={o.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm text-primary">AYZ-{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{o.order_status}</Badge>
                    <Badge variant={o.payment_status === "paid" ? "default" : "outline"}>{o.payment_status}</Badge>
                    <span className="font-semibold">₹{o.total}</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="therapy" className="mt-4 space-y-3">
            {therapies.length === 0 ? (
              <Empty msg="No therapy bookings yet." />
            ) : therapies.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{t.therapy_name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(t.booking_date).toLocaleDateString()} • {t.time_slot}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{t.status}</Badge>
                    <Badge variant={t.payment_status === "paid" ? "default" : "outline"}>{t.payment_status}</Badge>
                    <span className="font-semibold">₹{t.price}</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const Empty = ({ msg }: { msg: string }) => (
  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{msg}</div>
);

export default DoctorOrders;
