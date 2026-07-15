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
import { Warehouse, Plus, Search, Truck, AlertTriangle, ArrowRightLeft } from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  category: "medicines" | "oils" | "consumables" | "equipment" | "linen";
  stock: number;
  unit: string;
  reorderLevel: number;
  lastPurchase: string;
  supplier: string;
  location: string;
};

const mockItems: InventoryItem[] = [
  { id: "1", name: "Sesame Oil (Therapy grade)", category: "oils", stock: 50, unit: "liters", reorderLevel: 20, lastPurchase: "2026-07-01", supplier: "Organic Oils Ltd", location: "Panchakarma Store" },
  { id: "2", name: "Cotton Rolls (Sterile)", category: "consumables", stock: 200, unit: "packs", reorderLevel: 50, lastPurchase: "2026-06-28", supplier: "MedSupply India", location: "Main Store" },
  { id: "3", name: "Therapy Bed Sheets", category: "linen", stock: 30, unit: "pieces", reorderLevel: 15, lastPurchase: "2026-06-15", supplier: "Hospital Linen Co.", location: "Laundry" },
  { id: "4", name: "BP Monitor (Digital)", category: "equipment", stock: 5, unit: "units", reorderLevel: 2, lastPurchase: "2026-03-10", supplier: "MedEquip Store", location: "OPD" },
  { id: "5", name: "Dhanwantharam Kuzhambu", category: "oils", stock: 8, unit: "liters", reorderLevel: 10, lastPurchase: "2026-07-05", supplier: "Kottakkal Arya Vaidya Sala", location: "Panchakarma Store" },
  { id: "6", name: "Surgical Gloves", category: "consumables", stock: 500, unit: "pairs", reorderLevel: 100, lastPurchase: "2026-07-10", supplier: "MedSupply India", location: "Main Store" },
  { id: "7", name: "Shirodhara Pot (Brass)", category: "equipment", stock: 4, unit: "units", reorderLevel: 2, lastPurchase: "2025-12-01", supplier: "Ayur Equipment Co.", location: "Panchakarma Room 2" },
  { id: "8", name: "Disposable Towels", category: "consumables", stock: 12, unit: "packs", reorderLevel: 20, lastPurchase: "2026-07-08", supplier: "MedSupply India", location: "Main Store" },
];

const HmsInventory = () => {
  const [items] = useState<InventoryItem[]>(mockItems);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [poOpen, setPoOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || i.category === filterCategory;
    return matchSearch && matchCategory;
  });
  const lowStock = items.filter((i) => i.stock <= i.reorderLevel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-slate-600" /> Inventory & Stores
          </h1>
          <p className="text-sm text-muted-foreground">
            Medicines, Therapy Oils, Consumables, Equipment & Multi-store Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft className="mr-1 h-4 w-4" /> Transfer
          </Button>
          <Button onClick={() => setPoOpen(true)}>
            <Truck className="mr-1 h-4 w-4" /> Purchase Order
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{lowStock.length}</p><p className="text-xs text-muted-foreground">Low Stock</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.filter(i => i.category === "oils").length}</p><p className="text-xs text-muted-foreground">Oils</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.filter(i => i.category === "consumables").length}</p><p className="text-xs text-muted-foreground">Consumables</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.filter(i => i.category === "equipment").length}</p><p className="text-xs text-muted-foreground">Equipment</p></CardContent></Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="medicines">Medicines</SelectItem>
            <SelectItem value="oils">Therapy Oils</SelectItem>
            <SelectItem value="consumables">Consumables</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="linen">Linen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Low Stock Alert</p>
              <p className="text-xs text-red-600">{lowStock.map(i => i.name).join(", ")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Item</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Stock</th>
                  <th className="px-3 py-2 text-left font-medium">Location</th>
                  <th className="px-3 py-2 text-left font-medium">Supplier</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-xs capitalize">{item.category}</Badge></td>
                    <td className="px-3 py-2">{item.stock} {item.unit}</td>
                    <td className="px-3 py-2 text-xs">{item.location}</td>
                    <td className="px-3 py-2 text-xs">{item.supplier}</td>
                    <td className="px-3 py-2">
                      {item.stock <= item.reorderLevel ? (
                        <Badge variant="destructive" className="text-xs">Reorder</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-600">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Order Dialog */}
      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic">Organic Oils Ltd</SelectItem>
                  <SelectItem value="medsupply">MedSupply India</SelectItem>
                  <SelectItem value="kottakkal">Kottakkal Arya Vaidya Sala</SelectItem>
                  <SelectItem value="ayurequip">Ayur Equipment Co.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Item</Label><Input placeholder="Item name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" placeholder="Qty" /></div>
              <div><Label>Expected Date</Label><Input type="date" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPoOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Purchase order created"); setPoOpen(false); }}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Stock Transfer Between Stores</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Item</Label><Input placeholder="Search item" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From Store</Label>
                <Select><SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Store</SelectItem>
                    <SelectItem value="panchakarma">Panchakarma Store</SelectItem>
                    <SelectItem value="opd">OPD Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>To Store</Label>
                <Select><SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Store</SelectItem>
                    <SelectItem value="panchakarma">Panchakarma Store</SelectItem>
                    <SelectItem value="opd">OPD Store</SelectItem>
                    <SelectItem value="branch2">Branch 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Quantity</Label><Input type="number" placeholder="Transfer qty" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Transfer initiated"); setTransferOpen(false); }}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsInventory;
