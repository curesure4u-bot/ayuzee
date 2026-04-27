import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type BadgeDef = { id: string; code: string; name: string; description: string | null; icon: string; criteria_type: string; criteria_value: number };
type LevelDef = { id: string; level_number: number; level_name: string; min_points: number; max_points: number | null; icon: string | null };

const AdminGamification = () => {
  const [badges, setBadges] = useState<BadgeDef[]>([]);
  const [levels, setLevels] = useState<LevelDef[]>([]);
  const [topUsers, setTopUsers] = useState<{ user_id: string; full_name: string | null; total_points: number; level_number: number }[]>([]);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantPoints, setGrantPoints] = useState(50);
  const [grantNote, setGrantNote] = useState("Manual award");

  const load = async () => {
    const [b, l, s] = await Promise.all([
      (supabase as any).from("gam_badges").select("*").order("criteria_value"),
      (supabase as any).from("gam_levels").select("*").order("level_number"),
      (supabase as any).from("gam_user_stats").select("user_id, total_points, level_number").order("total_points", { ascending: false }).limit(50),
    ]);
    setBadges(b.data ?? []);
    setLevels(l.data ?? []);
    const ids = (s.data ?? []).map((r: any) => r.user_id);
    const profiles = ids.length ? await (supabase as any).from("profiles").select("user_id, full_name").in("user_id", ids) : { data: [] };
    const nameMap = new Map((profiles.data ?? []).map((p: any) => [p.user_id, p.full_name]));
    setTopUsers((s.data ?? []).map((r: any) => ({ ...r, full_name: nameMap.get(r.user_id) ?? null })));
  };

  useEffect(() => { document.title = "Gamification — Admin"; load(); }, []);

  const saveBadge = async (b: BadgeDef) => {
    const { error } = await (supabase as any).from("gam_badges").update({
      name: b.name, description: b.description, icon: b.icon, criteria_value: b.criteria_value,
    }).eq("id", b.id);
    if (error) toast.error(error.message); else toast.success("Badge saved");
  };

  const saveLevel = async (l: LevelDef) => {
    const { error } = await (supabase as any).from("gam_levels").update({
      level_name: l.level_name, min_points: l.min_points, max_points: l.max_points, icon: l.icon,
    }).eq("id", l.id);
    if (error) toast.error(error.message); else toast.success("Level saved");
  };

  const grantPointsHandler = async () => {
    const { data: prof } = await supabase.from("profiles").select("user_id").eq("email", grantEmail).maybeSingle();
    if (!prof) return toast.error("User not found");
    const { error } = await (supabase as any).from("gam_points_transactions").insert({
      user_id: prof.user_id, action_type: "admin_award", points: grantPoints, description: grantNote, role: null,
    });
    if (error) return toast.error(error.message);
    // also bump cached stats
    const { data: cur } = await (supabase as any).from("gam_user_stats").select("total_points").eq("user_id", prof.user_id).maybeSingle();
    const newTotal = (cur?.total_points ?? 0) + grantPoints;
    await (supabase as any).from("gam_user_stats").upsert({ user_id: prof.user_id, total_points: newTotal, level_number: 1, updated_at: new Date().toISOString() });
    toast.success(`Awarded ${grantPoints} pts`);
    setGrantEmail(""); load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Gamification Control</h1>
        <p className="text-sm text-muted-foreground">Manage badges, levels, and award points manually.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Manual Points Award</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div><Label>User email</Label><Input value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="user@example.com" /></div>
          <div><Label>Points</Label><Input type="number" value={grantPoints} onChange={(e) => setGrantPoints(Number(e.target.value))} /></div>
          <div><Label>Note</Label><Input value={grantNote} onChange={(e) => setGrantNote(e.target.value)} /></div>
          <Button className="self-end" onClick={grantPointsHandler}>Award</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Top Users</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead className="text-right">Level</TableHead><TableHead className="text-right">Points</TableHead></TableRow></TableHeader>
            <TableBody>
              {topUsers.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>{u.full_name ?? u.user_id.slice(0, 8)}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline">L{u.level_number}</Badge></TableCell>
                  <TableCell className="text-right font-mono">{u.total_points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Levels</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {levels.map((l, idx) => (
            <div key={l.id} className="grid items-end gap-2 rounded-md border border-border p-3 md:grid-cols-6">
              <div><Label>Lvl {l.level_number}</Label><Input value={l.level_name} onChange={(e) => { const c = [...levels]; c[idx] = { ...l, level_name: e.target.value }; setLevels(c); }} /></div>
              <div><Label>Min</Label><Input type="number" value={l.min_points} onChange={(e) => { const c = [...levels]; c[idx] = { ...l, min_points: Number(e.target.value) }; setLevels(c); }} /></div>
              <div><Label>Max</Label><Input type="number" value={l.max_points ?? ""} onChange={(e) => { const c = [...levels]; c[idx] = { ...l, max_points: e.target.value ? Number(e.target.value) : null }; setLevels(c); }} /></div>
              <div><Label>Icon</Label><Input value={l.icon ?? ""} onChange={(e) => { const c = [...levels]; c[idx] = { ...l, icon: e.target.value }; setLevels(c); }} /></div>
              <Button variant="outline" onClick={() => saveLevel(l)}>Save</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {badges.map((b, idx) => (
            <div key={b.id} className="grid items-end gap-2 rounded-md border border-border p-3 md:grid-cols-6">
              <div><Label>Code</Label><Input value={b.code} disabled /></div>
              <div><Label>Name</Label><Input value={b.name} onChange={(e) => { const c = [...badges]; c[idx] = { ...b, name: e.target.value }; setBadges(c); }} /></div>
              <div><Label>Icon</Label><Input value={b.icon} onChange={(e) => { const c = [...badges]; c[idx] = { ...b, icon: e.target.value }; setBadges(c); }} /></div>
              <div><Label>Criteria</Label><Input value={b.criteria_type} disabled /></div>
              <div><Label>Value</Label><Input type="number" value={b.criteria_value} onChange={(e) => { const c = [...badges]; c[idx] = { ...b, criteria_value: Number(e.target.value) }; setBadges(c); }} /></div>
              <Button variant="outline" onClick={() => saveBadge(b)}>Save</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGamification;
