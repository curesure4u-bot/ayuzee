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
import {
  Pill, Plus, Search, AlertTriangle, Package, BarChart3,
  ShoppingCart, Barcode, IndianRupee, Calendar,
} from "lucide-react";

type Medicine = {
  id: string;
  name: string;
  type: "classical" | "proprietary" | "in_house";
  category: string;
  batch: string;
  mfgDate: string;
  expDate: string;
  stock: number;
  unit: string;
  mrp: number;
  lowStockThreshold: number;
  barcode: string;
};

const mockMedicines: Medicine[] = [
  { id: "1", name: "Dasamoolarishtam", type: "classical", category: "Arishtam", batch: "B2026-045", mfgDate: "2026-01-15", expDate: "2029-01-14", stock: 48, unit: "bottles", mrp: 185, lowStockThreshold: 10, barcode: "8901234567890" },
  { id: "2", name: "Kottakkal Dhanwantharam Tailam", type: "proprietary", category: "Tailam", batch: "KAL-789", mfgDate: "2025-11-01", expDate: "2028-10-31", stock: 25, unit: "bottles", mrp: 320, lowStockThreshold: 8, barcode: "8901234567891" },
  { id: "3", name: "Simhanada Guggulu", type: "classical", category: "Guggulu", batch: "B2026-102", mfgDate: "2026-03-10", expDate: "2028-03-09", stock: 120, unit: "tablets", mrp: 145, lowStockThreshold: 30, barcode: "8901234567892" },
  { id: "4", name: "Ayuzee Amruthotharam Kashayam", type: "in_house", category: "Kashayam", batch: "AYZ-2026-034", mfgDate: "2026-06-20", expDate: "2027-06-19", stock: 5, unit: "bottles", mrp: 250, lowStockThreshold: 10, barcode: "8901234567893" },
  { id: "5", name: "Rasnasaptakam Kashayam", type: "classical", category: "Kashayam", batch: "B2026-088", mfgDate: "2026-04-05", expDate: "2027-04-04", stock: 62, unit: "bottles", mrp: 175, lowStockThreshold: 15, barcode: "8901234567894" },
  { id: "6", name: "Yogaraja Guggulu", type: "classical", category: "Guggulu", batch: "B2026-110", mfgDate: "2026-05-01", expDate: "2028-04-30", stock: 3, unit: "strips", mrp: 120, lowStockThreshold: 10, barcode: "8901234567895" },
  { id: "7", name: "Ksheerabala 101 Avarti", type: "classical", category: "Tailam", batch: "B2026-055", mfgDate: "2026-02-15", expDate: "2029-02-14", stock: 18, unit: "bottles", mrp: 450, lowStockThreshold: 5, barcode: "8901234567896" },
  { id: "8", name: "Chyawanprash (Ayuzee Special)", type: "in_house", category: "Lehyam", batch: "AYZ-2026-012", mfgDate: "2026-07-01", expDate: "2027-12-31", stock: 35, unit: "jars", mrp: 380, lowStockThreshold: 10, barcode: "8901234567897" },
];

const HmsPharmacyAdvanced = () => {
  const [medicines] = useState<Medicine[]>(mockMedicines);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dispenseOpen, setDispenseOpen] = useState(false);

  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.batch.includes(search);
    const matchType = filterType === "all" || m.type === filterType;
    return matchSearch && matchType;
  });

  const lowStockItems = medicines.filter((m) => m.stock <= m.lowStockThreshold);
  const expiringItems = medicines.filter((m) => {
    const expiry = new Date(m.expDate);
    const today = new Date();
    const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 90 && diffDays > 0;
  });
  const totalValue = medicines.reduce((sum, m) => sum + m.stock * m.mrp, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6 text-emerald-600" /> Pharmacy Store
          </h1>
          <p className="text-sm text-muted-foreground">
            Classical, Proprietary & In-house medicines with batch tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDispenseOpen(true)}>
            <ShoppingCart className="mr-1 h-4 w-4" /> Dispense
          </Button>
          <Button><Plus className="mr-1 h-4 w-4" /> Add Stock</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-2xl font-bold mt-1">{medicines.length}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-600" />
            <p className="text-2xl font-bold mt-1 text-red-600">{lowStockItems.length}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-2xl font-bold mt-1 text-amber-600">{expiringItems.length}</p>
            <p className="text-xs text-muted-foreground">Expiring (90d)</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-lg font-bold mt-1 text-green-600">₹{(totalValue/1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Stock Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Alerts</TabsTrigger>
          <TabsTrigger value="dispensing">Dispensing Log</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name or batch..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="proprietary">Proprietary</SelectItem>
                <SelectItem value="in_house">In-house</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Medicine</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">Batch</th>
                      <th className="px-3 py-2 text-left font-medium">Expiry</th>
                      <th className="px-3 py-2 text-left font-medium">Stock</th>
                      <th className="px-3 py-2 text-left font-medium">MRP</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((med) => (
                      <tr key={med.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.category}</p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs capitalize">{med.type.replace("_", " ")}</Badge>
                        </td>
                        <td className="px-3 py-2 text-xs font-mono">{med.batch}</td>
                        <td className="px-3 py-2 text-xs">{new Date(med.expDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</td>
                        <td className="px-3 py-2 font-medium">{med.stock} {med.unit}</td>
                        <td className="px-3 py-2">₹{med.mrp}</td>
                        <td className="px-3 py-2">
                          {med.stock <= med.lowStockThreshold ? (
                            <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-green-600">In Stock</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" /> Low Stock Items ({lowStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">All items are adequately stocked.</p>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/30">
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">Batch: {m.batch} · Category: {m.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{m.stock} {m.unit}</p>
                        <p className="text-xs text-muted-foreground">Min: {m.lowStockThreshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiry" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <Calendar className="h-4 w-4" /> Expiring Within 90 Days ({expiringItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No items expiring within 90 days.</p>
              ) : (
                <div className="space-y-2">
                  {expiringItems.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/30">
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">Batch: {m.batch} · Stock: {m.stock} {m.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-600">Exp: {new Date(m.expDate).toLocaleDateString("en-IN")}</p>
                        <Button size="sm" variant="outline" className="text-xs mt-1">Mark for Return</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispensing" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Dispensing Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Time</th>
                      <th className="px-3 py-2 text-left font-medium">Patient</th>
                      <th className="px-3 py-2 text-left font-medium">Medicine</th>
                      <th className="px-3 py-2 text-left font-medium">Qty</th>
                      <th className="px-3 py-2 text-left font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Prescribed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="px-3 py-2">09:15</td><td className="px-3 py-2">Ramesh Kumar</td><td className="px-3 py-2">Simhanada Guggulu</td><td className="px-3 py-2">60 tabs</td><td className="px-3 py-2">₹145</td><td className="px-3 py-2">Dr. Sharma</td></tr>
                    <tr className="border-b"><td className="px-3 py-2">09:15</td><td className="px-3 py-2">Ramesh Kumar</td><td className="px-3 py-2">Rasnasaptakam Kashayam</td><td className="px-3 py-2">2 bottles</td><td className="px-3 py-2">₹350</td><td className="px-3 py-2">Dr. Sharma</td></tr>
                    <tr className="border-b"><td className="px-3 py-2">10:30</td><td className="px-3 py-2">Lakshmi Devi</td><td className="px-3 py-2">Dasamoolarishtam</td><td className="px-3 py-2">1 bottle</td><td className="px-3 py-2">₹185</td><td className="px-3 py-2">Dr. Nair</td></tr>
                    <tr className="border-b"><td className="px-3 py-2">11:00</td><td className="px-3 py-2">Sunil Menon</td><td className="px-3 py-2">Yogaraja Guggulu</td><td className="px-3 py-2">90 tabs</td><td className="px-3 py-2">₹360</td><td className="px-3 py-2">Dr. Sharma</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispense Dialog */}
      <Dialog open={dispenseOpen} onOpenChange={setDispenseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dispense Medicine</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient Name / Bill No</Label><Input placeholder="Search patient or scan bill" /></div>
            <div>
              <Label>Medicine</Label>
              <Input placeholder="Search medicine or scan barcode" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Quantity</Label><Input type="number" placeholder="Qty" /></div>
              <div>
                <Label>Batch</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest Batch</SelectItem>
                    <SelectItem value="first_expiry">First Expiry First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>MRP</Label><Input placeholder="Auto" disabled /></div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <Barcode className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Barcode scanning supported for quick dispensing</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispenseOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Medicine dispensed"); setDispenseOpen(false); }}>Dispense & Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPharmacyAdvanced;
