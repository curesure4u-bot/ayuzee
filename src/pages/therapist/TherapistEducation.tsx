import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Video, FileText, Award, CheckCircle, Play } from "lucide-react";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface LearningContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  therapy_type: string;
  video_url: string;
  article_body: string;
  thumbnail_url: string;
  duration_minutes: number;
  difficulty_level: string;
}

interface LearningProgress {
  id: string;
  therapist_id: string;
  content_id: string;
  status: string;
  completed_at: string;
  score: number;
}

const TYPE_ICONS: Record<string, any> = {
  video: Video,
  article: FileText,
  certification: Award,
  clinical_update: GraduationCap,
  quiz: CheckCircle,
};

export default function TherapistEducation() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [content, setContent] = useState<LearningContent[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchData();
  }, [therapist.id]);

  const fetchData = async () => {
    setLoading(true);
    const [contentRes, progressRes] = await Promise.all([
      (supabase as any).from("therapist_learning_content").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("therapist_learning_progress").select("*").eq("therapist_id", therapist.id),
    ]);

    if (contentRes.data) setContent(contentRes.data);
    if (progressRes.data) setProgress(progressRes.data);
    setLoading(false);
  };

  const getProgressForContent = (contentId: string) => {
    return progress.find((p) => p.content_id === contentId);
  };

  const markCompleted = async (contentId: string) => {
    const existing = getProgressForContent(contentId);
    if (existing) {
      const { error } = await (supabase as any)
        .from("therapist_learning_progress")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) {
        toast.error("Failed to update progress");
        return;
      }
    } else {
      const { error } = await (supabase as any).from("therapist_learning_progress").insert({
        therapist_id: therapist.id,
        content_id: contentId,
        status: "completed",
        completed_at: new Date().toISOString(),
      });
      if (error) {
        toast.error("Failed to save progress");
        return;
      }
    }
    toast.success("Marked as completed");
    fetchData();
  };

  const completedCount = progress.filter((p) => p.status === "completed").length;
  const totalCount = content.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredContent = content.filter((c) => filterType === "all" || c.content_type === filterType);

  if (loading) {
    return <div className="p-6 text-center">Loading learning content...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <GraduationCap className="w-6 h-6" />Education & Training
      </h1>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} completed ({completionPct}%)</span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Filter */}
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
          <SelectItem value="article">Articles</SelectItem>
          <SelectItem value="certification">Certifications</SelectItem>
          <SelectItem value="clinical_update">Clinical Updates</SelectItem>
          <SelectItem value="quiz">Quizzes</SelectItem>
        </SelectContent>
      </Select>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No learning content available
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => {
            const prog = getProgressForContent(item.id);
            const isCompleted = prog?.status === "completed";
            const Icon = TYPE_ICONS[item.content_type] || FileText;

            return (
              <Card key={item.id} className={isCompleted ? "border-green-200 bg-green-50/30" : ""}>
                {item.thumbnail_url && (
                  <div className="w-full h-32 bg-muted rounded-t-lg overflow-hidden">
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />{item.content_type.replace("_", " ")}
                    </Badge>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <CardTitle className="text-sm mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.duration_minutes && <span>{item.duration_minutes} min</span>}
                    {item.difficulty_level && <Badge variant="secondary" className="text-xs">{item.difficulty_level}</Badge>}
                    {item.therapy_type && <Badge variant="outline" className="text-xs">{item.therapy_type}</Badge>}
                  </div>
                  <div className="flex gap-2">
                    {item.video_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                          <Play className="w-3 h-3 mr-1" />Watch
                        </a>
                      </Button>
                    )}
                    {!isCompleted && (
                      <Button size="sm" onClick={() => markCompleted(item.id)}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
