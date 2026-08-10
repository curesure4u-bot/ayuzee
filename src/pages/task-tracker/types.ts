// ============================================================
// ALL-IN-ONE TASK TRACKER - Shared Types
// ============================================================

export type Priority = "Very High" | "High" | "Medium" | "Low" | "Very Low" | "On Hold";
export type Importance = "Important" | "Not Important";
export type Urgency = "Urgent" | "Not Urgent";
export type Decision = "To Do" | "To Decide" | "To Delegate" | "To Delete";
export type RoleContext = "doctor" | "patient" | "student" | "hms" | "general";

export type TaskStatus = {
  name: string;
  emoji: string;
  color: string;
};

export type Frequency =
  | "Daily"
  | "Every Week"
  | "Every 2 Weeks"
  | "Every Month"
  | "Every 2 Months"
  | "Every 3 Months"
  | "Every 4 Weeks"
  | "Every 6 Months"
  | "Yearly";

export type Holiday = {
  date: string;
  description: string;
};

export type TaskTrackerSettings = {
  id: string;
  user_id: string;
  role_context: RoleContext;
  statuses: TaskStatus[];
  kanban_categories: string[];
  people_in_charge: string[];
  working_days: Record<string, boolean>;
  holidays: Holiday[];
  theme: "light" | "dark" | "system";
};

export type VariableTask = {
  id: string;
  user_id: string;
  role_context: RoleContext;
  task_name: string;
  description: string;
  status: string;
  priority: Priority;
  person_in_charge: string;
  start_date: string | null;
  due_date: string | null;
  kanban_category: string;
  importance: Importance;
  urgency: Urgency;
  decision: Decision;
  progress: number;
  notes: string;
  is_completed: boolean;
  completed_at: string | null;
  gantt_color: string;
  project_name: string;
  created_at: string;
  updated_at: string;
};

export type RecurringTask = {
  id: string;
  user_id: string;
  role_context: RoleContext;
  task_name: string;
  frequency: Frequency;
  description: string;
  priority: Priority;
  person_in_charge: string;
  importance: Importance;
  urgency: Urgency;
  first_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type ScheduleOccurrence = {
  id: string;
  user_id: string;
  recurring_task_id: string;
  occurrence_date: string;
  override_priority: string | null;
  override_person: string | null;
  override_description: string | null;
  override_decision: string | null;
  new_date: string | null;
  is_done: boolean;
  done_at: string | null;
  decision: string;
  // Joined from recurring task
  task_name?: string;
  description?: string;
  priority?: Priority;
  person_in_charge?: string;
};

export type Goal = {
  id: string;
  user_id: string;
  role_context: RoleContext;
  title: string;
  description: string;
  goal_type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  target_date: string | null;
  progress: number;
  is_completed: boolean;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  role_context: RoleContext;
  habit_name: string;
  emoji: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  custom_days: string[];
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  role_context: RoleContext;
  entry_date: string;
  content: string;
  mood: "great" | "good" | "neutral" | "low" | "bad";
  created_at: string;
};

// Helper: calculate decision from importance + urgency
export function getDecision(importance: Importance, urgency: Urgency): Decision {
  if (importance === "Important" && urgency === "Urgent") return "To Do";
  if (importance === "Important" && urgency === "Not Urgent") return "To Decide";
  if (importance === "Not Important" && urgency === "Urgent") return "To Delegate";
  return "To Delete";
}

// Helper: calculate days left from due date
export function getDaysLeft(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper: priority colors
export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case "Very High": return "bg-red-100 text-red-800 border-red-200";
    case "High": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Low": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Very Low": return "bg-gray-100 text-gray-800 border-gray-200";
    case "On Hold": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Helper: decision colors
export function getDecisionColor(decision: Decision): string {
  switch (decision) {
    case "To Do": return "bg-red-50 text-red-700 border-red-200";
    case "To Decide": return "bg-amber-50 text-amber-700 border-amber-200";
    case "To Delegate": return "bg-blue-50 text-blue-700 border-blue-200";
    case "To Delete": return "bg-gray-50 text-gray-500 border-gray-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

// Default settings per role
export function getDefaultSettings(role: RoleContext): Partial<TaskTrackerSettings> {
  const base = {
    statuses: [
      { name: "To do", emoji: "🚩", color: "red" },
      { name: "In progress", emoji: "🔄", color: "blue" },
      { name: "Hold", emoji: "⏸️", color: "orange" },
      { name: "To review", emoji: "👁️", color: "purple" },
      { name: "Started", emoji: "✅", color: "green" },
      { name: "Overdue", emoji: "⚠️", color: "red" },
      { name: "Cancelled", emoji: "❌", color: "gray" },
      { name: "Completed", emoji: "✔️", color: "green" },
    ],
    working_days: {
      monday: true, tuesday: true, wednesday: true,
      thursday: true, friday: true, saturday: false, sunday: false,
    },
    holidays: [],
    theme: "light" as const,
  };

  switch (role) {
    case "doctor":
      return {
        ...base,
        kanban_categories: ["Backlog", "This Week", "In Progress", "Review", "Done"],
        people_in_charge: ["Self", "Nurse", "Receptionist", "Lab Tech", "Pharmacist"],
      };
    case "patient":
      return {
        ...base,
        kanban_categories: ["To Do", "In Progress", "Done", "Skipped"],
        people_in_charge: ["Self", "Caregiver", "Doctor"],
        statuses: [
          { name: "Pending", emoji: "⏳", color: "orange" },
          { name: "Active", emoji: "🔄", color: "blue" },
          { name: "Completed", emoji: "✅", color: "green" },
          { name: "Missed", emoji: "❌", color: "red" },
          { name: "Rescheduled", emoji: "📅", color: "purple" },
        ],
      };
    case "student":
      return {
        ...base,
        kanban_categories: ["Backlog", "To-Do", "Studying", "Review", "Submitted"],
        people_in_charge: ["Self", "Study Group", "Professor", "Mentor"],
        statuses: [
          { name: "Not started", emoji: "📋", color: "gray" },
          { name: "In progress", emoji: "📖", color: "blue" },
          { name: "Submitted", emoji: "📤", color: "purple" },
          { name: "Graded", emoji: "🎓", color: "green" },
          { name: "Overdue", emoji: "⚠️", color: "red" },
          { name: "Cancelled", emoji: "❌", color: "gray" },
        ],
      };
    case "hms":
      return {
        ...base,
        kanban_categories: ["Backlog", "To-Do", "In Progress", "Review", "Done"],
        people_in_charge: ["Reception", "Accounts", "Pharmacy", "Lab", "Nursing", "Admin", "HR"],
      };
    default:
      return {
        ...base,
        kanban_categories: ["Backlog", "To-Do", "In Progress", "Review", "Done"],
        people_in_charge: [],
      };
  }
}
