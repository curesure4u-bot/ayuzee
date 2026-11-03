import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, Package, Star, TrendingUp } from "lucide-react";

const packages = [
  { name: "Spine Assessment Only", duration: "1 visit", price: 199, includes: "AI Spine Score + Report", type: "Entry" },
  { name: "Quick Relief (3-Day)", duration: "3 days", price: 4500, includes: "Basti × 3 + Medicines", type: "Trial" },
  { name: "Standard (7-Day)", duration: "7 days", price: 8500, includes: "Basti × 7 + Medicines + Yoga", type: "Popular" },
  { name: "Intensive (14-Day)", duration: "14 days", price: 16000, includes: "Full spine PK + Basti 16", type: "Recommended" },
  { name: "Comprehensive (21-Day)", duration: "21 days", price: 22000, includes: "All therapies + 90-day medicines", type: "Premium" },
];

const V2Packages = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-green-600" /> Packages & Pricing V2</h1>
          <p className="text-muted-foreground mt-1">Enhanced packages with better margins</p>
        </div>
        <Badge className="bg-green-600">7 Packages</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((p) => (
          <Card key={p.name} className={p.type === "Popular" ? "border-green-300 bg-green-50/30" : p.type === "Recommended" ? "border-purple-300 bg-purple-50/30" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
              <Badge variant="outline" className="w-fit">{p.type}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span className="text-3xl font-bold text-green-600">{p.price.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.duration}</p>
              <p className="text-sm mt-2">{p.includes}</p>
              <Button className="w-full mt-4" size="sm">Select Package</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Stats */}
      <Card>
        <CardContent className="p-4 grid grid-cols-4 gap-4 text-center">
          <div><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">₹26.1L</p><p className="text-xs text-muted-foreground">Total Revenue</p></div>
          <div><Package className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">153</p><p className="text-xs text-muted-foreground">Packages Sold</p></div>
          <div><Star className="h-5 w-5 mx-auto text-amber-500" /><p className="text-xl font-bold mt-1">4.7/5</p><p className="text-xs text-muted-foreground">Rating</p></div>
          <div><TrendingUp className="h-5 w-5 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1">62%</p><p className="text-xs text-muted-foreground">Conversion</p></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default V2Packages;