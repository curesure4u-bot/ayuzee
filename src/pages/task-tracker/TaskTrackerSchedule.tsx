import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, RefreshCw } from "lucide-react";
import type { ScheduleOccurrence, RecurringTask } from "./types";
import { getPriorityColor, getDecisionColor } from "./types";

type Props = {
  schedule: ScheduleOccurrence[];
  recurringTasks: RecurringTask[];
  onGenerate: () => void;
  onMarkDone: (id: string) => void;
};

const TaskTrackerSchedule = ({ schedule, recurringTasks, onGenerate, onMarkDone }: Props) => {
  // Auto-generate on first load if empty
  useEffect(() => {
    if (schedule.length === 0 && recurringTasks.length > 0) {
      onGenerate();
    }
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const sortedSchedule = [...schedule].sort((a, b) => a.occurrence_date.localeCompare(b.occurrence_date));
  const doneCount = schedule.filter(s => s.is_done).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-teal-600" /> Recurring Tasks Schedule
          </h1>
          <p className="text-sm text-muted-foreground">Generated occurrences of your recurring tasks — tick when done</p>
        </div>
        <Button onClick={onGenerate} variant="outline" size="sm">
          <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
        </Button>
      </div>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-3 text-xs text-amber-700">
          ** Be careful, this tab is not protected to allow you to filter your data. Do not move cells, and do not delete formulas **
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex gap-3">
        <Badge variant="outline">{schedule.length} total occurrences</Badge>
        <Badge variant="outline" className="text-green-600">{doneCount} completed</Badge>
        <Badge variant="outline" className="text-amber-600">{schedule.length - doneCount} pending</Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-teal-700 w-12">Done</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Task Name</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Description</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Priority</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Person</th>
                  <th className="px-3 py-2 text-left font-medium text-teal-700">Decision</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchedule.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No schedule generated. Click "Regenerate" or add recurring tasks first.
                  </td></tr>
                ) : sortedSchedule.map(occ => {
                  const isPast = occ.occurrence_date < today;
                  return (
                    <tr
                      key={occ.id}
                      className={`border-b hover:bg-muted/30 ${occ.is_done ? "opacity-50 bg-green-50/30" : ""} ${isPast && !occ.is_done ? "bg-red-50/30" : ""}`}
                    >
                      <td className="px-3 py-2">
                        <Checkbox
                          checked={occ.is_done}
                          onCheckedChange={() => !occ.is_done && onMarkDone(occ.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">{occ.task_name}</td>
                      <td className="px-3 py-2">
                        <span className={isPast && !occ.is_done ? "text-red-600 font-bold" : ""}>
                          {occ.occurrence_date}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[150px] truncate">{occ.override_description || occ.description}</td>
                      <td className="px-3 py-2">
                        <Badge className={`text-[10px] ${getPriorityColor((occ.override_priority || occ.priority || "Medium") as any)}`}>
                          {occ.override_priority || occ.priority}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">{occ.override_person || occ.person_in_charge}</td>
                      <td className="px-3 py-2">
                        <Badge className={`text-[10px] ${getDecisionColor((occ.override_decision || occ.decision) as any)}`}>
                          {occ.override_decision || occ.decision}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t text-xs text-muted-foreground">
            Showing {sortedSchedule.length} occurrences
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerSchedule;
