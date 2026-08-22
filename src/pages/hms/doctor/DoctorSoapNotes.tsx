import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Brain, Save, Copy, Mic, Loader2, CheckCircle, Clock } from "lucide-react";

type ClinicalNote = {
  id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  note_type: string;
  is_signed: boolean;
  signed_at: string | null;
  created_at: string;
};

type RecentVisit = {
  id: string;
  patient_display_id: string;
  visit_date: string;
  patient_name: string;
  chief_complaint: string | null;
  status: string;
};

const DoctorSoapNotes = () => {
  const [searchParams] = useSearchParams();
  const visitIdParam = searchParams.get("visitId");

  const [ayurvedaMode, setAyurvedaMode] = useState(false);
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Patient/visit selection
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(visitIdParam);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);

  // Load today's visits for selection
  useEffect(() => {
    const fetchVisits = async () => {
      setLoadingVisits(true);
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await (supabase as any)
        .from("hms_op_visits")
        .select("id, patient_display_id, visit_date, doctor_name, chief_complaint, status")
        .eq("visit_date", today)
        .in("status", ["checked_in", "in_consultation", "completed"])
        .order("session_token", { ascending: true })
        .limit(30);

      if (data) {
        // Fetch patient names for each visit
        const patientIds = data.map((v: any) => v.patient_display_id);
        const { data: patients } = await (supabase as any)
          .from("hms_op_patients")
          .select("patient_id, first_name, last_name")
          .in("patient_id", patientIds);

        const patientMap = new Map(
          (patients || []).map((p: any) => [p.patient_id, `${p.first_name} ${p.last_name || ""}`.trim()])
        );

        setRecentVisits(
          data.map((v: any) => ({
            ...v,
            patient_name: patientMap.get(v.patient_display_id) || v.patient_display_id,
          }))
        );
      }
      setLoadingVisits(false);
    };
    fetchVisits();
  }, []);

  // Load existing note when visit is selected
  useEffect(() => {
    if (!selectedVisitId) return;
    const loadNote = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("hms_clinical_notes")
        .select("*")
        .eq("visit_id", selectedVisitId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSubjective(data.subjective || "");
        setObjective(data.objective || "");
        setAssessment(data.assessment || "");
        setPlan(data.plan || "");
        setCurrentNoteId(data.id);
        setIsSigned(data.is_signed || false);
        setAyurvedaMode(data.note_type === "ayurveda");
        setLastSaved(data.updated_at);
      } else {
        setSubjective("");
        setObjective("");
        setAssessment("");
        setPlan("");
        setCurrentNoteId(null);
        setIsSigned(false);
        setLastSaved(null);
      }
      setLoading(false);
    };
    loadNote();
  }, [selectedVisitId]);

  // Save notes
  const saveNotes = async () => {
    if (!selectedVisitId) return toast.error("Select a patient visit first");
    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      return toast.error("Write at least one section before saving");
    }

    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    // Get patient_id from visit
    const { data: visit } = await (supabase as any)
      .from("hms_op_visits")
      .select("patient_id")
      .eq("id", selectedVisitId)
      .single();

    const noteData = {
      visit_id: selectedVisitId,
      patient_id: visit?.patient_id,
      doctor_user_id: uid,
      note_type: ayurvedaMode ? "ayurveda" : "soap",
      subjective: subjective.trim() || null,
      objective: objective.trim() || null,
      assessment: assessment.trim() || null,
      plan: plan.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (currentNoteId) {
      // Update existing
      const res = await (supabase as any)
        .from("hms_clinical_notes")
        .update(noteData)
        .eq("id", currentNoteId);
      error = res.error;
    } else {
      // Insert new
      const res = await (supabase as any)
        .from("hms_clinical_notes")
        .insert(noteData)
        .select("id")
        .single();
      error = res.error;
      if (res.data) setCurrentNoteId(res.data.id);
    }

    setSaving(false);
    if (error) return toast.error(error.message);
    setLastSaved(new Date().toISOString());
    toast.success("Clinical notes saved to patient record");
  };

  // Sign & lock notes
  const signNotes = async () => {
    if (!currentNoteId) return toast.error("Save notes before signing");
    setSigning(true);

    const { error } = await (supabase as any)
      .from("hms_clinical_notes")
      .update({ is_signed: true, signed_at: new Date().toISOString() })
      .eq("id", currentNoteId);

    setSigning(false);
    if (error) return toast.error(error.message);
    setIsSigned(true);
    toast.success("Notes signed and locked — now part of the permanent medical record");
  };

  const labels = ayurvedaMode
    ? { s: "Vedana (Patient Complaints)", o: "Pareeksha (Examination)", a: "Nidana (Diagnosis/Assessment)", p: "Chikitsa (Treatment Plan)" }
    : { s: "Subjective", o: "Objective", a: "Assessment", p: "Plan" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> SOAP Notes
          </h1>
          <p className="text-muted-foreground mt-1">Structured clinical documentation — persisted to patient record</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ayurveda</span>
            <Switch checked={ayurvedaMode} onCheckedChange={setAyurvedaMode} disabled={isSigned} />
          </div>
        </div>
      </div>

      {/* Visit selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Patient Visit:</span>
            {loadingVisits ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Select value={selectedVisitId || ""} onValueChange={setSelectedVisitId}>
                <SelectTrigger className="w-[400px]">
                  <SelectValue placeholder="Select today's patient visit..." />
                </SelectTrigger>
                <SelectContent>
                  {recentVisits.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{v.patient_display_id}</Badge>
                        {v.patient_name}
                        {v.chief_complaint && <span className="text-muted-foreground">— {v.chief_complaint.slice(0, 40)}</span>}
                      </span>
                    </SelectItem>
                  ))}
                  {recentVisits.length === 0 && (
                    <SelectItem value="none" disabled>No visits today — register a patient first</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
            {isSigned && <Badge className="bg-green-600">Signed & Locked</Badge>}
          </div>
        </CardContent>
      </Card>

      {ayurvedaMode && (
        <Badge variant="outline" className="text-green-600 border-green-300">
          Ayurveda SOAP: Vedana → Pareeksha → Nidana → Chikitsa
        </Badge>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2 bg-blue-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs grid place-items-center font-bold">S</span>
                  {labels.s}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <Textarea
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  rows={5}
                  className="text-sm"
                  placeholder="Patient's reported symptoms, complaints, and history..."
                  disabled={isSigned}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-green-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-600 text-white text-xs grid place-items-center font-bold">O</span>
                  {labels.o}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <Textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={5}
                  className="text-sm"
                  placeholder="Examination findings, vitals, test results..."
                  disabled={isSigned}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-amber-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-600 text-white text-xs grid place-items-center font-bold">A</span>
                  {labels.a}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <Textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  rows={5}
                  className="text-sm"
                  placeholder="Diagnosis, differential diagnoses, clinical impression..."
                  disabled={isSigned}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-purple-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs grid place-items-center font-bold">P</span>
                  {labels.p}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <Textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  rows={5}
                  className="text-sm"
                  placeholder="Treatment plan, medications, follow-up schedule..."
                  disabled={isSigned}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveNotes} disabled={saving || isSigned || !selectedVisitId}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              {saving ? "Saving..." : "Save Notes"}
            </Button>
            <Button variant="outline" onClick={signNotes} disabled={signing || isSigned || !currentNoteId}>
              {signing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Sign & Lock
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`S: ${subjective}\nO: ${objective}\nA: ${assessment}\nP: ${plan}`);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorSoapNotes;
