import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Megaphone, Plus, Phone, Loader2 } from "lucide-react";
import { useMarketingLeads } from "@/hooks/useMarketingLeads";

const HmsMarketing = () => {
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formSource, setFormSource] = useState("Walk-in");

  const { leads, followUps, loading, error, createLead } = useMarketingLeads(searchText);

  const handleCreateLead = async () => {
    if (!formName || !formContact) {
      toast.error("Name and contact are required");
      return;
    }
    const success = await createLead({
      name: formName, contact: formContact, category: formCategory || "General Inquiry",
      purpose: formPurpose, dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "New", assignedTo: "", source: formSource, notes: "",
    });
    if (success) {
      toast.success("Lead created");
      setCreateOpen(false);
      setFormName(""); setFormContact(""); setFormCategory(""); setFormPurpose("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-orange-600" /> Marketing & CRM
        </h1>
        <Button onClick={() => setCreateOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-1 h-4 w-4" /> New Lead
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading leads...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{leads.length}</p><p className="text-xs text-muted-foreground">Total Leads</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-600">{leads.filter((l) => l.status === "New").length}</p><p className="text-xs text-muted-foreground">New</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{leads.filter((l) => l.status === "Contacted").length}</p><p className="text-xs text-muted-foreground">Contacted</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{leads.filter((l) => l.status === "Interested").length}</p><p className="text-xs text-muted-foreground">Interested</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-purple-600">{followUps.length}</p><p className="text-xs text-muted-foreground">Pending Follow-ups</p></CardContent></Card>
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups ({followUps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input className="max-w-[250px] h-8 text-xs" placeholder="Search by name or contact..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">S.No</th>
                    <th className="px-3 py-2 text-left font-medium">Lead</th>
                    <th className="px-3 py-2 text-left font-medium">Contact</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                    <th className="px-3 py-2 text-left font-medium">Due Date</th>
                    <th className="px-3 py-2 text-left font-medium">Purpose</th>
                    <th className="px-3 py-2 text-left font-medium">Source</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {leads.map((l, idx) => (
                      <tr key={l.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-xs">{l.name}</td>
                        <td className="px-3 py-2 text-xs">{l.contact}</td>
                        <td className="px-3 py-2 text-xs">{l.category}</td>
                        <td className="px-3 py-2 text-xs">{l.dueDate}</td>
                        <td className="px-3 py-2 text-xs">{l.purpose}</td>
                        <td className="px-3 py-2 text-xs">{l.source}</td>
                        <td className="px-3 py-2">
                          <Badge variant={l.status === "Converted" ? "outline" : l.status === "Interested" ? "default" : l.status === "Lost" ? "destructive" : "secondary"}
                            className={`text-[10px] ${l.status === "Converted" ? "text-green-600" : ""}`}>{l.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No leads found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followups" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Pending Follow-ups</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {followUps.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center ${
                        f.type === "Call" ? "bg-blue-100" : f.type === "Visit" ? "bg-green-100" : "bg-emerald-100"
                      }`}>
                        <Phone className={`h-4 w-4 ${f.type === "Call" ? "text-blue-600" : "text-green-600"}`} />
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
                {followUps.length === 0 && (
                  <p className="text-center py-6 text-muted-foreground text-sm">No pending follow-ups</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Lead Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium">Name *</label><Input className="h-8 text-xs" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Contact *</label><Input className="h-8 text-xs" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="+91-" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Category</label><Input className="h-8 text-xs" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="e.g. Panchakarma Inquiry" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Source</label><Select value={formSource} onValueChange={setFormSource}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Walk-in">Walk-in</SelectItem><SelectItem value="Phone Call">Phone Call</SelectItem><SelectItem value="Website">Website</SelectItem><SelectItem value="Google Ads">Google Ads</SelectItem><SelectItem value="Referral">Referral</SelectItem><SelectItem value="WhatsApp">WhatsApp</SelectItem></SelectContent></Select></div>
            <div className="space-y-1 col-span-2"><label className="text-xs font-medium">Purpose</label><Input className="h-8 text-xs" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="What are they looking for?" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLead} className="bg-orange-600 hover:bg-orange-700">Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsMarketing;
