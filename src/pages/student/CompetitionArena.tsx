import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Medal,
  Swords,
  Trophy,
  XCircle,
  Users,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCompetitionArena,
  useCompetitionLeaderboard,
  type QuizQuestion,
} from "@/hooks/useQuizCompetition";

// ---------- Quiz Play Component ----------

function QuizPlay({
  questions,
  timeLimit,
  onComplete,
}: {
  questions: QuizQuestion[];
  timeLimit: number;
  onComplete: (correct: number, total: number, timeTaken: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [finished, setFinished] = useState(false);
  const startTime = useRef(Date.now());

  // Timer
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const handleFinish = useCallback(() => {
    if (finished) return;
    setFinished(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const correct = answers.reduce<number>((acc, ans, idx) => {
      return acc + (ans === questions[idx].correct ? 1 : 0);
    }, 0);
    onComplete(correct, questions.length, timeTaken);
  }, [answers, finished, onComplete, questions]);

  const selectAnswer = (optionIdx: number) => {
    if (finished) return;
    const updated = [...answers];
    updated[currentIdx] = optionIdx;
    setAnswers(updated);
  };

  const question = questions[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  if (finished) {
    const correct = answers.reduce<number>((acc, ans, idx) => acc + (ans === questions[idx].correct ? 1 : 0), 0);
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Trophy className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-xl font-bold">Quiz Complete!</h2>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-2xl font-bold text-primary">{correct}</p>
              <p className="text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{questions.length - correct}</p>
              <p className="text-muted-foreground">Wrong</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{Math.round((correct / questions.length) * 100)}%</p>
              <p className="text-muted-foreground">Accuracy</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Your score has been submitted. Check the leaderboard below!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer + Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>
      <Progress value={progress} className="h-2" />

      {/* Question */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">{question.question}</h3>
          <div className="grid gap-2">
            {question.options.map((option, idx) => (
              <Button
                key={idx}
                variant={answers[currentIdx] === idx ? "default" : "outline"}
                className="justify-start text-left h-auto py-3 px-4"
                onClick={() => selectAnswer(idx)}
              >
                <span className="mr-3 font-semibold text-xs opacity-70">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                idx === currentIdx
                  ? "bg-primary text-primary-foreground"
                  : answers[idx] !== null
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setCurrentIdx(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {currentIdx < questions.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentIdx((prev) => prev + 1)}>
            Next
          </Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={handleFinish}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- Leaderboard Component ----------

function Leaderboard({ competitionId }: { competitionId: string }) {
  const { scores, collegeBoard, loading } = useCompetitionLeaderboard(competitionId);
  const [view, setView] = useState("individual");

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="individual" className="gap-1.5">
            <Medal className="h-3.5 w-3.5" /> Individual
          </TabsTrigger>
          <TabsTrigger value="college" className="gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" /> By College
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="mt-3 space-y-2">
          {scores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No scores yet.</p>
          ) : (
            scores.map((score, idx) => (
              <div
                key={score.id}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : idx === 1
                      ? "bg-gray-100 text-gray-700"
                      : idx === 2
                      ? "bg-orange-100 text-orange-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{score.student_name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{score.college_name || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{score.score} pts</p>
                  <p className="text-xs text-muted-foreground">
                    {score.correct_answers}/{score.total_questions} correct
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="college" className="mt-3 space-y-2">
          {collegeBoard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No college scores yet.</p>
          ) : (
            collegeBoard.map((entry, idx) => (
              <div
                key={entry.college_name}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : idx === 1
                      ? "bg-gray-100 text-gray-700"
                      : idx === 2
                      ? "bg-orange-100 text-orange-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.college_name}</p>
                  <p className="text-xs text-muted-foreground">
                    <Users className="h-3 w-3 inline mr-1" />
                    {entry.participants} participant{entry.participants !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{entry.total_score} pts</p>
                  <p className="text-xs text-muted-foreground">
                    Avg {entry.avg_score} · Top {entry.top_score}
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Main Page ----------

const CompetitionArena = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { competition, loading, alreadySubmitted, submitScore } =
    useCompetitionArena(competitionId);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const handleQuizComplete = async (correct: number, total: number, timeTaken: number) => {
    setQuizDone(true);
    const ok = await submitScore(correct, total, timeTaken);
    if (ok) {
      toast.success("Score submitted!");
    } else {
      toast.error("Failed to submit score (you may have already submitted)");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Competition not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/student/competitions">Back to Competitions</Link>
        </Button>
      </div>
    );
  }

  const questions = competition.questions || [];
  const canPlay = competition.status !== "completed" && !alreadySubmitted && questions.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/student/competitions" aria-label="Back to competitions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" /> {competition.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Badge variant="outline">{competition.subject}</Badge>
            <Badge variant="outline">{competition.difficulty}</Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {Math.floor(competition.time_limit_seconds / 60)} min
            </span>
            <span>{questions.length} questions</span>
          </div>
        </div>
      </div>

      {competition.description && (
        <p className="text-sm text-muted-foreground">{competition.description}</p>
      )}

      <Separator />

      {/* Quiz Area */}
      {!quizStarted && !alreadySubmitted && canPlay && (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Swords className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-lg font-semibold">Ready to compete?</h2>
            <p className="text-sm text-muted-foreground">
              You have {Math.floor(competition.time_limit_seconds / 60)} minutes to answer{" "}
              {questions.length} questions. Score = 10 pts per correct answer + time bonus.
            </p>
            <Button size="lg" onClick={() => setQuizStarted(true)}>
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {quizStarted && !quizDone && canPlay && (
        <QuizPlay
          questions={questions}
          timeLimit={competition.time_limit_seconds}
          onComplete={handleQuizComplete}
        />
      )}

      {(alreadySubmitted || quizDone) && (
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
            <p className="font-semibold">You've already submitted your answers!</p>
            <p className="text-sm text-muted-foreground">Check the leaderboard below to see how you rank.</p>
          </CardContent>
        </Card>
      )}

      {!canPlay && !alreadySubmitted && questions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            Questions haven't been added to this competition yet.
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Leaderboard
        </h2>
        {competitionId && <Leaderboard competitionId={competitionId} />}
      </div>
    </div>
  );
};

export default CompetitionArena;
