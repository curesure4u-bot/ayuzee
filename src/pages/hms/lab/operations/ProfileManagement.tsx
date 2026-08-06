import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, Download, Printer } from "lucide-react";

const mockProfiles = [
  { sNo: 1, code: "PR001", name: "Complete Blood Count (CBC)", sac: "", tests: "Hb, WBC, RBC, Platelets, PCV, MCV, MCH, MCHC", tat: "2 Hrs", status: "Active", createdBy: "ADMIN" },
  { sNo: 2, code: "PR002", name: "Lipid Profile", sac: "", tests: "Total Cholesterol, Triglycerides, HDL, LDL, VLDL", tat: "3 Hrs", status: "Active", createdBy: "ADMIN" },
  { sNo: 3, code: "PR003", name: "Liver Function Test (LFT)", sac: "", tests: "Bilirubin, SGOT, SGPT, ALP, Total Protein, Albumin, Globulin", tat: "4 Hrs", status: "Active", createdBy: "ADMIN" },
  { sNo: 4, code: "PR004", name: "Kidney Function Test (KFT/RFT)", sac: "", tests: "Urea, Creatinine, Uric Acid, BUN, Electrolytes", tat: "4 Hrs", status: "Active", createdBy: "ADMIN" },
  { sNo: 5, code: "PR005", name: "Thyroid Profile", sac: "", tests: "T3, T4, TSH", tat: "6 Hrs", status: "Active", createdBy: "ADMIN" },
  { sNo: 6, code: "PR006", name: "Diabetic Profile", sac: "", tests: "FBS, PPBS, HbA1c, Fasting Insulin", tat: "4 Hrs", status: "Active", createdBy: "ADMIN" },
  { sNo: 7, code: "PR007", name: "AYUSH Wellness Panel", sac: "", tests: "Prakriti, Nadi Pariksha, Agni Assessment, Dosha Analysis", tat: "45 Min", status: "Active", createdBy: "ADMIN" },
];

const ProfileManagement = () => {
  const [view, setView] = useState<"list" | "new">("list");
  const [search, setSearch] = useState("");

  const filtered = mockProfiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "new") return <ProfileForm onBack={() => setView("list")} />;

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setView("new")}><Plus className="mr-1 h-3 w-3" /> New</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Profile</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Inactive Profile</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage Profile</h2></div>

      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline" className="bg-green-600 text-white text-xs"><Download className="mr-1 h-3 w-3" /> Export As CSV</Button>
        <Button size="sm" variant="outline" className="text-xs"><Printer className="mr-1 h-3 w-3" /> Print By Alphabetical Order</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div>
        <div className="relative w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">S.No</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Code</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">SAC</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Tests</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">TAT(Unit)</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Status</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Created By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.sNo} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-2">{p.sNo}</td>
                    <td className="px-2 py-2 font-mono">{p.code}</td>
                    <td className="px-2 py-2 font-medium">{p.name}</td>
                    <td className="px-2 py-2">{p.sac}</td>
                    <td className="px-2 py-2 max-w-[200px] truncate">{p.tests}</td>
                    <td className="px-2 py-2">{p.tat}</td>
                    <td className="px-2 py-2"><Badge variant="outline" className="text-green-600 text-[10px]">{p.status}</Badge></td>
                    <td className="px-2 py-2">{p.createdBy}</td>
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

// Profile Form (matching DocDoc reference)
const ProfileForm = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="space-y-4">
      <Button size="sm" variant="outline" onClick={onBack}>Back to List</Button>
      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Profile</h2></div>

      <Card>
        <CardContent className="p-6 space-y-4 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-semibold">LOINC Code</Label><Input placeholder="LOINC Code" /></div>
            <div><Label className="text-xs font-semibold">CPT Code</Label><Input placeholder="CPT Code" /></div>
          </div>
          <div><Label className="text-xs font-semibold text-red-600">Profile Name *</Label><Input placeholder="Profile Name" /></div>
          <div><Label className="text-xs font-semibold">Short Name</Label><Input placeholder="Short Name" /></div>
          <div><Label className="text-xs font-semibold">SAC</Label><Input placeholder="SAC" /></div>
          <div><Label className="text-xs font-semibold">External Test ID</Label><Input placeholder="Put Test Id" /></div>

          {/* Profile Options */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Profile Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2"><Checkbox id="sepPrint" /><Label htmlFor="sepPrint" className="text-xs">Separate Print</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="showPrice" /><Label htmlFor="showPrice" className="text-xs">Show Price</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="enableBiopsy" /><Label htmlFor="enableBiopsy" className="text-xs">Enable Biopsy</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="obgRate" /><Label htmlFor="obgRate" className="text-xs">OBGRate</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="autoResult" /><Label htmlFor="autoResult" className="text-xs">Enable Auto Result At Approval</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="autoSms" /><Label htmlFor="autoSms" className="text-xs">Enable Auto SMS At Approval</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="autoWhatsapp" /><Label htmlFor="autoWhatsapp" className="text-xs">Enable Auto Whatsapp At Approval</Label></div>
            </div>
          </div>

          {/* Select Tests */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Select Test(s)</h3>
            <div className="flex gap-2">
              <Input placeholder="Type to Search" className="flex-1" />
              <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> Add</Button>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold mb-2">Selected Tests</p>
              <table className="w-full text-xs border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-1 text-left">#</th>
                    <th className="px-2 py-1 text-left text-orange-600">Test</th>
                    <th className="px-2 py-1 text-left text-orange-600">Order</th>
                    <th className="px-2 py-1 text-left text-orange-600">Price</th>
                    <th className="px-2 py-1 text-left text-green-600">Avoid Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={5} className="px-2 py-4 text-center text-muted-foreground">Add Tests(s)</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Outsourcing */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Outsourcing Information</h3>
            <div className="flex items-center gap-2"><Checkbox id="outsourced" /><Label htmlFor="outsourced" className="text-xs">Check if this is Outsourced Test</Label></div>
          </div>

          {/* Instructions & Interpretation */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">General Information</h3>
            <div><Label className="text-xs font-semibold">Instruction :</Label><Textarea rows={3} placeholder="Instructions..." /></div>
            <div className="mt-3"><Label className="text-xs font-semibold">Interpretation :</Label><Textarea rows={3} placeholder="Interpretation..." /></div>
          </div>

          {/* Status & Config */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <Label className="text-xs font-semibold text-red-600">Status *</Label>
              <Select defaultValue="Active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
            <div><Label className="text-xs font-semibold text-red-600">Barcode Length *</Label><Input defaultValue="8" className="max-w-[100px]" /><span className="text-xs text-muted-foreground ml-2">Sample length</span></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-red-600">Time Taken(test) *</Label>
              <div className="flex gap-1"><Input defaultValue="60" className="flex-1" /><span className="self-center text-xs">Unit</span><Select defaultValue="Min"><SelectTrigger className="w-[60px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Min">Min</SelectItem><SelectItem value="Hrs">Hrs</SelectItem></SelectContent></Select></div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Sample Quantity</Label>
              <div className="flex gap-1"><Input placeholder="" className="flex-1" /><span className="self-center text-xs">Unit</span><span className="self-center text-xs">ml</span></div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Sample Temperature</Label>
              <div className="flex gap-1"><Input placeholder="" className="flex-1" /><span className="self-center text-xs">Unit</span><span className="self-center text-xs">°c</span></div>
            </div>
          </div>

          {/* Price note */}
          <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-700">
            Profile price detail to be updated only in rate plan price setter
          </div>

          <Button onClick={() => { toast.success("Profile saved"); onBack(); }} className="bg-red-600 hover:bg-red-700">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
