import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone, MessageSquare, Calendar, Clock, IndianRupee, Users, QrCode,
  Bell, CheckCircle2, XCircle, AlertTriangle, Brain, Sparkles, Send,
  RefreshCw, ArrowRight
} from "lucide-react";

type FollowUp = {
  id: string;
  patientName: string;
  phone: string;
  type: "due_payment" | "refill_reminder" | "appointment" | "feedback" | "insurance_claim";
  amount?: number;
  description: string;
  dueDate: string;
  lastContact?: string;
  attempts: number;
  status: "pending" | "contacted" | "resolved" | "escalated";
  priority: "high" | "medium" | "low";
  autoReminder: boolean;
  qrEnabled: boolean;
};

const followUps: FollowUp[] = [
  { id: "1", patientName: "Mohammed Ali", phone: "90xxx11223", type: "due_payment", amount: 12500, description: "IPD bill pending since Jul 5", dueDate: "Jul 05", lastContact: "Jul 18", attempts: 3, status: "contacted", priority: "high", autoReminder: true, qrEnabled: true },
  { id: "2", patientName: "Lakshmi Narayan", phone: "94xxx33445", type: "due_payment", amount: 5200, description: "Lab tests + consultation dues", dueDate: "Jul 12", lastContact: "Jul 20", attempts: 2, status: "pending", priority: "high", autoReminder: true, qrEnabled: true },
  { id: "3", patientName: "Rajesh Kumar", phone: "98xxx12345", type: "refill_reminder", amount: 1800, description: "Triphala + Ashwagandha refill due", dueDate: "Jul 25", attempts: 0, status: "pending", priority: "medium", autoReminder: true, qrEnabled: true },
  { id: "4", patientName: "Sunita Devi", phone: "97xxx45678", type: "appointment", description: "Follow-up consultation with Dr. Sivarama", dueDate: "Jul 24", attempts: 1, status: "contacted", priority: "medium", autoReminder: true, qrEnabled: false },
  { id: "5", patientName: "Anand Sharma", phone: "91xxx55667", type: "due_payment", amount: 8500, description: "Panchakarma course balance", dueDate: "Jul 10", lastContact: "Jul 15", attempts: 4, status: "escalated", priority: "high", autoReminder: true, qrEnabled: true },
  { id: "6", patientName: "Deepa Menon", phone: "96xxx77889", type: "insurance_claim", amount: 15000, description: "Star Health claim pending verification", dueDate: "Jul 20", attempts: 2, status: "contacted", priority: "medium", autoReminder: false, qrEnabled: false },
  { id: "7", patientName: "Ravi Patel", phone: "93xxx99001", type: "feedback", description: "Post-treatment feedback pending", dueDate: "Jul 22", attempts: 0, status: "pending", priority: "low", autoReminder: true, qrEnabled: true },
  { id: "8", patientName: "Priya Krishnan", phone: "95xxx22334", type: "refill_reminder", amount: 2400, description: "Brahmi Ghritam + Oil refill", dueDate: "Jul 28", attempts: 0, status: "pending", priority: "low", autoReminder: true, qrEnabled: true },
  { id: "9", patientName: "Suresh Babu", phone: "92xxx44556", type: "due_payment", amount: 3200, description: "Pharmacy bill credit", dueDate: "Jul 08", lastContact: "Jul 21", attempts: 3, status: "contacted", priority: "high", autoReminder: true, qrEnabled: true },
  { id: "10", patientName: "Fathima Begum", phone: "94xxx66778", type: "appointment", description: "Panchakarma session booking confirmation", dueDate: "Jul 23", attempts: 1, status: "contacted", priority: "medium", autoReminder: true, qrEnabled: false },
];

const FollowUpManager = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filtered = followUps.filter(f => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (filterPriority !== "all" && f.priority !== filterPriority) return false;
    if (activeTab === "payment") return f.type === "due_payment";
    if (activeTab === "refills") return f.type === "refill_reminder";
    if (activeTab === "appointments") return f.type === "appointment";
    if (activeTab === "escalated") return f.status === "escalated";
    return true;
  });

  const totalDue = followUps.filter(f => f.type === "due_payment").reduce((s, f) => s + (f.amount ?? 0), 0);
  const totalPending = followUps.filter(f => f.status === "pending").length;
  const totalEscalated = followUps.filter(f => f.status === "escalated").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Follow-up Management
          </h2>
          <p className="text-sm text-muted-foreground">Due payments, refill reminders, appointments & auto follow-ups with QR</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={selectedItems.length === 0}>
            <Send className="mr-1 h-4 w-4" /> Bulk Remind ({selectedItems.length})
          </Button>
          <Button size="sm"><QrCode className="mr-1 h-4 w-4" /> Send QR Links</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Total Dues Pending</p>
            </div>
            <p className="font-display text-xl font-bold text-red-600">₹{totalDue.toLocaleString("en-IN")}</p>
            <p className="text-xs text-red-600">{followUps.filter(f => f.type === "due_payment").length} patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Pending Follow-ups</p>
            </div>
            <p className="font-display text-xl font-bold text-amber-600">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Not yet contacted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Refill Reminders</p>
            </div>
            <p className="font-display text-xl font-bold text-blue-600">{followUps.filter(f => f.type === "refill_reminder").length}</p>
            <p className="text-xs text-muted-foreground">QR-enabled reorder</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Escalated</p>
            </div>
            <p className="font-display text-xl font-bold text-red-600">{totalEscalated}</p>
            <p className="text-xs text-red-600">Needs personal attention</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Automation */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">AI Auto Follow-up System</p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                <p>• 5 payment reminders auto-scheduled via WhatsApp with QR payment links</p>
                <p>• 2 refill reminders will be sent tomorrow with 1-click reorder QR codes</p>
                <p>• Anand Sharma (₹8,500) escalated - 4 attempts failed, suggest personal call</p>
                <p>• Predicted collection from follow-ups: ₹18,500 (based on past conversion: 62%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({followUps.length})</TabsTrigger>
          <TabsTrigger value="payment">Payment Dues ({followUps.filter(f => f.type === "due_payment").length})</TabsTrigger>
          <TabsTrigger value="refills">Refill Reminders ({followUps.filter(f => f.type === "refill_reminder").length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({followUps.filter(f => f.type === "appointment").length})</TabsTrigger>
          <TabsTrigger value="escalated">Escalated ({totalEscalated})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search patient..." className="max-w-xs" />
          </div>

          {/* Follow-up List */}
          <div className="space-y-3">
            {filtered.map((f) => (
              <Card key={f.id} className={
                f.status === "escalated" ? "border-red-200 bg-red-50/20" :
                f.priority === "high" ? "border-amber-200" : ""
              }>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedItems.includes(f.id)}
                      onCheckedChange={() => {
                        setSelectedItems(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{f.patientName}</p>
                          <Badge className={
                            f.priority === "high" ? "bg-red-100 text-red-700" :
                            f.priority === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {f.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {f.type.replace("_", " ")}
                          </Badge>
                          {f.qrEnabled && <QrCode className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div className="flex items-center gap-2">
                          {f.status === "resolved" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {f.status === "escalated" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {f.status === "contacted" && <Clock className="h-4 w-4 text-amber-500" />}
                          {f.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                          <Badge variant="outline" className="text-[10px] capitalize">{f.status}</Badge>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>{f.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span>📱 {f.phone}</span>
                            <span>Due: {f.dueDate}</span>
                            <span>Attempts: {f.attempts}</span>
                            {f.lastContact && <span>Last contact: {f.lastContact}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {f.amount && (
                            <span className="font-semibold text-red-600">₹{f.amount.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Phone className="mr-1 h-3 w-3" /> Call
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <MessageSquare className="mr-1 h-3 w-3" /> WhatsApp
                        </Button>
                        {f.qrEnabled && (
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <QrCode className="mr-1 h-3 w-3" /> Send QR
                          </Button>
                        )}
                        {f.type === "due_payment" && (
                          <Button size="sm" className="h-7 text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Paid
                          </Button>
                        )}
                        {f.type === "appointment" && (
                          <Button size="sm" className="h-7 text-xs">
                            <Calendar className="mr-1 h-3 w-3" /> Book Slot
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No follow-ups in this category.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowUpManager;
