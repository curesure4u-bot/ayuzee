import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Package, Plus, Search, IndianRupee, Users, TrendingUp,
  Edit2, Eye, Copy, Percent, Star, CheckCircle2,
  FlaskConical, Heart, Brain, Shield, Zap, Calendar,
} from "lucide-react";

interface HealthPackage {
  id: string;
  name: string;
  code: string;
  category: "Basic" | "Comprehensive" | "Executive" | "Women" | "Senior" | "Diabetic" | "Cardiac" | "Corporate" | "AYUSH" | "Custom";
  tests: { testName: string; individualPrice: number }[];
  totalIndividualPrice: number;
  packagePrice: number;
  discount: number;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  ageGroup: string;
  gender: "All" | "Male" | "Female";
  fasting: boolean;
  sampleTypes: string[];
  popularityRank: number;
  bookingsThisMonth: number;
  isActive: boolean;
  isPromoted: boolean;
  description: string;
}

const mockPackages: HealthPackage[] = [
  {
    id: "p1", name: "Ayuzee Basic Health Checkup", code: "PKG-BASIC", category: "Basic",
    tests: [{ testName: "CBC", individualPrice: 450 }, { testName: "Blood Sugar Fasting", individualPrice: 100 }, { testName: "Urine Routine", individualPrice: 150 }, { testName: "Lipid Profile", individualPrice: 600 }, { testName: "Liver Function (LFT)", individualPrice: 750 }],
    totalIndividualPrice: 2050, packagePrice: 999, discount: 1051, discountPercent: 51, validFrom: "2026-01-01", validTo: "2026-12-31", ageGroup: "18-60", gender: "All", fasting: true, sampleTypes: ["Blood", "Urine"], popularityRank: 1, bookingsThisMonth: 85, isActive: true, isPromoted: true,
    description: "Essential screening for overall health. Covers blood counts, sugar, lipids, and liver function."
  },
  {
    id: "p2", name: "Comprehensive Full Body Checkup", code: "PKG-FULL", category: "Comprehensive",
    tests: [{ testName: "CBC", individualPrice: 450 }, { testName: "Blood Sugar (F&PP)", individualPrice: 180 }, { testName: "HbA1c", individualPrice: 500 }, { testName: "Lipid Profile", individualPrice: 600 }, { testName: "LFT", individualPrice: 750 }, { testName: "RFT", individualPrice: 850 }, { testName: "Thyroid (T3,T4,TSH)", individualPrice: 800 }, { testName: "Urine Routine", individualPrice: 150 }, { testName: "Vitamin D", individualPrice: 1200 }, { testName: "Vitamin B12", individualPrice: 900 }, { testName: "Iron Studies", individualPrice: 650 }, { testName: "ECG", individualPrice: 300 }],
    totalIndividualPrice: 7330, packagePrice: 2999, discount: 4331, discountPercent: 59, validFrom: "2026-01-01", validTo: "2026-12-31", ageGroup: "18+", gender: "All", fasting: true, sampleTypes: ["Blood", "Urine"], popularityRank: 2, bookingsThisMonth: 62, isActive: true, isPromoted: true,
    description: "Complete health screening with 12 essential tests. Ideal for annual health assessment."
  },
  {
    id: "p3", name: "Women's Wellness Package", code: "PKG-WOMEN", category: "Women",
    tests: [{ testName: "CBC", individualPrice: 450 }, { testName: "Thyroid Profile", individualPrice: 800 }, { testName: "Iron Studies", individualPrice: 650 }, { testName: "Vitamin D", individualPrice: 1200 }, { testName: "Vitamin B12", individualPrice: 900 }, { testName: "Calcium", individualPrice: 200 }, { testName: "HbA1c", individualPrice: 500 }, { testName: "Urine Routine", individualPrice: 150 }],
    totalIndividualPrice: 4850, packagePrice: 1999, discount: 2851, discountPercent: 59, validFrom: "2026-01-01", validTo: "2026-12-31", ageGroup: "18-55", gender: "Female", fasting: true, sampleTypes: ["Blood", "Urine"], popularityRank: 3, bookingsThisMonth: 38, isActive: true, isPromoted: false,
    description: "Specially designed for women's health - covers thyroid, anemia, vitamins, and bone health."
  },
  {
    id: "p4", name: "Diabetes Care Panel", code: "PKG-DM", category: "Diabetic",
    tests: [{ testName: "Blood Sugar (F&PP)", individualPrice: 180 }, { testName: "HbA1c", individualPrice: 500 }, { testName: "Lipid Profile", individualPrice: 600 }, { testName: "RFT", individualPrice: 850 }, { testName: "Urine Microalbumin", individualPrice: 400 }, { testName: "Fructosamine", individualPrice: 350 }],
    totalIndividualPrice: 2880, packagePrice: 1499, discount: 1381, discountPercent: 48, validFrom: "2026-01-01", validTo: "2026-12-31", ageGroup: "30+", gender: "All", fasting: true, sampleTypes: ["Blood", "Urine"], popularityRank: 4, bookingsThisMonth: 28, isActive: true, isPromoted: false,
    description: "Complete diabetes monitoring with sugar, HbA1c, kidney, and cardiovascular markers."
  },
  {
    id: "p5", name: "Cardiac Risk Assessment", code: "PKG-HEART", category: "Cardiac",
    tests: [{ testName: "Lipid Profile", individualPrice: 600 }, { testName: "hs-CRP", individualPrice: 800 }, { testName: "Homocysteine", individualPrice: 1200 }, { testName: "Lp(a)", individualPrice: 1500 }, { testName: "ECG", individualPrice: 300 }, { testName: "HbA1c", individualPrice: 500 }],
    totalIndividualPrice: 4900, packagePrice: 2499, discount: 2401, discountPercent: 49, validFrom: "2026-01-01", validTo: "2026-12-31", ageGroup: "35+", gender: "All", fasting: true, sampleTypes: ["Blood"], popularityRank: 5, bookingsThisMonth: 15, isActive: true, isPromoted: false,
    description: "Advanced cardiac risk markers for early detection of heart disease risk."
  },
  {
    id: "p6", name: "AYUSH Prakriti + Lab Panel", code: "PKG-AYUSH", category: "AYUSH",
    tests: [{ testName: "Prakriti Assessment", individualPrice: 500 }, { testName: "Nadi Pariksha", individualPrice: 300 }, { testName: "CBC", individualPrice: 450 }, { testName: "Blood Sugar", individualPrice: 100 }, { testName: "Lipid Profile", individualPrice: 600 }, { testName: "Thyroid", individualPrice: 800 }],
    totalIndividualPrice: 2750, packagePrice: 1299, discount: 1451, discountPercent: 53, validFrom: "2026-01-01", validTo: "2026-12-31", ageGroup: "18+", gender: "All", fasting: true, sampleTypes: ["Blood"], popularityRank: 6, bookingsThisMonth: 12, isActive: true, isPromoted: true,
    description: "Unique combination of AYUSH diagnostics (Prakriti, Nadi) with modern lab tests."
  },
];

const HealthPackages = () => {
  const [packages] = useState<HealthPackage[]>(mockPackages);
  const [activeTab, setActiveTab] = useState("packages");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedPackage, setSelectedPackage] = useState<HealthPackage | null>(null);

  const filtered = packages.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalBookings = packages.reduce((s, p) => s + p.bookingsThisMonth, 0);
  const totalRevenue = packages.reduce((s, p) => s + (p.bookingsThisMonth * p.packagePrice), 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) { case "Basic": return <FlaskConical className="h-4 w-4 text-blue-600" />; case "Comprehensive": return <Shield className="h-4 w-4 text-green-600" />; case "Women": return <Heart className="h-4 w-4 text-pink-600" />; case "Diabetic": return <Zap className="h-4 w-4 text-amber-600" />; case "Cardiac": return <Heart className="h-4 w-4 text-red-600" />; case "AYUSH": return <Brain className="h-4 w-4 text-purple-600" />; case "Senior": return <Users className="h-4 w-4 text-gray-600" />; default: return <Package className="h-4 w-4 text-blue-600" />; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Package className="h-5 w-5" /> Health Checkup Packages
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> Create Package</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{packages.length}</p><p className="text-[10px] text-muted-foreground">Active Packages</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{totalBookings}</p><p className="text-[10px] text-muted-foreground">Bookings (Month)</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">₹{(totalRevenue / 100000).toFixed(1)}L</p><p className="text-[10px] text-muted-foreground">Package Revenue</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Star className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{packages.filter(p => p.isPromoted).length}</p><p className="text-[10px] text-muted-foreground">Promoted</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="Search package..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="Diabetic">Diabetic</SelectItem>
                <SelectItem value="Cardiac">Cardiac</SelectItem>
                <SelectItem value="AYUSH">AYUSH</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((pkg) => (
              <Card key={pkg.id} className={`cursor-pointer transition hover:shadow-md ${selectedPackage?.id === pkg.id ? "border-orange-500" : ""} ${pkg.isPromoted ? "border-green-300" : ""}`} onClick={() => setSelectedPackage(pkg)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(pkg.category)}
                      <div>
                        <p className="text-sm font-medium">{pkg.name}</p>
                        <p className="text-[10px] text-muted-foreground">{pkg.code} | {pkg.tests.length} tests</p>
                      </div>
                    </div>
                    {pkg.isPromoted && <Badge className="bg-green-100 text-green-700 text-[9px]"><Star className="h-2.5 w-2.5 mr-0.5" /> Promoted</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{pkg.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <span className="text-xs text-muted-foreground line-through">₹{pkg.totalIndividualPrice}</span>
                      <span className="text-lg font-bold text-green-700 ml-2">₹{pkg.packagePrice}</span>
                    </div>
                    <Badge className="bg-red-100 text-red-700 text-xs"><Percent className="h-3 w-3 mr-0.5" />{pkg.discountPercent}% OFF</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>{pkg.gender} | {pkg.ageGroup}</span>
                    <span>{pkg.bookingsThisMonth} bookings/month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Package Detail */}
          {selectedPackage && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2"><div className="flex justify-between"><CardTitle className="text-sm">{selectedPackage.name} — Test List</CardTitle><Button size="sm" variant="ghost" onClick={() => setSelectedPackage(null)}>×</Button></div></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-1">
                  {selectedPackage.tests.map((test, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> {test.testName}</span>
                      <span className="text-muted-foreground line-through">₹{test.individualPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-2 border-t text-xs">
                  <span>Fasting: {selectedPackage.fasting ? "Required" : "Not required"}</span>
                  <span>Samples: {selectedPackage.sampleTypes.join(", ")}</span>
                  <span>Valid: {selectedPackage.validFrom} to {selectedPackage.validTo}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs"><Edit2 className="mr-1 h-3 w-3" /> Edit</Button>
                  <Button size="sm" variant="outline" className="text-xs"><Copy className="mr-1 h-3 w-3" /> Duplicate</Button>
                  <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700" onClick={() => toast.success("Package booked")}><Calendar className="mr-1 h-3 w-3" /> Book Now</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Package Performance — This Month</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {packages.sort((a, b) => b.bookingsThisMonth - a.bookingsThisMonth).map((pkg) => (
                  <div key={pkg.id} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-[200px] truncate">{pkg.name}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(pkg.bookingsThisMonth / Math.max(...packages.map(p => p.bookingsThisMonth))) * 100}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">{pkg.bookingsThisMonth}</span>
                    </div>
                    <span className="text-xs text-muted-foreground w-[80px] text-right">₹{(pkg.bookingsThisMonth * pkg.packagePrice / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthPackages;
