import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Users, Search, Pill, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PatientHistory = {
  patient_name: string;
  total_dispensed: number;
  total_amount: number;
  medicines: string[];
  last_date: string;
};

export default function PatientDispensing() {
  const [patients, setPatients] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stock_items(product_name)")
        .in("consumption_type", ["patient_use", "therapy_use"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by patient (extracted from notes)
      const patientMap: Record<string, { total: number; amount: number; medicines: Set<string>; lastDate: string }> = {};
      (data || []).forEach((row: any) => {
        const match = (row.notes || "").match(/Patient:\s*([^.]+)/i);
        const name = match ? match[1].trim() : "Walk-in";
        const product = row.hms_ward_stock_items?.product_name || "Unknown";

        if (!patientMap[name]) patientMap[name] = { total: 0, amount: 0, medicines: new Set(), lastDate: row.created_at };
        patientMap[name].total += row.quantity_consumed || 0;
        patientMap[name].amount += row.bill_amount || 0;
        patientMap[name].medicines.add(product);
        if (row.created_at > patientMap[name].lastDate) patientMap[name].lastDate = row.created_at;
      });

      setPatients(Object.entries(patientMap).map(([name, d]) => ({
        patient_name: name,
        total_dispensed: d.total,
        total_amount: d.amount,
        medicines: Array.from(d.medicines),
        last_date: d.lastDate,
      })).sort((a, b) => b.total_amount - a.total_amount));
    } catch (err: any) {
      toast.error("Failed to load dispensing data");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = search
    ? patients.filter(p => p.patient_name.toLowerCase().includes(search.toLowerCase()))
    : patients;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Patient Dispensing History</h1>
        <p className="text-muted-foreground mt-1">Per-patient dispensing records from live consumption log — adherence tracking.</p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search patient name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{patients.length}</p><p className="text-xs text-muted-foreground">Patients</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Pill className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{patients.reduce((s, p) => s + p.total_dispensed, 0)}</p><p className="text-xs text-muted-foreground">Total Dispensed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(patients.reduce((s, p) => s + p.total_amount, 0) / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Billed</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Patient Dispensing Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-center">Items</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Medicines</th>
                  <th className="px-3 py-2 text-left">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No dispensing records found</td></tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{p.patient_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{p.total_dispensed}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold text-green-600">₹{p.total_amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px] truncate">{p.medicines.join(", ")}</td>
                      <td className="px-3 py-2 text-xs">{new Date(p.last_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">Dispensing Intelligence</p>
            <p className="text-[10px] text-purple-700">Groups consumption_log by patient name (from notes). Shows total dispensed, amount, and medicine list. Useful for adherence tracking and subscription conversion.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
