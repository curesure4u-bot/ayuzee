import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { useTaskStore } from "./useTaskStore";
import { useTaskTrackerRole } from "./useTaskTrackerRole";
import TaskTrackerLayout from "./TaskTrackerLayout";
import TaskTrackerDashboard from "./TaskTrackerDashboard";
import TaskTrackerSetup from "./TaskTrackerSetup";
import TaskTrackerVariable from "./TaskTrackerVariable";
import TaskTrackerRecurring from "./TaskTrackerRecurring";
import TaskTrackerSchedule from "./TaskTrackerSchedule";
import TaskTrackerFilter from "./TaskTrackerFilter";
import TaskTrackerKanban from "./TaskTrackerKanban";
import TaskTrackerMatrix from "./TaskTrackerMatrix";
import TaskTrackerMonthly from "./TaskTrackerMonthly";
import TaskTrackerWeekly from "./TaskTrackerWeekly";
import TaskTrackerGantt from "./TaskTrackerGantt";
import TaskTrackerHabits from "./TaskTrackerHabits";
import TaskTrackerJournal from "./TaskTrackerJournal";
import TaskTrackerGoals from "./TaskTrackerGoals";
import TaskTrackerTemplates from "./TaskTrackerTemplates";
import TaskTrackerWeeklyReview from "./TaskTrackerWeeklyReview";
import TaskTrackerPomodoro from "./TaskTrackerPomodoro";
import TaskTrackerAnalytics from "./TaskTrackerAnalytics";
import TaskTrackerFocusMode from "./TaskTrackerFocusMode";
import TaskTrackerNotifications from "./TaskTrackerNotifications";
import TaskTrackerStreaks from "./TaskTrackerStreaks";
import TaskTrackerHelp from "./TaskTrackerHelp";
import QuickAddButton from "./QuickAddButton";

/**
 * All-in-One Task Tracker Module
 * - Local state (useTaskStore) for immediate functionality
 * - Supabase hooks available for persistence (useTaskTrackerSupabase)
 * - Auto-detects role context (doctor/patient/student/hms)
 * - Quick-Add floating button on every page
 * - Overdue task notifications
 */
const TaskTrackerPage = () => {
  const store = useTaskStore();
  const { role } = useTaskTrackerRole();

  // Overdue task notifications on load
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const overdue = store.tasks.filter(
      t => t.due_date && t.due_date < today && !t.is_completed
    );
    if (overdue.length > 0) {
      setTimeout(() => {
        toast.warning(`You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}!`, {
          description: overdue.slice(0, 3).map(t => t.task_name).join(", ") + (overdue.length > 3 ? "..." : ""),
          duration: 6000,
        });
      }, 1500);
    }
  }, [store.tasks]);

  // Template apply handler — adds multiple tasks at once
  const applyTemplate = (templateTasks: any[]) => {
    const today = new Date().toISOString().split("T")[0];
    templateTasks.forEach(t => {
      store.addTask({
        ...t,
        status: "To do",
        person_in_charge: "",
        start_date: today,
        due_date: null,
        progress: 0,
        notes: "",
        is_completed: false,
        completed_at: null,
        gantt_color: "",
        project_name: "",
        role_context: role,
      });
    });
  };

  return (
    <>
      <Routes>
        <Route element={<TaskTrackerLayout />}>
          <Route
            index
            element={
              <TaskTrackerDashboard
                tasks={store.tasks}
                recurringTasks={store.recurringTasks}
                schedule={store.schedule}
              />
            }
          />
          <Route
            path="setup"
            element={
              <TaskTrackerSetup
                settings={store.settings}
                onUpdate={store.updateSettings}
              />
            }
          />
          <Route
            path="variable-tasks"
            element={
              <TaskTrackerVariable
                tasks={store.tasks}
                settings={store.settings}
                onAdd={store.addTask}
                onUpdate={store.updateTask}
                onDelete={store.deleteTask}
              />
            }
          />
          <Route
            path="recurring-tasks"
            element={
              <TaskTrackerRecurring
                recurringTasks={store.recurringTasks}
                settings={store.settings}
                onAdd={store.addRecurring}
                onUpdate={store.updateRecurring}
                onDelete={store.deleteRecurring}
              />
            }
          />
          <Route
            path="tasks-schedule"
            element={
              <TaskTrackerSchedule
                schedule={store.schedule}
                recurringTasks={store.recurringTasks}
                onGenerate={store.generateSchedule}
                onMarkDone={store.markScheduleDone}
              />
            }
          />
          <Route
            path="tasks-filter"
            element={
              <TaskTrackerFilter
                tasks={store.tasks}
                schedule={store.schedule}
                settings={store.settings}
              />
            }
          />
          <Route
            path="kanban"
            element={
              <TaskTrackerKanban
                tasks={store.tasks}
                settings={store.settings}
                onUpdate={store.updateTask}
              />
            }
          />
          <Route
            path="decision-matrix"
            element={<TaskTrackerMatrix tasks={store.tasks} />}
          />
          <Route
            path="monthly-calendar"
            element={
              <TaskTrackerMonthly
                tasks={store.tasks}
                schedule={store.schedule}
              />
            }
          />
          <Route
            path="weekly-calendar"
            element={
              <TaskTrackerWeekly
                tasks={store.tasks}
                schedule={store.schedule}
              />
            }
          />
          <Route
            path="gantt-chart"
            element={
              <TaskTrackerGantt
                tasks={store.tasks}
                settings={store.settings}
                onUpdate={store.updateTask}
              />
            }
          />
          <Route path="goals" element={<TaskTrackerGoals />} />
          <Route path="habits" element={<TaskTrackerHabits />} />
          <Route path="journal" element={<TaskTrackerJournal />} />
          <Route
            path="weekly-review"
            element={<TaskTrackerWeeklyReview tasks={store.tasks} schedule={store.schedule} />}
          />
          <Route
            path="templates"
            element={<TaskTrackerTemplates onApplyTemplate={applyTemplate} />}
          />
          <Route
            path="pomodoro"
            element={<TaskTrackerPomodoro tasks={store.tasks} />}
          />
          <Route
            path="analytics"
            element={<TaskTrackerAnalytics tasks={store.tasks} schedule={store.schedule} />}
          />
          <Route
            path="focus-mode"
            element={<TaskTrackerFocusMode tasks={store.tasks} onUpdate={store.updateTask} />}
          />
          <Route
            path="notifications"
            element={<TaskTrackerNotifications tasks={store.tasks} schedule={store.schedule} />}
          />
          <Route
            path="streaks"
            element={<TaskTrackerStreaks tasks={store.tasks} />}
          />
          <Route path="help" element={<TaskTrackerHelp />} />
        </Route>
      </Routes>

      {/* Floating Quick-Add button (visible on all pages) */}
      <QuickAddButton settings={store.settings} onAdd={store.addTask} />
    </>
  );
};

export default TaskTrackerPage;
