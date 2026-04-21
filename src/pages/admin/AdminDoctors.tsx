import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Eye, FileCheck, IdCard, Camera, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  city: string;
  consultation_fee: number;
  is_approved: boolean;
  is_verified: boolean;
  verification_status: string;
  rejection_reason: string | null;
  rating: number;
  created_at: string;
}

const SLOTS: { key: "cert" | "id" | "selfie"; label: string; icon: typeof FileCheck }[] = [
  { key: "cert", label: "Certificate", icon: FileCheck },
  { key: "id", label: "ID proof", icon: IdCard },
  { key: "selfie", label: "Selfie", icon: Camera },
];

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<Doctor | null>(null);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});
  const [rejectFor, setRejectFor] = useState<Doctor | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("doctors")
      .select("id,full_name,specialization,city,consultation_fee,is_approved,is_verified,verification_status,rejection_reason,rating,created_at")
      .order("created_at", { ascending: false });
    setDoctors((data ?? []) as Doctor[]);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Admin · Doctors — Ayuzee";
    load();
  }, []);

  const openReview = async (doc: Doctor) => {
    setReviewing(doc);
    setDocUrls({});
    const exts = ["pdf", "jpg", "jpeg", "png", "webp"];
    const urls: Record<string, string> = {};
    for (const slot of SLOTS) {
      for (const ext of exts) {
        const path = `${doc.id}/${slot.key}.${ext}`;
        const { data } = await supabase.storage
          .from("doctor-documents")
          .createSignedUrl(path, 60 * 30);
        if (data?.signedUrl) {
          urls[slot.key] = data.signedUrl;
          break;
        }
      }
    }
    setDocUrls(urls);
  };

  const approveDoctor = async (id: string) => {
    const { error } = await supabase
      .from("doctors")
      .update({
        is_approved: true,
        is_verified: true,
        verification_status: "approved",
        rejection_reason: null,
        public_profile: true,
      })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Doctor approved & verified");
    setReviewing(null);
    load();
  };

  const rejectDoctor = async () => {
    if (!rejectFor) return;
    if (rejectReason.trim().length < 5) {
      toast.error("Please enter a clear reason (min 5 chars)");
      return;
    }
    const { error } = await supabase
      .from("doctors")
      .update({
        is_approved: false,
        is_verified: false,
        verification_status: "rejected",
        rejection_reason: rejectReason.trim(),
        public_profile: false,
      })
      .eq("id", rejectFor.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Doctor rejected");
    setRejectFor(null);
    setRejectReason("");
    setReviewing(null);
    load();
  };

  const StatusBadge = ({ d }: { d: Doctor }) => {
    if (d.verification_status === "approved" && d.is_verified)
      return <Badge className="bg-primary text-primary-foreground">Verified</Badge>;
    if (d.verification_status === "rejected")
      return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending review</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Doctors</h1>
        <p className="text-sm text-muted-foreground">
          {doctors.length} total · {doctors.filter((d) => d.verification_status === "pending").length} pending review
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>All doctors</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{d.specialization}</TableCell>
                    <TableCell>{d.city}</TableCell>
                    <TableCell className="text-right">₹{d.consultation_fee}</TableCell>
                    <TableCell><StatusBadge d={d} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openReview(d)}>
                          <Eye className="mr-1 h-4 w-4" /> Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {doctors.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No doctors yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review {reviewing?.full_name}</DialogTitle>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Specialization:</span> {reviewing.specialization}</div>
                <div><span className="text-muted-foreground">City:</span> {reviewing.city}</div>
                <div><span className="text-muted-foreground">Fee:</span> ₹{reviewing.consultation_fee}</div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge d={reviewing} /></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Submitted documents</p>
                <div className="grid gap-2">
                  {SLOTS.map(({ key, label, icon: Icon }) => {
                    const url = docUrls[key];
                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                            Preview <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not uploaded</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviewing.rejection_reason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-semibold text-destructive">Previous rejection</p>
                  <p className="mt-1">{reviewing.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setRejectFor(reviewing); setRejectReason(reviewing?.rejection_reason ?? ""); }}>
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button variant="hero" onClick={() => reviewing && approveDoctor(reviewing.id)}>
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectFor?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (will be shown to the doctor)</Label>
            <Textarea
              id="reason"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Certificate is not legible. Please re-upload a clearer scan."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={rejectDoctor}>Confirm reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;
