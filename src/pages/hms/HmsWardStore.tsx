import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Package, Warehouse, AlertTriangle, ArrowLeftRight, Plus,
  Search, TrendingDown, BarChart3, RefreshCw, Droplets
} from "lucide-react";

type WardStore = {
  id: string;
  name: string;
  type: string;
  items_count: number;
  low_stock_count: number;
  in_charge: string;
  last_restocked: string;
};

type WardStockItem = {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_level: number;
  expiry: string;
  cost_per_unit: number;
  is_critical: boolean;
};

type ConsumptionEntry = {
  id: string;
  product: string;
  patient: string;
  quantity: number;
  type: string;
  billed: boolean;
  date: string;
};

const mockStores: WardStore[] = [
  { id: "1", name: "General Ward", type: "ward", items_count: 45, low_stock_count: 3, in_charge: "Nurse Priya", last_restocked: "2 hrs ago" },
  { id: "2", name: "Panchakarma Room", type: "panchakarma", items_count: 28, low_stock_count: 5, in_charge: "Therapist Ravi", last_restocked: "1 day ago" },
  { id: "3", name: "ICU Store", type: "icu", items_count: 62, low_stock_count: 2, in_charge: "Nurse Amit", last_restocked: "4 hrs ago" },
  { id: "4", name: "OT Consumables", type: "ot", items_count: 38, low_stock_count: 1, in_charge: "Sister Mary", last_restocked: "6 hrs ago" },
  { id: "5", name: "Emergency Store", type: "emergency", items_count: 55, low_stock_count: 0, in_charge: "Dr. Kumar", last_restocked: "30 min ago" },
];

const mockStockItems: WardStockItem[] = [
  { id: "1", product_name: "Dhanvantari Taila (500ml)", category: "Oils", quantity: 3, unit: "bottles", min_level: 5, expiry: "2025-12-15", cost_per_unit: 450, is_critical: true },
  { id: "2", product_name: "Cotton Rolls (Large)", category: "Consumables", quantity: 25, unit: "packs", min_level: 10, expiry: "2026-06-01", cost_per_unit: 80, is_critical: false },
  { id: "3", product_name: "Bala Taila (200ml)", category: "Oils", quantity: 8, unit: "bottles", min_level: 4, expiry: "2025-09-30", cost_per_unit: 320, is_critical: false },
  { id: "4", product_name: "Disposable Gloves (M)", category: "PPE", quantity: 2, unit: "boxes", min_level: 5, expiry: "2026-03-01", cost_per_unit: 250, is_critical: true },
  { id: "5", product_name: "Triphala Churna (100g)", category: "Medicines", quantity: 15, unit: "packets", min_level: 8, expiry: "2025-11-20", cost_per_unit: 120, is_critical: false },
];

const mockConsumption: ConsumptionEntry[] = [
  { id: "1", product: "Dhanvantari Taila", patient: "Rajesh Kumar", quantity: 1, type: "therapy_use", billed: true, date: "10:30 AM" },
  { id: "2", product: "Cotton Rolls", patient: "Priya Sharma", quantity: 2, type: "patient_use", billed: true, date: "11:15 AM" },
  { id: "3", product: "Disposable Gloves", patient: "-", quantity: 4, type: "patient_use", billed: false, date: "11:45 AM" },
];

const HmsWardStore = () => {
  const [stores] = useState<WardStore[]>(mockStores);
  const [stockItems] = useState<WardStockItem[]>(mockStockItems);
  const [consumption] = useState<ConsumptionEntry[]>(mockConsumption);
  const [selectedStore, setSelectedStore] = useState<string>("1");
  const [transferOpen, setTransferOpen] = useState(false);
  const [consumeOpen, setConsumeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTransfer = () => {
    toast.success("Stock transfer request submitted for approval.");
    setTransferOpen(false);
  };

  const handleConsume = () => {
    toast.success("Consumption logged and billed to patient.");
    setConsumeOpen(false);
  };

  const lowStockItems = stockItems.filter(i => i.quantity <= i.min_level);
  const totalValue = stockItems.reduce((sum, i) => sum + (i.quantity * i.cost_per_unit), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary" /> Ward-wise Store Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage consumables per ward with auto-debit and transfer workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/ipd"}>IPD & Wards</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/stock"}>Main Stock</Button>
          <Button size="sm" variant="outline" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRight className="mr-1 h-4 w-4" /> Transfer
          </Button>
          <Button size="sm" onClick={() => setConsumeOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Log Consumption
          </Button>
        </div>
      </div>

      {/* Ward Store Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {stores.map((store) => (
          <Card
            key={store.id}
            className={`cursor-pointer transition ${selectedStore === store.id ? "ring-2 ring-primary" : "hover:bg-muted/30"}`}
            onClick={() => setSelectedStore(store.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Warehouse className="h-4 w-4 text-primary" />
                {store.low_stock_count > 0 && (
                  <Badge variant="destructive" className="text-xs">{store.low_stock_count} low</Badge>
                )}
              </div>
              <p className="font-medium text-sm">{store.name}</p>
              <p className="text-xs text-muted-foreground">{store.items_count} items · {store.in_charge}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Restocked: {store.last_restocked}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs: Stock / Low Stock / Consumption Log */}
      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Stock Items</TabsTrigger>
          <TabsTrigger value="low-stock" className="relative">
            Low Stock
            {lowStockItems.length > 0 && <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{lowStockItems.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="consumption">Consumption Log</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Stock Items</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Total Value: ₹{totalValue.toLocaleString()}</span>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input className="pl-7 h-8 text-xs" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stockItems.filter(i => i.product_name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded border p-3">
                    <div className="flex items-center gap-3">
                      {item.is_critical && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <div>
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">{item.category} · Exp: {item.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className={`text-sm font-bold ${item.quantity <= item.min_level ? "text-red-600" : "text-green-600"}`}>
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">Min: {item.min_level}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">₹{item.cost_per_unit}/{item.unit.slice(0, -1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-600"><TrendingDown className="h-4 w-4" /> Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded border border-red-100 bg-red-50/50 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-red-600">Only {item.quantity} {item.unit} left (min: {item.min_level})</p>
                    </div>
                    <Button size="sm" variant="outline">Request Restock</Button>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">All items are well stocked.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Today's Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consumption.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium">{entry.product}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.patient !== "-" ? `Patient: ${entry.patient}` : "General use"} · Qty: {entry.quantity} · {entry.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.billed ? "outline" : "secondary"}>{entry.billed ? "Billed" : "Not billed"}</Badge>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5" /> Stock Transfer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>From Store</Label>
              <Select defaultValue="1"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>To Store</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Product</Label><Input placeholder="Search product..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" placeholder="0" /></div>
              <div><Label>Reason</Label><Input placeholder="e.g. Low stock at ward" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer}>Submit Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consume Dialog */}
      <Dialog open={consumeOpen} onOpenChange={setConsumeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Log Consumption</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Product</Label><Input placeholder="Search product to consume..." /></div>
            <div><Label>Patient (optional)</Label><Input placeholder="Patient name or ID for billing" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" placeholder="1" /></div>
              <div><Label>Type</Label>
                <Select defaultValue="patient_use"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient_use">Patient Use</SelectItem>
                    <SelectItem value="therapy_use">Therapy/Panchakarma</SelectItem>
                    <SelectItem value="wastage">Wastage</SelectItem>
                    <SelectItem value="expired">Expired Discard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="bill-patient" defaultChecked className="rounded" />
              <label htmlFor="bill-patient" className="text-sm">Bill to patient</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumeOpen(false)}>Cancel</Button>
            <Button onClick={handleConsume}>Log & Debit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsWardStore;
