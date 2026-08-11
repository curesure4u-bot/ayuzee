import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const regulations = [
  { country: "USA (FDA)", status: "DSHEA Compliant", notes: "Registered as dietary supplement", color: "bg-green-100" },
  { country: "EU (EFSA)", status: "Novel Food Review", notes: "Some herbs require pre-market approval", color: "bg-yellow-100" },
  { country: "UAE (MOH)", status: "Registered", notes: "Halal certification required", color: "bg-green-100" },
  { country: "UK (MHRA)", status: "THR Registered", notes: "Traditional Herbal Registration path", color: "bg-blue-100" },
  { country: "Australia (TGA)", status: "Listed Medicine", notes: "AUST-L listing for low-risk products", color: "bg-green-100" },
];

const productDB = [
  { name: "Triphala Capsules", fda: true, eu: true, uae: true },
  { name: "Ashwagandha Extract", fda: true, eu: false, uae: true },
  { name: "Brahmi Syrup", fda: true, eu: true, uae: true },
  { name: "Guggulu Tablets", fda: true, eu: false, uae: false },
  { name: "Chyawanprash", fda: true, eu: true, uae: true },
  { name: "Bhasma (Mercury)", fda: false, eu: false, uae: false },
  { name: "Shilajit Resin", fda: true, eu: false, uae: true },
  { name: "Panchakarma Oil", fda: true, eu: true, uae: true },
  { name: "Arjuna Bark Extract", fda: true, eu: true, uae: true },
  { name: "Kshara Sutra Kit", fda: false, eu: false, uae: false },
];

const documents = [
  { name: "Certificate of Analysis (COA)", required: true },
  { name: "Good Manufacturing Practice (GMP)", required: true },
  { name: "Heavy Metal Test Report", required: true },
  { name: "Stability Study Data", required: true },
  { name: "Country-Specific Label Artwork", required: true },
  { name: "Halal Certificate (for UAE/MY)", required: false },
  { name: "Free Sale Certificate", required: true },
];

export default function ExportCompliance() {
  const [search, setSearch] = useState("");

  const filteredProducts = search
    ? productDB.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Export Compliance Center</h1>
      <p className="text-muted-foreground">FDA / EU / UAE regulatory compliance for Ayurvedic products.</p>

      <Tabs defaultValue="regulations">
        <TabsList>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="checker">Product Checker</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="space-y-4 mt-4">
          {regulations.map((reg) => (
            <Card key={reg.country} className={reg.color}>
              <CardContent className="pt-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{reg.country}</h3>
                  <p className="text-sm text-muted-foreground">{reg.notes}</p>
                </div>
                <Badge>{reg.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="checker" className="space-y-4 mt-4">
          <Input placeholder="Search product (e.g., Triphala, Ashwagandha)..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {filteredProducts.map((p) => (
            <Card key={p.name}>
              <CardContent className="pt-4 flex justify-between items-center">
                <span className="font-medium">{p.name}</span>
                <div className="flex gap-2">
                  <Badge variant={p.fda ? "default" : "destructive"}>FDA {p.fda ? "✓" : "✗"}</Badge>
                  <Badge variant={p.eu ? "default" : "destructive"}>EU {p.eu ? "✓" : "✗"}</Badge>
                  <Badge variant={p.uae ? "default" : "destructive"}>UAE {p.uae ? "✓" : "✗"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {search && filteredProducts.length === 0 && <p className="text-muted-foreground text-center py-4">No products found.</p>}
        </TabsContent>

        <TabsContent value="documents" className="space-y-3 mt-4">
          {documents.map((doc) => (
            <Card key={doc.name}>
              <CardContent className="pt-4 flex justify-between items-center">
                <span>{doc.name}</span>
                <Badge variant={doc.required ? "default" : "secondary"}>{doc.required ? "Required" : "Optional"}</Badge>
              </CardContent>
            </Card>
          ))}
          <Button onClick={() => toast.success("Compliance checklist downloaded!")} className="w-full">Download Checklist</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
