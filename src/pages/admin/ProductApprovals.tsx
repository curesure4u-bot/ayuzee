import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Loader2, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useApprovalCounts,
  useBulkApprove,
  useProductApprovals,
  type ApprovalStatus,
  type ProductApproval,
} from "@/hooks/useProductApprovals";
import { ProductApprovalCard } from "@/components/admin/ProductApprovalCard";

const tabs: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "info_requested", label: "Info Requested" },
];

const ProductApprovals = () => {
  const [tab, setTab] = useState<ApprovalStatus>("pending");
  const [manufacturer, setManufacturer] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);

  useEffect(() => {
    document.title = "Admin · Product Approvals — Ayuzee";
  }, []);

  useEffect(() => {
    setSelected(new Set());
  }, [tab]);

  const counts = useApprovalCounts();
  const list = useProductApprovals(tab);
  const bulkApprove = useBulkApprove();

  const filtered = useMemo(() => {
    let rows = list.data ?? [];
    if (manufacturer !== "all") {
      rows = rows.filter((r) => (r.manufacturer_name || r.brand) === manufacturer);
    }
    if (category !== "all") rows = rows.filter((r) => r.category === category);
    rows = rows.filter((r) => {
      const p = Number(r.discount_price ?? r.price ?? 0);
      return p >= priceRange[0] && p <= priceRange[1];
    });
    if (fromDate) {
      const f = new Date(fromDate).getTime();
      rows = rows.filter((r) => new Date(r.submitted_at || r.created_at).getTime() >= f);
    }
    if (toDate) {
      const t = new Date(toDate).getTime() + 24 * 60 * 60 * 1000;
      rows = rows.filter((r) => new Date(r.submitted_at || r.created_at).getTime() <= t);
    }
    rows = [...rows].sort((a, b) => {
      const ad = new Date(a.submitted_at || a.created_at).getTime();
      const bd = new Date(b.submitted_at || b.created_at).getTime();
      return sort === "newest" ? bd - ad : ad - bd;
    });
    return rows;
  }, [list.data, manufacturer, category, sort, priceRange, fromDate, toDate]);

  const stats = useMemo(() => {
    const rows = list.data ?? [];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonth = rows.filter(
      (r) => new Date(r.submitted_at || r.created_at).getTime() >= startOfMonth.getTime(),
    ).length;
    const approvedRows = rows.filter((r) => r.approval_status === "approved" && r.approved_at);
    const avgHours =
      approvedRows.length === 0
        ? null
        : Math.round(
            approvedRows.reduce((sum, r) => {
              const submitted = new Date(r.submitted_at || r.created_at).getTime();
              const approved = new Date(r.approved_at!).getTime();
              return sum + Math.max(0, (approved - submitted) / 36e5);
            }, 0) / approvedRows.length,
          );
    return { thisMonth, avgHours };
  }, [list.data]);

  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    (list.data ?? []).forEach((r) => set.add(r.manufacturer_name || r.brand));
    return Array.from(set).sort();
  }, [list.data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (list.data ?? []).forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [list.data]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectedProducts: ProductApproval[] = filtered.filter((p) => selected.has(p.id));

  const performBulk = () => {
    bulkApprove.mutate(selectedProducts, {
      onSuccess: () => {
        setSelected(new Set());
        setConfirmBulk(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Product Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review submitted products, verify documents, and approve, reject, or request more information.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ApprovalStatus)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-2">
              {t.label}
              <Badge variant="secondary" className="px-1.5">
                {counts.data?.[t.value] ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-base">
                  {filtered.length} product{filtered.length === 1 ? "" : "s"}
                  {selected.size > 0 ? ` · ${selected.size} selected` : ""}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={manufacturer} onValueChange={setManufacturer}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All manufacturers</SelectItem>
                      {manufacturers.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                  {tab === "pending" && selected.size > 0 && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={bulkApprove.isPending}
                      onClick={() => setConfirmBulk(true)}
                    >
                      {bulkApprove.isPending && (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      )}
                      Approve selected ({selected.size})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {list.isLoading && (
                  <p className="py-10 text-center text-muted-foreground">Loading…</p>
                )}
                {!list.isLoading && filtered.length === 0 && (
                  <p className="py-10 text-center text-muted-foreground">
                    No {t.label.toLowerCase()} products.
                  </p>
                )}
                <div className="grid gap-4">
                  {filtered.map((p) => (
                    <ProductApprovalCard
                      key={p.id}
                      product={p}
                      selected={selected.has(p.id)}
                      onToggleSelect={tab === "pending" ? toggleSelect : undefined}
                      showActions={tab !== "approved"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={confirmBulk} onOpenChange={setConfirmBulk}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {selected.size} product(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              All selected products will become visible to doctors and patients. Manufacturers will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performBulk}>Approve all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductApprovals;
