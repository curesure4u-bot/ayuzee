import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Clock, CheckCircle2, XCircle, Building2, CalendarClock } from "lucide-react";
import { ManufacturerApprovalCard } from "@/components/admin/ManufacturerApprovalCard";
import {
  useBulkApproveManufacturers,
  useManufacturerCounts,
  useManufacturers,
  useScheduleCall,
} from "@/hooks/useManufacturerApprovals";
import type { Manufacturer, ManufacturerApprovalStatus } from "@/types/manufacturer";

const TABS: { value: ManufacturerApprovalStatus; label: string; icon: string }[] = [
  { value: "pending", label: "Pending", icon: "📋" },
  { value: "approved", label: "Approved", icon: "✅" },
  { value: "rejected", label: "Rejected", icon: "❌" },
];

const ManufacturerApprovals = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<ManufacturerApprovalStatus>("pending");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<Manufacturer | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");

  useEffect(() => {
    document.title = "Admin · Manufacturer Approvals — Ayuzee";
  }, []);

  useEffect(() => setSelected(new Set()), [tab]);

  // Realtime sync
  useEffect(() => {
    const channel = supabase
      .channel("manufacturer-approvals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manufacturers" },
        () => {
          qc.invalidateQueries({ queryKey: ["manufacturer-approvals"] });
          qc.invalidateQueries({ queryKey: ["manufacturer-approval-counts"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manufacturer_verification_logs" },
        () => qc.invalidateQueries({ queryKey: ["mfr-verif-logs"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const { data: counts } = useManufacturerCounts();
  const { data: list, isLoading } = useManufacturers(tab, sort);
  const bulkApprove = useBulkApproveManufacturers();
  const scheduleCall = useScheduleCall();

  const states = useMemo(() => {
    const s = new Set<string>();
    (list ?? []).forEach((m) => m.state && s.add(m.state));
    return Array.from(s).sort();
  }, [list]);

  const filtered = useMemo(() => {
    let arr = list ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (m) =>
          m.company_name.toLowerCase().includes(q) ||
          (m.contact_person_name ?? "").toLowerCase().includes(q),
      );
    }
    if (stateFilter !== "all") arr = arr.filter((m) => m.state === stateFilter);
    return arr;
  }, [list, search, stateFilter]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((m) => m.id)));
  };

  const exportCsv = () => {
    const rows = filtered.filter((m) => selected.has(m.id));
    if (rows.length === 0) return;
    const headers = [
      "company_name",
      "contact_person_name",
      "contact_email",
      "contact_phone",
      "state",
      "city",
      "approval_status",
      "submitted_at",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manufacturers-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitSchedule = () => {
    if (!scheduleFor || !scheduleAt) return;
    scheduleCall.mutate(
      { manufacturer: scheduleFor, datetime: scheduleAt, notes: scheduleNotes },
      {
        onSuccess: () => {
          setScheduleFor(null);
          setScheduleAt("");
          setScheduleNotes("");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Manufacturer Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and verify manufacturer registration applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="Pending review"
          value={counts?.pending ?? 0}
          tone="text-amber-600 bg-amber-500/10"
          pulse={(counts?.pending ?? 0) > 0}
        />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Approved this month"
          value={counts?.approvedThisMonth ?? 0}
          tone="text-emerald-600 bg-emerald-500/10"
        />
        <StatTile
          icon={<XCircle className="h-4 w-4" />}
          label="Rejected this month"
          value={counts?.rejectedThisMonth ?? 0}
          tone="text-red-600 bg-red-500/10"
        />
        <StatTile
          icon={<Building2 className="h-4 w-4" />}
          label="Active manufacturers"
          value={counts?.approved ?? 0}
          tone="text-sky-600 bg-sky-500/10"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ManufacturerApprovalStatus)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-2">
              <span>{t.icon}</span>
              {t.label}
              <Badge variant="secondary" className="px-1.5">
                {counts?.[t.value] ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4 space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-base">
                  {filtered.length} manufacturer{filtered.length === 1 ? "" : "s"}
                  {selected.size > 0 ? ` · ${selected.size} selected` : ""}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search company or contact…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56"
                  />
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All states</SelectItem>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                  {tab === "pending" && filtered.length > 0 && (
                    <Button size="sm" variant="outline" onClick={toggleSelectAll}>
                      {selected.size === filtered.length ? "Clear" : "Select all"}
                    </Button>
                  )}
                  {selected.size > 0 && (
                    <>
                      <Button size="sm" variant="outline" onClick={exportCsv}>
                        Export CSV
                      </Button>
                      {tab === "pending" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={bulkApprove.isPending}
                          onClick={() => setBulkConfirm(true)}
                        >
                          {bulkApprove.isPending && (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          )}
                          Approve selected ({selected.size})
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">
                    No manufacturers in “{t.label}”.
                  </p>
                ) : (
                  filtered.map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      {tab === "pending" && (
                        <Checkbox
                          className="mt-6"
                          checked={selected.has(m.id)}
                          onCheckedChange={() => toggleSelect(m.id)}
                          aria-label={`Select ${m.company_name}`}
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <ManufacturerApprovalCard manufacturer={m} />
                        {tab === "pending" && (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setScheduleFor(m)}
                            >
                              <CalendarClock className="mr-1 h-3.5 w-3.5" />
                              Schedule call
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Bulk approve confirm */}
      <AlertDialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {selected.size} manufacturer(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Selected manufacturers will be activated and notified by email. Make sure their
              documents have been verified before bulk-approving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                bulkApprove.mutate(Array.from(selected), {
                  onSuccess: () => {
                    setSelected(new Set());
                    setBulkConfirm(false);
                  },
                });
              }}
            >
              Approve all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule call dialog */}
      <Dialog open={!!scheduleFor} onOpenChange={(o) => !o && setScheduleFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule verification call — {scheduleFor?.company_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="schedule-at" className="text-xs text-muted-foreground">
                Date & time
              </Label>
              <Input
                id="schedule-at"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="schedule-notes" className="text-xs text-muted-foreground">
                Points to discuss
              </Label>
              <Textarea
                id="schedule-notes"
                rows={4}
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                placeholder="e.g. confirm GMP certificate authenticity, walk through bank details…"
              />
            </div>
            {!scheduleFor?.contact_email && (
              <p className="text-xs text-amber-600">
                Manufacturer has no contact email — invite cannot be sent.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleFor(null)}>
              Cancel
            </Button>
            <Button
              disabled={!scheduleAt || !scheduleFor?.contact_email || scheduleCall.isPending}
              onClick={submitSchedule}
            >
              {scheduleCall.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatTile = ({
  icon,
  label,
  value,
  tone,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: string;
  pulse?: boolean;
}) => (
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div className={`rounded-md p-2 ${tone} ${pulse ? "animate-pulse" : ""}`}>{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-xl">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default ManufacturerApprovals;
