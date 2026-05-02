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

type Tone = "emerald" | "amber" | "sky" | "violet" | "blue" | "pink" | "purple" | "green" | "cyan" | "orange" | "red";

type StatDef = {
  key: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  format: "number" | "currency";
  fetcher: () => Promise<number>;
  href?: string;
  pulseWhen?: (n: number) => boolean;
};

// ---- safe fetch helpers (return 0 if table missing) ----
const safeCount = async (table: string, filter?: (q: any) => any): Promise<number> => {
  let q: any = (supabase as any).from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
};

const sumOrders = async (filter?: (q: any) => any): Promise<number> => {
  let q: any = (supabase as any).from("orders").select("total, order_status, payment_status");
  if (filter) q = filter(q);
  const { data, error } = await q;
  if (error || !data) return 0;
  return data.reduce((sum: number, r: any) => sum + Number(r.total || 0), 0);
};

const sumWalletBySource = async (source: string): Promise<number> => {
  const { data, error } = await (supabase as any)
    .from("ayuzee_wallet_transactions")
    .select("amount, type, source")
    .eq("type", "credit")
    .eq("source", source);
  if (error || !data) return 0;
  return data.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
};

const STATS: StatDef[] = [
  {
    key: "total-users", title: "Total Users", icon: Users, tone: "emerald", format: "number",
    fetcher: () => safeCount("profiles"),
  },
  {
    key: "total-doctors", title: "Total Doctors", icon: Stethoscope, tone: "blue", format: "number",
    fetcher: () => safeCount("user_roles", (q) => q.eq("role", "doctor")),
  },
  {
    key: "total-patients", title: "Total Patients", icon: HeartPulse, tone: "pink", format: "number",
    fetcher: () => safeCount("user_roles", (q) => q.eq("role", "patient")),
  },
  {
    key: "total-manufacturers", title: "Total Manufacturers", icon: Building2, tone: "amber", format: "number",
    fetcher: () => safeCount("manufacturers", (q) => q.eq("approval_status", "approved")),
  },
  {
    key: "total-orders", title: "Total Orders", icon: ShoppingBag, tone: "purple", format: "number",
    fetcher: () => safeCount("orders"),
  },
  {
    key: "gmv", title: "Gross Merchandise Value", icon: IndianRupee, tone: "green", format: "currency",
    fetcher: () => sumOrders((q) => q.neq("order_status", "cancelled")),
  },
  {
    key: "ayuzee-revenue", title: "Ayuzee Platform Revenue", icon: Wallet, tone: "emerald", format: "currency",
    fetcher: () => sumWalletBySource("platform_fee"),
  },
  {
    key: "doctor-commissions", title: "Doctor Commissions Paid", icon: Coins, tone: "cyan", format: "currency",
    fetcher: () => sumWalletBySource("commission"),
  },
  {
    key: "pending-products", title: "Pending Product Approvals", icon: PackageCheck, tone: "orange", format: "number",
    fetcher: () => safeCount("products", (q) => q.eq("approval_status", "pending")),
    href: "/admin/products/approvals",
    pulseWhen: (n) => n > 5,
  },
  {
    key: "pending-payouts", title: "Pending Payouts", icon: Hourglass, tone: "red", format: "number",
    fetcher: () => safeCount("payout_requests", (q) => q.eq("status", "pending")),
    href: "/admin/payouts",
    pulseWhen: (n) => n > 0,
  },
];

const toneClasses: Record<Tone, { ring: string; icon: string; chip: string }> = {
  emerald: { ring: "ring-emerald-500/20", icon: "text-emerald-500 bg-emerald-500/10", chip: "text-emerald-600 dark:text-emerald-400" },
  amber:   { ring: "ring-amber-500/20",   icon: "text-amber-500 bg-amber-500/10",     chip: "text-amber-600 dark:text-amber-400" },
  sky:     { ring: "ring-sky-500/20",     icon: "text-sky-500 bg-sky-500/10",         chip: "text-sky-600 dark:text-sky-400" },
  violet:  { ring: "ring-violet-500/20",  icon: "text-violet-500 bg-violet-500/10",   chip: "text-violet-600 dark:text-violet-400" },
  blue:    { ring: "ring-blue-500/20",    icon: "text-blue-500 bg-blue-500/10",       chip: "text-blue-600 dark:text-blue-400" },
  pink:    { ring: "ring-pink-500/20",    icon: "text-pink-500 bg-pink-500/10",       chip: "text-pink-600 dark:text-pink-400" },
  purple:  { ring: "ring-purple-500/20",  icon: "text-purple-500 bg-purple-500/10",   chip: "text-purple-600 dark:text-purple-400" },
  green:   { ring: "ring-green-500/20",   icon: "text-green-600 bg-green-500/10",     chip: "text-green-600 dark:text-green-400" },
  cyan:    { ring: "ring-cyan-500/20",    icon: "text-cyan-500 bg-cyan-500/10",       chip: "text-cyan-600 dark:text-cyan-400" },
  orange:  { ring: "ring-orange-500/20",  icon: "text-orange-500 bg-orange-500/10",   chip: "text-orange-600 dark:text-orange-400" },
  red:     { ring: "ring-red-500/20",     icon: "text-red-500 bg-red-500/10",         chip: "text-red-600 dark:text-red-400" },
};

const StatCard = ({ stat, index }: { stat: StatDef; index: number }) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stat", stat.key],
    queryFn: stat.fetcher,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const Icon = stat.icon;
  const tone = toneClasses[stat.tone];
  const numeric = Number(data ?? 0);
  const value = stat.format === "currency" ? formatINR(numeric) : formatNum(numeric);
  const shouldPulse = !isLoading && !isError && stat.pulseWhen?.(numeric);
  const clickable = Boolean(stat.href);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Card
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => navigate(stat.href!) : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === "Enter") navigate(stat.href!); } : undefined}
        className={cn(
          "ring-1 transition-all hover:shadow-md",
          tone.ring,
          clickable && "cursor-pointer hover:-translate-y-0.5",
          shouldPulse && "animate-pulse ring-2"
        )}
      >
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
          <p className={cn("mt-1 text-xs", tone.chip)}>
            {clickable ? "Click to review · live" : "Live · refreshes every 30s"}
          </p>
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
