import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/hooks/usePageSEO";

const Colleges = () => {
  usePageSEO({
    title: "AYUSH Colleges & Institutions — Coming Soon | Ayuzee",
    description: "Discover BAMS, BHMS, BSMS and BUMS colleges across India. Ayurveda, Homeopathy, Siddha and Unani institution directory — launching soon on Ayuzee.",
    canonicalPath: "/colleges",
  });
  const navigate = useNavigate();
  return (
    <main className="container max-w-2xl py-24 text-center">
      <div className="rounded-3xl border bg-card p-12 shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
          AYUSH College Directory
        </h1>
        <p className="mt-3 text-muted-foreground">
          We're compiling a verified directory of BAMS, BHMS, BUMS, BSMS and BNYS
          colleges across India. Check back soon.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button asChild variant="hero">
            <Link to="/learning/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Colleges;
