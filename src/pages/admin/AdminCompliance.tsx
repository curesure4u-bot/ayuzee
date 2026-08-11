import { useState } from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface DataRequest {
  id: string;
  user_email: string;
  request_type: "access" | "deletion" | "correction";
  status: "pending" | "processing" | "completed" | "rejected";
  submitted_date: string;
  completed_date: string | null;
}

const consentTypes = [
  { name: "Terms of Service", count: 0 },
  { name: "Privacy Policy", count: 0 },
  { name: "Marketing Emails", count: 0 },
  { name: "Photo Consent", count: 0 },
  { name: "Health Data Processing", count: 0 },
];

const initialChecklist = [
  { id: "dpdp", label: "DPDP Act 2023 compliance", checked: false },
  { id: "enc_rest", label: "Data encryption at rest", checked: true },
  { id: "enc_transit", label: "Data encryption in transit", checked: true },
  { id: "erasure", label: "Right to erasure implemented", checked: false },
  { id: "consent", label: "Consent management in place", checked: true },
  { id: "breach", label: "Data breach notification process", checked: false },
  { id: "dpo", label: "DPO appointed", checked: false },
  { id: "privacy", label: "Privacy policy updated", checked: true },
  {
    id: "dpa",
    label: "Data processing agreements with vendors",
    checked: false,
  },
];

export default function AdminCompliance() {
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [checklist, setChecklist] = useState(initialChecklist);

  const processRequest = (id: string) => {
    setDataRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "processing" as const } : r
      )
    );
    toast.success("Request is now being processed");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const saveChecklist = () => {
    localStorage.setItem("compliance_checklist", JSON.stringify(checklist));
    toast.success("Compliance checklist saved");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "outline",
      completed: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Compliance & Legal
        </h1>
        <p className="text-muted-foreground mt-1">
          DPDP Act tracker, consent logs, and data deletion requests
        </p>
      </div>

      <Tabs defaultValue="data-requests">
        <TabsList>
          <TabsTrigger value="data-requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent-log">Consent Log</TabsTrigger>
          <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="data-requests" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {dataRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No data requests</p>
                  <p className="text-sm">
                    When users submit data access, deletion, or correction
                    requests, they will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>User Email</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-sm">
                          {req.id}
                        </TableCell>
                        <TableCell>{req.user_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{req.request_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{req.submitted_date}</TableCell>
                        <TableCell>{req.completed_date || "—"}</TableCell>
                        <TableCell>
                          {req.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => processRequest(req.id)}
                            >
                              Process
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent-log" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent Types Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentTypes.map((consent) => (
                  <div
                    key={consent.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{consent.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {consent.count} users consented
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {item.label}
                    </label>
                    {item.checked && (
                      <Badge variant="default">Compliant</Badge>
                    )}
                  </div>
                ))}
                <Button onClick={saveChecklist} className="mt-4">
                  Save Checklist
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
