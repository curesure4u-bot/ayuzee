import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Download, Printer, Package } from "lucide-react";
import type { StockProduct } from "@/types/stock-hms";

const mockProducts: StockProduct[] = [
  {
    id: "1", pCode: "P001", hsn: "3004", name: "DASAMOOLARISHTAM 450ML", shortCode: "DSM", composition: "Dasamoola",
    manufacturerId: "10", manufacturerName: "KOTTAKKAL", marketedById: "13", marketedByName: "KOTTAKKAL ARYA VAIDYA SALA",
    type: "Arishta", scheduleCode: "Ayurveda", pharmacologicalName: "Dasamoola", vgd: "",
    strength: "450", strengthUnit: "ml", categoryId: "11", categoryName: "ARISHTAM",
    subCategoryId: "19", subCategoryName: "AYURVEDA GENERAL", reorderLevel: 10,
    indicationName: "VATA DISORDERS", purchaseUnit: "Bottle", purchasePrice: 145, mrp: 185,
    marginPercent: 21.6, tax: 12, riskLevel: "", status: "Active", createdAt: "2025-01-15", createdBy: "ADMIN",
  },
  {
    id: "2", pCode: "P002", hsn: "3004", name: "SIMHANADA GUGGULU", shortCode: "SNG",
    manufacturerId: "10", manufacturerName: "KOTTAKKAL", type: "Guggulu", scheduleCode: "Ayurveda",
    categoryId: "9", categoryName: "GUGGULU", subCategoryId: "15", subCategoryName: "JOINT CARE",
    reorderLevel: 30, purchaseUnit: "Strip", purchasePrice: 110, mrp: 145, marginPercent: 24.1,
    tax: 12, riskLevel: "", status: "Active", createdAt: "2025-01-15", createdBy: "ADMIN",
  },
  {
    id: "3", pCode: "P003", hsn: "3004", name: "KSHEERABALA 101 AVARTI", shortCode: "KB101",
    manufacturerId: "10", manufacturerName: "KOTTAKKAL", type: "Thailam", scheduleCode: "Ayurveda",
    categoryId: "7", categoryName: "THAILAM", subCategoryId: "18", subCategoryName: "PANCHAKARMA OILS",
    reorderLevel: 5, purchaseUnit: "Bottle", purchasePrice: 380, mrp: 450, marginPercent: 15.5,
    tax: 12, riskLevel: "", status: "Active", createdAt: "2025-02-01", createdBy: "ADMIN",
  },
  {
    id: "4", pCode: "P004", hsn: "3004", name: "AAVARAI KUDINEER 50GM", shortCode: "AK50",
    manufacturerId: "11", manufacturerName: "ALSHIFA", type: "Kashayam", scheduleCode: "Siddha",
    categoryId: "15", categoryName: "OTC", subCategoryId: "20", subCategoryName: "SIDDHA GENERAL",
    reorderLevel: 10, purchaseUnit: "Pack", purchasePrice: 45.50, mrp: 65, marginPercent: 30,
    tax: 5, riskLevel: "", status: "Active", createdAt: "2025-03-10", createdBy: "ADMIN",
  },
  {
    id: "5", pCode: "P005", hsn: "3304", name: "777 SOAP", shortCode: "777S",
    manufacturerId: "12", manufacturerName: "SANJEEVI", type: "Soap", scheduleCode: "OTC",
    categoryId: "20", categoryName: "SOAP", subCategoryId: "13", subCategoryName: "SKIN CARE",
    reorderLevel: 15, purchaseUnit: "Piece", purchasePrice: 63.84, mrp: 79, marginPercent: 19.2,
    tax: 18, riskLevel: "", status: "Active", createdAt: "2025-03-15", createdBy: "ADMIN",
  },
];

const ProductList = () => {
  const [products] = useState<StockProduct[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [manageType, setManageType] = useState<"product" | "frame" | "lens" | "lab" | "kit" | "linen">("product");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pCode.toLowerCase().includes(search.toLowerCase()) ||
    (p.manufacturerName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header with Sub-nav tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/product/new">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </Link>
        <Select value={manageType} onValueChange={(v: any) => setManageType(v)}>
          <SelectTrigger className="w-[140px] h-8 text-sm bg-orange-100 border-orange-300">
            <SelectValue placeholder="Manage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="frame">Frame</SelectItem>
            <SelectItem value="lens">Lens</SelectItem>
            <SelectItem value="lab">Lab</SelectItem>
            <SelectItem value="kit">Kit</SelectItem>
            <SelectItem value="linen">Linen</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-300">
          Manage Inactive
        </Button>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Product</h2>
      </div>

      {/* Export & Print */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
          <Download className="mr-1 h-3 w-3" /> Export As CSV
        </Button>
        <Button variant="outline" size="sm">
          <Printer className="mr-1 h-3 w-3" /> Print
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">PCode</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">HSN</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Short Code</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Mfr</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Combination</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Type</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Category</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Sub Category</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Indication</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Unit</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Pack Unit</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Schedule Code</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Risk Level</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">ReOrder Level</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Tax</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Unit Rate</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Unit MRP</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Buy from Quotation</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Created By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="px-4 py-8 text-center text-muted-foreground">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="px-2 py-2 font-mono">{p.pCode}</td>
                      <td className="px-2 py-2">{p.hsn}</td>
                      <td className="px-2 py-2 font-medium max-w-[150px] truncate">{p.name}</td>
                      <td className="px-2 py-2">{p.shortCode}</td>
                      <td className="px-2 py-2">{p.manufacturerName}</td>
                      <td className="px-2 py-2">{p.composition ?? ""}</td>
                      <td className="px-2 py-2">{p.type}</td>
                      <td className="px-2 py-2">{p.categoryName}</td>
                      <td className="px-2 py-2">{p.subCategoryName}</td>
                      <td className="px-2 py-2">{p.indicationName ?? ""}</td>
                      <td className="px-2 py-2">{p.purchaseUnit}</td>
                      <td className="px-2 py-2">{p.packUnit ?? ""}</td>
                      <td className="px-2 py-2">{p.scheduleCode}</td>
                      <td className="px-2 py-2">{p.riskLevel || "—"}</td>
                      <td className="px-2 py-2">{p.reorderLevel}</td>
                      <td className="px-2 py-2">{p.tax}%</td>
                      <td className="px-2 py-2">₹{p.purchasePrice}</td>
                      <td className="px-2 py-2">₹{p.mrp}</td>
                      <td className="px-2 py-2">
                        <Badge variant={p.status === "Active" ? "default" : "secondary"} className="text-xs">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-2 py-2">{p.buyFromQuotation ? "Yes" : "No"}</td>
                      <td className="px-2 py-2">{p.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductList;
