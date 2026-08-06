import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Monitor, Wrench, Building, Calendar, AlertTriangle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type TestMapping = {
  id: string;
  testName: string;
  resultName: string;
  machineResultName: string;
  qcTestName: string;
  normalValues: string;
  unit: string;
  method: string;
  conversionMultiplier: string;
  roundOff: string;
};

type Machine = {
  id: string;
  location: string;
  name: string;
  code: string;
  make: string;
  model: string;
  department: string;
  testCount: number;
  inactiveThreshold: string;
  status: "active" | "inactive";
  resultNotEditable: boolean;
  autoSendToLims: boolean;
  sampleIdEditable: boolean;
  uploadWorklist: boolean;
  fetchFromFile: boolean;
  antibioticReport: boolean;
  testMappings: TestMapping[];
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  amcVendor: string;
  amcExpiry: string;
  amcCost: number;
  lastService: string;
  nextService: string;
  franchise: string;
  createdBy: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const LOCATIONS = [
  "#11, Main Road, Kadayanallur,",
  "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam",
  "43, Miranda Lane, Old GH Road, Theni",
  "No 47, Kulavanikar Puram Road, , Tirunelveli",
  "4, Durai Samy Nagar, Keelkattalai, Chennai",
  "62 B, Railway Road, , Tenkasi",
];

const DEPARTMENTS = [
  "Laboratory", "Biochemistry", "Hematology", "Microbiology",
  "Radiology", "Cardiology", "AYUSH / Panchakarma",
  "Pharmacy", "OT", "ICU", "Physiotherapy", "Nursing", "General",
];

const INACTIVE_THRESHOLDS = ["30 Minutes", "60 Minutes", "120 Minutes", "240 Minutes", "Never"];

const FRANCHISES = [
  "Al Shifa Ayush Hospital (Main)",
  "Al Shifa Franchise - Rajapalayam",
  "Al Shifa Franchise - Theni",
  "Al Shifa Franchise - Tirunelveli",
  "Al Shifa Franchise - Chennai",
  "Al Shifa Franchise - Tenkasi",
];

const EQUIPMENT_CATEGORIES = [
  "Lab Analyzer", "Imaging / Radiology", "Patient Monitor",
  "Ventilator", "Infusion Pump", "Sterilizer / Autoclave",
  "Panchakarma Equipment", "Physiotherapy Device", "AYUSH Diagnostic",
  "Dental Equipment", "OT Equipment", "Pharmacy (Cold Storage)",
  "IT / Network", "Power Backup", "Other",
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveMachines: Machine[] = [
  { id: "1", location: "#11, Main Road, Kadayanallur,", name: "Sysmex XN-1000", code: "SYS-HEM-001", make: "Sysmex Corporation", model: "XN-1000", department: "Hematology", testCount: 50, inactiveThreshold: "60 Minutes", status: "active", resultNotEditable: false, autoSendToLims: true, sampleIdEditable: true, uploadWorklist: false, fetchFromFile: false, antibioticReport: false, testMappings: [{ id: "t1", testName: "CBC", resultName: "WBC Count", machineResultName: "WBC", qcTestName: "QC-WBC", normalValues: "4000-11000", unit: "/cumm", method: "Flow Cytometry", conversionMultiplier: "1", roundOff: "0" }], serialNumber: "SN-2023-HEM-001", purchaseDate: "15/03/2023", warrantyExpiry: "15/03/2025", amcVendor: "Sysmex India Pvt Ltd", amcExpiry: "15/03/2027", amcCost: 85000, lastService: "10/01/2026", nextService: "10/07/2026", franchise: "Al Shifa Ayush Hospital (Main)", createdBy: "Al Shifa Ayush Hospital" },
  { id: "2", location: "#11, Main Road, Kadayanallur,", name: "Beckman AU480", code: "BCK-BIO-001", make: "Beckman Coulter", model: "AU480", department: "Biochemistry", testCount: 80, inactiveThreshold: "60 Minutes", status: "active", resultNotEditable: false, autoSendToLims: true, sampleIdEditable: true, uploadWorklist: true, fetchFromFile: false, antibioticReport: false, testMappings: [], serialNumber: "SN-2022-BIO-001", purchaseDate: "01/06/2022", warrantyExpiry: "01/06/2024", amcVendor: "Beckman India", amcExpiry: "01/06/2027", amcCost: 120000, lastService: "15/04/2026", nextService: "15/10/2026", franchise: "Al Shifa Ayush Hospital (Main)", createdBy: "Al Shifa Ayush Hospital" },
  { id: "3", location: "#11, Main Road, Kadayanallur,", name: "Nadi Tarangini", code: "NDT-AYU-001", make: "Atreya Innovations", model: "NT-3.0", department: "AYUSH / Panchakarma", testCount: 20, inactiveThreshold: "120 Minutes", status: "active", resultNotEditable: true, autoSendToLims: true, sampleIdEditable: false, uploadWorklist: false, fetchFromFile: true, antibioticReport: false, testMappings: [], serialNumber: "SN-2024-AYU-001", purchaseDate: "10/01/2024", warrantyExpiry: "10/01/2026", amcVendor: "Atreya Innovations Pune", amcExpiry: "10/01/2027", amcCost: 25000, lastService: "05/06/2026", nextService: "05/12/2026", franchise: "Al Shifa Ayush Hospital (Main)", createdBy: "Dr Mohamad Saleem" },
  { id: "4", location: "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam", name: "GE Voluson E10", code: "GE-RAD-001", make: "GE Healthcare", model: "Voluson E10", department: "Radiology", testCount: 30, inactiveThreshold: "120 Minutes", status: "active", resultNotEditable: false, autoSendToLims: false, sampleIdEditable: false, uploadWorklist: false, fetchFromFile: false, antibioticReport: false, testMappings: [], serialNumber: "SN-2023-RAD-001", purchaseDate: "20/08/2023", warrantyExpiry: "20/08/2025", amcVendor: "GE India Service", amcExpiry: "20/08/2026", amcCost: 200000, lastService: "01/03/2026", nextService: "01/09/2026", franchise: "Al Shifa Franchise - Rajapalayam", createdBy: "Al Shifa Ayush Hospital" },
  { id: "5", location: "#11, Main Road, Kadayanallur,", name: "Autoclave (Sterilizer)", code: "ATC-OT-001", make: "Equitron Medica", model: "EQM-450", department: "OT", testCount: 0, inactiveThreshold: "Never", status: "active", resultNotEditable: false, autoSendToLims: false, sampleIdEditable: false, uploadWorklist: false, fetchFromFile: false, antibioticReport: false, testMappings: [], serialNumber: "SN-2021-OT-001", purchaseDate: "01/01/2021", warrantyExpiry: "01/01/2023", amcVendor: "Equitron Service", amcExpiry: "01/01/2027", amcCost: 35000, lastService: "15/05/2026", nextService: "15/11/2026", franchise: "Al Shifa Ayush Hospital (Main)", createdBy: "Al Shifa Ayush Hospital" },
  { id: "6", location: "43, Miranda Lane, Old GH Road, Theni", name: "Physiotherapy TENS Unit", code: "PHY-TENS-001", make: "Techno Health", model: "TH-TENS-4CH", department: "Physiotherapy", testCount: 0, inactiveThreshold: "Never", status: "active", resultNotEditable: false, autoSendToLims: false, sampleIdEditable: false, uploadWorklist: false, fetchFromFile: false, antibioticReport: false, testMappings: [], serialNumber: "SN-2024-PHY-001", purchaseDate: "15/06/2024", warrantyExpiry: "15/06/2026", amcVendor: "Techno Health India", amcExpiry: "15/06/2027", amcCost: 8000, lastService: "01/02/2026", nextService: "01/08/2026", franchise: "Al Shifa Franchise - Theni", createdBy: "Al Shifa Ayush Hospital" },
];

const mockInactiveMachines: Machine[] = [
  { id: "101", location: "#11, Main Road, Kadayanallur,", name: "Old Hematology Analyzer", code: "OLD-HEM-001", make: "Unknown", model: "Old Model", department: "Hematology", testCount: 30, inactiveThreshold: "60 Minutes", status: "inactive", resultNotEditable: false, autoSendToLims: false, sampleIdEditable: false, uploadWorklist: false, fetchFromFile: false, antibioticReport: false, testMappings: [], serialNumber: "OLD-001", purchaseDate: "01/01/2018", warrantyExpiry: "01/01/2020", amcVendor: "-", amcExpiry: "-", amcCost: 0, lastService: "-", nextService: "-", franchise: "Al Shifa Ayush Hospital (Main)", createdBy: "admin" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const MachineMaster = () => {
  const [tab, setTab] = useState<"new" | "manage" | "inactive">("new");
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");

  // Form state
  const [fLocation, setFLocation] = useState(LOCATIONS[0]);
  const [fName, setFName] = useState("");
  const [fCode, setFCode] = useState("");
  const [fMake, setFMake] = useState("");
  const [fModel, setFModel] = useState("");
  const [fDepartment, setFDepartment] = useState("");
  const [fTestCount, setFTestCount] = useState("50");
  const [fThreshold, setFThreshold] = useState("60 Minutes");
  const [fStatus, setFStatus] = useState("active");
  const [fFranchise, setFFranchise] = useState(FRANCHISES[0]);
  const [fSerial, setFSerial] = useState("");
  const [fPurchaseDate, setFPurchaseDate] = useState("");
  const [fWarrantyExpiry, setFWarrantyExpiry] = useState("");
  const [fAmcVendor, setFAmcVendor] = useState("");
  const [fAmcExpiry, setFAmcExpiry] = useState("");
  const [fAmcCost, setFAmcCost] = useState("");
  const [fLastService, setFLastService] = useState("");
  const [fNextService, setFNextService] = useState("");

  // Interface options
  const [fResultNotEditable, setFResultNotEditable] = useState(false);
  const [fAutoSendLims, setFAutoSendLims] = useState(false);
  const [fSampleIdEditable, setFSampleIdEditable] = useState(false);
  const [fUploadWorklist, setFUploadWorklist] = useState(false);
  const [fFetchFromFile, setFFetchFromFile] = useState(false);
  const [fAntibioticReport, setFAntibioticReport] = useState(false);

  // Test Mapping
  const [testMappings, setTestMappings] = useState<TestMapping[]>([]);
  const [tmTestName, setTmTestName] = useState("");
  const [tmResultName, setTmResultName] = useState("");
  const [tmMachineResult, setTmMachineResult] = useState("");
  const [tmQcTest, setTmQcTest] = useState("");
  const [tmNormalValues, setTmNormalValues] = useState("");
  const [tmUnit, setTmUnit] = useState("");
  const [tmMethod, setTmMethod] = useState("");
  const [tmConversion, setTmConversion] = useState("");
  const [tmRoundOff, setTmRoundOff] = useState("");

  // Data
  const [activeMachines] = useState<Machine[]>(mockActiveMachines);
  const [inactiveMachines] = useState<Machine[]>(mockInactiveMachines);

  const handleAddTestMapping = () => {
    if (!tmTestName.trim()) return toast.error("Test Name required");
    setTestMappings([...testMappings, { id: Date.now().toString(), testName: tmTestName, resultName: tmResultName, machineResultName: tmMachineResult, qcTestName: tmQcTest, normalValues: tmNormalValues, unit: tmUnit, method: tmMethod, conversionMultiplier: tmConversion, roundOff: tmRoundOff }]);
    setTmTestName(""); setTmResultName(""); setTmMachineResult(""); setTmQcTest("");
    setTmNormalValues(""); setTmUnit(""); setTmMethod(""); setTmConversion(""); setTmRoundOff("");
  };

  const handleSubmit = () => {
    if (!fName.trim()) return toast.error("Machine Name is required");
    if (!fCode.trim()) return toast.error("Machine Code is required");
    if (!fMake.trim()) return toast.error("Make is required");
    toast.success(`Machine "${fName}" created successfully!`);
  };

  const getFilteredMachines = (data: Machine[]) => {
    let filtered = data;
    if (filterLocation !== "all") filtered = filtered.filter(m => m.location === filterLocation);
    if (search) filtered = filtered.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()) || m.department.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  };

  // AMC Alerts
  const amcAlerts = activeMachines.filter(m => {
    if (!m.amcExpiry || m.amcExpiry === "-") return false;
    const parts = m.amcExpiry.split("/");
    if (parts.length !== 3) return false;
    const expiry = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const diff = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 90;
  });

  // ─── Render New Form ───────────────────────────────────────────────────────
  const renderNewForm = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Machine</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="font-semibold">Location</Label>
              <Select value={fLocation} onValueChange={setFLocation}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Machine Name <span className="text-red-500">*</span></Label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Machine Name" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Machine Code <span className="text-red-500">*</span></Label>
              <Input value={fCode} onChange={e => setFCode(e.target.value)} placeholder="Machine Code" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Make <span className="text-red-500">*</span></Label>
              <Input value={fMake} onChange={e => setFMake(e.target.value)} placeholder="Machine Make" className="mt-1" />
            </div>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="font-semibold">Machine Model <span className="text-red-500">*</span></Label>
              <Input value={fModel} onChange={e => setFModel(e.target.value)} placeholder="Machine Model" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Department</Label>
              <Select value={fDepartment} onValueChange={setFDepartment}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Test Count</Label>
              <Input value={fTestCount} onChange={e => setFTestCount(e.target.value)} type="number" className="mt-1" />
              <p className="text-[10px] text-muted-foreground mt-0.5">Expected Test Count Per Day (For 100% Utilization)</p>
            </div>
            <div>
              <Label className="font-semibold">Inactive Threshold</Label>
              <Select value={fThreshold} onValueChange={setFThreshold}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{INACTIVE_THRESHOLDS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {/* Row 3: Status, Franchise, Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="font-semibold">Status</Label>
              <Select value={fStatus} onValueChange={setFStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Franchise / Branch</Label>
              <Select value={fFranchise} onValueChange={setFFranchise}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FRANCHISES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Serial Number</Label>
              <Input value={fSerial} onChange={e => setFSerial(e.target.value)} placeholder="Serial Number" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Purchase Date</Label>
              <Input type="date" value={fPurchaseDate} onChange={e => setFPurchaseDate(e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* AMC & Warranty Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Wrench className="h-4 w-4 text-orange-500" /> AMC & Warranty Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label className="text-xs">Warranty Expiry</Label><Input type="date" value={fWarrantyExpiry} onChange={e => setFWarrantyExpiry(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">AMC Vendor</Label><Input value={fAmcVendor} onChange={e => setFAmcVendor(e.target.value)} placeholder="Vendor name" className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">AMC Expiry Date</Label><Input type="date" value={fAmcExpiry} onChange={e => setFAmcExpiry(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">AMC Cost (₹/year)</Label><Input type="number" value={fAmcCost} onChange={e => setFAmcCost(e.target.value)} placeholder="Annual cost" className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Last Service Date</Label><Input type="date" value={fLastService} onChange={e => setFLastService(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Next Service Due</Label><Input type="date" value={fNextService} onChange={e => setFNextService(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
            </div>
          </div>

          {/* Machine Interface Operation */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Machine Interface Operation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={fResultNotEditable} onCheckedChange={c => setFResultNotEditable(!!c)} />
                <span className="text-xs">Result Not Editable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={fAutoSendLims} onCheckedChange={c => setFAutoSendLims(!!c)} />
                <span className="text-xs">Auto Send Results from Machine to LIMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={fSampleIdEditable} onCheckedChange={c => setFSampleIdEditable(!!c)} />
                <span className="text-xs">Sample ID Editable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={fUploadWorklist} onCheckedChange={c => setFUploadWorklist(!!c)} />
                <div><span className="text-xs">Uploading Machine Worklist Manually</span><p className="text-[9px] text-muted-foreground">Only, If the machine has that option</p></div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={fFetchFromFile} onCheckedChange={c => setFFetchFromFile(!!c)} />
                <span className="text-xs">Fetch Patient result From file</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={fAntibioticReport} onCheckedChange={c => setFAntibioticReport(!!c)} />
                <span className="text-xs">Antibiotic Susceptibility Report</span>
              </label>
            </div>
          </div>

          {/* Test Mapping */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Test Mapping</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">S.No</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Test Name</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Result Name</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Machine Result Name</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">QC Test Name</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Normal Values</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Unit</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Method</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">Conversion Multiplier</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-orange-600">RoundOff Value</th>
                    <th className="px-2 py-1.5 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {testMappings.map((tm, i) => (
                    <tr key={tm.id} className="border-b"><td className="px-2 py-1">{i+1}</td><td className="px-2 py-1">{tm.testName}</td><td className="px-2 py-1">{tm.resultName}</td><td className="px-2 py-1">{tm.machineResultName}</td><td className="px-2 py-1">{tm.qcTestName}</td><td className="px-2 py-1">{tm.normalValues}</td><td className="px-2 py-1">{tm.unit}</td><td className="px-2 py-1">{tm.method}</td><td className="px-2 py-1">{tm.conversionMultiplier}</td><td className="px-2 py-1">{tm.roundOff}</td><td className="px-2 py-1"><Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-500" onClick={() => setTestMappings(testMappings.filter(t => t.id !== tm.id))}>×</Button></td></tr>
                  ))}
                  <tr>
                    <td className="px-2 py-1">→</td>
                    <td className="px-2 py-1"><Input value={tmTestName} onChange={e => setTmTestName(e.target.value)} placeholder="Test Name" className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmResultName} onChange={e => setTmResultName(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmMachineResult} onChange={e => setTmMachineResult(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmQcTest} onChange={e => setTmQcTest(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmNormalValues} onChange={e => setTmNormalValues(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmUnit} onChange={e => setTmUnit(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmMethod} onChange={e => setTmMethod(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmConversion} onChange={e => setTmConversion(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Input value={tmRoundOff} onChange={e => setTmRoundOff(e.target.value)} className="h-6 text-[10px]" /></td>
                    <td className="px-2 py-1"><Button size="sm" onClick={handleAddTestMapping} className="h-6 bg-teal-600 hover:bg-teal-700 text-white text-[10px] px-2">Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center gap-3 pt-4">
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white px-8">Submit</Button>
            <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-white px-8">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Manage Table ───────────────────────────────────────────────────
  const renderManageTable = (data: Machine[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Machine" : "Manage Inactive Machine"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Location Filter */}
        <div className="flex items-center gap-3">
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-72"><SelectValue placeholder="All Locations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Machine Name</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Machine Code</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Department</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Branch</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">AMC Expiry</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredMachines(data).length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center"><div className="bg-red-100 text-red-600 rounded p-3 text-sm font-medium">Machine not available.!</div></td></tr>
              ) : (
                getFilteredMachines(data).map(m => (
                  <tr key={m.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium text-xs">{m.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{m.code}</td>
                    <td className="px-3 py-2 text-xs">{m.department}</td>
                    <td className="px-3 py-2 text-[10px]">{m.franchise.replace("Al Shifa ", "")}</td>
                    <td className="px-3 py-2 text-xs">
                      {m.amcExpiry !== "-" ? <Badge variant="outline" className="text-[9px]">{m.amcExpiry}</Badge> : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs ${type === "active" ? "text-emerald-600" : "text-red-500"}`}>{m.status}</span>
                      <Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-0.5" />
                    </td>
                    <td className="px-3 py-2 text-xs">{m.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6 text-orange-600" /> Machine Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and configure laboratory analyzers, hospital equipment, and manage AMC across branches & franchise.
          </p>
        </div>
        <Badge variant="secondary">Machines: {activeMachines.length} | Branches: {LOCATIONS.length}</Badge>
      </div>

      {/* Master Setting: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Machine Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                <span className="mr-2">🖥️</span> Manage Machine
              </Button>
            </CardContent>
          </Card>

          {/* Equipment Overview */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Building className="h-3 w-3" /> By Department</p>
            <div className="space-y-1 text-xs">
              {["Hematology", "Biochemistry", "Radiology", "AYUSH / Panchakarma", "OT", "Physiotherapy"].map(dept => {
                const count = activeMachines.filter(m => m.department === dept).length;
                return count > 0 ? (
                  <div key={dept} className="flex justify-between">
                    <span className="text-muted-foreground truncate max-w-[120px]">{dept}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{count}</Badge>
                  </div>
                ) : null;
              })}
            </div>
          </Card>

          {/* AMC Alerts */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> AMC Alerts</p>
            <div className="space-y-1.5 text-[10px]">
              {amcAlerts.length === 0 ? (
                <p className="text-muted-foreground">No AMC expiring within 90 days</p>
              ) : (
                amcAlerts.map(m => (
                  <div key={m.id} className="p-1.5 rounded bg-amber-50 border border-amber-200">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-muted-foreground">AMC expires: {m.amcExpiry}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Service Schedule */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Calendar className="h-3 w-3 text-teal-500" /> Upcoming Service</p>
            <div className="space-y-1.5 text-[10px]">
              {activeMachines.filter(m => m.nextService && m.nextService !== "-").slice(0, 4).map(m => (
                <div key={m.id} className="flex justify-between items-center">
                  <span className="text-muted-foreground truncate max-w-[110px]">{m.name}</span>
                  <Badge variant="outline" className="text-[8px]">{m.nextService}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>New</Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>Manage Machine</Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setTab("inactive")}>Manage Inactive Machine</Button>
          </div>

          {tab === "new" && renderNewForm()}
          {tab === "manage" && renderManageTable(activeMachines, "active")}
          {tab === "inactive" && renderManageTable(inactiveMachines, "inactive")}
        </div>
      </div>
    </div>
  );
};

export default MachineMaster;
