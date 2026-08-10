import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, X, Settings, Palette, Users, Calendar, Sparkles } from "lucide-react";
import type { TaskStatus, Holiday } from "./types";

type Props = {
  settings: {
    statuses: TaskStatus[];
    kanban_categories: string[];
    people_in_charge: string[];
    working_days: Record<string, boolean>;
    holidays: Holiday[];
  };
  onUpdate: (updates: any) => void;
};

const TaskTrackerSetup = ({ settings, onUpdate }: Props) => {
  const [newStatus, setNewStatus] = useState("");
  const [newStatusEmoji, setNewStatusEmoji] = useState("🔵");
  const [newCategory, setNewCategory] = useState("");
  const [newPerson, setNewPerson] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayDesc, setNewHolidayDesc] = useState("");

  const addStatus = () => {
    if (!newStatus.trim()) return;
    onUpdate({
      statuses: [...settings.statuses, { name: newStatus, emoji: newStatusEmoji, color: "blue" }],
    });
    setNewStatus("");
    setNewStatusEmoji("🔵");
    toast.success("Status added");
  };

  const removeStatus = (idx: number) => {
    onUpdate({ statuses: settings.statuses.filter((_, i) => i !== idx) });
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    onUpdate({ kanban_categories: [...settings.kanban_categories, newCategory] });
    setNewCategory("");
    toast.success("Category added");
  };

  const removeCategory = (idx: number) => {
    onUpdate({ kanban_categories: settings.kanban_categories.filter((_, i) => i !== idx) });
  };

  const addPerson = () => {
    if (!newPerson.trim()) return;
    onUpdate({ people_in_charge: [...settings.people_in_charge, newPerson] });
    setNewPerson("");
    toast.success("Person added");
  };

  const removePerson = (idx: number) => {
    onUpdate({ people_in_charge: settings.people_in_charge.filter((_, i) => i !== idx) });
  };

  const toggleDay = (day: string) => {
    onUpdate({ working_days: { ...settings.working_days, [day]: !settings.working_days[day] } });
  };

  const addHoliday = () => {
    if (!newHolidayDate || !newHolidayDesc.trim()) return;
    onUpdate({ holidays: [...settings.holidays, { date: newHolidayDate, description: newHolidayDesc }] });
    setNewHolidayDate("");
    setNewHolidayDesc("");
    toast.success("Holiday added");
  };

  const removeHoliday = (idx: number) => {
    onUpdate({ holidays: settings.holidays.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Setup</h1>
          <p className="text-sm text-muted-foreground">Configure your task tracker preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* STATUSES */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-teal-600" /> Status Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {settings.statuses.map((s, idx) => (
                <Badge key={idx} variant="outline" className="gap-1 px-2 py-1">
                  <span>{s.emoji}</span>
                  <span>{s.name}</span>
                  <button onClick={() => removeStatus(idx)} className="ml-1 text-muted-foreground hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Emoji"
                value={newStatusEmoji}
                onChange={e => setNewStatusEmoji(e.target.value)}
                className="w-16 text-center"
              />
              <Input
                placeholder="Status name..."
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addStatus()}
                className="flex-1"
              />
              <Button size="sm" onClick={addStatus}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* KANBAN CATEGORIES */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-purple-600" /> Kanban Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Order matters — columns appear in this order on the Kanban board.</p>
            <div className="flex flex-wrap gap-2">
              {settings.kanban_categories.map((cat, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 px-2 py-1">
                  <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                  <span>{cat}</span>
                  <button onClick={() => removeCategory(idx)} className="ml-1 text-muted-foreground hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New category..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCategory()}
                className="flex-1"
              />
              <Button size="sm" onClick={addCategory}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* PEOPLE IN CHARGE */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-blue-600" /> People in Charge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {settings.people_in_charge.map((person, idx) => (
                <Badge key={idx} variant="outline" className="gap-1 px-2 py-1">
                  <span>{person}</span>
                  <button onClick={() => removePerson(idx)} className="ml-1 text-muted-foreground hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Person name..."
                value={newPerson}
                onChange={e => setNewPerson(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addPerson()}
                className="flex-1"
              />
              <Button size="sm" onClick={addPerson}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* WORKING DAYS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-emerald-600" /> Working Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(settings.working_days).map(([day, active]) => (
                <label key={day} className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-muted/50">
                  <Checkbox checked={active} onCheckedChange={() => toggleDay(day)} />
                  <span className="text-sm capitalize">{day}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HOLIDAYS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-red-500" /> Holidays & Days Off
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.holidays.length > 0 && (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Description</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {settings.holidays.map((h, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-3 py-2">{h.date}</td>
                      <td className="px-3 py-2">{h.description}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeHoliday(idx)} className="text-muted-foreground hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2">
            <Input type="date" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)} className="w-40" />
            <Input
              placeholder="Holiday description..."
              value={newHolidayDesc}
              onChange={e => setNewHolidayDesc(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHoliday()}
              className="flex-1"
            />
            <Button size="sm" onClick={addHoliday}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTrackerSetup;
