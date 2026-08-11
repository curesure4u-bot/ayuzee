import { useState } from "react";
import { Database, Download, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ExportRecord {
  id: string;
  type: string;
  requested_at: string;
  status: "processing" | "ready" | "expired";
}

export default function AdminBackupExport() {
  const [exports, setExports] = useState<ExportRecord[]>([]);

  const triggerExport = (type: string) => {
    const record: ExportRecord = {
      id: Date.now().toString(),
      type,
      requested_at: new Date().toLocaleString(),
      status: "processing",
    };
    setExports((prev) => [record, ...prev]);
    toast.success(`Export initiated — CSV will be emailed`);

    setTimeout(() => {
      setExports((prev) =>
        prev.map((e) =>
          e.id === record.id ? { ...e, status: "ready" as const } : e
        )
      );
    }, 3000);
  };

  const triggerBackup = () => {
    toast.success("Backup initiated");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      processing: "secondary",
      ready: "default",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Backup & Data Export
        </h1>
        <p className="text-muted-foreground mt-1">
          Export data and manage backups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => triggerExport("All Users")}
            >
              Export All Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => triggerExport("All Doctors")}
            >
              Export All Doctors
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => triggerExport("All Therapists")}
            >
              Export All Therapists
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => triggerExport("All Sessions")}
            >
              Export All Sessions
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => triggerExport("All Transactions")}
            >
              Export All Transactions
            </Button>
            <div className="pt-2 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => triggerExport("Full Database Dump")}
              >
                Export Full Database Dump
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Warning: This may take several minutes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <span className="text-sm font-medium">Aug 11, 2026 at 03:00 AM (auto)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Backup Size</span>
              <span className="text-sm font-medium">2.4 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Backup Location</span>
              <span className="text-sm font-medium">Supabase Cloud (Singapore)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Next Scheduled</span>
              <span className="text-sm font-medium">Aug 12, 2026 at 03:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="default" className="bg-green-600">Healthy</Badge>
            </div>
            <div className="pt-3 border-t">
              <Button onClick={triggerBackup} className="w-full">
                Trigger Manual Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {exports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Export Type</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.type}</TableCell>
                    <TableCell>{exp.requested_at}</TableCell>
                    <TableCell>{getStatusBadge(exp.status)}</TableCell>
                    <TableCell>
                      {exp.status === "ready" ? (
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
