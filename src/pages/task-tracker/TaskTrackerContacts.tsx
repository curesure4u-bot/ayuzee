import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Trash2, Phone, Search, Pencil } from "lucide-react";

type Contact = { id: string; name: string; phone: string; email: string; category: string; organization: string; notes: string; last_interaction: string };
const uid = () => crypto.randomUUID();
const CATEGORIES = ["Referring Doctor", "Lab/Diagnostic", "Supplier/Vendor", "Staff", "Patient VIP", "Insurance/TPA", "Government", "Personal", "Other"];

const sampleContacts: Contact[] = [
  { id: uid(), name: "Dr. Kavitha Menon", phone: "+91 98765 43210", email: "kavitha@clinic.com", category: "Referring Doctor", organization: "City Ayurveda Clinic", notes: "Ortho specialist. Refers spine cases.", last_interaction: "2025-05-10" },
  { id: uid(), name: "Mr. Suresh (Lab)", phone: "+91 87654 32100", email: "", category: "Lab/Diagnostic", organization: "Metropolis Lab, MG Road", notes: "Quick turnaround. Gives 10% discount for bulk.", last_interaction: "2025-05-12" },
  { id: uid(), name: "Sindhu Pharma", phone: "+91 76543 21098", email: "orders@sindhupharma.in", category: "Supplier/Vendor", organization: "Sindhu Ayurvedic Distributors", notes: "Main supplier. Min order ₹5000. Delivers in 2 days.", last_interaction: "2025-05-08" },
  { id: uid(), name: "Vignesh (Reception)", phone: "+91 65432 10987", email: "", category: "Staff", organization: "Our Clinic", notes: "Morning shift 8-2. Handles billing.", last_interaction: "2025-05-14" },
  { id: uid(), name: "TPA Coordinator — Star Health", phone: "+91 54321 09876", email: "claims@starhealth.in", category: "Insurance/TPA", organization: "Star Health Insurance", notes: "Claims contact. Approval takes 24-48 hrs.", last_interaction: "2025-05-01" },
  { id: uid(), name: "Mrs. Lakshmi Nair", phone: "+91 43210 98765", email: "", category: "Patient VIP", organization: "", notes: "Long-term patient. Panchakarma quarterly. Birthday Nov 5.", last_interaction: "2025-05-11" },
];

const TaskTrackerContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({ name: "", phone: "", email: "", category: "Other", organization: "", notes: "", last_interaction: new Date().toISOString().split("T")[0] });

  const filtered = contacts.filter(c => {
    if (filterCat !== "all" && c.category !== filterCat) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search) && !c.organization.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => { setEditingId(null); setForm({ name: "", phone: "", email: "", category: "Other", organization: "", notes: "", last_interaction: new Date().toISOString().split("T")[0] }); setDialogOpen(true); };
  const openEdit = (c: Contact) => { setEditingId(c.id); setForm({ ...c }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (editingId) { setContacts(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c)); toast.success("Updated"); }
    else { setContacts(prev => [{ id: uid(), ...form }, ...prev]); toast.success("Contact added"); }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Contact Book</h1>
          <p className="text-sm text-muted-foreground">Quick lookup for vendors, staff, referring doctors, suppliers</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" /> Add Contact</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-[220px]"><Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search name, phone, org..." className="pl-7 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={filterCat} onValueChange={setFilterCat}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Badge variant="outline" className="h-8 px-2">{filtered.length} contacts</Badge>
      </div>

      <div className="space-y-2">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
                {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-semibold text-sm">{c.name}</p><Badge variant="outline" className="text-[9px]">{c.category}</Badge></div>
                <div className="flex gap-3 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                  {c.phone && <span className="flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{c.phone}</span>}
                  {c.organization && <span>{c.organization}</span>}
                  {c.last_interaction && <span>Last: {c.last_interaction}</span>}
                </div>
                {c.notes && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{c.notes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                {c.phone && <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => window.open(`tel:${c.phone}`)}><Phone className="h-3.5 w-3.5" /></Button>}
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => { setContacts(prev => prev.filter(x => x.id !== c.id)); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-blue-600">{editingId ? "Edit" : "Add"} Contact</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91..." /></div>
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Organization</Label><Input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerContacts;
