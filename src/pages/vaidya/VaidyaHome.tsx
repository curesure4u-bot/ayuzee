import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Users, IndianRupee, CalendarDays, Boxes, ReceiptText, HeartHandshake } from "lucide-react";

const VaidyaHome = () => {
  const { doctor, userId } = useDoctor();
  const [stats, setStats] = useState({ patients: 0, earned: 0, appts: 0, lowStock: 0 });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ count: walkins }, { data: bills }, { data: appts }, { data: stock }] = await Promise.all([
        supabase.from("vaidya_patients").select("id", { count: "exact", head: true }).eq("doctor_user_id", userId),
        supabase.from("vaidya_bills").select("total").eq("doctor_user_id", userId),
        doctor?.id
          ? supabase.from("appointments").select("user_id, fee, payment_status").eq("doctor_id", doctor.id)
          : Promise.resolve({ data: [] as any[] }),
        supabase.from("vaidya_inventory").select("quantity, low_stock_threshold").eq("doctor_user_id", userId),
      ]);
      const apptUsers = new Set((appts ?? []).map((a: any) => a.user_id));
      const earned =
        (bills ?? []).reduce((s: number, b: any) => s + (b.total ?? 0), 0) +
        (appts ?? []).filter((a: any) => a.payment_status === "paid").reduce((s: number, a: any) => s + (a.fee ?? 0), 0);
      const lowStock = (stock ?? []).filter((s: any) => s.quantity <= (s.low_stock_threshold ?? 5)).length;
      setStats({
        patients: (walkins ?? 0) + apptUsers.size,
        earned,
        appts: (appts ?? []).length,
        lowStock,
      });
    })();
  }, [userId, doctor?.id]);

  const cards = [
    { label: "Number Of Patients", value: stats.patients, icon: Users, tone: "from-primary/80 to-primary" },
    { label: "Total Earned Amount", value: `₹ ${stats.earned}`, icon: IndianRupee, tone: "from-rose-500/80 to-rose-500" },
    { label: "Total Appointments", value: stats.appts, icon: CalendarDays, tone: "from-sky-500/80 to-sky-500" },
    { label: "Low-stock Items", value: stats.lowStock, icon: Boxes, tone: "from-amber-500/80 to-amber-500" },
  ];

  const quick = [
    { to: "/vaidya/consultations", label: "My Consultation", icon: ReceiptText },
    { to: "/vaidya/patients", label: "All Patients", icon: Users },
    { to: "/vaidya/inventory", label: "Inventory", icon: Boxes },
    { to: "/vaidya/network", label: "Partner Network", icon: HeartHandshake },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl">Welcome, Dr. {doctor?.full_name?.split(" ")[0] || "Vaidya"}</h1>
        <p className="text-sm text-muted-foreground">Manage your practice end-to-end with the Vaidya Tool.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className={`overflow-hidden bg-gradient-to-br ${c.tone} text-primary-foreground`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">{c.label}</p>
                <c.icon className="h-5 w-5 opacity-90" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold">{c.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((q) => (
            <Link key={q.to} to={q.to}>
              <Card className="flex items-center gap-3 p-4 transition hover:shadow-elegant hover:border-primary/40">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <q.icon className="h-5 w-5" />
                </span>
                <p className="font-medium">{q.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaidyaHome;
