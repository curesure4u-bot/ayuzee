import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  city: string;
  consultation_fee: number;
  is_approved: boolean;
  rating: number;
  created_at: string;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("doctors")
      .select("id,full_name,specialization,city,consultation_fee,is_approved,rating,created_at")
      .order("created_at", { ascending: false });
    setDoctors((data ?? []) as Doctor[]);
    setLoading(false);
  };

  useEffect(() => { document.title = "Admin · Doctors — Ayuzee"; load(); }, []);

  const setApproval = async (id: string, value: boolean) => {
    const { error } = await supabase.from("doctors").update({ is_approved: value }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(value ? "Doctor approved" : "Doctor rejected");
    setDoctors((d) => d.map((x) => x.id === id ? { ...x, is_approved: value } : x));
  };

  // Platform takes 15% commission on consultations
  const commissionRate = 0.15;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Doctors</h1>
        <p className="text-sm text-muted-foreground">{doctors.length} total · default commission {Math.round(commissionRate * 100)}%</p>
      </div>

      <Card>
        <CardHeader><CardTitle>All doctors</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{d.specialization}</TableCell>
                    <TableCell>{d.city}</TableCell>
                    <TableCell className="text-right">₹{d.consultation_fee}</TableCell>
                    <TableCell className="text-right">{Math.round(commissionRate * 100)}% (₹{Math.round(d.consultation_fee * commissionRate)})</TableCell>
                    <TableCell>
                      {d.is_approved
                        ? <Badge className="bg-primary text-primary-foreground">Approved</Badge>
                        : <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!d.is_approved && (
                          <Button size="sm" variant="hero" onClick={() => setApproval(d.id, true)}>
                            <Check className="mr-1 h-4 w-4" /> Approve
                          </Button>
                        )}
                        {d.is_approved && (
                          <Button size="sm" variant="outline" onClick={() => setApproval(d.id, false)}>
                            <X className="mr-1 h-4 w-4" /> Revoke
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {doctors.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">No doctors yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDoctors;
