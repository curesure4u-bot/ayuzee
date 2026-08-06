import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ReceiptText, Plus, Search, IndianRupee, Download, Pill, Shield, Calculator, Wallet } from "lucide-react";

type Bill = {
  id: string;
  bill_number: string | null;
  patient_name: string | null;
  total_amount: number;
  paid_amount: number | null;
  status: string | null;
  bill_date: string;
  payment_mode: string | null;
};

const HmsBilling = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data } = await (supabase as any)
        .from("vaidya_bills")
        .select("id,bill_number,patient_name,total_amount,paid_amount,status,bill_date,payment_mode")
        .eq("doctor_user_id", uid)
        .order("bill_date", { ascending: false })
        .limit(100);
      setBills(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.patient_name ?? "").toLowerCase().includes(q) ||
      (b.bill_number ?? "").toLowerCase().includes(q)
    );
  });

  const totalCollection = bills.reduce((s, b) => s + (b.paid_amount ?? 0), 0);
  const totalPending = bills.reduce((s, b) => s + (b.total_amount - (b.paid_amount ?? 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground">{bills.length} bills generated</p>
        </div>
        <div className="flex gap-2">
          <Link to="/hms/stock/sale/new">
            <Button size="sm" variant="outline" className="border-orange-300 text-orange-600">
              <Pill className="mr-1 h-4 w-4" /> Pharmacy Sale
            </Button>
          </Link>
          <Link to="/hms/copay-calculator">
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-600">
              <Calculator className="mr-1 h-4 w-4" /> Copay Calculator
            </Button>
          </Link>
          <Link to="/hms/billing/insurance">
            <Button size="sm" variant="outline" className="border-green-300 text-green-600">
              <Shield className="mr-1 h-4 w-4" /> Insurance Claims
            </Button>
          </Link>
          <Link to="/hms/accounts">
            <Button size="sm" variant="outline" className="border-purple-300 text-purple-600">
              <Wallet className="mr-1 h-4 w-4" /> Accounts
            </Button>
          </Link>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Bill</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Collection</p><p className="font-display text-2xl font-bold text-green-600">₹{totalCollection.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Amount</p><p className="font-display text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Bills</p><p className="font-display text-2xl font-bold">{bills.length}</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search bills..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading bills...</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No bills found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Bill #</th>
                    <th className="px-4 py-3 text-left font-medium">Patient</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Paid</th>
                    <th className="px-4 py-3 text-left font-medium">Mode</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{b.bill_number ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{b.patient_name ?? "—"}</td>
                      <td className="px-4 py-3">₹{b.total_amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">₹{(b.paid_amount ?? 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 capitalize">{b.payment_mode ?? "—"}</td>
                      <td className="px-4 py-3">{b.bill_date}</td>
                      <td className="px-4 py-3">
                        <Badge variant={b.status === "paid" ? "default" : b.status === "partial" ? "secondary" : "destructive"}>
                          {b.status ?? "pending"}
                        </Badge>
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

export default HmsBilling;
