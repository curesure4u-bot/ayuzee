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
import { ClipboardList, Plus, CheckCircle, Clock, AlertTriangle, Search, Loader2 } from "lucide-react";
import { useIndent } from "@/hooks/useIndent";

type AuditEntry = { id: string; item: string; batch: string; systemQty: number; physicalQty: number; variance: number; status: "matched" | "shortage" | "excess"; auditDate: string };

const HmsIndent = () => {
  const { indents, loading, error, pendingCount, fulfilledCount, updateStatus } = useIndent();
  const [audit] = useState<AuditEntry[]>([
    { id: "1", item: "Sesame Oil (Therapy)", batch: "B-2026-045", systemQty: 50, physicalQty: 48, variance: -2, status: "shortage", auditDate: "2026-07-10" },
    { id: "2", item: "Surgical Gloves", batch: "B-2026-GL", systemQty: 500, physicalQty: 500, variance: 0, status: "matched", auditDate: "2026-07-10" },
    { id: "3", item: "Cotton Rolls", batch: "B-2026-CR", systemQty: 200, physicalQty: 195, variance: -5, status: "shortage", auditDate: "2026-07-10" },
    { id: "4", item: "Dhanwantharam Tailam", batch: "KAL-789", systemQty: 25, physicalQty: 27, variance: 2, status: "excess", auditDate: "2026-07-10" },
    { id: "5", item: "Yogaraja Guggulu", batch: "B-2026-102", systemQty: 120, physicalQty: 120, variance: 0, status: "matched", auditDate: "2026-07-10" },
    { id: "6", item: "Ksheerabala 101", batch: "B-2026-055", systemQty: 18, physicalQty: 16, variance: -2, status: "shortage", auditDate: "2026-07-10" },
  ]);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-600" /> Indent & Stock Audit
          </h1>
          <p className="text-sm text-muted-foreground">Department indents, approval workflow, stock audit & variance tracking</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Raise Indent</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{indents.filter(i => i.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Indents</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{indents.filter(i => i.status === "fulfilled").length}</p><p className="text-xs text-muted-foreground">Fulfilled</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">{audit.filter(a => a.status === "shortage").length}</p><p className="text-xs text-muted-foreground">Shortages Found</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{audit.filter(a => a.status === "matched").length}/{audit.length}</p><p className="text-xs text-muted-foreground">Audit Matched</p></CardContent></Card>
      </div>

      <Tabs defaultValue="indents">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto">
          <TabsTrigger value="indents">Indent Management</TabsTrigger>
          <TabsTrigger value="audit">Stock Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="indents" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Indent No</th>
                <th className="px-3 py-2 text-left font-medium">Department</th>
                <th className="px-3 py-2 text-left font-medium">Raised By</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Items</th>
                <th className="px-3 py-2 text-left font-medium">Urgency</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {indents.map((ind) => (
                  <tr key={ind.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs font-bold">{ind.indentNo}</td>
                    <td className="px-3 py-2">{ind.department}</td>
                    <td className="px-3 py-2 text-xs">{ind.raisedBy}</td>
                    <td className="px-3 py-2 text-xs">{ind.date}</td>
                    <td className="px-3 py-2 font-medium">{ind.items}</td>
                    <td className="px-3 py-2"><Badge variant={ind.urgency === "Urgent" ? "destructive" : "secondary"} className="text-[10px]">{ind.urgency}</Badge></td>
                    <td className="px-3 py-2"><Badge variant={ind.status === "fulfilled" ? "outline" : ind.status === "pending" ? "secondary" : "default"} className={`text-xs capitalize ${ind.status === "fulfilled" ? "text-green-600" : ""}`}>{ind.status}</Badge></td>
                    <td className="px-3 py-2">
                      {ind.status === "pending" && <Button size="sm" variant="outline" className="text-xs h-6">Approve</Button>}
                      {ind.status === "approved" && <Button size="sm" variant="outline" className="text-xs h-6">Fulfill</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Last Stock Audit - Jul 10, 2026</CardTitle></CardHeader>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr>
                  <th className="px-3 py-2 text-left font-medium">Item</th>
                  <th className="px-3 py-2 text-left font-medium">Batch</th>
                  <th className="px-3 py-2 text-left font-medium">System Qty</th>
                  <th className="px-3 py-2 text-left font-medium">Physical Qty</th>
                  <th className="px-3 py-2 text-left font-medium">Variance</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {audit.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{a.item}</td>
                      <td className="px-3 py-2 font-mono text-xs">{a.batch}</td>
                      <td className="px-3 py-2">{a.systemQty}</td>
                      <td className="px-3 py-2">{a.physicalQty}</td>
                      <td className="px-3 py-2 font-bold"><span className={a.variance < 0 ? "text-red-600" : a.variance > 0 ? "text-amber-600" : "text-green-600"}>{a.variance > 0 ? "+" : ""}{a.variance}</span></td>
                      <td className="px-3 py-2"><Badge variant={a.status === "matched" ? "outline" : a.status === "shortage" ? "destructive" : "secondary"} className={`text-[10px] capitalize ${a.status === "matched" ? "text-green-600" : ""}`}>{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Raise New Indent</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Panchakarma">Panchakarma</SelectItem><SelectItem value="IPD">IPD Ward</SelectItem><SelectItem value="OPD">OPD</SelectItem><SelectItem value="Lab">Laboratory</SelectItem><SelectItem value="Pharmacy">Pharmacy</SelectItem></SelectContent></Select></div>
              <div><Label>Urgency</Label><Select><SelectTrigger><SelectValue placeholder="Normal" /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Urgent">Urgent</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Items (one per line)</Label><Input placeholder="Item name - Qty - Unit" /></div>
            <div><Label>Remarks</Label><Input placeholder="Reason / notes" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Indent raised"); setAddOpen(false); }}>Submit Indent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsIndent;
