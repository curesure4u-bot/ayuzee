import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Row {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  is_doctor: boolean;
}

const AdminUsers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin · Users — Ayuzee";
    const load = async () => {
      const [profiles, doctors] = await Promise.all([
        supabase.from("profiles").select("user_id,full_name,phone,created_at").order("created_at", { ascending: false }),
        supabase.from("doctors").select("user_id"),
      ]);
      const docSet = new Set((doctors.data ?? []).map((d: { user_id: string | null }) => d.user_id).filter(Boolean));
      setRows((profiles.data ?? []).map((p) => ({ ...p, is_doctor: docSet.has(p.user_id) })));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const t = q.toLowerCase();
    return rows.filter((r) =>
      (r.full_name ?? "").toLowerCase().includes(t) || (r.phone ?? "").includes(t),
    );
  }, [rows, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>All profiles</span>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.user_id}>
                    <TableCell className="font-medium">{r.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.phone || "—"}</TableCell>
                    <TableCell>
                      {r.is_doctor
                        ? <Badge className="bg-primary text-primary-foreground">Doctor</Badge>
                        : <Badge variant="secondary">Patient</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">No users match.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
