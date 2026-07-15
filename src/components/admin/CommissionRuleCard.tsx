import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Copy, Trash2, AlertTriangle } from "lucide-react";
import type { CommissionRule } from "@/types/commission";

interface Props {
  rule: CommissionRule;
  conflictCount?: number;
  onToggle: (rule: CommissionRule, next: boolean) => void;
  onEdit: (rule: CommissionRule) => void;
  onDuplicate: (rule: CommissionRule) => void;
  onDelete: (rule: CommissionRule) => void;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

export const CommissionRuleCard = ({ rule, conflictCount = 0, onToggle, onEdit, onDuplicate, onDelete }: Props) => {
  const sampleMrp = 1000;

  const breakdown = useMemo(() => {
    const b = rule.commission_breakdown;
    if (b.kind === "fixed") {
      const total = b.fixed.doctor + b.fixed.platform + b.fixed.logistics;
      const manufacturer = Math.max(sampleMrp - total, 0);
      return [
        { name: "Manufacturer", value: manufacturer },
        { name: "Doctor", value: b.fixed.doctor },
        { name: "Platform", value: b.fixed.platform },
        { name: "Logistics", value: b.fixed.logistics },
      ];
    }
    if (b.kind === "percentage") {
      return [
        { name: "Manufacturer", value: (sampleMrp * b.percentage.manufacturer) / 100 },
        { name: "Doctor", value: (sampleMrp * b.percentage.doctor) / 100 },
        { name: "Platform", value: (sampleMrp * b.percentage.platform) / 100 },
      ];
    }
    // tiered: pick first matching tier
    const tier = b.tiers.find((t) => sampleMrp >= t.min && (t.max === null || sampleMrp <= t.max));
    const commission = tier ? (sampleMrp * tier.percent) / 100 : 0;
    return [
      { name: "Manufacturer", value: sampleMrp - commission },
      { name: "Commission", value: commission },
    ];
  }, [rule]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card className={rule.is_active ? "" : "opacity-60"}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{rule.name}</CardTitle>
              <Badge variant="outline" className="capitalize">{rule.rule_type}</Badge>
              <Badge variant="secondary">Priority {rule.priority}</Badge>
              <Badge variant="outline" className="capitalize">{rule.applicable_to.type}</Badge>
              {conflictCount > 1 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Conflict ({conflictCount})
                </Badge>
              )}
            </div>
            {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
            <p className="text-xs text-muted-foreground">
              Valid {rule.valid_from}{rule.valid_until ? ` → ${rule.valid_until}` : " (no end)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={rule.is_active} onCheckedChange={(v) => onToggle(rule, v)} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {breakdown.map((b) => (
                <div key={b.name} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                  <span className="text-muted-foreground">{b.name}</span>
                  <span className="font-mono font-medium">₹{Math.round(b.value)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Preview based on sample MRP ₹{sampleMrp}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(rule)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDuplicate(rule)}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(rule)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={36} outerRadius={64} paddingAngle={2}>
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${Math.round(v)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
