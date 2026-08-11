/**
 * Therapist Progress Tracker — Multi-session treatment course view
 * Symptom scores chart, dosha rebalancing tracker, before/after photos.
 */

import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Activity,
  Camera,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  TrendingUp,
  Pause,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TherapistContext } from "./TherapistLayout";
import { maskPatientName, patientCode, DOCTOR_INSTRUCTION_NOTICE } from "@/utils/therapistPrivacy";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

interface Course {
  id: string;
  patient_name: string;
  patient_phone: string | null;
  therapy_type: string;
  total_sessions: number;
  completed_sessions: number;
  start_date: string;
  expected_end_date: string | null;
  status: string;
  dosha_baseline: { vata: number; pitta: number; kapha: number };
  prescribing_doctor_id: string | null;
  doctor_approved: boolean;
  before_photo_url: string | null;
  after_photo_url: string | null;
  photo_consent: boolean;
  created_at: string;
}

interface ProgressEntry {
  id: string;
  course_id: string;
  session_number: number;
  session_date: string;
  pain_score: number | null;
  mobility_score: number | null;
  energy_score: number | null;
  sleep_score: number | null;
  digestion_score: number | null;
  dosha_current: { vata: number; pitta: number; kapha: number };
  therapist_observation: string | null;
  patient_feedback: string | null;
}

const THERAPY_TYPES = [
  "Abhyanga", "Shirodhara", "Basti", "Nasya", "Vamana", "Virechana",
  "Swedana", "Udvartana", "Pizhichil", "Njavarakizhi", "Elakizhi", "Other",
];

const SCORE_LABELS = [
  { key: "pain_score", label: "Pain", color: "text-red-600", bg: "bg-red-500" },
  { key: "mobility_score", label: "Mobility", color: "text-blue-600", bg: "bg-blue-500" },
  { key: "energy_score", label: "Energy", color: "text-amber-600", bg: "bg-amber-500" },
  { key: "sleep_score", label: "Sleep", color: "text-indigo-600", bg: "bg-indigo-500" },
  { key: "digestion_score", label: "Digestion", color: "text-green-600", bg: "bg-green-500" },
];

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════

const TherapistProgressTracker = () => {
  const { therapist } = useOutletContext<TherapistContext>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [entries, setEntries] = useState<Record<string, ProgressEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Course form
  const [courseForm, setCourseForm] = useState({
    patient_name: "", patient_phone: "", therapy_type: "Abhyanga",
    total_sessions: "7", start_date: new Date().toISOString().slice(0, 10),
    expected_end_date: "", dosha_vata: 5, dosha_pitta: 5, dosha_kapha: 5,
    before_photo_url: "", photo_consent: false,
  });

  // Entry form
  const [entryForm, setEntryForm] = useState({
    pain_score: 5, mobility_score: 5, energy_score: 5, sleep_score: 5, digestion_score: 5,
    dosha_vata: 5, dosha_pitta: 5, dosha_kapha: 5,
    therapist_observation: "", patient_feedback: "",
  });

  useEffect(() => { loadData(); }, [therapist.id]);

  const loadData = async () => {
    const { data: coursesData } = await (supabase as any)
      .from("therapist_treatment_courses")
      .select("*")
      .eq("therapist_id", therapist.id)
      .order("created_at", { ascending: false });

    const coursesList = (coursesData || []) as Course[];
    setCourses(coursesList);

    // Load entries for all courses
    if (coursesList.length > 0) {
      const ids = coursesList.map(c => c.id);
      const { data: entriesData } = await (supabase as any)
        .from("therapist_progress_entries")
        .select("*")
        .in("course_id", ids)
        .order("session_number", { ascending: true });

      const grouped: Record<string, ProgressEntry[]> = {};
      (entriesData || []).forEach((e: ProgressEntry) => {
        if (!grouped[e.course_id]) grouped[e.course_id] = [];
        grouped[e.course_id].push(e);
      });
      setEntries(grouped);
    }
    setLoading(false);
  };

  const createCourse = async () => {
    if (!courseForm.patient_name.trim()) { toast.error("Patient name required"); return; }
    const { data, error } = await (supabase as any)
      .from("therapist_treatment_courses")
      .insert({
        therapist_id: therapist.id,
        patient_name: courseForm.patient_name.trim(),
        patient_phone: courseForm.patient_phone || null,
        therapy_type: courseForm.therapy_type,
        total_sessions: parseInt(courseForm.total_sessions) || 7,
        start_date: courseForm.start_date,
        expected_end_date: courseForm.expected_end_date || null,
        dosha_baseline: { vata: courseForm.dosha_vata, pitta: courseForm.dosha_pitta, kapha: courseForm.dosha_kapha },
        before_photo_url: courseForm.before_photo_url || null,
        photo_consent: courseForm.photo_consent,
      })
      .select().single();

    if (error) { toast.error("Failed to create course"); return; }
    setCourses(prev => [data, ...prev]);
    setCourseDialogOpen(false);
    setCourseForm({ patient_name: "", patient_phone: "", therapy_type: "Abhyanga", total_sessions: "7", start_date: new Date().toISOString().slice(0, 10), expected_end_date: "", dosha_vata: 5, dosha_pitta: 5, dosha_kapha: 5, before_photo_url: "", photo_consent: false });
    toast.success("Treatment course created!");
  };

  const openEntryDialog = (course: Course) => {
    setSelectedCourse(course);
    const baseline = course.dosha_baseline || { vata: 5, pitta: 5, kapha: 5 };
    setEntryForm({ pain_score: 5, mobility_score: 5, energy_score: 5, sleep_score: 5, digestion_score: 5, dosha_vata: baseline.vata, dosha_pitta: baseline.pitta, dosha_kapha: baseline.kapha, therapist_observation: "", patient_feedback: "" });
    setEntryDialogOpen(true);
  };

  const addEntry = async () => {
    if (!selectedCourse) return;
    const courseEntries = entries[selectedCourse.id] || [];
    const nextSession = courseEntries.length + 1;

    const { data, error } = await (supabase as any)
      .from("therapist_progress_entries")
      .insert({
        course_id: selectedCourse.id,
        session_number: nextSession,
        session_date: new Date().toISOString().slice(0, 10),
        pain_score: entryForm.pain_score,
        mobility_score: entryForm.mobility_score,
        energy_score: entryForm.energy_score,
        sleep_score: entryForm.sleep_score,
        digestion_score: entryForm.digestion_score,
        dosha_current: { vata: entryForm.dosha_vata, pitta: entryForm.dosha_pitta, kapha: entryForm.dosha_kapha },
        therapist_observation: entryForm.therapist_observation || null,
        patient_feedback: entryForm.patient_feedback || null,
      })
      .select().single();

    if (error) { toast.error("Failed to log progress"); return; }

    // Update course completed_sessions
    await (supabase as any)
      .from("therapist_treatment_courses")
      .update({ completed_sessions: nextSession, status: nextSession >= selectedCourse.total_sessions ? "completed" : "active" })
      .eq("id", selectedCourse.id);

    setEntries(prev => ({ ...prev, [selectedCourse.id]: [...(prev[selectedCourse.id] || []), data] }));
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, completed_sessions: nextSession, status: nextSession >= c.total_sessions ? "completed" : "active" } : c));
    setEntryDialogOpen(false);
    toast.success(`Session ${nextSession} logged!`);
  };

  if (loading) return <div className="grid min-h-[400px] place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" /> Treatment Progress
          </h1>
          <p className="text-sm text-muted-foreground">Track multi-session Panchakarma courses and patient outcomes.</p>
        </div>
        <Button onClick={() => setCourseDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Course
        </Button>
      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No treatment courses yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start tracking a patient's multi-session therapy course.</p>
          </CardContent>
        </Card>
      ) : courses.map(course => {
        const courseEntries = entries[course.id] || [];
        const pct = Math.round((course.completed_sessions / course.total_sessions) * 100);
        const statusColor = course.status === "completed" ? "bg-green-500" : course.status === "paused" ? "bg-amber-500" : "bg-blue-500";

        return (
          <Collapsible key={course.id}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{maskPatientName(course.patient_name)}</h3>
                      <Badge variant="outline" className="text-[10px]">{course.therapy_type}</Badge>
                      <Badge className={`${statusColor} text-white text-[10px]`}>{course.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Day {course.completed_sessions}/{course.total_sessions} · Started {course.start_date}
                    </p>
                    <Progress value={pct} className="mt-2 h-2" />
                    <p className="text-[11px] text-muted-foreground mt-1">{pct}% complete</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {course.status === "active" && (
                      <Button size="sm" onClick={() => openEntryDialog(course)}>
                        <Plus className="mr-1 h-3 w-3" /> Log Session
                      </Button>
                    )}
                    <CollapsibleTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><ChevronDown className="h-4 w-4" /></Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                {/* Dosha Baseline Mini */}
                <div className="flex gap-3 mt-3">
                  <Badge variant="secondary" className="text-[10px]">V: {course.dosha_baseline?.vata || 5}</Badge>
                  <Badge variant="secondary" className="text-[10px]">P: {course.dosha_baseline?.pitta || 5}</Badge>
                  <Badge variant="secondary" className="text-[10px]">K: {course.dosha_baseline?.kapha || 5}</Badge>
                  {course.before_photo_url && <Badge variant="secondary" className="text-[10px]"><Camera className="mr-1 h-2.5 w-2.5" /> Before photo</Badge>}
                </div>
              </CardContent>

              <CollapsibleContent>
                <div className="border-t px-5 py-4 space-y-4">
                  {/* Progress Chart (simple bar visualization) */}
                  {courseEntries.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Symptom Scores Across Sessions</p>
                      <div className="overflow-x-auto">
                        <div className="flex gap-1 min-w-[300px]">
                          {courseEntries.map(entry => (
                            <div key={entry.id} className="flex-1 min-w-[40px] space-y-1">
                              <p className="text-[9px] text-center text-muted-foreground">S{entry.session_number}</p>
                              {SCORE_LABELS.map(s => {
                                const val = (entry as any)[s.key] as number | null;
                                return val !== null ? (
                                  <div key={s.key} className="relative h-3 bg-muted rounded-full overflow-hidden" title={`${s.label}: ${val}/10`}>
                                    <div className={`absolute inset-y-0 left-0 ${s.bg} rounded-full`} style={{ width: `${val * 10}%` }} />
                                  </div>
                                ) : null;
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          {SCORE_LABELS.map(s => (
                            <span key={s.key} className={`text-[10px] ${s.color} flex items-center gap-1`}>
                              <span className={`h-2 w-2 rounded-full ${s.bg}`} />{s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dosha Rebalancing Tracker */}
                  {courseEntries.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Dosha Rebalancing</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["vata", "pitta", "kapha"].map(dosha => {
                          const baseline = (course.dosha_baseline as any)?.[dosha] || 5;
                          const current = courseEntries.length > 0 ? (courseEntries[courseEntries.length - 1].dosha_current as any)?.[dosha] || 5 : baseline;
                          const diff = current - baseline;
                          return (
                            <div key={dosha} className="text-center p-2 rounded-lg bg-muted/40">
                              <p className="text-[10px] text-muted-foreground capitalize">{dosha}</p>
                              <p className="text-sm font-bold">{current}/10</p>
                              <p className={`text-[10px] ${diff > 0 ? "text-red-500" : diff < 0 ? "text-green-500" : "text-muted-foreground"}`}>
                                {diff > 0 ? `+${diff}` : diff < 0 ? diff : "—"} from baseline
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Session Entries List */}
                  {courseEntries.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Session Log</p>
                      {courseEntries.map(entry => (
                        <div key={entry.id} className="border rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px]">Session {entry.session_number} · {entry.session_date}</Badge>
                          </div>
                          {entry.therapist_observation && <p className="text-xs text-muted-foreground mt-1">{entry.therapist_observation}</p>}
                          {entry.patient_feedback && <p className="text-xs text-blue-600 mt-1">Patient: "{entry.patient_feedback}"</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Photos */}
                  {(course.before_photo_url || course.after_photo_url) && (
                    <div className="grid grid-cols-2 gap-3">
                      {course.before_photo_url && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">Before</p>
                          <img src={course.before_photo_url} alt="Before" className="rounded-lg h-32 w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                      {course.after_photo_url && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">After</p>
                          <img src={course.after_photo_url} alt="After" className="rounded-lg h-32 w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* New Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Treatment Course</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Patient Name *</Label><Input value={courseForm.patient_name} onChange={e => setCourseForm(f => ({ ...f, patient_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Therapy Type</Label>
                <Select value={courseForm.therapy_type} onValueChange={v => setCourseForm(f => ({ ...f, therapy_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{THERAPY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Total Sessions</Label><Input type="number" value={courseForm.total_sessions} onChange={e => setCourseForm(f => ({ ...f, total_sessions: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={courseForm.start_date} onChange={e => setCourseForm(f => ({ ...f, start_date: e.target.value }))} /></div>
              <div><Label>Expected End</Label><Input type="date" value={courseForm.expected_end_date} onChange={e => setCourseForm(f => ({ ...f, expected_end_date: e.target.value }))} /></div>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium">Dosha Baseline</p>
              <div className="flex items-center gap-3"><span className="text-xs w-12">Vata: {courseForm.dosha_vata}</span><Slider value={[courseForm.dosha_vata]} onValueChange={([v]) => setCourseForm(f => ({ ...f, dosha_vata: v }))} max={10} step={1} className="flex-1" /></div>
              <div className="flex items-center gap-3"><span className="text-xs w-12">Pitta: {courseForm.dosha_pitta}</span><Slider value={[courseForm.dosha_pitta]} onValueChange={([v]) => setCourseForm(f => ({ ...f, dosha_pitta: v }))} max={10} step={1} className="flex-1" /></div>
              <div className="flex items-center gap-3"><span className="text-xs w-12">Kapha: {courseForm.dosha_kapha}</span><Slider value={[courseForm.dosha_kapha]} onValueChange={([v]) => setCourseForm(f => ({ ...f, dosha_kapha: v }))} max={10} step={1} className="flex-1" /></div>
            </div>
            <div><Label>Before Photo URL</Label><Input value={courseForm.before_photo_url} onChange={e => setCourseForm(f => ({ ...f, before_photo_url: e.target.value }))} placeholder="https://..." /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={courseForm.photo_consent} onChange={e => setCourseForm(f => ({ ...f, photo_consent: e.target.checked }))} className="rounded" />
              <Label className="text-xs">Patient has given consent for photos</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
            <Button onClick={createCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Session Entry Dialog */}
      <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Session {selectedCourse ? (entries[selectedCourse.id]?.length || 0) + 1 : ""} — {maskPatientName(selectedCourse?.patient_name || "")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-medium">Symptom Scores (0 = worst, 10 = best)</p>
              {SCORE_LABELS.map(s => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className={`text-xs w-20 ${s.color} font-medium`}>{s.label}: {(entryForm as any)[s.key]}</span>
                  <Slider value={[(entryForm as any)[s.key]]} onValueChange={([v]) => setEntryForm(f => ({ ...f, [s.key]: v }))} max={10} step={1} className="flex-1" />
                </div>
              ))}
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium">Dosha Current State</p>
              <div className="flex items-center gap-3"><span className="text-xs w-12">V: {entryForm.dosha_vata}</span><Slider value={[entryForm.dosha_vata]} onValueChange={([v]) => setEntryForm(f => ({ ...f, dosha_vata: v }))} max={10} step={1} className="flex-1" /></div>
              <div className="flex items-center gap-3"><span className="text-xs w-12">P: {entryForm.dosha_pitta}</span><Slider value={[entryForm.dosha_pitta]} onValueChange={([v]) => setEntryForm(f => ({ ...f, dosha_pitta: v }))} max={10} step={1} className="flex-1" /></div>
              <div className="flex items-center gap-3"><span className="text-xs w-12">K: {entryForm.dosha_kapha}</span><Slider value={[entryForm.dosha_kapha]} onValueChange={([v]) => setEntryForm(f => ({ ...f, dosha_kapha: v }))} max={10} step={1} className="flex-1" /></div>
            </div>
            <div><Label>Therapist Observation</Label><Textarea value={entryForm.therapist_observation} onChange={e => setEntryForm(f => ({ ...f, therapist_observation: e.target.value }))} rows={2} placeholder="How did the patient respond today?" /></div>
            <div><Label>Patient Feedback</Label><Textarea value={entryForm.patient_feedback} onChange={e => setEntryForm(f => ({ ...f, patient_feedback: e.target.value }))} rows={2} placeholder="What did the patient say?" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>Cancel</Button>
            <Button onClick={addEntry}>Log Progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapistProgressTracker;
