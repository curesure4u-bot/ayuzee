import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle, Plus,
  Zap, Shield, Heart, Stethoscope, Pill, FileText,
  UserCheck, BedDouble, Activity, Brain,
} from "lucide-react";

type ChecklistItem = {
  id: string; text: string; checked: boolean;
  mandatory: boolean; aiSuggested?: boolean; note?: string;
};

type Checklist = {
  id: string; name: string; category: string; icon: React.ReactNode;
  items: ChecklistItem[]; assignedTo: string; patient?: string;
  createdAt: string; dueAt: string; status: "pending" | "in-progress" | "completed" | "overdue";
};

const mockChecklists: Checklist[] = [
  {
    id: "1", name: "Pre-Operative Checklist — Kati Basti", category: "Pre-Procedure",
    icon: <Stethoscope className="h-4 w-4" />, assignedTo: "Nurse Bhavani",
    patient: "Priya Menon", createdAt: "2026-07-22 07:00", dueAt: "2026-07-22 09:00", status: "in-progress",
    items: [
      { id: "1a", text: "Patient identity verified (name + ID band)", checked: true, mandatory: true },
      { id: "1b", text: "Informed consent obtained and signed", checked: true, mandatory: true },
      { id: "1c", text: "Allergies reviewed and documented", checked: true, mandatory: true },
      { id: "1d", text: "Fasting status confirmed (minimum 2 hrs)", checked: true, mandatory: true },
      { id: "1e", text: "Vitals recorded (BP, Pulse, Temp, SpO2)", checked: false, mandatory: true },
      { id: "1f", text: "Prakriti assessment completed", checked: true, mandatory: false, aiSuggested: true },
      { id: "1g", text: "Agni (digestive fire) status assessed", checked: false, mandatory: false, aiSuggested: true },
      { id: "1h", text: "Previous procedure notes reviewed", checked: true, mandatory: false },
      { id: "1i", text: "Therapy room prepared (oil warmed, table ready)", checked: false, mandatory: true },
      { id: "1j", text: "Therapist briefed on patient history", checked: false, mandatory: true },
      { id: "1k", text: "Emergency tray checked", checked: true, mandatory: true },
    ],
  },
  {
    id: "2", name: "IP Admission Checklist", category: "Admission",
    icon: <BedDouble className="h-4 w-4" />, assignedTo: "Vignesh (Reception)",
    patient: "Rahul Kumar", createdAt: "2026-07-22 08:30", dueAt: "2026-07-22 10:00", status: "pending",
    items: [
      { id: "2a", text: "Patient registration completed / existing record verified", checked: true, mandatory: true },
      { id: "2b", text: "Admission form filled with next-of-kin details", checked: true, mandatory: true },
      { id: "2c", text: "ID proof & insurance documents collected", checked: false, mandatory: true },
      { id: "2d", text: "Advance payment / deposit collected", checked: false, mandatory: true },
      { id: "2e", text: "Room/bed allocated and confirmed", checked: false, mandatory: true },
      { id: "2f", text: "Doctor notified of admission", checked: false, mandatory: true },
      { id: "2g", text: "Diet preferences noted (Veg/Pathya-Apathya)", checked: false, mandatory: false, aiSuggested: true },
      { id: "2h", text: "Medication reconciliation done", checked: false, mandatory: true },
      { id: "2i", text: "Orientation given (call bell, bathroom, visiting hours)", checked: false, mandatory: false },
      { id: "2j", text: "WhatsApp notification sent to patient family", checked: false, mandatory: false, aiSuggested: true },
    ],
  },
  {
    id: "3", name: "Discharge Checklist", category: "Discharge",
    icon: <UserCheck className="h-4 w-4" />, assignedTo: "Nurse Bhavani",
    patient: "Lakshmi Nair", createdAt: "2026-07-22 06:00", dueAt: "2026-07-22 11:00", status: "in-progress",
    items: [
      { id: "3a", text: "Doctor's discharge order obtained", checked: true, mandatory: true },
      { id: "3b", text: "Discharge summary prepared", checked: true, mandatory: true },
      { id: "3c", text: "Final vitals recorded", checked: true, mandatory: true },
      { id: "3d", text: "Medications explained to patient/attendant", checked: false, mandatory: true },
      { id: "3e", text: "Diet chart (Pathya) provided", checked: false, mandatory: false, aiSuggested: true },
      { id: "3f", text: "Follow-up appointment scheduled", checked: false, mandatory: true },
      { id: "3g", text: "All bills cleared / insurance claimed", checked: false, mandatory: true },
      { id: "3h", text: "Patient belongings returned", checked: false, mandatory: false },
      { id: "3i", text: "Feedback form filled", checked: false, mandatory: false },
      { id: "3j", text: "WhatsApp discharge summary sent", checked: false, mandatory: false, aiSuggested: true },
      { id: "3k", text: "Home care instructions provided (Ayurveda Dinacharya)", checked: false, mandatory: false, aiSuggested: true },
    ],
  },
  {
    id: "4", name: "Daily Nursing Rounds Checklist", category: "Daily Rounds",
    icon: <Activity className="h-4 w-4" />, assignedTo: "Nurse Sankari",
    patient: "Mohammed F. (Room 201)", createdAt: "2026-07-22 06:00", dueAt: "2026-07-22 08:00", status: "overdue",
    items: [
      { id: "4a", text: "Vitals measured and charted (6 AM)", checked: true, mandatory: true },
      { id: "4b", text: "Patient comfort assessed (pain scale)", checked: true, mandatory: true },
      { id: "4c", text: "IV line / catheter site checked", checked: true, mandatory: true },
      { id: "4d", text: "Medications administered as per schedule", checked: true, mandatory: true },
      { id: "4e", text: "Breakfast served per diet chart", checked: false, mandatory: true },
      { id: "4f", text: "Panchakarma therapy time confirmed", checked: false, mandatory: true },
      { id: "4g", text: "Bowel/urine output documented", checked: false, mandatory: true },
      { id: "4h", text: "Patient mobilization done (if applicable)", checked: false, mandatory: false },
      { id: "4i", text: "Doctor's round notes updated", checked: false, mandatory: true },
    ],
  },
  {
    id: "5", name: "NABH Quality Compliance — Monthly", category: "Compliance",
    icon: <Shield className="h-4 w-4" />, assignedTo: "Quality Manager",
    createdAt: "2026-07-01", dueAt: "2026-07-31", status: "in-progress",
    items: [
      { id: "5a", text: "Hand hygiene audit completed (5 moments)", checked: true, mandatory: true },
      { id: "5b", text: "Fire extinguisher inspection done", checked: true, mandatory: true },
      { id: "5c", text: "Biomedical waste segregation audit", checked: true, mandatory: true },
      { id: "5d", text: "Patient fall risk assessment documented", checked: false, mandatory: true },
      { id: "5e", text: "Medication storage temperature log maintained", checked: true, mandatory: true },
      { id: "5f", text: "Staff training attendance > 80%", checked: false, mandatory: true },
      { id: "5g", text: "Incident reporting reviewed (near-miss, adverse)", checked: false, mandatory: true },
      { id: "5h", text: "Patient rights displayed in all areas", checked: true, mandatory: true },
      { id: "5i", text: "Equipment calibration records updated", checked: false, mandatory: true },
      { id: "5j", text: "Clinical pathway adherence audit > 90%", checked: false, mandatory: true },
    ],
  },
];

const checklistTemplates = [
  { name: "Pre-Operative (Panchakarma)", category: "Pre-Procedure", items: 11 },
  { name: "Pre-Operative (OT/Surgery)", category: "Pre-Procedure", items: 15 },
  { name: "IP Admission", category: "Admission", items: 10 },
  { name: "Discharge", category: "Discharge", items: 11 },
  { name: "Daily Nursing Rounds", category: "Daily Rounds", items: 9 },
  { name: "NABH Monthly Compliance", category: "Compliance", items: 10 },
  { name: "Emergency Readiness", category: "Safety", items: 8 },
  { name: "Pharmacy Daily Opening", category: "Operations", items: 7 },
  { name: "Lab Quality Control", category: "Quality", items: 6 },
  { name: "New Staff Onboarding", category: "HR", items: 12 },
  { name: "Teleconsult Setup", category: "Clinical", items: 5 },
  { name: "Panchakarma Room Prep", category: "Pre-Procedure", items: 8 },
];

const HmsChecklist = () => {
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id !== checklistId) return cl;
      const updated = { ...cl, items: cl.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )};
      const allDone = updated.items.filter(i => i.mandatory).every(i => i.checked);
      if (allDone && updated.status !== "completed") {
        updated.status = "completed";
        toast.success(`${cl.name} — All mandatory items completed!`);
      }
      return updated;
    }));
  };

  const filteredChecklists = filterCategory === "all"
    ? checklists
    : checklists.filter(cl => cl.category.toLowerCase().includes(filterCategory));

  const pendingCount = checklists.filter(cl => cl.status === "pending" || cl.status === "in-progress").length;
  const overdueCount = checklists.filter(cl => cl.status === "overdue").length;
  const completedToday = checklists.filter(cl => cl.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" /> Clinical & Operational Checklists
          </h1>
          <p className="text-sm text-muted-foreground">
            Pre-op · Admission · Discharge · Rounds · NABH Compliance · AI-suggested items
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Checklist
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Clock className="h-5 w-5 mx-auto text-blue-600" />
          <p className="text-xl font-bold mt-1">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Active / Pending</p>
        </CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto text-red-600" />
          <p className="text-xl font-bold mt-1 text-red-600">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-600" />
          <p className="text-xl font-bold mt-1 text-green-600">{completedToday}</p>
          <p className="text-xs text-muted-foreground">Completed Today</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Brain className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-xl font-bold mt-1">
            {checklists.reduce((s, cl) => s + cl.items.filter(i => i.aiSuggested).length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">AI Suggestions</p>
        </CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="pre-procedure">Pre-Procedure</SelectItem>
            <SelectItem value="admission">Admission</SelectItem>
            <SelectItem value="discharge">Discharge</SelectItem>
            <SelectItem value="daily">Daily Rounds</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Checklists */}
      <Tabs defaultValue="active">
        <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
          <TabsTrigger value="active">Active ({pendingCount + overdueCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredChecklists.filter(cl => cl.status !== "completed").map((cl) => {
            const done = cl.items.filter(i => i.checked).length;
            const total = cl.items.length;
            const pct = Math.round((done / total) * 100);
            return (
              <Card key={cl.id} className={cl.status === "overdue" ? "border-red-300 bg-red-50/20" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{cl.icon}</span>
                      <div>
                        <CardTitle className="text-base">{cl.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {cl.patient && `Patient: ${cl.patient} · `}Assigned: {cl.assignedTo} · Due: {cl.dueAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cl.status === "overdue" ? "destructive" : cl.status === "in-progress" ? "default" : "secondary"} className="text-[10px] capitalize">
                        {cl.status}
                      </Badge>
                      <span className="text-xs font-bold">{pct}%</span>
                    </div>
                  </div>
                  <Progress value={pct} className={`h-2 mt-2 ${pct === 100 ? "[&>div]:bg-green-500" : cl.status === "overdue" ? "[&>div]:bg-red-500" : ""}`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cl.items.map((item) => (
                      <div key={item.id} className={`flex items-start gap-2 p-2 rounded border ${item.checked ? "bg-green-50/50 border-green-200" : item.mandatory ? "border-amber-200" : ""}`}>
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(cl.id, item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                            {item.text}
                          </p>
                          {item.note && <p className="text-[10px] text-muted-foreground mt-0.5">{item.note}</p>}
                        </div>
                        <div className="flex gap-1">
                          {item.mandatory && <Badge variant="outline" className="text-[9px] text-red-600 border-red-300">Required</Badge>}
                          {item.aiSuggested && <Badge variant="outline" className="text-[9px] text-purple-600 border-purple-300"><Zap className="h-2 w-2 mr-0.5" />AI</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Reminder sent to " + cl.assignedTo)}>
                      Send Reminder
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("AI is analyzing for missing items...")}>
                      <Brain className="mr-1 h-3 w-3" /> AI Suggest More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto text-green-300 mb-2" />
              <p className="text-sm">No completed checklists yet today.</p>
              <p className="text-xs">Completed checklists will appear here with audit trail.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Checklist Templates Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklistTemplates.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.category} · {t.items} items</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success(`Created checklist from template: ${t.name}`)}>
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI-Suggested Checklist Info */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardContent className="p-3 flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
              <div className="text-xs text-purple-700">
                <p className="font-medium">AI-Powered Checklist Generation</p>
                <p className="text-purple-600 mt-0.5">
                  Based on the patient's condition, treatment plan, and NABH guidelines, AI automatically suggests
                  additional checklist items marked with the <Zap className="h-3 w-3 inline" /> icon. These include
                  Ayurveda-specific items like Prakriti assessment, Pathya-Apathya diet notes, and Dinacharya instructions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create New Checklist Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Checklist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Template</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select a template or start blank" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank Checklist</SelectItem>
                  {checklistTemplates.map(t => (
                    <SelectItem key={t.name} value={t.name}>{t.name} ({t.items} items)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Patient (optional)</Label><Input placeholder="Search patient name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assigned To *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse1">Nurse Bhavani</SelectItem>
                    <SelectItem value="nurse2">Nurse Sankari</SelectItem>
                    <SelectItem value="reception">Vignesh (Reception)</SelectItem>
                    <SelectItem value="pharma">Pharmacist Sindhu</SelectItem>
                    <SelectItem value="lab">Lab Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Due Date/Time</Label><Input type="datetime-local" /></div>
            </div>
            <div><Label>Custom Name (optional)</Label><Input placeholder="e.g., Pre-op for Abhyanga — Room 3" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Checklist created and assigned"); setCreateOpen(false); }}>
              Create Checklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsChecklist;
