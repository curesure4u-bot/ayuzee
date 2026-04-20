import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Saved = Tables<"doctor_saved_posts">;

const DoctorSavedPosts = () => {
  const { userId } = useDoctor();
  const [posts, setPosts] = useState<Saved[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from("doctor_saved_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(({ data }) => setPosts(data ?? []));
  }, [userId]);

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="p-6">
        <h1 className="mb-4 font-display text-2xl flex items-center gap-2"><Bookmark className="h-6 w-6 text-primary" /> Saved Posts</h1>
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Bookmark posts from the feed and blogs to read later.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="flex gap-3 rounded-lg border p-3">
                {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.post_title} className="h-20 w-20 rounded object-cover" />}
                <div className="flex-1">
                  <h3 className="font-medium">{p.post_title}</h3>
                  {p.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  {p.post_url && <a href={p.post_url} target="_blank" rel="noreferrer" className="text-primary"><ExternalLink className="h-4 w-4" /></a>}
                  <button onClick={async () => { await supabase.from("doctor_saved_posts").delete().eq("id", p.id); setPosts((x) => x.filter((y) => y.id !== p.id)); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorSavedPosts;
