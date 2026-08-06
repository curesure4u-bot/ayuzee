import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  TrendingUp,
  Plus,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Pill,
  Target,
  Loader2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

const OUTCOME_STATUS = [
  { value: "ongoing", label: "Ongoing", color: "bg-blue-100 text-blue-700" },
  { value: "improved", label: "Improved", color: "bg-emerald-100 text-emerald-700" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700" },
  { value: "no_change", label: "No Change", color: "bg-gray-100 text-gray-700" },
  { value: "worsened", label: "Worsened", color: "bg-red-100 text-red-700" },
  { value: "discontinued", label: "Discontinued", color: "bg-amber-100 text-amber-700" },
];

interface Outcome {
  id: string;
  condition_treated: string;
  diagnosis_details: string | null;
  treatment_start_date: string;
  treatment_end_date: string | null;
  duration_days: number | null;
  baseline_severity: number | null;
  final_severity: number | null;
  outcome_status: string;
  improvement_percentage: number | null;
  patient_satisfaction: number | null;
  side_effects: string | null;
  notes: string | null;
  medicines_used: string[];
  therapies_used: string[];
  follow_up_count: number;
  is_published: boolean;
  created_at: string;
}

interface OutcomeStats {
  total: number;
  resolved: number;
  improved: number;
  avgImprovement: number;
  avgSatisfaction: number;
}

const TreatmentOutcomes = () => {
  const { userId } = useDoctor();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [stats, setStats] = useState<OutcomeStats>({ total: 0, resolved: 0, improved: 0, avgImprovement: 0, avgSatisfaction: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    condition_treated: "",
    diagnosis_details: "",
    treatment_start_date: "",
    treatment_end_date: "",
    baseline_severity: "",
    final_severity: "",
    outcome_status: "ongoing",
    side_effects: "",
    notes: "",
    medicines_used: "",
    therapies_used: "",
    follow_up_count: "0",
    patient_satisfaction: "",
  });

  useEffect(() => {
    if (!userId) return;
    loadOutcomes();
  }, [userId]);

  const loadOutcomes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("treatment_outcomes")
      .select("*")
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const o = data as Outcome[];
      setOutcomes(o);
      calculateStats(o);
    }
    setLoading(false);
  };

  const calculateStats = (o: Outcome[]) => {
    if (o.length === 0) {
      setStats({ total: 0, resolved: 0, improved: 0, avgImprovement: 0, avgSatisfaction: 0 });
      return;
    }
    const resolved = o.filter((x) => x.outcome_status === "resolved").length;
    const improved = o.filter((x) => x.outcome_status === "improved").length;
    const withImprovement = o.filter((x) => x.improvement_percentage !== null);
    const withSatisfaction = o.filter((x) => x.patient_satisfaction !== null);

    setStats({
      total: o.length,
      resolved,
      improved,
      avgImprovement: withImprovement.length
        ? Math.round(withImprovement.reduce((s, x) => s + (x.improvement_percentage ?? 0), 0) / withImprovement.length)
        : 0,
      avgSatisfaction: withSatisfaction.length
        ? Math.round((withSatisfaction.reduce((s, x) => s + (x.patient_satisfaction ?? 0), 0) / withSatisfaction.length) * 10) / 10
        : 0,
    });
  };

  const handleSave = async () => {
    if (!form.condition_treated || !form.treatment_start_date) {
      toast.error("Condition and start date are required");
      return;
    }
    setSaving(true);

    const baseline = form.baseline_severity ? parseInt(form.baseline_severity) : null;
    const final = form.final_severity ? parseInt(form.final_severity) : null;
    let improvement: number | null = null;
    if (baseline && final !== null) {
      improvement = Math.round(((baseline - final) / baseline) * 100);
    }

    const startDate = new Date(form.treatment_start_date);
    const endDate = form.treatment_end_date ? new Date(form.treatment_end_date) : null;
    const durationDays = endDate ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

    const payload = {
      doctor_id: userId,
      condition_treated: form.condition_treated,
      diagnosis_details: form.diagnosis_details || null,
      treatment_start_date: form.treatment_start_date,
      treatment_end_date: form.treatment_end_date || null,
      duration_days: durationDays,
      baseline_severity: baseline,
      final_severity: final,
      outcome_status: form.outcome_status,
      improvement_percentage: improvement,
      patient_satisfaction: form.patient_satisfaction ? parseInt(form.patient_satisfaction) : null,
      side_effects: form.side_effects || null,
      notes: form.notes || null,
      medicines_used: form.medicines_used ? form.medicines_used.split(",").map((m) => m.trim()) : [],
      therapies_used: form.therapies_used ? form.therapies_used.split(",").map((t) => t.trim()) : [],
      follow_up_count: parseInt(form.follow_up_count) || 0,
    };

    const { error } = await supabase.from("treatment_outcomes").insert(payload);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Treatment outcome recorded successfully");
      setShowForm(false);
      setForm({ condition_treated: "", diagnosis_details: "", treatment_start_date: "", treatment_end_date: "", baseline_severity: "", final_severity: "", outcome_status: "ongoing", side_effects: "", notes: "", medicines_used: "", therapies_used: "", follow_up_count: "0", patient_satisfaction: "" });
      loadOutcomes();
    }
    setSaving(false);
  };

  const getStatusConfig = (status: string) => OUTCOME_STATUS.find((s) => s.value === status) ?? OUTCOME_STATUS[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Treatment Outcomes</h1>
          <p className="text-muted-foreground">Track evidence-based results of your treatments to build credibility and improve protocols.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Record Outcome
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Cases</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-emerald-600">{stats.improved}</p>
            <p className="text-xs text-muted-foreground">Improved</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-primary">{stats.avgImprovement}%</p>
            <p className="text-xs text-muted-foreground">Avg. Improvement</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-amber-600">{stats.avgSatisfaction}/5</p>
            <p className="text-xs text-muted-foreground">Satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Outcomes List */}
      {outcomes.length === 0 ? (
        <Card className="py-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No outcomes recorded yet. Start tracking to build your evidence-based profile.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {outcomes.map((outcome) => {
            const statusConfig = getStatusConfig(outcome.outcome_status);
            return (
              <Card key={outcome.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{outcome.condition_treated}</h3>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </div>
                      {outcome.diagnosis_details && (
                        <p className="text-xs text-muted-foreground mt-1">{outcome.diagnosis_details}</p>
                      )}
                    </div>
                    {outcome.improvement_percentage !== null && (
                      <div className={`flex items-center gap-1 text-sm font-bold ${outcome.improvement_percentage > 0 ? "text-green-600" : outcome.improvement_percentage < 0 ? "text-red-600" : "text-gray-500"}`}>
                        {outcome.improvement_percentage > 0 ? <ArrowUp className="h-4 w-4" /> : outcome.improvement_percentage < 0 ? <ArrowDown className="h-4 w-4" /> : null}
                        {Math.abs(outcome.improvement_percentage)}%
                      </div>
                    )}
                  </div>

                  {/* Severity Progress */}
                  {outcome.baseline_severity && (
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Baseline: {outcome.baseline_severity}/10</span>
                          <span>Final: {outcome.final_severity ?? "—"}/10</span>
                        </div>
                        <div className="flex gap-1">
                          <Progress value={(outcome.baseline_severity / 10) * 100} className="h-2 flex-1 [&>div]:bg-red-400" />
                          {outcome.final_severity !== null && (
                            <Progress value={(outcome.final_severity / 10) * 100} className="h-2 flex-1 [&>div]:bg-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(outcome.treatment_start_date).toLocaleDateString("en-IN")}
                      {outcome.treatment_end_date && ` – ${new Date(outcome.treatment_end_date).toLocaleDateString("en-IN")}`}
                    </span>
                    {outcome.duration_days && <span>{outcome.duration_days} days</span>}
                    {outcome.follow_up_count > 0 && <span>{outcome.follow_up_count} follow-ups</span>}
                    {outcome.patient_satisfaction && <span>★ {outcome.patient_satisfaction}/5</span>}
                  </div>

                  {/* Medicines & Therapies */}
                  {(outcome.medicines_used.length > 0 || outcome.therapies_used.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {outcome.medicines_used.map((m, i) => (
                        <Badge key={`m-${i}`} variant="outline" className="text-[10px]">
                          <Pill className="mr-0.5 h-2.5 w-2.5" />{m}
                        </Badge>
                      ))}
                      {outcome.therapies_used.map((t, i) => (
                        <Badge key={`t-${i}`} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Record Outcome Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Treatment Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Condition Treated *</Label>
                <Input
                  value={form.condition_treated}
                  onChange={(e) => setForm({ ...form, condition_treated: e.target.value })}
                  placeholder="e.g., Chronic Low Back Pain (Katishoola)"
                />
              </div>
              <div className="space-y-2">
                <Label>Outcome Status</Label>
                <Select value={form.outcome_status} onValueChange={(v) => setForm({ ...form, outcome_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OUTCOME_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Diagnosis Details</Label>
              <Textarea
                value={form.diagnosis_details}
                onChange={(e) => setForm({ ...form, diagnosis_details: e.target.value })}
                placeholder="e.g., Vataja Katishoola with Degenerative Disc Disease at L4-L5"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Treatment Start Date *</Label>
                <Input type="date" value={form.treatment_start_date} onChange={(e) => setForm({ ...form, treatment_start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Treatment End Date</Label>
                <Input type="date" value={form.treatment_end_date} onChange={(e) => setForm({ ...form, treatment_end_date: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Baseline Severity (1-10)</Label>
                <Input type="number" min="1" max="10" value={form.baseline_severity} onChange={(e) => setForm({ ...form, baseline_severity: e.target.value })} placeholder="8" />
              </div>
              <div className="space-y-2">
                <Label>Final Severity (0-10)</Label>
                <Input type="number" min="0" max="10" value={form.final_severity} onChange={(e) => setForm({ ...form, final_severity: e.target.value })} placeholder="2" />
              </div>
              <div className="space-y-2">
                <Label>Patient Satisfaction (1-5)</Label>
                <Input type="number" min="1" max="5" value={form.patient_satisfaction} onChange={(e) => setForm({ ...form, patient_satisfaction: e.target.value })} placeholder="4" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Medicines Used (comma separated)</Label>
                <Input
                  value={form.medicines_used}
                  onChange={(e) => setForm({ ...form, medicines_used: e.target.value })}
                  placeholder="Yogaraja Guggulu, Rasnasaptak Kashaya"
                />
              </div>
              <div className="space-y-2">
                <Label>Therapies Used (comma separated)</Label>
                <Input
                  value={form.therapies_used}
                  onChange={(e) => setForm({ ...form, therapies_used: e.target.value })}
                  placeholder="Kati Basti, Abhyanga, Nadi Sweda"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Follow-up Count</Label>
                <Input type="number" min="0" value={form.follow_up_count} onChange={(e) => setForm({ ...form, follow_up_count: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Side Effects (if any)</Label>
                <Input value={form.side_effects} onChange={(e) => setForm({ ...form, side_effects: e.target.value })} placeholder="None / Mild headache on Day 2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional observations, lifestyle changes followed, maintenance therapy..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Target className="mr-1 h-4 w-4" />}
                Save Outcome
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentOutcomes;
