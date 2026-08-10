import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FolderOpen, Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Clock,
  FileText, Shield, Building2, CreditCard, Handshake, Award,
  Search, ExternalLink, Calendar,
} from "lucide-react";

type DBREntry = {
  id: string;
  title: string;
  description: string;
  category: string;
  reference_number: string;
  issuing_authority: string;
  issue_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  status: string;
  file_url: string;
  google_sheet_url: string;
  notes: string;
  reminder_days_before: number;
  is_critical: boolean;
};

const uid = () => crypto.randomUUID();
const today = new Date().toISOString().split("T")[0];

const CATEGORIES = [
  { value: "license", label: "License", icon: Shield, color: "bg-blue-100 text-blue-700" },
  { value: "registration", label: "Registration", icon: FileText, color: "bg-teal-100 text-teal-700" },
  { value: "insurance", label: "Insurance", icon: Shield, color: "bg-purple-100 text-purple-700" },
  { value: "tax", label: "Tax / GST", icon: CreditCard, color: "bg-amber-100 text-amber-700" },
  { value: "agreement", label: "Agreement", icon: Handshake, color: "bg-pink-100 text-pink-700" },
  { value: "certificate", label: "Certificate", icon: Award, color: "bg-green-100 text-green-700" },
  { value: "permit", label: "Permit", icon: FileText, color: "bg-orange-100 text-orange-700" },
  { value: "bank", label: "Bank Account", icon: CreditCard, color: "bg-indigo-100 text-indigo-700" },
  { value: "property", label: "Property", icon: Building2, color: "bg-rose-100 text-rose-700" },
  { value: "other", label: "Other", icon: FolderOpen, color: "bg-gray-100 text-gray-700" },
];

const sampleEntries: DBREntry[] = [
  { id: uid(), title: "AYUSH Council Registration", description: "Registered with State AYUSH Council as Ayurveda Practitioner", category: "registration", reference_number: "KA/AYU/2022/4567", issuing_authority: "Karnataka State AYUSH Council", issue_date: "2022-03-15", expiry_date: "2027-03-14", renewal_date: "2026-12-15", status: "active", file_url: "", google_sheet_url: "", notes: "Renewal application 3 months before expiry", reminder_days_before: 90, is_critical: true },
  { id: uid(), title: "Clinical Establishment License", description: "License to operate AYUSH clinic under CEA 2010", category: "license", reference_number: "CEA/BLR/2023/892", issuing_authority: "District Health Officer, Bangalore", issue_date: "2023-06-01", expiry_date: "2025-05-31", renewal_date: "2025-03-01", status: "renewal_due", file_url: "", google_sheet_url: "", notes: "Submit renewal form CE-3 with fees", reminder_days_before: 60, is_critical: true },
  { id: uid(), title: "GST Registration", description: "Goods & Services Tax registration for clinic", category: "tax", reference_number: "29AADCF1234F1Z5", issuing_authority: "GST Department, Govt. of India", issue_date: "2023-01-10", expiry_date: null, renewal_date: null, status: "active", file_url: "", google_sheet_url: "", notes: "Annual return due by Dec 31. Quarterly GSTR-1 by 11th", reminder_days_before: 30, is_critical: false },
  { id: uid(), title: "Professional Indemnity Insurance", description: "Medical malpractice liability coverage - ₹25 Lakh", category: "insurance", reference_number: "PI/2024/MED/7890", issuing_authority: "New India Assurance", issue_date: "2024-04-01", expiry_date: "2025-03-31", renewal_date: "2025-02-15", status: "active", file_url: "", google_sheet_url: "", notes: "₹8,500/year premium. Covers all consultation activities.", reminder_days_before: 45, is_critical: true },
  { id: uid(), title: "Drug License (Retail)", description: "License to sell Ayurvedic medicines from clinic pharmacy", category: "license", reference_number: "DL/AY/2023/456", issuing_authority: "Drug Controller, Karnataka", issue_date: "2023-08-20", expiry_date: "2026-08-19", renewal_date: "2026-05-20", status: "active", file_url: "", google_sheet_url: "", notes: "Inspection due annually. Keep premises clean.", reminder_days_before: 90, is_critical: true },
  { id: uid(), title: "PAN Card (Clinic)", description: "Permanent Account Number for business entity", category: "tax", reference_number: "AADCF1234F", issuing_authority: "Income Tax Department", issue_date: "2022-01-15", expiry_date: null, renewal_date: null, status: "active", file_url: "", google_sheet_url: "", notes: "Linked to bank and GST", reminder_days_before: 0, is_critical: false },
  { id: uid(), title: "Clinic Lease Agreement", description: "5-year lease for clinic premises at MG Road", category: "agreement", reference_number: "LEASE/2023/45", issuing_authority: "Landlord: Mr. Krishnamurthy", issue_date: "2023-01-01", expiry_date: "2027-12-31", renewal_date: "2027-06-01", status: "active", file_url: "", google_sheet_url: "", notes: "Rent: ₹35,000/month. 5% annual increment.", reminder_days_before: 180, is_critical: false },
  { id: uid(), title: "Fire Safety Certificate", description: "NOC from Fire Department for clinic building", category: "permit", reference_number: "FS/BLR/2024/123", issuing_authority: "Fire & Emergency Services, Bangalore", issue_date: "2024-01-20", expiry_date: "2025-01-19", renewal_date: "2024-12-01", status: "renewal_due", file_url: "", google_sheet_url: "", notes: "Annual renewal. Inspection required.", reminder_days_before: 30, is_critical: true },
  { id: uid(), title: "Current Account — Clinic", description: "Business current account for all clinic transactions", category: "bank", reference_number: "A/C: 9876543210", issuing_authority: "HDFC Bank, MG Road Branch", issue_date: "2022-02-10", expiry_date: null, renewal_date: null, status: "active", file_url: "", google_sheet_url: "", notes: "Linked to payment gateway. Monthly statement on 1st.", reminder_days_before: 0, is_critical: false },
];

const BusinessRegisterPage = () => {
  const [entries, setEntries] = useState<DBREntry[]>(sampleEntries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState<Omit<DBREntry, "id">>({
    title: "", description: "", category: "license", reference_number: "",
    issuing_authority: "", issue_date: "", expiry_date: "", renewal_date: "",
    status: "active", file_url: "", google_sheet_url: "", notes: "",
    reminder_days_before: 30, is_critical: false,
  });

  // Stats
  const activeCount = entries.filter(e => e.status === "active").length;
  const expiredCount = entries.filter(e => e.status === "expired").length;
  const renewalDueCount = entries.filter(e => e.status === "renewal_due").length;
  const criticalCount = entries.filter(e => e.is_critical).length;

  // Expiry alerts
  const expiringWithin30 = useMemo(() => {
    const d30 = new Date(); d30.setDate(d30.getDate() + 30);
    return entries.filter(e => e.expiry_date && new Date(e.expiry_date) <= d30 && new Date(e.expiry_date) >= new Date() && e.status !== "expired");
  }, [entries]);

  // Filtered
  const filtered = entries.filter(e => {
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (searchText && !e.title.toLowerCase().includes(searchText.toLowerCase()) && !e.reference_number.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", category: "license", reference_number: "", issuing_authority: "", issue_date: "", expiry_date: "", renewal_date: "", status: "active", file_url: "", google_sheet_url: "", notes: "", reminder_days_before: 30, is_critical: false });
    setDialogOpen(true);
  };

  const openEdit = (entry: DBREntry) => {
    setEditingId(entry.id);
    setForm({ ...entry });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, ...form } : e));
      toast.success("Entry updated");
    } else {
      setEntries(prev => [{ id: uid(), ...form }, ...prev]);
      toast.success("Entry added to Business Register");
    }
    setDialogOpen(false);
  };

  const deleteEntry = (id: string) => { setEntries(prev => prev.filter(e => e.id !== id)); toast.success("Deleted"); };

  const getCategoryConfig = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[9];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700 text-[9px]">Active</Badge>;
      case "expired": return <Badge className="bg-red-100 text-red-700 text-[9px]">Expired</Badge>;
      case "renewal_due": return <Badge className="bg-amber-100 text-amber-700 text-[9px]">Renewal Due</Badge>;
      case "pending": return <Badge className="bg-blue-100 text-blue-700 text-[9px]">Pending</Badge>;
      case "cancelled": return <Badge className="bg-gray-100 text-gray-700 text-[9px]">Cancelled</Badge>;
      default: return <Badge variant="outline" className="text-[9px]">{status}</Badge>;
    }
  };

  const daysUntilExpiry = (date: string | null) => {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const compliancePct = entries.length > 0 ? Math.round((activeCount / entries.length) * 100) : 100;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Digital Business Register</h1>
            <p className="text-sm text-muted-foreground">Quick access to company documents and compliance status</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-1 h-4 w-4" /> Add DBR Entry
        </Button>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card><CardContent className="p-3 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" />
          <p className="text-xl font-bold text-green-700">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card className={renewalDueCount > 0 ? "border-amber-200" : ""}><CardContent className="p-3 text-center">
          <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
          <p className="text-xl font-bold text-amber-700">{renewalDueCount}</p>
          <p className="text-[10px] text-muted-foreground">Renewal Due</p>
        </CardContent></Card>
        <Card className={expiredCount > 0 ? "border-red-200" : ""}><CardContent className="p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-1" />
          <p className="text-xl font-bold text-red-700">{expiredCount}</p>
          <p className="text-[10px] text-muted-foreground">Expired</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Shield className="h-5 w-5 mx-auto text-blue-500 mb-1" />
          <p className="text-xl font-bold">{criticalCount}</p>
          <p className="text-[10px] text-muted-foreground">Critical Docs</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Compliance</p>
          <p className="text-xl font-bold text-teal-700">{compliancePct}%</p>
          <Progress value={compliancePct} className="h-1.5 mt-1" />
        </CardContent></Card>
      </div>

      {/* Expiry Alerts */}
      {expiringWithin30.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-amber-700 flex items-center gap-1 mb-2"><AlertTriangle className="h-4 w-4" /> Expiring Within 30 Days</p>
            <div className="space-y-1">
              {expiringWithin30.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <Shield className="h-3 w-3 text-amber-600" />
                  <span className="font-medium">{e.title}</span>
                  <span className="text-muted-foreground">({e.reference_number})</span>
                  <Badge className="ml-auto text-[9px] bg-amber-200 text-amber-800">{daysUntilExpiry(e.expiry_date)} days left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 max-w-[200px]">
          <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search title or ref#..." className="pl-7 h-8 text-xs" value={searchText} onChange={e => setSearchText(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="renewal_due">Renewal Due</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="h-8 px-2">{filtered.length} entries</Badge>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-amber-300 mb-3" />
            <p className="text-lg font-medium">No entries found</p>
            <p className="text-sm text-muted-foreground">Add your first business document to get started.</p>
          </CardContent></Card>
        ) : filtered.map(entry => {
          const catConfig = getCategoryConfig(entry.category);
          const CatIcon = catConfig.icon;
          const daysLeft = daysUntilExpiry(entry.expiry_date);
          return (
            <Card key={entry.id} className={`hover:shadow-sm transition-shadow ${entry.status === "expired" ? "border-red-200 opacity-70" : entry.status === "renewal_due" ? "border-amber-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg shrink-0 ${catConfig.color}`}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{entry.title}</h3>
                      {entry.is_critical && <Badge variant="destructive" className="text-[8px] h-4">Critical</Badge>}
                      {getStatusBadge(entry.status)}
                    </div>
                    {entry.description && <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>}
                    <div className="flex gap-3 mt-2 flex-wrap text-[10px] text-muted-foreground">
                      {entry.reference_number && <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{entry.reference_number}</span>}
                      {entry.issuing_authority && <span>By: {entry.issuing_authority}</span>}
                      {entry.issue_date && <span>Issued: {entry.issue_date}</span>}
                      {entry.expiry_date && (
                        <span className={daysLeft !== null && daysLeft <= 30 ? "text-red-600 font-bold" : ""}>
                          Expires: {entry.expiry_date} {daysLeft !== null && `(${daysLeft}d)`}
                        </span>
                      )}
                    </div>
                    {entry.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">{entry.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {entry.google_sheet_url && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="Open Sheet" onClick={() => window.open(entry.google_sheet_url, "_blank")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(entry)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => deleteEntry(entry.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-700">{editingId ? "Edit Entry" : "Add DBR Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., AYUSH Council Registration" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["active", "renewal_due", "expired", "pending", "cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reference Number</Label><Input value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} placeholder="License/Reg number" /></div>
              <div><Label>Issuing Authority</Label><Input value={form.issuing_authority} onChange={e => setForm(f => ({ ...f, issuing_authority: e.target.value }))} placeholder="Who issued it" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={form.issue_date || ""} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date || ""} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} /></div>
              <div><Label>Renewal Date</Label><Input type="date" value={form.renewal_date || ""} onChange={e => setForm(f => ({ ...f, renewal_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>File URL (document scan)</Label><Input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." /></div>
              <div><Label>Google Sheet URL</Label><Input value={form.google_sheet_url} onChange={e => setForm(f => ({ ...f, google_sheet_url: e.target.value }))} placeholder="https://docs.google.com/..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Remind Days Before Expiry</Label><Input type="number" value={form.reminder_days_before} onChange={e => setForm(f => ({ ...f, reminder_days_before: Number(e.target.value) }))} /></div>
              <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={form.is_critical} onCheckedChange={v => setForm(f => ({ ...f, is_critical: !!v }))} /><span className="text-xs">Mark as Critical Document</span></label></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional notes, renewal instructions..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">{editingId ? "Update" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessRegisterPage;
