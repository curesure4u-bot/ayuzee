import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Droplets, Plus, Search, AlertTriangle, Users, Calendar,
  CheckCircle, Clock, Heart, Loader2,
} from "lucide-react";
import { useBloodBank } from "@/hooks/useBloodBank";

const HmsBloodBank = () => {
  const { stock, requests, donors, loading, error, totalUnits, criticalCount, pendingRequests, approveRequest } = useBloodBank();
  const [addDonorOpen, setAddDonorOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const expiringUnits = stock.filter(b => b.status === "low" || b.status === "critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Droplets className="h-6 w-6 text-red-600" /> Blood Bank Management
          </h1>
          <p className="text-sm text-muted-foreground">Donor registry, blood stock, cross-matching, transfusion records & component separation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddDonorOpen(true)}><Users className="mr-1 h-4 w-4" /> Register Donor</Button>
          <Button size="sm" onClick={() => setRequestOpen(true)}><Plus className="mr-1 h-4 w-4" /> Blood Request</Button>
        </div>
      </div>

      {/* Blood Stock Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {stock.map((s) => (
          <Card key={s.id} className={s.status !== "available" ? "border-red-300 bg-red-50/30" : ""}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{s.group}</p>
              <p className="text-2xl font-bold mt-1">{s.units}</p>
              <p className="text-[10px] text-muted-foreground">{s.component}</p>
              {s.status !== "available" && <Badge variant="destructive" className="text-[9px] mt-1">{s.status}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{totalUnits}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{expiringUnits}</p><p className="text-xs text-muted-foreground">Expiring (7 days)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{donors.length}</p><p className="text-xs text-muted-foreground">Registered Donors</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{requests.filter(r => r.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Requests</p></CardContent></Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="requests">Blood Requests</TabsTrigger>
          <TabsTrigger value="donors">Donor Registry</TabsTrigger>
          <TabsTrigger value="transfusions">Transfusion Log</TabsTrigger>
          <TabsTrigger value="components">Component Separation</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Patient</th>
                      <th className="px-3 py-2 text-left font-medium">Group</th>
                      <th className="px-3 py-2 text-left font-medium">Units</th>
                      <th className="px-3 py-2 text-left font-medium">Urgency</th>
                      <th className="px-3 py-2 text-left font-medium">Requested By</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{r.patient}</td>
                        <td className="px-3 py-2"><Badge className="bg-red-100 text-red-700 border-red-300">{r.group}</Badge></td>
                        <td className="px-3 py-2 font-bold">{r.units}</td>
                        <td className="px-3 py-2"><Badge variant={r.urgency === "emergency" ? "destructive" : r.urgency === "urgent" ? "default" : "secondary"} className="text-xs capitalize">{r.urgency}</Badge></td>
                        <td className="px-3 py-2 text-xs">{r.requestedBy}</td>
                        <td className="px-3 py-2 text-xs">{r.date}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className={`text-xs capitalize ${r.status === "issued" ? "text-green-600" : ""}`}>{r.status.replace("_", " ")}</Badge></td>
                        <td className="px-3 py-2">
                          {r.status === "pending" && <Button size="sm" variant="outline" className="text-xs h-6">Cross-Match</Button>}
                          {r.status === "cross_matched" && <Button size="sm" className="text-xs h-6">Issue Blood</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Donor Name</th>
                      <th className="px-3 py-2 text-left font-medium">Blood Group</th>
                      <th className="px-3 py-2 text-left font-medium">Phone</th>
                      <th className="px-3 py-2 text-left font-medium">Last Donation</th>
                      <th className="px-3 py-2 text-left font-medium">Total</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((d) => (
                      <tr key={d.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{d.name}</td>
                        <td className="px-3 py-2"><Badge className="bg-red-100 text-red-700 border-red-300">{d.group}</Badge></td>
                        <td className="px-3 py-2">{d.phone}</td>
                        <td className="px-3 py-2 text-xs">{d.lastDonation}</td>
                        <td className="px-3 py-2 font-bold">{d.eligible ? "✓" : "—"}</td>
                        <td className="px-3 py-2"><Badge variant={d.eligible ? "outline" : "secondary"} className={`text-xs ${d.eligible ? "text-green-600" : "text-amber-600"}`}>{d.eligible ? "Eligible" : "Not yet"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfusions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Recent Transfusions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { patient: "Lakshmi Devi", group: "A+", units: 1, date: "2026-07-14", type: "Whole Blood", reaction: "None" },
                  { patient: "Suresh M", group: "O+", units: 2, date: "2026-07-12", type: "Packed RBC", reaction: "None" },
                  { patient: "Emergency #398", group: "O-", units: 3, date: "2026-07-10", type: "Whole Blood", reaction: "Mild fever (managed)" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{t.patient}</p>
                      <p className="text-xs text-muted-foreground">{t.type} · {t.units} unit(s) · {t.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">{t.group}</Badge>
                      <Badge variant={t.reaction === "None" ? "outline" : "secondary"} className={`text-xs ${t.reaction === "None" ? "text-green-600" : "text-amber-600"}`}>
                        {t.reaction === "None" ? "No reaction" : t.reaction}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Component Separation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Separate whole blood into components for targeted therapy.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { component: "Packed Red Blood Cells (PRBC)", stock: 15, shelf: "35-42 days" },
                  { component: "Fresh Frozen Plasma (FFP)", stock: 8, shelf: "1 year (frozen)" },
                  { component: "Platelet Concentrate", stock: 4, shelf: "5 days" },
                  { component: "Cryoprecipitate", stock: 3, shelf: "1 year (frozen)" },
                  { component: "Whole Blood", stock: totalUnits, shelf: "35 days" },
                  { component: "Buffy Coat", stock: 2, shelf: "24 hours" },
                ].map((c) => (
                  <Card key={c.component}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{c.component}</p>
                      <p className="text-xl font-bold mt-1">{c.stock} <span className="text-xs font-normal text-muted-foreground">units</span></p>
                      <p className="text-[10px] text-muted-foreground">Shelf life: {c.shelf}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Register Donor Dialog */}
      <Dialog open={addDonorOpen} onOpenChange={setAddDonorOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register Blood Donor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Donor Name *</Label><Input placeholder="Full name" /></div>
              <div><Label>Blood Group *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input placeholder="Mobile" /></div>
              <div><Label>Aadhaar / ID</Label><Input placeholder="ID proof number" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Age</Label><Input type="number" placeholder="Age" /></div>
              <div><Label>Weight (kg)</Label><Input type="number" placeholder="Min 50 kg" /></div>
            </div>
            <div><Label>Medical History Notes</Label><Input placeholder="Any known conditions, medications..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDonorOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Donor registered"); setAddDonorOpen(false); }}>Register Donor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blood Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Blood Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient Name / IP No *</Label><Input placeholder="Search patient" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Blood Group *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Group" /></SelectTrigger>
                  <SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Units *</Label><Input type="number" placeholder="Qty" /></div>
              <div><Label>Urgency</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="routine">Routine</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Requested By</Label><Input placeholder="Doctor name" /></div>
              <div><Label>Component</Label>
                <Select><SelectTrigger><SelectValue placeholder="Whole Blood" /></SelectTrigger>
                  <SelectContent><SelectItem value="whole">Whole Blood</SelectItem><SelectItem value="prbc">Packed RBC</SelectItem><SelectItem value="ffp">FFP</SelectItem><SelectItem value="platelet">Platelet</SelectItem><SelectItem value="cryo">Cryoprecipitate</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Clinical Indication</Label><Input placeholder="Reason for transfusion" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Blood request submitted"); setRequestOpen(false); }}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsBloodBank;
