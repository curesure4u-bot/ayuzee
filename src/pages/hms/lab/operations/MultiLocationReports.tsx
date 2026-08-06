import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2, Search, Download, Eye, FileText, Users,
  MapPin, RefreshCw, Share2, CheckCircle2, Clock,
  TrendingUp, ArrowRightLeft, Printer,
} from "lucide-react";

interface LabLocation {
  id: string;
  name: string;
  address: string;
  code: string;
  status: "Active" | "Inactive";
  testsToday: number;
  revenue: number;
  pendingReports: number;
}

interface CrossLocationReport {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  testName: string;
  orderNo: string;
  orderedAt: string;
  orderedLocation: string;
  orderedLocationCode: string;
  processedAt?: string;
  processedLocation?: string;
  processedLocationCode?: string;
  reportDate?: string;
  status: "Ordered" | "Transferred" | "In Progress" | "Completed" | "Shared";
  sharedToLocations: string[];
}

interface LocationSummary {
  locationId: string;
  locationName: string;
  totalOrders: number;
  receivedFromOther: number;
  sentToOther: number;
  completedToday: number;
  pendingToday: number;
  avgTAT: string;
}

const mockLocations: LabLocation[] = [
  { id: "loc1", name: "Ayuzee Lab - Kadayanallur (Main)", address: "#11, Main Road, Kadayanallur", code: "KDY", status: "Active", testsToday: 47, revenue: 28500, pendingReports: 5 },
  { id: "loc2", name: "Ayuzee Lab - Rajapalayam", address: "PACR Salai, Rajapalayam", code: "RJP", status: "Active", testsToday: 32, revenue: 19200, pendingReports: 3 },
  { id: "loc3", name: "Ayuzee Lab - Tenkasi", address: "Bus Stand Road, Tenkasi", code: "TNK", status: "Active", testsToday: 18, revenue: 11400, pendingReports: 2 },
  { id: "loc4", name: "Ayuzee Collection Center - Sankarankovil", address: "Near Bus Stand, Sankarankovil", code: "SKL", status: "Active", testsToday: 8, revenue: 4800, pendingReports: 6 },
];

const mockCrossReports: CrossLocationReport[] = [
  { id: "cr1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", phone: "+91 98765 43210", testName: "RFT + Electrolytes", orderNo: "ORD-2026-0047", orderedAt: "2026-07-24 08:30", orderedLocation: "Ayuzee Lab - Kadayanallur", orderedLocationCode: "KDY", processedAt: "2026-07-24 10:00", processedLocation: "Ayuzee Lab - Kadayanallur", processedLocationCode: "KDY", reportDate: "2026-07-24 02:15", status: "Shared", sharedToLocations: ["RJP"] },
  { id: "cr2", patientId: "AL-18045", patientName: "Mr. Gopal Krishnan", phone: "+91 94567 12345", testName: "Culture & Sensitivity", orderNo: "ORD-RJP-0089", orderedAt: "2026-07-23 09:00", orderedLocation: "Ayuzee Lab - Rajapalayam", orderedLocationCode: "RJP", processedAt: "2026-07-23 09:30", processedLocation: "Ayuzee Lab - Kadayanallur", processedLocationCode: "KDY", status: "In Progress", sharedToLocations: [] },
  { id: "cr3", patientId: "AL-19201", patientName: "Mrs. Meena Kumari", phone: "+91 87654 98765", testName: "Thyroid Profile + HbA1c", orderNo: "ORD-SKL-0034", orderedAt: "2026-07-24 07:45", orderedLocation: "Collection Center - Sankarankovil", orderedLocationCode: "SKL", processedAt: "2026-07-24 09:00", processedLocation: "Ayuzee Lab - Kadayanallur", processedLocationCode: "KDY", reportDate: "2026-07-24 01:30", status: "Completed", sharedToLocations: [] },
  { id: "cr4", patientId: "AL-17890", patientName: "Mr. Saravanan P", phone: "+91 76543 87654", testName: "MRI Brain", orderNo: "ORD-TNK-0056", orderedAt: "2026-07-24 10:00", orderedLocation: "Ayuzee Lab - Tenkasi", orderedLocationCode: "TNK", status: "Transferred", sharedToLocations: [] },
  { id: "cr5", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", phone: "+91 87654 32109", testName: "CBC + Iron Studies", orderNo: "ORD-2026-0048", orderedAt: "2026-07-24 09:15", orderedLocation: "Ayuzee Lab - Kadayanallur", orderedLocationCode: "KDY", processedAt: "2026-07-24 11:00", processedLocation: "Ayuzee Lab - Kadayanallur", processedLocationCode: "KDY", reportDate: "2026-07-24 12:00", status: "Shared", sharedToLocations: ["TNK", "SKL"] },
];

const mockLocationSummary: LocationSummary[] = [
  { locationId: "loc1", locationName: "Kadayanallur (Main)", totalOrders: 47, receivedFromOther: 8, sentToOther: 2, completedToday: 38, pendingToday: 9, avgTAT: "2.1 Hrs" },
  { locationId: "loc2", locationName: "Rajapalayam", totalOrders: 32, receivedFromOther: 3, sentToOther: 5, completedToday: 28, pendingToday: 4, avgTAT: "2.8 Hrs" },
  { locationId: "loc3", locationName: "Tenkasi", totalOrders: 18, receivedFromOther: 1, sentToOther: 3, completedToday: 15, pendingToday: 3, avgTAT: "3.2 Hrs" },
  { locationId: "loc4", locationName: "Sankarankovil (CC)", totalOrders: 8, receivedFromOther: 0, sentToOther: 8, completedToday: 0, pendingToday: 8, avgTAT: "N/A" },
];

const MultiLocationReports = () => {
  const [locations] = useState<LabLocation[]>(mockLocations);
  const [crossReports] = useState<CrossLocationReport[]>(mockCrossReports);
  const [locationSummary] = useState<LocationSummary[]>(mockLocationSummary);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");

  const totalTests = locations.reduce((sum, l) => sum + l.testsToday, 0);
  const totalRevenue = locations.reduce((sum, l) => sum + l.revenue, 0);
  const totalPending = locations.reduce((sum, l) => sum + l.pendingReports, 0);
  const crossLocationOrders = crossReports.filter(r => r.orderedLocationCode !== r.processedLocationCode).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": case "Shared": return "bg-green-100 text-green-700";
      case "In Progress": return "bg-amber-100 text-amber-700";
      case "Transferred": return "bg-blue-100 text-blue-700";
      case "Ordered": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Multi-Location Report Consolidation
        </h2>
        <Button size="sm" variant="outline" onClick={() => toast.info("Sync initiated across all locations")}>
          <RefreshCw className="mr-1 h-3 w-3" /> Sync All
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Building2 className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{locations.length}</p>
            <p className="text-[10px] text-muted-foreground">Locations</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{totalTests}</p>
            <p className="text-[10px] text-muted-foreground">Total Tests Today</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <ArrowRightLeft className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{crossLocationOrders}</p>
            <p className="text-[10px] text-muted-foreground">Cross-Location</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{totalPending}</p>
            <p className="text-[10px] text-muted-foreground">Pending Reports</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">₹{(totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-muted-foreground">Revenue Today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Location Overview</TabsTrigger>
          <TabsTrigger value="cross">Cross-Location Orders</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated View</TabsTrigger>
        </TabsList>

        {/* Location Overview */}
        <TabsContent value="overview" className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            {locations.map((loc) => (
              <Card key={loc.id} className={`${loc.status === "Inactive" ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{loc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{loc.address}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{loc.code}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t text-xs text-center">
                    <div><p className="font-bold text-blue-600">{loc.testsToday}</p><p className="text-[10px] text-muted-foreground">Tests</p></div>
                    <div><p className="font-bold text-green-600">₹{(loc.revenue / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Revenue</p></div>
                    <div><p className="font-bold text-amber-600">{loc.pendingReports}</p><p className="text-[10px] text-muted-foreground">Pending</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Location Performance Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Location Performance Summary</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Location</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-right">Received</th>
                    <th className="px-3 py-2 text-right">Sent Out</th>
                    <th className="px-3 py-2 text-right">Completed</th>
                    <th className="px-3 py-2 text-right">Pending</th>
                    <th className="px-3 py-2 text-right">Avg TAT</th>
                  </tr>
                </thead>
                <tbody>
                  {locationSummary.map((loc) => (
                    <tr key={loc.locationId} className="border-b">
                      <td className="px-3 py-2 font-medium">{loc.locationName}</td>
                      <td className="px-3 py-2 text-right">{loc.totalOrders}</td>
                      <td className="px-3 py-2 text-right text-blue-600">{loc.receivedFromOther}</td>
                      <td className="px-3 py-2 text-right text-purple-600">{loc.sentToOther}</td>
                      <td className="px-3 py-2 text-right text-green-600">{loc.completedToday}</td>
                      <td className="px-3 py-2 text-right text-amber-600">{loc.pendingToday}</td>
                      <td className="px-3 py-2 text-right">{loc.avgTAT}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross-Location Orders */}
        <TabsContent value="cross" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Locations</SelectItem>
                {locations.map(l => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Test</th>
                    <th className="px-3 py-2 text-left">Ordered At</th>
                    <th className="px-3 py-2 text-left">Processed At</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-left">Shared To</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crossReports.filter(r => search === "" || r.patientName.toLowerCase().includes(search.toLowerCase())).map((report) => (
                    <tr key={report.id} className="border-b">
                      <td className="px-3 py-2">
                        <p className="font-medium">{report.patientName}</p>
                        <p className="text-[10px] text-muted-foreground">{report.patientId} | {report.orderNo}</p>
                      </td>
                      <td className="px-3 py-2">{report.testName}</td>
                      <td className="px-3 py-2">
                        <p>{report.orderedLocation}</p>
                        <p className="text-[10px] text-muted-foreground">{report.orderedAt}</p>
                      </td>
                      <td className="px-3 py-2">
                        {report.processedLocation ? (
                          <><p>{report.processedLocation}</p><p className="text-[10px] text-muted-foreground">{report.processedAt}</p></>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getStatusColor(report.status)}`}>{report.status}</Badge></td>
                      <td className="px-3 py-2">
                        {report.sharedToLocations.length > 0 ? report.sharedToLocations.map((loc, i) => <Badge key={i} variant="outline" className="text-[9px] mr-1">{loc}</Badge>) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {report.status === "Completed" && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.success("Report shared to ordering location")}><Share2 className="h-3 w-3" /></Button>}
                          <Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consolidated Patient View */}
        <TabsContent value="consolidated" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Consolidated Patient Report View</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Search a patient to view all their reports across all Ayuzee locations in one place.</p>
              <div className="flex gap-2">
                <Input className="h-8 text-sm" placeholder="Enter Patient ID or Phone number..." />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Search</Button>
              </div>

              {/* Sample consolidated view */}
              <Card className="border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Users className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="font-medium text-sm">Mr. Rajesh Kumar (AL-12543)</p>
                      <p className="text-xs text-muted-foreground">+91 98765 43210 | 52y Male | Last visit: 2026-07-24</p>
                    </div>
                  </div>
                  <table className="w-full text-xs border">
                    <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="px-2 py-1.5 text-left">Date</th>
                        <th className="px-2 py-1.5 text-left">Test</th>
                        <th className="px-2 py-1.5 text-left">Location</th>
                        <th className="px-2 py-1.5 text-center">Status</th>
                        <th className="px-2 py-1.5 text-center">Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="px-2 py-1.5">2026-07-24</td><td className="px-2 py-1.5">RFT + Electrolytes</td><td className="px-2 py-1.5">Kadayanallur</td><td className="px-2 py-1.5 text-center"><Badge className="bg-green-100 text-green-700 text-[9px]">Reported</Badge></td><td className="px-2 py-1.5 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button></td></tr>
                      <tr className="border-b"><td className="px-2 py-1.5">2026-07-20</td><td className="px-2 py-1.5">CBC</td><td className="px-2 py-1.5">Rajapalayam</td><td className="px-2 py-1.5 text-center"><Badge className="bg-green-100 text-green-700 text-[9px]">Reported</Badge></td><td className="px-2 py-1.5 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button></td></tr>
                      <tr className="border-b"><td className="px-2 py-1.5">2026-07-10</td><td className="px-2 py-1.5">Lipid Profile</td><td className="px-2 py-1.5">Kadayanallur</td><td className="px-2 py-1.5 text-center"><Badge className="bg-green-100 text-green-700 text-[9px]">Reported</Badge></td><td className="px-2 py-1.5 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button></td></tr>
                      <tr><td className="px-2 py-1.5">2026-06-15</td><td className="px-2 py-1.5">Chest X-Ray</td><td className="px-2 py-1.5">Tenkasi</td><td className="px-2 py-1.5 text-center"><Badge className="bg-green-100 text-green-700 text-[9px]">Reported</Badge></td><td className="px-2 py-1.5 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button></td></tr>
                    </tbody>
                  </table>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="text-xs"><Download className="mr-1 h-3 w-3" /> Download All</Button>
                    <Button size="sm" variant="outline" className="text-xs"><Printer className="mr-1 h-3 w-3" /> Print Consolidated</Button>
                    <Button size="sm" variant="outline" className="text-xs"><Share2 className="mr-1 h-3 w-3" /> Share via WhatsApp</Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiLocationReports;
