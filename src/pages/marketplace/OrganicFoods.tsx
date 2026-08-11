import { useState } from "react";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FoodProduct {
  name: string;
  price: number;
  category: string;
}

const products: FoodProduct[] = [
  { name: "Chyawanprash (Organic)", price: 450, category: "Immunity" },
  { name: "Ashwagandha Granules", price: 380, category: "Energy" },
  { name: "Triphala Powder (Organic)", price: 280, category: "Digestive" },
  { name: "Turmeric Latte Mix", price: 320, category: "Immunity" },
  { name: "Moringa Powder", price: 350, category: "Superfoods" },
  { name: "Brahmi Memory Tea", price: 240, category: "Herbal Teas" },
  { name: "Amla Juice (Cold-pressed)", price: 180, category: "Immunity" },
  { name: "Shatavari Women's Tonic", price: 420, category: "Beauty" },
  { name: "Giloy Juice", price: 220, category: "Immunity" },
  { name: "Aloe Vera Juice", price: 190, category: "Digestive" },
  { name: "Protein Powder (Plant-based Ayurvedic)", price: 890, category: "Energy" },
  { name: "Detox Tea Blend", price: 260, category: "Detox" },
];

const categories = ["All", "Superfoods", "Herbal Teas", "Immunity", "Digestive", "Beauty", "Energy", "Detox"];

export default function OrganicFoods() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} added to cart`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Leaf className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Organic Food & Nutraceuticals</h1>
          <p className="text-muted-foreground">
            Certified organic Ayurvedic foods, supplements, and wellness nutrition
          </p>
        </div>
      </div>

      {/* Subscribe & Save Banner */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-bold text-green-800 text-lg">Subscribe & Save 15%</p>
            <p className="text-sm text-green-700">
              Get your favorite products auto-delivered monthly at a discount
            </p>
          </div>
          <Badge className="bg-green-600 text-white text-sm px-4 py-1">15% OFF</Badge>
        </CardContent>
      </Card>

      {/* Category Filter */}
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  Organic ✓
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline">{product.category}</Badge>
              <p className="text-xl font-bold text-primary">
                ₹{product.price}
              </p>
              <Button
                className="w-full"
                onClick={() => handleAddToCart(product.name)}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products found in this category.
        </div>
      )}
    </div>
  );
}
