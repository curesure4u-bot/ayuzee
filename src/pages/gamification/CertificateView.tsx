import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Loader2, Printer } from "lucide-react";

const typeLabel: Record<string, string> = {
  level_up: "Certificate of Level Achievement",
  badge_milestone: "Certificate of Excellence",
  challenge_completion: "Certificate of Challenge Completion",
  annual_excellence: "Annual Excellence Award",
};

const CertificateView = () => {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: cert ? `${cert.certificate_no} — Ayuzee` : "Certificate",
    noIndex: true,
  });

  useEffect(() => {
    supabase.from("gam_certificates_public" as any).select("*").eq("id", id).maybeSingle().then(({ data }: any) => {
      setCert(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!cert) return <div className="container py-24 text-center">Certificate not found</div>;

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="container">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/gamification/certificates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to certificates
          </Link>
          <Button onClick={() => window.print()} variant="hero"><Printer className="h-4 w-4" /> Print / Save PDF</Button>
        </div>

        <div className="mx-auto max-w-4xl rounded-3xl border-8 border-double border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-12 shadow-elegant print:border-primary print:shadow-none">
          <div className="text-center">
            <Award className="mx-auto h-16 w-16 text-primary" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">Ayuzee Growth & Appreciation Engine</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{typeLabel[cert.certificate_type] || "Certificate"}</h1>

            <p className="mt-8 text-sm uppercase tracking-wider text-muted-foreground">This certificate is proudly presented to</p>
            <p className="mt-3 font-display text-4xl text-primary">{cert.recipient_name}</p>

            <p className="mt-6 text-base">in recognition of</p>
            <p className="mt-3 font-display text-2xl">"{cert.title}"</p>
            {cert.subtitle && <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{cert.subtitle}</p>}

            <p className="mt-8 text-sm text-muted-foreground">
              Issued on {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <div className="mt-12 flex items-end justify-between">
              <div className="text-left">
                <p className="border-t border-border pt-2 text-xs text-muted-foreground">Certificate No.</p>
                <p className="font-mono text-sm">{cert.certificate_no}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl italic text-primary" style={{ fontFamily: "cursive" }}>Dr Mohamad Saleem</p>
                <p className="border-t border-border pt-1 text-xs text-muted-foreground">Founder, Ayuzee</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-primary">Ayuzee</p>
                <p className="text-xs text-muted-foreground">Growth & Appreciation Engine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
