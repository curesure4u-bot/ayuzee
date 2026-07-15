import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BedDouble, Plus, Edit, Trash2, IndianRupee } from "lucide-react";

type Ward = {
  id: string;
  code: string;
  name: string;
  type: string;
  floor: string;
  totalBeds: number;
  occupied: number;
  available: number;
  ratePerDay: number;
  amenities: string[];
  status: "active" | "inactive";
};

const mockWards: Ward[] = [
  { id: "1", code: "W-GEN", name: "General Ward", type: "General", floor: "Ground Floor", totalBeds: 20, occupied: 12, available: 8, ratePerDay: 800, amenities: ["Fan", "Shared Bathroom"], status: "active" },
  { id: "2", code: "W-SP", name: "Semi-Private Room", type: "Semi-Private", floor: "First Floor", totalBeds: 10, occupied: 7, available: 3, ratePerDay: 2000, amenities: ["AC", "TV", "Shared Bathroom"], status: "active" },
  { id: "3", code: "W-PVT", name: "Private Room", type: "Private", floor: "First Floor", totalBeds: 8, occupied: 5, available: 3, ratePerDay: 3500, amenities: ["AC", "TV", "Attached Bathroom", "Attendant Bed"], status: "active" },
  { id: "4", code: "W-DLX", name: "Deluxe Suite", type: "Deluxe", floor: "Second Floor", totalBeds: 4, occupied: 2, available: 2, ratePerDay: 6000, amenities: ["AC", "TV", "Attached Bath", "Sofa", "Fridge", "Attendant Bed"], status: "active" },
  { id: "5", code: "W-PK", name: "Panchakarma Suite", type: "Therapy", floor: "Block B", totalBeds: 12, occupied: 9, available: 3, ratePerDay: 4500, amenities: ["AC", "Attached Bath", "Therapy Bed", "Oil-proof Sheets", "Herbal Steam Unit"], status: "active" },
  { id: "6", code: "W-ICU", name: "AYUSH ICU / Critical Care", type: "ICU", floor: "Ground Floor", totalBeds: 4, occupied: 1, available: 3, ratePerDay: 8000, amenities: ["AC", "Monitor", "O2 Supply", "Nurse Station", "Crash Cart"], status: "active" },
  { id: "7", code: "W-DAY", name: "Day Care (Outpatient Therapy)", type: "Day Care", floor: "Block B", totalBeds: 8, occupied: 4, available: 4, ratePerDay: 0, amenities: ["Recliner", "Fan", "Curtain Partition"], status: "active" },
];

const WardBedMaster = () => {
  const [wards] = useState<Ward[]>(mockWards);
  const [addOpen, setAddOpen] = useState(false);

  const totalBeds = wards.reduce((s, w) => s + w.totalBeds, 0);
  const totalOccupied = wards.reduce((s, w) => s + w.occupied, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-blue-600" /> Ward & Bed Master
          </h1>
          <p className="text-sm text-muted-foreground">Define wards, room types, bed numbers, tariff & amenities</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Ward</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{wards.length}</p><p className="text-xs text-muted-foreground">Wards/Types</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{totalBeds}</p><p className="text-xs text-muted-foreground">Total Beds</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{totalBeds - totalOccupied}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{Math.round((totalOccupied / totalBeds) * 100)}%</p><p className="text-xs text-muted-foreground">Occupancy</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Ward Name</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Floor</th>
                  <th className="px-3 py-2 text-left font-medium">Beds</th>
                  <th className="px-3 py-2 text-left font-medium">Occupied</th>
                  <th className="px-3 py-2 text-left font-medium">Rate/Day</th>
                  <th className="px-3 py-2 text-left font-medium">Amenities</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((w, i) => (
                  <tr key={w.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{w.code}</td>
                    <td className="px-3 py-2 font-medium">{w.name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{w.type}</Badge></td>
                    <td className="px-3 py-2 text-xs">{w.floor}</td>
                    <td className="px-3 py-2 font-medium">{w.totalBeds}</td>
                    <td className="px-3 py-2">
                      <span className={w.occupied >= w.totalBeds * 0.8 ? "text-red-600 font-medium" : ""}>{w.occupied}/{w.totalBeds}</span>
                    </td>
                    <td className="px-3 py-2">{w.ratePerDay > 0 ? `₹${w.ratePerDay.toLocaleString("en-IN")}` : "Free"}</td>
                    <td className="px-3 py-2"><div className="flex flex-wrap gap-0.5">{w.amenities.slice(0, 3).map((a) => <Badge key={a} variant="secondary" className="text-[8px]">{a}</Badge>)}{w.amenities.length > 3 && <Badge variant="secondary" className="text-[8px]">+{w.amenities.length - 3}</Badge>}</div></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Ward / Room Type</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ward Code *</Label><Input placeholder="W-XXX" /></div>
              <div><Label>Ward Name *</Label><Input placeholder="Ward name" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Semi-Private">Semi-Private</SelectItem><SelectItem value="Private">Private</SelectItem><SelectItem value="Deluxe">Deluxe</SelectItem><SelectItem value="Therapy">Therapy/Panchakarma</SelectItem><SelectItem value="ICU">ICU</SelectItem><SelectItem value="Day Care">Day Care</SelectItem></SelectContent></Select></div>
              <div><Label>Floor/Block</Label><Input placeholder="e.g., First Floor" /></div>
              <div><Label>Total Beds</Label><Input type="number" placeholder="Number" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rate Per Day (₹)</Label><Input type="number" placeholder="Daily rate" /></div>
              <div><Label>Amenities</Label><Input placeholder="AC, TV, Bath (comma separated)" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Ward created"); setAddOpen(false); }}>Save Ward</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardBedMaster;
