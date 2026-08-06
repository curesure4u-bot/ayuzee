import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { StockProduct, ProductType, ScheduleCode, RiskLevel } from "@/types/stock-hms";

const productTypes: ProductType[] = [
  "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops",
  "Powder", "Churnam", "Kashayam", "Thailam", "Ghritam", "Guggulu", "Lepa",
  "Bhasma", "Vati", "Arka", "Asava", "Arishta", "Lehyam", "Soap", "Oil",
  "Strip", "Bottle", "Tube", "Sachet", "Kit", "Linen", "Lab", "Frame", "Lens", "Other",
];

const scheduleCodes: ScheduleCode[] = ["H", "H1", "G", "X", "Schedule-H", "Schedule-H1", "Schedule-G", "Schedule-X", "OTC", "Ayurveda", "Homeo", "Unani", "Siddha", ""];

const ProductForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productConsultation: "",
    name: "",
    manufacturerId: "",
    marketedById: "",
    type: "" as ProductType | "",
    scheduleCode: "" as ScheduleCode,
    composition: "",
    pharmacologicalName: "",
    vgd: "",
    strength: "",
    strengthUnit: "mg",
    categoryId: "",
    subCategoryId: "",
    reorderLevel: "",
    indicationId: "",
    purchaseUnit: "",
    purchasePrice: "",
    mrp: "",
    marginPercent: "",
    temperature: "",
    uom: "",
    hsn: "",
    shortCode: "",
    tax: "",
    riskLevel: "" as RiskLevel | "",
    status: "Active",
    allowSaleRatio: "",
    isMrpMandatory: true,
    buyFromQuotation: false,
    // Prescription params
    prescType: "",
    prescDosage: "",
    prescDuration: "",
    prescRoute: "",
    prescUnit: "",
    prescInstruction: "N/A" as "Before Food" | "After Food" | "N/A",
    prescFrequencyMorn: "",
    prescFrequencyNoon: "",
    prescFrequencyEve: "",
    prescFrequencyNight: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    // Auto-calculate margin
    if (field === "purchasePrice" || field === "mrp") {
      const pp = field === "purchasePrice" ? parseFloat(value) : parseFloat(form.purchasePrice);
      const mrp = field === "mrp" ? parseFloat(value) : parseFloat(form.mrp);
      if (pp && mrp && mrp > 0) {
        const margin = ((mrp - pp) / mrp) * 100;
        setForm((prev) => ({ ...prev, [field]: value, marginPercent: margin.toFixed(2) }));
      }
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.purchaseUnit) {
      toast.error("Purchase unit is required");
      return;
    }
    if (!form.purchasePrice) {
      toast.error("Purchase price is required");
      return;
    }
    if (!form.mrp) {
      toast.error("MRP is required");
      return;
    }
    if (!form.marginPercent) {
      toast.error("Margin % is required");
      return;
    }
    toast.success("Product saved successfully");
    navigate("/hms/stock/product");
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Product</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Product Consultation */}
          <div>
            <Label className="text-sm font-medium">Product Consultation</Label>
            <Input value={form.productConsultation} onChange={(e) => handleChange("productConsultation", e.target.value)} />
          </div>

          {/* Name */}
          <div>
            <Label className="text-sm font-medium">Name *</Label>
            <Input placeholder="Product Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>

          {/* Manufacturer & Marketed By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Manufacturer</Label>
              <div className="flex items-center gap-2">
                <Select value={form.manufacturerId} onValueChange={(v) => handleChange("manufacturerId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Manufacturer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">APPLE THERAPE</SelectItem>
                    <SelectItem value="8">HIMALAYA</SelectItem>
                    <SelectItem value="9">DABUR</SelectItem>
                    <SelectItem value="10">KOTTAKKAL</SelectItem>
                    <SelectItem value="11">ALSHIFA</SelectItem>
                    <SelectItem value="12">SANJEEVI</SelectItem>
                    <SelectItem value="13">HAMDARD</SelectItem>
                    <SelectItem value="14">BAIDYANATH</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="link" size="sm" className="text-orange-600 text-xs whitespace-nowrap">Add New Manufacturer</Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Marketed By</Label>
              <div className="flex items-center gap-2">
                <Select value={form.marketedById} onValueChange={(v) => handleChange("marketedById", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Marketed By" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">SHREE MURUGAN AGENCIES</SelectItem>
                    <SelectItem value="8">LIVA HEALTHCARE</SelectItem>
                    <SelectItem value="9">APPLE THERAPEUTICS PVT LTD</SelectItem>
                    <SelectItem value="11">HIMALAYA DRUG COMPANY</SelectItem>
                    <SelectItem value="13">KOTTAKKAL ARYA VAIDYA SALA</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="link" size="sm" className="text-orange-600 text-xs whitespace-nowrap">Add New Marketed By</Button>
              </div>
            </div>
          </div>

          {/* Type */}
          <div>
            <Label className="text-sm font-medium">Type *</Label>
            <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
              <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent>
                {productTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Code */}
          <div>
            <Label className="text-sm font-medium">Schedule Code *</Label>
            <Select value={form.scheduleCode} onValueChange={(v) => handleChange("scheduleCode", v)}>
              <SelectTrigger><SelectValue placeholder="Schedule" /></SelectTrigger>
              <SelectContent>
                {scheduleCodes.filter(Boolean).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Composition */}
          <div>
            <Label className="text-sm font-medium">Composition</Label>
            <Input placeholder="Single" value={form.composition} onChange={(e) => handleChange("composition", e.target.value)} />
          </div>

          {/* Pharmacological Name */}
          <div>
            <Label className="text-sm font-medium">Pharmacological Name</Label>
            <Select value={form.pharmacologicalName} onValueChange={(v) => handleChange("pharmacologicalName", v)}>
              <SelectTrigger><SelectValue placeholder="Select Pharmacological Name" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ASHWAGANDHA">ASHWAGANDHA</SelectItem>
                <SelectItem value="GUGGULU">GUGGULU</SelectItem>
                <SelectItem value="TRIPHALA">TRIPHALA</SelectItem>
                <SelectItem value="BRAHMI">BRAHMI</SelectItem>
                <SelectItem value="SHATAVARI">SHATAVARI</SelectItem>
                <SelectItem value="PARACETAMOL">PARACETAMOL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* VGD */}
          <div>
            <Label className="text-sm font-medium">VGD</Label>
            <Input value={form.vgd} onChange={(e) => handleChange("vgd", e.target.value)} />
          </div>

          {/* Strength */}
          <div>
            <Label className="text-sm font-medium">Strength</Label>
            <div className="flex gap-2">
              <Input placeholder="Strength" value={form.strength} onChange={(e) => handleChange("strength", e.target.value)} className="flex-1" />
              <div className="flex gap-1">
                <Button variant={form.strengthUnit === "Unit" ? "default" : "outline"} size="sm" onClick={() => handleChange("strengthUnit", "Unit")}>Unit</Button>
                <Button variant={form.strengthUnit === "mg" ? "default" : "outline"} size="sm" onClick={() => handleChange("strengthUnit", "mg")}>mg</Button>
              </div>
            </div>
          </div>

          {/* Category & Sub-Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <div className="flex items-center gap-2">
                <Select value={form.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">TABLET</SelectItem>
                    <SelectItem value="2">CAPSULE</SelectItem>
                    <SelectItem value="5">KASHAYAM</SelectItem>
                    <SelectItem value="7">THAILAM</SelectItem>
                    <SelectItem value="9">GUGGULU</SelectItem>
                    <SelectItem value="11">ARISHTAM</SelectItem>
                    <SelectItem value="15">OTC</SelectItem>
                    <SelectItem value="20">SOAP</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="link" size="sm" className="text-orange-600 text-xs whitespace-nowrap">Add New Category</Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Sub-Category</Label>
              <div className="flex items-center gap-2">
                <Select value={form.subCategoryId} onValueChange={(v) => handleChange("subCategoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">GASTRIC CARE</SelectItem>
                    <SelectItem value="9">ANTI-INFLAMMATORY</SelectItem>
                    <SelectItem value="13">SKIN CARE</SelectItem>
                    <SelectItem value="15">JOINT CARE</SelectItem>
                    <SelectItem value="18">PANCHAKARMA OILS</SelectItem>
                    <SelectItem value="19">AYURVEDA GENERAL</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="link" size="sm" className="text-orange-600 text-xs whitespace-nowrap">Add New Sub Category</Button>
              </div>
            </div>
          </div>

          {/* ReOrder Level */}
          <div>
            <Label className="text-sm font-medium">ReOrder Level</Label>
            <Input type="number" value={form.reorderLevel} onChange={(e) => handleChange("reorderLevel", e.target.value)} />
          </div>

          {/* Indication */}
          <div>
            <Label className="text-sm font-medium">Indication</Label>
            <Select value={form.indicationId} onValueChange={(v) => handleChange("indicationId", v)}>
              <SelectTrigger><SelectValue placeholder="Select Indication" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">PAIN RELIEF</SelectItem>
                <SelectItem value="3">ARTHRITIS</SelectItem>
                <SelectItem value="6">GASTRIC DISORDERS</SelectItem>
                <SelectItem value="9">VATA DISORDERS</SelectItem>
                <SelectItem value="12">DIGESTIVE</SelectItem>
                <SelectItem value="13">IMMUNITY BOOSTER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Unit */}
          <div>
            <Label className="text-sm font-medium">Purchase Unit *</Label>
            <Input placeholder="Box / Strip / Bottle / Pack" value={form.purchaseUnit} onChange={(e) => handleChange("purchaseUnit", e.target.value)} />
          </div>

          {/* Purchase Price */}
          <div>
            <Label className="text-sm font-medium">Purchase Price * <span className="text-xs text-muted-foreground ml-2">Purchase Price</span></Label>
            <Input type="number" step="0.01" value={form.purchasePrice} onChange={(e) => handleChange("purchasePrice", e.target.value)} />
          </div>

          {/* MRP */}
          <div>
            <Label className="text-sm font-medium">MRP * <span className="text-xs text-muted-foreground ml-2">MRP</span></Label>
            <Input type="number" step="0.01" value={form.mrp} onChange={(e) => handleChange("mrp", e.target.value)} />
          </div>

          {/* Margin */}
          <div>
            <Label className="text-sm font-medium">Margin (%) * <span className="text-xs text-muted-foreground ml-2">Margin</span></Label>
            <Input type="number" step="0.01" value={form.marginPercent} onChange={(e) => handleChange("marginPercent", e.target.value)} />
          </div>

          {/* Temperature */}
          <div>
            <Label className="text-sm font-medium">Temperature</Label>
            <Input placeholder="Temperature" value={form.temperature} onChange={(e) => handleChange("temperature", e.target.value)} />
          </div>

          {/* UOM */}
          <div>
            <Label className="text-sm font-medium">UOM</Label>
            <Input placeholder="Product Unit" value={form.uom} onChange={(e) => handleChange("uom", e.target.value)} />
          </div>

          {/* HSN */}
          <div>
            <Label className="text-sm font-medium">HSN <span className="text-xs text-muted-foreground ml-2">It's used for search the sales</span></Label>
            <Input placeholder="" value={form.hsn} onChange={(e) => handleChange("hsn", e.target.value)} />
          </div>

          {/* Prod Short Code */}
          <div>
            <Label className="text-sm font-medium">Prod Short Code</Label>
            <Input value={form.shortCode} onChange={(e) => handleChange("shortCode", e.target.value)} />
          </div>

          {/* Tax */}
          <div>
            <Label className="text-sm font-medium">Tax</Label>
            <Input type="number" value={form.tax} onChange={(e) => handleChange("tax", e.target.value)} />
          </div>

          {/* Risk Level */}
          <div>
            <Label className="text-sm font-medium">Risk Level</Label>
            <Select value={form.riskLevel} onValueChange={(v) => handleChange("riskLevel", v)}>
              <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium">Status *</Label>
            <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allow Sale Ratio */}
          <div>
            <Label className="text-sm font-medium">Allow Sale Ratio</Label>
            <Input type="number" value={form.allowSaleRatio} onChange={(e) => handleChange("allowSaleRatio", e.target.value)} />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isMrpMandatory} onCheckedChange={(v) => handleChange("isMrpMandatory", v)} />
              <Label className="text-sm">MRP is not mandatory in GRN</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.buyFromQuotation} onCheckedChange={(v) => handleChange("buyFromQuotation", v)} />
              <Label className="text-sm">Buy From Quotation</Label>
            </div>
          </div>

          {/* Prescription Params Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-sm mb-3">Prescription Params</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={form.prescType} onValueChange={(v) => handleChange("prescType", v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      {productTypes.slice(0, 20).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Dosage</Label>
                  <Input className="h-8 text-sm" value={form.prescDosage} onChange={(e) => handleChange("prescDosage", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Duration(Days)</Label>
                  <Input className="h-8 text-sm" value={form.prescDuration} onChange={(e) => handleChange("prescDuration", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Route</Label>
                  <Input className="h-8 text-sm" placeholder="Route" value={form.prescRoute} onChange={(e) => handleChange("prescRoute", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Input className="h-8 text-sm" value={form.prescUnit} onChange={(e) => handleChange("prescUnit", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Instruction</Label>
                  <Select value={form.prescInstruction} onValueChange={(v: any) => handleChange("prescInstruction", v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before Food">Before Food</SelectItem>
                      <SelectItem value="After Food">After Food</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Frequency Grid (Morn/Noon/Eve/Night) */}
              <div>
                <Label className="text-xs">Frequency</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">Morn</span>
                    <Input className="h-8 text-sm text-center" value={form.prescFrequencyMorn} onChange={(e) => handleChange("prescFrequencyMorn", e.target.value)} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">Noon</span>
                    <Input className="h-8 text-sm text-center" value={form.prescFrequencyNoon} onChange={(e) => handleChange("prescFrequencyNoon", e.target.value)} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">Eve</span>
                    <Input className="h-8 text-sm text-center" value={form.prescFrequencyEve} onChange={(e) => handleChange("prescFrequencyEve", e.target.value)} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">Night</span>
                    <Input className="h-8 text-sm text-center" value={form.prescFrequencyNight} onChange={(e) => handleChange("prescFrequencyNight", e.target.value)} />
                  </div>
                </div>
              </div>
              {/* Instruction radio-like */}
              <div className="flex items-center gap-4 text-sm">
                <span>(or)</span>
                <label className="flex items-center gap-1">
                  <input type="radio" name="prescInst" value="Before Food" checked={form.prescInstruction === "Before Food"} onChange={() => handleChange("prescInstruction", "Before Food")} />
                  Before Food
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="prescInst" value="After Food" checked={form.prescInstruction === "After Food"} onChange={() => handleChange("prescInstruction", "After Food")} />
                  After Food
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="prescInst" value="N/A" checked={form.prescInstruction === "N/A"} onChange={() => handleChange("prescInstruction", "N/A")} />
                  N/A
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 w-24">
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
