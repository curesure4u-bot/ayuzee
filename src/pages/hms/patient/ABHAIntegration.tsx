import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Link, Shield, FileText, Plus, Download, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const abhaProfile = {
  abhaNumber: "91-1234-5678-9012",
  abhaAddress: "rajesh.kumar@abdm",
  linked: true,
  linkedDate: "2024-08-15",
  lastSync: "2024-12-20",
  phrApp: "ABHA App",
};

const linkedRecords = [
  { id: 1, facility: "Apollo Hospital, Chennai", date: "2024-03-10", type: "Lab Report", description: "CBC, LFT, KFT – All normal" },
  { id: 2, facility: "Arya Vaidya Sala, Kottakkal", date: "2024-05-22", type: "Prescription", description: "Panchakarma protocol – Virechana" },
  { id: 3, facility: "AIIMS Delhi", date: "2024-01-15", type: "Discharge Summary", description: "Appendectomy – Uneventful recovery" },
  { id: 4, facility: "SRL Diagnostics", date: "2024-09-08", type: "Lab Report", description: "HbA1c: 5.8%, Lipid Profile – Borderline" },
];

const consentRequests = [
  { id: 1, from: "Dr. Priya Nair, Ayuzee Clinic", purpose: "Treatment continuation", status: "approved", date: "2024-12-18" },
  { id: 2, from: "Star Health Insurance", purpose: "Claim processing", status: "pending", date: "2024-12-22" },
  { id: 3, from: "Manipal Hospital", purpose: "Second opinion referral", status: "denied", date: "2024-12-10" },
];

export default function ABHAIntegration() {
  const handleCreateABHA = () => toast.success("ABHA creation initiated via Aadhaar OTP");
  const handleFetchRecords = () => toast.info("Fetching records from ABDM network...");
  const handlePushRecords = () => toast.success("Ayuzee records pushed to patient's PHR");
  const handleApproveConsent = (id: number) => toast.success(`Consent request #${id} approved`);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-indigo-600" /> ABHA / PHR Integration</h1>
          <p className="text-muted-foreground">Mr. Rajesh Kumar • Ayushman Bharat Digital Mission</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFetchRecords}><Download className="h-4 w-4 mr-1" /> Fetch Records</Button>
          <Button size="sm" onClick={handlePushRecords}><Upload className="h-4 w-4 mr-1" /> Push to PHR</Button>
        </div>
      </div>

      {abhaProfile.linked ? (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">ABHA Linked Successfully</p>
                <p className="text-sm text-muted-foreground">
                  ABHA: {abhaProfile.abhaNumber} • Address: {abhaProfile.abhaAddress}
                </p>
                <p className="text-xs text-muted-foreground">Linked: {abhaProfile.linkedDate} • Last synced: {abhaProfile.lastSync}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="font-medium">ABHA Not Linked</p>
              <p className="text-sm text-muted-foreground">Create or link an existing ABHA ID</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateABHA}><Plus className="h-4 w-4 mr-1" /> Create ABHA</Button>
              <Button variant="outline" size="sm"><Link className="h-4 w-4 mr-1" /> Link Existing</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Linked Records</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Records from Other Facilities</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {linkedRecords.map((record) => (
                  <div key={record.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{record.facility}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{record.description}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{record.type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{record.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Consent Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{req.from}</p>
                      <p className="text-xs text-muted-foreground">{req.purpose} • {req.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={req.status === "approved" ? "default" : req.status === "pending" ? "secondary" : "destructive"}>
                        {req.status}
                      </Badge>
                      {req.status === "pending" && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleApproveConsent(req.id)}>
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
