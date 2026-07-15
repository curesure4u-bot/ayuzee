import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Syringe, Plus } from "lucide-react";

const PROCEDURES = [
  { id: "1", patient: "Ravi Kumar", procedure: "Vamana (Therapeutic Emesis)", scheduled: "2026-07-15 10:00", status: "scheduled", doctor: "Dr. Sharma" },
  { id: "2", patient: "Priya Devi", procedure: "Virechana (Purgation Therapy)", scheduled: "2026-07-15 11:30", status: "in_progress", doctor: "Dr. Meena" },
  { id: "3", patient: "Mohan Lal", procedure: "Basti (Enema Therapy)", scheduled: "2026-07-14 14:00", status: "completed", doctor: "Dr. Reddy" },
  { id: "4", patient: "Sunita R", procedure: "Nasya (Nasal Therapy)", scheduled: "2026-07-15 09:00", status: "completed", doctor: "Dr. Patel" },
  { id: "5", patient: "Anand Singh", procedure: "Raktamokshana (Bloodletting)", scheduled: "2026-07-16 10:00", status: "scheduled", doctor: "Dr. Sharma" },
];

const HmsProcedures = () => {
  const [tab, setTab] = useState("all");
  const scheduled = PROCEDURES.filter((p) => p.status === "scheduled");
  const inProgress = PROCEDURES.filter((p) => p.status === "in_progress");
  const completed = PROCEDURES.filter((p) => p.status === "completed");
  const display = tab === "scheduled" ? scheduled : tab === "progress" ? inProgress : tab === "done" ? completed : PROCEDURES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Procedures</h1>
          <p className="text-sm text-muted-foreground">Panchakarma & Clinical Procedures</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Schedule Procedure</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({PROCEDURES.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="done">Completed ({completed.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Procedure</th>
                  <th className="px-4 py-3 text-left font-medium">Doctor</th>
                  <th className="px-4 py-3 text-left font-medium">Scheduled</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {display.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.patient}</td>
                    <td className="px-4 py-3">{p.procedure}</td>
                    <td className="px-4 py-3">{p.doctor}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.scheduled}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        p.status === "completed" ? "default" :
                        p.status === "in_progress" ? "secondary" : "outline"
                      }>
                        {p.status === "in_progress" ? "In Progress" : p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsProcedures;
