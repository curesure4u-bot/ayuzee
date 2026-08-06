import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Inbox, FileText, Users, MessageSquare, ShieldCheck, AlertCircle, Clock, Brain } from "lucide-react";

const labResults = [
  {
    id: 1,
    patient: "Rajesh Kumar",
    type: "CBC - Abnormal",
    date: "2025-01-03",
    urgency: "Critical",
    details: "Hb: 8.2 g/dL (Low), WBC: 14,500 (High), Platelets: 90,000 (Low)",
  },
  {
    id: 2,
    patient: "Priya Sharma",
    type: "LFT - Elevated",
    date: "2025-01-03",
    urgency: "High",
    details: "SGPT: 128 U/L, SGOT: 95 U/L, Bilirubin: 2.8 mg/dL",
  },
  {
    id: 3,
    patient: "Sunita Devi",
    type: "Lipid Profile",
    date: "2025-01-02",
    urgency: "Normal",
    details: "Total Cholesterol: 245 mg/dL, LDL: 165 mg/dL, HDL: 38 mg/dL",
  },
  {
    id: 4,
    patient: "Vikram Singh",
    type: "HbA1c",
    date: "2025-01-02",
    urgency: "High",
    details: "HbA1c: 9.2% (Poor control), FBS: 210 mg/dL",
  },
  {
    id: 5,
    patient: "Meera Patel",
    type: "Thyroid Profile",
    date: "2025-01-01",
    urgency: "Normal",
    details: "TSH: 6.8 mIU/L (Slightly elevated), T3/T4: Normal",
  },
];

const referrals = [
  {
    id: 1,
    patient: "Anand Mishra",
    type: "Referral from Dr. Gupta (Ortho)",
    date: "2025-01-03",
    urgency: "Normal",
    details: "Chronic knee pain, not responding to physiotherapy. Requesting Ayurvedic Janu Basti evaluation.",
  },
  {
    id: 2,
    patient: "Kavita Joshi",
    type: "Referral from Dr. Reddy (Neuro)",
    date: "2025-01-02",
    urgency: "High",
    details: "Chronic migraine with aura. Requesting Shirodhara therapy assessment for adjunct treatment.",
  },
];

const messages = [
  {
    id: 1,
    patient: "Rajesh Kumar",
    type: "Symptom Update",
    date: "2025-01-03",
    urgency: "Normal",
    details: "Doctor, my joint pain has reduced by 50% after the Kati Basti. Should I continue the Guggulu tablets?",
  },
  {
    id: 2,
    patient: "Priya Sharma",
    type: "Medication Query",
    date: "2025-01-03",
    urgency: "Normal",
    details: "Experiencing mild nausea after Kutki churna. Can I take it after food instead of before?",
  },
  {
    id: 3,
    patient: "Anil Verma",
    type: "Emergency",
    date: "2025-01-03",
    urgency: "High",
    details: "Developed skin rash after Virechana procedure yesterday. Please advise.",
  },
];

const approvals = [
  {
    id: 1,
    patient: "Sunita Devi",
    type: "Pharmacy Substitution",
    date: "2025-01-03",
    urgency: "Normal",
    details: "Dashmool Kwath out of stock. Pharmacy suggests Maharasnadi Kwath as alternative. Approve?",
  },
];

const DoctorInbox = () => {
  const [activeTab, setActiveTab] = useState("lab-results");

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === "Critical") return <Badge variant="destructive">Critical</Badge>;
    if (urgency === "High") return <Badge className="bg-orange-500 text-white">High</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  const handleReview = (patient: string, type: string) => {
    toast.success(`Reviewing ${type} for ${patient}`);
  };

  const handleApprove = (patient: string) => {
    toast.success(`Approved substitution for ${patient}`);
  };

  const renderItem = (item: { id: number; patient: string; type: string; date: string; urgency: string; details: string }, isApproval = false) => (
    <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{item.patient}</p>
          {getUrgencyBadge(item.urgency)}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{item.type}</p>
        <p className="text-sm text-muted-foreground">{item.details}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {item.date}
        </p>
      </div>
      <div className="ml-4">
        {isApproval ? (
          <Button size="sm" onClick={() => handleApprove(item.patient)}>
            <ShieldCheck className="h-4 w-4 mr-1" />
            Approve
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => handleReview(item.patient, item.type)}>
            Review
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Inbox className="h-8 w-8" />
            Doctor Inbox
          </h1>
          <p className="text-muted-foreground mt-1">Pending items requiring your attention</p>
        </div>
      </div>

      {/* AI Alert Card */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="h-6 w-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">AI Alert</p>
            <p className="text-sm text-red-700">
              2 critical results need immediate attention — Rajesh Kumar (CBC abnormal with low platelets) and Priya Sharma (LFT significantly elevated, possible hepatotoxicity).
            </p>
          </div>
          <Button size="sm" variant="destructive" className="ml-auto whitespace-nowrap">
            <AlertCircle className="h-4 w-4 mr-1" />
            View Critical
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lab-results" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Lab Results
            <Badge variant="secondary" className="ml-1">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Referrals
            <Badge variant="secondary" className="ml-1">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Messages
            <Badge variant="secondary" className="ml-1">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            Approvals
            <Badge variant="secondary" className="ml-1">1</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab-results" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lab Results Pending Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {labResults.map((item) => renderItem(item))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referral Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrals.map((item) => renderItem(item))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {messages.map((item) => renderItem(item))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvals.map((item) => renderItem(item, true))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorInbox;
