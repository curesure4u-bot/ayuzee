import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Clock, AlertTriangle, CheckCircle, FileText, Send } from "lucide-react";

const mockHandoffs = [
  { id: 1, date: "2024-01-15", outgoing: "Dr. Sharma", incoming: "Dr. Patel", status: "acknowledged" },
  { id: 2, date: "2024-01-14", outgoing: "Dr. Patel", incoming: "Dr. Sharma", status: "acknowledged" },
  { id: 3, date: "2024-01-13", outgoing: "Dr. Reddy", incoming: "Dr. Sharma", status: "pending" },
];

const mockCriticalPatients = [
  { name: "Ramesh K.", bed: "ICU-3", issue: "Post-Vamana observation, BP fluctuating" },
  { name: "Sunita M.", bed: "Ward-7", issue: "Basti course Day 5, mild abdominal discomfort" },
  { name: "Ajay P.", bed: "Ward-2", issue: "Ksharasutra post-op, dressing due at 10 PM" },
];

const ShiftHandoff = () => {
  const [notes, setNotes] = useState("");
  const [pendingActions, setPendingActions] = useState("1. Blood reports pending for Ramesh K.\n2. Diet change approval for Sunita M.\n3. Discharge summary for Bed 12");
  const [alerts, setAlerts] = useState("Watch for allergic reaction in Ward-7 patient (new medication started)");

  const handleSubmit = () => {
    if (!notes.trim()) { toast.error("Please add handoff notes"); return; }
    toast.success("Shift handoff submitted. Incoming doctor notified.");
    setNotes("");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shift Handoff</h1>
        <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Evening Shift</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Critical Patients</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockCriticalPatients.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{p.name}</span>
                  <Badge variant="secondary" className="text-xs">{p.bed}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.issue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Pending Actions</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={pendingActions} onChange={(e) => setPendingActions(e.target.value)} rows={4} className="text-sm" />
            <div className="mt-3">
              <p className="text-xs font-medium mb-1 text-amber-600">Alerts to Watch</p>
              <Textarea value={alerts} onChange={(e) => setAlerts(e.target.value)} rows={2} className="text-sm border-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> New Handoff Note</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Outgoing:</span> <strong>Dr. Sharma (You)</strong></div>
            <div><span className="text-muted-foreground">Incoming:</span> <strong>Dr. Patel</strong></div>
          </div>
          <Textarea placeholder="Summary of shift, new admissions, special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="gap-2"><Send className="h-4 w-4" /> Submit & Notify</Button>
            <Button variant="outline">Save Draft</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Handoff History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockHandoffs.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="text-sm">
                  <span className="font-medium">{h.outgoing}</span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="font-medium">{h.incoming}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{h.date}</span>
                  <Badge variant={h.status === "acknowledged" ? "default" : "secondary"} className="text-xs gap-1">
                    {h.status === "acknowledged" && <CheckCircle className="h-3 w-3" />}
                    {h.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftHandoff;
