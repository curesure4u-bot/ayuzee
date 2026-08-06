import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Package, AlertTriangle, Clock, TrendingDown, Search,
  Plus, Download, ShoppingCart, CheckCircle2, XCircle,
  Calendar, BarChart3, RefreshCw, Truck,
} from "lucide-react";

interface Reagent {
  id: string;
  name: string;
  catalogNo: string;
  manufacturer: string;
  department: string;
  category: "Reagent" | "Control" | "Calibrator" | "Consumable" | "Kit";
  lotNumber: string;
  expiryDate: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  maxStock: number;
  pricePerUnit: number;
  linkedTests: string[];
  storageTemp: string;
  status: "In Stock" | "Low Stock" | "Critical" | "Expired" | "Out of Stock";
  lastReceived?: string;
  avgDailyUsage: number;
  daysRemaining: number;
}

interface PurchaseOrder {
  id: string;
  poNo: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: { reagentName: string; quantity: number; unitPrice: number; total: number }[];
  totalAmount: number;
  status: "Draft" | "Ordered" | "Shipped" | "Received" | "Partial";
}

interface ConsumptionLog {
  id: string;
  reagentName: string;
  lotNumber: string;
  date: string;
  quantityUsed: number;
  unit: string;
  usedBy: string;
  testCount: number;
  department: string;
}

const mockReagents: Reagent[] = [
  { id: "r1", name: "Creatinine Reagent R1/R2", catalogNo: "OSR6178", manufacturer: "Beckman Coulter", department: "BIOCHEMISTRY", category: "Reagent", lotNumber: "BC-CRE-2026-045", expiryDate: "2027-03-15", currentStock: 450, unit: "mL", reorderLevel: 200, maxStock: 1000, pricePerUnit: 12, linkedTests: ["Creatinine", "RFT"], storageTemp: "2-8°C", status: "In Stock", lastReceived: "2026-07-10", avgDailyUsage: 15, daysRemaining: 30 },
  { id: "r2", name: "Glucose Reagent GOD-PAP", catalogNo: "OSR6121", manufacturer: "Beckman Coulter", department: "BIOCHEMISTRY", category: "Reagent", lotNumber: "BC-GLU-2026-078", expiryDate: "2027-01-20", currentStock: 180, unit: "mL", reorderLevel: 200, maxStock: 800, pricePerUnit: 8, linkedTests: ["Blood Sugar", "GTT", "RBS"], storageTemp: "2-8°C", status: "Low Stock", lastReceived: "2026-06-25", avgDailyUsage: 25, daysRemaining: 7 },
  { id: "r3", name: "CBC Diluent - Cellpack", catalogNo: "SYS-CP-500", manufacturer: "Sysmex", department: "HAEMATOLOGY", category: "Reagent", lotNumber: "SYS-DIL-2026-112", expiryDate: "2027-06-30", currentStock: 2, unit: "Litre", reorderLevel: 3, maxStock: 10, pricePerUnit: 4500, linkedTests: ["CBC", "ESR"], storageTemp: "15-30°C", status: "Critical", lastReceived: "2026-06-15", avgDailyUsage: 0.5, daysRemaining: 4 },
  { id: "r4", name: "Stromatolyser-4DL", catalogNo: "SYS-4DL-500", manufacturer: "Sysmex", department: "HAEMATOLOGY", category: "Reagent", lotNumber: "SYS-4DL-2026-089", expiryDate: "2027-04-10", currentStock: 3, unit: "Litre", reorderLevel: 2, maxStock: 8, pricePerUnit: 6200, linkedTests: ["CBC - WBC Diff"], storageTemp: "15-30°C", status: "In Stock", lastReceived: "2026-07-01", avgDailyUsage: 0.3, daysRemaining: 10 },
  { id: "r5", name: "QC Control Level 1 (Normal)", catalogNo: "QC-BIO-L1", manufacturer: "Bio-Rad", department: "BIOCHEMISTRY", category: "Control", lotNumber: "BR-QC1-2026-034", expiryDate: "2026-09-30", currentStock: 8, unit: "Vials", reorderLevel: 5, maxStock: 30, pricePerUnit: 850, linkedTests: ["All Biochemistry"], storageTemp: "-20°C", status: "In Stock", lastReceived: "2026-07-05", avgDailyUsage: 1, daysRemaining: 8 },
  { id: "r6", name: "TSH Reagent Kit (100T)", catalogNo: "VTR-TSH-100", manufacturer: "Vitros", department: "BIOCHEMISTRY", category: "Kit", lotNumber: "VT-TSH-2026-015", expiryDate: "2026-08-15", currentStock: 0, unit: "Kit", reorderLevel: 1, maxStock: 5, pricePerUnit: 12000, linkedTests: ["TSH", "Thyroid Profile"], storageTemp: "2-8°C", status: "Out of Stock", avgDailyUsage: 0.2, daysRemaining: 0 },
  { id: "r7", name: "Lipid Calibrator Set", catalogNo: "OSR6199", manufacturer: "Beckman Coulter", department: "BIOCHEMISTRY", category: "Calibrator", lotNumber: "BC-CAL-2025-089", expiryDate: "2026-07-20", currentStock: 2, unit: "Set", reorderLevel: 1, maxStock: 5, pricePerUnit: 3500, linkedTests: ["Lipid Profile"], storageTemp: "2-8°C", status: "Expired", lastReceived: "2025-12-10", avgDailyUsage: 0.05, daysRemaining: 0 },
  { id: "r8", name: "Vacutainer EDTA Tubes (3mL)", catalogNo: "BD-367836", manufacturer: "BD", department: "General", category: "Consumable", lotNumber: "BD-EDTA-2026-445", expiryDate: "2028-01-01", currentStock: 500, unit: "Pcs", reorderLevel: 200, maxStock: 2000, pricePerUnit: 8, linkedTests: ["CBC", "HbA1c"], storageTemp: "Room Temp", status: "In Stock", lastReceived: "2026-07-15", avgDailyUsage: 30, daysRemaining: 16 },
];

const mockPOs: PurchaseOrder[] = [
  { id: "po1", poNo: "PO-2026-0089", supplier: "Beckman Coulter India", orderDate: "2026-07-22", expectedDate: "2026-07-28", items: [{ reagentName: "Glucose Reagent GOD-PAP", quantity: 4, unitPrice: 8, total: 3200 }, { reagentName: "Creatinine Reagent R1/R2", quantity: 2, unitPrice: 12, total: 2400 }], totalAmount: 5600, status: "Ordered" },
  { id: "po2", poNo: "PO-2026-0090", supplier: "Sysmex India Pvt Ltd", orderDate: "2026-07-23", expectedDate: "2026-07-30", items: [{ reagentName: "CBC Diluent - Cellpack", quantity: 5, unitPrice: 4500, total: 22500 }], totalAmount: 22500, status: "Shipped" },
  { id: "po3", poNo: "PO-2026-0091", supplier: "Vitros Diagnostics", orderDate: "2026-07-24", expectedDate: "2026-08-02", items: [{ reagentName: "TSH Reagent Kit (100T)", quantity: 2, unitPrice: 12000, total: 24000 }], totalAmount: 24000, status: "Draft" },
];

const mockConsumption: ConsumptionLog[] = [
  { id: "c1", reagentName: "Creatinine Reagent R1/R2", lotNumber: "BC-CRE-2026-045", date: "2026-07-24", quantityUsed: 15, unit: "mL", usedBy: "Tech. Arun", testCount: 12, department: "BIOCHEMISTRY" },
  { id: "c2", reagentName: "Glucose Reagent GOD-PAP", lotNumber: "BC-GLU-2026-078", date: "2026-07-24", quantityUsed: 25, unit: "mL", usedBy: "Tech. Arun", testCount: 20, department: "BIOCHEMISTRY" },
  { id: "c3", reagentName: "CBC Diluent - Cellpack", lotNumber: "SYS-DIL-2026-112", date: "2026-07-24", quantityUsed: 500, unit: "mL", usedBy: "Tech. Meena", testCount: 34, department: "HAEMATOLOGY" },
  { id: "c4", reagentName: "Vacutainer EDTA Tubes", lotNumber: "BD-EDTA-2026-445", date: "2026-07-24", quantityUsed: 34, unit: "Pcs", usedBy: "Phlebotomist", testCount: 34, department: "General" },
  { id: "c5", reagentName: "QC Control Level 1", lotNumber: "BR-QC1-2026-034", date: "2026-07-24", quantityUsed: 1, unit: "Vial", usedBy: "Tech. Arun", testCount: 0, department: "BIOCHEMISTRY" },
];

const ReagentInventory = () => {
  const [reagents] = useState<Reagent[]>(mockReagents);
  const [purchaseOrders] = useState<PurchaseOrder[]>(mockPOs);
  const [consumption] = useState<ConsumptionLog[]>(mockConsumption);
  const [activeTab, setActiveTab] = useState("stock");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredReagents = reagents.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const lowStockCount = reagents.filter(r => r.status === "Low Stock" || r.status === "Critical").length;
  const expiredCount = reagents.filter(r => r.status === "Expired").length;
  const outOfStockCount = reagents.filter(r => r.status === "Out of Stock").length;
  const totalValue = reagents.reduce((sum, r) => sum + (r.currentStock * r.pricePerUnit), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-700";
      case "Low Stock": return "bg-amber-100 text-amber-700";
      case "Critical": return "bg-red-100 text-red-700";
      case "Expired": return "bg-purple-100 text-purple-700";
      case "Out of Stock": return "bg-gray-200 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPOStatusColor = (status: string) => {
    switch (status) {
      case "Received": return "bg-green-100 text-green-700";
      case "Shipped": return "bg-blue-100 text-blue-700";
      case "Ordered": return "bg-amber-100 text-amber-700";
      case "Draft": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Package className="h-5 w-5" /> Reagent & Inventory Management
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info("Auto-order triggered for low stock items")}><ShoppingCart className="mr-1 h-3 w-3" /> Auto Order</Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> Add Reagent</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <Package className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{reagents.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
            <p className="text-[10px] text-muted-foreground">Low / Critical</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <XCircle className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
            <p className="text-[10px] text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <Calendar className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{expiredCount}</p>
            <p className="text-[10px] text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">₹{(totalValue / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-muted-foreground">Stock Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stock">Current Stock</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="consumption">Consumption Log</TabsTrigger>
        </TabsList>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search reagent..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Reagent</th>
                    <th className="px-3 py-2 text-left">Lot #</th>
                    <th className="px-3 py-2 text-left">Dept</th>
                    <th className="px-3 py-2 text-right">Stock</th>
                    <th className="px-3 py-2 text-right">Reorder</th>
                    <th className="px-3 py-2 text-left">Expiry</th>
                    <th className="px-3 py-2 text-right">Days Left</th>
                    <th className="px-3 py-2 text-left">Storage</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReagents.map((reagent) => (
                    <tr key={reagent.id} className={`border-b ${reagent.status === "Critical" || reagent.status === "Out of Stock" ? "bg-red-50" : reagent.status === "Low Stock" ? "bg-amber-50" : reagent.status === "Expired" ? "bg-purple-50" : ""}`}>
                      <td className="px-3 py-2">
                        <p className="font-medium">{reagent.name}</p>
                        <p className="text-[10px] text-muted-foreground">{reagent.manufacturer} | {reagent.catalogNo}</p>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{reagent.lotNumber}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{reagent.department}</Badge></td>
                      <td className="px-3 py-2 text-right font-medium">{reagent.currentStock} {reagent.unit}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{reagent.reorderLevel} {reagent.unit}</td>
                      <td className="px-3 py-2">{reagent.expiryDate}</td>
                      <td className="px-3 py-2 text-right">
                        {reagent.daysRemaining > 0 ? (
                          <span className={reagent.daysRemaining <= 7 ? "text-red-600 font-bold" : ""}>{reagent.daysRemaining}d</span>
                        ) : <span className="text-red-600 font-bold">0</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{reagent.storageTemp}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getStatusColor(reagent.status)}`}>{reagent.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-3">
          <div className="flex items-center justify-between">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New PO</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">PO No</th>
                    <th className="px-3 py-2 text-left">Supplier</th>
                    <th className="px-3 py-2 text-left">Order Date</th>
                    <th className="px-3 py-2 text-left">Expected</th>
                    <th className="px-3 py-2 text-left">Items</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b">
                      <td className="px-3 py-2 font-medium">{po.poNo}</td>
                      <td className="px-3 py-2">{po.supplier}</td>
                      <td className="px-3 py-2">{po.orderDate}</td>
                      <td className="px-3 py-2">{po.expectedDate}</td>
                      <td className="px-3 py-2">
                        {po.items.map((item, i) => (
                          <p key={i} className="text-[10px]">{item.reagentName} × {item.quantity}</p>
                        ))}
                      </td>
                      <td className="px-3 py-2 text-right font-bold">₹{po.totalAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getPOStatusColor(po.status)}`}>{po.status}</Badge></td>
                      <td className="px-3 py-2 text-center">
                        {po.status === "Shipped" && <Button size="sm" className="h-5 text-[9px] bg-green-600" onClick={() => toast.success("Marked as received")}>Receive</Button>}
                        {po.status === "Draft" && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.success("PO submitted")}>Submit</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumption Log Tab */}
        <TabsContent value="consumption" className="space-y-3">
          <div className="flex items-center gap-2">
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                <SelectItem value="BIOCHEMISTRY">Biochemistry</SelectItem>
                <SelectItem value="HAEMATOLOGY">Haematology</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Reagent</th>
                    <th className="px-3 py-2 text-left">Lot #</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-right">Qty Used</th>
                    <th className="px-3 py-2 text-right">Tests Run</th>
                    <th className="px-3 py-2 text-left">Used By</th>
                    <th className="px-3 py-2 text-left">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {consumption.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-3 py-2 font-medium">{log.reagentName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{log.lotNumber}</td>
                      <td className="px-3 py-2">{log.date}</td>
                      <td className="px-3 py-2 text-right">{log.quantityUsed} {log.unit}</td>
                      <td className="px-3 py-2 text-right">{log.testCount}</td>
                      <td className="px-3 py-2">{log.usedBy}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{log.department}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReagentInventory;
