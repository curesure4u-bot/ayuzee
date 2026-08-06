import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Phone, MessageCircle, CheckCircle, AlertTriangle, Calendar, Users, Clock, Brain } from "lucide-react";

const mockPatients = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    lastVisit: "2024-12-20",
    condition: "Sandhivata (Joint Pain) - Panchakarma",
    dueDate: "2025-01-03",
    aiRisk: 78,
    status: "Overdue",
  },
  {
    id: 2,
    name: "Priya Sharma",
    phone: "+91 87654 32109",
    lastVisit: "2024-12-28",
    condition: "Madhumeha (Type 2 Diabetes) - Herbal",
    dueDate: "2025-01-04",
    aiRisk: 45,
    status: "Due",
  },
  {
    id: 3,
    name: "Anil Verma",
    phone: "+91 76543 21098",
    lastVisit: "2024-12-15",
    condition: "Panchakarma Follow-up (Vamana)",
    dueDate: "2025-01-01",
    aiRisk: 82,
    status: "Overdue",
  },
  {
    id: 4,
    name: "Sunita Devi",
    phone: "+91 65432 10987",
    lastVisit: "2024-12-30",
    condition: "Amavata (Rheumatoid Arthritis)",
    dueDate: "2025-01-06",
    aiRisk: 30,
    status: "Due",
  },
  {
    id: 5,
    name: "Vikram Singh",
    phone: "+91 54321 09876",
    lastVisit: "2024-12-22",
    condition: "Gridhrasi (Sciatica) - Kati Basti",
    dueDate: "2025-01-02",
    aiRisk: 91,
    status: "Overdue",
  },
  {
    id: 6,
    name: "Meera Patel",
    phone: "+91 43210 98765",
    lastVisit: "2024-12-31",
    condition: "Shirodhara Follow-up (Insomnia)",
    dueDate: "2025-01-07",
    aiRisk: 25,
    status: "Due",
  },
];

const DoctorFollowups = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = mockPatients.filter((patient) => {
    if (filter === "overdue") return patient.status === "Overdue";
    if (filter === "due") return patient.status === "Due";
    if (searchQuery) return patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const handleCall = (name: string) => {
    toast.success(`Initiating call to ${name}...`);
  };

  const handleWhatsApp = (name: string) => {
    toast.success(`WhatsApp reminder sent to ${name}`);
  };

  const handleMarkDone = (name: string) => {
    toast.success(`${name} marked as follow-up completed`);
  };

  const getRiskBadge = (risk: number) => {
    if (risk >= 70) return <Badge variant="destructive">{risk}% No-show</Badge>;
    if (risk >= 40) return <Badge className="bg-yellow-500 text-white">{risk}% No-show</Badge>;
    return <Badge className="bg-green-500 text-white">{risk}% No-show</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "Overdue") return <Badge variant="destructive">Overdue</Badge>;
    if (status === "Completed") return <Badge className="bg-green-500 text-white">Completed</Badge>;
    return <Badge className="bg-blue-500 text-white">Due</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Follow-up Tracker (AI)</h1>
          <p className="text-muted-foreground mt-1">AI-powered patient follow-up management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Total Due</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <p className="font-semibold text-purple-800">AI Insight</p>
            <p className="text-sm text-purple-700">
              3 patients at high no-show risk — auto-WhatsApp reminders sent. Consider rescheduling Vikram Singh (91% no-show probability) to a morning slot.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due">Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Follow-up Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Patient Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">S.No</th>
                  <th className="text-left p-3 font-medium">Patient</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Last Visit</th>
                  <th className="text-left p-3 font-medium">Condition</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                  <th className="text-left p-3 font-medium">AI Risk</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{patient.name}</td>
                    <td className="p-3">{patient.phone}</td>
                    <td className="p-3">{patient.lastVisit}</td>
                    <td className="p-3">{patient.condition}</td>
                    <td className="p-3">{patient.dueDate}</td>
                    <td className="p-3">{getRiskBadge(patient.aiRisk)}</td>
                    <td className="p-3">{getStatusBadge(patient.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleCall(patient.name)}>
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleWhatsApp(patient.name)}>
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleMarkDone(patient.name)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
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

export default DoctorFollowups;
