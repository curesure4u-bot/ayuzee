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
import { Warehouse, Plus, Edit, Trash2, MapPin } from "lucide-react";

type Store = {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  inCharge: string;
  items: number;
  canTransferTo: string[];
  status: "active" | "inactive";
};

const mockStores: Store[] = [
  { id: "1", code: "STR-MAIN", name: "Main Pharmacy Store", type: "Pharmacy", location: "Main Hospital - Ground Floor", inCharge: "Vikram R", items: 320, canTransferTo: ["STR-PK", "STR-OPD", "STR-BR2"], status: "active" },
  { id: "2", code: "STR-PK", name: "Panchakarma Store", type: "Therapy Materials", location: "Block B - Panchakarma Wing", inCharge: "Suresh T", items: 85, canTransferTo: ["STR-MAIN"], status: "active" },
  { id: "3", code: "STR-OPD", name: "OPD Dispensing Counter", type: "Pharmacy", location: "Main Hospital - OPD Block", inCharge: "Priya M", items: 180, canTransferTo: ["STR-MAIN"], status: "active" },
  { id: "4", code: "STR-LAB", name: "Lab Consumables Store", type: "Lab", location: "Main Hospital - Lab Wing", inCharge: "Anita D", items: 95, canTransferTo: ["STR-MAIN"], status: "active" },
  { id: "5", code: "STR-MFG", name: "Manufacturing Raw Materials", type: "Manufacturing", location: "Factory Unit", inCharge: "Dr. Suresh K", items: 150, canTransferTo: ["STR-MAIN"], status: "active" },
  { id: "6", code: "STR-BR2", name: "Branch 2 - City Center Store", type: "Pharmacy", location: "City Center Branch", inCharge: "Ravi S", items: 120, canTransferTo: ["STR-MAIN"], status: "active" },
  { id: "7", code: "STR-GEN", name: "General Store (Non-medical)", type: "General", location: "Main Hospital - Basement", inCharge: "Kavita S", items: 200, canTransferTo: [], status: "active" },
];

const StoreMasterHms = () => {
  const [stores] = useState<Store[]>(mockStores);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-teal-600" /> Store Master
          </h1>
          <p className="text-sm text-muted-foreground">Manage inventory storage locations, access control & transfer rules</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Store</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{stores.length}</p><p className="text-xs text-muted-foreground">Total Stores</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{stores.filter(s => s.type === "Pharmacy").length}</p><p className="text-xs text-muted-foreground">Pharmacy</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{stores.reduce((s, st) => s + st.items, 0)}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{stores.filter(s => s.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Store Name</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Location</th>
                  <th className="px-3 py-2 text-left font-medium">In-charge</th>
                  <th className="px-3 py-2 text-left font-medium">Items</th>
                  <th className="px-3 py-2 text-left font-medium">Can Transfer To</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s, i) => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.code}</td>
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{s.type}</Badge></td>
                    <td className="px-3 py-2 text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</td>
                    <td className="px-3 py-2 text-xs">{s.inCharge}</td>
                    <td className="px-3 py-2 font-medium">{s.items}</td>
                    <td className="px-3 py-2 text-[10px]">{s.canTransferTo.length > 0 ? s.canTransferTo.join(", ") : "—"}</td>
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
          <DialogHeader><DialogTitle>Add New Store</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Store Code *</Label><Input placeholder="e.g., STR-PK" /></div>
              <div><Label>Store Name *</Label><Input placeholder="Store name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Therapy Materials">Therapy Materials</SelectItem>
                    <SelectItem value="Lab">Lab Consumables</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="General">General (Non-medical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>In-charge</Label><Input placeholder="Responsible person" /></div>
            </div>
            <div><Label>Location</Label><Input placeholder="Building, Floor, Block" /></div>
            <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Store created"); setAddOpen(false); }}>Save Store</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreMasterHms;
