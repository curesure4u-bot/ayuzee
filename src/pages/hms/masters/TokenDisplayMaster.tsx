import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Sparkles, Monitor, Search } from "lucide-react";

// ─── Types & Constants ───────────────────────────────────────────────────────
type TokenDisplay = { id: string; display: string; location: string; layout: string; drList: string; department: string; voice: string; status: "active" | "inactive"; createdBy: string };

const LOCATIONS = ["#11, Main Road, Kadayanallur, .", "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam", "43, Miranda Lane, Old GH Road, Theni", "No 47, Kulavanikar Puram Road, , Tirunelveli", "4, Durai Samy Nagar, Keelkattalai, Chennai"];
const LAYOUTS = ["One Column", "Two Column", "Three Column", "Grid (2x2)", "Full Screen Single"];
const DEPARTMENTS = ["OPD", "Lab", "Pharmacy", "Panchakarma", "Radiology", "Billing", "All"];
const VOICES = ["Select lang", "Tamil", "English", "Hindi", "Malayalam", "Telugu", "Silent"];

const AI_FEATURES = [
  { label: "Smart Queue Prediction", desc: "AI predicts wait time and displays estimated time to patients" },
  { label: "Auto Priority Escalation", desc: "Flags patients waiting beyond threshold and escalates token" },
  { label: "Dynamic Content Rotation", desc: "AI rotates health tips, offers, and announcements on idle screens" },
  { label: "Voice Announcement AI", desc: "AI-powered multilingual voice calling with correct pronunciation" },
];

const mockDisplays: TokenDisplay[] = [
  { id: "1", display: "OPD-TV-1", location: "#11, Main Road, Kadayanallur, .", layout: "Two Column", drList: "Dr Mohamad Saleem, Dr Yeshu Priya", department: "OPD", voice: "Tamil", status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "2", display: "LAB-TV-1", location: "#11, Main Road, Kadayanallur, .", layout: "One Column", drList: "", department: "Lab", voice: "English", status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "3", display: "PHARMA-TV-1", location: "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam", layout: "One Column", drList: "", department: "Pharmacy", voice: "Tamil", status: "active", createdBy: "Al Shifa Ayush Hospital" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const TokenDisplayMaster = () => {
  const [tab, setTab] = useState<"new" | "manage">("new");
  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Smart Queue Prediction", "Voice Announcement AI"]);
  const [fLocation, setFLocation] = useState(LOCATIONS[0]);
  const [fDisplay, setFDisplay] = useState("");
  const [fLayout, setFLayout] = useState("One Column");
  const [fDept, setFDept] = useState("Lab");
  const [fVoice, setFVoice] = useState("Select lang");

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const handleSubmit = () => { if (!fDisplay.trim()) return toast.error("Display URI is required"); toast.success("Token Display created!"); setFDisplay(""); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Monitor className="h-6 w-6 text-orange-600" /> Token Display Master</h1><p className="text-sm text-muted-foreground">Customize token screen display content for waiting room TVs.</p></div>
        <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Queue</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <div>
          <Card className="p-0"><CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Token Display Master</CardTitle></CardHeader>
            <CardContent className="p-1"><Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 border border-orange-200"><span className="mr-2">🖥️</span> Manage Token Display</Button></CardContent></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Features</p>
            <div className="space-y-1 text-[10px]">{AI_FEATURES.map(f => (<label key={f.label} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" /><span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span></label>))}</div></Card>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>New</Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>Manage Token Display</Button>
          </div>
          {tab === "new" && (
            <Card><CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Token Display</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><Label className="font-semibold">Location</Label><Select value={fLocation} onValueChange={setFLocation}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="font-semibold">Display <span className="text-red-500">*</span></Label><Input value={fDisplay} onChange={e => setFDisplay(e.target.value)} placeholder="URI" className="mt-1" /><p className="text-[9px] text-muted-foreground mt-0.5">Device Browser should be pointed to https://ayuzee.com/kiosk/location1/show/URI</p></div>
                  <div><Label className="font-semibold">Layout</Label><Select value={fLayout} onValueChange={setFLayout}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{LAYOUTS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="font-semibold">Department</Label><Select value={fDept} onValueChange={setFDept}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="font-semibold">Voice</Label><Select value={fVoice} onValueChange={setFVoice}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{VOICES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="flex justify-center pt-2"><Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white px-10">Submit</Button></div>
              </CardContent></Card>
          )}
          {tab === "manage" && (
            <Card><CardHeader className="pb-2 border-b"><CardTitle className="text-base text-center text-primary">Manage Token Display</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between"><div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div><div className="flex items-center gap-2"><span className="text-xs">Search:</span><Input className="h-7 text-xs w-40" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
                <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">#</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Display</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Location</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Layout</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Dr List</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Department</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th></tr></thead>
                <tbody>{mockDisplays.length === 0 ? (<tr><td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">No data available in table</td></tr>) : mockDisplays.map((d, i) => (<tr key={d.id} className="border-b hover:bg-muted/30"><td className="px-3 py-2 text-xs">{i+1}</td><td className="px-3 py-2 text-xs font-medium">{d.display}</td><td className="px-3 py-2 text-[10px] max-w-[120px] truncate">{d.location.split(",")[0]}</td><td className="px-3 py-2 text-xs">{d.layout}</td><td className="px-3 py-2 text-[10px]">{d.drList || "-"}</td><td className="px-3 py-2 text-xs">{d.department}</td><td className="px-3 py-2 text-xs">{d.createdBy}</td></tr>))}</tbody></table>
                <div className="text-xs text-muted-foreground">Showing 1 to {mockDisplays.length} of {mockDisplays.length} entries</div>
              </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDisplayMaster;
