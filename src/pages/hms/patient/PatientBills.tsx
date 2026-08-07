import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Receipt, Printer, MoreHorizontal, Brain, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

type AdvanceRecord = {
  id: string;
  amount: number;
  payment_mode: string;
  receipt_number: string | null;
  purpose: string | null;
  status: string;
  amount_used: number;
  created_at: string;
};

type PharmacyBillRecord = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  bill_amount: number | null;
  notes: string | null;
  created_at: string;
};

const PatientBills = () => {
  const [tab, setTab] = useState("op");
  const [advances, setAdvances] = useState<AdvanceRecord[]>([]);
  const [pharmacyBills, setPharmacyBills] = useState<PharmacyBillRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBills(); }, []);

  const loadBills = async () => {
    setLoading(true);
    try {
      const [{ data: advData }, { data: pharmData }] = await Promise.all([
        (supabase as any).from("hms_patient_advances").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("hms_ward_consumption_log").select("*, hms_ward_stock_items(product_name)").eq("consumption_type", "patient_use").eq("billed_to_patient", true).order("created_at", { ascending: false }).limit(20),
      ]);

      setAdvances(advData || []);
      setPharmacyBills((pharmData || []).map((r: any) => ({
        ...r,
        product_name: r.hms_ward_stock_items?.product_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load bills");
      console.error(err);
    }
    setLoading(false);
  };

  const totalAdvances = advances.reduce((s, a) => s + a.amount, 0);
  const totalUsed = advances.reduce((s, a) => s + a.amount_used, 0);
  const totalPharma = pharmacyBills.reduce((s, b) => s + (b.bill_amount || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Bills</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          <span className="text-sm text-violet-700">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Total Billing: Advances ₹{totalAdvances.toLocaleString()} | Used ₹{totalUsed.toLocaleString()} | Pharmacy ₹{totalPharma.toLocaleString()} | Balance: ₹{(totalAdvances - totalUsed).toLocaleString()}
          </span>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="op">OP Visit</TabsTrigger>
          <TabsTrigger value="ip">IP Visit</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy/Store</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
        </TabsList>

        {/* OP Bills / Advances */}
        <TabsContent value="op" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Receipt No</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Date</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Purpose</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Amount</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Used</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Payment Mode</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advances.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No advance/billing records found</td></tr>
                    ) : (
                      advances.map((a) => (
                        <tr key={a.id} className="border-b hover:bg-muted/30">
                          <td className="px-3 py-2 text-orange-600 font-medium">{a.receipt_number || "—"}</td>
                          <td className="px-3 py-2">{new Date(a.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2">{a.purpose || "—"}</td>
                          <td className="px-3 py-2 font-bold">₹{a.amount.toLocaleString()}</td>
                          <td className="px-3 py-2">₹{a.amount_used.toLocaleString()}</td>
                          <td className="px-3 py-2">{a.payment_mode}</td>
                          <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{a.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Bills (same as advances filtered) */}
        <TabsContent value="ip" className="mt-4">
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            IP billing data will populate from dedicated IP admission records. Currently showing {advances.filter(a => a.purpose === "ipd_admission").length} IP-related advances.
          </CardContent></Card>
        </TabsContent>

        {/* Pharmacy Bills - Live from consumption_log */}
        <TabsContent value="pharmacy" className="mt-4">
          <Card><CardContent className="p-0">
            <h3 className="p-3 font-semibold">Pharmacy Sale Bills ({pharmacyBills.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-orange-600">S.No</th>
                    <th className="px-3 py-2 text-left text-orange-600">Product</th>
                    <th className="px-3 py-2 text-left text-orange-600">Date</th>
                    <th className="px-3 py-2 text-center text-orange-600">Qty</th>
                    <th className="px-3 py-2 text-left text-orange-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacyBills.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No pharmacy bills found</td></tr>
                  ) : (
                    pharmacyBills.map((b, idx) => (
                      <tr key={b.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{b.product_name}</td>
                        <td className="px-3 py-2">{new Date(b.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">{b.quantity_consumed}</td>
                        <td className="px-3 py-2 font-bold">₹{(b.bill_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* Estimates */}
        <TabsContent value="estimates" className="mt-4">
          <Card><CardContent className="p-8 text-center text-muted-foreground">No Estimate bills available.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientBills;
