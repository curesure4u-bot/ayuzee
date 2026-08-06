import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Heart, Thermometer, Activity, Wind, Droplets, Scale,
  AlertTriangle, Clock, CheckCircle, Plus, Search, RefreshCw,
  Stethoscope, Users
} from "lucide-react";

type TriageRecord = {
  id: string;
  patient_name: string;
  token_number: number;
  priority: "emergency" | "urgent" | "normal" | "low";
  status: "captured" | "sent_to_doctor" | "consultation_started" | "completed";
  chief_complaint: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  captured_at: string;
};

const mockTriageData: TriageRecord[] = [
  { id: "1", patient_name: "Rajesh Kumar", token_number: 1, priority: "urgent", status: "sent_to_doctor", chief_complaint: "Chest pain, shortness of breath", bp: "160/100", pulse: 98, temp: 99.2, spo2: 94, captured_at: "09:15 AM" },
  { id: "2", patient_name: "Priya Sharma", token_number: 2, priority: "normal", status: "captured", chief_complaint: "Joint pain for 2 weeks", bp: "120/80", pulse: 72, temp: 98.6, spo2: 98, captured_at: "09:30 AM" },
  { id: "3", patient_name: "Amit Patel", token_number: 3, priority: "normal", status: "captured", chief_complaint: "Follow-up for Panchakarma", bp: "118/76", pulse: 68, temp: 98.4, spo2: 99, captured_at: "09:45 AM" },
  { id: "4", patient_name: "Sunita Devi", token_number: 4, priority: "emergency", status: "consultation_started", chief_complaint: "Severe abdominal pain, vomiting", bp: "90/60", pulse: 110, temp: 101.5, spo2: 92, captured_at: "10:00 AM" },
];

const priorityColors = {
  emergency: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-orange-100 text-orange-800 border-orange-200",
  normal: "bg-green-100 text-green-800 border-green-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  captured: Clock,
  sent_to_doctor: Activity,
  consultation_started: Stethoscope,
  completed: CheckCircle,
};

const HmsTriage = () => {
  const [records] = useState<TriageRecord[]>(mockTriageData);
  const [addOpen, setAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    patient_name: "", token_number: "",
    bp_systolic: "", bp_diastolic: "", pulse: "", temperature: "",
    respiratory_rate: "", spo2: "", weight: "", height: "",
    chief_complaint: "", complaint_duration: "", pain_scale: "",
    known_allergies: "", current_medications: "",
    prakriti_type: "", nadi_pareeksha: "", jihva_observation: "",
    priority: "normal", notes: "",
  });

  const handleSubmit = () => {
    if (!formData.patient_name || !formData.bp_systolic) {
      return toast.error("Patient name and BP are required");
    }
    toast.success(`Triage captured for ${formData.patient_name}`);
    setAddOpen(false);
    setFormData({
      patient_name: "", token_number: "",
      bp_systolic: "", bp_diastolic: "", pulse: "", temperature: "",
      respiratory_rate: "", spo2: "", weight: "", height: "",
      chief_complaint: "", complaint_duration: "", pain_scale: "",
      known_allergies: "", current_medications: "",
      prakriti_type: "", nadi_pareeksha: "", jihva_observation: "",
      priority: "normal", notes: "",
    });
  };

  const filtered = records.filter((r) => {
    const matchSearch = r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = filterPriority === "all" || r.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" /> Nursing Triage Station
          </h1>
          <p className="text-sm text-muted-foreground">
            Pre-consultation vitals & chief complaint capture
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/opd"}>OPD Queue</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/nursing"}>Nursing</Button>
          <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Triage
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{records.filter(r => r.priority === "emergency").length}</p><p className="text-xs text-muted-foreground">Emergency</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-orange-600">{records.filter(r => r.priority === "urgent").length}</p><p className="text-xs text-muted-foreground">Urgent</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{records.filter(r => r.status === "captured").length}</p><p className="text-xs text-muted-foreground">Awaiting Doctor</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{records.filter(r => r.status === "completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search patient or complaint..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Triage Records List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Today's Triage Queue ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((record) => {
              const StatusIcon = statusIcons[record.status];
              return (
                <div key={record.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition">
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      #{record.token_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{record.patient_name}</p>
                        <Badge className={priorityColors[record.priority]}>{record.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{record.chief_complaint}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> BP: {record.bp}</span>
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Pulse: {record.pulse}</span>
                        <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp: {record.temp}°F</span>
                        <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> SpO2: {record.spo2}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{record.captured_at}</span>
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    {record.status === "captured" && (
                      <Button size="sm" variant="outline">Send to Doctor</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Triage Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" /> Capture Patient Triage
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Patient Name *</Label>
                <Input value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} placeholder="Name or search by phone" />
              </div>
              <div>
                <Label>Token Number</Label>
                <Input value={formData.token_number} onChange={(e) => setFormData({ ...formData, token_number: e.target.value })} placeholder="Auto or manual" />
              </div>
            </div>

            {/* Vitals */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" /> Vital Signs</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><Label className="text-xs">BP Systolic *</Label><Input type="number" value={formData.bp_systolic} onChange={(e) => setFormData({ ...formData, bp_systolic: e.target.value })} placeholder="120" /></div>
                <div><Label className="text-xs">BP Diastolic</Label><Input type="number" value={formData.bp_diastolic} onChange={(e) => setFormData({ ...formData, bp_diastolic: e.target.value })} placeholder="80" /></div>
                <div><Label className="text-xs">Pulse Rate</Label><Input type="number" value={formData.pulse} onChange={(e) => setFormData({ ...formData, pulse: e.target.value })} placeholder="72" /></div>
                <div><Label className="text-xs">Temperature (°F)</Label><Input type="number" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} placeholder="98.6" /></div>
                <div><Label className="text-xs">Respiratory Rate</Label><Input type="number" value={formData.respiratory_rate} onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })} placeholder="16" /></div>
                <div><Label className="text-xs">SpO2 (%)</Label><Input type="number" value={formData.spo2} onChange={(e) => setFormData({ ...formData, spo2: e.target.value })} placeholder="98" /></div>
                <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="65" /></div>
                <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="170" /></div>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" /> Complaint & History</p>
              <div>
                <Label className="text-xs">Chief Complaint</Label>
                <Textarea value={formData.chief_complaint} onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })} placeholder="Describe main complaint..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Duration</Label><Input value={formData.complaint_duration} onChange={(e) => setFormData({ ...formData, complaint_duration: e.target.value })} placeholder="e.g. 3 days" /></div>
                <div><Label className="text-xs">Pain Scale (0-10)</Label><Input type="number" min="0" max="10" value={formData.pain_scale} onChange={(e) => setFormData({ ...formData, pain_scale: e.target.value })} placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Known Allergies</Label><Input value={formData.known_allergies} onChange={(e) => setFormData({ ...formData, known_allergies: e.target.value })} placeholder="Comma separated" /></div>
                <div><Label className="text-xs">Current Medications</Label><Input value={formData.current_medications} onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })} placeholder="Comma separated" /></div>
              </div>
            </div>

            {/* AYUSH Triage */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-1"><Wind className="h-4 w-4 text-emerald-500" /> AYUSH Observations (Optional)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Prakriti Type</Label>
                  <Select value={formData.prakriti_type} onValueChange={(v) => setFormData({ ...formData, prakriti_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vata">Vata</SelectItem>
                      <SelectItem value="pitta">Pitta</SelectItem>
                      <SelectItem value="kapha">Kapha</SelectItem>
                      <SelectItem value="vata-pitta">Vata-Pitta</SelectItem>
                      <SelectItem value="pitta-kapha">Pitta-Kapha</SelectItem>
                      <SelectItem value="vata-kapha">Vata-Kapha</SelectItem>
                      <SelectItem value="tridosha">Tridosha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Nadi Pareeksha</Label><Input value={formData.nadi_pareeksha} onChange={(e) => setFormData({ ...formData, nadi_pareeksha: e.target.value })} placeholder="e.g. Vata gati" /></div>
                <div><Label className="text-xs">Jihva Observation</Label><Input value={formData.jihva_observation} onChange={(e) => setFormData({ ...formData, jihva_observation: e.target.value })} placeholder="Coating, color..." /></div>
              </div>
            </div>

            {/* Priority & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Triage Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nurse Notes</Label>
                <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional observations..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save & Send to Doctor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsTriage;
