import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search, FlaskConical, CheckCircle2, AlertTriangle, Save,
  SendHorizonal, RotateCcw, Printer, Brain, Clock, User,
} from "lucide-react";

interface ResultParameter {
  id: string;
  parameterName: string;
  unit: string;
  method: string;
  normalLow: number | null;
  normalHigh: number | null;
  normalText: string;
  value: string;
  flag: "Normal" | "Low" | "High" | "Critical Low" | "Critical High" | "";
  isAbnormal: boolean;
  isCritical: boolean;
  previousValue?: string;
  previousDate?: string;
  comment: string;
}

interface PendingOrder {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  testName: string;
  sampleId: string;
  sampleCollectedAt: string;
  priority: "Routine" | "Urgent" | "STAT";
  status: "Sample Collected" | "In Progress";
  parameters: ResultParameter[];
}

const mockPendingOrders: PendingOrder[] = [
  {
    id: "1",
    orderNo: "ORD-2026-0047",
    patientId: "AL-12543",
    patientName: "Mr. Rajesh Kumar",
    age: 52,
    gender: "Male",
    testName: "Renal Function Test (RFT)",
    sampleId: "260200100000024",
    sampleCollectedAt: "2026-07-24 08:30 AM",
    priority: "Urgent",
    status: "Sample Collected",
    parameters: [
      { id: "p1", parameterName: "Blood Urea", unit: "mg/dL", method: "Numeric", normalLow: 15, normalHigh: 40, normalText: "15-40 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "38", previousDate: "2026-04-15", comment: "" },
      { id: "p2", parameterName: "Serum Creatinine", unit: "mg/dL", method: "Numeric", normalLow: 0.7, normalHigh: 1.3, normalText: "0.7-1.3 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "2.1", previousDate: "2026-04-15", comment: "" },
      { id: "p3", parameterName: "BUN", unit: "mg/dL", method: "Numeric", normalLow: 7, normalHigh: 20, normalText: "7-20 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "25", previousDate: "2026-04-15", comment: "" },
      { id: "p4", parameterName: "Uric Acid", unit: "mg/dL", method: "Numeric", normalLow: 3.5, normalHigh: 7.2, normalText: "3.5-7.2 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "6.8", previousDate: "2026-04-15", comment: "" },
      { id: "p5", parameterName: "Sodium", unit: "mEq/L", method: "Numeric", normalLow: 136, normalHigh: 145, normalText: "136-145 mEq/L", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "140", previousDate: "2026-04-15", comment: "" },
      { id: "p6", parameterName: "Potassium", unit: "mEq/L", method: "Numeric", normalLow: 3.5, normalHigh: 5.5, normalText: "3.5-5.5 mEq/L", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "5.8", previousDate: "2026-04-15", comment: "" },
      { id: "p7", parameterName: "Chloride", unit: "mEq/L", method: "Numeric", normalLow: 98, normalHigh: 106, normalText: "98-106 mEq/L", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "101", previousDate: "2026-04-15", comment: "" },
      { id: "p8", parameterName: "Calcium", unit: "mg/dL", method: "Numeric", normalLow: 8.5, normalHigh: 10.5, normalText: "8.5-10.5 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "9.2", previousDate: "2026-04-15", comment: "" },
    ],
  },
  {
    id: "2",
    orderNo: "ORD-2026-0048",
    patientId: "AL-14201",
    patientName: "Mrs. Lakshmi Devi",
    age: 45,
    gender: "Female",
    testName: "Complete Blood Count (CBC)",
    sampleId: "260200100000025",
    sampleCollectedAt: "2026-07-24 09:15 AM",
    priority: "Routine",
    status: "Sample Collected",
    parameters: [
      { id: "p9", parameterName: "Hemoglobin", unit: "g/dL", method: "Numeric", normalLow: 12, normalHigh: 16, normalText: "12-16 g/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "10.5", previousDate: "2026-06-01", comment: "" },
      { id: "p10", parameterName: "RBC Count", unit: "million/μL", method: "Numeric", normalLow: 3.8, normalHigh: 5.1, normalText: "3.8-5.1 million/μL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "3.9", previousDate: "2026-06-01", comment: "" },
      { id: "p11", parameterName: "WBC Count", unit: "/μL", method: "Numeric", normalLow: 4000, normalHigh: 11000, normalText: "4000-11000 /μL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "7500", previousDate: "2026-06-01", comment: "" },
      { id: "p12", parameterName: "Platelet Count", unit: "lakhs/μL", method: "Numeric", normalLow: 1.5, normalHigh: 4.0, normalText: "1.5-4.0 lakhs/μL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "2.8", previousDate: "2026-06-01", comment: "" },
      { id: "p13", parameterName: "PCV/Hematocrit", unit: "%", method: "Numeric", normalLow: 36, normalHigh: 46, normalText: "36-46 %", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "34", previousDate: "2026-06-01", comment: "" },
      { id: "p14", parameterName: "MCV", unit: "fL", method: "Numeric", normalLow: 80, normalHigh: 100, normalText: "80-100 fL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "78", previousDate: "2026-06-01", comment: "" },
      { id: "p15", parameterName: "MCH", unit: "pg", method: "Numeric", normalLow: 27, normalHigh: 32, normalText: "27-32 pg", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "26", previousDate: "2026-06-01", comment: "" },
      { id: "p16", parameterName: "MCHC", unit: "g/dL", method: "Numeric", normalLow: 32, normalHigh: 36, normalText: "32-36 g/dL", value: "", flag: "", isAbnormal: false, isCritical: false, previousValue: "33", previousDate: "2026-06-01", comment: "" },
    ],
  },
  {
    id: "3",
    orderNo: "ORD-2026-0049",
    patientId: "AL-15320",
    patientName: "Mr. Suresh Babu",
    age: 38,
    gender: "Male",
    testName: "Lipid Profile",
    sampleId: "260200100000026",
    sampleCollectedAt: "2026-07-24 09:45 AM",
    priority: "STAT",
    status: "In Progress",
    parameters: [
      { id: "p17", parameterName: "Total Cholesterol", unit: "mg/dL", method: "Numeric", normalLow: null, normalHigh: 200, normalText: "<200 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, comment: "" },
      { id: "p18", parameterName: "Triglycerides", unit: "mg/dL", method: "Numeric", normalLow: null, normalHigh: 150, normalText: "<150 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, comment: "" },
      { id: "p19", parameterName: "HDL Cholesterol", unit: "mg/dL", method: "Numeric", normalLow: 40, normalHigh: null, normalText: ">40 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, comment: "" },
      { id: "p20", parameterName: "LDL Cholesterol", unit: "mg/dL", method: "Numeric", normalLow: null, normalHigh: 100, normalText: "<100 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, comment: "" },
      { id: "p21", parameterName: "VLDL", unit: "mg/dL", method: "Numeric", normalLow: null, normalHigh: 30, normalText: "<30 mg/dL", value: "", flag: "", isAbnormal: false, isCritical: false, comment: "" },
      { id: "p22", parameterName: "TC/HDL Ratio", unit: "", method: "Numeric", normalLow: null, normalHigh: 4.5, normalText: "<4.5", value: "", flag: "", isAbnormal: false, isCritical: false, comment: "" },
    ],
  },
];

const ResultEntry = () => {
  const [orders, setOrders] = useState<PendingOrder[]>(mockPendingOrders);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const filteredOrders = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.sampleId.includes(search)
  );

  const getFlag = (value: string, normalLow: number | null, normalHigh: number | null): { flag: ResultParameter["flag"]; isAbnormal: boolean; isCritical: boolean } => {
    const num = parseFloat(value);
    if (isNaN(num)) return { flag: "", isAbnormal: false, isCritical: false };

    if (normalLow !== null && num < normalLow * 0.5) return { flag: "Critical Low", isAbnormal: true, isCritical: true };
    if (normalHigh !== null && num > normalHigh * 2) return { flag: "Critical High", isAbnormal: true, isCritical: true };
    if (normalLow !== null && num < normalLow) return { flag: "Low", isAbnormal: true, isCritical: false };
    if (normalHigh !== null && num > normalHigh) return { flag: "High", isAbnormal: true, isCritical: false };
    return { flag: "Normal", isAbnormal: false, isCritical: false };
  };

  const handleValueChange = (paramId: string, value: string) => {
    if (!selectedOrder) return;
    setSelectedOrder({
      ...selectedOrder,
      parameters: selectedOrder.parameters.map((p) => {
        if (p.id !== paramId) return p;
        const { flag, isAbnormal, isCritical } = getFlag(value, p.normalLow, p.normalHigh);
        return { ...p, value, flag, isAbnormal, isCritical };
      }),
    });
  };

  const handleCommentChange = (paramId: string, comment: string) => {
    if (!selectedOrder) return;
    setSelectedOrder({
      ...selectedOrder,
      parameters: selectedOrder.parameters.map((p) =>
        p.id === paramId ? { ...p, comment } : p
      ),
    });
  };

  const handleSaveDraft = () => {
    if (!selectedOrder) return;
    setOrders(orders.map((o) => (o.id === selectedOrder.id ? { ...selectedOrder, status: "In Progress" } : o)));
    toast.success("Results saved as draft");
  };

  const handleSubmitForValidation = () => {
    if (!selectedOrder) return;
    const emptyParams = selectedOrder.parameters.filter((p) => !p.value);
    if (emptyParams.length > 0) {
      toast.error(`${emptyParams.length} parameter(s) have no values. Please fill all before submitting.`);
      return;
    }
    const criticalParams = selectedOrder.parameters.filter((p) => p.isCritical);
    if (criticalParams.length > 0) {
      toast.warning(`${criticalParams.length} critical value(s) detected. Pathologist notified for urgent review.`);
    }
    setOrders(orders.filter((o) => o.id !== selectedOrder.id));
    setSelectedOrder(null);
    toast.success("Results submitted for pathologist validation");
  };

  const handleValidateAndApprove = () => {
    if (!selectedOrder) return;
    const emptyParams = selectedOrder.parameters.filter((p) => !p.value);
    if (emptyParams.length > 0) {
      toast.error(`${emptyParams.length} parameter(s) have no values.`);
      return;
    }
    setOrders(orders.filter((o) => o.id !== selectedOrder.id));
    setSelectedOrder(null);
    toast.success("Results validated and approved. Report ready for dispatch.");
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case "Critical High":
      case "Critical Low":
        return "bg-red-600 text-white";
      case "High":
        return "bg-red-100 text-red-700 border-red-300";
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Normal":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "STAT": return "bg-red-600 text-white";
      case "Urgent": return "bg-amber-500 text-white";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <FlaskConical className="h-5 w-5" /> Result Entry & Validation
        </h2>
        <Badge variant="outline" className="text-green-600 border-green-300">
          {orders.length} Pending
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left Panel - Pending Orders */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search patient, order, sample..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="HAEMATOLOGY">Haematology</SelectItem>
                <SelectItem value="BIOCHEMISTRY">Biochemistry</SelectItem>
                <SelectItem value="MICROBIOLOGY">Microbiology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`cursor-pointer transition hover:border-orange-300 ${selectedOrder?.id === order.id ? "border-orange-500 bg-orange-50" : ""}`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{order.patientName}</span>
                    <Badge className={`text-[10px] ${getPriorityColor(order.priority)}`}>{order.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.testName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{order.orderNo}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {order.sampleCollectedAt.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Sample: {order.sampleId}</span>
                    <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No pending orders</p>
            )}
          </div>
        </div>

        {/* Right Panel - Result Entry Form */}
        <div className="lg:col-span-2">
          {!selectedOrder ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select an order from the left panel to enter results</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Patient Info Header */}
              <Card className="border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{selectedOrder.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedOrder.patientId} | {selectedOrder.age}y / {selectedOrder.gender} | {selectedOrder.testName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getPriorityColor(selectedOrder.priority)}`}>{selectedOrder.priority}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">Order: {selectedOrder.orderNo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parameters Entry Table */}
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Parameter</th>
                        <th className="px-3 py-2 text-left font-semibold w-[120px]">Result</th>
                        <th className="px-3 py-2 text-left font-semibold">Unit</th>
                        <th className="px-3 py-2 text-left font-semibold">Normal Range</th>
                        <th className="px-3 py-2 text-left font-semibold">Flag</th>
                        <th className="px-3 py-2 text-left font-semibold">Previous</th>
                        <th className="px-3 py-2 text-left font-semibold">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.parameters.map((param) => {
                        const delta = param.previousValue && param.value
                          ? ((parseFloat(param.value) - parseFloat(param.previousValue)) / parseFloat(param.previousValue) * 100).toFixed(1)
                          : null;
                        return (
                          <tr key={param.id} className={`border-b ${param.isCritical ? "bg-red-50" : param.isAbnormal ? "bg-amber-50" : ""}`}>
                            <td className="px-3 py-2 font-medium">{param.parameterName}</td>
                            <td className="px-3 py-2">
                              <Input
                                className={`h-7 text-xs w-[100px] ${param.isCritical ? "border-red-500 bg-red-50" : param.isAbnormal ? "border-amber-400" : ""}`}
                                value={param.value}
                                onChange={(e) => handleValueChange(param.id, e.target.value)}
                                placeholder="Enter"
                              />
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{param.unit}</td>
                            <td className="px-3 py-2 text-muted-foreground">{param.normalText}</td>
                            <td className="px-3 py-2">
                              {param.flag && (
                                <Badge className={`text-[10px] ${getFlagColor(param.flag)}`}>{param.flag}</Badge>
                              )}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {param.previousValue ? (
                                <span>{param.previousValue} <span className="text-[10px]">({param.previousDate})</span></span>
                              ) : "-"}
                            </td>
                            <td className="px-3 py-2">
                              {delta !== null && (
                                <span className={`text-[10px] font-medium ${parseFloat(delta) > 0 ? "text-red-600" : parseFloat(delta) < 0 ? "text-blue-600" : "text-green-600"}`}>
                                  {parseFloat(delta) > 0 ? "+" : ""}{delta}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs font-semibold">Technician Notes / Comments</p>
                  <Textarea
                    className="text-xs min-h-[60px]"
                    placeholder="Add notes about sample quality, interferences, repeat requests, etc."
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                  />
                  <div className="flex gap-2 flex-wrap text-[10px]">
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setTechnicianNotes(technicianNotes + " Slightly hemolysed sample.")}>+ Hemolysed</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setTechnicianNotes(technicianNotes + " Lipemic sample.")}>+ Lipemic</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setTechnicianNotes(technicianNotes + " Icteric sample.")}>+ Icteric</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setTechnicianNotes(technicianNotes + " Sample re-run performed.")}>+ Re-run</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setTechnicianNotes(technicianNotes + " QC passed before run.")}>+ QC OK</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  <Save className="mr-1 h-3 w-3" /> Save Draft
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmitForValidation}>
                  <SendHorizonal className="mr-1 h-3 w-3" /> Submit for Validation
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleValidateAndApprove}>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Validate & Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info("AI interpretation triggered")}>
                  <Brain className="mr-1 h-3 w-3" /> AI Interpret
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedOrder({ ...selectedOrder, parameters: selectedOrder.parameters.map(p => ({ ...p, value: "", flag: "", isAbnormal: false, isCritical: false })) }); setTechnicianNotes(""); }}>
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset All
                </Button>
              </div>

              {/* Critical Alert Banner */}
              {selectedOrder.parameters.some((p) => p.isCritical) && (
                <Card className="border-red-400 bg-red-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Critical Values Detected!</span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {selectedOrder.parameters.filter((p) => p.isCritical).map((p) => (
                        <li key={p.id} className="text-xs text-red-600">
                          • {p.parameterName}: {p.value} {p.unit} ({p.flag})
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-red-600 mt-1">Immediate notification will be sent to treating physician upon submission.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultEntry;
