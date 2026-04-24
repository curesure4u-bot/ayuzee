import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, Loader2, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const StudentCertificates = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data } = await supabase
        .from("lms_certificates")
        .select("id, course_title, certificate_no, issued_at")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });
      setCertificates(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <Card>
      <CardHeader><CardTitle className="font-display text-2xl">My Certificates</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {certificates.length === 0 ? (
          <Empty icon={Award} title="No certificates yet" text="Complete courses and quizzes to earn verified certificates." action="Browse Courses" to="/student/courses" />
        ) : certificates.map((cert) => (
          <div key={cert.id} className="rounded-2xl border border-border p-4">
            <Award className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">{cert.course_title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{cert.certificate_no} · {new Date(cert.issued_at).toLocaleDateString("en-IN")}</p>
            <Button asChild className="mt-4" variant="outline"><Link to={`/learning/certificates/${cert.id}`}>View Certificate</Link></Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data } = await (supabase as any)
        .from("student_profiles")
        .select("full_name, phone, college_name, course, year_of_study, state, city, interests, is_verified")
        .eq("user_id", userId)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <Card>
      <CardHeader><CardTitle className="font-display text-2xl">My Profile</CardTitle></CardHeader>
      <CardContent>
        {!profile ? (
          <Empty icon={UserCircle} title="Profile not found" text="Complete student signup to create your profile." action="Student Auth" to="/student/auth" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-border p-5">
              <UserCircle className="h-12 w-12 text-primary" />
              <h2 className="mt-3 font-display text-2xl">{profile.full_name}</h2>
              <p className="text-muted-foreground">{profile.course} · Year {profile.year_of_study}</p>
              <Badge className="mt-3" variant={profile.is_verified ? "default" : "outline"}>{profile.is_verified ? "Verified" : "Verification pending"}</Badge>
            </div>
            <div className="grid gap-3 text-sm">
              <Info label="College" value={profile.college_name} />
              <Info label="Phone" value={profile.phone} />
              <Info label="Location" value={[profile.city, profile.state].filter(Boolean).join(", ")} />
              <div>
                <p className="text-muted-foreground">Interests</p>
                <div className="mt-2 flex flex-wrap gap-2">{(profile.interests ?? []).map((item: string) => <Badge key={item} variant="outline">{item}</Badge>)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-xl bg-muted/50 p-3"><p className="text-muted-foreground">{label}</p><p className="font-medium">{value || "—"}</p></div>
);

const Loading = () => <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

const Empty = ({ icon: Icon, title, text, action, to }: { icon: typeof BookOpen; title: string; text: string; action: string; to: string }) => (
  <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
    <Icon className="mx-auto h-9 w-9 text-primary/60" />
    <h3 className="mt-3 font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    <Button asChild className="mt-5" variant="outline"><Link to={to}>{action}</Link></Button>
  </div>
);
