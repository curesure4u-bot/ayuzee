import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, MapPin, Globe, Building2, Users, Loader2 } from "lucide-react";

// Locations (Branches + Franchises)
const locations = [
  { id: "default", name: "Default (All Locations)" },
  { id: "loc1", name: "#11, Main Road, Kadayanallur" },
  { id: "loc2", name: "195, LAKSHMI PURAM STREET, Rajapalayam" },
  { id: "loc3", name: "43, Miranda Lane, Theni" },
  { id: "loc4", name: "No 47, Tirunelveli" },
  { id: "loc5", name: "4, Durai Samy Nagar, Chennai" },
  { id: "loc6", name: "62 B, Railway Road, Tenkasi" },
  { id: "loc7", name: "Franchise - Kochi, Kerala" },
  { id: "loc8", name: "Franchise - Trivandrum, Kerala" },
  { id: "loc9", name: "Franchise - Bangalore, Karnataka" },
  { id: "loc10", name: "Franchise - Mumbai, Maharashtra" },
  { id: "loc11", name: "Franchise - Delhi NCR" },
  { id: "loc12", name: "Franchise - Jaipur, Rajasthan" },
];

// Areas per location
type Area = { id: string; name: string; pincode: string; areaManager: string; patients: number; status: "active" | "inactive"; locId: string };

const allAreas: Area[] = [
  // Kadayanallur areas
  { id: "1", name: "Kadayanallur Town", pincode: "627751", areaManager: "Rajesh K", patients: 120, status: "active", locId: "loc1" },
  { id: "2", name: "Puliyangudi", pincode: "627855", areaManager: "Rajesh K", patients: 45, status: "active", locId: "loc1" },
  { id: "3", name: "Sankarankoil", pincode: "627756", areaManager: "Suresh M", patients: 38, status: "active", locId: "loc1" },
  { id: "4", name: "Veeravanallur", pincode: "627426", areaManager: "Suresh M", patients: 22, status: "active", locId: "loc1" },
  { id: "5", name: "Tenkasi Ring Road", pincode: "627811", areaManager: "Rajesh K", patients: 60, status: "active", locId: "loc1" },
  // Rajapalayam areas
  { id: "6", name: "Rajapalayam North", pincode: "626117", areaManager: "Priya S", patients: 80, status: "active", locId: "loc2" },
  { id: "7", name: "Rajapalayam South", pincode: "626117", areaManager: "Priya S", patients: 55, status: "active", locId: "loc2" },
  { id: "8", name: "Srivilliputhur", pincode: "626125", areaManager: "Priya S", patients: 35, status: "active", locId: "loc2" },
  { id: "9", name: "Sivakasi", pincode: "626123", areaManager: "Anand R", patients: 40, status: "active", locId: "loc2" },
  // Theni areas
  { id: "10", name: "Theni Town", pincode: "625531", areaManager: "Kumar V", patients: 50, status: "active", locId: "loc3" },
  { id: "11", name: "Periyakulam", pincode: "625601", areaManager: "Kumar V", patients: 30, status: "active", locId: "loc3" },
  { id: "12", name: "Bodinayakanur", pincode: "625513", areaManager: "Kumar V", patients: 25, status: "active", locId: "loc3" },
  // Tirunelveli
  { id: "13", name: "Tirunelveli Junction", pincode: "627001", areaManager: "Meena P", patients: 110, status: "active", locId: "loc4" },
  { id: "14", name: "Palayamkottai", pincode: "627002", areaManager: "Meena P", patients: 70, status: "active", locId: "loc4" },
  { id: "15", name: "Nanguneri", pincode: "627108", areaManager: "Meena P", patients: 20, status: "active", locId: "loc4" },
  // Chennai
  { id: "16", name: "Keelkattalai", pincode: "600117", areaManager: "Karthik D", patients: 90, status: "active", locId: "loc5" },
  { id: "17", name: "Medavakkam", pincode: "600100", areaManager: "Karthik D", patients: 55, status: "active", locId: "loc5" },
  { id: "18", name: "Tambaram", pincode: "600045", areaManager: "Karthik D", patients: 40, status: "active", locId: "loc5" },
  { id: "19", name: "Velachery", pincode: "600042", areaManager: "Anitha S", patients: 60, status: "active", locId: "loc5" },
  // Franchise - Kochi
  { id: "20", name: "Marine Drive", pincode: "682031", areaManager: "Rajeev N", patients: 45, status: "active", locId: "loc7" },
  { id: "21", name: "Edappally", pincode: "682024", areaManager: "Rajeev N", patients: 35, status: "active", locId: "loc7" },
  { id: "22", name: "Kakkanad", pincode: "682030", areaManager: "Rajeev N", patients: 25, status: "active", locId: "loc7" },
  // Franchise - Bangalore
  { id: "23", name: "JP Nagar", pincode: "560078", areaManager: "Ashwin G", patients: 30, status: "active", locId: "loc9" },
  { id: "24", name: "Jayanagar", pincode: "560041", areaManager: "Ashwin G", patients: 20, status: "active", locId: "loc9" },
  // Inactive areas
  { id: "50", name: "Old Area (Moved)", pincode: "627000", areaManager: "—", patients: 0, status: "inactive", locId: "loc1" },
  { id: "51", name: "Discontinued Zone", pincode: "627999", areaManager: "—", patients: 0, status: "inactive", locId: "loc6" },
];

// Area Managers
const areaManagers = [
  { id: "1", name: "Rajesh K", phone: "9876543001", location: "#11, Main Road, Kadayanallur", areasAssigned: 3, patients: 225, role: "Branch Area Manager", type: "own", status: "active" },
  { id: "2", name: "Suresh M", phone: "9876543002", location: "#11, Main Road, Kadayanallur", areasAssigned: 2, patients: 60, role: "Branch Area Manager", type: "own", status: "active" },
  { id: "3", name: "Priya S", phone: "9876543003", location: "195, LAKSHMI PURAM STREET, Rajapalayam", areasAssigned: 3, patients: 170, role: "Branch Area Manager", type: "own", status: "active" },
  { id: "4", name: "Anand R", phone: "9876543004", location: "195, LAKSHMI PURAM STREET, Rajapalayam", areasAssigned: 1, patients: 40, role: "Field Executive", type: "own", status: "active" },
  { id: "5", name: "Kumar V", phone: "9876543005", location: "43, Miranda Lane, Theni", areasAssigned: 3, patients: 105, role: "Branch Head", type: "own", status: "active" },
  { id: "6", name: "Meena P", phone: "9876543006", location: "No 47, Tirunelveli", areasAssigned: 3, patients: 200, role: "Branch Area Manager", type: "own", status: "active" },
  { id: "7", name: "Karthik D", phone: "9876543007", location: "4, Durai Samy Nagar, Chennai", areasAssigned: 3, patients: 185, role: "City Manager", type: "own", status: "active" },
  { id: "8", name: "Anitha S", phone: "9876543008", location: "4, Durai Samy Nagar, Chennai", areasAssigned: 1, patients: 60, role: "Field Executive", type: "own", status: "active" },
  { id: "9", name: "Rajeev N", phone: "9876543009", location: "Franchise - Kochi, Kerala", areasAssigned: 3, patients: 105, role: "Franchise Manager", type: "franchise", status: "active" },
  { id: "10", name: "Ashwin G", phone: "9876543010", location: "Franchise - Bangalore, Karnataka", areasAssigned: 2, patients: 50, role: "Franchise Manager", type: "franchise", status: "active" },
];

// Zones
const zones = [
  { id: "1", name: "South Tamil Nadu", code: "STN", branches: 6, patients: 670, areas: 15, manager: "Rajesh K / Suresh M / Priya S / Meena P" },
  { id: "2", name: "Central Tamil Nadu", code: "CTN", branches: 2, patients: 150, areas: 5, manager: "Kumar V" },
  { id: "3", name: "Chennai Metro", code: "CHN", branches: 1, patients: 245, areas: 4, manager: "Karthik D / Anitha S" },
  { id: "4", name: "Kerala (Franchise)", code: "KL", branches: 3, patients: 145, areas: 6, manager: "Rajeev N" },
  { id: "5", name: "Karnataka (Franchise)", code: "KA", branches: 2, patients: 50, areas: 3, manager: "Ashwin G" },
  { id: "6", name: "Maharashtra (Franchise)", code: "MH", branches: 2, patients: 40, areas: 3, manager: "TBD" },
  { id: "7", name: "North India (Franchise)", code: "NI", branches: 3, patients: 30, areas: 4, manager: "TBD" },
];

const AreaMaster = () => {
  const [tab, setTab] = useState("manage");
  const [selectedLocation, setSelectedLocation] = useState("default");
  const [loaded, setLoaded] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filteredAreas = allAreas.filter(a => {
    const matchLoc = selectedLocation === "default" || a.locId === selectedLocation;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.pincode.includes(search);
    return matchLoc && matchSearch && a.status === "active";
  });

  const inactiveAreas = allAreas.filter(a => a.status === "inactive");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-cyan-600" /> Area Master</h1>
          <p className="text-sm text-muted-foreground">Manage service areas, area managers, zones & franchise territories for all branches</p>
        </div>
        <Badge variant="secondary">{allAreas.filter(a => a.status === "active").length} active areas · {areaManagers.length} managers · {locations.length - 1} locations</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="manage" className="font-semibold">📍 Manage Area</TabsTrigger>
          <TabsTrigger value="managers" className="font-semibold">👤 Area Managers</TabsTrigger>
          <TabsTrigger value="zones" className="font-semibold">🗺️ Zones & Regions</TabsTrigger>
          <TabsTrigger value="inactive" className="font-semibold text-red-600">🚫 Inactive Areas</TabsTrigger>
        </TabsList>

        {/* MANAGE AREA - Location Based */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-base text-center text-primary">Manage Area Master</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Select Location */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Select Location</h3>
                <div className="flex items-center gap-3">
                  <Label className="font-semibold whitespace-nowrap">Location :</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[400px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => { setLoaded(true); toast.success("Areas loaded for selected location"); }}>Load</Button>
                  <Button variant="outline" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Area</Button>
                </div>
              </div>

              {/* Areas Table */}
              {loaded && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
                    <div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search area or pincode..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                  </div>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead className="text-orange-600">S.No</TableHead>
                      <TableHead className="text-orange-600">Area Name</TableHead>
                      <TableHead className="text-orange-600">Pincode</TableHead>
                      <TableHead className="text-orange-600">Area Manager</TableHead>
                      <TableHead className="text-orange-600">Patients</TableHead>
                      <TableHead className="text-orange-600">Branch/Location</TableHead>
                      <TableHead className="text-orange-600">Status</TableHead>
                      <TableHead className="text-orange-600">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filteredAreas.map((a, i) => (
                        <TableRow key={a.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium text-primary">{a.name}</TableCell>
                          <TableCell className="font-mono text-xs">{a.pincode}</TableCell>
                          <TableCell className="text-xs">{a.areaManager}</TableCell>
                          <TableCell><Badge variant="secondary">{a.patients}</Badge></TableCell>
                          <TableCell className="text-xs">{locations.find(l => l.id === a.locId)?.name.slice(0, 25) || "—"}</TableCell>
                          <TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">active ✓</Badge></TableCell>
                          <TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button><Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button></div></TableCell>
                        </TableRow>
                      ))}
                      {filteredAreas.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No areas found for this location. Click "Add Area" to create one.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                  <p className="text-xs text-muted-foreground mt-2">Showing 1 to {filteredAreas.length} of {filteredAreas.length} entries</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AREA MANAGERS TAB */}
        <TabsContent value="managers" className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{areaManagers.length} area managers</Badge>
            <Button onClick={() => toast.success("Add manager form")}><Plus className="h-4 w-4 mr-1" /> Assign Area Manager</Button>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Manager Name</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Location/Branch</TableHead><TableHead>Type</TableHead><TableHead>Areas Assigned</TableHead><TableHead>Patients Covered</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {areaManagers.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-xs font-mono">{m.phone}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{m.role}</Badge></TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate">{m.location}</TableCell>
                  <TableCell><Badge className={m.type === "own" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-blue-100 text-blue-700 text-xs"}>{m.type === "own" ? "Own Branch" : "Franchise"}</Badge></TableCell>
                  <TableCell className="font-semibold">{m.areasAssigned}</TableCell>
                  <TableCell><Badge variant="secondary">{m.patients}</Badge></TableCell>
                  <TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">{m.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>

          {/* Manager Performance Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {areaManagers.slice(0, 5).map(m => (
              <Card key={m.id} className="p-3 text-center">
                <p className="font-semibold text-sm">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.role}</p>
                <div className="flex justify-center gap-3 mt-2">
                  <div><p className="text-lg font-bold text-primary">{m.areasAssigned}</p><p className="text-[9px] text-muted-foreground">areas</p></div>
                  <div><p className="text-lg font-bold text-emerald-600">{m.patients}</p><p className="text-[9px] text-muted-foreground">patients</p></div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ZONES & REGIONS TAB */}
        <TabsContent value="zones" className="space-y-4">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow>
              <TableHead>Zone/Region</TableHead><TableHead>Code</TableHead><TableHead>Branches</TableHead><TableHead>Areas</TableHead><TableHead>Patients</TableHead><TableHead>Manager(s)</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {zones.map(z => (
                <TableRow key={z.id}>
                  <TableCell className="font-medium">{z.name}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-xs">{z.code}</Badge></TableCell>
                  <TableCell>{z.branches}</TableCell>
                  <TableCell>{z.areas}</TableCell>
                  <TableCell className="font-semibold">{z.patients}</TableCell>
                  <TableCell className="text-xs max-w-[200px]">{z.manager}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        {/* INACTIVE AREAS TAB */}
        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-red-50/50">
              <CardTitle className="text-base text-center text-red-600">Inactive / Discontinued Areas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table><TableHeader><TableRow>
                <TableHead>Area Name</TableHead><TableHead>Pincode</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader><TableBody>
                {inactiveAreas.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-red-600">{a.name}</TableCell>
                    <TableCell className="font-mono text-xs">{a.pincode}</TableCell>
                    <TableCell className="text-xs">{locations.find(l => l.id === a.locId)?.name || "—"}</TableCell>
                    <TableCell><Badge className="bg-red-100 text-red-700 text-xs">inactive</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" className="text-emerald-600 text-xs" onClick={() => toast.success("Area reactivated!")}>Reactivate</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ADD AREA DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Area</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Area Name *</Label><Input placeholder="e.g., Kadayanallur Town" /></div>
            <div><Label>Pincode</Label><Input placeholder="627751" /></div>
            <div><Label>Location/Branch *</Label><Select><SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger><SelectContent>{locations.filter(l => l.id !== "default").map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Area Manager</Label><Select><SelectTrigger><SelectValue placeholder="Assign manager" /></SelectTrigger><SelectContent>{areaManagers.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.role})</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Zone/Region</Label><Select><SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger><SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="own">Own Branch Area</SelectItem><SelectItem value="franchise">Franchise Territory</SelectItem><SelectItem value="partner">Partner Clinic Area</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => { toast.success("Area added!"); setAddOpen(false); }}>Save Area</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaMaster;
