import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Stethoscope, Pill, IndianRupee, CalendarClock } from "lucide-react";

const fmtINR = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const MisDrillDown = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { userId } = useDoctor();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!userId || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const decoded = decodeURIComponent(id);

      if (type === "bill") {
        const { data: bill } = await supabase
          .from("vaidya_bills")
          .select("*")
          .eq("id", decoded)
          .eq("doctor_user_id", userId)
          .maybeSingle();
        const { data: items } = await supabase
          .from("vaidya_bill_items")
          .select("*")
          .eq("bill_id", decoded);
        if (!cancelled) {
          setRecord(bill);
          setRelated(items ?? []);
        }
      } else if (type === "consultation") {
        const { data: c } = await supabase
          .from("vaidya_consultations")
          .select("*")
          .eq("id", decoded)
          .eq("doctor_user_id", userId)
          .maybeSingle();
        if (!cancelled) setRecord(c);
      } else if (type === "medicine") {
        // Decoded id IS the medicine name
        const { data: items } = await supabase
          .from("vaidya_bill_items")
          .select("id,medicine_name,quantity,unit_price,line_total,bill_id,vaidya_bills!inner(id,bill_no,bill_date,patient_name,doctor_user_id,total)")
          .eq("medicine_name", decoded)
          .eq("vaidya_bills.doctor_user_id", userId)
          .order("id", { ascending: false });
        if (!cancelled) {
          setRecord({ medicine_name: decoded });
          setRelated(items ?? []);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [type, id, userId]);

  if (loading) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!record) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6 text-center">
        <p className="text-muted-foreground">Record not found or you don't have access.</p>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      </div>
    );
  }

  const Header = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to MIS
        </Button>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-display text-xl font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </div>
      <Badge variant="outline" className="text-xs">HMS Tools Ultra · Drill-down</Badge>
    </div>
  );

  if (type === "bill") {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Header
          icon={FileText}
          title={`Invoice ${record.bill_no || record.id.slice(0, 8)}`}
          subtitle={`${record.bill_type || "patient_bill"} · ${(record.bill_date || record.created_at)?.slice(0, 10)}`}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Patient</p>
            <p className="mt-1 font-semibold">{record.patient_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{record.patient_phone || ""}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Payment</p>
            <p className="mt-1 font-semibold capitalize">{record.payment_mode || "—"}</p>
            <p className="text-xs text-muted-foreground">Status: {record.status || "—"}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-emerald-500/80 to-emerald-600 text-primary-foreground">
            <p className="text-xs uppercase opacity-90">Total</p>
            <p className="mt-1 font-display text-2xl font-bold">{fmtINR(record.total)}</p>
            <p className="text-xs opacity-90">Subtotal {fmtINR(record.subtotal)} · Disc {fmtINR(record.discount)}</p>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="mb-3 font-semibold">Line items ({related.length})</h3>
          {related.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No line items.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-2">Medicine</th>
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 pr-2 text-right">Unit</th>
                  <th className="py-2 pr-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {related.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      <Link
                        to={`/vaidya/mis/drill/medicine/${encodeURIComponent(it.medicine_name || "")}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {it.medicine_name}
                      </Link>
                    </td>
                    <td className="py-2 pr-2 text-right">{it.quantity}</td>
                    <td className="py-2 pr-2 text-right">{fmtINR(it.unit_price)}</td>
                    <td className="py-2 pr-2 text-right font-medium">{fmtINR(it.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    );
  }

  if (type === "consultation") {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Header icon={Stethoscope} title="Consultation" subtitle={`Visit ${record.visit_date}`} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Patient ID</p>
            <p className="mt-1 font-mono text-sm">{record.patient_id || "—"}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Fee</p>
            <p className="mt-1 font-semibold">{fmtINR(record.fee)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Visit date</p>
            <p className="mt-1 font-semibold">{record.visit_date}</p>
          </Card>
        </div>

        <Card className="p-5 space-y-4">
          {[
            ["Chief complaints", record.complaints],
            ["History", record.history],
            ["Examination", record.examination],
            ["Diagnosis", record.diagnosis],
            ["Advice", record.advice],
            ["Notes", record.notes],
          ].map(([label, val]) => (
            <div key={label as string}>
              <p className="text-xs uppercase text-muted-foreground">{label}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{(val as string) || "—"}</p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // medicine
  const totals = related.reduce(
    (acc, it) => {
      acc.qty += it.quantity ?? 0;
      acc.revenue += it.line_total ?? 0;
      return acc;
    },
    { qty: 0, revenue: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Header icon={Pill} title={record.medicine_name} subtitle="All sales across your bills" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Total sold</p>
          <p className="mt-1 font-display text-2xl font-bold">{totals.qty}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/80 to-emerald-600 text-primary-foreground">
          <p className="text-xs uppercase opacity-90">Revenue</p>
          <p className="mt-1 font-display text-2xl font-bold">{fmtINR(totals.revenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Bills containing this</p>
          <p className="mt-1 font-display text-2xl font-bold">{related.length}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 font-semibold flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-emerald-500" />Sales history
        </h3>
        {related.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No sales recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-2">Bill</th>
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Patient</th>
                <th className="py-2 pr-2 text-right">Qty</th>
                <th className="py-2 pr-2 text-right">Unit</th>
                <th className="py-2 pr-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {related.map((it) => {
                const b = it.vaidya_bills || {};
                return (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      <Link to={`/vaidya/mis/drill/bill/${b.id}`} className="font-mono text-xs text-primary hover:underline">
                        {b.bill_no || b.id?.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-2 pr-2">{b.bill_date}</td>
                    <td className="py-2 pr-2">{b.patient_name}</td>
                    <td className="py-2 pr-2 text-right">{it.quantity}</td>
                    <td className="py-2 pr-2 text-right">{fmtINR(it.unit_price)}</td>
                    <td className="py-2 pr-2 text-right font-medium">{fmtINR(it.line_total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default MisDrillDown;
