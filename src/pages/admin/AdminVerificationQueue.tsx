import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BadgeCheck, Shield, Clock, XCircle, Search, CheckCircle2, Eye } from "lucide-react";

interface Verification {
  id: string;
  doctor_id: string;
  full_name: string;
  registration_number: string;
  registration_council: string;
  council_state: string | null;
  degree: string;
  university: string | null;
  year_of_passing: number | null;
  system_of_medicine: string;
  status: string;
  badge_level: string;
  rejection_reason: string | null;
  created_at: string;
}

const AdminVerificationQueue = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState({ badge_level: "verified", rejection_reason: "" });

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    setLoading(true);
    let query = supabase.from("doctor_verifications").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    if (data) setVerifications(data as Verification[]);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("doctor_verifications").update({
      status: "verified",
      badge_level: actionForm.badge_level,
      verified_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Doctor verified!"); setSelectedId(null); loadData(); }
  };

  const handleReject = async (id: string) => {
    if (!actionForm.rejection_reason) { toast.error("Please provide a rejection reason"); return; }
    const { error } = await supabase.from("doctor_verifications").update({
      status: "rejected",
      rejection_reason: actionForm.rejection_reason,
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Verification rejected"); setSelectedId(null); loadData(); }
  };

  const filtered = verifications.filter((v) =>
    !search || v.full_name.toLowerCase().includes(search.toLowerCase()) || v.registration_number.toLowerCase().includes(search.toLowerCase())
  );

  const selected = verifications.find((v) => v.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Doctor Verification Queue</h1>
        <p className="text-muted-foreground">Review and approve doctor credential verifications.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or reg number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 mb-4">
        <Card className="text-center"><CardContent className="pt-5 pb-4"><p className="text-2xl font-bold text-amber-600">{verifications.filter((v) => v.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="text-center"><CardContent className="pt-5 pb-4"><p className="text-2xl font-bold text-green-600">{verifications.filter((v) => v.status === "verified").length}</p><p className="text-xs text-muted-foreground">Verified</p></CardContent></Card>
        <Card className="text-center"><CardContent className="pt-5 pb-4"><p className="text-2xl font-bold text-red-600">{verifications.filter((v) => v.status === "rejected").length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        <Card className="text-center"><CardContent className="pt-5 pb-4"><p className="text-2xl font-bold">{verifications.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center"><p className="text-muted-foreground">No verifications found.</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <Card key={v.id} className="cursor-pointer hover:shadow-sm transition" onClick={() => setSelectedId(v.id)}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{v.full_name}</h3>
                    <Badge variant="outline" className="text-[10px]">{v.system_of_medicine}</Badge>
                    <Badge className={v.status === "pending" ? "bg-amber-100 text-amber-700" : v.status === "verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {v.registration_number} · {v.registration_council} · {v.degree}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString("en-IN")}</span>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Verification Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <dl className="grid gap-2 grid-cols-2 text-sm">
                <div><dt className="text-xs text-muted-foreground">Name</dt><dd className="font-medium">{selected.full_name}</dd></div>
                <div><dt className="text-xs text-muted-foreground">System</dt><dd>{selected.system_of_medicine}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Reg. Number</dt><dd>{selected.registration_number}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Council</dt><dd>{selected.registration_council}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Degree</dt><dd>{selected.degree}</dd></div>
                <div><dt className="text-xs text-muted-foreground">University</dt><dd>{selected.university ?? "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Year</dt><dd>{selected.year_of_passing ?? "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">State</dt><dd>{selected.council_state ?? "—"}</dd></div>
              </dl>

              {selected.status === "pending" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Badge Level</label>
                    <Select value={actionForm.badge_level} onValueChange={(v) => setActionForm({ ...actionForm, badge_level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                    <Textarea value={actionForm.rejection_reason} onChange={(e) => setActionForm({ ...actionForm, rejection_reason: e.target.value })} placeholder="Reason for rejection..." rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(selected.id)} className="flex-1"><CheckCircle2 className="mr-1 h-4 w-4" /> Approve</Button>
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

export default AdminVerificationQueue;
