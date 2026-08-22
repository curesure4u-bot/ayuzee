import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Briefcase, CheckCircle2, Users, Clock } from "lucide-react";

const MOCK_ONBOARDING = [
  {
    employeeId: "6", employeeName: "Anita D", employeeCode: "EMP-0006", department: "Laboratory", joinDate: "2024-08-01",
    tasks: [
      { id: "t1", name: "Appointment Letter Issued", category: "documents", completed: true },
      { id: "t2", name: "Employee ID Created", category: "access", completed: true },
      { id: "t3", name: "Aadhaar & PAN Collected", category: "documents", completed: true },
      { id: "t4", name: "Bank Account Details", category: "documents", completed: true },
      { id: "t5", name: "Qualification Certificates", category: "documents", completed: true },
      { id: "t6", name: "HR Orientation", category: "orientation", completed: true },
      { id: "t7", name: "Department Orientation", category: "orientation", completed: true },
      { id: "t8", name: "Policy Acknowledgement", category: "compliance", completed: false },
      { id: "t9", name: "Login Credentials", category: "access", completed: true },
      { id: "t10", name: "Uniform Issued", category: "equipment", completed: false },
      { id: "t11", name: "ID Card Issued", category: "equipment", completed: false },
      { id: "t12", name: "Fire Safety Training", category: "training", completed: false },
      { id: "t13", name: "Probation Goals Set", category: "compliance", completed: false },
    ],
  },
  {
    employeeId: "new1", employeeName: "Preethi S", employeeCode: "EMP-0011", department: "Panchakarma", joinDate: "2026-08-01",
    tasks: [
      { id: "t1", name: "Appointment Letter Issued", category: "documents", completed: true },
      { id: "t2", name: "Employee ID Created", category: "access", completed: true },
      { id: "t3", name: "Aadhaar & PAN Collected", category: "documents", completed: true },
      { id: "t4", name: "Bank Account Details", category: "documents", completed: true },
      { id: "t5", name: "Qualification Certificates", category: "documents", completed: true },
      { id: "t6", name: "HR Orientation", category: "orientation", completed: true },
      { id: "t7", name: "Department Orientation", category: "orientation", completed: true },
      { id: "t8", name: "Policy Acknowledgement", category: "compliance", completed: true },
      { id: "t9", name: "Login Credentials", category: "access", completed: true },
      { id: "t10", name: "Uniform Issued", category: "equipment", completed: true },
      { id: "t11", name: "ID Card Issued", category: "equipment", completed: true },
      { id: "t12", name: "PK SOP Training", category: "training", completed: true },
      { id: "t13", name: "Probation Goals Set", category: "compliance", completed: true },
    ],
  },
];

const HrmsOnboarding = () => {
  const [data, setData] = useState(MOCK_ONBOARDING);

  const toggleTask = (empIdx: number, taskId: string) => {
    setData((prev) => prev.map((emp, i) => i === empIdx
      ? { ...emp, tasks: emp.tasks.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t) }
      : emp
    ));
    toast.success("Task updated");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6 text-indigo-600" /> Onboarding</h1>
          <p className="text-sm text-muted-foreground">New employee onboarding checklists & progress</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{data.length}</p><p className="text-[9px] text-muted-foreground">In Onboarding</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-700">{data.filter((d) => d.tasks.every((t) => t.completed)).length}</p><p className="text-[9px] text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="border-amber-100"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-700">{data.filter((d) => !d.tasks.every((t) => t.completed)).length}</p><p className="text-[9px] text-muted-foreground">In Progress</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {data.map((emp, empIdx) => {
          const completed = emp.tasks.filter((t) => t.completed).length;
          const total = emp.tasks.length;
          const pct = Math.round((completed / total) * 100);
          return (
            <Card key={emp.employeeId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">{emp.employeeName}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{emp.employeeCode} &middot; {emp.department} &middot; Joined {new Date(emp.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{pct}%</p>
                    <Badge className={`text-[9px] border-0 ${pct === 100 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {pct === 100 ? "Complete" : `${completed}/${total}`}
                    </Badge>
                  </div>
                </div>
                <Progress value={pct} className="h-2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-1">
                  {emp.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 py-1">
                      <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(empIdx, task.id)} />
                      <span className={`text-xs ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.name}</span>
                      <Badge variant="outline" className="text-[7px] ml-auto capitalize">{task.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HrmsOnboarding;
