import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Eye,
  GraduationCap,
  Loader2,
  Stethoscope,
  ClipboardList,
  Pill,
  Activity,
  FileText,
  MessageSquare,
  BookOpen,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useCaseStudyDetail } from "@/hooks/useCaseStudies";

type SectionProps = {
  icon: React.ReactNode;
  title: string;
  content: string;
};

function CaseSection({ icon, title, content }: SectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-6">
        {content}
      </p>
    </div>
  );
}

const CaseStudyDetail = () => {
  const { caseStudyId } = useParams<{ caseStudyId: string }>();
  const { caseStudy, isBookmarked, loading, toggleBookmark } = useCaseStudyDetail(caseStudyId);

  const handleBookmark = async () => {
    await toggleBookmark();
    toast.success(isBookmarked ? "Bookmark removed" : "Bookmarked!");
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Case study not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/student/case-studies">Back to Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
          <Link to="/student/case-studies" aria-label="Back to library">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{caseStudy.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline">{caseStudy.system}</Badge>
            <Badge variant="outline">{caseStudy.subject}</Badge>
            <Badge
              className={`text-[10px] ${
                caseStudy.difficulty === "Beginner"
                  ? "bg-emerald-100 text-emerald-800"
                  : caseStudy.difficulty === "Intermediate"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {caseStudy.difficulty}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            {caseStudy.author_name && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> {caseStudy.author_name}
                {caseStudy.author_college && ` · ${caseStudy.author_college}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {caseStudy.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="h-3 w-3" /> {caseStudy.bookmark_count} saved
            </span>
          </div>
          {(caseStudy.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {caseStudy.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button
          variant={isBookmarked ? "default" : "outline"}
          size="sm"
          onClick={handleBookmark}
          className="gap-1.5 shrink-0"
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {isBookmarked ? "Saved" : "Save"}
        </Button>
      </div>

      <Separator />

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{caseStudy.summary}</p>
        </CardContent>
      </Card>

      {/* Clinical Sections */}
      <Card>
        <CardContent className="p-5 space-y-5">
          <CaseSection
            icon={<ClipboardList className="h-4 w-4 text-blue-600" />}
            title="Patient History"
            content={caseStudy.patient_history}
          />
          <Separator />
          <CaseSection
            icon={<Stethoscope className="h-4 w-4 text-green-600" />}
            title="Examination"
            content={caseStudy.examination}
          />
          <Separator />
          <CaseSection
            icon={<Activity className="h-4 w-4 text-orange-600" />}
            title="Diagnosis"
            content={caseStudy.diagnosis}
          />
          <Separator />
          <CaseSection
            icon={<Pill className="h-4 w-4 text-purple-600" />}
            title="Treatment"
            content={caseStudy.treatment}
          />
          <Separator />
          <CaseSection
            icon={<BookOpen className="h-4 w-4 text-emerald-600" />}
            title="Outcome"
            content={caseStudy.outcome}
          />
          {caseStudy.discussion && (
            <>
              <Separator />
              <CaseSection
                icon={<MessageSquare className="h-4 w-4 text-cyan-600" />}
                title="Discussion"
                content={caseStudy.discussion}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* References */}
      {caseStudy.references && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">References</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {caseStudy.references}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Back link */}
      <div className="pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/student/case-studies">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Library
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CaseStudyDetail;
