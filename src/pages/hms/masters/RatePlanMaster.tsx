import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, MoreHorizontal, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────
type RatePlan = {
  id: string;
  name: string;
  type: string;
  isPercentageIncentive: boolean;
  status: "active" | "inactive";
};

type BranchLocation = {
  id: string;
  address: string;
  defaultRatePlan: string;
};

type PriceSetterItem = {
  id: string;
  code: string;
  name: string;
  group: string;
  standardRate: number;
  planRate: number;
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveRatePlans: RatePlan[] = [
  { id: "1", name: "alshifa-ayush-hospital Default Rate Plan", type: "", isPercentageIncentive: false, status: "active" },
  { id: "2", name: "Corporate - TCS Rate Plan", type: "billing", isPercentageIncentive: false, status: "active" },
  { id: "3", name: "Insurance - Star Health", type: "billing", isPercentageIncentive: true, status: "active" },
];

const mockInactiveRatePlans: RatePlan[] = [
  { id: "4", name: "GLUGOSE", type: "billing", isPercentageIncentive: false, status: "inactive" },
  { id: "5", name: "IP PACKAGE AMOUNT", type: "billing", isPercentageIncentive: false, status: "inactive" },
  { id: "6", name: "LBA PACKAGE PER DAY", type: "billing", isPercentageIncentive: false, status: "inactive" },
  { id: "7", name: "PACKAGE AMOUNT", type: "billing", isPercentageIncentive: false, status: "inactive" },
  { id: "8", name: "alshifa", type: "incentive", isPercentageIncentive: false, status: "inactive" },
];

const mockBranchLocations: BranchLocation[] = [
  { id: "1", address: "#11, Main Road, Kadayanallur,", defaultRatePlan: "alshifa-ayush-hospital Default Rate Plan" },
  { id: "2", address: "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam", defaultRatePlan: "alshifa-ayush-hospital Default Rate Plan" },
  { id: "3", address: "43, Miranda Lane, Old GH Road, Theni", defaultRatePlan: "alshifa-ayush-hospital Default Rate Plan" },
  { id: "4", address: "No 47, Kulavanikar Puram Road, , Tirunelveli", defaultRatePlan: "alshifa-ayush-hospital Default Rate Plan" },
  { id: "5", address: "4, Durai Samy Nagar, Keelkattalai, Chennai", defaultRatePlan: "alshifa-ayush-hospital Default Rate Plan" },
  { id: "6", address: "62 B, Railway Road, , Tenkasi", defaultRatePlan: "alshifa-ayush-hospital Default Rate Plan" },
];

const mockPriceSetterItems: PriceSetterItem[] = [
  { id: "1", code: "TMT_220", name: "Dr Mohamad Saleem MD Ayu - Consultation", group: "Consultation", standardRate: 300, planRate: 300 },
  { id: "2", code: "TMT_225", name: "ABHYANGAM FULL BODY ORDINARY", group: "PANCHAKARMA", standardRate: 1500, planRate: 1500 },
  { id: "3", code: "TMT_226", name: "JAMBIRA PINDA SVEDANAM FULL", group: "PANCHAKARMA", standardRate: 2000, planRate: 2000 },
  { id: "4", code: "TMT_228", name: "KATI BASTI", group: "PANCHAKARMA", standardRate: 800, planRate: 800 },
  { id: "5", code: "TMT_229", name: "SHIRODHARA", group: "PANCHAKARMA", standardRate: 1800, planRate: 1800 },
  { id: "6", code: "TMT_230", name: "NASYAM", group: "PANCHAKARMA", standardRate: 500, planRate: 500 },
  { id: "7", code: "TMT_231", name: "VIRECHANA KARMA", group: "PANCHAKARMA", standardRate: 3500, planRate: 3500 },
  { id: "8", code: "TMT_233", name: "KSHARASUTRA", group: "PROCEDURE", standardRate: 5000, planRate: 5000 },
];

// ─── Component ───────────────────────────────────────────────────────────────
const RatePlanMaster = () => {
  // Master setting: "manage-rate-plan" or "price-setter"
  const [masterSection, setMasterSection] = useState<"manage-rate-plan" | "price-setter">("manage-rate-plan");
  const [liveRatePlans, setLiveRatePlans] = useState<any[]>([]);

  useEffect(() => { loadRatePlans(); }, []);

  const loadRatePlans = async () => {
    try {
      const { data } = await (supabase as any)
        .from("hms_rate_plans")
        .select("*, hms_rate_plan_items(*)")
        .eq("is_active", true)
        .order("plan_name");
      setLiveRatePlans(data || []);
    } catch (err) { console.error("Rate plans load:", err); }
  };

  // Manage Rate Plan sub-tabs: "new" or "inactive"
  const [ratePlanTab, setRatePlanTab] = useState<"new" | "inactive">("new");

  // Price Setter sub-tabs: "price-setter" or "bulk-update"
  const [priceSetterTab, setPriceSetterTab] = useState<"price-setter" | "bulk-update">("price-setter");

  // Form state for creating rate plan
  const [rpName, setRpName] = useState("");
  const [rpType, setRpType] = useState("billing");

  // Branch associations state
  const [branches, setBranches] = useState<BranchLocation[]>(mockBranchLocations);

  // Price setter state
  const [selectedPlanForPricing, setSelectedPlanForPricing] = useState("");
  const [priceItems, setPriceItems] = useState<PriceSetterItem[]>([]);
  const [priceLoaded, setPriceLoaded] = useState(false);
  const [priceSearch, setPriceSearch] = useState("");

  // Bulk update state
  const [bulkPlan, setBulkPlan] = useState("");
  const [bulkPercentage, setBulkPercentage] = useState("");
  const [bulkType, setBulkType] = useState<"increase" | "decrease">("increase");

  const allRatePlanNames = [...mockActiveRatePlans, ...mockInactiveRatePlans].map(r => r.name);

  const handleCreateRatePlan = () => {
    if (!rpName.trim()) return toast.error("Rateplan Name is required");
    toast.success(`Rate Plan "${rpName}" created successfully!`);
    setRpName("");
    setRpType("billing");
  };

  const handleAssociate = () => {
    toast.success("Rate Plan associations saved!");
  };

  const handleLoadPricing = () => {
    if (!selectedPlanForPricing) return toast.error("Please select a Rate Plan");
    setPriceItems(mockPriceSetterItems);
    setPriceLoaded(true);
    toast.success("Rate plan pricing loaded");
  };

  const handleSavePricing = () => {
    toast.success("Rate plan pricing saved!");
  };

  const handleBulkUpdate = () => {
    if (!bulkPlan) return toast.error("Please select a Rate Plan");
    if (!bulkPercentage) return toast.error("Please enter percentage");
    toast.success(`Bulk ${bulkType} of ${bulkPercentage}% applied to ${bulkPlan}`);
  };

  const updateBranchPlan = (branchId: string, plan: string) => {
    setBranches(branches.map(b => b.id === branchId ? { ...b, defaultRatePlan: plan } : b));
  };

  const updatePriceItem = (id: string, newRate: number) => {
    setPriceItems(priceItems.map(p => p.id === id ? { ...p, planRate: newRate } : p));
  };

  // ─── Render Rate Plans Table ─────────────────────────────────────────────────
  const renderRatePlansTable = (data: RatePlan[], type: "active" | "inactive") => (
    <div className="space-y-4">
      <Card>
        <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
          <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
            {type === "active" ? "Manage Rate Plan" : "Manage Inactive Rate Plan"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Create Form - only on active/new tab */}
          {type === "active" && (
            <div className="flex items-end gap-4 pb-4 border-b">
              <div>
                <Label className="font-semibold">Rateplan Name :</Label>
                <Input
                  value={rpName}
                  onChange={e => setRpName(e.target.value)}
                  className="w-64 mt-1"
                  placeholder=""
                />
              </div>
              <div>
                <Label className="font-semibold">Type :</Label>
                <Select value={rpType} onValueChange={setRpType}>
                  <SelectTrigger className="w-40 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="incentive">Incentive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateRatePlan} className="bg-teal-600 hover:bg-teal-700 text-white">
                Create
              </Button>
            </div>
          )}

          {/* Rate Plans Section */}
          <div>
            <h3 className="font-semibold text-base mb-2">Rate Plans</h3>
            <p className="text-xs text-orange-600 mb-3 italic">
              Note: Before disabling Rateplan make sure its not used elsewhere. Existing association for disabled rateplan will remain intact.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-orange-600">Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-orange-600">Type</th>
                    <th className="px-4 py-2 text-left font-semibold text-orange-600">Is Percentage Incentive</th>
                    <th className="px-4 py-2 text-left font-semibold text-orange-600">Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">No rate plans found</td></tr>
                  ) : (
                    data.map(plan => (
                      <tr key={plan.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2">
                          {plan.name} <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" />
                        </td>
                        <td className="px-4 py-2">
                          {plan.type && (
                            <span>{plan.type} <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" /></span>
                          )}
                        </td>
                        <td className="px-4 py-2">{plan.isPercentageIncentive ? "Yes" : "No"}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="ghost" className="h-6 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-orange-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rate Plan Associations - only on active/new tab */}
          {type === "active" && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">Rate Plan Associations</h3>
                <Button onClick={handleAssociate} className="bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                  Associate
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-orange-600">Locations</th>
                      <th className="px-4 py-2 text-left font-semibold text-orange-600">Default Rate Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map(branch => (
                      <tr key={branch.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">{branch.address}</td>
                        <td className="px-4 py-3">
                          <Select
                            value={branch.defaultRatePlan}
                            onValueChange={(v) => updateBranchPlan(branch.id, v)}
                          >
                            <SelectTrigger className="w-80">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allRatePlanNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Price Setter ─────────────────────────────────────────────────────
  const renderPriceSetter = () => (
    <Card>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-base text-center text-primary">Manage Rate Plan Price Setter</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Rate Plan selector + Load */}
        <div className="flex items-end gap-4">
          <div>
            <Label className="font-semibold">Rate Plan</Label>
            <Select value={selectedPlanForPricing} onValueChange={setSelectedPlanForPricing}>
              <SelectTrigger className="w-80 mt-1"><SelectValue placeholder="Select Rate Plan" /></SelectTrigger>
              <SelectContent>
                {mockActiveRatePlans.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleLoadPricing} className="bg-orange-500 hover:bg-orange-600 text-white">
            Load
          </Button>
        </div>

        {/* Price Table */}
        {priceLoaded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Loaded: {selectedPlanForPricing}</Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs">Search:</span>
                <Input
                  className="h-7 text-xs w-48"
                  value={priceSearch}
                  onChange={e => setPriceSearch(e.target.value)}
                  placeholder="Search treatment..."
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Code</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Treatment/Service</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Group</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Standard Rate (₹)</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Plan Rate (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {priceItems
                    .filter(p => p.name.toLowerCase().includes(priceSearch.toLowerCase()) || p.code.toLowerCase().includes(priceSearch.toLowerCase()))
                    .map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{item.code}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-xs">{item.group}</td>
                      <td className="px-3 py-2 font-medium">₹{item.standardRate.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          value={item.planRate}
                          onChange={e => updatePriceItem(item.id, Number(e.target.value))}
                          className="h-7 w-28 text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center pt-2">
              <Button onClick={handleSavePricing} className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                Save Pricing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ─── Render Bulk Update ──────────────────────────────────────────────────────
  const renderBulkUpdate = () => (
    <Card>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-base text-center text-primary">Manage Bulk Rateplan Update</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="max-w-lg mx-auto space-y-4">
          <div>
            <Label className="font-semibold">Select Rate Plan</Label>
            <Select value={bulkPlan} onValueChange={setBulkPlan}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select Rate Plan" /></SelectTrigger>
              <SelectContent>
                {mockActiveRatePlans.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Update Type</Label>
              <Select value={bulkType} onValueChange={(v: "increase" | "decrease") => setBulkType(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase (%)</SelectItem>
                  <SelectItem value="decrease">Decrease (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Percentage (%)</Label>
              <Input
                type="number"
                value={bulkPercentage}
                onChange={e => setBulkPercentage(e.target.value)}
                placeholder="e.g., 10"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button onClick={handleBulkUpdate} className="bg-orange-500 hover:bg-orange-600 text-white px-8">
              Apply Bulk Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">💰 Rate Plan Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage rate plans for standard, corporate, and insurance billing.
          </p>
        </div>
        <Badge variant="secondary">
          Active Plans: {mockActiveRatePlans.length} | Inactive: {mockInactiveRatePlans.length}
        </Badge>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-1">
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Rate Plan Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button
                variant={masterSection === "manage-rate-plan" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-xs h-8 ${masterSection === "manage-rate-plan" ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" : ""}`}
                onClick={() => setMasterSection("manage-rate-plan")}
              >
                <span className="mr-2">📋</span> Manage Rate Plan
              </Button>
              <Button
                variant={masterSection === "price-setter" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-xs h-8 ${masterSection === "price-setter" ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" : ""}`}
                onClick={() => setMasterSection("price-setter")}
              >
                <span className="mr-2">💲</span> Rate Plan Price Setter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div>
          {masterSection === "manage-rate-plan" && (
            <div className="space-y-4">
              {/* Sub-tabs: New | Manage Inactive */}
              <div className="flex gap-2 border-b pb-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-b-none text-xs ${ratePlanTab === "new" ? "text-teal-700 border-b-2 border-teal-600 font-semibold" : "text-muted-foreground"}`}
                  onClick={() => setRatePlanTab("new")}
                >
                  New
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-b-none text-xs ${ratePlanTab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold" : "text-muted-foreground"}`}
                  onClick={() => setRatePlanTab("inactive")}
                >
                  Manage Inactive
                </Button>
              </div>

              {ratePlanTab === "new" && renderRatePlansTable(mockActiveRatePlans, "active")}
              {ratePlanTab === "inactive" && renderRatePlansTable(mockInactiveRatePlans, "inactive")}
            </div>
          )}

          {masterSection === "price-setter" && (
            <div className="space-y-4">
              {/* Sub-tabs: Price Setter | Bulk Update */}
              <div className="flex gap-2 border-b pb-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-b-none text-xs ${priceSetterTab === "price-setter" ? "text-teal-700 border-b-2 border-teal-600 font-semibold" : "text-muted-foreground"}`}
                  onClick={() => setPriceSetterTab("price-setter")}
                >
                  Manage Rateplan Price Setter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-b-none text-xs ${priceSetterTab === "bulk-update" ? "text-red-600 border-b-2 border-red-500 font-semibold" : "text-muted-foreground"}`}
                  onClick={() => setPriceSetterTab("bulk-update")}
                >
                  Manage Bulk Rateplan Update
                </Button>
              </div>

              {priceSetterTab === "price-setter" && renderPriceSetter()}
              {priceSetterTab === "bulk-update" && renderBulkUpdate()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatePlanMaster;
