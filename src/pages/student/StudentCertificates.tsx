import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Certificate = {
  id: string;
  course_id: string;
  course_title: string;
  certificate_no: string;
  issued_at: string;
  lms_courses?: { title: string; category: string | null; thumbnail_url: string | null } | null;
};

const StudentCertificates = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data } = await supabase
        .from("lms_certificates")
        .select("id, course_id, course_title, certificate_no, issued_at, lms_courses(title, category, thumbnail_url)")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });
      setCertificates((data ?? []) as Certificate[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">My Certificates</h1><p className="mt-2 text-muted-foreground">View and download certificates earned from Ayuzee learning courses.</p></div>
      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground"><Award className="mx-auto mb-3 h-8 w-8 text-primary/50" />No certificates earned yet.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">{cert.lms_courses?.thumbnail_url ? <img src={cert.lms_courses.thumbnail_url} alt={cert.course_title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Award className="h-14 w-14 text-primary/40" /></div>}</div>
              <CardContent className="p-5">
                <Badge variant="outline">{cert.lms_courses?.category || "Certificate"}</Badge>
                <h3 className="mt-3 font-display text-xl">{cert.lms_courses?.title || cert.course_title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Earned {new Date(cert.issued_at).toLocaleDateString("en-IN")}</p>
                <p className="mt-1 text-xs font-semibold text-primary">Certificate ID: {cert.certificate_no}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild><Link to={`/learning/certificates/${cert.id}`}>View Certificate</Link></Button>
                  <Button asChild variant="outline"><Link to={`/learning/certificates/${cert.id}?print=1`}><Download className="h-4 w-4" />Download PDF</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
