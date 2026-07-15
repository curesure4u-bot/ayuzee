import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Plus, Clock, CheckCircle } from "lucide-react";

const SAMPLE_ORDERS = [
  { id: "1", patient: "Ravi Kumar", test: "Complete Blood Count (CBC)", ordered: "2026-07-15 09:30", status: "pending", priority: "routine" },
  { id: "2", patient: "Priya Devi", test: "Thyroid Profile (T3, T4, TSH)", ordered: "2026-07-15 10:00", status: "in_progress", priority: "urgent" },
  { id: "3", patient: "Mohan Lal", test: "Liver Function Test (LFT)", ordered: "2026-07-15 08:15", status: "completed", priority: "routine" },
  { id: "4", patient: "Sunita R", test: "Urine Routine & Microscopy", ordered: "2026-07-14 16:45", status: "completed", priority: "routine" },
  { id: "5", patient: "Anand Singh", test: "Blood Sugar (Fasting + PP)", ordered: "2026-07-15 07:00", status: "in_progress", priority: "routine" },
  { id: "6", patient: "Lakshmi P", test: "Lipid Profile", ordered: "2026-07-15 11:00", status: "pending", priority: "routine" },
];

const HmsLab = () => {
  const [tab, setTab] = useState("all");
  const pending = SAMPLE_ORDERS.filter((o) => o.status === "pending");
  const inProgress = SAMPLE_ORDERS.filter((o) => o.status === "in_progress");
  const completed = SAMPLE_ORDERS.filter((o) => o.status === "completed");
  const display = tab === "pending" ? pending : tab === "progress" ? inProgress : tab === "done" ? completed : SAMPLE_ORDERS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Lab & Diagnostics</h1>
          <p className="text-sm text-muted-foreground">{SAMPLE_ORDERS.length} orders today</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Lab Order</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{pending.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{inProgress.length}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Test</th>
                  <th className="px-4 py-3 text-left font-medium">Ordered</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {display.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{o.patient}</td>
                    <td className="px-4 py-3">{o.test}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.ordered}</td>
                    <td className="px-4 py-3">
                      <Badge variant={o.priority === "urgent" ? "destructive" : "outline"}>{o.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        o.status === "completed" ? "default" :
                        o.status === "in_progress" ? "secondary" : "outline"
                      }>
                        {o.status === "in_progress" ? "In Progress" : o.status}
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

export default HmsLab;
