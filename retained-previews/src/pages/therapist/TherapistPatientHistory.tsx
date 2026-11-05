import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { maskPatientName, patientCode, DOCTOR_INSTRUCTION_NOTICE, PRIVACY_NOTICE } from "@/utils/therapistPrivacy";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface PatientNote {
  id: string;
  therapist_id: string;
  patient_name: string;
  patient_phone: string;
  allergies: string;
  contraindications: string;
  preferences: any;
  pain_tolerance: string;
  special_notes: string;
  tags: string[];
}

interface PastSession {
  id: string;
  patient_name: string;
  therapy_type: string;
  session_date: string;
  status: string;
  notes: string;
}

export default function TherapistPatientHistory() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [patients, setPatients] = useState<string[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientNote, setPatientNote] = useState<PatientNote | null>(null);
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [therapist.id]);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("therapy_sessions")
      .select("patient_name")
      .eq("therapist_id", therapist.id)
      .eq("status", "completed");

    if (data) {
      const unique = [...new Set(data.map((d: any) => d.patient_name))].filter(Boolean) as string[];
      setPatients(unique);
    }
    setLoading(false);
  };

  const selectPatient = async (name: string) => {
    setSelectedPatient(name);

    // Fetch sessions for this patient
    const { data: sessionData } = await (supabase as any)
      .from("therapy_sessions")
      .select("*")
      .eq("therapist_id", therapist.id)
      .eq("patient_name", name)
      .order("session_date", { ascending: false });

    if (sessionData) setSessions(sessionData);

    // Fetch or create patient note
    const { data: noteData } = await (supabase as any)
      .from("therapist_patient_notes")
      .select("*")
      .eq("therapist_id", therapist.id)
      .eq("patient_name", name)
      .maybeSingle();

    if (noteData) {
      setPatientNote(noteData);
    } else {
      setPatientNote({
        id: "",
        therapist_id: therapist.id,
        patient_name: name,
        patient_phone: "",
        allergies: "",
        contraindications: "",
        preferences: {},
        pain_tolerance: "medium",
        special_notes: "",
        tags: [],
      });
    }
  };

  const saveNote = async () => {
    if (!patientNote) return;
    setSaving(true);

    const payload = {
      therapist_id: therapist.id,
      patient_name: patientNote.patient_name,
      patient_phone: patientNote.patient_phone,
      allergies: patientNote.allergies,
      contraindications: patientNote.contraindications,
      preferences: patientNote.preferences,
      pain_tolerance: patientNote.pain_tolerance,
      special_notes: patientNote.special_notes,
      tags: patientNote.tags,
    };

    let error;
    if (patientNote.id) {
      ({ error } = await (supabase as any).from("therapist_patient_notes").update(payload).eq("id", patientNote.id));
    } else {
      const res = await (supabase as any).from("therapist_patient_notes").insert(payload).select().single();
      error = res.error;
      if (res.data) setPatientNote(res.data);
    }

    if (error) {
      toast.error("Failed to save notes");
    } else {
      toast.success("Patient notes saved");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading patient history...</div>;
  }

  if (selectedPatient && patientNote) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedPatient(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <h1 className="text-2xl font-bold">{maskPatientName(selectedPatient)}</h1>
        </div>

        {/* Patient Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Patient Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Pain Tolerance</Label>
                <Input
                  value={patientNote.pain_tolerance || ""}
                  onChange={(e) => setPatientNote({ ...patientNote, pain_tolerance: e.target.value })}
                  placeholder="low / medium / high"
                />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />Allergies
              </Label>
              <Textarea
                value={patientNote.allergies || ""}
                onChange={(e) => setPatientNote({ ...patientNote, allergies: e.target.value })}
                placeholder="List known allergies..."
              />
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />Contraindications
              </Label>
              <Textarea
                value={patientNote.contraindications || ""}
                onChange={(e) => setPatientNote({ ...patientNote, contraindications: e.target.value })}
                placeholder="Any contraindications..."
              />
            </div>
            <div>
              <Label>Special Notes</Label>
              <Textarea
                value={patientNote.special_notes || ""}
                onChange={(e) => setPatientNote({ ...patientNote, special_notes: e.target.value })}
                placeholder="Preferences, observations..."
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={(patientNote.tags || []).join(", ")}
                onChange={(e) => setPatientNote({ ...patientNote, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                placeholder="e.g. chronic pain, vata, elderly"
              />
            </div>
            <Button onClick={saveNote} disabled={saving}>
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </CardContent>
        </Card>

        {/* Past Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Past Sessions ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground">No past sessions found</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.therapy_type || "General Session"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                      {session.notes && <p className="text-sm mt-1">{session.notes}</p>}
                    </div>
                    <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Users className="w-6 h-6" />Patient History
      </h1>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No patient history found. Complete sessions to see patients here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((name) => (
            <Card key={name} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => selectPatient(name)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{maskPatientName(name)}</p>
                    <p className="text-sm text-muted-foreground">Click to view history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
