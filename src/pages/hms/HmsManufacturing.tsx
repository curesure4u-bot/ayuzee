import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Factory, Plus, Beaker, FileCheck, Package, Truck } from "lucide-react";

type BatchRecord = {
  id: string;
  batchNo: string;
  product: string;
  formulation: string;
  startDate: string;
  targetDate: string;
  status: "planning" | "in_production" | "quality_check" | "approved" | "rejected" | "dispatched";
  quantity: string;
  rawMaterials: string[];
};

type RawMaterial = {
  id: string;
  name: string;
  botanicalName: string;
  stock: string;
  vendor: string;
  lastPurchase: string;
  quality: "approved" | "pending" | "rejected";
};

const mockBatches: BatchRecord[] = [
  { id: "1", batchNo: "AYZ-2026-035", product: "Chyawanprash Special", formulation: "Lehyam", startDate: "2026-07-10", targetDate: "2026-07-25", status: "in_production", quantity: "500 jars", rawMaterials: ["Amla", "Guduchi", "Pippali", "Ghee", "Sugar"] },
  { id: "2", batchNo: "AYZ-2026-036", product: "Dhanwantharam Tailam", formulation: "Tailam", startDate: "2026-07-08", targetDate: "2026-07-18", status: "quality_check", quantity: "200 liters", rawMaterials: ["Bala moola", "Sesame oil", "Cow milk", "Dhanwantharam kashaya herbs"] },
  { id: "3", batchNo: "AYZ-2026-037", product: "Triphala Churnam", formulation: "Churnam", startDate: "2026-07-12", targetDate: "2026-07-15", status: "approved", quantity: "100 kg", rawMaterials: ["Haritaki", "Vibhitaki", "Amalaki"] },
  { id: "4", batchNo: "AYZ-2026-038", product: "Kottamchukkadi Tailam", formulation: "Tailam", startDate: "2026-07-14", targetDate: "2026-07-28", status: "planning", quantity: "150 liters", rawMaterials: ["Kottam", "Chukku", "Sesame oil", "Devadaru"] },
];

const mockRawMaterials: RawMaterial[] = [
  { id: "1", name: "Amla (Indian Gooseberry)", botanicalName: "Phyllanthus emblica", stock: "250 kg", vendor: "Kerala Herbs Co.", lastPurchase: "2026-07-01", quality: "approved" },
  { id: "2", name: "Sesame Oil (Tila Tailam)", botanicalName: "Sesamum indicum", stock: "500 liters", vendor: "Organic Oils Ltd.", lastPurchase: "2026-06-25", quality: "approved" },
  { id: "3", name: "Guduchi (Giloy)", botanicalName: "Tinospora cordifolia", stock: "80 kg", vendor: "Himalayan Botanicals", lastPurchase: "2026-07-05", quality: "approved" },
  { id: "4", name: "Haritaki", botanicalName: "Terminalia chebula", stock: "120 kg", vendor: "Kerala Herbs Co.", lastPurchase: "2026-06-20", quality: "pending" },
  { id: "5", name: "Bala (Country Mallow)", botanicalName: "Sida cordifolia", stock: "60 kg", vendor: "Ayur Raw Materials", lastPurchase: "2026-07-10", quality: "approved" },
];

const HmsManufacturing = () => {
  const [batches] = useState<BatchRecord[]>(mockBatches);
  const [rawMaterials] = useState<RawMaterial[]>(mockRawMaterials);
  const [newBatchOpen, setNewBatchOpen] = useState(false);

  const getStatusColor = (status: BatchRecord["status"]) => {
    switch (status) {
      case "planning": return "secondary";
      case "in_production": return "default";
      case "quality_check": return "outline";
      case "approved": return "outline";
      case "rejected": return "destructive";
      case "dispatched": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6 text-orange-600" /> Manufacturing Unit
          </h1>
          <p className="text-sm text-muted-foreground">
            Batch Manufacturing, Raw Materials, GMP Documentation & Quality Control
          </p>
        </div>
        <Button onClick={() => setNewBatchOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Batch
        </Button>
      </div>

      {/* Production Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{batches.filter(b => b.status === "in_production").length}</p><p className="text-xs text-muted-foreground">In Production</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{batches.filter(b => b.status === "quality_check").length}</p><p className="text-xs text-muted-foreground">QC Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{batches.filter(b => b.status === "approved").length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">{rawMaterials.length}</p><p className="text-xs text-muted-foreground">Raw Materials</p></CardContent></Card>
      </div>

      <Tabs defaultValue="batches">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="batches">Batch Records</TabsTrigger>
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="qc">Quality Control</TabsTrigger>
          <TabsTrigger value="formulations">Formulations</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active Batch Manufacturing Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div key={batch.id} className="rounded-lg border p-4 hover:bg-muted/30 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{batch.product}</p>
                          <Badge variant={getStatusColor(batch.status)} className="text-xs capitalize">
                            {batch.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Batch: {batch.batchNo} · {batch.formulation} · {batch.quantity}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Started: {new Date(batch.startDate).toLocaleDateString("en-IN")}</p>
                        <p>Target: {new Date(batch.targetDate).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {batch.rawMaterials.map((rm) => (
                        <Badge key={rm} variant="secondary" className="text-[10px]">{rm}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw-materials" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Raw Material Inventory</CardTitle>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add Material</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Material</th>
                      <th className="px-3 py-2 text-left font-medium">Botanical Name</th>
                      <th className="px-3 py-2 text-left font-medium">Stock</th>
                      <th className="px-3 py-2 text-left font-medium">Vendor</th>
                      <th className="px-3 py-2 text-left font-medium">Last Purchase</th>
                      <th className="px-3 py-2 text-left font-medium">QC Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawMaterials.map((rm) => (
                      <tr key={rm.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{rm.name}</td>
                        <td className="px-3 py-2 italic text-muted-foreground text-xs">{rm.botanicalName}</td>
                        <td className="px-3 py-2">{rm.stock}</td>
                        <td className="px-3 py-2">{rm.vendor}</td>
                        <td className="px-3 py-2">{new Date(rm.lastPurchase).toLocaleDateString("en-IN")}</td>
                        <td className="px-3 py-2">
                          <Badge variant={rm.quality === "approved" ? "outline" : rm.quality === "rejected" ? "destructive" : "secondary"} className="text-xs capitalize">
                            {rm.quality}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qc" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> Quality Control & GMP Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-amber-200 bg-amber-50/30">
                  <CardContent className="p-4">
                    <Beaker className="h-5 w-5 text-amber-600 mb-2" />
                    <p className="text-sm font-medium">Stability Testing</p>
                    <p className="text-xs text-muted-foreground mt-1">Track shelf life and stability parameters for each batch</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">View Tests</Button>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4">
                    <FileCheck className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-sm font-medium">GMP Compliance</p>
                    <p className="text-xs text-muted-foreground mt-1">Standard Operating Procedures & compliance checklist</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">View SOPs</Button>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4">
                    <Package className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-sm font-medium">Label Management</p>
                    <p className="text-xs text-muted-foreground mt-1">Generate and print GMP-compliant product labels</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">Print Labels</Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Label>QC Test Results for Current Batch</Label>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Parameter</th>
                        <th className="px-3 py-2 text-left font-medium">Specification</th>
                        <th className="px-3 py-2 text-left font-medium">Result</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="px-3 py-2">Organoleptic</td><td className="px-3 py-2">Brown, aromatic</td><td className="px-3 py-2">Complies</td><td className="px-3 py-2"><Badge variant="outline" className="text-green-600 text-xs">Pass</Badge></td></tr>
                      <tr className="border-b"><td className="px-3 py-2">pH</td><td className="px-3 py-2">4.5-6.0</td><td className="px-3 py-2">5.2</td><td className="px-3 py-2"><Badge variant="outline" className="text-green-600 text-xs">Pass</Badge></td></tr>
                      <tr className="border-b"><td className="px-3 py-2">Total ash</td><td className="px-3 py-2">NMT 5%</td><td className="px-3 py-2">3.8%</td><td className="px-3 py-2"><Badge variant="outline" className="text-green-600 text-xs">Pass</Badge></td></tr>
                      <tr className="border-b"><td className="px-3 py-2">Microbial count</td><td className="px-3 py-2">NMT 10³ CFU/g</td><td className="px-3 py-2">180 CFU/g</td><td className="px-3 py-2"><Badge variant="outline" className="text-green-600 text-xs">Pass</Badge></td></tr>
                      <tr className="border-b"><td className="px-3 py-2">Heavy metals</td><td className="px-3 py-2">Within limits</td><td className="px-3 py-2">Complies</td><td className="px-3 py-2"><Badge variant="outline" className="text-green-600 text-xs">Pass</Badge></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulations" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Formulation Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Chyawanprash (Ayuzee Special)", type: "Lehyam", ingredients: 48, reference: "AFI Part-I" },
                  { name: "Dhanwantharam Tailam", type: "Tailam", ingredients: 28, reference: "Sahasrayogam" },
                  { name: "Triphala Churnam", type: "Churnam", ingredients: 3, reference: "AFI Part-I" },
                  { name: "Kottamchukkadi Tailam", type: "Tailam", ingredients: 12, reference: "Sahasrayogam" },
                  { name: "Dasamoolarishtam", type: "Arishtam", ingredients: 15, reference: "AFI Part-I" },
                  { name: "Rasnasaptakam Kashayam", type: "Kashayam", ingredients: 7, reference: "Ashtangahridayam" },
                ].map((f) => (
                  <div key={f.name} className="rounded-lg border p-3 hover:bg-muted/30 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{f.name}</p>
                      <Badge variant="outline" className="text-xs">{f.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.ingredients} ingredients · Ref: {f.reference}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Label>Cost Calculation</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a formulation above to view ingredient-wise cost breakup, batch yield, and per-unit manufacturing cost.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Batch Dialog */}
      <Dialog open={newBatchOpen} onOpenChange={setNewBatchOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Batch</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select formulation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chyawanprash">Chyawanprash (Ayuzee Special)</SelectItem>
                  <SelectItem value="dhanwantharam">Dhanwantharam Tailam</SelectItem>
                  <SelectItem value="triphala">Triphala Churnam</SelectItem>
                  <SelectItem value="kottamchukkadi">Kottamchukkadi Tailam</SelectItem>
                  <SelectItem value="dasamoola">Dasamoolarishtam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Batch Size</Label><Input placeholder="e.g., 500 jars" /></div>
              <div><Label>Target Date</Label><Input type="date" /></div>
            </div>
            <div><Label>Notes</Label><Textarea placeholder="Special instructions for this batch..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBatchOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Batch created"); setNewBatchOpen(false); }}>Create Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsManufacturing;
