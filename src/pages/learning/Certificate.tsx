import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Loader2, Printer } from "lucide-react";

const Certificate = () => {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: cert ? `Certificate ${cert.certificate_no} — Ayuzee` : "Certificate",
  });

  useEffect(() => {
    supabase.from("lms_certificates").select("*").eq("id", id).maybeSingle().then(({ data }) => {
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
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <Button onClick={() => window.print()} variant="hero"><Printer className="h-4 w-4" /> Print / Save PDF</Button>
        </div>

        <div className="mx-auto max-w-4xl rounded-3xl border-8 border-double border-primary/20 bg-card p-12 shadow-elegant print:border-primary print:shadow-none">
          <div className="text-center">
            <Award className="mx-auto h-16 w-16 text-secondary" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">Ayuzee Learning Hub</p>
            <h1 className="mt-2 font-display text-5xl">Certificate of Completion</h1>
            <p className="mt-8 text-sm uppercase tracking-wider text-muted-foreground">This is to certify that</p>
            <p className="mt-3 font-display text-4xl text-primary">{cert.recipient_name}</p>
            <p className="mt-6 text-base">has successfully completed the course</p>
            <p className="mt-3 font-display text-2xl">"{cert.course_title}"</p>
            <p className="mt-8 text-sm text-muted-foreground">Issued on {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            <div className="mt-12 flex items-end justify-between">
              <div className="text-left">
                <p className="border-t border-border pt-2 text-xs text-muted-foreground">Certificate No.</p>
                <p className="font-mono text-sm">{cert.certificate_no}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-primary">Ayuzee</p>
                <p className="text-xs text-muted-foreground">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
