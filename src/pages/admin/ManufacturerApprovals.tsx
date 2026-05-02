import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ManufacturerApprovalCard } from "@/components/admin/ManufacturerApprovalCard";
import type { Manufacturer, ManufacturerApprovalStatus } from "@/types/manufacturer";

const TABS: { value: ManufacturerApprovalStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const ManufacturerApprovals = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<ManufacturerApprovalStatus>("pending");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    document.title = "Admin · Manufacturer Approvals — Ayuzee";
  }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("manufacturer-approvals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manufacturers" },
        () => {
          qc.invalidateQueries({ queryKey: ["manufacturer-approvals"] });
          qc.invalidateQueries({ queryKey: ["manufacturer-approval-counts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manufacturer_verification_logs" },
        () => qc.invalidateQueries({ queryKey: ["mfr-verif-logs"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const { data: counts } = useQuery({
    queryKey: ["manufacturer-approval-counts"],
    queryFn: async () => {
      const result: Record<ManufacturerApprovalStatus, number> = { pending: 0, approved: 0, rejected: 0 };
      for (const t of TABS) {
        const { count } = await supabase
          .from("manufacturers" as any)
          .select("*", { count: "exact", head: true })
          .eq("approval_status", t.value);
        result[t.value] = count ?? 0;
      }
      return result;
    },
    refetchInterval: 30000,
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ["manufacturer-approvals", tab, sort],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manufacturers" as any)
        .select("*")
        .eq("approval_status", tab)
        .order("submitted_at", { ascending: sort === "oldest" });
      if (error) throw error;
      return (data ?? []) as unknown as Manufacturer[];
    },
  });

  const states = useMemo(() => {
    const s = new Set<string>();
    (list ?? []).forEach((m) => m.state && s.add(m.state));
    return Array.from(s).sort();
  }, [list]);

  const filtered = useMemo(() => {
    let arr = list ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((m) => m.company_name.toLowerCase().includes(q));
    }
    if (state !== "all") {
      arr = arr.filter((m) => m.state === state);
    }
    return arr;
  }, [list, search, state]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manufacturer Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and verify manufacturer onboarding applications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search by company name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={state} onValueChange={setState}>
            <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ManufacturerApprovalStatus)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-2">
              {t.label}
              <Badge variant="secondary">{counts?.[t.value] ?? 0}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No manufacturers in “{t.label}”.
                </CardContent>
              </Card>
            ) : (
              filtered.map((m) => <ManufacturerApprovalCard key={m.id} manufacturer={m} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ManufacturerApprovals;
