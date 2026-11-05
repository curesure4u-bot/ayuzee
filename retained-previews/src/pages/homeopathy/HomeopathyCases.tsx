import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomeopathyCases = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/doctor/auth");
        return;
      }
      const { data } = await (supabase as any)
        .from("homeopathy_cases")
        .select("id, chief_complaint, status, created_at, updated_at")
        .eq("doctor_user_id", session.user.id)
        .order("created_at", { ascending: false });
      setCases(data || []);
      setLoading(false);
    })();
  }, [navigate]);

  const statusColor: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    cured: "bg-green-100 text-green-700",
    improved: "bg-amber-100 text-amber-700",
    worse: "bg-red-100 text-red-700",
    closed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel={true} />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">📊 My Case Files</h1>
            <p className="text-muted-foreground mt-1">All your homeopathy cases in one place</p>
          </div>
          <Button asChild className="bg-purple-700 hover:bg-purple-800 text-white">
            <Link to="/homeopathy/case/new">+ New Case</Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <div className="text-5xl">📋</div>
            <h3 className="mt-4 font-semibold text-lg">No cases yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start your first homeopathy case to see it here.</p>
            <Link to="/homeopathy/case/new" className="mt-5 inline-block bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
              Start First Case →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c: any) => (
              <Link
                to={`/homeopathy/case/${c.id}`}
                key={c.id}
                className="flex items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 hover:shadow-md hover:border-purple-300 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{c.chief_complaint}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${statusColor[c.status] || "bg-gray-100 text-gray-700"}`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default HomeopathyCases;
