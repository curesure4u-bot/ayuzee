import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShoppingCart } from "lucide-react";

const devices = [
  { name: "Nadi Tarangini (Pulse Diagnostic)", price: 45000, category: "Diagnostic", brand: "Atreya Innovations" },
  { name: "Panchakarma Shirodhara Unit", price: 28000, category: "Therapy", brand: "AyuTech" },
  { name: "Agnikarma Shalaka Set (Gold/Silver)", price: 12000, category: "Surgical", brand: "Ayur Instruments" },
  { name: "Vamana Therapy Kit", price: 8500, category: "Therapy", brand: "AyuTech" },
  { name: "Basti Yantra (Enema Equipment)", price: 6500, category: "Therapy", brand: "Kerala Ayur Devices" },
  { name: "Raktamokshana (Leech Therapy) Kit", price: 4500, category: "Surgical", brand: "Ayur Instruments" },
  { name: "Digital Prakriti Analyzer", price: 35000, category: "Diagnostic", brand: "Atreya Innovations" },
  { name: "Herbal Steam Generator (Swedana)", price: 15000, category: "Therapy", brand: "AyuTech" },
];

export default function AyushDevices() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AYUSH Medical Devices</h1>
          <p className="text-gray-600">Diagnostic & therapeutic equipment for AYUSH practice</p>
        </div>
        <Badge variant="outline">{devices.length} Devices</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((d, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
              </div>
              <CardTitle className="text-sm mt-2">{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">{d.brand}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-green-700">₹{d.price.toLocaleString()}</span>
                <Button size="sm" className="text-xs">
                  <ShoppingCart className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
