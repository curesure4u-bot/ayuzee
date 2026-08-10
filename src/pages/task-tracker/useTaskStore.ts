import { useState, useCallback } from "react";
import {
  VariableTask, RecurringTask, ScheduleOccurrence, TaskTrackerSettings,
  RoleContext, Priority, Importance, Urgency, Frequency, getDecision, getDefaultSettings,
} from "./types";

// Generate unique ID
const uid = () => crypto.randomUUID();
const today = () => new Date().toISOString().split("T")[0];

// Sample data for immediate demo
const sampleTasks: VariableTask[] = [
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Budget reviews & Forecasting",
    description: "Compare actual expenses to budget and adjust projections accordingly.",
    status: "In progress", priority: "Very High", person_in_charge: "John",
    start_date: "2025-04-01", due_date: "2025-04-30",
    kanban_category: "In Progress", importance: "Important", urgency: "Urgent",
    decision: "To Do", progress: 47, notes: "", is_completed: false,
    completed_at: null, gantt_color: "teal", project_name: "", created_at: today(), updated_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Weekly meeting preparation",
    description: "Prepare agenda and slides for the Monday sync.",
    status: "To do", priority: "High", person_in_charge: "Self",
    start_date: today(), due_date: today(),
    kanban_category: "To-Do", importance: "Important", urgency: "Not Urgent",
    decision: "To Decide", progress: 0, notes: "", is_completed: false,
    completed_at: null, gantt_color: "blue", project_name: "", created_at: today(), updated_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Quality control checks",
    description: "Inspect product or service quality against standards.",
    status: "In progress", priority: "Low", person_in_charge: "Sophia",
    start_date: "2025-04-20", due_date: "2025-05-11",
    kanban_category: "In Progress", importance: "Not Important", urgency: "Not Urgent",
    decision: "To Delete", progress: 52, notes: "", is_completed: false,
    completed_at: null, gantt_color: "orange", project_name: "", created_at: today(), updated_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "New hire onboarding",
    description: "Guide new employees through orientation, paperwork, and system access.",
    status: "To review", priority: "Medium", person_in_charge: "Dan",
    start_date: "2025-04-15", due_date: "2025-04-26",
    kanban_category: "Review", importance: "Important", urgency: "Urgent",
    decision: "To Do", progress: 66, notes: "", is_completed: false,
    completed_at: null, gantt_color: "purple", project_name: "", created_at: today(), updated_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Equipment maintenance",
    description: "Service and maintain equipment on schedule.",
    status: "Completed", priority: "Medium", person_in_charge: "Marco",
    start_date: "2025-04-10", due_date: "2025-05-11",
    kanban_category: "Done", importance: "Important", urgency: "Urgent",
    decision: "To Do", progress: 100, notes: "", is_completed: true,
    completed_at: "2025-05-10", gantt_color: "green", project_name: "", created_at: today(), updated_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Lead generation campaign",
    description: "Identify potential new customers through marketing efforts.",
    status: "Hold", priority: "Very Low", person_in_charge: "Agustin",
    start_date: "2025-04-25", due_date: "2025-05-18",
    kanban_category: "Backlog", importance: "Not Important", urgency: "Urgent",
    decision: "To Delegate", progress: 75, notes: "", is_completed: false,
    completed_at: null, gantt_color: "pink", project_name: "", created_at: today(), updated_at: today(),
  },
];

const sampleRecurring: RecurringTask[] = [
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Kick Off Meeting", frequency: "Every Week",
    description: "MEETING", priority: "Very High", person_in_charge: "John",
    importance: "Important", urgency: "Not Urgent",
    first_date: "2025-04-01", end_date: "2025-06-30", is_active: true, created_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Bank reconciliations", frequency: "Every Month",
    description: "Bank reconciliations", priority: "Medium", person_in_charge: "Sophia",
    importance: "Not Important", urgency: "Urgent",
    first_date: "2025-04-02", end_date: "2025-12-31", is_active: true, created_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Cash flow monitoring", frequency: "Every 2 Months",
    description: "Cash flow monitoring", priority: "High", person_in_charge: "Dan",
    importance: "Not Important", urgency: "Not Urgent",
    first_date: "2025-04-03", end_date: "2025-12-31", is_active: true, created_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Weekly meeting", frequency: "Every Week",
    description: "Meeting", priority: "On Hold", person_in_charge: "Sophia",
    importance: "Important", urgency: "Not Urgent",
    first_date: "2025-04-08", end_date: null, is_active: true, created_at: today(),
  },
  {
    id: uid(), user_id: "", role_context: "general",
    task_name: "Learning & Development", frequency: "Every 4 Weeks",
    description: "Online Class", priority: "High", person_in_charge: "Self",
    importance: "Not Important", urgency: "Not Urgent",
    first_date: "2025-04-22", end_date: "2025-09-30", is_active: true, created_at: today(),
  },
];

export function useTaskStore() {
  const [tasks, setTasks] = useState<VariableTask[]>(sampleTasks);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>(sampleRecurring);
  const [schedule, setSchedule] = useState<ScheduleOccurrence[]>([]);
  const [settings, setSettings] = useState<TaskTrackerSettings>({
    id: uid(),
    user_id: "",
    role_context: "general",
    statuses: getDefaultSettings("general").statuses!,
    kanban_categories: getDefaultSettings("general").kanban_categories as string[],
    people_in_charge: ["John", "Sophia", "Dan", "Marco", "Agustin", "Self"],
    working_days: getDefaultSettings("general").working_days as Record<string, boolean>,
    holidays: [
      { date: "2025-12-25", description: "Christmas Day" },
      { date: "2025-11-27", description: "Thanksgiving Day" },
      { date: "2025-07-04", description: "Independence Day" },
    ],
    theme: "light",
  });

  // ---- TASK CRUD ----
  const addTask = useCallback((task: Omit<VariableTask, "id" | "user_id" | "decision" | "created_at" | "updated_at">) => {
    const newTask: VariableTask = {
      ...task,
      id: uid(),
      user_id: "",
      decision: getDecision(task.importance, task.urgency),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<VariableTask>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates, updated_at: new Date().toISOString() };
      if (updates.importance || updates.urgency) {
        updated.decision = getDecision(
          updates.importance || t.importance,
          updates.urgency || t.urgency
        );
      }
      if (updates.is_completed && !t.is_completed) {
        updated.completed_at = new Date().toISOString();
        updated.progress = 100;
        updated.status = "Completed";
      }
      return updated;
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ---- RECURRING CRUD ----
  const addRecurring = useCallback((task: Omit<RecurringTask, "id" | "user_id" | "created_at">) => {
    const newTask: RecurringTask = {
      ...task,
      id: uid(),
      user_id: "",
      created_at: new Date().toISOString(),
    };
    setRecurringTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateRecurring = useCallback((id: string, updates: Partial<RecurringTask>) => {
    setRecurringTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurringTasks(prev => prev.filter(t => t.id !== id));
    setSchedule(prev => prev.filter(s => s.recurring_task_id !== id));
  }, []);

  // ---- SCHEDULE ----
  const generateSchedule = useCallback(() => {
    const generated: ScheduleOccurrence[] = [];
    const endRange = new Date();
    endRange.setMonth(endRange.getMonth() + 3); // Generate 3 months ahead

    for (const rt of recurringTasks) {
      if (!rt.is_active) continue;
      let current = new Date(rt.first_date);
      const end = rt.end_date ? new Date(rt.end_date) : endRange;

      while (current <= end && current <= endRange) {
        generated.push({
          id: uid(),
          user_id: "",
          recurring_task_id: rt.id,
          occurrence_date: current.toISOString().split("T")[0],
          override_priority: null,
          override_person: null,
          override_description: null,
          override_decision: null,
          new_date: null,
          is_done: false,
          done_at: null,
          decision: getDecision(rt.importance, rt.urgency),
          task_name: rt.task_name,
          description: rt.description,
          priority: rt.priority,
          person_in_charge: rt.person_in_charge,
        });

        // Advance date by frequency
        switch (rt.frequency) {
          case "Daily": current.setDate(current.getDate() + 1); break;
          case "Every Week": current.setDate(current.getDate() + 7); break;
          case "Every 2 Weeks": current.setDate(current.getDate() + 14); break;
          case "Every Month": current.setMonth(current.getMonth() + 1); break;
          case "Every 2 Months": current.setMonth(current.getMonth() + 2); break;
          case "Every 3 Months": current.setMonth(current.getMonth() + 3); break;
          case "Every 4 Weeks": current.setDate(current.getDate() + 28); break;
          case "Every 6 Months": current.setMonth(current.getMonth() + 6); break;
          case "Yearly": current.setFullYear(current.getFullYear() + 1); break;
        }
      }
    }

    setSchedule(generated);
    return generated;
  }, [recurringTasks]);

  // ---- SCHEDULE ACTIONS ----
  const markScheduleDone = useCallback((id: string) => {
    setSchedule(prev => prev.map(s =>
      s.id === id ? { ...s, is_done: true, done_at: new Date().toISOString() } : s
    ));
  }, []);

  // ---- SETTINGS ----
  const updateSettings = useCallback((updates: Partial<TaskTrackerSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // ---- COMPUTED ----
  const allTasksForCalendar = useCallback(() => {
    const variableMapped = tasks.map(t => ({
      id: t.id,
      task_name: t.task_name,
      date: t.due_date || t.start_date || "",
      start_date: t.start_date,
      due_date: t.due_date,
      status: t.status,
      priority: t.priority,
      person_in_charge: t.person_in_charge,
      is_completed: t.is_completed,
      decision: t.decision,
      type: "variable" as const,
    }));

    const recurringMapped = schedule.map(s => ({
      id: s.id,
      task_name: s.task_name || "",
      date: s.new_date || s.occurrence_date,
      start_date: s.occurrence_date,
      due_date: s.new_date || s.occurrence_date,
      status: s.is_done ? "Completed" : "To do",
      priority: (s.override_priority || s.priority || "Medium") as Priority,
      person_in_charge: s.override_person || s.person_in_charge || "",
      is_completed: s.is_done,
      decision: (s.override_decision || s.decision) as string,
      type: "recurring" as const,
    }));

    return [...variableMapped, ...recurringMapped];
  }, [tasks, schedule]);

  return {
    tasks, recurringTasks, schedule, settings,
    addTask, updateTask, deleteTask,
    addRecurring, updateRecurring, deleteRecurring,
    generateSchedule, markScheduleDone,
    updateSettings, allTasksForCalendar,
  };
}
