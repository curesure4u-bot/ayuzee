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
import { Sparkles, CheckCircle, Clock, AlertTriangle, Plus, ShirtIcon as Shirt } from "lucide-react";

type RoomStatus = {
  id: string; room: string; floor: string; type: string;
  status: "clean" | "dirty" | "in_progress" | "blocked" | "inspected";
  assignedTo: string; lastCleaned: string; patient: string;
  priority: "normal" | "urgent" | "checkout";
};

type LaundryItem = {
  id: string; patient: string; room: string; items: string;
  quantity: number; sentDate: string; returnDate: string;
  status: "sent" | "processing" | "ready" | "delivered";
  charge: number;
};

const mockRooms: RoomStatus[] = [
  { id: "1", room: "101", floor: "1st Floor", type: "Private", status: "clean", assignedTo: "Sunita", lastCleaned: "08:30 AM", patient: "Ramesh Kumar", priority: "normal" },
  { id: "2", room: "102", floor: "1st Floor", type: "Private", status: "dirty", assignedTo: "Kavitha", lastCleaned: "Yesterday", patient: "—", priority: "checkout" },
  { id: "3", room: "PK-1", floor: "PK Wing", type: "Panchakarma Suite", status: "in_progress", assignedTo: "Lakshmi", lastCleaned: "In progress", patient: "Sunil Menon", priority: "urgent" },
  { id: "4", room: "PK-2", floor: "PK Wing", type: "Panchakarma Suite", status: "inspected", assignedTo: "Sunita", lastCleaned: "07:45 AM", patient: "Meera Nair", priority: "normal" },
  { id: "5", room: "201", floor: "2nd Floor", type: "Deluxe", status: "clean", assignedTo: "Kavitha", lastCleaned: "08:00 AM", patient: "Lakshmi Devi", priority: "normal" },
  { id: "6", room: "202", floor: "2nd Floor", type: "Deluxe", status: "blocked", assignedTo: "—", lastCleaned: "—", patient: "—", priority: "normal" },
  { id: "7", room: "GW-3", floor: "Ground", type: "General Ward", status: "dirty", assignedTo: "Lakshmi", lastCleaned: "Yesterday PM", patient: "Anand S.", priority: "normal" },
  { id: "8", room: "GW-5", floor: "Ground", type: "General Ward", status: "clean", assignedTo: "Sunita", lastCleaned: "07:30 AM", patient: "—", priority: "normal" },
];

const mockLaundry: LaundryItem[] = [
  { id: "1", patient: "Ramesh Kumar", room: "101", items: "Bed sheets (2), Pillow covers (2), Towels (3)", quantity: 7, sentDate: "2026-07-15 07:00", returnDate: "2026-07-15 14:00", status: "processing", charge: 0 },
  { id: "2", patient: "Meera Nair", room: "PK-2", items: "Treatment sheets (4), Oil-proof covers (2)", quantity: 6, sentDate: "2026-07-15 08:00", returnDate: "2026-07-15 16:00", status: "sent", charge: 0 },
  { id: "3", patient: "Lakshmi Devi", room: "201", items: "Personal clothes (3 sets)", quantity: 3, sentDate: "2026-07-14 09:00", returnDate: "2026-07-15 09:00", status: "delivered", charge: 150 },
  { id: "4", patient: "Sunil Menon", room: "PK-1", items: "Treatment sheets (6), Towels (4), Patient gown (2)", quantity: 12, sentDate: "2026-07-15 09:00", returnDate: "2026-07-15 18:00", status: "sent", charge: 0 },
];

const HmsHousekeeping = () => {
  const [rooms] = useState<RoomStatus[]>(mockRooms);
  const [laundry] = useState<LaundryItem[]>(mockLaundry);
  const [requestOpen, setRequestOpen] = useState(false);

  const clean = rooms.filter(r => r.status === "clean" || r.status === "inspected").length;
  const dirty = rooms.filter(r => r.status === "dirty").length;
  const inProgress = rooms.filter(r => r.status === "in_progress").length;

  const statusColor = (s: RoomStatus["status"]) => {
    switch (s) {
      case "clean": return "bg-green-100 text-green-700 border-green-300";
      case "inspected": return "bg-blue-100 text-blue-700 border-blue-300";
      case "dirty": return "bg-red-100 text-red-700 border-red-300";
      case "in_progress": return "bg-amber-100 text-amber-700 border-amber-300";
      case "blocked": return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyan-600" /> Housekeeping & Laundry
          </h1>
          <p className="text-sm text-muted-foreground">Room cleaning status, auto-requests on checkout, guest laundry, linen tracking</p>
        </div>
        <Button size="sm" onClick={() => setRequestOpen(true)}><Plus className="mr-1 h-4 w-4" /> Cleaning Request</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{clean}</p><p className="text-xs text-muted-foreground">Clean/Ready</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{dirty}</p><p className="text-xs text-muted-foreground">Needs Cleaning</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">{rooms.filter(r => r.status === "blocked").length}</p><p className="text-xs text-muted-foreground">Blocked</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">{laundry.filter(l => l.status === "sent" || l.status === "processing").length}</p><p className="text-xs text-muted-foreground">Laundry Pending</p></CardContent></Card>
      </div>

      <Tabs defaultValue="rooms">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="rooms">Room Status Board</TabsTrigger>
          <TabsTrigger value="laundry">Laundry Tracking</TabsTrigger>
          <TabsTrigger value="stock">Housekeeping Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {rooms.map((room) => (
              <Card key={room.id} className={`${statusColor(room.status)} border`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-lg">{room.room}</p>
                    <Badge variant="outline" className="text-[9px] capitalize">{room.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs">{room.type} · {room.floor}</p>
                  {room.patient !== "—" && <p className="text-xs mt-1 font-medium">{room.patient}</p>}
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    <p>Assigned: {room.assignedTo}</p>
                    <p>Last: {room.lastCleaned}</p>
                  </div>
                  {room.priority !== "normal" && <Badge variant="destructive" className="text-[8px] mt-1">{room.priority}</Badge>}
                  {room.status === "dirty" && <Button size="sm" variant="outline" className="w-full mt-2 h-6 text-[10px]" onClick={() => toast.success(`Room ${room.room} cleaning started`)}>Start Cleaning</Button>}
                  {room.status === "in_progress" && <Button size="sm" className="w-full mt-2 h-6 text-[10px]" onClick={() => toast.success(`Room ${room.room} marked clean`)}>Mark Clean</Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="laundry" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shirt className="h-4 w-4" /> Laundry Tracking</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">Patient / Room</th>
                    <th className="px-3 py-2 text-left font-medium">Items</th>
                    <th className="px-3 py-2 text-left font-medium">Qty</th>
                    <th className="px-3 py-2 text-left font-medium">Sent</th>
                    <th className="px-3 py-2 text-left font-medium">Expected Return</th>
                    <th className="px-3 py-2 text-left font-medium">Charge</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {laundry.map((l) => (
                      <tr key={l.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2"><p className="font-medium">{l.patient}</p><p className="text-xs text-muted-foreground">Room {l.room}</p></td>
                        <td className="px-3 py-2 text-xs">{l.items}</td>
                        <td className="px-3 py-2">{l.quantity}</td>
                        <td className="px-3 py-2 text-xs">{l.sentDate}</td>
                        <td className="px-3 py-2 text-xs">{l.returnDate}</td>
                        <td className="px-3 py-2">{l.charge > 0 ? `₹${l.charge}` : "Hospital"}</td>
                        <td className="px-3 py-2"><Badge variant={l.status === "delivered" ? "outline" : l.status === "ready" ? "default" : "secondary"} className={`text-[10px] capitalize ${l.status === "delivered" ? "text-green-600" : ""}`}>{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Housekeeping Supplies Stock</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">Item</th>
                    <th className="px-3 py-2 text-left font-medium">Stock</th>
                    <th className="px-3 py-2 text-left font-medium">Min Level</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {[
                      { item: "Bed Sheets (White)", stock: 120, min: 50, ok: true },
                      { item: "Pillow Covers", stock: 80, min: 40, ok: true },
                      { item: "Bath Towels", stock: 60, min: 30, ok: true },
                      { item: "Treatment Oil-proof Sheets", stock: 25, min: 20, ok: true },
                      { item: "Floor Cleaner (5L)", stock: 8, min: 10, ok: false },
                      { item: "Hand Wash Refills", stock: 15, min: 10, ok: true },
                      { item: "Disinfectant Spray", stock: 6, min: 8, ok: false },
                      { item: "Patient Gowns", stock: 30, min: 15, ok: true },
                      { item: "Garbage Bags (BMW coded)", stock: 200, min: 100, ok: true },
                    ].map((item) => (
                      <tr key={item.item} className="border-b">
                        <td className="px-3 py-2 font-medium">{item.item}</td>
                        <td className="px-3 py-2">{item.stock}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.min}</td>
                        <td className="px-3 py-2"><Badge variant={item.ok ? "outline" : "destructive"} className={`text-[10px] ${item.ok ? "text-green-600" : ""}`}>{item.ok ? "OK" : "Low Stock"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cleaning Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Room *</Label><Select><SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger><SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.room}>Room {r.room} ({r.type})</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Priority</Label><Select defaultValue="normal"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="checkout">Checkout/Discharge</SelectItem></SelectContent></Select></div>
            <div><Label>Assign To</Label><Select><SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger><SelectContent><SelectItem value="sunita">Sunita</SelectItem><SelectItem value="kavitha">Kavitha</SelectItem><SelectItem value="lakshmi">Lakshmi</SelectItem></SelectContent></Select></div>
            <div><Label>Special Instructions</Label><Input placeholder="e.g., Deep clean after oil therapy, change all linen..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Cleaning request created"); setRequestOpen(false); }}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsHousekeeping;
