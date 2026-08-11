import { useState } from "react";
import { Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const audiences = ["Hospitals", "Clinics", "Pharmacies", "Distributors", "Panchakarma Centers"];

const productCategories = [
  { name: "Ayurvedic Medicines", emoji: "🌿" },
  { name: "Homeopathic Dilutions", emoji: "💧" },
  { name: "Panchakarma Oils", emoji: "🫒" },
  { name: "Surgical/Therapy Equipment", emoji: "🔧" },
  { name: "Raw Herbs (bulk)", emoji: "🌾" },
  { name: "Packaging Materials", emoji: "📦" },
];

export default function B2BWholesale() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [items, setItems] = useState("");
  const [quantity, setQuantity] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (!businessName || !businessType || !items || !contactPerson || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Quote request submitted. Our team will contact within 24hrs.");
    setBusinessName("");
    setBusinessType("");
    setGstNumber("");
    setItems("");
    setQuantity("");
    setContactPerson("");
    setPhone("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Boxes className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">B2B Wholesale</h1>
          <p className="text-muted-foreground">
            Bulk ordering for clinics, hospitals & pharmacies — best wholesale prices
          </p>
        </div>
      </div>

      {/* Who is this for */}
      <div className="flex flex-wrap gap-2">
        {audiences.map((a) => (
          <Badge key={a} variant="secondary" className="text-sm px-3 py-1">
            {a}
          </Badge>
        ))}
      </div>

      {/* Product Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {productCategories.map((cat) => (
          <Card key={cat.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl">{cat.emoji}</p>
              <p className="font-medium mt-2">{cat.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Order Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Bulk Quote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name *</label>
              <Input
                placeholder="Your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Type *</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Panchakarma Center">Panchakarma Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <Input
                placeholder="e.g., 22AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Quantity</label>
              <Input
                placeholder="e.g., 500 units"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person *</label>
              <Input
                placeholder="Full name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone *</label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Items Needed *</label>
            <Textarea
              placeholder="List the medicines/products you need with approximate quantities"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleSubmit}>Request Quote</Button>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Pricing Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">20% OFF</p>
              <p className="text-sm text-muted-foreground mt-1">500+ units</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">30% OFF</p>
              <p className="text-sm text-muted-foreground mt-1">1000+ units</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">Custom</p>
              <p className="text-sm text-muted-foreground mt-1">5000+ units</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tender Participation */}
      <Card>
        <CardHeader>
          <CardTitle>Tender Participation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Looking for government/institutional tenders? Register as a supplier.
          </p>
          <Button
            variant="outline"
            onClick={() => toast("Tender registration coming soon")}
          >
            Register as Supplier
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
