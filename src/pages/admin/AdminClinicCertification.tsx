import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Search, CheckCircle2, XCircle, MapPin, Calendar, Eye, Award } from "lucide-react";

interface Certification {
  id: string;
  clinic_name: string;
  owner_id: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  systems_practiced: string[];
  staff_count: number;
  doctor_count: number;
  has_pharmacy: boolean;
  has_panchakarma: boolean;
  has_lab: boolean;
  tier: string;
  certification_status: string;
  inspection_score: number | null;
  rejection_reason: string | null;
  applied_at: string;
}

const TIERS = ["bronze", "silver", "gold", "platinum"];

const AdminClinicCertification = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("applied");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState({ tier: "silver", inspection_score: "70", rejection_reason: "" });

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    setLoading(true);
    let query = supabase.from("clinic_certifications").select("*").order("applied_at", { ascending: false });
    if (filter !== "all") query = query.eq("certification_status", filter);
    const { data } = await query.limit(100);
    if (data) setCertifications(data as Certification[]);
    setLoading(false);
  };

  const handleCertify = async (id: string) => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const { error } = await supabase.from("clinic_certifications").update({
      certification_status: "certified",
      tier: actionForm.tier,
      inspection_score: parseInt(actionForm.inspection_score) || null,
      certified_at: new Date().toISOString(),
      certificate_expiry: expiryDate.toISOString().split("T")[0],
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Clinic certified!"); setSelectedId(null); loadData(); }
  };

  const handleReject = async (id: string) => {
    if (!actionForm.rejection_reason) { toast.error("Reason required"); return; }
    const { error } = await supabase.from("clinic_certifications").update({
      certification_status: "rejected",
      rejection_reason: actionForm.rejection_reason,
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Application rejected"); setSelectedId(null); loadData(); }
  };

  const handleScheduleInspection = async (id: string) => {
    const { error } = await supabase.from("clinic_certifications").update({
      certification_status: "inspection_scheduled",
      inspection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Inspection scheduled"); loadData(); }
  };

  const filtered = certifications.filter((c) =>
    !search || c.clinic_name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
  );
  const selected = certifications.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Clinic Certification</h1>
        <p className="text-muted-foreground">Manage clinic certification applications, inspections, and renewals.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search clinics..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="inspection_scheduled">Inspection Scheduled</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center"><p className="text-muted-foreground">No clinics in this category.</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((cert) => (
            <Card key={cert.id} className="cursor-pointer hover:shadow-sm transition" onClick={() => setSelectedId(cert.id)}>
              <CardContent className="flex items-center gap-4 p-4">
                <Building2 className="h-8 w-8 text-primary/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{cert.clinic_name}</h3>
                    <Badge className={cert.certification_status === "certified" ? "bg-green-100 text-green-700" : cert.certification_status === "applied" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                      {cert.certification_status}
                    </Badge>
                    {cert.certification_status === "certified" && <Badge variant="outline" className="text-[10px] capitalize">{cert.tier}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {cert.city}, {cert.state} · {cert.doctor_count} doctors · {cert.systems_practiced.join(", ")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(cert.applied_at).toLocaleDateString("en-IN")}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Clinic Certification Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <dl className="grid gap-2 grid-cols-2 text-sm">
                <div><dt className="text-xs text-muted-foreground">Clinic</dt><dd className="font-medium">{selected.clinic_name}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Location</dt><dd>{selected.city}, {selected.state}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Address</dt><dd className="col-span-2">{selected.address}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Doctors</dt><dd>{selected.doctor_count}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Staff</dt><dd>{selected.staff_count}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Systems</dt><dd>{selected.systems_practiced.join(", ")}</dd></div>
                <div>
                  <dt className="text-xs text-muted-foreground">Facilities</dt>
                  <dd className="flex gap-1 flex-wrap">
                    {selected.has_pharmacy && <Badge variant="outline" className="text-[10px]">Pharmacy</Badge>}
                    {selected.has_panchakarma && <Badge variant="outline" className="text-[10px]">Panchakarma</Badge>}
                    {selected.has_lab && <Badge variant="outline" className="text-[10px]">Lab</Badge>}
                  </dd>
                </div>
              </dl>

              {selected.certification_status === "applied" && (
                <div className="space-y-3 border-t pt-4">
                  <Button variant="outline" className="w-full" onClick={() => handleScheduleInspection(selected.id)}>
                    <Calendar className="mr-1 h-4 w-4" /> Schedule Inspection
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Tier</label>
                      <Select value={actionForm.tier} onValueChange={(v) => setActionForm({ ...actionForm, tier: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TIERS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Score (0-100)</label>
                      <Input type="number" min="0" max="100" value={actionForm.inspection_score} onChange={(e) => setActionForm({ ...actionForm, inspection_score: e.target.value })} />
                    </div>
                  </div>
                  <Textarea value={actionForm.rejection_reason} onChange={(e) => setActionForm({ ...actionForm, rejection_reason: e.target.value })} placeholder="Rejection reason (if rejecting)..." rows={2} />
                  <div className="flex gap-2">
                    <Button onClick={() => handleCertify(selected.id)} className="flex-1"><Award className="mr-1 h-4 w-4" /> Certify</Button>
                    <Button variant="destructive" onClick={() => handleReject(selected.id)} className="flex-1"><XCircle className="mr-1 h-4 w-4" /> Reject</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClinicCertification;
