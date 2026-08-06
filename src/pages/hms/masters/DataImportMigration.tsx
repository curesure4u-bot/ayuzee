import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sparkles, Upload, FileSpreadsheet, Database, CheckCircle, AlertTriangle, ArrowRight, Download } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ImportModule = {
  id: string;
  label: string;
  icon: string;
  description: string;
  mandatoryFields: string[];
  optionalFields: string[];
  sampleColumns: string[];
};

type ImportHistory = {
  id: string;
  module: string;
  fileName: string;
  recordsTotal: number;
  recordsSuccess: number;
  recordsFailed: number;
  importedBy: string;
  date: string;
  status: "completed" | "partial" | "failed";
};

// ─── Constants ───────────────────────────────────────────────────────────────
const IMPORT_MODULES: ImportModule[] = [
  { id: "patients", label: "Patients", icon: "🧑‍🤝‍🧑", description: "Import patient demographics, contact, insurance, and registration data", mandatoryFields: ["Name", "Mobile No", "Registration Date"], optionalFields: ["Patient ID", "Gender", "DOB", "Age", "Blood Group", "Email", "Address", "City", "State", "Pincode", "Aadhaar", "ABHA ID", "Insurance", "Credit Provider", "Relationship", "Religion", "Occupation"], sampleColumns: ["Name", "Mobile", "RegDate", "Gender", "DOB", "Age", "BloodGroup", "Email", "Address", "City", "State", "Pin", "Aadhaar"] },
  { id: "pharmacy", label: "Pharmacy / Products", icon: "💊", description: "Import medicine catalogue, stock, pricing, batch, and HSN details", mandatoryFields: ["Product Name", "Product Code", "Category"], optionalFields: ["Generic Name", "Manufacturer", "HSN Code", "MRP", "Purchase Price", "Stock Qty", "Batch No", "Expiry Date", "Rack Location", "Reorder Level", "GST %", "Schedule", "Unit"], sampleColumns: ["ProductName", "Code", "Category", "GenericName", "MRP", "PurchasePrice", "Stock", "Batch", "Expiry", "HSN", "GST"] },
  { id: "treatments", label: "Treatments / Services", icon: "🏥", description: "Import treatment/service master with groups, pricing, and applicable departments", mandatoryFields: ["Treatment Name", "Price"], optionalFields: ["Code", "Group", "Sub Group", "Account Head", "SAC Code", "Applicable For", "Category", "External ID"], sampleColumns: ["TreatmentName", "Code", "Group", "SubGroup", "Price", "SAC", "Category"] },
  { id: "op-visits", label: "OP Visits / Consultations", icon: "📋", description: "Import historical OP visit data with complaints, diagnosis, and prescriptions", mandatoryFields: ["Patient Name/ID", "Visit Date", "Doctor"], optionalFields: ["Complaints", "Diagnosis", "Prescription", "Advice", "Follow-up Date", "Bill Amount", "Payment Mode"], sampleColumns: ["PatientID", "VisitDate", "Doctor", "Complaints", "Diagnosis", "Prescription", "Amount"] },
  { id: "ip-admissions", label: "IP Admissions", icon: "🛏️", description: "Import inpatient admission records with room, treatment, and discharge details", mandatoryFields: ["Patient Name/ID", "Admission Date", "Ward/Room"], optionalFields: ["Discharge Date", "Diagnosis", "Procedures", "Doctor", "Room Type", "Total Bill", "Insurance Claim", "Discharge Summary"], sampleColumns: ["PatientID", "AdmitDate", "DischargeDate", "Ward", "Room", "Doctor", "Diagnosis", "TotalBill"] },
  { id: "investigations", label: "Lab Investigations", icon: "🔬", description: "Import lab test master, packages, normal ranges, and historical results", mandatoryFields: ["Test Name", "Department"], optionalFields: ["Test Code", "Sample Type", "Normal Range", "Unit", "Method", "Price", "TAT", "Machine"], sampleColumns: ["TestName", "Code", "Department", "SampleType", "NormalRange", "Unit", "Price"] },
  { id: "stock", label: "Stock / Inventory", icon: "📦", description: "Import current stock positions, purchase history, and vendor mapping", mandatoryFields: ["Product Name", "Store", "Quantity"], optionalFields: ["Batch No", "Expiry", "Purchase Price", "MRP", "Vendor", "GRN No", "GRN Date"], sampleColumns: ["ProductName", "Store", "Qty", "Batch", "Expiry", "PurchasePrice", "MRP", "Vendor"] },
  { id: "appointments", label: "Appointments", icon: "📅", description: "Import appointment schedule, slot data, and booking history", mandatoryFields: ["Patient Name/ID", "Date", "Doctor"], optionalFields: ["Time", "Status", "Type", "Department", "Notes"], sampleColumns: ["PatientID", "Date", "Time", "Doctor", "Status", "Type"] },
  { id: "billing", label: "Billing / Invoices", icon: "💰", description: "Import historical billing data, payment records, and outstanding dues", mandatoryFields: ["Patient Name/ID", "Bill Date", "Amount"], optionalFields: ["Bill No", "Items", "Discount", "Tax", "Net Amount", "Payment Mode", "Status", "Doctor"], sampleColumns: ["PatientID", "BillNo", "BillDate", "Amount", "Discount", "Tax", "NetAmount", "PaymentMode"] },
  { id: "suppliers", label: "Suppliers / Vendors", icon: "🚚", description: "Import supplier/vendor master with contact, GST, bank, and credit details", mandatoryFields: ["Supplier Name", "Phone"], optionalFields: ["GSTIN", "PAN", "Drug License", "Email", "Address", "City", "State", "Bank", "Account No", "IFSC", "Credit Days"], sampleColumns: ["SupplierName", "Phone", "GSTIN", "PAN", "DrugLicense", "Email", "City", "State"] },
  { id: "doctors", label: "Doctors / Staff", icon: "👨‍⚕️", description: "Import doctor and staff master with qualifications, departments, and schedules", mandatoryFields: ["Name", "Qualification", "Department"], optionalFields: ["Registration No", "Specialization", "Phone", "Email", "Consultation Fee", "Schedule", "Branch"], sampleColumns: ["Name", "Qualification", "RegNo", "Department", "Specialization", "Phone", "Fee"] },
  { id: "panchakarma", label: "Panchakarma Records", icon: "🧘", description: "Import Panchakarma treatment schedules, packages, and patient progress", mandatoryFields: ["Patient Name/ID", "Treatment", "Date"], optionalFields: ["Package", "Therapist", "Duration", "Oil Used", "Notes", "Progress", "Day Number"], sampleColumns: ["PatientID", "Treatment", "Date", "Package", "Therapist", "Duration", "DayNo"] },
];

const LOCATIONS = ["location1 - #11, Main Road, Kadayanallur, .", "location2 - 195, LAKSHMI PURAM STREET, Rajapalayam", "location3 - 43, Miranda Lane, Theni", "location4 - No 47, Kulavanikar Puram Road, Tirunelveli", "location5 - 4, Durai Samy Nagar, Chennai"];

const AI_FEATURES = [
  { label: "Auto Field Mapping", desc: "AI detects column names from CSV and auto-maps to system fields" },
  { label: "Data Validation & Cleanup", desc: "Identifies and fixes phone formats, date formats, duplicate entries, and missing data" },
  { label: "Duplicate Detection", desc: "AI detects existing records by name+phone+DOB and prevents duplicate imports" },
  { label: "Smart Format Conversion", desc: "Auto-converts date formats (DD/MM/YYYY, MM-DD-YYYY, etc.) to system format" },
  { label: "Source System Detection", desc: "AI detects source HMS (MocDoc, eHospital, Practo, etc.) and applies known mappings" },
  { label: "Batch Error Resolution", desc: "Groups similar errors and suggests bulk fixes (e.g., all invalid dates)" },
  { label: "Migration Report Generation", desc: "Auto-generates detailed migration report with success/failure analysis" },
];

const SOURCE_SYSTEMS = ["MocDoc", "eHospital", "Practo", "Lybrate", "ABDM/ABHA", "Custom Excel/CSV", "Other HMS", "Manual Entry"];

const mockHistory: ImportHistory[] = [
  { id: "1", module: "Patients", fileName: "patients_kadayanallur_2024.csv", recordsTotal: 8520, recordsSuccess: 8490, recordsFailed: 30, importedBy: "Admin", date: "15/01/2025", status: "completed" },
  { id: "2", module: "Pharmacy / Products", fileName: "medicine_master_full.csv", recordsTotal: 485, recordsSuccess: 485, recordsFailed: 0, importedBy: "Admin", date: "16/01/2025", status: "completed" },
  { id: "3", module: "Treatments / Services", fileName: "treatments_ayurveda.csv", recordsTotal: 230, recordsSuccess: 228, recordsFailed: 2, importedBy: "Dr Mohamad Saleem", date: "17/01/2025", status: "completed" },
  { id: "4", module: "Suppliers / Vendors", fileName: "vendor_master.csv", recordsTotal: 45, recordsSuccess: 45, recordsFailed: 0, importedBy: "Admin", date: "18/01/2025", status: "completed" },
  { id: "5", module: "OP Visits / Consultations", fileName: "op_history_2023_2024.csv", recordsTotal: 15000, recordsSuccess: 14850, recordsFailed: 150, importedBy: "Admin", date: "20/01/2025", status: "partial" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const DataImportMigration = () => {
  const [step, setStep] = useState<"select" | "upload" | "map" | "review" | "history">("select");
  const [selectedModule, setSelectedModule] = useState<ImportModule | null>(null);
  const [sourceSystem, setSourceSystem] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [csvData, setCsvData] = useState("");
  const [rememberValues, setRememberValues] = useState(false);
  const [enabledAi, setEnabledAi] = useState<string[]>(["Auto Field Mapping", "Data Validation & Cleanup", "Duplicate Detection", "Smart Format Conversion"]);

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const handleModuleSelect = (mod: ImportModule) => { setSelectedModule(mod); setStep("upload"); };
  const handleNextStep = () => {
    if (step === "upload") { if (!csvData.trim()) return toast.error("Paste CSV data or upload a file"); setStep("map"); toast.success("AI is mapping fields..."); }
    else if (step === "map") { setStep("review"); }
  };
  const handleImport = () => { toast.success(`Import started for ${selectedModule?.label}! AI is processing...`); setTimeout(() => { toast.success("Import completed successfully!"); setStep("select"); setCsvData(""); }, 1500); };

  const totalImported = mockHistory.reduce((s, h) => s + h.recordsSuccess, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-orange-600" /> Data Import & Migration</h1><p className="text-sm text-muted-foreground">Import and migrate data from any HMS — Patients, Pharmacy, Treatments, OP/IP, Lab, Billing & more.</p></div>
        <div className="flex gap-2"><Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Migration</Badge><Badge variant="secondary">Imported: {totalImported.toLocaleString("en-IN")} records</Badge></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0"><CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Import Modules</CardTitle></CardHeader>
            <CardContent className="p-1 space-y-0.5">
              {IMPORT_MODULES.map(mod => (
                <Button key={mod.id} variant="ghost" size="sm" className={`w-full justify-start text-xs h-7 px-2 ${selectedModule?.id === mod.id ? "bg-orange-50 text-orange-700 font-semibold" : ""}`} onClick={() => handleModuleSelect(mod)}>
                  <span className="mr-1.5">{mod.icon}</span>{mod.label}
                </Button>
              ))}
              <div className="border-t mt-1 pt-1">
                <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-7 px-2 ${step === "history" ? "bg-orange-50 text-orange-700 font-semibold" : ""}`} onClick={() => setStep("history")}>
                  <span className="mr-1.5">📜</span>Import History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Migration</p>
            <div className="space-y-1 text-[10px]">{AI_FEATURES.map(f => (<label key={f.label} className="flex items-start gap-1.5 cursor-pointer"><input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500 mt-0.5" /><span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span></label>))}</div>
          </Card>

          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2">Source System</p>
            <Select value={sourceSystem} onValueChange={setSourceSystem}><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select source" /></SelectTrigger><SelectContent>{SOURCE_SYSTEMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <p className="text-[9px] text-muted-foreground mt-1">AI uses known mappings from source system for faster import</p>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Step Indicator */}
          {step !== "history" && step !== "select" && (
            <div className="flex items-center gap-2 text-xs">
              <Badge className={step === "upload" ? "bg-orange-500 text-white" : "bg-emerald-100 text-emerald-700"}>1. Upload</Badge><ArrowRight className="h-3 w-3" />
              <Badge className={step === "map" ? "bg-orange-500 text-white" : step === "review" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>2. Map Fields</Badge><ArrowRight className="h-3 w-3" />
              <Badge className={step === "review" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}>3. Review & Import</Badge>
            </div>
          )}

          {/* Module Selection */}
          {step === "select" && (
            <div className="space-y-4">
              <Card className="border-blue-200 bg-blue-50/30"><CardContent className="p-4"><p className="text-sm font-medium text-blue-700">Select a module from the sidebar to start importing data.</p><p className="text-xs text-blue-600 mt-1">Supported formats: CSV, Excel (XLS/XLSX), TSV, or Copy-Paste from spreadsheet. AI will auto-detect columns and map fields.</p></CardContent></Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {IMPORT_MODULES.map(mod => (
                  <Card key={mod.id} className="p-3 cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition" onClick={() => handleModuleSelect(mod)}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{mod.icon}</span><h3 className="font-semibold text-sm">{mod.label}</h3></div>
                    <p className="text-[10px] text-muted-foreground">{mod.description}</p>
                    <div className="mt-2"><Badge variant="outline" className="text-[9px]">Required: {mod.mandatoryFields.join(", ")}</Badge></div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upload Step */}
          {step === "upload" && selectedModule && (
            <Card>
              <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Import {selectedModule.label}</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <Card className="border-teal-200 bg-teal-50/30"><CardContent className="p-3">
                  <p className="text-xs font-medium text-teal-700 cursor-pointer" onClick={() => toast.info(`Fields: ${[...selectedModule.mandatoryFields, ...selectedModule.optionalFields].join(", ")}`)}>
                    ▼ These are the fields should be mapped in the next step.
                  </p>
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                    <p><span className="font-bold text-red-600">Mandatory fields *</span>: ({selectedModule.mandatoryFields.join(", ")})</p>
                    <p>Optional: {selectedModule.optionalFields.slice(0, 8).join(", ")}{selectedModule.optionalFields.length > 8 ? ` +${selectedModule.optionalFields.length - 8} more` : ""}</p>
                  </div>
                </CardContent></Card>

                <div><Label className="font-semibold">Choose Location of AL SHIFA AYUSH HOSPITAL</Label>
                  <Select value={location} onValueChange={setLocation}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
                </div>

                <div><Label className="font-semibold">Copy paste CSV or Text file into this text area</Label>
                  <Textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder={`Paste CSV data here...\n\nExample:\n${selectedModule.sampleColumns.join(",")}\nJohn Doe,9876543210,01/01/2024,...`} className="mt-1 min-h-[200px] font-mono text-xs" />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={rememberValues} onCheckedChange={c => setRememberValues(!!c)} /><span className="text-sm">Remember Values</span></label>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Upload .csv or .xlsx file")}><Upload className="h-3.5 w-3.5 mr-1" />Upload File</Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Sample template downloaded")}><Download className="h-3.5 w-3.5 mr-1" />Download Template</Button>
                </div>

                <div className="flex justify-center pt-2"><Button onClick={handleNextStep} className="bg-orange-500 hover:bg-orange-600 text-white px-10">Next Step (Map fields)</Button></div>
              </CardContent>
            </Card>
          )}

          {/* Map Fields Step */}
          {step === "map" && selectedModule && (
            <Card>
              <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Map Fields - {selectedModule.label}</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded p-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /><p className="text-xs text-purple-700">AI has auto-detected and mapped {selectedModule.mandatoryFields.length + 5} of {selectedModule.mandatoryFields.length + selectedModule.optionalFields.length} fields. Review and adjust below.</p></div>
                <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">CSV Column (Detected)</th><th className="px-3 py-2 text-left font-semibold text-orange-600">→</th><th className="px-3 py-2 text-left font-semibold text-orange-600">System Field</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
                <tbody>{selectedModule.sampleColumns.map((col, i) => (
                  <tr key={col} className="border-b"><td className="px-3 py-2 text-xs font-mono">{col}</td><td className="px-3 py-2"><ArrowRight className="h-3 w-3 text-orange-500" /></td>
                    <td className="px-3 py-2"><Select defaultValue={[...selectedModule.mandatoryFields, ...selectedModule.optionalFields][i] || ""}><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select field" /></SelectTrigger><SelectContent>{[...selectedModule.mandatoryFields, ...selectedModule.optionalFields].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></td>
                    <td className="px-3 py-2"><CheckCircle className="h-4 w-4 text-emerald-500" /></td></tr>
                ))}</tbody></table>
                <div className="flex justify-center gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                  <Button onClick={handleNextStep} className="bg-orange-500 hover:bg-orange-600 text-white px-8">Next (Review)</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review & Import Step */}
          {step === "review" && selectedModule && (
            <Card>
              <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Review & Import - {selectedModule.label}</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="p-3 text-center"><p className="text-lg font-bold">48</p><p className="text-[10px] text-muted-foreground">Total Records</p></Card>
                  <Card className="p-3 text-center"><p className="text-lg font-bold text-emerald-600">45</p><p className="text-[10px] text-muted-foreground">Valid</p></Card>
                  <Card className="p-3 text-center"><p className="text-lg font-bold text-amber-600">2</p><p className="text-[10px] text-muted-foreground">Warnings</p></Card>
                  <Card className="p-3 text-center"><p className="text-lg font-bold text-red-600">1</p><p className="text-[10px] text-muted-foreground">Errors</p></Card>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-3"><p className="text-xs text-amber-700 font-medium"><AlertTriangle className="h-3.5 w-3.5 inline mr-1" />2 records have missing optional fields (Email). 1 record has invalid phone format.</p></div>
                <div className="flex justify-center gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
                  <Button onClick={handleImport} className="bg-teal-600 hover:bg-teal-700 text-white px-10"><Upload className="h-4 w-4 mr-1" />Import</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import History */}
          {step === "history" && (
            <Card>
              <CardHeader className="pb-2 border-b"><CardTitle className="text-base text-center text-primary">Import History</CardTitle></CardHeader>
              <CardContent className="p-4">
                <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-2 py-2 text-left font-semibold text-orange-600">Module</th><th className="px-2 py-2 text-left font-semibold text-orange-600">File</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Total</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Success</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Failed</th><th className="px-2 py-2 text-left font-semibold text-orange-600">By</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Date</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
                <tbody>{mockHistory.map(h => (<tr key={h.id} className="border-b hover:bg-muted/30"><td className="px-2 py-2 text-xs font-medium">{h.module}</td><td className="px-2 py-2 text-[10px] font-mono">{h.fileName}</td><td className="px-2 py-2 text-xs">{h.recordsTotal.toLocaleString()}</td><td className="px-2 py-2 text-xs text-emerald-600">{h.recordsSuccess.toLocaleString()}</td><td className="px-2 py-2 text-xs text-red-600">{h.recordsFailed}</td><td className="px-2 py-2 text-xs">{h.importedBy}</td><td className="px-2 py-2 text-xs">{h.date}</td><td className="px-2 py-2"><Badge className={h.status === "completed" ? "bg-emerald-100 text-emerald-700 text-[9px]" : h.status === "partial" ? "bg-amber-100 text-amber-700 text-[9px]" : "bg-red-100 text-red-700 text-[9px]"}>{h.status}</Badge></td></tr>))}</tbody></table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImportMigration;
