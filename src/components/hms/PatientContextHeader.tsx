import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity, User, Edit, FileText, Pill, ClipboardList,
  Phone, MessageSquare, Calendar, Clock, Heart,
  Brain, BedDouble, Smartphone,
} from "lucide-react";

interface PatientContextHeaderProps {
  patientName: string;
  patientId: string;
  age: string;
  gender: string;
  mobile: string;
  activeTab?: string;
  showTabs?: boolean;
}

const navTabs = [
  { id: "dashboard", label: "Dashboard", icon: Activity, path: "/hms/patient/dashboard" },
  { id: "profile", label: "Profile", icon: User, path: "/hms/patient/profile" },
  { id: "visit", label: "Visit", icon: Edit, path: "/hms/patient/casesheet" },
  { id: "bills", label: "Bills", icon: FileText, path: "/hms/patient/bills" },
  { id: "tests", label: "Tests", icon: Heart, path: "/hms/patient/vitals" },
  { id: "rx", label: "Rx", icon: Pill, path: "/hms/patient/prescription" },
  { id: "mrd", label: "MRD", icon: ClipboardList, path: "/hms/patient/mrd" },
  { id: "messages", label: "Message Centre", icon: Smartphone, path: "/hms/patient/messages" },
  { id: "appointment", label: "Appointment", icon: Calendar, path: "/hms/patient/appointments" },
  { id: "timeline", label: "Timeline", icon: Clock, path: "/hms/patient/dashboard" },
  { id: "ip", label: "IP Summary", icon: BedDouble, path: "/hms/patient/ip-summary" },
];

const PatientContextHeader = ({
  patientName,
  patientId,
  age,
  gender,
  mobile,
  activeTab = "dashboard",
  showTabs = true,
}: PatientContextHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      {/* Navigation Tabs */}
      {showTabs && (
        <div className="flex flex-wrap gap-1 border-b pb-2">
          {navTabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`h-7 text-xs ${
                activeTab === tab.id
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "text-orange-700 hover:text-orange-800 hover:bg-orange-50"
              }`}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className="h-3 w-3 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      {/* Patient Info Bar */}
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Name:</span>
                <span className="ml-1 font-semibold">{patientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">ID:</span>
                <span className="ml-1 font-semibold">{patientId}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Age:</span>
                <span className="ml-1">{age}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Gender:</span>
                <span className="ml-1">{gender}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground text-xs">Mobile:</span>
              <span className="font-medium">{mobile}</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Call">
                <Phone className="h-3 w-3 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="WhatsApp">
                <MessageSquare className="h-3 w-3 text-green-600" />
              </Button>
              <Badge variant="outline" className="text-[10px] h-5 text-violet-600 border-violet-200">
                <Brain className="h-2.5 w-2.5 mr-0.5" /> AI Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientContextHeader;
