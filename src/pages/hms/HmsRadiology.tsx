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
import { ScanLine, Plus, Upload, Eye, Loader2 } from "lucide-react";
import { useRadiology, type RadiologyOrder } from "@/hooks/useRadiology";

const HmsRadiology = () => {
  const { orders, stats, loading, error, createOrder } = useRadiology();
  const [orderOpen, setOrderOpen] = useState(false);
  const [viewReport, setViewReport] = useState<RadiologyOrder | null>(null);

  // New order form state
  const [newPatient, setNewPatient] = useState("");
  const [newInvestigation, setNewInvestigation] = useState("");
  const [newIndication, setNewIndication] = useState("");
  const [newPriority, setNewPriority] = useState("");

  const handlePlaceOrder = async () => {
    if (!newPatient.trim() || !newInvestigation) return toast.error("Patient and investigation required");
    const investigationLabels: Record<string, string> = {
      xray_knee: "X-Ray Knee (AP/Lateral)", xray_spine: "X-Ray Spine (AP/Lateral)", xray_chest: "X-Ray Chest PA",
      mri_spine: "MRI Lumbar Spine", mri_brain: "MRI Brain", mri_knee: "MRI Knee",
      ct_abdomen: "CT Abdomen", ct_brain: "CT Brain", usg_abdomen: "USG Abdomen",
      usg_pelvis: "USG Pelvis", dexa: "DEXA Scan (Bone Density)", echo: "2D Echocardiography",
    };
    const modalityMap: Record<string, string> = {
      xray_knee: "X-Ray", xray_spine: "X-Ray", xray_chest: "X-Ray",
      mri_spine: "MRI", mri_brain: "MRI", mri_knee: "MRI",
      ct_abdomen: "CT", ct_brain: "CT", usg_abdomen: "USG",
      usg_pelvis: "USG", dexa: "DEXA", echo: "Echo",
    };
    await createOrder({
      patientName: newPatient,
      uhid: "",
      investigation: investigationLabels[newInvestigation] || newInvestigation,
      modality: modalityMap[newInvestigation] || "Other",
      orderedBy: "Current Doctor",
      orderedDate: new Date().toISOString().slice(0, 10),
      scheduledTime: "",
      priority: (newPriority as any) || "routine",
      clinicalIndication: newIndication,
    });
    toast.success("Order placed");
    setOrderOpen(false);
    setNewPatient(""); setNewInvestigation(""); setNewIndication(""); setNewPriority("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-violet-600" /> Radiology & Imaging
          </h1>
          <p className="text-sm text-muted-foreground">
            X-Ray, MRI, CT, Ultrasound order management and PACS
          </p>
        </div>
        <Button onClick={() => setOrderOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Order
        </Button>
      </div>

      {/* Stats */}
      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading radiology data...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.ordered}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p><p className="text-xs text-muted-foreground">Scheduled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">{stats.reported}</p><p className="text-xs text-muted-foreground">Reported</p></CardContent></Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Investigation</th>
                  <th className="px-4 py-3 text-left font-medium">Ordered By</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{order.patientName}</td>
                    <td className="px-4 py-3">{order.investigation}</td>
                    <td className="px-4 py-3">{order.orderedBy}</td>
                    <td className="px-4 py-3">{order.orderedDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        order.status === "reported" ? "default" :
                        order.status === "completed" ? "outline" :
                        order.status === "scheduled" ? "secondary" : "destructive"
                      }>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {(order.status === "completed" || order.status === "reported") && (
                        <Button size="sm" variant="ghost" onClick={() => setViewReport(order)}>
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      )}
                      {order.status === "completed" && (
                        <Button size="sm" variant="ghost">
                          <Upload className="h-3 w-3 mr-1" /> Upload
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Order Dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Radiology Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient</Label><Input placeholder="Search patient" value={newPatient} onChange={(e) => setNewPatient(e.target.value)} /></div>
            <div>
              <Label>Investigation</Label>
              <Select value={newInvestigation} onValueChange={setNewInvestigation}>
                <SelectTrigger><SelectValue placeholder="Select investigation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="xray_knee">X-Ray Knee (AP/Lateral)</SelectItem>
                  <SelectItem value="xray_spine">X-Ray Spine (AP/Lateral)</SelectItem>
                  <SelectItem value="xray_chest">X-Ray Chest PA</SelectItem>
                  <SelectItem value="mri_spine">MRI Lumbar Spine</SelectItem>
                  <SelectItem value="mri_brain">MRI Brain</SelectItem>
                  <SelectItem value="mri_knee">MRI Knee</SelectItem>
                  <SelectItem value="ct_abdomen">CT Abdomen</SelectItem>
                  <SelectItem value="ct_brain">CT Brain</SelectItem>
                  <SelectItem value="usg_abdomen">USG Abdomen</SelectItem>
                  <SelectItem value="usg_pelvis">USG Pelvis</SelectItem>
                  <SelectItem value="dexa">DEXA Scan (Bone Density)</SelectItem>
                  <SelectItem value="echo">2D Echocardiography</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Clinical Indication</Label><Textarea placeholder="Reason for investigation..." rows={2} value={newIndication} onChange={(e) => setNewIndication(e.target.value)} /></div>
            <div><Label>Priority</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder}>Place Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Radiology Report</DialogTitle></DialogHeader>
          {viewReport && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{viewReport.patientName}</p>
                <p className="text-xs text-muted-foreground">{viewReport.investigation} · {viewReport.orderedDate}</p>
              </div>
              <div>
                <Label>Report</Label>
                <div className="p-3 rounded border bg-card text-sm">
                  {viewReport.report || "Report pending..."}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReport(null)}>Close</Button>
            <Button variant="outline">Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsRadiology;
