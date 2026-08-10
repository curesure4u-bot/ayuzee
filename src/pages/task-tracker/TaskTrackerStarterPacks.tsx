import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Package, Stethoscope, GraduationCap, Heart, Building2, CheckCircle } from "lucide-react";

type StarterPack = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  taskCount: number;
  tasks: { task_name: string; description: string; priority: string; kanban_category: string; importance: string; urgency: string }[];
};

const STARTER_PACKS: StarterPack[] = [
  {
    id: "ayush-clinic", name: "AYUSH Clinic Starter", description: "Complete clinic operations setup — daily, weekly, and monthly recurring workflows for an AYUSH practice",
    icon: Stethoscope, color: "from-teal-500 to-emerald-600", taskCount: 25,
    tasks: [
      { task_name: "Morning staff briefing (5 min)", description: "Quick sync with reception & nursing staff", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Check & print today's appointment list", description: "Review patient schedule, note any special requirements", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Review pending lab results", description: "Check and sign off on diagnostic reports", priority: "Very High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Verify pharmacy stock levels", description: "Check top 20 medicines are in stock", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Follow-up calls to yesterday's patients", description: "Check on patients seen yesterday, note any concerns", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Update patient records from morning consultations", description: "Ensure all prescriptions and notes are digitized", priority: "High", kanban_category: "In Progress", importance: "Important", urgency: "Urgent" },
      { task_name: "Insurance claim submissions", description: "Submit pending claims for processed patients", priority: "High", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "End-of-day billing reconciliation", description: "Verify all consultations are billed correctly", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Weekly inventory audit", description: "Full stock count and reorder check", priority: "Medium", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Monthly CME credit tracking", description: "Log continuing education activities", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Update clinic website / social media", description: "Post health tip or clinic update", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Patient feedback review (weekly)", description: "Review and respond to feedback from the week", priority: "Medium", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Staff performance check-in (monthly)", description: "One-on-one with each staff member", priority: "Medium", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Equipment calibration check", description: "Verify all diagnostic equipment is working", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Referral network outreach", description: "Connect with 1 new referring doctor this month", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Prepare Panchakarma therapy rooms", description: "Check oils, sheets, temperature for sessions", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Review treatment outcomes (monthly)", description: "Analyze patient improvement data", priority: "Medium", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Update SOPs if needed", description: "Review standard operating procedures quarterly", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Plan next month's health camp", description: "Organize free consultation or awareness event", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Emergency medicine kit check", description: "Verify emergency supplies are stocked and not expired", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Back up patient data (weekly)", description: "Ensure all digital records are backed up", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Clean & sanitize therapy rooms", description: "Daily sanitization protocol", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Review Google/Justdial reviews", description: "Respond to new patient reviews online", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Financial review (monthly P&L)", description: "Compare income vs expenses", priority: "Medium", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Plan staff training session (quarterly)", description: "Identify skill gaps and plan training", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
    ],
  },
  {
    id: "student-semester", name: "Student Semester Pack", description: "Complete academic planning — assignments, exams, study blocks, and extracurriculars for one semester",
    icon: GraduationCap, color: "from-purple-500 to-violet-600", taskCount: 22,
    tasks: [
      { task_name: "Review semester syllabus for all subjects", description: "Map out what needs to be covered", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Create weekly study schedule", description: "Allocate time blocks for each subject", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Submit Assignment 1 — Dravyaguna", description: "Herbal pharmacology paper", priority: "Very High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Submit Assignment 2 — Rasashastra", description: "Mineral processing essay", priority: "High", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Daily quiz practice (Ayuzee)", description: "Maintain streak, 10 min daily", priority: "Low", kanban_category: "To-Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Read Charaka Samhita — Sutra Sthana", description: "2 chapters per week target", priority: "Medium", kanban_category: "Studying", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Prepare case study presentation", description: "Choose case, research, make slides", priority: "High", kanban_category: "Studying", importance: "Important", urgency: "Urgent" },
      { task_name: "Attend weekly study group", description: "Thursday 6 PM collaborative session", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Internship journal — daily entry", description: "Document clinical observations", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Prepare for practical viva", description: "Review herbs, formulations, procedures", priority: "Very High", kanban_category: "Studying", importance: "Important", urgency: "Urgent" },
      { task_name: "Revise flashcards — 50 herbs", description: "Spaced repetition daily", priority: "Medium", kanban_category: "Studying", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Research paper literature review", description: "Collect 15 papers for thesis", priority: "Medium", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Attend CME webinar (monthly)", description: "Earn certificate + knowledge", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Mid-semester exam preparation", description: "Start 2 weeks before", priority: "Very High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Final exam preparation", description: "Start 3 weeks before", priority: "Very High", kanban_category: "Backlog", importance: "Important", urgency: "Urgent" },
      { task_name: "Apply for internship extension", description: "If required, submit application", priority: "Medium", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Mentor meeting (bi-weekly)", description: "Discuss progress with assigned mentor", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "College chapter activity", description: "Organize or attend campus AYUSH event", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Physical fitness — yoga 3x/week", description: "Maintain health during exam season", priority: "Low", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Update student profile on Ayuzee", description: "Add new courses, certificates", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Budget review — hostel/food/books", description: "Track expenses monthly", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Semester end: self-assessment", description: "What went well, what to improve", priority: "Medium", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
    ],
  },
  {
    id: "patient-recovery", name: "Patient Recovery Plan", description: "30-day structured recovery plan — medication, exercise, diet, and follow-ups",
    icon: Heart, color: "from-rose-500 to-pink-600", taskCount: 20,
    tasks: [
      { task_name: "Take morning medication (daily)", description: "As prescribed — do not skip", priority: "Very High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Take evening medication (daily)", description: "After dinner, as prescribed", priority: "Very High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Drink 8 glasses warm water", description: "Spread throughout the day", priority: "High", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "30 minutes light walking", description: "Morning or evening, gentle pace", priority: "Medium", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Follow prescribed diet plan", description: "Avoid cold, heavy, processed foods", priority: "High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Track symptoms in diary", description: "Note pain level 1-10, digestion, sleep quality", priority: "Medium", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Self-massage with prescribed oil (daily)", description: "10 min Abhyanga before bath", priority: "Medium", kanban_category: "To Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Breathing exercises — Pranayama", description: "5 min Anulom Vilom + 5 min deep breathing", priority: "Medium", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Sleep by 10 PM (daily)", description: "7-8 hours minimum", priority: "High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Week 1 follow-up appointment", description: "Report progress to doctor", priority: "High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Week 2 follow-up appointment", description: "Mid-treatment check", priority: "High", kanban_category: "Backlog", importance: "Important", urgency: "Urgent" },
      { task_name: "Week 4 final follow-up", description: "Treatment completion assessment", priority: "High", kanban_category: "Backlog", importance: "Important", urgency: "Urgent" },
      { task_name: "Pick up medicines (refill)", description: "Before current stock runs out", priority: "High", kanban_category: "To Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Avoid screen time before bed", description: "No phone/TV 30 min before sleep", priority: "Low", kanban_category: "To Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Warm water with honey (morning)", description: "First thing after waking", priority: "Low", kanban_category: "To Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Meditation / mindfulness (10 min)", description: "Reduces stress, aids recovery", priority: "Medium", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Weekly weight/BP check", description: "Track at same time each week", priority: "Low", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Grocery: buy fresh fruits & vegetables", description: "Weekly market visit", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Gratitude practice (3 things)", description: "Write 3 things grateful for each day", priority: "Low", kanban_category: "To Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "End-of-plan self-assessment", description: "Rate improvement on all symptoms 1-10", priority: "Medium", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
    ],
  },
  {
    id: "hms-operations", name: "HMS Operations Pack", description: "Hospital operations — daily, weekly, monthly tasks for staff, compliance, and facility management",
    icon: Building2, color: "from-amber-500 to-orange-600", taskCount: 24,
    tasks: [
      { task_name: "Daily opening checklist", description: "Systems, equipment, staff readiness", priority: "Very High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Verify staff attendance", description: "Confirm all scheduled staff reported", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Review today's appointment schedule", description: "Check load, allocate resources", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Pharmacy stock check (critical items)", description: "Top 10 fast-moving medicines", priority: "High", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Patient registration queue management", description: "Ensure <10 min wait time", priority: "Medium", kanban_category: "In Progress", importance: "Important", urgency: "Urgent" },
      { task_name: "Housekeeping inspection", description: "Cleanliness audit of all areas", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Daily billing reconciliation", description: "Match services rendered to bills generated", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "End-of-day cash closing", description: "Count cash, match to system, deposit", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Security check (closing)", description: "All doors locked, alarms set", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Weekly stock audit (full)", description: "Complete inventory count", priority: "Medium", kanban_category: "Review", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Weekly staff meeting", description: "Monday morning — review week ahead", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Patient feedback compilation", description: "Collect and summarize week's feedback", priority: "Medium", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Equipment maintenance log", description: "Record any issues, schedule repairs", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Fire safety equipment check (monthly)", description: "Extinguishers, exits, alarms", priority: "High", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Regulatory compliance check", description: "Licenses, permits, certifications current", priority: "High", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Monthly P&L review", description: "Revenue vs expenses by department", priority: "Medium", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Staff payroll processing", description: "Verify attendance, calculate, process", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Vendor payment processing", description: "Clear pending supplier invoices", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Marketing review — social media", description: "Plan posts for the week", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Patient birthday wishes (weekly batch)", description: "Send WhatsApp/SMS to patients with birthdays", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Doctor schedule coordination", description: "Confirm next week's doctor availability", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Quarterly accreditation prep", description: "Ensure documentation is audit-ready", priority: "Medium", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "IT systems backup (weekly)", description: "Verify all patient data backed up", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Annual staff performance reviews", description: "Schedule and conduct reviews", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
    ],
  },
];

type Props = {
  onApply: (tasks: any[]) => void;
};

const TaskTrackerStarterPacks = ({ onApply }: Props) => {
  const [applied, setApplied] = useState<string[]>([]);

  const applyPack = (pack: StarterPack) => {
    onApply(pack.tasks.map(t => ({
      ...t,
      status: "To do",
      person_in_charge: "",
      start_date: new Date().toISOString().split("T")[0],
      due_date: null,
      progress: 0,
      notes: `From: ${pack.name}`,
      is_completed: false,
      completed_at: null,
      gantt_color: "",
      project_name: "",
      role_context: "general",
    })));
    setApplied(prev => [...prev, pack.id]);
    toast.success(`${pack.tasks.length} tasks added from "${pack.name}"!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-amber-500" /> Starter Packs
        </h1>
        <p className="text-sm text-muted-foreground">Comprehensive task packs (20-25 tasks each) — one click to get started</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STARTER_PACKS.map(pack => {
          const isApplied = applied.includes(pack.id);
          return (
            <Card key={pack.id} className={`overflow-hidden ${isApplied ? "border-green-300 opacity-70" : "hover:shadow-md"}`}>
              <div className={`h-2 bg-gradient-to-r ${pack.color}`} />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${pack.color} text-white`}>
                    <pack.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{pack.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{pack.taskCount} tasks</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{pack.description}</p>
                <div className="max-h-28 overflow-y-auto space-y-0.5">
                  {pack.tasks.slice(0, 8).map((t, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground truncate">• {t.task_name}</p>
                  ))}
                  {pack.tasks.length > 8 && <p className="text-[10px] text-muted-foreground font-medium">...and {pack.tasks.length - 8} more</p>}
                </div>
                <Button
                  className={`w-full ${isApplied ? "bg-green-600" : `bg-gradient-to-r ${pack.color}`} text-white`}
                  disabled={isApplied}
                  onClick={() => applyPack(pack)}
                >
                  {isApplied ? <><CheckCircle className="mr-1 h-4 w-4" /> Applied</> : <><Package className="mr-1 h-4 w-4" /> Apply Pack ({pack.taskCount} tasks)</>}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTrackerStarterPacks;
