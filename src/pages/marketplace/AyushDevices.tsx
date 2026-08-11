import { useState } from "react";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Product {
  name: string;
  price: number;
  description: string;
}

const products: Record<string, Product[]> = {
  panchakarma: [
    { name: "Shirodhara Stand", price: 8500, description: "Adjustable brass stand for oil dripping therapy" },
    { name: "Basti Yantra Set", price: 3200, description: "Complete enema therapy instrument set" },
    { name: "Nadi Swedana Machine", price: 12000, description: "Steam therapy generator for localized sweating" },
    { name: "Droni/Treatment Table", price: 45000, description: "Wooden treatment table for Panchakarma procedures" },
  ],
  home: [
    { name: "Nasya Kit", price: 1200, description: "Nasal therapy drops and applicator set" },
    { name: "Home Shirodhara Set", price: 4500, description: "Compact home-use oil therapy set" },
    { name: "Abhyanga Oil Warmer", price: 2800, description: "Electric oil warming device for massage" },
    { name: "Basti Home Kit", price: 2500, description: "Safe home enema therapy kit" },
  ],
  wellness: [
    { name: "Nadi Tarangini (Pulse Analyzer)", price: 35000, description: "Digital pulse diagnosis device based on Ayurvedic Nadi Pariksha" },
    { name: "Tongue Analyzer Device", price: 18000, description: "AI-powered tongue diagnosis imaging tool" },
    { name: "Prakriti Assessment Kit", price: 5500, description: "Complete constitution analysis toolkit" },
    { name: "Digital BP + Dosha Logger", price: 4200, description: "Blood pressure monitor with dosha tracking" },
  ],
  yoga: [
    { name: "Cork Yoga Mat", price: 2400, description: "Eco-friendly natural cork yoga mat" },
    { name: "Meditation Cushion Set", price: 1800, description: "Organic cotton zafu and zabuton set" },
    { name: "Pranayama Timer", price: 1200, description: "Breath timing device with guided cycles" },
    { name: "Yoga Prop Kit", price: 3500, description: "Blocks, straps, bolster, and blanket set" },
  ],
};

export default function AyushDevices() {
  const [activeTab, setActiveTab] = useState("panchakarma");

  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} added to cart`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AYUSH Devices & Equipment</h1>
          <p className="text-muted-foreground">
            Professional Panchakarma equipment, home therapy kits, and wellness devices
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="panchakarma">Panchakarma Equipment</TabsTrigger>
          <TabsTrigger value="home">Home Therapy Kits</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Devices</TabsTrigger>
          <TabsTrigger value="yoga">Yoga Props</TabsTrigger>
        </TabsList>

        {Object.entries(products).map(([key, items]) => (
          <TabsContent key={key} value={key}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((product) => (
                <Card key={product.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <p className="text-xl font-bold text-primary">
                      ₹{product.price.toLocaleString("en-IN")}
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Bulk Orders Link */}
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Need bulk equipment for your clinic?</p>
            <p className="text-sm text-muted-foreground">
              Get wholesale pricing on professional equipment
            </p>
          </div>
          <Button variant="outline" onClick={() => toast("Redirecting to B2B Wholesale page")}>
            Bulk Orders →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
