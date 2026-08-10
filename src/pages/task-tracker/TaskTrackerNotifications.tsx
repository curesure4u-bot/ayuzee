import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Clock, CalendarDays, CheckCircle, Info, Flame } from "lucide-react";
import type { VariableTask, ScheduleOccurrence } from "./types";
import { getDaysLeft } from "./types";

type Props = {
  tasks: VariableTask[];
  schedule: ScheduleOccurrence[];
};

type Notification = {
  id: string;
  type: "overdue" | "due_today" | "due_soon" | "high_priority" | "milestone" | "info";
  title: string;
  description: string;
  task_name: string;
  date: string;
  icon: any;
  color: string;
};

const TaskTrackerNotifications = ({ tasks, schedule }: Props) => {
  const today = new Date().toISOString().split("T")[0];

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // Overdue tasks
    tasks.filter(t => t.due_date && t.due_date < today && !t.is_completed).forEach(t => {
      const daysOverdue = Math.abs(getDaysLeft(t.due_date) || 0);
      notifs.push({
        id: `overdue-${t.id}`,
        type: "overdue",
        title: "Task Overdue",
        description: `"${t.task_name}" was due ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} ago`,
        task_name: t.task_name,
        date: t.due_date || "",
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50 border-red-200",
      });
    });

    // Due today
    tasks.filter(t => t.due_date === today && !t.is_completed).forEach(t => {
      notifs.push({
        id: `today-${t.id}`,
        type: "due_today",
        title: "Due Today",
        description: `"${t.task_name}" is due today — don't forget!`,
        task_name: t.task_name,
        date: today,
        icon: Clock,
        color: "text-amber-600 bg-amber-50 border-amber-200",
      });
    });

    // Due within 3 days
    tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      const days = getDaysLeft(t.due_date);
      return days !== null && days > 0 && days <= 3;
    }).forEach(t => {
      const days = getDaysLeft(t.due_date);
      notifs.push({
        id: `soon-${t.id}`,
        type: "due_soon",
        title: "Due Soon",
        description: `"${t.task_name}" is due in ${days} day${days !== 1 ? "s" : ""}`,
        task_name: t.task_name,
        date: t.due_date || "",
        icon: CalendarDays,
        color: "text-blue-600 bg-blue-50 border-blue-200",
      });
    });

    // High priority unstarted
    tasks.filter(t => (t.priority === "Very High" || t.priority === "High") && t.progress === 0 && !t.is_completed).forEach(t => {
      notifs.push({
        id: `hp-${t.id}`,
        type: "high_priority",
        title: "High Priority — Not Started",
        description: `"${t.task_name}" (${t.priority}) hasn't been started yet`,
        task_name: t.task_name,
        date: t.start_date || "",
        icon: Flame,
        color: "text-orange-600 bg-orange-50 border-orange-200",
      });
    });

    // Tasks at 90%+ progress (almost done!)
    tasks.filter(t => t.progress >= 90 && t.progress < 100 && !t.is_completed).forEach(t => {
      notifs.push({
        id: `milestone-${t.id}`,
        type: "milestone",
        title: "Almost Done!",
        description: `"${t.task_name}" is at ${t.progress}% — just a little more!`,
        task_name: t.task_name,
        date: "",
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200",
      });
    });

    // Recurring tasks due today
    schedule.filter(s => s.occurrence_date === today && !s.is_done).forEach(s => {
      notifs.push({
        id: `sched-${s.id}`,
        type: "due_today",
        title: "Recurring Task Due",
        description: `"${s.task_name}" is scheduled for today`,
        task_name: s.task_name || "",
        date: today,
        icon: Clock,
        color: "text-purple-600 bg-purple-50 border-purple-200",
      });
    });

    return notifs;
  }, [tasks, schedule, today]);

  // Group by type
  const overdue = notifications.filter(n => n.type === "overdue");
  const dueToday = notifications.filter(n => n.type === "due_today");
  const dueSoon = notifications.filter(n => n.type === "due_soon");
  const highPriority = notifications.filter(n => n.type === "high_priority");
  const milestones = notifications.filter(n => n.type === "milestone");

  const sections = [
    { title: "Overdue", items: overdue, emptyMsg: "No overdue tasks! Great job.", iconColor: "text-red-500" },
    { title: "Due Today", items: dueToday, emptyMsg: "Nothing due today.", iconColor: "text-amber-500" },
    { title: "Due Within 3 Days", items: dueSoon, emptyMsg: "No upcoming deadlines in the next 3 days.", iconColor: "text-blue-500" },
    { title: "High Priority — Not Started", items: highPriority, emptyMsg: "All high-priority tasks are in progress.", iconColor: "text-orange-500" },
    { title: "Almost Complete", items: milestones, emptyMsg: "No tasks near completion right now.", iconColor: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-500" /> Notifications & Reminders
          </h1>
          <p className="text-sm text-muted-foreground">Stay on top of deadlines and priorities</p>
        </div>
        <Badge variant={notifications.length > 5 ? "destructive" : "outline"} className="text-sm px-3">
          {notifications.length} alert{notifications.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="px-2 py-1 text-red-600 border-red-200 bg-red-50">
          <AlertTriangle className="mr-1 h-3 w-3" /> {overdue.length} Overdue
        </Badge>
        <Badge variant="outline" className="px-2 py-1 text-amber-600 border-amber-200 bg-amber-50">
          <Clock className="mr-1 h-3 w-3" /> {dueToday.length} Due Today
        </Badge>
        <Badge variant="outline" className="px-2 py-1 text-blue-600 border-blue-200 bg-blue-50">
          <CalendarDays className="mr-1 h-3 w-3" /> {dueSoon.length} Due Soon
        </Badge>
        <Badge variant="outline" className="px-2 py-1 text-orange-600 border-orange-200 bg-orange-50">
          <Flame className="mr-1 h-3 w-3" /> {highPriority.length} Needs Start
        </Badge>
        <Badge variant="outline" className="px-2 py-1 text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="mr-1 h-3 w-3" /> {milestones.length} Almost Done
        </Badge>
      </div>

      {/* Notification Sections */}
      {sections.map(section => (
        <Card key={section.title}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm flex items-center gap-2 ${section.iconColor}`}>
              {section.title}
              {section.items.length > 0 && <Badge variant="secondary" className="text-[10px]">{section.items.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.items.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" /> {section.emptyMsg}
              </p>
            ) : (
              <div className="space-y-2">
                {section.items.map(notif => (
                  <div key={notif.id} className={`flex items-start gap-3 rounded-lg border p-3 ${notif.color}`}>
                    <notif.icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{notif.description}</p>
                    </div>
                    {notif.date && (
                      <span className="text-[10px] text-muted-foreground shrink-0">{notif.date}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* All clear */}
      {notifications.length === 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-3" />
            <p className="text-xl font-semibold text-green-700">All Clear!</p>
            <p className="text-sm text-green-600">No pending notifications. You're on top of everything.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskTrackerNotifications;
