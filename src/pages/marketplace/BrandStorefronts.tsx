import { useState } from "react";
import { Building2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const brands = [
  { name: "Arya Vaidya Sala (Kottakkal)", system: "Ayurveda", year: 1902, location: "Kerala", products: 320 },
  { name: "Dabur", system: "Ayurveda", year: 1884, location: "Delhi", products: 580 },
  { name: "Himalaya Wellness", system: "Ayurveda", year: 1930, location: "Bangalore", products: 420 },
  { name: "Patanjali", system: "Ayurveda/Yoga", year: 2006, location: "Haridwar", products: 650 },
  { name: "Baidyanath", system: "Ayurveda", year: 1917, location: "Kolkata", products: 390 },
  { name: "Zandu", system: "Ayurveda", year: 1910, location: "Mumbai", products: 210 },
  { name: "SBL Homeopathy", system: "Homeopathy", year: 1983, location: "Delhi", products: 480 },
  { name: "Dr. Reckeweg", system: "Homeopathy", year: 1947, location: "Germany/India", products: 350 },
  { name: "Schwabe India", system: "Homeopathy", year: 1866, location: "Noida", products: 290 },
  { name: "Kerala Ayurveda", system: "Ayurveda", year: 1945, location: "Kerala", products: 260 },
  { name: "Nagarjuna", system: "Ayurveda", year: 1981, location: "Kerala", products: 180 },
  { name: "Siddha Labs", system: "Siddha", year: 1972, location: "Chennai", products: 150 },
];

const categories = ["All", "Ayurveda", "Homeopathy", "Siddha", "Unani", "Yoga"];

export default function BrandStorefronts() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      brand.system.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Verified AYUSH Brands</h1>
          <p className="text-muted-foreground">
            Shop from authenticated Ayurvedic, Homeopathic & Siddha manufacturers
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => (
          <Card key={brand.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  Verified ✓
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{brand.system}</Badge>
                <Badge variant="outline">Est. {brand.year}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">📍 {brand.location}</p>
              <p className="text-sm text-muted-foreground">
                {brand.products} products available
              </p>
              <Button
                className="w-full"
                onClick={() => toast("Storefront coming soon")}
              >
                Visit Store
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No brands found matching your criteria.
        </div>
      )}
    </div>
  );
}
