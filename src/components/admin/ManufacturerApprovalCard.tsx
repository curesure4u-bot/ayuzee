import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  type Manufacturer,
  type ManufacturerVerificationLog,
  type DocumentVerificationStatus,
  REQUIRED_DOCUMENTS,
  REJECTION_REASONS,
  type AdminNote,
} from "@/types/manufacturer";

interface Props {
  manufacturer: Manufacturer;
}

export const ManufacturerApprovalCard = ({ manufacturer: m }: Props) => {
  const qc = useQueryClient();
  const [docDialog, setDocDialog] = useState<{ url: string; label: string } | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReasons, setRejectReasons] = useState<string[]>([]);
  const [rejectComment, setRejectComment] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [issueDoc, setIssueDoc] = useState<{ type: string; label: string } | null>(null);
  const [issueComment, setIssueComment] = useState("");
  const [noteText, setNoteText] = useState("");

  const { data: logs = [] } = useQuery({
    queryKey: ["mfr-verif-logs", m.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manufacturer_verification_logs" as any)
        .select("*")
        .eq("manufacturer_id", m.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ManufacturerVerificationLog[];
    },
  });

  // Latest status per document
  const docStatus = useMemo(() => {
    const map: Record<string, DocumentVerificationStatus> = {};
    for (const log of logs) {
      if (!map[log.document_type]) map[log.document_type] = log.status;
    }
    return map;
  }, [logs]);

  const totalDocs = REQUIRED_DOCUMENTS.length;
  const verifiedCount = REQUIRED_DOCUMENTS.filter((d) => docStatus[d.type] === "verified").length;
  const allVerified = verifiedCount === totalDocs;
  const progress = Math.round((verifiedCount / totalDocs) * 100);

  const verifyDoc = useMutation({
    mutationFn: async (input: { type: string; status: DocumentVerificationStatus; comments?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("manufacturer_verification_logs" as any).insert({
        manufacturer_id: m.id,
        document_type: input.type,
        status: input.status,
        comments: input.comments ?? null,
        verified_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mfr-verif-logs", m.id] });
      toast.success("Document status updated");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update document"),
  });

  const approve = useMutation({
    mutationFn: async () => {
      if (!allVerified) throw new Error("All documents must be verified before approval");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("manufacturers" as any)
        .update({
          approval_status: "approved",
          approved_by: user?.id ?? null,
          approved_at: new Date().toISOString(),
        })
        .eq("id", m.id);
      if (error) throw error;
      // Best-effort welcome email
      if (m.contact_email) {
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              to: m.contact_email,
              subject: `Welcome to Ayuzee — ${m.company_name} approved`,
              html: `<p>Hello ${m.contact_person_name ?? m.company_name},</p><p>Your manufacturer account has been approved. You can now log in and upload products.</p>`,
            },
          });
        } catch {/* non-blocking */}
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manufacturer-approvals"] });
      qc.invalidateQueries({ queryKey: ["manufacturer-approval-counts"] });
      toast.success(`${m.company_name} approved`);
    },
    onError: (e: any) => toast.error(e.message ?? "Approval failed"),
  });

  const reject = useMutation({
    mutationFn: async () => {
      if (rejectReasons.length === 0) throw new Error("Select at least one reason");
      if (rejectComment.trim().length < 5) throw new Error("Provide a detailed comment");
      const { error } = await supabase
        .from("manufacturers" as any)
        .update({
          approval_status: "rejected",
          rejection_reasons: rejectReasons,
          rejection_comment: rejectComment.trim(),
        })
        .eq("id", m.id);
      if (error) throw error;
      if (m.contact_email) {
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              to: m.contact_email,
              subject: `Ayuzee — Application update for ${m.company_name}`,
              html: `<p>Your manufacturer application could not be approved.</p><p><strong>Reasons:</strong> ${rejectReasons.join(", ")}</p><p>${rejectComment}</p>`,
            },
          });
        } catch {/* non-blocking */}
      }
    },
    onSuccess: () => {
      setRejectOpen(false);
      setRejectReasons([]);
      setRejectComment("");
      qc.invalidateQueries({ queryKey: ["manufacturer-approvals"] });
      qc.invalidateQueries({ queryKey: ["manufacturer-approval-counts"] });
      toast.success("Manufacturer rejected");
    },
    onError: (e: any) => toast.error(e.message ?? "Rejection failed"),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const text = noteText.trim();
      if (!text) throw new Error("Note cannot be empty");
      const { data: { user } } = await supabase.auth.getUser();
      const newNote: AdminNote = {
        id: crypto.randomUUID(),
        author_id: user?.id ?? "unknown",
        text,
        created_at: new Date().toISOString(),
      };
      const next = [...(m.admin_notes ?? []), newNote];
      const { error } = await supabase
        .from("manufacturers" as any)
        .update({ admin_notes: next })
        .eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteText("");
      qc.invalidateQueries({ queryKey: ["manufacturer-approvals"] });
      toast.success("Note added");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to add note"),
  });

  const statusBadge = (s?: DocumentVerificationStatus) => {
    if (s === "verified") return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Verified</Badge>;
    if (s === "issue_found") return <Badge variant="destructive">Issue</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        {m.logo_url ? (
          <img src={m.logo_url} alt={m.company_name} className="h-14 w-14 rounded-md object-cover border" />
        ) : (
          <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">{m.company_name}</h3>
            <Badge variant="outline">{m.approval_status}</Badge>
            {m.state && <Badge variant="secondary">{m.state}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted {new Date(m.submitted_at).toLocaleDateString()}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Document verification</span>
              <span>{verifiedCount} / {totalDocs}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Accordion type="multiple" className="w-full">
          {/* Company Details */}
          <AccordionItem value="company">
            <AccordionTrigger>Company Details</AccordionTrigger>
            <AccordionContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Field label="Registration No." value={m.registration_number} />
                <Field label="GST Number" value={m.gst_number} />
                <Field label="Manufacturing License" value={m.manufacturing_license_no} />
                <Field
                  label="License Expiry"
                  value={m.manufacturing_license_expiry ? new Date(m.manufacturing_license_expiry).toLocaleDateString() : null}
                />
                <Field label="Drug License No." value={m.drug_license_no} />
                <Field label="FSSAI License" value={m.fssai_license_no} />
                <Field label="Address" value={m.address} className="sm:col-span-2" />
                <Field label="City" value={m.city} />
                <Field label="State / Pincode" value={[m.state, m.pincode].filter(Boolean).join(" / ") || null} />
              </dl>
            </AccordionContent>
          </AccordionItem>

          {/* Contact */}
          <AccordionItem value="contact">
            <AccordionTrigger>Contact Person</AccordionTrigger>
            <AccordionContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Field label="Name" value={m.contact_person_name} />
                <Field label="Email" value={m.contact_email} />
                <Field label="Phone" value={m.contact_phone} />
              </dl>
            </AccordionContent>
          </AccordionItem>

          {/* Bank */}
          <AccordionItem value="bank">
            <AccordionTrigger>Bank / Settlement Details</AccordionTrigger>
            <AccordionContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Field label="Account Holder" value={m.bank_account_holder} />
                <Field label="Bank Name" value={m.bank_name} />
                <Field label="Account Number" value={m.bank_account_number} />
                <Field label="IFSC" value={m.bank_ifsc} />
              </dl>
            </AccordionContent>
          </AccordionItem>

          {/* Documents Checklist */}
          <AccordionItem value="docs">
            <AccordionTrigger>Documents Checklist ({verifiedCount}/{totalDocs} verified)</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {REQUIRED_DOCUMENTS.map((doc) => {
                  const url = m[doc.urlField] as string | null;
                  const status = docStatus[doc.type];
                  return (
                    <li key={doc.type} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <button
                          type="button"
                          onClick={() => url && setDocDialog({ url, label: doc.label })}
                          disabled={!url}
                          className="text-sm font-medium hover:underline disabled:text-muted-foreground disabled:no-underline truncate text-left"
                        >
                          {doc.label} {!url && "(not uploaded)"}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {statusBadge(status)}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!url || verifyDoc.isPending}
                          onClick={() => verifyDoc.mutate({ type: doc.type, status: "verified" })}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!url || verifyDoc.isPending}
                          onClick={() => { setIssueDoc({ type: doc.type, label: doc.label }); setIssueComment(""); }}
                        >
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />Issue
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Verification log */}
          <AccordionItem value="logs">
            <AccordionTrigger>Verification History ({logs.length})</AccordionTrigger>
            <AccordionContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No verification activity yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {logs.map((log) => (
                    <li key={log.id} className="border rounded-md p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{log.document_type}</span>
                        {statusBadge(log.status)}
                      </div>
                      {log.comments && <p className="text-muted-foreground mt-1">{log.comments}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Admin Notes */}
          <AccordionItem value="notes">
            <AccordionTrigger>Internal Admin Notes ({m.admin_notes?.length ?? 0})</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {(m.admin_notes ?? []).map((n) => (
                  <div key={n.id} className="border rounded-md p-2 text-sm">
                    <p>{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an internal note (use @ to tag admins)"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <Button onClick={() => addNote.mutate()} disabled={addNote.isPending || !noteText.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Rejection summary if rejected */}
        {m.approval_status === "rejected" && (m.rejection_reasons?.length || m.rejection_comment) && (
          <div className="border border-destructive/40 bg-destructive/5 rounded-md p-3 text-sm">
            <p className="font-medium text-destructive">Rejected</p>
            {m.rejection_reasons?.length ? (
              <p className="mt-1">Reasons: {m.rejection_reasons.join(", ")}</p>
            ) : null}
            {m.rejection_comment && <p className="mt-1 text-muted-foreground">{m.rejection_comment}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            onClick={() => approve.mutate()}
            disabled={!allVerified || approve.isPending || m.approval_status === "approved"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {approve.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
            Approve Manufacturer
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={m.approval_status === "rejected"}
          >
            <XCircle className="h-4 w-4 mr-1" />Reject
          </Button>
          <Button variant="outline" onClick={() => setContactOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-1" />Contact
          </Button>
          {!allVerified && m.approval_status === "pending" && (
            <p className="text-xs text-muted-foreground self-center ml-auto">
              Verify all {totalDocs} documents before approving.
            </p>
          )}
        </div>
      </CardContent>

      {/* Document viewer */}
      <Dialog open={!!docDialog} onOpenChange={(o) => !o && setDocDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{docDialog?.label}</span>
              {docDialog && (
                <a href={docDialog.url} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {docDialog && (
            /\.(png|jpe?g|webp|gif)$/i.test(docDialog.url) ? (
              <img src={docDialog.url} alt={docDialog.label} className="max-h-[70vh] mx-auto" />
            ) : (
              <iframe src={docDialog.url} className="w-full h-[70vh] rounded-md border" title={docDialog.label} />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Issue dialog */}
      <Dialog open={!!issueDoc} onOpenChange={(o) => !o && setIssueDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report issue — {issueDoc?.label}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Describe the issue with this document"
            value={issueComment}
            onChange={(e) => setIssueComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDoc(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!issueDoc) return;
                verifyDoc.mutate(
                  { type: issueDoc.type, status: "issue_found", comments: issueComment.trim() || undefined },
                  { onSuccess: () => setIssueDoc(null) }
                );
              }}
            >
              Mark as Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {m.company_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select reasons:</p>
            <div className="space-y-2">
              {REJECTION_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={rejectReasons.includes(r)}
                    onCheckedChange={(c) =>
                      setRejectReasons((prev) => (c ? [...prev, r] : prev.filter((x) => x !== r)))
                    }
                  />
                  {r}
                </label>
              ))}
            </div>
            <Textarea
              placeholder="Detailed comment (required)"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => reject.mutate()} disabled={reject.isPending}>
              {reject.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {m.company_name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="email">
            <TabsList>
              <TabsTrigger value="email"><Mail className="h-4 w-4 mr-1" />Email</TabsTrigger>
              <TabsTrigger value="whatsapp"><Phone className="h-4 w-4 mr-1" />WhatsApp</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-2">
              <p className="text-sm text-muted-foreground">To: {m.contact_email ?? "—"}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Button size="sm" variant="outline" onClick={() => setContactMessage("Hello, we need clarification on a few details in your application. Could you please respond at the earliest?")}>Request clarification</Button>
                <Button size="sm" variant="outline" onClick={() => setContactMessage("Hi, we'd like to schedule a quick verification call. Please share your availability this week.")}>Schedule call</Button>
              </div>
              <Textarea rows={5} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Message" />
              <Button
                disabled={!m.contact_email || !contactMessage.trim()}
                onClick={() => {
                  const url = `mailto:${m.contact_email}?subject=${encodeURIComponent(`Ayuzee — ${m.company_name}`)}&body=${encodeURIComponent(contactMessage)}`;
                  window.open(url, "_blank");
                }}
              >
                Open in Email
              </Button>
            </TabsContent>
            <TabsContent value="whatsapp" className="space-y-2">
              <p className="text-sm text-muted-foreground">To: {m.contact_phone ?? "—"}</p>
              <Textarea rows={5} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Message" />
              <Button
                disabled={!m.contact_phone || !contactMessage.trim()}
                onClick={() => {
                  const phone = (m.contact_phone ?? "").replace(/[^0-9]/g, "");
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(contactMessage)}`, "_blank");
                }}
              >
                Open WhatsApp
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Field = ({ label, value, className }: { label: string; value: string | null | undefined; className?: string }) => (
  <div className={className}>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="font-medium">{value || "—"}</dd>
  </div>
);
