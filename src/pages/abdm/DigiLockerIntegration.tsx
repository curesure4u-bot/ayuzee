import { useState } from "react";
import { FolderArchive, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const documents = [
  { date: "Aug 10, 2026", doctor: "Dr. Arjun", diagnosis: "Vata-Pitta imbalance management", file: "prescription.pdf" },
  { date: "Jul 28, 2026", doctor: "Dr. Priya", diagnosis: "Panchakarma course plan", file: "treatment_plan.pdf" },
  { date: "Jul 15, 2026", doctor: "Dr. Rajan", diagnosis: "Lab report interpretation", file: "lab_report.pdf" },
  { date: "Jun 30, 2026", doctor: "Dr. Arjun", diagnosis: "Follow-up medication", file: "followup_rx.pdf" },
  { date: "Jun 15, 2026", doctor: "Dr. Meera", diagnosis: "Prakriti assessment", file: "assessment.pdf" },
];

export default function DigiLockerIntegration() {
  const [connected, setConnected] = useState(true);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <FolderArchive className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold">DigiLocker Integration</h1>
          <p className="text-muted-foreground">Store and access prescriptions securely via DigiLocker</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Connection Status:</span>
            {connected ? (
              <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
          {!connected && <Button onClick={() => { setConnected(true); toast.success("DigiLocker connected"); }}>Connect DigiLocker</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Stored Documents</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded">
              <div className="space-y-1">
                <p className="font-medium text-sm">{doc.diagnosis}</p>
                <p className="text-xs text-muted-foreground">{doc.date} • {doc.doctor} • {doc.file}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.info(`Viewing ${doc.file}`)}>View</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => toast.success("Prescription uploaded to DigiLocker")}>Upload to DigiLocker</Button>
        <Button variant="outline" onClick={() => toast.success("All prescriptions synced with DigiLocker")}>Sync All Prescriptions</Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Documents are encrypted and stored as per Digital India standards.
      </p>
    </div>
  );
}
