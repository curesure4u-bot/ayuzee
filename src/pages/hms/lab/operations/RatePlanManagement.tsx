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
  IndianRupee, Plus, Search, Edit2, Copy, Trash2,
  CheckCircle2, Users, Building2, Shield, Tag,
  Percent, Clock, Star, Download,
} from "lucide-react";

interface RatePlan {
  id: string;
  name: string;
  code: string;
  type: "Walk-in" | "B2B Hospital" | "B2B Clinic" | "Corporate" | "Insurance" | "Government" | "Camp" | "Emergency" | "Night" | "Custom";
  discountType: "Percentage" | "Fixed" | "Slab";
  discountValue: number;
  applicableTo: string[];
  validFrom: string;
  validTo: string;
  testsCount: number;
  clientsAssigned: number;
  isDefault: boolean;
  isActive: boolean;
  priority: number;
}

interface RatePlanTest {
  testName: string;
  testCode: string;
  mRP: number;
  walkInRate: number;
  hospitalRate: number;
  clinicRate: number;
  corporateRate: number;
  insuranceRate: number;
  govtRate: number;
  campRate: number;
  emergencyRate: number;
}

const mockRatePlans: RatePlan[] = [
  { id: "rp1", name: "Walk-in (MRP)", code: "RP-WALKIN", type: "Walk-in", discountType: "Fixed", discountValue: 0, applicableTo: ["All walk-in patients"], validFrom: "2026-01-01", validTo: "2026-12-31", testsCount: 250, clientsAssigned: 0, isDefault: true, isActive: true, priority: 1 },
  { id: "rp2", name: "Hospital Premium", code: "RP-HOSP-P", type: "B2B Hospital", discountType: "Percentage", discountValue: 15, applicableTo: ["Saleem Hospital", "District Hospital"], validFrom: "2026-01-01", validTo: "2027-03-31", testsCount: 250, clientsAssigned: 2, isDefault: false, isActive: true, priority: 2 },
  { id: "rp3", name: "Clinic Standard", code: "RP-CLINIC", type: "B2B Clinic", discountType: "Percentage", discountValue: 12, applicableTo: ["Women's Care Clinic", "Skin & Hair Clinic"], validFrom: "2026-01-01", validTo: "2027-01-31", testsCount: 250, clientsAssigned: 3, isDefault: false, isActive: true, priority: 3 },
  { id: "rp4", name: "Corporate Bulk", code: "RP-CORP", type: "Corporate", discountType: "Percentage", discountValue: 20, applicableTo: ["TCS", "Infosys", "Wipro"], validFrom: "2026-04-01", validTo: "2027-03-31", testsCount: 180, clientsAssigned: 5, isDefault: false, isActive: true, priority: 4 },
  { id: "rp5", name: "Insurance Panel", code: "RP-INS", type: "Insurance", discountType: "Percentage", discountValue: 25, applicableTo: ["Star Health", "ICICI Lombard", "New India"], validFrom: "2026-01-01", validTo: "2026-12-31", testsCount: 200, clientsAssigned: 4, isDefault: false, isActive: true, priority: 5 },
  { id: "rp6", name: "Government Rate", code: "RP-GOVT", type: "Government", discountType: "Percentage", discountValue: 40, applicableTo: ["PHC", "Government Hospitals", "PMJAY"], validFrom: "2026-01-01", validTo: "2027-03-31", testsCount: 150, clientsAssigned: 3, isDefault: false, isActive: true, priority: 6 },
  { id: "rp7", name: "Camp Special", code: "RP-CAMP", type: "Camp", discountType: "Percentage", discountValue: 50, applicableTo: ["Health camps", "Screening events"], validFrom: "2026-01-01", validTo: "2026-12-31", testsCount: 80, clientsAssigned: 0, isDefault: false, isActive: true, priority: 7 },
  { id: "rp8", name: "Emergency/Night", code: "RP-EMERG", type: "Emergency", discountType: "Percentage", discountValue: -25, applicableTo: ["After 10 PM orders", "STAT orders"], validFrom: "2026-01-01", validTo: "2026-12-31", testsCount: 100, clientsAssigned: 0, isDefault: false, isActive: true, priority: 8 },
];

const mockTestRates: RatePlanTest[] = [
  { testName: "Complete Blood Count (CBC)", testCode: "HEM-CBC", mRP: 450, walkInRate: 450, hospitalRate: 382, clinicRate: 396, corporateRate: 360, insuranceRate: 337, govtRate: 270, campRate: 225, emergencyRate: 562 },
  { testName: "Renal Function Test (RFT)", testCode: "BIO-RFT", mRP: 850, walkInRate: 850, hospitalRate: 722, clinicRate: 748, corporateRate: 680, insuranceRate: 637, govtRate: 510, campRate: 425, emergencyRate: 1062 },
  { testName: "Lipid Profile", testCode: "BIO-LIP", mRP: 600, walkInRate: 600, hospitalRate: 510, clinicRate: 528, corporateRate: 480, insuranceRate: 450, govtRate: 360, campRate: 300, emergencyRate: 750 },
  { testName: "Thyroid Profile (T3,T4,TSH)", testCode: "BIO-THY", mRP: 800, walkInRate: 800, hospitalRate: 680, clinicRate: 704, corporateRate: 640, insuranceRate: 600, govtRate: 480, campRate: 400, emergencyRate: 1000 },
  { testName: "HbA1c", testCode: "BIO-HBA1C", mRP: 500, walkInRate: 500, hospitalRate: 425, clinicRate: 440, corporateRate: 400, insuranceRate: 375, govtRate: 300, campRate: 250, emergencyRate: 625 },
  { testName: "Liver Function Test (LFT)", testCode: "BIO-LFT", mRP: 750, walkInRate: 750, hospitalRate: 637, clinicRate: 660, corporateRate: 600, insuranceRate: 562, govtRate: 450, campRate: 375, emergencyRate: 937 },
  { testName: "Vitamin D (25-OH)", testCode: "BIO-VITD", mRP: 1200, walkInRate: 1200, hospitalRate: 1020, clinicRate: 1056, corporateRate: 960, insuranceRate: 900, govtRate: 720, campRate: 600, emergencyRate: 1500 },
  { testName: "Culture & Sensitivity", testCode: "MIC-CS", mRP: 1500, walkInRate: 1500, hospitalRate: 1275, clinicRate: 1320, corporateRate: 1200, insuranceRate: 1125, govtRate: 900, campRate: 750, emergencyRate: 1875 },
];

const RatePlanManagement = () => {
  const [ratePlans] = useState<RatePlan[]>(mockRatePlans);
  const [testRates] = useState<RatePlanTest[]>(mockTestRates);
  const [activeTab, setActiveTab] = useState("plans");
  const [search, setSearch] = useState("");

  const getTypeColor = (type: string) => {
    switch (type) { case "Walk-in": return "bg-blue-100 text-blue-700"; case "B2B Hospital": return "bg-green-100 text-green-700"; case "B2B Clinic": return "bg-teal-100 text-teal-700"; case "Corporate": return "bg-purple-100 text-purple-700"; case "Insurance": return "bg-indigo-100 text-indigo-700"; case "Government": return "bg-amber-100 text-amber-700"; case "Camp": return "bg-orange-100 text-orange-700"; case "Emergency": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Tag className="h-5 w-5" /> Rate Plan Management</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Rate Plan</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Tag className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{ratePlans.length}</p><p className="text-[10px] text-muted-foreground">Rate Plans</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{ratePlans.filter(r => r.isActive).length}</p><p className="text-[10px] text-muted-foreground">Active</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Building2 className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{ratePlans.reduce((s, r) => s + r.clientsAssigned, 0)}</p><p className="text-[10px] text-muted-foreground">Clients Assigned</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Percent className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">12-50%</p><p className="text-[10px] text-muted-foreground">Discount Range</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="plans">Rate Plans</TabsTrigger><TabsTrigger value="comparison">Rate Comparison</TabsTrigger></TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr><th className="px-3 py-2 text-left">Plan Name</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-center">Discount</th><th className="px-3 py-2 text-center">Tests</th><th className="px-3 py-2 text-center">Clients</th><th className="px-3 py-2 text-left">Valid Till</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Actions</th></tr>
              </thead>
              <tbody>
                {ratePlans.map((plan) => (
                  <tr key={plan.id} className="border-b">
                    <td className="px-3 py-2"><p className="font-medium">{plan.name}</p><p className="text-[10px] text-muted-foreground">{plan.code}</p></td>
                    <td className="px-3 py-2"><Badge className={`text-[9px] ${getTypeColor(plan.type)}`}>{plan.type}</Badge></td>
                    <td className="px-3 py-2 text-center font-bold">{plan.discountValue > 0 ? <span className="text-green-600">-{plan.discountValue}%</span> : plan.discountValue < 0 ? <span className="text-red-600">+{Math.abs(plan.discountValue)}%</span> : <span>MRP</span>}</td>
                    <td className="px-3 py-2 text-center">{plan.testsCount}</td>
                    <td className="px-3 py-2 text-center">{plan.clientsAssigned}</td>
                    <td className="px-3 py-2">{plan.validTo}</td>
                    <td className="px-3 py-2 text-center">{plan.isActive ? <Badge className="bg-green-100 text-green-700 text-[9px]">Active</Badge> : <Badge className="bg-gray-100 text-gray-500 text-[9px]">Inactive</Badge>}{plan.isDefault && <Badge className="ml-1 bg-blue-100 text-blue-700 text-[8px]">Default</Badge>}</td>
                    <td className="px-3 py-2 text-center"><div className="flex gap-1 justify-center"><Button size="sm" variant="outline" className="h-5 text-[9px]"><Edit2 className="h-3 w-3" /></Button><Button size="sm" variant="outline" className="h-5 text-[9px]"><Copy className="h-3 w-3" /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>

          {/* Applicable clients */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Plan Applicability</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              {ratePlans.filter(p => p.clientsAssigned > 0 || p.type === "Camp" || p.type === "Emergency").map(plan => (
                <div key={plan.id} className="flex items-center gap-2">
                  <Badge className={`text-[9px] w-[100px] justify-center ${getTypeColor(plan.type)}`}>{plan.name.substring(0, 15)}</Badge>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <div className="flex gap-1 flex-wrap">{plan.applicableTo.map((a, i) => <Badge key={i} variant="outline" className="text-[9px]">{a}</Badge>)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Comparison Tab */}
        <TabsContent value="comparison" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search test..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export Rates</Button>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-2 py-2 text-left sticky left-0 bg-muted/50">Test</th>
                  <th className="px-2 py-2 text-right">MRP</th>
                  <th className="px-2 py-2 text-right text-green-700">Hospital (-15%)</th>
                  <th className="px-2 py-2 text-right text-teal-700">Clinic (-12%)</th>
                  <th className="px-2 py-2 text-right text-purple-700">Corporate (-20%)</th>
                  <th className="px-2 py-2 text-right text-indigo-700">Insurance (-25%)</th>
                  <th className="px-2 py-2 text-right text-amber-700">Govt (-40%)</th>
                  <th className="px-2 py-2 text-right text-orange-700">Camp (-50%)</th>
                  <th className="px-2 py-2 text-right text-red-700">Emergency (+25%)</th>
                </tr>
              </thead>
              <tbody>
                {testRates.filter(t => t.testName.toLowerCase().includes(search.toLowerCase())).map((test) => (
                  <tr key={test.testCode} className="border-b">
                    <td className="px-2 py-2 font-medium sticky left-0 bg-white">{test.testName}<br /><span className="text-[9px] text-muted-foreground">{test.testCode}</span></td>
                    <td className="px-2 py-2 text-right font-bold">₹{test.mRP}</td>
                    <td className="px-2 py-2 text-right text-green-700">₹{test.hospitalRate}</td>
                    <td className="px-2 py-2 text-right text-teal-700">₹{test.clinicRate}</td>
                    <td className="px-2 py-2 text-right text-purple-700">₹{test.corporateRate}</td>
                    <td className="px-2 py-2 text-right text-indigo-700">₹{test.insuranceRate}</td>
                    <td className="px-2 py-2 text-right text-amber-700">₹{test.govtRate}</td>
                    <td className="px-2 py-2 text-right text-orange-700">₹{test.campRate}</td>
                    <td className="px-2 py-2 text-right text-red-700">₹{test.emergencyRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RatePlanManagement;
