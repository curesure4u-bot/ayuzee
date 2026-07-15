import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Download, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import type { CommissionRule } from "@/types/commission";
import { CommissionRuleCard } from "@/components/admin/CommissionRuleCard";
import { CommissionRuleForm } from "@/components/admin/CommissionRuleForm";

const fromRow = (r: any): CommissionRule => ({
  ...r,
  applicable_to: r.applicable_to ?? { type: "all", values: [] },
  commission_breakdown: r.commission_breakdown ?? { kind: "fixed", fixed: { doctor: 0, platform: 0, logistics: 0 } },
  conditions: r.conditions ?? {},
});

const CommissionRules = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionRule | null>(null);
  const [pendingToggle, setPendingToggle] = useState<{ rule: CommissionRule; next: boolean } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CommissionRule | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(fromRow) as CommissionRule[];
    },
  });

  // Conflict detection: rules sharing same applicable scope key while active
  const conflictMap = useMemo(() => {
    const groups = new Map<string, number>();
    rules.filter((r) => r.is_active).forEach((r) => {
      const key = `${r.applicable_to.type}::${[...r.applicable_to.values].sort().join(",")}`;
      groups.set(key, (groups.get(key) ?? 0) + 1);
    });
    const m = new Map<string, number>();
    rules.forEach((r) => {
      const key = `${r.applicable_to.type}::${[...r.applicable_to.values].sort().join(",")}`;
      m.set(r.id, r.is_active ? groups.get(key) ?? 1 : 0);
    });
    return m;
  }, [rules]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q));
  }, [rules, search]);

  const upsert = useMutation({
    mutationFn: async (payload: Omit<CommissionRule, "id" | "created_at" | "updated_at" | "created_by"> & { id?: string }) => {
      const { id, ...rest } = payload as any;
      const { data: { user } } = await supabase.auth.getUser();
      const row = {
        ...rest,
        applicable_to: rest.applicable_to,
        commission_breakdown: rest.commission_breakdown,
        conditions: rest.conditions,
        created_by: user?.id ?? null,
      };
      if (id) {
        const { error } = await supabase.from("commission_rules").update(row).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("commission_rules").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success("Commission rule saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save rule"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase.from("commission_rules").update({ is_active: next }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: ["commission-rules"] });
      const prev = qc.getQueryData<CommissionRule[]>(["commission-rules"]);
      qc.setQueryData<CommissionRule[]>(["commission-rules"], (old) =>
        (old ?? []).map((r) => (r.id === id ? { ...r, is_active: next } : r)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["commission-rules"], ctx.prev);
      toast.error("Failed to update");
    },
    onSuccess: () => toast.success("Updated"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("commission_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success("Rule deleted");
    },
  });

  const handleToggle = (rule: CommissionRule, next: boolean) => {
    if (rule.is_active && !next) {
      setPendingToggle({ rule, next });
    } else {
      toggleActive.mutate({ id: rule.id, next });
    }
  };

  const handleDuplicate = (rule: CommissionRule) => {
    setEditing({ ...rule, id: "", name: `${rule.name} (Copy)`, is_active: false } as CommissionRule);
    setFormOpen(true);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commission-rules-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Expected an array");
      let inserted = 0;
      for (const r of parsed) {
        const { id, created_at, updated_at, created_by, ...rest } = r;
        const { error } = await supabase.from("commission_rules").insert(rest);
        if (!error) inserted++;
      }
      qc.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success(`Imported ${inserted} rule(s)`);
    } catch (e: any) {
      toast.error(e.message ?? "Import failed");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold">Commission Rules</h1>
          <p className="text-sm text-muted-foreground">Configure how commissions are split across doctors, platform, manufacturers and logistics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJSON}><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
          />
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> New Rule
          </Button>
        </div>
      </motion.div>

      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search rules..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading rules…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No commission rules yet. Create your first one.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <CommissionRuleCard
              key={r.id}
              rule={r}
              conflictCount={conflictMap.get(r.id) ?? 0}
              onToggle={handleToggle}
              onEdit={(rule) => { setEditing(rule); setFormOpen(true); }}
              onDuplicate={handleDuplicate}
              onDelete={(rule) => setPendingDelete(rule)}
            />
          ))}
        </div>
      )}

      <CommissionRuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={async (values) => {
          await upsert.mutateAsync({ ...values, id: editing?.id || undefined } as any);
        }}
      />

      <AlertDialog open={!!pendingToggle} onOpenChange={(o) => !o && setPendingToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingToggle?.rule.name}" will stop applying to new orders. You can reactivate it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingToggle) toggleActive.mutate({ id: pendingToggle.rule.id, next: pendingToggle.next });
                setPendingToggle(null);
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{pendingDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) del.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommissionRules;
