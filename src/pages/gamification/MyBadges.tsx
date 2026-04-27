import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";

type BadgeDef = { id: string; code: string; name: string; description: string | null; icon: string; criteria_type: string; criteria_value: number };

const MyBadges = () => {
  const [all, setAll] = useState<BadgeDef[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = "My Badges — Ayuzee";
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const [a, e] = await Promise.all([
        (supabase as any).from("gam_badges").select("*").order("criteria_value"),
        session ? (supabase as any).from("gam_user_badges").select("badge_id").eq("user_id", session.user.id) : Promise.resolve({ data: [] }),
      ]);
      setAll(a.data ?? []);
      setEarned(new Set((e.data ?? []).map((r: any) => r.badge_id)));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>All Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {all.map((b) => {
              const got = earned.has(b.id);
              return (
                <div key={b.id} className={`rounded-2xl border p-4 text-center transition ${got ? "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-soft" : "border-border bg-card opacity-60 grayscale"}`}>
                  <div className="text-5xl">{b.icon}</div>
                  <p className="mt-2 font-semibold">{b.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
                  <UiBadge variant={got ? "default" : "outline"} className="mt-3">{got ? "Earned" : "Locked"}</UiBadge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyBadges;
