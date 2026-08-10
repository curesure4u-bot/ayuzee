// ============================================================
// ALL-IN-ONE TASK TRACKER — Barrel Exports
// ============================================================

// Types & Helpers
export * from "./types";

// Hooks
export { useTaskStore } from "./useTaskStore";
export { useTaskTrackerRole, setTaskTrackerReferrer } from "./useTaskTrackerRole";
export {
  useTaskTrackerSettings,
  useVariableTasks,
  useRecurringTasks,
  useTaskSchedule,
  useHabits,
  useHabitLog,
  useJournal,
} from "./useTaskTrackerSupabase";

// Main entry point (lazy-loaded via lazyPages.ts)
export { default as TaskTrackerPage } from "./TaskTrackerPage";

// Layout
export { default as TaskTrackerLayout } from "./TaskTrackerLayout";

// Pages
export { default as TaskTrackerDashboard } from "./TaskTrackerDashboard";
export { default as TaskTrackerSetup } from "./TaskTrackerSetup";
export { default as TaskTrackerVariable } from "./TaskTrackerVariable";
export { default as TaskTrackerRecurring } from "./TaskTrackerRecurring";
export { default as TaskTrackerSchedule } from "./TaskTrackerSchedule";
export { default as TaskTrackerFilter } from "./TaskTrackerFilter";
export { default as TaskTrackerKanban } from "./TaskTrackerKanban";
export { default as TaskTrackerMatrix } from "./TaskTrackerMatrix";
export { default as TaskTrackerMonthly } from "./TaskTrackerMonthly";
export { default as TaskTrackerWeekly } from "./TaskTrackerWeekly";
export { default as TaskTrackerGantt } from "./TaskTrackerGantt";
export { default as TaskTrackerHabits } from "./TaskTrackerHabits";
export { default as TaskTrackerJournal } from "./TaskTrackerJournal";
export { default as TaskTrackerGoals } from "./TaskTrackerGoals";
export { default as TaskTrackerTemplates } from "./TaskTrackerTemplates";
export { default as TaskTrackerWeeklyReview } from "./TaskTrackerWeeklyReview";
export { default as TaskTrackerPomodoro } from "./TaskTrackerPomodoro";
export { default as TaskTrackerAnalytics } from "./TaskTrackerAnalytics";
export { default as TaskTrackerFocusMode } from "./TaskTrackerFocusMode";
export { default as TaskTrackerNotifications } from "./TaskTrackerNotifications";
export { default as TaskTrackerStreaks } from "./TaskTrackerStreaks";

// Components
export { default as QuickAddButton } from "./QuickAddButton";
export { default as SubtasksList } from "./SubtasksList";
export { default as TaskDetailModal } from "./TaskDetailModal";
export { default as TaskDependencies } from "./TaskDependencies";

// Utilities
export { exportMonthlyCalendarPdf, exportGanttPdf, exportTaskListPdf } from "./exportPdf";
