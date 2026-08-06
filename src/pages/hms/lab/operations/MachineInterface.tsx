import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Monitor, Wifi, WifiOff, Settings, RefreshCw, Play, Pause,
  AlertTriangle, CheckCircle2, Clock, Download, Upload,
  Activity, Cpu, Cable, Plus, Trash2, Edit2,
} from "lucide-react";

interface LabMachine {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  department: string;
  protocol: "HL7" | "ASTM" | "Serial" | "TCP/IP" | "File Based";
  connectionType: "Serial (COM)" | "TCP/IP" | "USB" | "File Watch";
  ipAddress?: string;
  port?: number;
  comPort?: string;
  baudRate?: number;
  filePath?: string;
  status: "Online" | "Offline" | "Error" | "Idle" | "Processing";
  autoImport: boolean;
  autoValidate: boolean;
  lastSyncAt?: string;
  lastResultAt?: string;
  todayResults: number;
  errorCount: number;
  tests: string[];
}

interface MachineLog {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: string;
  type: "result" | "error" | "connection" | "sync";
  message: string;
  data?: string;
  status: "success" | "error" | "warning" | "info";
}

const mockMachines: LabMachine[] = [
  {
    id: "m1", name: "Sysmex XN-1000", manufacturer: "Sysmex", model: "XN-1000",
    serialNumber: "SYS-XN-2024-001", department: "HAEMATOLOGY", protocol: "HL7",
    connectionType: "TCP/IP", ipAddress: "192.168.1.101", port: 9100,
    status: "Online", autoImport: true, autoValidate: false,
    lastSyncAt: "2026-07-24 10:15 AM", lastResultAt: "2026-07-24 10:12 AM",
    todayResults: 34, errorCount: 0,
    tests: ["CBC", "ESR", "Reticulocyte Count", "Peripheral Smear"],
  },
  {
    id: "m2", name: "Beckman AU680", manufacturer: "Beckman Coulter", model: "AU680",
    serialNumber: "BCK-AU-2023-045", department: "BIOCHEMISTRY", protocol: "ASTM",
    connectionType: "Serial (COM)", comPort: "COM3", baudRate: 9600,
    status: "Online", autoImport: true, autoValidate: true,
    lastSyncAt: "2026-07-24 10:18 AM", lastResultAt: "2026-07-24 10:16 AM",
    todayResults: 128, errorCount: 1,
    tests: ["RFT", "LFT", "Lipid Profile", "Blood Sugar", "Electrolytes", "Thyroid"],
  },
  {
    id: "m3", name: "Vitros 5600", manufacturer: "Ortho Clinical", model: "5600",
    serialNumber: "OCD-VT-2025-012", department: "BIOCHEMISTRY", protocol: "HL7",
    connectionType: "TCP/IP", ipAddress: "192.168.1.103", port: 5600,
    status: "Idle", autoImport: true, autoValidate: false,
    lastSyncAt: "2026-07-24 09:45 AM", lastResultAt: "2026-07-24 09:30 AM",
    todayResults: 12, errorCount: 0,
    tests: ["HbA1c", "Cardiac Markers", "Hormones"],
  },
  {
    id: "m4", name: "BioMerieux Vitek 2", manufacturer: "BioMerieux", model: "Vitek 2 Compact",
    serialNumber: "BMX-VK-2024-008", department: "MICROBIOLOGY", protocol: "File Based",
    connectionType: "File Watch", filePath: "C:\\Vitek2\\Results\\",
    status: "Processing", autoImport: true, autoValidate: false,
    lastSyncAt: "2026-07-24 10:20 AM", lastResultAt: "2026-07-24 10:05 AM",
    todayResults: 8, errorCount: 0,
    tests: ["Culture & Sensitivity", "Organism Identification", "MIC"],
  },
  {
    id: "m5", name: "Siemens Dimension EXL", manufacturer: "Siemens", model: "Dimension EXL 200",
    serialNumber: "SIE-DIM-2022-034", department: "IMMUNOLOGY", protocol: "ASTM",
    connectionType: "TCP/IP", ipAddress: "192.168.1.105", port: 3000,
    status: "Error", autoImport: true, autoValidate: false,
    lastSyncAt: "2026-07-24 08:30 AM", lastResultAt: "2026-07-24 08:25 AM",
    todayResults: 5, errorCount: 3,
    tests: ["HIV", "HBsAg", "HCV", "Dengue", "Widal"],
  },
];

const mockLogs: MachineLog[] = [
  { id: "l1", machineId: "m2", machineName: "Beckman AU680", timestamp: "2026-07-24 10:16 AM", type: "result", message: "Received results for Patient AL-12543 - RFT (8 parameters)", status: "success" },
  { id: "l2", machineId: "m1", machineName: "Sysmex XN-1000", timestamp: "2026-07-24 10:12 AM", type: "result", message: "Received CBC results for Patient AL-14201", status: "success" },
  { id: "l3", machineId: "m5", machineName: "Siemens Dimension EXL", timestamp: "2026-07-24 10:10 AM", type: "error", message: "Communication timeout - No ACK received within 30s", status: "error" },
  { id: "l4", machineId: "m5", machineName: "Siemens Dimension EXL", timestamp: "2026-07-24 09:55 AM", type: "error", message: "Frame checksum mismatch - packet corrupted", status: "error" },
  { id: "l5", machineId: "m4", machineName: "BioMerieux Vitek 2", timestamp: "2026-07-24 10:05 AM", type: "result", message: "File import: Culture results for 3 patients", status: "success" },
  { id: "l6", machineId: "m2", machineName: "Beckman AU680", timestamp: "2026-07-24 09:50 AM", type: "error", message: "Sample ID mismatch: Machine ID 'S2026045' not found in LIS", status: "warning" },
  { id: "l7", machineId: "m1", machineName: "Sysmex XN-1000", timestamp: "2026-07-24 09:45 AM", type: "connection", message: "Connection re-established after brief disconnect", status: "info" },
  { id: "l8", machineId: "m3", machineName: "Vitros 5600", timestamp: "2026-07-24 09:30 AM", type: "result", message: "Received HbA1c result for Patient AL-15320", status: "success" },
];

const MachineInterface = () => {
  const [machines] = useState<LabMachine[]>(mockMachines);
  const [logs] = useState<MachineLog[]>(mockLogs);
  const [selectedMachine, setSelectedMachine] = useState<LabMachine | null>(null);
  const [activeTab, setActiveTab] = useState("machines");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Online": return <Wifi className="h-4 w-4 text-green-600" />;
      case "Offline": return <WifiOff className="h-4 w-4 text-gray-400" />;
      case "Error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "Processing": return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "Idle": return <Pause className="h-4 w-4 text-amber-500" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online": return "bg-green-100 text-green-700 border-green-300";
      case "Offline": return "bg-gray-100 text-gray-700 border-gray-300";
      case "Error": return "bg-red-100 text-red-700 border-red-300";
      case "Processing": return "bg-blue-100 text-blue-700 border-blue-300";
      case "Idle": return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getLogIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "error": return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "warning": return <AlertTriangle className="h-3 w-3 text-amber-600" />;
      default: return <Activity className="h-3 w-3 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Cpu className="h-5 w-5" /> Machine / Instrument Interface (LIS)
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-1 h-3 w-3" /> Add Machine
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <Wifi className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{machines.filter(m => m.status === "Online").length}</p>
            <p className="text-[10px] text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{machines.filter(m => m.status === "Error").length}</p>
            <p className="text-[10px] text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Download className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{machines.reduce((sum, m) => sum + m.todayResults, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Results Today</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <RefreshCw className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{machines.filter(m => m.status === "Processing").length}</p>
            <p className="text-[10px] text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Monitor className="h-4 w-4 mx-auto text-gray-600" />
            <p className="text-xl font-bold mt-1">{machines.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Machines</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="logs">Communication Logs</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Machines Tab */}
        <TabsContent value="machines" className="space-y-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {machines.map((machine) => (
              <Card key={machine.id} className={`cursor-pointer transition hover:shadow-md ${machine.status === "Error" ? "border-red-300" : ""}`} onClick={() => setSelectedMachine(machine)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(machine.status)}
                      <span className="font-medium text-sm">{machine.name}</span>
                    </div>
                    <Badge className={`text-[10px] ${getStatusColor(machine.status)}`}>{machine.status}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><span className="font-medium text-foreground">Dept:</span> {machine.department}</p>
                    <p><span className="font-medium text-foreground">Protocol:</span> {machine.protocol} | {machine.connectionType}</p>
                    <p><span className="font-medium text-foreground">Connection:</span> {machine.ipAddress ? `${machine.ipAddress}:${machine.port}` : machine.comPort ? `${machine.comPort} @ ${machine.baudRate}` : machine.filePath}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <div className="text-xs">
                      <span className="font-bold text-blue-600">{machine.todayResults}</span> <span className="text-muted-foreground">results today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {machine.autoImport && <Badge variant="outline" className="text-[9px] h-4">Auto</Badge>}
                      {machine.errorCount > 0 && <Badge className="bg-red-100 text-red-700 text-[9px] h-4">{machine.errorCount} err</Badge>}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Last sync: {machine.lastSyncAt || "Never"}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Machine Detail Panel */}
          {selectedMachine && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">{getStatusIcon(selectedMachine.status)} {selectedMachine.name} - Details</span>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedMachine(null)}>×</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <p><strong>Manufacturer:</strong> {selectedMachine.manufacturer}</p>
                    <p><strong>Model:</strong> {selectedMachine.model}</p>
                    <p><strong>Serial:</strong> {selectedMachine.serialNumber}</p>
                    <p><strong>Department:</strong> {selectedMachine.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Protocol:</strong> {selectedMachine.protocol}</p>
                    <p><strong>Connection:</strong> {selectedMachine.connectionType}</p>
                    <p><strong>Last Result:</strong> {selectedMachine.lastResultAt}</p>
                    <p><strong>Today's Count:</strong> {selectedMachine.todayResults}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Mapped Tests:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMachine.tests.map((test, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{test}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2"><Switch checked={selectedMachine.autoImport} /><span>Auto Import</span></div>
                  <div className="flex items-center gap-2"><Switch checked={selectedMachine.autoValidate} /><span>Auto Validate</span></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Sync initiated")}><RefreshCw className="mr-1 h-3 w-3" /> Sync Now</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Test connection successful")}><Cable className="mr-1 h-3 w-3" /> Test Connection</Button>
                  <Button size="sm" variant="outline"><Settings className="mr-1 h-3 w-3" /> Configure</Button>
                  <Button size="sm" variant="outline" className="text-red-600"><Pause className="mr-1 h-3 w-3" /> Disconnect</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Communication Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Filter Machine" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Machines</SelectItem>
                {machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="result">Results</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="connection">Connection</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 text-xs ml-auto" onClick={() => toast.info("Logs refreshed")}><RefreshCw className="mr-1 h-3 w-3" /> Refresh</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className={`flex items-start gap-2 px-3 py-2 border-b text-xs ${log.status === "error" ? "bg-red-50" : log.status === "warning" ? "bg-amber-50" : ""}`}>
                    {getLogIcon(log.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.machineName}</span>
                        <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Global LIS Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Default Protocol</label>
                  <Select defaultValue="HL7">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HL7">HL7 v2.x</SelectItem>
                      <SelectItem value="ASTM">ASTM E1381/E1394</SelectItem>
                      <SelectItem value="FHIR">HL7 FHIR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Result Import Mode</label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto Import</SelectItem>
                      <SelectItem value="manual">Manual Review</SelectItem>
                      <SelectItem value="hybrid">Auto + Flag Abnormals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Connection Timeout (seconds)</label>
                  <Input className="h-8 text-xs" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Retry Attempts</label>
                  <Input className="h-8 text-xs" type="number" defaultValue="3" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Sample ID Format</label>
                  <Select defaultValue="barcode">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barcode">Barcode Number</SelectItem>
                      <SelectItem value="patient">Patient ID</SelectItem>
                      <SelectItem value="order">Order Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Unmatched Result Action</label>
                  <Select defaultValue="hold">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hold">Hold in Queue</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="alert">Alert & Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t text-xs">
                <div className="flex items-center gap-2"><Switch defaultChecked /><span>Enable bidirectional communication</span></div>
                <div className="flex items-center gap-2"><Switch defaultChecked /><span>Auto-send orders to machine</span></div>
                <div className="flex items-center gap-2"><Switch /><span>Critical value SMS alerts</span></div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MachineInterface;
