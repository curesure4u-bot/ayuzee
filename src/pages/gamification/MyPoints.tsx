import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Tx = { id: string; action_type: string; points: number; description: string | null; created_at: string; role: string | null };

const MyPoints = () => {
  const [txs, setTxs] = useState<Tx[]>([]);
  useEffect(() => {
    document.title = "My Points — Ayuzee";
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any).from("gam_points_transactions")
        .select("id, action_type, points, description, created_at, role")
        .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(200);
      setTxs(data ?? []);
    })();
  }, []);
  const total = txs.reduce((s, t) => s + t.points, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Points History</CardTitle>
        <Badge className="text-base">{total} pts shown</Badge>
      </CardHeader>
      <CardContent>
        {txs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No points yet. Complete activities to start earning!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(t.created_at).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{t.action_type}</Badge></TableCell>
                  <TableCell className="text-sm">{t.description ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono">+{t.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MyPoints;
