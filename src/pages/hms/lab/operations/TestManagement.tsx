import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Download, Printer } from "lucide-react";

// Mock test data matching DocDoc reference
const mockTests = [
  { sNo: 1, code: "T001", name: "CBC (Complete Blood Count)", department: "HAEMATOLOGY", sample: "BLOOD (EDTA)", tat: "2 Hrs", price: 350, status: "Active", createdBy: "ADMIN" },
  { sNo: 2, code: "T002", name: "Blood Sugar Fasting", department: "BIOCHEMISTRY", sample: "SERUM", tat: "1 Hrs", price: 120, status: "Active", createdBy: "ADMIN" },
  { sNo: 3, code: "T003", name: "Blood Sugar PP", department: "BIOCHEMISTRY", sample: "SERUM", tat: "1 Hrs", price: 120, status: "Active", createdBy: "ADMIN" },
  { sNo: 4, code: "T004", name: "HbA1c", department: "BIOCHEMISTRY", sample: "BLOOD (EDTA)", tat: "4 Hrs", price: 450, status: "Active", createdBy: "ADMIN" },
  { sNo: 5, code: "T005", name: "Lipid Profile", department: "BIOCHEMISTRY", sample: "SERUM", tat: "3 Hrs", price: 650, status: "Active", createdBy: "ADMIN" },
  { sNo: 6, code: "T006", name: "Liver Function Test", department: "BIOCHEMISTRY", sample: "SERUM", tat: "4 Hrs", price: 750, status: "Active", createdBy: "ADMIN" },
  { sNo: 7, code: "T007", name: "Kidney Function Test", department: "BIOCHEMISTRY", sample: "SERUM", tat: "4 Hrs", price: 650, status: "Active", createdBy: "ADMIN" },
  { sNo: 8, code: "T008", name: "Thyroid Profile (T3, T4, TSH)", department: "ENDOCRINOLOGY", sample: "SERUM", tat: "6 Hrs", price: 850, status: "Active", createdBy: "ADMIN" },
  { sNo: 9, code: "T009", name: "Urine Routine", department: "CLINICAL PATHOLOGY", sample: "URINE", tat: "1 Hrs", price: 150, status: "Active", createdBy: "ADMIN" },
  { sNo: 10, code: "T010", name: "ESR", department: "HAEMATOLOGY", sample: "BLOOD (EDTA)", tat: "1 Hrs", price: 100, status: "Active", createdBy: "ADMIN" },
  { sNo: 11, code: "T011", name: "Widal Test", department: "SEROLOGY", sample: "SERUM", tat: "2 Hrs", price: 250, status: "Active", createdBy: "ADMIN" },
  { sNo: 12, code: "T012", name: "Blood Culture & Sensitivity", department: "MICROBIOLOGY", sample: "BLOOD", tat: "72 Hrs", price: 1200, status: "Active", createdBy: "ADMIN" },
  { sNo: 13, code: "T013", name: "Urine Culture & Sensitivity", department: "MICROBIOLOGY", sample: "URINE", tat: "48 Hrs", price: 850, status: "Active", createdBy: "ADMIN" },
  { sNo: 14, code: "T014", name: "Prakriti Assessment (AYUSH)", department: "AYUSH", sample: "OTHER SAMPLES", tat: "30 Min", price: 500, status: "Active", createdBy: "ADMIN" },
  { sNo: 15, code: "T015", name: "Nadi Pariksha (AYUSH)", department: "AYUSH", sample: "OTHER SAMPLES", tat: "15 Min", price: 300, status: "Active", createdBy: "ADMIN" },
];

const TestManagement = () => {
  const [view, setView] = useState<"list" | "new">("list");
  const [search, setSearch] = useState("");
  const [tabType, setTabType] = useState<"active" | "inactive">("active");

  const filtered = mockTests.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "new") {
    return <TestForm onBack={() => setView("list")} />;
  }

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setView("new")}>
          <Plus className="mr-1 h-3 w-3" /> New
        </Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Test</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Inactive Test</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Test</h2>
      </div>

      {/* Tabs + Export */}
      <div className="flex items-center justify-between">
        <Tabs value={tabType} onValueChange={(v: any) => setTabType(v)}>
          <TabsList>
            <TabsTrigger value="active" className="bg-orange-600 text-white data-[state=active]:bg-orange-700">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="bg-green-600 text-white data-[state=active]:bg-green-700">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-green-600 text-white text-xs"><Download className="mr-1 h-3 w-3" /> Export As CSV</Button>
          <Button size="sm" variant="outline" className="text-xs"><Printer className="mr-1 h-3 w-3" /> Print By Alphabetical Order</Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">S.No</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Code</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Department</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Sample</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">TAT</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Price</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Created By</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.sNo} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-2">{t.sNo}</td>
                    <td className="px-2 py-2 font-mono">{t.code}</td>
                    <td className="px-2 py-2 font-medium">{t.name}</td>
                    <td className="px-2 py-2">{t.department}</td>
                    <td className="px-2 py-2">{t.sample}</td>
                    <td className="px-2 py-2">{t.tat}</td>
                    <td className="px-2 py-2 text-green-600">₹{t.price}</td>
                    <td className="px-2 py-2"><Badge variant="outline" className="text-green-600 text-[10px]">{t.status}</Badge></td>
                    <td className="px-2 py-2">{t.createdBy}</td>
                    <td className="px-2 py-2"><Button variant="ghost" size="sm" className="h-6 text-xs">Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Test Form Component (matching DocDoc screenshot)
const TestForm = ({ onBack }: { onBack: () => void }) => {
  const [testName, setTestName] = useState("");
  const [loincCode, setLoincCode] = useState("");
  const [cptCode, setCptCode] = useState("");
  const [department, setDepartment] = useState("");
  const [sample, setSample] = useState("");
  const [method, setMethod] = useState("");
  const [tatValue, setTatValue] = useState("60");
  const [tatUnit, setTatUnit] = useState("Min");
  const [price, setPrice] = useState("");
  const [barcodeLength, setBarcodeLength] = useState("8");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onBack}>Back to List</Button>
      </div>
      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Test</h2></div>

      <Card>
        <CardContent className="p-6 space-y-4 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-semibold">LOINC Code</Label><Input placeholder="LOINC Code" value={loincCode} onChange={(e) => setLoincCode(e.target.value)} /></div>
            <div><Label className="text-xs font-semibold">CPT Code</Label><Input placeholder="CPT Code" value={cptCode} onChange={(e) => setCptCode(e.target.value)} /></div>
          </div>

          <div><Label className="text-xs font-semibold text-red-600">Test Name *</Label><Input placeholder="Test Name" value={testName} onChange={(e) => setTestName(e.target.value)} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="haematology">HAEMATOLOGY</SelectItem>
                  <SelectItem value="biochemistry">BIOCHEMISTRY</SelectItem>
                  <SelectItem value="endocrinology">ENDOCRINOLOGY</SelectItem>
                  <SelectItem value="microbiology">MICROBIOLOGY</SelectItem>
                  <SelectItem value="serology">SEROLOGY</SelectItem>
                  <SelectItem value="clinical-pathology">CLINICAL PATHOLOGY</SelectItem>
                  <SelectItem value="ayush">AYUSH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Sample *</Label>
              <Select value={sample} onValueChange={setSample}>
                <SelectTrigger><SelectValue placeholder="Select Sample" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">BLOOD</SelectItem>
                  <SelectItem value="serum">SERUM</SelectItem>
                  <SelectItem value="urine">URINE</SelectItem>
                  <SelectItem value="blood-edta">BLOOD (EDTA)</SelectItem>
                  <SelectItem value="sputum">SPUTUM</SelectItem>
                  <SelectItem value="stool">STOOL</SelectItem>
                  <SelectItem value="csf">CSF</SelectItem>
                  <SelectItem value="other">OTHER SAMPLES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div><Label className="text-xs font-semibold">Method / Technique</Label><Input placeholder="Method" value={method} onChange={(e) => setMethod(e.target.value)} /></div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-red-600">Time Taken(test) *</Label>
              <div className="flex gap-1">
                <Input value={tatValue} onChange={(e) => setTatValue(e.target.value)} className="flex-1" />
                <Select value={tatUnit} onValueChange={setTatUnit}>
                  <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Min">Min</SelectItem>
                    <SelectItem value="Hrs">Hrs</SelectItem>
                    <SelectItem value="Days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-muted-foreground">Avg Amount of Time taken to complete test</span>
            </div>
            <div>
              <Label className="text-xs font-semibold">Standard stat(min)</Label>
              <div className="flex gap-1">
                <Input placeholder="" className="flex-1" />
                <Select defaultValue="Min"><SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Min">Min</SelectItem><SelectItem value="Hrs">Hrs</SelectItem></SelectContent></Select>
              </div>
              <span className="text-xs text-muted-foreground">Avg Amount of Time taken to complete test</span>
            </div>
            <div>
              <Label className="text-xs font-semibold text-red-600">Price *</Label>
              <Input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Sample Quantity</Label>
              <div className="flex gap-1">
                <Input placeholder="" className="flex-1" />
                <span className="self-center text-xs">ml</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Sample Temperature</Label>
              <div className="flex gap-1">
                <Input placeholder="" className="flex-1" />
                <span className="self-center text-xs">°c</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-red-600">Barcode Length *</Label>
            <Input value={barcodeLength} onChange={(e) => setBarcodeLength(e.target.value)} className="max-w-[100px]" />
            <span className="text-xs text-muted-foreground ml-2">Sample length</span>
          </div>

          {/* Parameters Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Test Parameters</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left">Parameter Name</th>
                    <th className="px-2 py-2 text-left">Unit</th>
                    <th className="px-2 py-2 text-left">Method</th>
                    <th className="px-2 py-2 text-left">Normal Range (M)</th>
                    <th className="px-2 py-2 text-left">Normal Range (F)</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Parameter name" /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Unit" /></td>
                    <td className="px-1 py-1">
                      <Select><SelectTrigger className="h-7 text-xs w-20"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Numeric">Numeric</SelectItem>
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="Options">Options</SelectItem>
                          <SelectItem value="Formula">Formula</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Low - High" /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Low - High" /></td>
                    <td className="px-1 py-1"><Button size="sm" className="h-7 bg-blue-600 text-xs">Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Price notice */}
          <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-700">
            Profile price detail to be updated only in rate plan price setter
          </div>

          <Button onClick={() => { toast.success("Test saved"); onBack(); }} className="bg-red-600 hover:bg-red-700">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestManagement;
