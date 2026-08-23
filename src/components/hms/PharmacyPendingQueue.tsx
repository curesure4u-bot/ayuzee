import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { usePrescription } from "@/hooks/usePrescription";
import { Pill, CheckCircle, Clock, Loader2, RefreshCw, User } from "lucide-react";

type PendingRx = {
  id: string;
  patient_display_id: string;
  patient_name: string;
  doctor_name: string;
  diagnosis: string | null;
  pharmacy_status: string;
  created_at: string;
};

export const PharmacyPendingQueue = () => {
  const [prescriptions, setPrescriptions] = useState<PendingRx[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispensing, setDispensing] = useState<string | null>(null);
  const { getPendingForPharmacy, getPrescriptionItems, markDispensed } = usePrescription();

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingForPharmacy();
      setPrescriptions(data);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
    // Realtime subscription
    const channel = supabase
      .channel("pharmacy-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "hms_prescriptions" }, () => loadPending())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDispense = async (rxId: string) => {
    setDispensing(rxId);
    try {
      await markDispensed(rxId);
      toast.success("Prescription dispensed successfully");
      loadPending();
    } catch (e: any) {
      toast.error(e.message || "Failed to dispense");
    }
    setDispensing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Pending Prescriptions</h3>
          <Badge variant="secondary">{prescriptions.length}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={loadPending}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No pending prescriptions. All dispensed!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rx.patient_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {rx.patient_display_id} · {rx.doctor_name} · {rx.diagnosis || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(rx.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                    disabled={dispensing === rx.id}
                    onClick={() => handleDispense(rx.id)}
                  >
                    {dispensing === rx.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    Dispense
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyPendingQueue;
