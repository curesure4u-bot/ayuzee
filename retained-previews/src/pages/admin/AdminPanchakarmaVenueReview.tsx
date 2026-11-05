import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  CheckCircle2,
  History,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  XCircle,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const sb = supabase as any;

type Venue = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  license_number: string | null;
  license_expiry: string | null;
  registration_status: "pending" | "approved" | "suspended" | "rejected";
  owner_admin_id: string | null;
  offered_therapy_type_ids: string[] | null;
  is_active: boolean;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type Filter = "pending" | "approved" | "suspended" | "rejected" | "all";

const statusVariant: Record<Venue["registration_status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  suspended: "destructive",
  rejected: "destructive",
};

export default function AdminPanchakarmaVenueReview() {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    setUid(auth.user?.id ?? null);

    let q = sb.from("panchakarma_venues").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("registration_status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    const rows = (data ?? []) as Venue[];
    setVenues(rows);
    setNotes(Object.fromEntries(rows.map((r) => [r.id, r.reviewer_notes ?? ""])));
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (v: Venue, next: Venue["registration_status"]) => {
    if (!uid) return;
    const note = notes[v.id]?.trim() ?? "";
    if ((next === "rejected" || next === "suspended") && note.length < 10) {
      toast.error("Please add reviewer notes (min 10 characters) before " + next + ".");
      return;
    }
    setBusy(v.id);
    const patch: any = {
      registration_status: next,
      reviewer_notes: note || null,
      reviewed_by: uid,
      reviewed_at: new Date().toISOString(),
    };
    // If suspended or rejected, force inactive
    if (next === "suspended" || next === "rejected") patch.is_active = false;
    const { error } = await sb.from("panchakarma_venues").update(patch).eq("id", v.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(`Venue ${next}`);
    load();
  };

  const daysToExpiry = (d: string | null) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Panchakarma Venue Review
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve, suspend, or reject registered Panchakarma centers. Reviewer notes are recorded for the venue owner.
        </p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : venues.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-3" />
                No venues in "{filter}".
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {venues.map((v) => {
                const dte = daysToExpiry(v.license_expiry);
                const licenseExpired = dte !== null && dte < 0;
                const isPending = v.registration_status === "pending";
                return (
                  <Card key={v.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <CardTitle className="text-base">{v.name}</CardTitle>
                          <CardDescription>
                            {[v.address, v.city].filter(Boolean).join(", ") || "No address"} · Submitted{" "}
                            {new Date(v.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusVariant[v.registration_status]}>{v.registration_status}</Badge>
                          <Badge variant={v.is_active ? "default" : "outline"}>
                            {v.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {licenseExpired && <Badge variant="destructive">License expired</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3 text-sm">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">License #</div>
                          <div>{v.license_number || "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Expiry</div>
                          <div className={licenseExpired ? "text-destructive" : ""}>
                            {v.license_expiry ?? "—"}
                            {dte !== null && (
                              <span className="ml-1 text-xs">
                                ({licenseExpired ? `${Math.abs(dte)}d ago` : `${dte}d left`})
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Therapies</div>
                          <div>{v.offered_therapy_type_ids?.length ?? 0} configured</div>
                        </div>
                      </div>

                      {v.reviewed_at && !isPending && (
                        <p className="text-xs text-muted-foreground">
                          Last reviewed {new Date(v.reviewed_at).toLocaleString()}
                        </p>
                      )}

                      <VenueStatusHistory venueId={v.id} />

                      <Separator />
                      <div>
                        <label className="text-sm font-medium mb-1 block">Reviewer notes</label>
                        <Textarea
                          rows={3}
                          value={notes[v.id] ?? ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [v.id]: e.target.value }))}
                          placeholder="Findings, requested corrections, or reason for rejection/suspension."
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => review(v, "rejected")}
                          disabled={busy === v.id || v.registration_status === "rejected"}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => review(v, "suspended")}
                          disabled={busy === v.id || v.registration_status === "suspended"}
                        >
                          <ShieldAlert className="h-4 w-4 mr-2" /> Suspend
                        </Button>
                        <Button
                          onClick={() => review(v, "approved")}
                          disabled={busy === v.id || v.registration_status === "approved"}
                        >
                          {busy === v.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

type HistoryRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  reviewer_notes: string | null;
  is_active_before: boolean | null;
  is_active_after: boolean | null;
  created_at: string;
};

function VenueStatusHistory({ venueId }: { venueId: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("panchakarma_venue_status_history")
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as HistoryRow[]);
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && rows === null) load();
      }}
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
          <History className="h-3.5 w-3.5 mr-1.5" />
          {open ? "Hide" : "View"} status history
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        {loading ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading history…
          </div>
        ) : !rows || rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No history entries yet.</p>
        ) : (
          <ol className="border-l border-border ml-2 space-y-3 pl-4">
            {rows.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <div className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </div>
                <div className="text-sm">
                  <Badge variant="outline" className="mr-1">
                    {h.from_status ?? "created"}
                  </Badge>
                  →
                  <Badge variant="secondary" className="ml-1">
                    {h.to_status}
                  </Badge>
                  {h.is_active_after !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({h.is_active_after ? "active" : "inactive"})
                    </span>
                  )}
                </div>
                {h.reviewer_notes && (
                  <p className="text-xs mt-1 italic text-muted-foreground">
                    "{h.reviewer_notes}"
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
