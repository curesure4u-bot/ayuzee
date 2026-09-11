import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutGrid, Home, Store, Wifi, Layers, Maximize2,
  Users, Package, Stethoscope, Syringe, Sparkles, Armchair,
  DoorOpen, Info, IndianRupee, Ruler, CheckCircle2, Building2,
} from "lucide-react";

// ─── Room definitions with visual grid positions ───
interface Room {
  id: string;
  name: string;
  size: string;
  sqft: number;
  color: string;
  icon: any;
  purpose: string;
  equipment: string[];
  staff: string;
  // grid layout: col-span and row for CSS grid
  gridClass: string;
}

const layouts: Record<string, { name: string; totalSqft: string; rooms: Room[] }> = {
  compact: {
    name: "Compact (500-700 sq ft) — Hybrid Starter",
    totalSqft: "500-700 sq ft",
    rooms: [
      { id: "reception", name: "Reception + Waiting", size: "120 sq ft", sqft: 120, color: "amber", icon: Armchair, purpose: "Check-in, billing, 6-seat waiting, education screen", equipment: ["Front desk", "HMS terminal", "6 chairs", "Education screen", "Dermatome chart"], staff: "Receptionist", gridClass: "col-span-2" },
      { id: "exam", name: "Examination Room", size: "100 sq ft", sqft: 100, color: "blue", icon: Stethoscope, purpose: "AI Assessment + 7-system exam + teleconsult", equipment: ["Examination couch", "Doctor desk", "HMS terminal", "Posture tablet"], staff: "Duty Doctor", gridClass: "col-span-1" },
      { id: "combined-therapy", name: "Combined Therapy Room", size: "150 sq ft", sqft: 150, color: "purple", icon: Sparkles, purpose: "Level 1 + Panchakarma (shared, curtained)", equipment: ["Droni table", "Basti setup", "Agnikarma", "Cupping", "Oil warmer"], staff: "Male + Female Therapist", gridClass: "col-span-2" },
      { id: "pharmacy", name: "Mini Pharmacy", size: "60 sq ft", sqft: 60, color: "green", icon: Package, purpose: "Essential meds + oils + billing", equipment: ["Med rack", "Oils", "Billing"], staff: "Shared with reception", gridClass: "col-span-1" },
    ],
  },
  standard: {
    name: "Standard (900-1200 sq ft) — Full Physical Center",
    totalSqft: "900-1200 sq ft",
    rooms: [
      { id: "reception", name: "Reception", size: "60 sq ft", sqft: 60, color: "amber", icon: DoorOpen, purpose: "Front desk, token, QR check-in, billing", equipment: ["Front desk", "HMS terminal", "Token display", "QR scanner", "Billing"], staff: "Receptionist", gridClass: "col-span-1" },
      { id: "waiting", name: "Waiting Area", size: "120 sq ft", sqft: 120, color: "amber", icon: Armchair, purpose: "8-10 seats, education screen, water, brochures", equipment: ["8-10 chairs", "Education screen", "Dermatome wall chart", "Water dispenser", "WiFi"], staff: "—", gridClass: "col-span-2" },
      { id: "exam", name: "Examination Room", size: "120 sq ft", sqft: 120, color: "blue", icon: Stethoscope, purpose: "AI Assessment + 7-system examination + posture analysis", equipment: ["Examination couch", "Doctor desk + HMS", "Posture analysis tablet", "VAS charts", "Goniometer"], staff: "Duty Doctor", gridClass: "col-span-1" },
      { id: "level1", name: "Level 1 Therapy Room", size: "100 sq ft", sqft: 100, color: "orange", icon: Syringe, purpose: "Agnikarma, cupping, needling, trigger point, Marma", equipment: ["Agnikarma setup (Shalaka)", "Cupping set", "Acupuncture needles", "Trigger point table", "Marma oils"], staff: "Therapist", gridClass: "col-span-1" },
      { id: "panchakarma", name: "Panchakarma Room", size: "150 sq ft", sqft: 150, color: "purple", icon: Sparkles, purpose: "Kati/Greeva Basti, deep PK therapies", equipment: ["Droni (PK table + drainage)", "Basti dough rings", "Steam unit", "Oil warmer", "Privacy curtains", "Wash area"], staff: "Male + Female Therapist", gridClass: "col-span-2" },
      { id: "pharmacy", name: "Pharmacy / Dispensary", size: "80 sq ft", sqft: 80, color: "green", icon: Package, purpose: "Classical meds, oils, stock, billing", equipment: ["Medicine racks", "Oil storage", "HMS Stock", "Billing counter", "Refrigerator"], staff: "Pharmacist / Reception", gridClass: "col-span-1" },
      { id: "utility", name: "Utility / Storage", size: "100 sq ft", sqft: 100, color: "gray", icon: Home, purpose: "Oil prep, linen, staff area, restroom", equipment: ["Oil prep station", "Linen storage", "Staff lockers", "Restroom"], staff: "—", gridClass: "col-span-1" },
    ],
  },
  online: {
    name: "Online (Home Office) — Digital Only",
    totalSqft: "150-250 sq ft (1 room)",
    rooms: [
      { id: "teleconsult", name: "Teleconsultation Room", size: "100 sq ft", sqft: 100, color: "blue", icon: Wifi, purpose: "Video consultation with clean backdrop, good lighting", equipment: ["Desk + chair", "HD webcam", "Ring light", "Microphone", "Dual monitor (patient + HMS)", "Professional backdrop"], staff: "Duty Doctor (tele)", gridClass: "col-span-2" },
      { id: "kit-station", name: "Home Kit Packing Station", size: "60 sq ft", sqft: 60, color: "green", icon: Package, purpose: "Assemble + dispatch home therapy kits", equipment: ["Kit inventory shelf", "Packing table", "Courier labels", "Ear seeds/cups stock", "Exercise cards"], staff: "Online Coordinator", gridClass: "col-span-1" },
      { id: "content", name: "Content / Coaching Corner", size: "60 sq ft", sqft: 60, color: "purple", icon: Sparkles, purpose: "Record exercise videos, WhatsApp coaching", equipment: ["Recording setup", "Phone/laptop", "Exercise props", "WhatsApp Business"], staff: "Coach / Coordinator", gridClass: "col-span-1" },
    ],
  },
};

export default function SpineFranchiseLayout() {
  const [selectedLayout, setSelectedLayout] = useState<string>("standard");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const layout = layouts[selectedLayout];
  const room = selectedRoom ? layout.rooms.find(r => r.id === selectedRoom) : null;
  const totalRoomSqft = layout.rooms.reduce((s, r) => s + r.sqft, 0);

  const colorBg: Record<string, string> = {
    amber: "bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800",
    blue: "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800",
    orange: "bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-800",
    purple: "bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800",
    green: "bg-green-100 border-green-300 hover:bg-green-200 text-green-800",
    gray: "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-blue-600" />
            Experience Center Layout Planner
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual floor plan for your Spine AYUSH center — click rooms to see details
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          <Building2 className="h-3 w-3 mr-1" /> Franchise Tool #2
        </Badge>
      </div>

      {/* Layout selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(layouts).map(([key, l]) => (
          <Button
            key={key}
            variant={selectedLayout === key ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedLayout(key); setSelectedRoom(null); }}
            className="text-xs"
          >
            {key === "compact" ? <Layers className="h-3 w-3 mr-1" /> : key === "standard" ? <Store className="h-3 w-3 mr-1" /> : <Wifi className="h-3 w-3 mr-1" />}
            {key === "compact" ? "Compact/Hybrid" : key === "standard" ? "Standard Physical" : "Online"}
          </Button>
        ))}
      </div>

      {/* Layout Info */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-medium text-sm">{layout.name}</h3>
              <p className="text-xs text-muted-foreground">{layout.rooms.length} rooms · {totalRoomSqft} sq ft usable</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><Ruler className="h-3 w-3 text-blue-500" /> {layout.totalSqft}</span>
              <span className="flex items-center gap-1"><DoorOpen className="h-3 w-3 text-purple-500" /> {layout.rooms.length} rooms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Floor Plan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <Maximize2 className="h-4 w-4" /> Floor Plan (click a room)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Building outline */}
          <div className="border-4 border-dashed border-muted-foreground/30 rounded-xl p-3 bg-muted/10">
            <div className="text-center text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">— Entrance —</div>
            <div className="grid grid-cols-3 gap-2">
              {layout.rooms.map(r => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoom(r.id)}
                    className={`${r.gridClass} ${colorBg[r.color]} border-2 rounded-lg p-3 text-left transition min-h-[90px] ${selectedRoom === r.id ? "ring-2 ring-offset-2 ring-blue-400" : ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-bold text-xs leading-tight">{r.name}</span>
                    </div>
                    <p className="text-[10px] opacity-80 mt-1">{r.size}</p>
                    <p className="text-[9px] opacity-70 mt-1">{r.staff}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Detail Panel */}
      {room ? (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <room.icon className="h-5 w-5 text-blue-600" /> {room.name}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{room.size}</Badge>
                <Badge className="bg-purple-100 text-purple-700">{room.staff}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-2 bg-blue-50 rounded text-xs">
              <p className="font-medium text-blue-700 flex items-center gap-1"><Info className="h-3 w-3" /> Purpose</p>
              <p className="mt-0.5">{room.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Equipment Needed</p>
              <div className="flex flex-wrap gap-1">
                {room.equipment.map(e => (
                  <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            <LayoutGrid className="h-10 w-10 mx-auto opacity-30 mb-2" />
            <p>Click any room in the floor plan above to see its purpose, equipment, and staffing.</p>
          </CardContent>
        </Card>
      )}

      {/* Room Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Room Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-2">Room</th>
                  <th className="text-center p-2">Size</th>
                  <th className="text-left p-2">Staff</th>
                  <th className="text-left p-2">Key Purpose</th>
                </tr>
              </thead>
              <tbody>
                {layout.rooms.map(r => (
                  <tr key={r.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedRoom(r.id)}>
                    <td className="p-2 font-medium flex items-center gap-1"><r.icon className="h-3 w-3" /> {r.name}</td>
                    <td className="p-2 text-center">{r.size}</td>
                    <td className="p-2">{r.staff}</td>
                    <td className="p-2 text-muted-foreground truncate max-w-[200px]">{r.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Design Tips */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1"><Info className="h-4 w-4 text-amber-600" /> Design Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              "Panchakarma room needs floor drainage + water supply (oil therapies)",
              "Separate male/female therapy access for modesty compliance",
              "Waiting area should showcase education (dermatome chart, testimonials) for conversion",
              "Examination room should be adjacent to reception for smooth flow",
              "Pharmacy near exit for medicine pickup on the way out",
              "Good ventilation in therapy rooms (moxibustion smoke, oil vapors)",
              "Calm colors (green/earth tones) for healing ambiance",
              "Store oils away from heat, maintain proper temperature",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
