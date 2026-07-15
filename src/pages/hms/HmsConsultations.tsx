import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, Search } from "lucide-react";

type Consultation = {
  id: string;
  patient_name: string | null;
  chief_complaint: string | null;
  diagnosis: string | null;
  status: string | null;
  consultation_date: string | null;
};

const HmsConsultations = () => {
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;
      const { data } = await (supabase as any)
        .from("vaidya_consultations")
        .select("id,patient_name,chief_complaint,diagnosis,status,consultation_date")
        .eq("doctor_user_id", uid)
        .order("consultation_date", { ascending: false })
        .limit(100);
      setConsults(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = consults.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.patient_name ?? "").toLowerCase().includes(q) ||
      (c.chief_complaint ?? "").toLowerCase().includes(q) ||
      (c.diagnosis ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Consultations</h1>
          <p className="text-sm text-muted-foreground">{consults.length} consultations recorded</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Consultation</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by patient, complaint or diagnosis..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No consultations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Patient</th>
                    <th className="px-4 py-3 text-left font-medium">Chief Complaint</th>
                    <th className="px-4 py-3 text-left font-medium">Diagnosis</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{c.patient_name ?? "—"}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{c.chief_complaint ?? "—"}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{c.diagnosis ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.consultation_date ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === "completed" ? "default" : "secondary"}>
                          {c.status ?? "draft"}
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

export default HmsConsultations;
