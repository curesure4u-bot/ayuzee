import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Training {
  id: string;
  name: string;
  code: string | null;
  category: string;
  description: string | null;
  trainerName: string | null;
  trainerType: string | null;
  durationHours: number;
  scheduledDate: string | null;
  venue: string | null;
  isOnline: boolean;
  isMandatory: boolean;
  isRecurring: boolean;
  recurrenceMonths: number | null;
  hasAssessment: boolean;
  passingScore: number;
  hasCertificate: boolean;
  certificateValidityMonths: number | null;
  applicableRoles: string[];
  status: string;
}

export interface EmployeeTrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  trainingId: string;
  trainingName: string;
  trainingCategory: string;
  status: "assigned" | "in_progress" | "completed" | "failed" | "exempted" | "expired";
  attended: boolean;
  attendanceDate: string | null;
  assessmentScore: number | null;
  passed: boolean | null;
  certificateIssued: boolean;
  certificateExpiry: string | null;
  feedbackRating: number | null;
  completedAt: string | null;
}

export interface TrainingSummary {
  totalPrograms: number;
  mandatoryPrograms: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdue: number;
  certificatesExpiring: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_TRAININGS: Training[] = [
  { id: "t1", name: "Fire Safety & Evacuation", code: "TRN-FIRE", category: "safety", description: "Annual fire safety drill", trainerName: "External - Safety First Co.", trainerType: "external", durationHours: 2, scheduledDate: "2026-09-15", venue: "Main Hospital Hall", isOnline: false, isMandatory: true, isRecurring: true, recurrenceMonths: 12, hasAssessment: true, passingScore: 70, hasCertificate: true, certificateValidityMonths: 12, applicableRoles: [], status: "scheduled" },
  { id: "t2", name: "Infection Control & BMW", code: "TRN-IC", category: "safety", description: "Biomedical waste management", trainerName: "Dr. Kavitha (Internal)", trainerType: "internal", durationHours: 3, scheduledDate: "2026-09-20", venue: "Conference Room", isOnline: false, isMandatory: true, isRecurring: true, recurrenceMonths: 12, hasAssessment: true, passingScore: 80, hasCertificate: true, certificateValidityMonths: 12, applicableRoles: [], status: "scheduled" },
  { id: "t3", name: "Panchakarma SOP Training", code: "TRN-PK", category: "clinical", description: "Standard operating procedures for all PK therapies", trainerName: "Dr. Arun Sharma", trainerType: "internal", durationHours: 8, scheduledDate: "2026-10-01", venue: "PK Block", isOnline: false, isMandatory: true, isRecurring: true, recurrenceMonths: 24, hasAssessment: true, passingScore: 80, hasCertificate: true, certificateValidityMonths: 24, applicableRoles: ["therapist"], status: "scheduled" },
  { id: "t4", name: "CPR & Basic Life Support", code: "TRN-BLS", category: "safety", description: "CPR certification", trainerName: "Red Cross", trainerType: "external", durationHours: 4, scheduledDate: null, venue: null, isOnline: false, isMandatory: true, isRecurring: true, recurrenceMonths: 24, hasAssessment: true, passingScore: 80, hasCertificate: true, certificateValidityMonths: 24, applicableRoles: ["doctor", "nurse", "therapist"], status: "draft" },
  { id: "t5", name: "Communication & Soft Skills", code: "TRN-COMM", category: "soft_skills", description: "Patient communication training", trainerName: "HR Team", trainerType: "internal", durationHours: 3, scheduledDate: "2026-08-30", venue: null, isOnline: true, isMandatory: false, isRecurring: false, recurrenceMonths: null, hasAssessment: false, passingScore: 70, hasCertificate: false, certificateValidityMonths: null, applicableRoles: ["receptionist"], status: "completed" },
  { id: "t6", name: "Data Privacy & DPDP Act", code: "TRN-PRIV", category: "compliance", description: "Patient data privacy compliance", trainerName: "Legal Team", trainerType: "internal", durationHours: 2, scheduledDate: "2026-09-25", venue: null, isOnline: true, isMandatory: true, isRecurring: true, recurrenceMonths: 12, hasAssessment: true, passingScore: 80, hasCertificate: false, certificateValidityMonths: null, applicableRoles: [], status: "scheduled" },
];

const MOCK_RECORDS: EmployeeTrainingRecord[] = [
  { id: "et1", employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", trainingId: "t3", trainingName: "Panchakarma SOP Training", trainingCategory: "clinical", status: "completed", attended: true, attendanceDate: "2024-10-01", assessmentScore: 92, passed: true, certificateIssued: true, certificateExpiry: "2026-10-01", feedbackRating: 5, completedAt: "2024-10-01" },
  { id: "et2", employeeId: "8", employeeName: "Priya Therapist", employeeCode: "EMP-0008", department: "Panchakarma", trainingId: "t3", trainingName: "Panchakarma SOP Training", trainingCategory: "clinical", status: "completed", attended: true, attendanceDate: "2024-10-01", assessmentScore: 85, passed: true, certificateIssued: true, certificateExpiry: "2026-10-01", feedbackRating: 4, completedAt: "2024-10-01" },
  { id: "et3", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", trainingId: "t1", trainingName: "Fire Safety & Evacuation", trainingCategory: "safety", status: "completed", attended: true, attendanceDate: "2025-09-15", assessmentScore: 88, passed: true, certificateIssued: true, certificateExpiry: "2026-09-15", feedbackRating: 4, completedAt: "2025-09-15" },
  { id: "et4", employeeId: "3", employeeName: "Rajesh K", employeeCode: "EMP-0003", department: "Front Office", trainingId: "t5", trainingName: "Communication & Soft Skills", trainingCategory: "soft_skills", status: "completed", attended: true, attendanceDate: "2026-08-30", assessmentScore: null, passed: null, certificateIssued: false, certificateExpiry: null, feedbackRating: 4, completedAt: "2026-08-30" },
  { id: "et5", employeeId: "9", employeeName: "Mohan P", employeeCode: "EMP-0009", department: "Panchakarma", trainingId: "t3", trainingName: "Panchakarma SOP Training", trainingCategory: "clinical", status: "assigned", attended: false, attendanceDate: null, assessmentScore: null, passed: null, certificateIssued: false, certificateExpiry: null, feedbackRating: null, completedAt: null },
  { id: "et6", employeeId: "4", employeeName: "Sunita M", employeeCode: "EMP-0004", department: "IPD", trainingId: "t1", trainingName: "Fire Safety & Evacuation", trainingCategory: "safety", status: "assigned", attended: false, attendanceDate: null, assessmentScore: null, passed: null, certificateIssued: false, certificateExpiry: null, feedbackRating: null, completedAt: null },
  { id: "et7", employeeId: "5", employeeName: "Vikram R", employeeCode: "EMP-0005", department: "Pharmacy", trainingId: "t6", trainingName: "Data Privacy & DPDP Act", trainingCategory: "compliance", status: "assigned", attended: false, attendanceDate: null, assessmentScore: null, passed: null, certificateIssued: false, certificateExpiry: null, feedbackRating: null, completedAt: null },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsTraining = () => {
  const [trainings, setTrainings] = useState<Training[]>(MOCK_TRAININGS);
  const [records, setRecords] = useState<EmployeeTrainingRecord[]>(MOCK_RECORDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Trainings
      const { data: trns, error: tErr } = await (supabase as any)
        .from("hrms_trainings")
        .select("*")
        .eq("is_active", true)
        .order("scheduled_date", { ascending: false, nullsFirst: false });

      if (tErr) { setError(tErr.message); setLoading(false); return; }

      if (trns && trns.length > 0) {
        setTrainings(trns.map((t: any) => ({
          id: t.id, name: t.name, code: t.code, category: t.category,
          description: t.description, trainerName: t.trainer_name,
          trainerType: t.trainer_type, durationHours: Number(t.duration_hours),
          scheduledDate: t.scheduled_date, venue: t.venue,
          isOnline: t.is_online, isMandatory: t.is_mandatory,
          isRecurring: t.is_recurring, recurrenceMonths: t.recurrence_months,
          hasAssessment: t.has_assessment, passingScore: Number(t.passing_score),
          hasCertificate: t.has_certificate,
          certificateValidityMonths: t.certificate_validity_months,
          applicableRoles: t.applicable_roles || [], status: t.status,
        })));
      }

      // 2. Employee training records
      const { data: recs } = await (supabase as any)
        .from("hrms_employee_training")
        .select("*, hms_staff(name, employee_code, department), hrms_trainings(name, category)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (recs && recs.length > 0) {
        setRecords(recs.map((r: any) => ({
          id: r.id, employeeId: r.employee_id,
          employeeName: r.hms_staff?.name || "Unknown",
          employeeCode: r.hms_staff?.employee_code || "",
          department: r.hms_staff?.department || "",
          trainingId: r.training_id,
          trainingName: r.hrms_trainings?.name || "Unknown",
          trainingCategory: r.hrms_trainings?.category || "general",
          status: r.status, attended: r.attended,
          attendanceDate: r.attendance_date,
          assessmentScore: r.assessment_score ? Number(r.assessment_score) : null,
          passed: r.passed, certificateIssued: r.certificate_issued,
          certificateExpiry: r.certificate_expiry,
          feedbackRating: r.feedback_rating, completedAt: r.completed_at,
        })));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Summary
  const summary: TrainingSummary = {
    totalPrograms: trainings.length,
    mandatoryPrograms: trainings.filter((t) => t.isMandatory).length,
    completedAssignments: records.filter((r) => r.status === "completed").length,
    pendingAssignments: records.filter((r) => r.status === "assigned" || r.status === "in_progress").length,
    overdue: records.filter((r) => r.status === "assigned" && r.certificateExpiry && new Date(r.certificateExpiry) < new Date()).length,
    certificatesExpiring: records.filter((r) => {
      if (!r.certificateExpiry) return false;
      const exp = new Date(r.certificateExpiry);
      const inMonth = new Date(); inMonth.setDate(inMonth.getDate() + 30);
      return exp <= inMonth && exp >= new Date();
    }).length,
  };

  const upcomingTrainings = trainings.filter((t) => t.status === "scheduled" && t.scheduledDate && new Date(t.scheduledDate) >= new Date());
  const pendingRecords = records.filter((r) => r.status === "assigned" || r.status === "in_progress");
  const completedRecords = records.filter((r) => r.status === "completed");

  return {
    trainings,
    records,
    summary,
    upcomingTrainings,
    pendingRecords,
    completedRecords,
    loading,
    error,
    refetch: fetchAll,
  };
};
