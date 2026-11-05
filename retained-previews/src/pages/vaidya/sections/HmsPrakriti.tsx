import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Row {
  id: string;
  patient_name: string | null;
  patient_user_id: string;
  dominant_dosha: string | null;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  created_at: string;
}

const HmsPrakriti = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data } = await supabase
      .from("prakriti_assessments")
      .select("id, patient_name, patient_user_id, dominant_dosha, vata_score, pitta_score, kapha_score, created_at")
      .eq("assessor_user_id", u.user.id)
      .order("created_at", { ascending: false });
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startGuided = () => {
    if (!patientId.trim()) {
      toast.error("Enter a patient user ID first");
      return;
    }
    window.location.href = `/diagnosis/prakriti/run?mode=doctor&patient_user_id=${patientId.trim()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Prakriti Pareeksha
        </h1>
        <p className="text-sm text-muted-foreground">Conduct guided Ayurveda constitution assessments for your patients.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold">Start a guided assessment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the patient's account ID (from their dashboard URL) to record the assessment under their record.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <Label>Patient user ID</Label>
            <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="uuid…" className="mt-1" />
          </div>
          <Button variant="hero" onClick={startGuided}>
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">Past assessments you've conducted</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No assessments recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{r.patient_name || "Unnamed patient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} · V {r.vata_score} / P {r.pitta_score} / K {r.kapha_score}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">{r.dominant_dosha?.replace("-", "–") || "—"}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        Need the patient quiz link? Share <Link to="/diagnosis/prakriti" className="text-primary underline">/diagnosis/prakriti</Link> with your patient for self-assessment.
      </p>
    </div>
  );
};

export default HmsPrakriti;
