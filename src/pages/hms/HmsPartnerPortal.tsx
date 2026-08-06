import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CalendarClock, Users, Wallet, CheckCircle2, Clock, Package, Truck, FlaskConical, Upload, Activity } from "lucide-react";

// Simulated partner type (in real app, detected from useHmsAccess role)
type PartnerType = "venue_pk" | "external_lab" | "courier" | "ambulance" | "consultant" | "dietician";

const venueBookings = [
  { id: "VB-01", time: "10:00 AM", patient: "Mr. Nagaraj", therapy: "Kati Basti", duration: "45 min", materials: "Sahacharadi Taila 200ml", notes: "L4-L5 Gridhrasi. Prone position. Oil temp 40°C.", status: "In Progress" },
  { id: "VB-02", time: "11:00 AM", patient: "Mrs. Kalpana", therapy: "Greeva Basti", duration: "40 min", materials: "Ksheerabala Taila 150ml", notes: "Cervical spondylosis. Supine with neck support.", status: "Waiting" },
  { id: "VB-03", time: "02:00 PM", patient: "Mr. Kubbusamy", therapy: "Janu Basti", duration: "40 min", materials: "Murivenna 150ml", notes: "Right knee OA. Seated position.", status: "Scheduled" },
  { id: "VB-04", time: "03:30 PM", patient: "Rabiyathubasaria", therapy: "Patra Pinda Sweda", duration: "30 min", materials: "Nirgundi + Eranda leaves pack", notes: "Both shoulders. Medium heat.", status: "Scheduled" },
];

const labOrders = [
  { id: "LO-01", patient: "Mr. Nagaraj (AL-8472)", tests: "CBC, ESR, CRP, RA Factor", ordered: "2026-07-31 09:30", priority: "Urgent", status: "Pending" },
  { id: "LO-02", patient: "Mrs. Kalpana (AL-9201)", tests: "FBS, HbA1c, Lipid Profile", ordered: "2026-07-31 10:15", priority: "Routine", status: "Collected" },
  { id: "LO-03", patient: "Mrs. Hameedhal (AL-15598)", tests: "Urine Routine, Serum Creatinine", ordered: "2026-07-30 16:00", priority: "Routine", status: "Results Ready" },
];

const courierOrders = [
  { id: "CO-01", patient: "Mr. Nagaraj", destination: "Kadayanallur, TN 627751", items: "Rasnasaptakam ×3, Guggulu ×1", weight: "1.2 kg", value: "₹680", status: "Ready for Pickup" },
  { id: "CO-02", patient: "Mrs. Kalpana", destination: "Tirunelveli, TN 627001", items: "Kottamchukkadi Taila ×2, Churna ×1", weight: "0.8 kg", value: "₹520", status: "In Transit" },
  { id: "CO-03", patient: "Mr. Kubbusamy", destination: "Chennai, TN 600028", items: "PK Oil Kit + Medicines", weight: "2.1 kg", value: "₹1,450", status: "Delivered" },
];

const HmsPartnerPortal = () => {
  const [partnerType, setPartnerType] = useState<PartnerType>("venue_pk");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Partner Portal</h1><p className="text-sm text-muted-foreground">Simplified view for venue partners, labs, couriers, and service providers</p></div>
        <select className="border rounded px-2 py-1 text-sm" value={partnerType} onChange={e => setPartnerType(e.target.value as PartnerType)}>
          <option value="venue_pk">PK Venue Partner</option>
          <option value="external_lab">External Lab</option>
          <option value="courier">Courier Partner</option>
        </select>
      </div>

      {/* VENUE / PK PARTNER VIEW */}
      {partnerType === "venue_pk" && (<>
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">4</p><p className="text-xs text-muted-foreground">Today's Bookings</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">2</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-700">₹8,500</p><p className="text-xs text-muted-foreground">Today's Revenue (Your Share)</p></CardContent></Card>
        </div>
        <Card><CardHeader><CardTitle>Today's Therapy Sessions</CardTitle></CardHeader><CardContent className="space-y-3">
          {venueBookings.map(b => (
            <div key={b.id} className="p-3 border rounded-lg flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2"><Badge variant="outline">{b.time}</Badge><span className="font-medium">{b.patient}</span><Badge className="bg-purple-100 text-purple-800">{b.therapy}</Badge></div>
                <p className="text-xs text-muted-foreground">Duration: {b.duration} | Materials: {b.materials}</p>
                <p className="text-xs bg-muted/50 p-1.5 rounded"><strong>Notes:</strong> {b.notes}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={b.status === "In Progress" ? "bg-blue-100 text-blue-800" : b.status === "Waiting" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}>{b.status}</Badge>
                {b.status === "Waiting" && <Button size="sm" onClick={() => toast.success("Session started")}>Start</Button>}
                {b.status === "In Progress" && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Session completed — marked done")}><CheckCircle2 className="mr-1 h-3 w-3" />Complete</Button>}
              </div>
            </div>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Materials Consumed Today</CardTitle></CardHeader><CardContent className="text-sm space-y-1">
          <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Sahacharadi Taila</span><span>200ml</span></div>
          <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Ksheerabala Taila</span><span>150ml</span></div>
          <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Murivenna</span><span>150ml</span></div>
          <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Patra Pinda leaves</span><span>1 pack</span></div>
          <p className="text-xs text-muted-foreground mt-2">Materials auto-deducted from your allocation. Report discrepancy if needed.</p>
        </CardContent></Card>
      </>)}

      {/* EXTERNAL LAB VIEW */}
      {partnerType === "external_lab" && (<>
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">3</p><p className="text-xs text-muted-foreground">Pending Orders</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">1</p><p className="text-xs text-muted-foreground">Sample Collected</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">1</p><p className="text-xs text-muted-foreground">Results Ready</p></CardContent></Card>
        </div>
        <Card><CardHeader><CardTitle>Test Orders (Assigned to You)</CardTitle></CardHeader><CardContent className="p-0">
          <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Order</th><th className="p-3 text-left">Patient</th><th className="p-3 text-left">Tests</th><th className="p-3">Priority</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
            <tbody>{labOrders.map(o => (<tr key={o.id} className="border-t"><td className="p-3 font-mono text-xs">{o.id}</td><td className="p-3">{o.patient}</td><td className="p-3 text-xs">{o.tests}</td><td className="p-3 text-center"><Badge className={o.priority === "Urgent" ? "bg-red-100 text-red-800" : "bg-gray-100"}>{o.priority}</Badge></td><td className="p-3 text-center"><Badge className={o.status === "Results Ready" ? "bg-green-100 text-green-800" : o.status === "Collected" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>{o.status}</Badge></td><td className="p-3 text-center">{o.status === "Pending" && <Button size="sm" variant="outline" onClick={() => toast.success("Marked as Collected")}>Collect</Button>}{o.status === "Collected" && <Button size="sm" onClick={() => toast.success("Upload result report")}><Upload className="mr-1 h-3 w-3" />Upload</Button>}</td></tr>))}</tbody></table>
        </CardContent></Card>
      </>)}

      {/* COURIER PARTNER VIEW */}
      {partnerType === "courier" && (<>
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">1</p><p className="text-xs text-muted-foreground">Ready for Pickup</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">1</p><p className="text-xs text-muted-foreground">In Transit</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">1</p><p className="text-xs text-muted-foreground">Delivered Today</p></CardContent></Card>
        </div>
        <Card><CardHeader><CardTitle>Dispatch Queue</CardTitle></CardHeader><CardContent className="p-0">
          <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Order</th><th className="p-3 text-left">Destination</th><th className="p-3 text-left">Items</th><th className="p-3">Weight</th><th className="p-3">Value</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
            <tbody>{courierOrders.map(o => (<tr key={o.id} className="border-t"><td className="p-3 font-mono text-xs">{o.id}</td><td className="p-3 text-xs">{o.destination}</td><td className="p-3 text-xs">{o.items}</td><td className="p-3 text-center">{o.weight}</td><td className="p-3 text-center">{o.value}</td><td className="p-3 text-center"><Badge className={o.status === "Delivered" ? "bg-green-100 text-green-800" : o.status === "In Transit" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>{o.status}</Badge></td><td className="p-3 text-center">{o.status === "Ready for Pickup" && <Button size="sm" onClick={() => toast.success("Picked up — enter AWB number")}><Truck className="mr-1 h-3 w-3" />Pickup</Button>}</td></tr>))}</tbody></table>
        </CardContent></Card>
      </>)}
    </div>
  );
};
export default HmsPartnerPortal;
