import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types & Constants ───────────────────────────────────────────────────────
type LabelConfig = { id: string; location: string; hsnCode: string; externalPCode: string; cinNo: string; gstNo: string; tinNo: string; hospitalName: string; address: string; phone: string; email: string; regNo: string; logo: string };

const LOCATIONS = ["Default", "#11, Main Road, Kadayanallur", "195. LAKSHMI PURAM STREET, Rajapalayam", "43, Miranda Lane, Theni", "No 47, Kulavanikar Puram Road, Tirunelveli", "4, Durai Samy Nagar, Chennai"];

const AI_FEATURES = [
  { label: "Auto Label Formatting", desc: "AI auto-formats prescription labels with correct font sizes and spacing" },
  { label: "Multi-Language Label", desc: "Generates labels in patient's preferred language (Tamil/Hindi/English)" },
  { label: "QR Code Integration", desc: "Auto-generates QR codes on labels for digital verification" },
  { label: "Compliance Check", desc: "AI validates all mandatory fields (FSSAI, Drug License, GST) are present on labels" },
  { label: "Smart Barcode Placement", desc: "Optimizes barcode placement for scanner readability on printed labels" },
];

const mockLabels: LabelConfig[] = [
  { id: "1", location: "Default", hsnCode: "3003", externalPCode: "AYZ-DEF", cinNo: "U85110TN2020PTC123456", gstNo: "33AABCS1429B1ZS", tinNo: "33740100124", hospitalName: "Al Shifa Ayush Hospital", address: "#11, Main Road, Kadayanallur - 627751", phone: "04634-123456", email: "info@alshifa-ayush.com", regNo: "TN/MFG/2023/001245", logo: "" },
  { id: "2", location: "#11, Main Road, Kadayanallur", hsnCode: "3003", externalPCode: "AYZ-KDN", cinNo: "U85110TN2020PTC123456", gstNo: "33AABCS1429B1ZS", tinNo: "33740100124", hospitalName: "Al Shifa Ayush Hospital - Kadayanallur", address: "#11, Main Road, Kadayanallur - 627751, Tenkasi Dt", phone: "04634-123456", email: "kdn@alshifa-ayush.com", regNo: "TN/MFG/2023/001245", logo: "" },
  { id: "3", location: "195. LAKSHMI PURAM STREET, Rajapalayam", hsnCode: "3003", externalPCode: "AYZ-RPM", cinNo: "", gstNo: "33AABCS1429B3ZQ", tinNo: "", hospitalName: "Al Shifa Ayush Center - Rajapalayam", address: "195, Lakshmi Puram Street, PACR Salai, Rajapalayam - 626117", phone: "04563-234567", email: "rpm@alshifa-ayush.com", regNo: "TN/RET/2023/005678", logo: "" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const LabelMaster = () => {
  const [liveLabels, setLiveLabels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Auto Label Formatting", "QR Code Integration", "Compliance Check"]);

  useEffect(() => { loadLabels(); }, []);

  const loadLabels = async () => {
    try {
      const { data } = await (supabase as any)
        .from("hms_labels")
        .select("*")
        .eq("is_active", true)
        .order("label_name");
      setLiveLabels(data || []);
    } catch (err) { console.error("Labels load:", err); }
  };
  const [fLocation, setFLocation] = useState("Default");
  const [fHsn, setFHsn] = useState("");
  const [fExtPCode, setFExtPCode] = useState("");
  const [fCin, setFCin] = useState("");
  const [fGst, setFGst] = useState("");
  const [fTin, setFTin] = useState("");
  const [fHospitalName, setFHospitalName] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fRegNo, setFRegNo] = useState("");

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const handleSave = () => { toast.success("Label configuration saved!"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="h-6 w-6 text-orange-600" /> Label Master</h1><p className="text-sm text-muted-foreground">Configure and manage label access permissions, branding, and compliance details per location.</p></div>
        <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Labels</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <div>
          <Card className="p-0"><CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Label Master</CardTitle></CardHeader>
            <CardContent className="p-1"><Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 border border-orange-200"><span className="mr-2">🏷️</span> Manage Label</Button></CardContent></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Features</p>
            <div className="space-y-1 text-[10px]">{AI_FEATURES.map(f => (<label key={f.label} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" /><span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span></label>))}</div></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2">Configured Locations</p><div className="space-y-1 text-xs">{mockLabels.map(l => (<div key={l.id} className="flex justify-between"><span className="text-muted-foreground truncate max-w-[130px]">{l.location}</span><Badge className="bg-emerald-100 text-emerald-700 text-[8px] h-3.5">✓</Badge></div>))}</div></Card>
        </div>
        <div>
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Manage Label</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                <p className="text-xs text-blue-700">ℹ️ Note: Use "Default" as Entity Location if all your entity locations have same label.</p>
                <p className="text-xs text-blue-600">If a particular location has a different label name, then choose that location and change the label.</p>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label className="font-semibold">Location</Label><Select value={fLocation} onValueChange={setFLocation}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="font-semibold">HSN Code</Label><Input value={fHsn} onChange={e => setFHsn(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">External PCode</Label><Input value={fExtPCode} onChange={e => setFExtPCode(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">CIN NO</Label><Input value={fCin} onChange={e => setFCin(e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label className="font-semibold">GST NO</Label><Input value={fGst} onChange={e => setFGst(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">TIN NO</Label><Input value={fTin} onChange={e => setFTin(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">Hospital Name</Label><Input value={fHospitalName} onChange={e => setFHospitalName(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">Reg No / Drug License</Label><Input value={fRegNo} onChange={e => setFRegNo(e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label className="font-semibold">Address</Label><Input value={fAddress} onChange={e => setFAddress(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">Phone</Label><Input value={fPhone} onChange={e => setFPhone(e.target.value)} className="mt-1" /></div>
                <div><Label className="font-semibold">Email</Label><Input value={fEmail} onChange={e => setFEmail(e.target.value)} className="mt-1" /></div>
              </div>
              <div className="flex justify-center pt-2"><Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-10">Save</Button></div>

              {/* Existing Labels Table */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">Configured Labels</h3>
                <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-2 py-2 text-left font-semibold text-orange-600">Location</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Hospital Name</th><th className="px-2 py-2 text-left font-semibold text-orange-600">GST NO</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Drug License</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Phone</th></tr></thead>
                <tbody>{mockLabels.map(l => (<tr key={l.id} className="border-b hover:bg-muted/30"><td className="px-2 py-2 text-xs font-medium">{l.location}</td><td className="px-2 py-2 text-xs">{l.hospitalName}</td><td className="px-2 py-2 font-mono text-[10px]">{l.gstNo}</td><td className="px-2 py-2 text-[10px]">{l.regNo}</td><td className="px-2 py-2 text-xs">{l.phone}</td></tr>))}</tbody></table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LabelMaster;
