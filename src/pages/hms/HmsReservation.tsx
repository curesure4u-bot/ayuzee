import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarDays, Plus, Users, BedDouble, IndianRupee, Search, CheckCircle, Clock } from "lucide-react";

type Reservation = {
  id: string; guest: string; phone: string; roomType: string; room: string;
  checkIn: string; checkOut: string; nights: number; rate: number; currency: string;
  source: string; status: "enquiry" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  package: string; pax: number; agency: string; advance: number;
};

const mockReservations: Reservation[] = [
  { id: "1", guest: "Ramesh Kumar", phone: "+91-9876543210", roomType: "Panchakarma Suite", room: "PK-1", checkIn: "2026-07-01", checkOut: "2026-07-15", nights: 14, rate: 4500, currency: "INR", source: "Direct", status: "checked_in", package: "14-Day Full Panchakarma", pax: 1, agency: "—", advance: 63000 },
  { id: "2", guest: "Sarah Johnson", phone: "+1-408-555-1234", roomType: "Deluxe", room: "201", checkIn: "2026-07-18", checkOut: "2026-07-25", nights: 7, rate: 120, currency: "USD", source: "Agency", status: "confirmed", package: "7-Day Rejuvenation", pax: 2, agency: "Kerala Tourism Board", advance: 420 },
  { id: "3", guest: "Priya Menon", phone: "+91-9876500010", roomType: "Private", room: "102", checkIn: "2026-07-16", checkOut: "2026-07-23", nights: 7, rate: 3500, currency: "INR", source: "Website", status: "confirmed", package: "Spine Care Program", pax: 1, agency: "—", advance: 12250 },
  { id: "4", guest: "Hans Mueller", phone: "+49-171-5551234", roomType: "Deluxe", room: "—", checkIn: "2026-08-01", checkOut: "2026-08-22", nights: 21, rate: 150, currency: "EUR", source: "Agency", status: "enquiry", package: "21-Day Detox", pax: 1, agency: "Ayurveda Tours GmbH", advance: 0 },
  { id: "5", guest: "Lakshmi Devi", phone: "+91-9876543215", roomType: "General Ward", room: "GW-3", checkIn: "2026-07-10", checkOut: "2026-07-14", nights: 4, rate: 800, currency: "INR", source: "Walk-in", status: "checked_out", package: "—", pax: 1, agency: "—", advance: 3200 },
  { id: "6", guest: "Ahmed Al Rashid", phone: "+971-50-9876543", roomType: "Panchakarma Suite", room: "PK-2", checkIn: "2026-07-20", checkOut: "2026-08-03", nights: 14, rate: 350, currency: "AED", source: "Agency", status: "confirmed", package: "14-Day Full Panchakarma", pax: 1, agency: "Dubai Health Tourism", advance: 2450 },
];

const HmsReservation = () => {
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const checkedIn = reservations.filter(r => r.status === "checked_in").length;
  const confirmed = reservations.filter(r => r.status === "confirmed").length;
  const enquiries = reservations.filter(r => r.status === "enquiry").length;

  const filtered = reservations.filter(r => r.guest.toLowerCase().includes(search.toLowerCase()) || r.room.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-600" /> Room Reservation System
          </h1>
          <p className="text-sm text-muted-foreground">Resort-style booking · Wellness tourism · Agency management · Multi-currency · Seasonal rates</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> New Reservation</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><BedDouble className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{checkedIn}</p><p className="text-xs text-muted-foreground">Checked In</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{confirmed}</p><p className="text-xs text-muted-foreground">Confirmed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{enquiries}</p><p className="text-xs text-muted-foreground">Enquiries</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{reservations.filter(r => r.agency !== "—").length}</p><p className="text-xs text-muted-foreground">Agency Bookings</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">78%</p><p className="text-xs text-muted-foreground">Occupancy</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search guest or room..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr>
              <th className="px-3 py-2 text-left font-medium">Guest</th>
              <th className="px-3 py-2 text-left font-medium">Room</th>
              <th className="px-3 py-2 text-left font-medium">Check-in</th>
              <th className="px-3 py-2 text-left font-medium">Check-out</th>
              <th className="px-3 py-2 text-left font-medium">Nights</th>
              <th className="px-3 py-2 text-left font-medium">Rate</th>
              <th className="px-3 py-2 text-left font-medium">Package</th>
              <th className="px-3 py-2 text-left font-medium">Source</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{r.guest}</p><p className="text-[10px] text-muted-foreground">{r.phone}</p></td>
                  <td className="px-3 py-2"><p className="font-medium">{r.room || "TBA"}</p><p className="text-[10px] text-muted-foreground">{r.roomType}</p></td>
                  <td className="px-3 py-2 text-xs">{r.checkIn}</td>
                  <td className="px-3 py-2 text-xs">{r.checkOut}</td>
                  <td className="px-3 py-2 font-medium">{r.nights}</td>
                  <td className="px-3 py-2 text-xs">{r.currency === "INR" ? "₹" : r.currency === "USD" ? "$" : r.currency === "EUR" ? "€" : "AED "}{r.rate}/night</td>
                  <td className="px-3 py-2 text-xs">{r.package || "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.source}{r.agency !== "—" && <><br/><span className="text-muted-foreground">{r.agency}</span></>}</td>
                  <td className="px-3 py-2"><Badge variant={r.status === "checked_in" ? "default" : r.status === "confirmed" ? "outline" : r.status === "checked_out" ? "secondary" : r.status === "enquiry" ? "secondary" : "destructive"} className={`text-[10px] capitalize ${r.status === "confirmed" ? "text-green-600" : ""}`}>{r.status.replace("_", " ")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Reservation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Guest Name *</Label><Input placeholder="Full name" /></div>
              <div><Label>Phone / WhatsApp</Label><Input placeholder="+91..." /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Check-in *</Label><Input type="date" /></div>
              <div><Label>Check-out *</Label><Input type="date" /></div>
              <div><Label>Pax</Label><Input type="number" defaultValue="1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Room Type *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="pk">Panchakarma Suite (₹4500/n)</SelectItem><SelectItem value="deluxe">Deluxe (₹6000/n)</SelectItem><SelectItem value="private">Private (₹3500/n)</SelectItem><SelectItem value="general">General Ward (₹800/n)</SelectItem></SelectContent></Select></div>
              <div><Label>Currency</Label><Select defaultValue="INR"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem><SelectItem value="AED">AED</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Package</Label><Select><SelectTrigger><SelectValue placeholder="No package" /></SelectTrigger><SelectContent><SelectItem value="none">No Package</SelectItem><SelectItem value="pk14">14-Day Full Panchakarma</SelectItem><SelectItem value="rej7">7-Day Rejuvenation</SelectItem><SelectItem value="spine21">21-Day Spine Care</SelectItem><SelectItem value="detox">21-Day Detox</SelectItem></SelectContent></Select></div>
              <div><Label>Source / Agency</Label><Input placeholder="Direct / Agency name" /></div>
            </div>
            <div><Label>Advance Paid</Label><Input type="number" placeholder="0" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Reservation created"); setAddOpen(false); }}>Create Reservation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsReservation;
