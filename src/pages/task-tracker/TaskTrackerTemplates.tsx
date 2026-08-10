import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Stethoscope, GraduationCap, Heart, Building2, Sparkles } from "lucide-react";
import type { Priority, Importance, Urgency } from "./types";

type TaskTemplate = {
  task_name: string;
  description: string;
  priority: Priority;
  kanban_category: string;
  importance: Importance;
  urgency: Urgency;
};

type TemplateSet = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  role: string;
  tasks: TaskTemplate[];
};

const TEMPLATE_SETS: TemplateSet[] = [
  {
    id: "doctor-clinic",
    name: "Doctor — Clinic Operations",
    description: "Essential recurring tasks for running a clinic",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-700",
    role: "doctor",
    tasks: [
      { task_name: "Morning staff briefing", description: "Quick 5-min sync with reception & nursing staff", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Review pending lab results", description: "Check and sign off on any pending diagnostic reports", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Update patient follow-up list", description: "Review patients due for follow-up this week", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Prescription refill approvals", description: "Approve pending medication refill requests", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Clinic inventory check", description: "Verify stock levels of common medicines and supplies", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "CME credit tracking", description: "Log any continuing medical education activities", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Insurance claim submissions", description: "Submit pending insurance claims for processed patients", priority: "High", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "End-of-day billing reconciliation", description: "Verify all consultations are billed correctly", priority: "Medium", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
    ],
  },
  {
    id: "patient-health",
    name: "Patient — Health Management",
    description: "Daily health routines and appointment tracking",
    icon: Heart,
    color: "bg-rose-100 text-rose-700",
    role: "patient",
    tasks: [
      { task_name: "Take morning medications", description: "As prescribed by your doctor", priority: "Very High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Drink 8 glasses of water", description: "Stay hydrated throughout the day", priority: "High", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "30 minutes of light exercise", description: "Walking, yoga, or stretching as recommended", priority: "Medium", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Follow prescribed diet plan", description: "Stick to the pathya (diet) guidelines", priority: "High", kanban_category: "To Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Track symptoms in diary", description: "Note any changes in condition or side effects", priority: "Medium", kanban_category: "To Do", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Schedule next appointment", description: "Book follow-up visit as recommended", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Pick up prescribed medicines", description: "Refill from pharmacy before running out", priority: "High", kanban_category: "To Do", importance: "Not Important", urgency: "Urgent" },
    ],
  },
  {
    id: "student-academic",
    name: "Student — Academic Planner",
    description: "Study planning, assignments, and exam prep",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-700",
    role: "student",
    tasks: [
      { task_name: "Review today's lecture notes", description: "Summarize key concepts from today's classes", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Complete assignment submission", description: "Finish and submit pending assignments before deadline", priority: "Very High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Practice clinical case studies", description: "Work through 2-3 case scenarios for exam prep", priority: "Medium", kanban_category: "Studying", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Study group session", description: "Collaborative study with peers on difficult topics", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Read reference textbook chapter", description: "Complete one chapter of prescribed reading", priority: "Low", kanban_category: "Backlog", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Prepare internship journal entry", description: "Document today's clinical observations and learnings", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Revise flashcards (Ayurveda herbs)", description: "Spaced repetition review of drug formulations", priority: "Medium", kanban_category: "Studying", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Attempt daily quiz on Ayuzee", description: "Maintain streak and earn coins", priority: "Low", kanban_category: "To-Do", importance: "Not Important", urgency: "Not Urgent" },
    ],
  },
  {
    id: "hms-operations",
    name: "HMS — Hospital Operations",
    description: "Staff coordination, compliance, and facilities",
    icon: Building2,
    color: "bg-emerald-100 text-emerald-700",
    role: "hms",
    tasks: [
      { task_name: "Daily opening checklist", description: "Verify all systems, equipment, and staff readiness", priority: "Very High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Review appointment schedule", description: "Check today's patient load and allocate resources", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Stock level verification", description: "Check pharmacy and consumable stock levels", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Staff attendance verification", description: "Confirm all scheduled staff have reported", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "Equipment maintenance log", description: "Record any maintenance issues reported today", priority: "Low", kanban_category: "Backlog", importance: "Not Important", urgency: "Not Urgent" },
      { task_name: "Patient feedback review", description: "Review and respond to patient feedback from yesterday", priority: "Medium", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
      { task_name: "Billing reconciliation", description: "Cross-check today's billing with services rendered", priority: "High", kanban_category: "To-Do", importance: "Important", urgency: "Urgent" },
      { task_name: "End-of-day security check", description: "Verify all areas secured, systems backed up", priority: "Medium", kanban_category: "To-Do", importance: "Not Important", urgency: "Urgent" },
      { task_name: "Weekly compliance audit", description: "Check regulatory compliance documentation", priority: "High", kanban_category: "Review", importance: "Important", urgency: "Not Urgent" },
    ],
  },
];

type Props = {
  onApplyTemplate: (tasks: TaskTemplate[]) => void;
};

const TaskTrackerTemplates = ({ onApplyTemplate }: Props) => {
  const [appliedSets, setAppliedSets] = useState<string[]>([]);

  const applyTemplate = (templateSet: TemplateSet) => {
    onApplyTemplate(templateSet.tasks);
    setAppliedSets(prev => [...prev, templateSet.id]);
    toast.success(`${templateSet.tasks.length} tasks added from "${templateSet.name}"`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" /> Task Templates
        </h1>
        <p className="text-sm text-muted-foreground">Pre-built task sets for your role — apply with one click</p>
      </div>

      {/* Template Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATE_SETS.map(set => {
          const isApplied = appliedSets.includes(set.id);
          return (
            <Card key={set.id} className={`transition-all ${isApplied ? "border-green-300 bg-green-50/30" : "hover:shadow-md"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${set.color}`}>
                      <set.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{set.name}</CardTitle>
                      <p className="text-[11px] text-muted-foreground">{set.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{set.tasks.length} tasks</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Preview tasks */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {set.tasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] py-0.5 border-b border-dashed last:border-0">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="font-medium truncate flex-1">{t.task_name}</span>
                      <Badge variant="outline" className="text-[9px] shrink-0">{t.priority}</Badge>
                    </div>
                  ))}
                </div>
                {/* Apply button */}
                <Button
                  className={`w-full ${isApplied ? "bg-green-600" : "bg-teal-600 hover:bg-teal-700"}`}
                  size="sm"
                  onClick={() => applyTemplate(set)}
                  disabled={isApplied}
                >
                  {isApplied ? "✓ Applied" : <><Copy className="mr-1 h-3.5 w-3.5" /> Apply Template</>}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTrackerTemplates;
