import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Loader2, ExternalLink } from "lucide-react";

type Cert = {
  id: string;
  certificate_no: string;
  certificate_type: string;
  title: string;
  subtitle: string | null;
  issued_at: string;
};

const typeLabel: Record<string, string> = {
  level_up: "Level Up",
  badge_milestone: "Badge of Excellence",
  challenge_completion: "Challenge Completed",
  annual_excellence: "Annual Excellence",
};

const MyCertificates = () => {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase
        .from("gam_certificates")
        .select("id, certificate_no, certificate_type, title, subtitle, issued_at")
        .eq("user_id", uid)
        .order("issued_at", { ascending: false });
      setCerts((data ?? []) as Cert[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">My Certificates</h2>
        <p className="text-sm text-muted-foreground">Recognitions you've earned for your growth, learning and excellence.</p>
      </div>

      {certs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Award className="mx-auto h-10 w-10 text-primary/40" />
          <p className="mt-3 text-muted-foreground">No certificates yet. Keep growing — your first one is on the way!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certs.map((c) => (
            <Card key={c.id} className="overflow-hidden border-2 border-primary/10 transition hover:border-primary/40">
              <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <CardContent className="space-y-3 p-5">
                <Badge variant="outline">{typeLabel[c.certificate_type] || c.certificate_type}</Badge>
                <h3 className="font-display text-lg leading-tight">{c.title}</h3>
                {c.subtitle && <p className="text-xs text-muted-foreground line-clamp-2">{c.subtitle}</p>}
                <p className="text-xs text-muted-foreground">Issued {new Date(c.issued_at).toLocaleDateString("en-IN")}</p>
                <p className="font-mono text-xs text-primary">{c.certificate_no}</p>
                <Button asChild size="sm" className="w-full">
                  <Link to={`/gamification/certificates/${c.id}`}>
                    <ExternalLink className="h-4 w-4" /> View Certificate
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
