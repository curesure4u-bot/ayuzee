import { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BreakdownRow {
  id: string;
  name: string;
  role: string;
  sessionsCount: number;
  grossAmount: number;
  commissionRate: number;
  netOwed: number;
  status: string;
}

export default function AdminRevenueSplitDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformShare: 0,
    doctorShare: 0,
    therapistShare: 0,
    venueShare: 0,
  });
  const [breakdown, setBreakdown] = useState<BreakdownRow[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const from = new Date(year, month - 1, 1).toISOString();
      const to = new Date(year, month, 1).toISOString();

      const { data: sessions } = await (supabase as any)
        .from("therapy_sessions")
        .select("id, total_amount, therapist_id, doctor_id, status")
        .eq("status", "completed")
        .gte("scheduled_date", from)
        .lt("scheduled_date", to);

      const completedSessions = sessions || [];
      const totalRevenue = completedSessions.reduce(
        (sum: number, s: any) => sum + (Number(s.total_amount) || 0),
        0
      );

      // Default splits
      const platformRate = 0.2;
      const doctorRate = 0.4;
      const therapistRate = 0.25;
      const venueRate = 0.15;

      setSummary({
        totalRevenue,
        platformShare: totalRevenue * platformRate,
        doctorShare: totalRevenue * doctorRate,
        therapistShare: totalRevenue * therapistRate,
        venueShare: totalRevenue * venueRate,
      });

      // Build breakdown by provider
      const providerMap: Record<string, BreakdownRow> = {};

      for (const session of completedSessions) {
        const amount = Number(session.total_amount) || 0;

        if (session.doctor_id) {
          if (!providerMap[`doc_${session.doctor_id}`]) {
            providerMap[`doc_${session.doctor_id}`] = {
              id: session.doctor_id,
              name: `Doctor ${session.doctor_id.slice(0, 8)}`,
              role: "Doctor",
              sessionsCount: 0,
              grossAmount: 0,
              commissionRate: doctorRate * 100,
              netOwed: 0,
              status: "pending",
            };
          }
          providerMap[`doc_${session.doctor_id}`].sessionsCount += 1;
          providerMap[`doc_${session.doctor_id}`].grossAmount += amount;
          providerMap[`doc_${session.doctor_id}`].netOwed += amount * doctorRate;
        }

        if (session.therapist_id) {
          if (!providerMap[`ther_${session.therapist_id}`]) {
            providerMap[`ther_${session.therapist_id}`] = {
              id: session.therapist_id,
              name: `Therapist ${session.therapist_id.slice(0, 8)}`,
              role: "Therapist",
              sessionsCount: 0,
              grossAmount: 0,
              commissionRate: therapistRate * 100,
              netOwed: 0,
              status: "pending",
            };
          }
          providerMap[`ther_${session.therapist_id}`].sessionsCount += 1;
          providerMap[`ther_${session.therapist_id}`].grossAmount += amount;
          providerMap[`ther_${session.therapist_id}`].netOwed += amount * therapistRate;
        }
      }

      setBreakdown(Object.values(providerMap));
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const handleBatchSettle = () => {
    const pendingCount = breakdown.filter((r) => r.status === "pending").length;
    toast.success(`Settlement initiated for ${pendingCount} pending payouts`);
  };

  const handleMarkSettled = (id: string) => {
    setBreakdown((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: "settled" } : row))
    );
    toast.success("Marked as settled");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IndianRupee className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-3xl font-bold">Revenue Split & Settlement</h1>
            <p className="text-muted-foreground">Who is owed what</p>
          </div>
        </div>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-[180px]"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{loading ? "..." : formatCurrency(summary.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Platform (20%)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{loading ? "..." : formatCurrency(summary.platformShare)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Doctors (40%)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{loading ? "..." : formatCurrency(summary.doctorShare)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Therapists (25%)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{loading ? "..." : formatCurrency(summary.therapistShare)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Venues (15%)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{loading ? "..." : formatCurrency(summary.venueShare)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Settlement Breakdown</CardTitle>
          <Button onClick={handleBatchSettle} size="sm">
            Batch Settle All
          </Button>
        </CardHeader>
        <CardContent>
          {breakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">No completed sessions found for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net Owed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.role}</Badge>
                    </TableCell>
                    <TableCell>{row.sessionsCount}</TableCell>
                    <TableCell>{formatCurrency(row.grossAmount)}</TableCell>
                    <TableCell>{row.commissionRate}%</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(row.netOwed)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status === "settled" ? "default" : "secondary"}
                        className={row.status === "settled" ? "bg-green-600" : ""}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkSettled(row.id)}
                        >
                          Mark Settled
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
