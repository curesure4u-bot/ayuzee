import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Post = {
  id: string; user_id: string; user_name: string | null; role: string | null;
  post_type: string; title: string; description: string | null; emoji: string | null;
  claps_count: number; created_at: string;
};

const typeStyle: Record<string, string> = {
  badge_earned: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  level_up: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  certificate_issued: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  challenge_completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

const AppreciationWall = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [clapped, setClapped] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    setUid(userId ?? null);

    const { data } = await supabase
      .from("gam_appreciation_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setPosts((data ?? []) as Post[]);

    if (userId) {
      const { data: cl } = await supabase.from("gam_appreciation_claps").select("post_id").eq("user_id", userId);
      setClapped(new Set((cl ?? []).map((c: any) => c.post_id)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clap = async (postId: string) => {
    if (!uid) return;
    if (clapped.has(postId)) {
      const { error } = await supabase.from("gam_appreciation_claps").delete().eq("post_id", postId).eq("user_id", uid);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      const next = new Set(clapped); next.delete(postId); setClapped(next);
      setPosts(posts.map(p => p.id === postId ? { ...p, claps_count: Math.max(0, p.claps_count - 1) } : p));
    } else {
      const { error } = await supabase.from("gam_appreciation_claps").insert({ post_id: postId, user_id: uid });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      const next = new Set(clapped); next.add(postId); setClapped(next);
      setPosts(posts.map(p => p.id === postId ? { ...p, claps_count: p.claps_count + 1 } : p));
    }
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Appreciation Wall</h2>
        <p className="text-sm text-muted-foreground">Celebrate every milestone across the AYUSH community.</p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-primary/40" />
          <p className="mt-3 text-muted-foreground">The wall is quiet for now — be the first to earn a badge!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="transition hover:shadow-elegant">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl">
                  {p.emoji || "🎉"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${typeStyle[p.post_type] ?? ""}`}>
                      {p.post_type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <p className="font-medium leading-snug">{p.title}</p>
                  {p.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                </div>
                <Button
                  variant={clapped.has(p.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => clap(p.id)}
                  disabled={!uid}
                  className="shrink-0"
                >
                  <Heart className={`h-4 w-4 ${clapped.has(p.id) ? "fill-current" : ""}`} />
                  {p.claps_count}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppreciationWall;
