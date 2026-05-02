import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Stethoscope, HeartPulse, Building2, ShoppingBag,
  IndianRupee, Wallet, Coins, PackageCheck, Hourglass, LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const formatNum = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0);

type Tone = "emerald" | "amber" | "sky" | "violet";

type StatDef = {
  key: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  format: "number" | "currency";
  fetcher: () => Promise<number>;
};

// ---- safe fetch helpers (return 0 if table missing) ----
const safeCount = async (table: string, filter?: (q: any) => any): Promise<number> => {
  let q: any = (supabase as any).from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
};

const sumOrderItems = async (): Promise<number> => {
  // order_items has quantity + unit_price (no total_price column)
  const { data, error } = await (supabase as any)
    .from("order_items")
    .select("quantity, unit_price");
  if (error || !data) return 0;
  return data.reduce(
    (sum: number, r: any) => sum + Number(r.quantity || 0) * Number(r.unit_price || 0),
    0
  );
};

const sumCommissionByBeneficiary = async (
  beneficiary: "platform" | "doctor"
): Promise<number> => {
  // commission_transactions does not exist yet — degrade gracefully
  const { data, error } = await (supabase as any)
    .from("commission_transactions")
    .select("amount, beneficiary, beneficiary_type");
  if (error || !data) return 0;
  return data
    .filter((r: any) =>
      beneficiary === "platform"
        ? r.beneficiary === "platform"
        : r.beneficiary_type === "doctor"
    )
    .reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
};

const STATS: StatDef[] = [
  {
    key: "total-users", title: "Total Users", icon: Users, tone: "emerald", format: "number",
    fetcher: () => safeCount("profiles"),
  },
  {
    key: "total-doctors", title: "Total Doctors", icon: Stethoscope, tone: "emerald", format: "number",
    fetcher: () => safeCount("user_roles", (q) => q.eq("role", "doctor")),
  },
  {
    key: "total-patients", title: "Total Patients", icon: HeartPulse, tone: "emerald", format: "number",
    fetcher: () => safeCount("user_roles", (q) => q.eq("role", "patient")),
  },
  {
    key: "total-manufacturers", title: "Total Manufacturers", icon: Building2, tone: "emerald", format: "number",
    fetcher: () => safeCount("user_roles", (q) => q.eq("role", "provider")),
  },
  {
    key: "total-orders", title: "Total Orders", icon: ShoppingBag, tone: "sky", format: "number",
    fetcher: () => safeCount("orders"),
  },
  {
    key: "gmv", title: "Gross Merchandise Value", icon: IndianRupee, tone: "emerald", format: "currency",
    fetcher: sumOrderItems,
  },
  {
    key: "ayuzee-revenue", title: "Ayuzee Revenue", icon: Wallet, tone: "violet", format: "currency",
    fetcher: () => sumCommissionByBeneficiary("platform"),
  },
  {
    key: "doctor-commissions", title: "Doctor Commissions", icon: Coins, tone: "violet", format: "currency",
    fetcher: () => sumCommissionByBeneficiary("doctor"),
  },
  {
    key: "pending-products", title: "Pending Product Approvals", icon: PackageCheck, tone: "amber", format: "number",
    fetcher: () => safeCount("products", (q) => q.eq("approval_status", "pending")),
  },
  {
    key: "pending-payouts", title: "Pending Payouts", icon: Hourglass, tone: "amber", format: "number",
    fetcher: () => safeCount("payout_requests", (q) => q.eq("status", "pending")),
  },
];

const toneClasses: Record<Tone, { ring: string; icon: string; chip: string }> = {
  emerald: { ring: "ring-emerald-500/20", icon: "text-emerald-500 bg-emerald-500/10", chip: "text-emerald-600 dark:text-emerald-400" },
  amber:   { ring: "ring-amber-500/20",   icon: "text-amber-500 bg-amber-500/10",     chip: "text-amber-600 dark:text-amber-400" },
  sky:     { ring: "ring-sky-500/20",     icon: "text-sky-500 bg-sky-500/10",         chip: "text-sky-600 dark:text-sky-400" },
  violet:  { ring: "ring-violet-500/20",  icon: "text-violet-500 bg-violet-500/10",   chip: "text-violet-600 dark:text-violet-400" },
};

const StatCard = ({ stat, index }: { stat: StatDef; index: number }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stat", stat.key],
    queryFn: stat.fetcher,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const Icon = stat.icon;
  const tone = toneClasses[stat.tone];
  const value = stat.format === "currency" ? formatINR(Number(data ?? 0)) : formatNum(Number(data ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Card className={cn("ring-1 transition-shadow hover:shadow-md", tone.ring)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
          <span className={cn("grid h-9 w-9 place-items-center rounded-md", tone.icon)}>
            <Icon className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : isError ? (
            <p className="text-sm text-destructive">Failed to load</p>
          ) : (
            <div className="font-display text-2xl">{value}</div>
          )}
          <p className={cn("mt-1 text-xs", tone.chip)}>Live · refreshes every 30s</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const StatsCards = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
    {STATS.map((s, i) => <StatCard key={s.key} stat={s} index={i} />)}
  </div>
);

export default StatsCards;
