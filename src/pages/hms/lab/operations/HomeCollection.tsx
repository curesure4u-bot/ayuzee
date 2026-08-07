import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Clock, CheckCircle, Users, Phone, Plus, Truck } from "lucide-react";

type CollectionRequest = {
  id: string;
  patient: string;
  phone: string;
  address: string;
  tests: string;
  scheduledDate: string;
  scheduledTime: string;
  phlebotomist: string;
  status: "scheduled" | "in-transit" | "collected" | "completed" | "cancelled";
};

const mockRequests: CollectionRequest[] = [
  { id: "HC-001", patient: "Ramesh Kumar", phone: "+91-9876543210", address: "12, Gandhi Nagar, Kadayanallur", tests: "CBC, ESR, CRP", scheduledDate: "2026-08-07", scheduledTime: "07:30 AM", phlebotomist: "Anita (PHB-01)", status: "collected" },
  { id: "HC-002", patient: "Lakshmi Devi", phone: "+91-9876543211", address: "45, Temple Street, Tenkasi", tests: "FBS, PPBS, HbA1c", scheduledDate: "2026-08-07", scheduledTime: "08:00 AM", phlebotomist: "Anita (PHB-01)", status: "in-transit" },
  { id: "HC-003", patient: "Vijay Nambiar", phone: "+91-9876543212", address: "78, MG Road, Tirunelveli", tests: "Lipid Profile, LFT, RFT", scheduledDate: "2026-08-07", scheduledTime: "08:30 AM", phlebotomist: "Suresh (PHB-02)", status: "scheduled" },
  { id: "HC-004", patient: "Meera Nair", phone: "+91-9876543213", address: "23, Beach Road, Kanyakumari", tests: "Thyroid Panel (TSH, T3, T4)", scheduledDate: "2026-08-07", scheduledTime: "09:00 AM", phlebotomist: "Suresh (PHB-02)", status: "scheduled" },
  { id: "HC-005", patient: "Anand Sharma", phone: "+91-9876543214", address: "5, Park Avenue, Nagercoil", tests: "Urine R/M, Serum Creatinine", scheduledDate: "2026-08-06", scheduledTime: "07:30 AM", phlebotomist: "Anita (PHB-01)", status: "completed" },
];

const phlebotomists = [
  { id: "PHB-01", name: "Anita D", phone: "9876500030", area: "Kadayanallur / Tenkasi", todaySlots: 4, completed: 2 },
  { id: "PHB-02", name: "Suresh R", phone: "9876500031", area: "Tirunelveli / Nagercoil", todaySlots: 3, completed: 0 },
];

const HomeCollection = () => {
  const [requests] = useState(mockRequests);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" /> Home Collection
          </h2>
          <p className="text-sm text-muted-foreground">
            Schedule home sample collection, assign phlebotomists & track routes
          </p>
        </div>
        <Button size="sm" onClick={() => toast.success("New collection request created")}>
          <Plus className="mr-1 h-3 w-3" /> New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{requests.filter(r => r.status === "scheduled").length}</p><p className="text-xs text-muted-foreground">Scheduled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Truck className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{requests.filter(r => r.status === "in-transit").length}</p><p className="text-xs text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{requests.filter(r => r.status === "collected" || r.status === "completed").length}</p><p className="text-xs text-muted-foreground">Collected</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{phlebotomists.length}</p><p className="text-xs text-muted-foreground">Phlebotomists</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">{requests.length}</p><p className="text-xs text-muted-foreground">Total Today</p></CardContent></Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Today's Collection Schedule</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Address</th>
                <th className="px-3 py-2 text-left font-medium">Tests</th>
                <th className="px-3 py-2 text-left font-medium">Phlebotomist</th>
                <th className="px-3 py-2 text-center font-medium">Status</th>
                <th className="px-3 py-2 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-xs">{r.scheduledTime}</td>
                  <td className="px-3 py-2">
                    <p className="text-xs font-medium">{r.patient}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{r.phone}</p>
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[150px] truncate">{r.address}</td>
                  <td className="px-3 py-2 text-xs">{r.tests}</td>
                  <td className="px-3 py-2 text-xs">{r.phlebotomist}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={r.status === "completed" || r.status === "collected" ? "outline" : r.status === "in-transit" ? "default" : "secondary"} className={`text-[10px] capitalize ${r.status === "completed" || r.status === "collected" ? "text-green-600" : ""}`}>{r.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.status === "scheduled" && <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => toast.success("Dispatched")}>Dispatch</Button>}
                    {r.status === "in-transit" && <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => toast.success("Collected")}>Collect</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Phlebotomist Cards */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Phlebotomist Assignment</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {phlebotomists.map(p => (
              <div key={p.id} className="p-3 rounded-lg border flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.name} ({p.id})</p>
                  <p className="text-xs text-muted-foreground">{p.area}</p>
                  <p className="text-xs text-muted-foreground">Phone: {p.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{p.completed}/{p.todaySlots}</p>
                  <p className="text-[10px] text-muted-foreground">slots done</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeCollection;
