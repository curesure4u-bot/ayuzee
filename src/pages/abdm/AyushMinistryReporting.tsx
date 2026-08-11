import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const reports = [
  { title: "Monthly Treatment Report", desc: "Aggregate patient treatment data", lastSubmitted: "Jul 1, 2026", status: "submitted" },
  { title: "Practitioner Registry Update", desc: "Updated practitioner credentials", lastSubmitted: "Jul 15, 2026", status: "submitted" },
  { title: "Drug Adverse Event Report", desc: "Report adverse reactions from AYUSH drugs", lastSubmitted: "Jun 30, 2026", status: "pending" },
  { title: "Panchakarma Safety Report", desc: "Safety incidents during Panchakarma", lastSubmitted: "Jun 15, 2026", status: "overdue" },
  { title: "Student Training Log", desc: "Internship and training hours log", lastSubmitted: "Jul 10, 2026", status: "submitted" },
  { title: "Research Publication Report", desc: "Published research submissions", lastSubmitted: "May 30, 2026", status: "pending" },
];

const stats = [
  { label: "Total Reports Submitted", value: "24" },
  { label: "Compliance Rate", value: "92%" },
  { label: "Next Due", value: "Aug 15, 2026" },
];

const statusColor = (s: string) => s === "submitted" ? "default" : s === "pending" ? "secondary" : "destructive";

export default function AyushMinistryReporting() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold">AYUSH Ministry Reporting</h1>
          <p className="text-muted-foreground">Automated reporting for Ministry of AYUSH compliance requirements</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{r.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">{r.desc}</p>
              <p className="text-xs">Last submitted: {r.lastSubmitted}</p>
              <div className="flex items-center justify-between">
                <Badge variant={statusColor(r.status)}>{r.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${r.title} generated`)}>Generate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full" onClick={() => toast.success("All pending reports generated and queued for submission")}>
        Bulk Generate All Pending
      </Button>

      <Card>
        <CardHeader><CardTitle className="text-sm">Compliance Calendar</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            {["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
              <div key={m} className="border rounded p-2">
                <p className="font-medium">{m} 2026</p>
                <p className="text-muted-foreground">Due: 15th</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
