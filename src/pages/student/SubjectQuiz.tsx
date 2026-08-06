import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QUIZ_SUBJECTS, QUIZ_BANK, type QuizSubject } from "@/data/ayushQuizBank";

const SubjectQuiz = () => {
  const navigate = useNavigate();

  // Count questions per subject
  const subjectCounts = QUIZ_SUBJECTS.map(s => ({
    ...s,
    count: QUIZ_BANK.filter(q => q.subject === s.value).length,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Subject-wise Practice
        </h1>
        <p className="text-sm text-muted-foreground">
          {QUIZ_BANK.length} questions across {QUIZ_SUBJECTS.length} subjects · Practice any subject
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {subjectCounts.map(sub => (
          <Card key={sub.value}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/student/daily-quiz?subject=${encodeURIComponent(sub.value)}`)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sub.icon}</span>
                <div>
                  <p className="font-medium text-sm">{sub.label}</p>
                  <p className="text-xs text-muted-foreground">{sub.count} questions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{sub.count} Qs</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-center">
          <p className="text-sm font-medium">Want a mixed challenge?</p>
          <Button className="mt-2" onClick={() => navigate("/student/daily-quiz")}>
            <Brain className="mr-2 h-4 w-4" /> Take Daily Quiz (Random Mix)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectQuiz;
