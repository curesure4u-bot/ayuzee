import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Megaphone, Plus, Search, Users, Phone, Calendar,
  TrendingUp, Target, Clock, CheckCircle, ArrowRight,
} from "lucide-react";

type Lead = {
  id: string; name: string; contact: string; category: string;
  dueDate: string; purpose: string; status: "New" | "Contacted" | "Interested" | "Converted" | "Lost";
  assignedTo: string; source: string; notes: string; createdAt: string;
};

type FollowUp = {
  id: string; leadName: string; contact: string; scheduledDate: string;
  type: "Call" | "Visit" | "WhatsApp" | "Email"; notes: string;
  status: "Pending" | "Done" | "Rescheduled";
};

const mockLeads: Lead[] = [
  { id: "1", name: "Anitha Krishnan", contact: "+91-9876543210", category: "Panchakarma Inquiry", dueDate: "2026-07-22", purpose: "14-day Panchakarma for knee pain", status: "Contacted", assignedTo: "Vignesh", source: "Walk-in", notes: "Wants pricing details", createdAt: "2026-07-20" },
  { id: "2", name: "Suresh Babu", contact: "+91-8765432109", category: "Corporate Wellness", dueDate: "2026-07-23", purpose: "Corporate tie-up for 50 employees", status: "Interested", assignedTo: "Marketing Agent", source: "Website", notes: "Follow-up scheduled", createdAt: "2026-07-18" },
  { id: "3", name: "Meera Nair", contact: "+91-7654321098", category: "Teleconsult Lead", dueDate: "2026-07-25", purpose: "International patient - Dubai", status: "New", assignedTo: "Vignesh", source: "Google Ads", notes: "Wants video consult with Dr. Arun", createdAt: "2026-07-21" },
  { id: "4", name: "Rajesh Pillai", contact: "+91-9988776655", category: "Treatment Package", dueDate: "2026-07-22", purpose: "Weight loss program", status: "Contacted", assignedTo: "Bhavani", source: "Referral", notes: "Referred by existing patient Ramesh", createdAt: "2026-07-19" },
  { id: "5", name: "Kavitha Devi", contact: "+91-8877665544", category: "Insurance Inquiry", dueDate: "2026-07-24", purpose: "Wants to know if Ayush insurance covered", status: "New", assignedTo: "Cashier", source: "Phone Call", notes: "", createdAt: "2026-07-21" },
];

const mockFollowUps: FollowUp[] = [
  { id: "1", leadName: "Anitha Krishnan", contact: "+91-9876543210", scheduledDate: "2026-07-22", type: "Call", notes: "Share Panchakarma pricing", status: "Pending" },
  { id: "2", leadName: "Suresh Babu", contact: "+91-8765432109", scheduledDate: "2026-07-23", type: "Visit", notes: "Company visit for wellness proposal", status: "Pending" },
  { id: "3", leadName: "Rajesh Pillai", contact: "+91-9988776655", scheduledDate: "2026-07-22", type: "WhatsApp", notes: "Send weight loss program brochure", status: "Pending" },
  { id: "4", leadName: "Meera Nair", contact: "+91-7654321098", scheduledDate: "2026-07-25", type: "Call", notes: "Schedule teleconsult slot", status: "Pending" },
  { id: "5", leadName: "Previous Patient Lead", contact: "+91-9900112233", scheduledDate: "2026-07-28", type: "Call", notes: "6-month follow-up for Panchakarma", status: "Pending" },
];

const HmsMarketing = () => {
  const [leads] = useState<Lead[]>(mockLeads);
  const [followUps] = useState<FollowUp[]>(mockFollowUps);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("loc1");
  const [followUpFilter, setFollowUpFilter] = useState("today");

  const filteredLeads = leads.filter(l =>
    !searchText || l.name.toLowerCase().includes(searchText.toLowerCase()) || l.contact.includes(searchText)
  );

  const filteredFollowUps = followUps.filter(f => {
    if (followUpFilter === "today") return f.scheduledDate === "2026-07-22";
    if (followUpFilter === "week") return f.scheduledDate <= "2026-07-29";
    if (followUpFilter === "month") return f.scheduledDate <= "2026-08-22";
    if (followUpFilter === "3months") return f.scheduledDate <= "2026-10-22";
    return true;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="leads">
        <div className="flex items-center gap-3">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="followups">Follow ups</TabsTrigger>
          </TabsList>
        </div>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select defaultValue="new-lead">
                <SelectTrigger className="w-[130px] h-8 text-xs bg-orange-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-lead">New Lead</SelectItem>
                  <SelectItem value="search-lead">Search Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600 text-center">Manage All Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[250px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
                </Select>
              </div>

              {/* Time filter buttons */}
              <div className="flex gap-2 mb-4">
                {["Today", "Next 1 Week", "Next 1 Month", "Next 3 Months", "Next 6 Months"].map((label, idx) => (
                  <Button key={label} size="sm" variant={idx === 0 ? "default" : "outline"}
                    className={`text-xs h-7 ${idx === 0 ? "bg-orange-600 hover:bg-orange-700" : ""}`}>
                    {label}
                  </Button>
                ))}
              </div>

              {/* Table controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Show</span>
                  <Select defaultValue="100"><SelectTrigger className="w-[70px] h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select>
                  <span className="text-xs">entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Search:</span>
                  <Input className="w-[200px] h-7 text-xs" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7">Assign</Button>
              </div>

              {/* Leads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b"><tr>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">S.No</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Lead</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Contact</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Category</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Due Date</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Purpose</th>
                    <th className="px-3 py-2 text-left font-medium text-orange-700">Status</th>
                  </tr></thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No data available in table</td></tr>
                    ) : filteredLeads.map((l, idx) => (
                      <tr key={l.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-xs">{l.name}</td>
                        <td className="px-3 py-2 text-xs">{l.contact}</td>
                        <td className="px-3 py-2 text-xs">{l.category}</td>
                        <td className="px-3 py-2 text-xs">{l.dueDate}</td>
                        <td className="px-3 py-2 text-xs">{l.purpose}</td>
                        <td className="px-3 py-2"><Badge variant={l.status === "Converted" ? "outline" : l.status === "Interested" ? "default" : l.status === "Lost" ? "destructive" : "secondary"} className={`text-[10px] ${l.status === "Converted" ? "text-green-600" : ""}`}>{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Showing 1 to {filteredLeads.length} of {filteredLeads.length} entries</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Previous</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow Ups Tab */}
        <TabsContent value="followups" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] h-8 text-xs bg-green-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Manage All Lead</SelectItem>
                <SelectItem value="my">Manage My Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600 text-center">Follow Ups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {[
                  { label: "Today", value: "today" },
                  { label: "Next 1 Week", value: "week" },
                  { label: "Next 1 Month", value: "month" },
                  { label: "Next 3 Months", value: "3months" },
                  { label: "All", value: "all" },
                ].map(f => (
                  <Button key={f.value} size="sm" variant={followUpFilter === f.value ? "default" : "outline"}
                    className={`text-xs h-7 ${followUpFilter === f.value ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                    onClick={() => setFollowUpFilter(f.value)}>
                    {f.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredFollowUps.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground text-sm">No follow-ups scheduled for this period</p>
                ) : filteredFollowUps.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center ${
                        f.type === "Call" ? "bg-blue-100" : f.type === "Visit" ? "bg-green-100" : f.type === "WhatsApp" ? "bg-emerald-100" : "bg-purple-100"
                      }`}>
                        <Phone className={`h-4 w-4 ${f.type === "Call" ? "text-blue-600" : f.type === "Visit" ? "text-green-600" : "text-emerald-600"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{f.leadName}</p>
                        <p className="text-xs text-muted-foreground">{f.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{f.scheduledDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Lead Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-orange-600">New Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input placeholder="Lead name" /></div>
            <div><Label>Contact *</Label><div className="flex gap-1"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input placeholder="Mobile" className="rounded-l-none" /></div></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="pk">Panchakarma Inquiry</SelectItem><SelectItem value="corp">Corporate Wellness</SelectItem><SelectItem value="tele">Teleconsult Lead</SelectItem><SelectItem value="pkg">Treatment Package</SelectItem><SelectItem value="ins">Insurance Inquiry</SelectItem></SelectContent></Select></div>
              <div><Label>Source</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="walkin">Walk-in</SelectItem><SelectItem value="phone">Phone Call</SelectItem><SelectItem value="web">Website</SelectItem><SelectItem value="google">Google Ads</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="social">Social Media</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due Date</Label><Input type="date" /></div>
              <div><Label>Assign To</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="vignesh">Vignesh</SelectItem><SelectItem value="bhavani">Bhavani</SelectItem><SelectItem value="agent">Marketing Agent</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Purpose</Label><Input placeholder="Purpose of inquiry" /></div>
            <div><Label>Notes</Label><Textarea placeholder="Additional notes" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { toast.success("Lead created"); setCreateOpen(false); }}>Save Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsMarketing;
