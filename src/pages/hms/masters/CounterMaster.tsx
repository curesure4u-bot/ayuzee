import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Search, Hash, RotateCcw, Calendar, MapPin } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Counter = {
  id: string;
  name: string;
  prefix: string;
  currentValue: number;
  resetPeriod: string;
  financialYear: string;
  format: string;
  lastReset: string;
  status: "active" | "inactive";
  autoReset: boolean;
};

type BranchLocation = {
  id: string;
  address: string;
  code: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const COUNTER_TYPES = [
  "OP Bill Number",
  "IP Bill Number",
  "Pharmacy Bill Number",
  "Lab Bill Number",
  "Patient Registration ID",
  "Token Number (OPD)",
  "Token Number (Lab)",
  "Token Number (Pharmacy)",
  "Advance Receipt Number",
  "Refund Voucher Number",
  "Purchase Order Number",
  "GRN Number",
  "Stock Transfer Number",
  "Expense Voucher Number",
  "IP Admission Number",
  "Discharge Number",
  "Panchakarma Schedule ID",
  "Appointment ID",
  "Custom",
];

const RESET_PERIODS = [
  "Financial Year (April - March)",
  "Calendar Year (Jan - Dec)",
  "Monthly",
  "Daily",
  "Never (Continuous)",
];

const FINANCIAL_YEARS = [
  "2026-27",
  "2025-26",
  "2024-25",
  "2023-24",
];

const BRANCHES: BranchLocation[] = [
  { id: "1", address: "#11, Main Road, Kadayanallur,", code: "KDN" },
  { id: "2", address: "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam", code: "RPM" },
  { id: "3", address: "43, Miranda Lane, Old GH Road, Theni", code: "THN" },
  { id: "4", address: "No 47, Kulavanikar Puram Road, , Tirunelveli", code: "TVL" },
  { id: "5", address: "4, Durai Samy Nagar, Keelkattalai, Chennai", code: "CHN" },
  { id: "6", address: "62 B, Railway Road, , Tenkasi", code: "TKS" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockCountersByBranch: Record<string, Counter[]> = {
  "1": [
    { id: "c1", name: "OP Bill Number", prefix: "AYZ/KDN/OP/", currentValue: 1245, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/KDN/OP/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c2", name: "IP Bill Number", prefix: "AYZ/KDN/IP/", currentValue: 89, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/KDN/IP/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c3", name: "Pharmacy Bill Number", prefix: "AYZ/KDN/PH/", currentValue: 3456, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/KDN/PH/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c4", name: "Patient Registration ID", prefix: "AYZ/P/", currentValue: 8520, resetPeriod: "Never (Continuous)", financialYear: "-", format: "AYZ/P/{{number}}", lastReset: "Never", status: "active", autoReset: false },
    { id: "c5", name: "Token Number (OPD)", prefix: "T-", currentValue: 42, resetPeriod: "Daily", financialYear: "-", format: "T-{{number}}", lastReset: "18/07/2026", status: "active", autoReset: true },
    { id: "c6", name: "Advance Receipt Number", prefix: "AYZ/KDN/ADV/", currentValue: 234, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/KDN/ADV/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c7", name: "Lab Bill Number", prefix: "AYZ/KDN/LB/", currentValue: 678, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/KDN/LB/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c8", name: "Panchakarma Schedule ID", prefix: "PK/", currentValue: 156, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "PK/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c9", name: "Expense Voucher Number", prefix: "EXP/KDN/", currentValue: 312, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "EXP/KDN/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
  ],
  "2": [
    { id: "c10", name: "OP Bill Number", prefix: "AYZ/RPM/OP/", currentValue: 890, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/RPM/OP/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c11", name: "Token Number (OPD)", prefix: "T-", currentValue: 28, resetPeriod: "Daily", financialYear: "-", format: "T-{{number}}", lastReset: "18/07/2026", status: "active", autoReset: true },
    { id: "c12", name: "Pharmacy Bill Number", prefix: "AYZ/RPM/PH/", currentValue: 2100, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/RPM/PH/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
  ],
  "3": [
    { id: "c13", name: "OP Bill Number", prefix: "AYZ/THN/OP/", currentValue: 560, resetPeriod: "Financial Year (April - March)", financialYear: "2026-27", format: "AYZ/THN/OP/2026-27/{{number}}", lastReset: "01/04/2026", status: "active", autoReset: true },
    { id: "c14", name: "Token Number (OPD)", prefix: "T-", currentValue: 15, resetPeriod: "Daily", financialYear: "-", format: "T-{{number}}", lastReset: "18/07/2026", status: "active", autoReset: true },
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────
const CounterMaster = () => {
  // Branch selector
  const [selectedBranch, setSelectedBranch] = useState("");
  const [countersLoaded, setCountersLoaded] = useState(false);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [search, setSearch] = useState("");

  // New counter form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [newResetPeriod, setNewResetPeriod] = useState("");
  const [newFinancialYear, setNewFinancialYear] = useState("2026-27");
  const [newStartValue, setNewStartValue] = useState("1");
  const [newAutoReset, setNewAutoReset] = useState(true);

  // Load counters for selected branch
  const handleLoad = () => {
    if (!selectedBranch) return toast.error("Please select a branch location");
    const branchCounters = mockCountersByBranch[selectedBranch] || [];
    setCounters(branchCounters);
    setCountersLoaded(true);
    const branch = BRANCHES.find(b => b.id === selectedBranch);
    toast.success(`Loaded ${branchCounters.length} counters for ${branch?.code || "branch"}`);
  };

  // Add new counter
  const handleAddCounter = () => {
    if (!newName) return toast.error("Counter type is required");
    if (!newPrefix.trim()) return toast.error("Prefix is required");
    if (!newResetPeriod) return toast.error("Reset period is required");

    const newCounter: Counter = {
      id: Date.now().toString(),
      name: newName,
      prefix: newPrefix.trim(),
      currentValue: Number(newStartValue) || 1,
      resetPeriod: newResetPeriod,
      financialYear: newResetPeriod.includes("Financial") ? newFinancialYear : "-",
      format: `${newPrefix.trim()}${newResetPeriod.includes("Financial") ? newFinancialYear + "/" : ""}{{number}}`,
      lastReset: newResetPeriod === "Daily" ? new Date().toLocaleDateString("en-GB") : newResetPeriod.includes("Financial") ? "01/04/2026" : "Never",
      status: "active",
      autoReset: newAutoReset,
    };
    setCounters([...counters, newCounter]);
    toast.success(`Counter "${newName}" created!`);
    setNewName(""); setNewPrefix(""); setNewResetPeriod(""); setNewStartValue("1");
    setShowAddForm(false);
  };

  // Reset counter
  const handleResetCounter = (id: string) => {
    setCounters(counters.map(c => c.id === id ? { ...c, currentValue: 1, lastReset: new Date().toLocaleDateString("en-GB") } : c));
    toast.success("Counter reset to 1");
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setCounters(counters.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  };

  const filteredCounters = counters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.prefix.toLowerCase().includes(search.toLowerCase())
  );

  const activeCounters = filteredCounters.filter(c => c.status === "active");
  const inactiveCounters = filteredCounters.filter(c => c.status === "inactive");

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Hash className="h-6 w-6 text-orange-600" /> Counter Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Define counter reset periods per financial year and control reset-enabled transactions.
          </p>
        </div>
        <Badge variant="secondary">
          Branches: {BRANCHES.length} | Counter Types: {COUNTER_TYPES.length}
        </Badge>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Counter Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                <span className="mr-2">📋</span> Manage Counter
              </Button>
            </CardContent>
          </Card>

          {/* Branch Quick Access */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-500" /> Branches</p>
            <div className="space-y-1 text-xs">
              {BRANCHES.map(b => (
                <Button
                  key={b.id}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-[10px] h-6 px-1.5 ${selectedBranch === b.id ? "bg-orange-50 text-orange-700 font-semibold" : "hover:bg-muted"}`}
                  onClick={() => { setSelectedBranch(b.id); setCountersLoaded(false); }}
                >
                  <Badge variant="outline" className="text-[8px] h-3.5 mr-1 px-1">{b.code}</Badge>
                  <span className="truncate">{b.address.split(",")[0]}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Counter Summary */}
          {countersLoaded && (
            <Card className="mt-3 p-3">
              <p className="text-xs font-semibold mb-2">Counter Summary</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Counters</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{counters.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <Badge className="text-[10px] h-4 bg-emerald-100 text-emerald-700">{activeCounters.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Reset</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{counters.filter(c => c.resetPeriod === "Daily").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FY Reset</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{counters.filter(c => c.resetPeriod.includes("Financial")).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Continuous</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{counters.filter(c => c.resetPeriod.includes("Never")).length}</Badge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-base text-center text-primary">Manage Counter Master</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Branch Selector + Load */}
              <div className="flex items-end gap-4">
                <div className="min-w-[320px]">
                  <Select value={selectedBranch} onValueChange={v => { setSelectedBranch(v); setCountersLoaded(false); }}>
                    <SelectTrigger><SelectValue placeholder="Select Branch Location" /></SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.address}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleLoad} className="bg-orange-500 hover:bg-orange-600 text-white">
                  Load
                </Button>
                {countersLoaded && (
                  <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" size="sm">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Counter
                  </Button>
                )}
              </div>

              {/* Add New Counter Form */}
              {showAddForm && countersLoaded && (
                <Card className="border-teal-200 bg-teal-50/30">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold text-teal-700">Create New Counter</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Counter Type *</Label>
                        <Select value={newName} onValueChange={setNewName}>
                          <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{COUNTER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Prefix *</Label>
                        <Input value={newPrefix} onChange={e => setNewPrefix(e.target.value)} placeholder="e.g., AYZ/KDN/OP/" className="h-8 text-sm mt-0.5" />
                      </div>
                      <div>
                        <Label className="text-xs">Reset Period *</Label>
                        <Select value={newResetPeriod} onValueChange={setNewResetPeriod}>
                          <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{RESET_PERIODS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Financial Year</Label>
                        <Select value={newFinancialYear} onValueChange={setNewFinancialYear}>
                          <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                          <SelectContent>{FINANCIAL_YEARS.map(fy => <SelectItem key={fy} value={fy}>{fy}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Start Value</Label>
                        <Input type="number" value={newStartValue} onChange={e => setNewStartValue(e.target.value)} className="h-8 text-sm mt-0.5" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" checked={newAutoReset} onChange={e => setNewAutoReset(e.target.checked)} className="accent-orange-500" />
                          <Label className="text-xs">Auto Reset</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={handleAddCounter} className="bg-teal-600 hover:bg-teal-700 text-white">Save Counter</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Counter Table */}
              {countersLoaded && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Search:</span>
                      <Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Counter Name</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Prefix</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Current #</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Format Preview</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Reset Period</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">FY</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Last Reset</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Auto</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCounters.length === 0 ? (
                          <tr><td colSpan={10} className="px-3 py-4 text-center text-muted-foreground">No counters configured for this branch</td></tr>
                        ) : (
                          filteredCounters.map(counter => (
                            <tr key={counter.id} className={`border-b hover:bg-muted/30 ${counter.status === "inactive" ? "opacity-50" : ""}`}>
                              <td className="px-3 py-2 font-medium text-xs">{counter.name}</td>
                              <td className="px-3 py-2 font-mono text-xs">{counter.prefix}</td>
                              <td className="px-3 py-2">
                                <Badge variant="secondary" className="text-xs font-mono">{counter.currentValue}</Badge>
                              </td>
                              <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                                {counter.format.replace("{{number}}", String(counter.currentValue + 1))}
                              </td>
                              <td className="px-3 py-2 text-xs">
                                <Badge variant="outline" className="text-[9px]">
                                  {counter.resetPeriod === "Daily" ? "📅 Daily" :
                                   counter.resetPeriod.includes("Financial") ? "📊 FY" :
                                   counter.resetPeriod.includes("Monthly") ? "🗓️ Monthly" :
                                   counter.resetPeriod.includes("Calendar") ? "📆 CY" : "∞ Never"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-xs">{counter.financialYear}</td>
                              <td className="px-3 py-2 text-xs">{counter.lastReset}</td>
                              <td className="px-3 py-2">
                                {counter.autoReset ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Yes</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px]">No</Badge>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-xs cursor-pointer ${counter.status === "active" ? "text-emerald-600" : "text-red-500"}`} onClick={() => handleToggleStatus(counter.id)}>
                                  {counter.status}
                                  <Pencil className="h-2.5 w-2.5 inline ml-0.5 text-orange-500" />
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                    onClick={() => handleResetCounter(counter.id)}
                                    title="Reset to 1"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-teal-500 hover:text-teal-700">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Showing 1 to {filteredCounters.length} of {filteredCounters.length} entries</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
                      <Badge variant="outline" className="text-xs">1</Badge>
                      <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state before loading */}
              {!countersLoaded && (
                <div className="text-center py-10 text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a branch location and click Load to manage counters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CounterMaster;
