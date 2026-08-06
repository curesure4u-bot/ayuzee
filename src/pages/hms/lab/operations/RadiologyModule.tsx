import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Image, Search, Upload, Eye, Download, CheckCircle2,
  Clock, User, FileText, Monitor, Printer, Brain,
  Plus, AlertTriangle, Activity,
} from "lucide-react";

interface RadiologyOrder {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  referredBy: string;
  modality: "X-Ray" | "Ultrasound" | "CT Scan" | "MRI" | "Mammography" | "ECG" | "Echo" | "Doppler";
  studyName: string;
  bodyPart: string;
  priority: "Routine" | "Urgent" | "STAT";
  orderDate: string;
  scheduledAt?: string;
  status: "Ordered" | "Scheduled" | "In Progress" | "Images Uploaded" | "Reported" | "Validated" | "Dispatched";
  imageCount: number;
  reportedBy?: string;
  findings?: string;
  impression?: string;
  aiFindings?: string;
  templateUsed?: string;
}

interface RadiologyTemplate {
  id: string;
  name: string;
  modality: string;
  bodyPart: string;
  content: string;
  isDefault: boolean;
}

const mockOrders: RadiologyOrder[] = [
  { id: "1", orderNo: "RAD-2026-0112", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", age: 52, gender: "Male", referredBy: "Dr. Mohamad Saleem", modality: "X-Ray", studyName: "Chest X-Ray PA View", bodyPart: "Chest", priority: "Urgent", orderDate: "2026-07-24 08:45", scheduledAt: "2026-07-24 09:00", status: "Reported", imageCount: 2, reportedBy: "Dr. Radiologist", findings: "Bilateral clear lung fields. Cardiothoracic ratio within normal limits. No pleural effusion. Costophrenic angles clear. Bony thorax appears normal.", impression: "Normal chest radiograph.", aiFindings: "AI detected no abnormalities. Confidence: 96%." },
  { id: "2", orderNo: "RAD-2026-0113", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", age: 45, gender: "Female", referredBy: "Dr. Anitha Kumari", modality: "Ultrasound", studyName: "USG Abdomen & Pelvis", bodyPart: "Abdomen", priority: "Routine", orderDate: "2026-07-24 09:30", scheduledAt: "2026-07-24 10:30", status: "In Progress", imageCount: 0 },
  { id: "3", orderNo: "RAD-2026-0114", patientId: "AL-15320", patientName: "Mr. Suresh Babu", age: 38, gender: "Male", referredBy: "Dr. Mohamad Saleem", modality: "ECG", studyName: "12-Lead ECG", bodyPart: "Heart", priority: "STAT", orderDate: "2026-07-24 10:00", status: "Images Uploaded", imageCount: 1 },
  { id: "4", orderNo: "RAD-2026-0115", patientId: "AL-16050", patientName: "Mrs. Saraswathi", age: 60, gender: "Female", referredBy: "Dr. Ramesh Babu", modality: "X-Ray", studyName: "X-Ray Knee (Both) AP & Lateral", bodyPart: "Knee", priority: "Routine", orderDate: "2026-07-24 10:15", status: "Ordered", imageCount: 0 },
  { id: "5", orderNo: "RAD-2026-0116", patientId: "AL-13105", patientName: "Mrs. Priya Sharma", age: 30, gender: "Female", referredBy: "Dr. Anitha Kumari", modality: "Ultrasound", studyName: "USG Obstetric (NT Scan)", bodyPart: "Pelvis", priority: "Routine", orderDate: "2026-07-24 07:30", scheduledAt: "2026-07-24 08:00", status: "Validated", imageCount: 8, reportedBy: "Dr. Radiologist", findings: "Single live intrauterine pregnancy. CRL corresponds to 12+3 weeks. NT: 1.2mm (Normal). Nasal bone present. FHR: 158 bpm.", impression: "Normal first trimester scan. NT within normal limits.", aiFindings: "AI measurement verification: CRL 58mm, NT 1.2mm - within expected range." },
  { id: "6", orderNo: "RAD-2026-0117", patientId: "AL-16001", patientName: "Ms. Kavitha R", age: 28, gender: "Female", referredBy: "Dr. Mohamad Saleem", modality: "MRI", studyName: "MRI Brain (Plain + Contrast)", bodyPart: "Brain", priority: "Urgent", orderDate: "2026-07-24 11:00", status: "Scheduled", scheduledAt: "2026-07-25 09:00", imageCount: 0 },
];

const mockTemplates: RadiologyTemplate[] = [
  { id: "t1", name: "Normal Chest X-Ray", modality: "X-Ray", bodyPart: "Chest", content: "Bilateral clear lung fields. Normal cardiothoracic ratio. No pleural effusion. Costophrenic angles clear.", isDefault: true },
  { id: "t2", name: "Normal USG Abdomen", modality: "Ultrasound", bodyPart: "Abdomen", content: "Liver: Normal size and echo-texture. No focal lesion. CBD not dilated. Gallbladder: Normal. Pancreas: Normal. Spleen: Normal. Kidneys: Normal size and echo-texture bilaterally.", isDefault: true },
  { id: "t3", name: "Normal ECG", modality: "ECG", bodyPart: "Heart", content: "Regular sinus rhythm. Rate: 72 bpm. Normal axis. PR interval normal. QRS duration normal. No ST-T changes. No arrhythmias.", isDefault: true },
  { id: "t4", name: "OA Knee Changes", modality: "X-Ray", bodyPart: "Knee", content: "Joint space narrowing noted. Subchondral sclerosis present. Marginal osteophytes seen. No loose bodies.", isDefault: false },
];

const RadiologyModule = () => {
  const [orders] = useState<RadiologyOrder[]>(mockOrders);
  const [templates] = useState<RadiologyTemplate[]>(mockTemplates);
  const [activeTab, setActiveTab] = useState("worklist");
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = orders.filter((o) => {
    const matchSearch = o.patientName.toLowerCase().includes(search.toLowerCase()) || o.orderNo.toLowerCase().includes(search.toLowerCase());
    const matchModality = modalityFilter === "ALL" || o.modality === modalityFilter;
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchModality && matchStatus;
  });

  const todayTotal = orders.length;
  const pendingReport = orders.filter(o => o.status === "Images Uploaded").length;
  const completed = orders.filter(o => o.status === "Reported" || o.status === "Validated" || o.status === "Dispatched").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ordered": return "bg-gray-100 text-gray-700";
      case "Scheduled": return "bg-blue-100 text-blue-700";
      case "In Progress": return "bg-amber-100 text-amber-700";
      case "Images Uploaded": return "bg-purple-100 text-purple-700";
      case "Reported": return "bg-green-100 text-green-700";
      case "Validated": return "bg-green-200 text-green-800";
      case "Dispatched": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) { case "STAT": return "bg-red-600 text-white"; case "Urgent": return "bg-amber-500 text-white"; default: return "bg-gray-200 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Image className="h-5 w-5" /> Radiology Module
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Order</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Image className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{todayTotal}</p>
            <p className="text-[10px] text-muted-foreground">Today's Studies</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{pendingReport}</p>
            <p className="text-[10px] text-muted-foreground">Pending Report</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{completed}</p>
            <p className="text-[10px] text-muted-foreground">Reported</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Monitor className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{orders.filter(o => o.status === "In Progress").length}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="worklist">Worklist</TabsTrigger>
          <TabsTrigger value="viewer">Image Viewer</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        {/* Worklist Tab */}
        <TabsContent value="worklist" className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search patient, order..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Modality</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                <SelectItem value="CT Scan">CT Scan</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="ECG">ECG</SelectItem>
                <SelectItem value="Echo">Echo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Images Uploaded">Images Uploaded</SelectItem>
                <SelectItem value="Reported">Reported</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Study</th>
                    <th className="px-3 py-2 text-left">Modality</th>
                    <th className="px-3 py-2 text-center">Priority</th>
                    <th className="px-3 py-2 text-center">Images</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={`border-b cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === order.id ? "bg-orange-50" : ""}`} onClick={() => setSelectedOrder(order)}>
                      <td className="px-3 py-2">
                        <p className="font-medium">{order.patientName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.patientId} | {order.age}y/{order.gender}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p>{order.studyName}</p>
                        <p className="text-[10px] text-muted-foreground">Ref: {order.referredBy}</p>
                      </td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{order.modality}</Badge></td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getPriorityColor(order.priority)}`}>{order.priority}</Badge></td>
                      <td className="px-3 py-2 text-center">{order.imageCount > 0 ? order.imageCount : "-"}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getStatusColor(order.status)}`}>{order.status}</Badge></td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {order.imageCount > 0 && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={(e) => { e.stopPropagation(); setActiveTab("viewer"); setSelectedOrder(order); }}><Eye className="h-3 w-3" /></Button>}
                          {order.status === "Images Uploaded" && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={(e) => { e.stopPropagation(); toast.info("Report editor opened"); }}><FileText className="h-3 w-3" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Selected Order Detail */}
          {selectedOrder && selectedOrder.findings && (
            <Card className="border-green-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Report - {selectedOrder.studyName}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid sm:grid-cols-2 gap-2">
                  <p><span className="text-muted-foreground">Patient:</span> <strong>{selectedOrder.patientName}</strong> ({selectedOrder.patientId})</p>
                  <p><span className="text-muted-foreground">Reported By:</span> {selectedOrder.reportedBy}</p>
                </div>
                <div className="border rounded p-2">
                  <p className="font-medium mb-1">Findings:</p>
                  <p className="text-muted-foreground">{selectedOrder.findings}</p>
                </div>
                <div className="border rounded p-2">
                  <p className="font-medium mb-1">Impression:</p>
                  <p>{selectedOrder.impression}</p>
                </div>
                {selectedOrder.aiFindings && (
                  <div className="border border-purple-200 rounded p-2 bg-purple-50">
                    <p className="font-medium mb-1 flex items-center gap-1"><Brain className="h-3 w-3 text-purple-600" /> AI Analysis:</p>
                    <p className="text-purple-700">{selectedOrder.aiFindings}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs"><Printer className="mr-1 h-3 w-3" /> Print</Button>
                  <Button size="sm" variant="outline" className="text-xs"><Download className="mr-1 h-3 w-3" /> PDF</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Image Viewer Tab */}
        <TabsContent value="viewer" className="space-y-3">
          <Card>
            <CardContent className="p-6">
              {selectedOrder && selectedOrder.imageCount > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{selectedOrder.studyName} - {selectedOrder.patientName}</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.modality} | {selectedOrder.imageCount} image(s)</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">Zoom</Button>
                      <Button size="sm" variant="outline" className="text-xs">Measure</Button>
                      <Button size="sm" variant="outline" className="text-xs">Window/Level</Button>
                      <Button size="sm" variant="outline" className="text-xs">Annotate</Button>
                    </div>
                  </div>
                  {/* DICOM Viewer Placeholder */}
                  <div className="bg-black rounded-lg h-[400px] flex items-center justify-center relative">
                    <div className="text-center text-gray-400">
                      <Monitor className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">DICOM Viewer</p>
                      <p className="text-xs mt-1">Images would display here via DICOM/PACS integration</p>
                      <p className="text-[10px] mt-2 text-gray-500">Supports: DICOM, JPEG, PNG | Protocols: WADO-RS, DICOMweb</p>
                    </div>
                    {/* Simulated overlay info */}
                    <div className="absolute top-3 left-3 text-[10px] text-green-400 space-y-0.5">
                      <p>{selectedOrder.patientName}</p>
                      <p>{selectedOrder.patientId} | {selectedOrder.age}y {selectedOrder.gender}</p>
                      <p>{selectedOrder.studyName}</p>
                    </div>
                    <div className="absolute top-3 right-3 text-[10px] text-green-400">
                      <p>{selectedOrder.orderDate}</p>
                      <p>W: 1500 / L: -500</p>
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] text-green-400">
                      <p>Image 1 of {selectedOrder.imageCount}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700"><Brain className="mr-1 h-3 w-3" /> AI Analyze</Button>
                    <Button size="sm" variant="outline"><Upload className="mr-1 h-3 w-3" /> Upload More</Button>
                    <Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> Download DICOM</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a study with images from the worklist to view</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-3">
          <div className="flex items-center justify-between">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Modalities</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                <SelectItem value="CT Scan">CT Scan</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="ECG">ECG</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Template</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <Card key={tpl.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tpl.modality} | {tpl.bodyPart}</p>
                    </div>
                    {tpl.isDefault && <Badge className="bg-green-100 text-green-700 text-[9px]">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground border rounded p-2 bg-gray-50 line-clamp-3">{tpl.content}</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-5 text-[9px]">Edit</Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]">Use</Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]">Duplicate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadiologyModule;
