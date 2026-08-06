import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, BedDouble, Sparkles, Search } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type RoomType = {
  id: string;
  name: string;
  externalRoomId: string;
  charges: { service: string; price: number }[];
  locationRatePlans: Record<string, string>;
  status: "active" | "inactive";
  createdDate: string;
  createdBy: string;
};

type RoomBed = {
  id: string;
  roomNumber: string;
  roomType: string;
  ward: string;
  floor: string;
  bedCount: number;
  occupied: number;
  ratePerDay: number;
  amenities: string[];
  status: "active" | "inactive" | "maintenance";
  createdBy: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const LOCATIONS = [
  { key: "loc1", label: "location1 @ Kadayanallur:" },
  { key: "loc2", label: "location2 @ PACR SALAI:" },
  { key: "loc3", label: "location3 @ Old GH Road:" },
  { key: "loc4", label: "location4 @ Kulavanikar Puram Road, :" },
  { key: "loc5", label: "location5 @ Keelkattalai:" },
  { key: "loc6", label: "location6 @ .:" },
];
const RATE_PLANS = ["alshifa-ayush-hospital Default Rate Plan", "Insurance Rate Plan", "Corporate Rate Plan", "Government Rate Plan"];
const FLOORS = ["Ground Floor", "First Floor", "Second Floor", "Third Floor", "Basement"];
const WARDS = ["General Ward", "Panchakarma Ward", "Female Ward", "Male Ward", "Pediatric Ward", "ICU", "OT Block", "Post-Op Ward"];
const AMENITIES = ["AC", "Non-AC", "Fan", "TV", "WiFi", "Attached Bathroom", "Shared Bathroom", "Attendant Bed", "Fridge", "Sofa", "Oxygen Point", "Nurse Call Bell", "CCTV", "Balcony"];

const AI_WARD_FEATURES = [
  { label: "Smart Bed Allocation", desc: "AI auto-assigns beds based on patient condition, gender, and availability" },
  { label: "Occupancy Prediction", desc: "Predicts ward occupancy 7 days ahead for resource planning" },
  { label: "Discharge Planning Alert", desc: "AI flags patients likely ready for discharge to free beds" },
  { label: "Housekeeping Auto-Trigger", desc: "Auto-notifies housekeeping when patient is discharged for room turnover" },
  { label: "Real-time Bed Status Display", desc: "Live dashboard on TV screens showing bed availability per ward" },
  { label: "Infection Control Zoning", desc: "AI suggests bed isolation/separation for infectious patients" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockRoomTypes: RoomType[] = [
  { id: "1", name: "SINGLE COT ROOM", externalRoomId: "SCR-01", charges: [{ service: "Room Rent", price: 1500 }, { service: "Nursing Charge", price: 300 }], locationRatePlans: { loc1: "alshifa-ayush-hospital Default Rate Plan", loc2: "alshifa-ayush-hospital Default Rate Plan" }, status: "active", createdDate: "01/01/2025", createdBy: "Al Shifa Ayush Hospital" },
  { id: "2", name: "GENERAL WARD", externalRoomId: "GW-01", charges: [{ service: "Room Rent", price: 800 }, { service: "Nursing Charge", price: 200 }], locationRatePlans: { loc1: "alshifa-ayush-hospital Default Rate Plan", loc3: "alshifa-ayush-hospital Default Rate Plan" }, status: "active", createdDate: "01/01/2025", createdBy: "Al Shifa Ayush Hospital" },
  { id: "3", name: "DOUBLE COT ROOM", externalRoomId: "DCR-01", charges: [{ service: "Room Rent", price: 2500 }, { service: "Nursing Charge", price: 400 }], locationRatePlans: { loc1: "alshifa-ayush-hospital Default Rate Plan" }, status: "active", createdDate: "01/01/2025", createdBy: "Al Shifa Ayush Hospital" },
  { id: "4", name: "DELUXE SUITE", externalRoomId: "DLX-01", charges: [{ service: "Room Rent", price: 5000 }, { service: "Nursing Charge", price: 500 }, { service: "Diet", price: 800 }], locationRatePlans: { loc1: "alshifa-ayush-hospital Default Rate Plan" }, status: "active", createdDate: "15/01/2025", createdBy: "Al Shifa Ayush Hospital" },
  { id: "5", name: "PANCHAKARMA ROOM", externalRoomId: "PK-01", charges: [{ service: "Room Rent", price: 2000 }, { service: "Therapy Room", price: 500 }], locationRatePlans: { loc1: "alshifa-ayush-hospital Default Rate Plan", loc2: "alshifa-ayush-hospital Default Rate Plan" }, status: "active", createdDate: "01/02/2025", createdBy: "Dr Mohamad Saleem" },
  { id: "6", name: "OT", externalRoomId: "OT-01", charges: [{ service: "OT Charges", price: 8000 }], locationRatePlans: { loc1: "alshifa-ayush-hospital Default Rate Plan" }, status: "active", createdDate: "01/01/2025", createdBy: "Al Shifa Ayush Hospital" },
];

const mockRoomBeds: RoomBed[] = [
  { id: "1", roomNumber: "101", roomType: "SINGLE COT ROOM", ward: "General Ward", floor: "Ground Floor", bedCount: 1, occupied: 1, ratePerDay: 1500, amenities: ["AC", "TV", "Attached Bathroom", "Nurse Call Bell"], status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "2", roomNumber: "102", roomType: "SINGLE COT ROOM", ward: "General Ward", floor: "Ground Floor", bedCount: 1, occupied: 0, ratePerDay: 1500, amenities: ["AC", "TV", "Attached Bathroom", "Nurse Call Bell"], status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "3", roomNumber: "GW-A", roomType: "GENERAL WARD", ward: "General Ward", floor: "Ground Floor", bedCount: 6, occupied: 4, ratePerDay: 800, amenities: ["Fan", "Shared Bathroom", "Nurse Call Bell"], status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "4", roomNumber: "201", roomType: "DOUBLE COT ROOM", ward: "Female Ward", floor: "First Floor", bedCount: 2, occupied: 1, ratePerDay: 2500, amenities: ["AC", "TV", "Attached Bathroom", "Attendant Bed"], status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "5", roomNumber: "PK-1", roomType: "PANCHAKARMA ROOM", ward: "Panchakarma Ward", floor: "Ground Floor", bedCount: 1, occupied: 1, ratePerDay: 2000, amenities: ["AC", "Attached Bathroom", "Therapy Table"], status: "active", createdBy: "Dr Mohamad Saleem" },
  { id: "6", roomNumber: "PK-2", roomType: "PANCHAKARMA ROOM", ward: "Panchakarma Ward", floor: "Ground Floor", bedCount: 1, occupied: 0, ratePerDay: 2000, amenities: ["AC", "Attached Bathroom", "Therapy Table"], status: "active", createdBy: "Dr Mohamad Saleem" },
  { id: "7", roomNumber: "DLX-1", roomType: "DELUXE SUITE", ward: "General Ward", floor: "Second Floor", bedCount: 1, occupied: 0, ratePerDay: 5000, amenities: ["AC", "TV", "WiFi", "Attached Bathroom", "Fridge", "Sofa", "Attendant Bed", "Balcony"], status: "active", createdBy: "Al Shifa Ayush Hospital" },
  { id: "8", roomNumber: "OT-1", roomType: "OT", ward: "OT Block", floor: "First Floor", bedCount: 1, occupied: 0, ratePerDay: 8000, amenities: ["AC", "Oxygen Point", "CCTV"], status: "active", createdBy: "Al Shifa Ayush Hospital" },
];
const mockInactiveRoomTypes: RoomType[] = [
  { id: "101", name: "OLD WARD TYPE", externalRoomId: "", charges: [], locationRatePlans: {}, status: "inactive", createdDate: "01/01/2023", createdBy: "admin" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const WardBedMaster = () => {
  const [section, setSection] = useState<"room-type" | "room-bed">("room-type");
  const [rtTab, setRtTab] = useState<"new" | "manage" | "inactive">("new");
  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Smart Bed Allocation", "Discharge Planning Alert", "Housekeeping Auto-Trigger"]);

  // Room Type form
  const [rtName, setRtName] = useState("");
  const [rtExtId, setRtExtId] = useState("");
  const [rtCharge, setRtCharge] = useState("");
  const [rtCharges, setRtCharges] = useState<{ service: string; price: number }[]>([]);
  const [rtLocPlans, setRtLocPlans] = useState<Record<string, string>>({});

  // Room/Bed form
  const [rbRoom, setRbRoom] = useState("");
  const [rbType, setRbType] = useState("");
  const [rbWard, setRbWard] = useState("");
  const [rbFloor, setRbFloor] = useState("");
  const [rbBeds, setRbBeds] = useState("1");
  const [rbRate, setRbRate] = useState("");
  const [rbAmenities, setRbAmenities] = useState<string[]>([]);

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const toggleAmenity = (a: string) => setRbAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleAddCharge = () => {
    if (!rtCharge.trim()) return;
    setRtCharges([...rtCharges, { service: rtCharge.trim(), price: 0 }]);
    setRtCharge("");
  };

  const handleSaveRoomType = () => {
    if (!rtName.trim()) return toast.error("Room Type is required");
    toast.success(`Room Type "${rtName}" created!`);
    setRtName(""); setRtExtId(""); setRtCharges([]);
  };

  const handleSaveRoom = () => {
    if (!rbRoom.trim()) return toast.error("Room Number is required");
    if (!rbType) return toast.error("Select Room Type");
    toast.success(`Room "${rbRoom}" created!`);
  };

  const totalBeds = mockRoomBeds.reduce((s, r) => s + r.bedCount, 0);
  const totalOccupied = mockRoomBeds.reduce((s, r) => s + r.occupied, 0);

  // ─── Render Room Type New ──────────────────────────────────────────────────
  const renderRoomTypeNew = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Room Type</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label className="font-semibold">Room Type :</Label><Input value={rtName} onChange={e => setRtName(e.target.value)} className="mt-1" /></div>
          <div><Label className="font-semibold">External Room ID :</Label><Input value={rtExtId} onChange={e => setRtExtId(e.target.value)} placeholder="Ext Room ID" className="mt-1" /></div>
        </div>

        {/* Charges */}
        <div>
          <h3 className="font-semibold text-sm">Select Charge(s)</h3>
          <div className="flex items-end gap-2 mt-1">
            <div className="flex-1"><Label className="text-xs">Choose Charge :</Label><Input value={rtCharge} onChange={e => setRtCharge(e.target.value)} placeholder="Type Charge" className="mt-0.5 h-8 text-sm" /></div>
            <Button size="sm" onClick={handleAddCharge} className="bg-teal-600 hover:bg-teal-700 text-white h-8"><Plus className="h-3 w-3 mr-1" />Add</Button>
          </div>
          {rtCharges.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Charge List :</p>
              <div className="bg-red-50 border border-red-200 rounded p-2 mb-2"><p className="text-xs text-red-600 italic">Price Details are for reference purpose only. Actual price may differ while billing based on rate plan</p></div>
              <table className="text-xs border w-full"><thead className="bg-muted/50"><tr><th className="px-2 py-1 text-left text-orange-600">#</th><th className="px-2 py-1 text-left text-orange-600">Services</th><th className="px-2 py-1 text-left text-orange-600">Price</th></tr></thead>
              <tbody>{rtCharges.map((c, i) => (<tr key={i} className="border-t"><td className="px-2 py-1">{i+1}</td><td className="px-2 py-1">{c.service}</td><td className="px-2 py-1"><Input value={c.price} onChange={e => { const u = [...rtCharges]; u[i].price = Number(e.target.value); setRtCharges(u); }} type="number" className="h-6 w-20 text-xs" /></td></tr>))}</tbody></table>
            </div>
          )}
        </div>

        {/* Rate Plan per Location */}
        <div>
          <p className="text-sm font-medium mb-2">Assign RatePlan to Each Location - Billing Engine will use it to find the right charges</p>
          <div className="space-y-3">
            {LOCATIONS.map(loc => (
              <div key={loc.key}>
                <Label className="text-xs font-semibold">{loc.label}</Label>
                <Select value={rtLocPlans[loc.key] || ""} onValueChange={v => setRtLocPlans({ ...rtLocPlans, [loc.key]: v })}>
                  <SelectTrigger className="mt-0.5 h-8 text-sm"><SelectValue placeholder="Select Rate Plan" /></SelectTrigger>
                  <SelectContent>{RATE_PLANS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-2"><Button onClick={handleSaveRoomType} className="bg-orange-500 hover:bg-orange-600 text-white px-8">Save</Button></div>
      </CardContent>
    </Card>
  );

  // ─── Render Room Type Manage ───────────────────────────────────────────────
  const renderRoomTypeTable = (data: RoomType[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}><CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>{type === "active" ? "Manage Room Type" : "Manage Inactive Room Type"}</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="bg-red-50 border border-red-200 rounded p-2"><p className="text-xs text-red-600 italic">Price Details are for reference purpose only. Actual price may differ while billing based on rate plan</p></div>
        <div className="flex items-center justify-between"><div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>10</option><option>50</option></select> entries</div><div className="flex items-center gap-2"><span className="text-xs">Search:</span><Input className="h-7 text-xs w-40" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">SINo</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Name</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Created Date</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Charges</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Action</th></tr></thead>
        <tbody>{data.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map((rt, i) => (
          <tr key={rt.id} className="border-b hover:bg-muted/30"><td className="px-3 py-2 text-xs">{i+1}</td><td className="px-3 py-2 text-xs font-medium">{rt.name}</td><td className="px-3 py-2 text-xs">{rt.createdDate}</td><td className="px-3 py-2 text-xs">{rt.charges.map(c => `${c.service}: ₹${c.price}`).join(", ") || "-"}</td><td className="px-3 py-2"><span className={type === "active" ? "text-emerald-600 text-xs" : "text-red-500 text-xs"}>{rt.status}</span><Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-0.5" /></td><td className="px-3 py-2 text-xs">{rt.createdBy}</td><td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Pencil className="h-3 w-3 text-orange-500" /></Button></td></tr>
        ))}</tbody></table>
      </CardContent>
    </Card>
  );

  // ─── Render Room/Bed Section ───────────────────────────────────────────────
  const renderRoomBed = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Room / Bed Management</CardTitle></CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><Label className="font-semibold">Room Number <span className="text-red-500">*</span></Label><Input value={rbRoom} onChange={e => setRbRoom(e.target.value)} placeholder="e.g., 101, GW-A" className="mt-1" /></div>
            <div><Label className="font-semibold">Room Type <span className="text-red-500">*</span></Label><Select value={rbType} onValueChange={setRbType}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{mockRoomTypes.filter(r => r.status === "active").map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="font-semibold">Ward</Label><Select value={rbWard} onValueChange={setRbWard}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{WARDS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="font-semibold">Floor</Label><Select value={rbFloor} onValueChange={setRbFloor}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{FLOORS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><Label className="font-semibold">Beds</Label><Input value={rbBeds} onChange={e => setRbBeds(e.target.value)} type="number" className="mt-1" /></div>
            <div><Label className="font-semibold">Rate/Day (₹)</Label><Input value={rbRate} onChange={e => setRbRate(e.target.value)} type="number" className="mt-1" /></div>
          </div>
          <div><Label className="font-semibold">Amenities</Label>
            <div className="flex flex-wrap gap-2 mt-1">{AMENITIES.map(a => (<label key={a} className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={rbAmenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-orange-500" />{a}</label>))}</div>
          </div>
          <div className="flex justify-center pt-2"><Button onClick={handleSaveRoom} className="bg-teal-600 hover:bg-teal-700 text-white px-8">Save Room</Button></div>
        </CardContent>
      </Card>

      {/* Existing Rooms Table */}
      <Card>
        <CardHeader className="pb-2 border-b"><CardTitle className="text-sm text-center text-primary">All Rooms & Beds</CardTitle></CardHeader>
        <CardContent className="p-4">
          <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-2 py-2 text-left font-semibold text-orange-600">Room</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Type</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Ward</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Floor</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Beds</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Occupied</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Rate/Day</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
          <tbody>{mockRoomBeds.map(r => (
            <tr key={r.id} className="border-b hover:bg-muted/30"><td className="px-2 py-2 text-xs font-medium">{r.roomNumber}</td><td className="px-2 py-2 text-xs">{r.roomType}</td><td className="px-2 py-2 text-xs">{r.ward}</td><td className="px-2 py-2 text-xs">{r.floor}</td><td className="px-2 py-2 text-xs">{r.bedCount}</td><td className="px-2 py-2 text-xs"><span className={r.occupied === r.bedCount ? "text-red-600 font-bold" : "text-emerald-600"}>{r.occupied}/{r.bedCount}</span></td><td className="px-2 py-2 text-xs">₹{r.ratePerDay.toLocaleString("en-IN")}</td><td className="px-2 py-2"><Badge className={r.status === "active" ? "bg-emerald-100 text-emerald-700 text-[9px]" : "bg-red-100 text-red-700 text-[9px]"}>{r.status}</Badge></td></tr>
          ))}</tbody></table>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BedDouble className="h-6 w-6 text-orange-600" /> Ward Master</h1>
          <p className="text-sm text-muted-foreground">Define wards, room types, and associated rates with AI-powered bed management.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Ward</Badge>
          <Badge variant="secondary">Beds: {totalOccupied}/{totalBeds} occupied</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Ward Master</CardTitle></CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "room-type" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("room-type")}>
                <span className="mr-2">🛏️</span> Room Type
              </Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "room-bed" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("room-bed")}>
                <span className="mr-2">🏨</span> Room/Bed
              </Button>
            </CardContent>
          </Card>

          {/* Occupancy Summary */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Bed Occupancy</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Beds</span><Badge variant="secondary" className="text-[10px] h-4">{totalBeds}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Occupied</span><Badge className="bg-red-100 text-red-700 text-[10px] h-4">{totalOccupied}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Available</span><Badge className="bg-emerald-100 text-emerald-700 text-[10px] h-4">{totalBeds - totalOccupied}</Badge></div>
              <div className="flex justify-between pt-1 border-t"><span className="text-muted-foreground">Occupancy</span><span className="font-bold">{Math.round((totalOccupied/totalBeds)*100)}%</span></div>
            </div>
          </Card>

          {/* AI Features */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Ward Features</p>
            <div className="space-y-1 text-[10px]">
              {AI_WARD_FEATURES.map(f => (
                <label key={f.label} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" />
                  <span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {section === "room-type" && (
            <>
              <div className="flex gap-2 border-b pb-0">
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${rtTab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setRtTab("new")}>New</Button>
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${rtTab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setRtTab("manage")}>Manage Room Type</Button>
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${rtTab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setRtTab("inactive")}>Manage Inactive Room Type</Button>
              </div>
              {rtTab === "new" && renderRoomTypeNew()}
              {rtTab === "manage" && renderRoomTypeTable(mockRoomTypes, "active")}
              {rtTab === "inactive" && renderRoomTypeTable(mockInactiveRoomTypes, "inactive")}
            </>
          )}
          {section === "room-bed" && renderRoomBed()}
        </div>
      </div>
    </div>
  );
};

export default WardBedMaster;
