import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookUser, Plus, Search, Download, Phone, Mail,
  MapPin, Building2, User, Users,
} from "lucide-react";

type Contact = {
  id: string; code: string; category: string; name: string; contactNo: string;
  alternateNo: string; email: string; company: string; street: string; area: string;
  city: string; state: string; zip: string; country: string; status: "Active" | "Inactive";
  referredBy: string; incentivePlan: string; marketingAgent: string; otherAgent: string;
  allowedLocations: string[]; includeInReferred: boolean; isExternalReferral: boolean;
  department: string; createdBy: string;
};

const mockContacts: Contact[] = [
  { id: "1", code: "EC001", category: "External Doctor", name: "ADMIN", contactNo: "+9042225333", alternateNo: "", email: "", company: "", street: "", area: "", city: "", state: "Tamil Nadu", zip: "", country: "India", status: "Active", referredBy: "", incentivePlan: "", marketingAgent: "", otherAgent: "", allowedLocations: ["#11, Main Road, Kadayanallur"], includeInReferred: true, isExternalReferral: true, department: "", createdBy: "Admin" },
  { id: "2", code: "EC002", category: "External Doctor", name: "AKSHARA", contactNo: "+9790532657", alternateNo: "", email: "", company: "", street: "", area: "", city: "", state: "Tamil Nadu", zip: "", country: "India", status: "Active", referredBy: "", incentivePlan: "", marketingAgent: "", otherAgent: "", allowedLocations: ["#11, Main Road, Kadayanallur"], includeInReferred: true, isExternalReferral: true, department: "", createdBy: "Admin" },
  { id: "3", code: "EC003", category: "External Doctor", name: "DR jawahira banu", contactNo: "+9842909686", alternateNo: "", email: "jawahirasaleem@gmail.com", company: "", street: "", area: "", city: "", state: "Tamil Nadu", zip: "", country: "India", status: "Active", referredBy: "", incentivePlan: "", marketingAgent: "", otherAgent: "", allowedLocations: ["#11, Main Road, Kadayanallur"], includeInReferred: true, isExternalReferral: true, department: "", createdBy: "Admin" },
  { id: "4", code: "EC004", category: "External Doctor", name: "DR.SAHANA FATHIMA", contactNo: "+6380707995", alternateNo: "", email: "", company: "", street: "", area: "", city: "", state: "Tamil Nadu", zip: "", country: "India", status: "Active", referredBy: "", incentivePlan: "", marketingAgent: "", otherAgent: "", allowedLocations: ["#11, Main Road, Kadayanallur"], includeInReferred: true, isExternalReferral: true, department: "", createdBy: "Admin" },
  { id: "5", code: "EC005", category: "External Doctor", name: "DR.SIVARAMAKRISHNAN", contactNo: "+9363498391", alternateNo: "", email: "", company: "", street: "", area: "", city: "", state: "Tamil Nadu", zip: "", country: "India", status: "Active", referredBy: "", incentivePlan: "", marketingAgent: "", otherAgent: "", allowedLocations: ["#11, Main Road, Kadayanallur"], includeInReferred: true, isExternalReferral: true, department: "", createdBy: "Admin" },
];

const HmsAddressBook = () => {
  const [contacts] = useState<Contact[]>(mockContacts);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const filtered = contacts.filter(c => {
    if (activeTab === "inactive") return c.status === "Inactive";
    if (activeTab === "active") return c.status === "Active";
    return true;
  }).filter(c => !searchText || c.name.toLowerCase().includes(searchText.toLowerCase()) || c.contactNo.includes(searchText));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <BookUser className="h-6 w-6 text-orange-600" /> Address Book
        </h1>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="text-orange-600">Manage Address Book</TabsTrigger>
          <TabsTrigger value="inactive" className="text-red-600">Manage Inactive Address Book</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-orange-600">
                  {activeTab === "active" ? "Manage Address Book" : "Manage Inactive Address Book"}
                </CardTitle>
                <Button size="sm" variant="outline" className="bg-green-600 text-white hover:bg-green-700 text-xs" onClick={() => toast.success("Exported as CSV")}>
                  Export As CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Show</span>
                  <Select defaultValue="100"><SelectTrigger className="w-[70px] h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select>
                  <span className="text-xs">entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Search:</span>
                  <Input className="w-[200px] h-7 text-xs" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b"><tr>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Code</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Company</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Contact No</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Alternate No</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Email</th>
                  </tr></thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No data available in table</td></tr>
                    ) : filtered.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-3 text-xs">{c.code}</td>
                        <td className="px-3 py-3 font-medium text-xs">{c.name}</td>
                        <td className="px-3 py-3 text-xs">{c.company || "—"}</td>
                        <td className="px-3 py-3 text-xs">{c.contactNo}</td>
                        <td className="px-3 py-3 text-xs">{c.alternateNo || "—"}</td>
                        <td className="px-3 py-3 text-xs">{c.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Showing 1 to {filtered.length} of {filtered.length} entries</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Previous</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs bg-orange-50">1</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Contact Dialog — matches MocDoc exactly */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-orange-600">Contact</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-orange-600">Category *</Label><Select><SelectTrigger><SelectValue placeholder="External Doctor" /></SelectTrigger><SelectContent><SelectItem value="ext-doctor">External Doctor</SelectItem><SelectItem value="int-doctor">Internal Doctor</SelectItem><SelectItem value="partner">Partner Hospital</SelectItem><SelectItem value="vendor">Vendor</SelectItem><SelectItem value="corporate">Corporate</SelectItem></SelectContent></Select></div>
            <div><Label className="text-orange-600">Name *</Label><Input placeholder="Name" /></div>
            <div><Label className="text-orange-600">Contact No *</Label><div className="flex gap-1"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input placeholder="Phone No" className="rounded-l-none" /></div></div>
            <div><Label>Referred By</Label><Select><SelectTrigger><SelectValue placeholder="Select a Doctor" /></SelectTrigger><SelectContent><SelectItem value="d1">Dr. Arun Sharma</SelectItem><SelectItem value="d2">Dr. Meena Patel</SelectItem></SelectContent></Select></div>
            <div><Label>Status</Label><Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <div><Label>Incentive Plan</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="5pct">5% Commission</SelectItem><SelectItem value="10pct">10% Commission</SelectItem><SelectItem value="flat500">Flat ₹500/referral</SelectItem></SelectContent></Select></div>
            <div><Label>Alternate Contact No</Label><div className="flex gap-1"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input placeholder="Alternate Phone No" className="rounded-l-none" /></div></div>
            <div><Label>Street</Label><Input placeholder="Street" /></div>
            <div><Label>Company</Label><Input placeholder="Company" /></div>
            <div><Label>Area</Label><Input placeholder="Area" /></div>
            <div><Label>City</Label><Input placeholder="City" /></div>
            <div><Label>State/Union Territory</Label><Select><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent><SelectItem value="tn">Tamil Nadu</SelectItem><SelectItem value="kl">Kerala</SelectItem><SelectItem value="ka">Karnataka</SelectItem></SelectContent></Select></div>
            <div><Label>Zip</Label><Input placeholder="Zip" /></div>
            <div><Label>Country</Label><Select defaultValue="india"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="india">India</SelectItem></SelectContent></Select></div>
            <div><Label>Email</Label><Input placeholder="Contact Person Email" type="email" /></div>
            <div><Label>Marketing Agent</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="agent1">Agent 1</SelectItem></SelectContent></Select></div>
            <div><Label>Other Agent</Label><Select><SelectTrigger><SelectValue placeholder="Select Agent" /></SelectTrigger><SelectContent><SelectItem value="agent2">Agent 2</SelectItem></SelectContent></Select></div>
            <div>
              <Label className="text-orange-600">Allowed Locations *</Label>
              <div className="mt-1 p-2 border rounded space-y-1 max-h-[100px] overflow-y-auto">
                {["#11, Main Road, Kadayanallur, .", "136, LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam", "41, Miranda Lane, Otr CH Road, Theni", "No-57, Rajbowlbar Naran Rao, , Tirunelveli"].map(loc => (
                  <div key={loc} className="flex items-center gap-2"><Checkbox defaultChecked /><span className="text-xs">{loc}</span></div>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" className="h-6 text-[10px] bg-green-600 text-white hover:bg-green-700">Select All</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px] bg-red-600 text-white hover:bg-red-700">DeSelect All</Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Choose for multi-location access for this user</p>
            </div>
            <div><Label>Other Details</Label><Input placeholder="Other Details" /></div>
            <div className="flex items-center gap-2"><Checkbox /><Label className="text-xs">Include in Referred By List</Label></div>
            <p className="text-[10px] text-muted-foreground -mt-2">If checked, this contact will be added to Referred by List</p>
            <div className="flex items-center gap-2"><Checkbox /><Label className="text-xs">Is External Referral</Label></div>
            <p className="text-[10px] text-muted-foreground -mt-2">If checked, this contact will be added to External Referral List</p>
            <div className="flex items-center gap-2"><Checkbox /><Label className="text-xs">Set login</Label></div>
            <p className="text-[10px] text-muted-foreground -mt-2">If checked, Login can be created</p>
          </div>
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={() => { toast.success("Contact created"); setCreateOpen(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsAddressBook;
