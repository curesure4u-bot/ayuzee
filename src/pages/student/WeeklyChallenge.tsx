import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Clock, Trophy, Coins, Zap, CheckCircle2, XCircle,
  RotateCcw, Star, Flame, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { QUIZ_BANK, REWARDS, type QuizQuestion } from "@/data/ayushQuizBank";
import { useStudentProgress } from "@/hooks/useStudentProgress";

type QuizState = "ready" | "playing" | "complete";

// Weekly challenge uses seeded random based on week number for consistent questions per week
function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

function getWeeklyQuestions(): QuizQuestion[] {
  const week = getWeekNumber();
  // Seeded shuffle: same questions all week for fairness
  const sorted = [...QUIZ_BANK].sort((a, b) => {
    const hashA = (a.id * 31 + week * 7) % 1000;
    const hashB = (b.id * 31 + week * 7) % 1000;
    return hashA - hashB;
  });
  // Pick 10, prefer medium/hard
  const hard = sorted.filter(q => q.difficulty === "hard").slice(0, 4);
  const medium = sorted.filter(q => q.difficulty === "medium").slice(0, 4);
  const easy = sorted.filter(q => q.difficulty === "easy").slice(0, 2);
  return [...hard, ...medium, ...easy].slice(0, 10);
}

const WEEKLY_REWARDS = {
  correctAnswer: { xp: 15, coins: 8 },   // 1.5x daily
  perfectChallenge: { xp: 100, coins: 50 }, // 2x daily perfect
};

const WeeklyChallenge = () => {
  const { recordQuiz } = useStudentProgress();
  const [state, setState] = useState<QuizState>("ready");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timer, setTimer] = useState(45); // 45s for weekly (harder)
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const startChallenge = useCallback(() => {
    setQuestions(getWeeklyQuestions());
    setCurrentIdx(0); setSelected(null); setAnswers([]);
    setTimer(45); setScore(0); setEarnedXP(0); setEarnedCoins(0);
    setState("playing");
  }, []);

  useEffect(() => {
    if (state !== "playing" || selected !== null) return;
    if (timer <= 0) { handleTimeout(); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [state, timer, selected]);

  function handleTimeout() {
    const newAnswers = [...answers, null];
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[currentIdx].correctIndex;
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (correct) {
      const mult = REWARDS.difficultyBonus[questions[currentIdx].difficulty];
      setScore(s => s + 1);
      setEarnedXP(x => x + Math.round(WEEKLY_REWARDS.correctAnswer.xp * mult));
      setEarnedCoins(c => c + Math.round(WEEKLY_REWARDS.correctAnswer.coins * mult));
    }
    setTimeout(() => advance(newAnswers), 1800);
  }

  function advance(ans: (number | null)[]) {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1); setSelected(null); setTimer(45);
    } else { finishChallenge(ans); }
  }

  function finishChallenge(finalAnswers: (number | null)[]) {
    const finalScore = finalAnswers.filter((a, i) => a === questions[i]?.correctIndex).length;
    let bxp = earnedXP, bc = earnedCoins;
    if (finalScore === 10) {
      bxp += WEEKLY_REWARDS.perfectChallenge.xp;
      bc += WEEKLY_REWARDS.perfectChallenge.coins;
      setEarnedXP(bxp); setEarnedCoins(bc);
      toast.success("PERFECT Weekly Challenge! Massive bonus!");
    }
    recordQuiz(finalScore, 10, bxp, bc);
    setState("complete");
  }

  const currentQ = questions[currentIdx];
  const weekNum = getWeekNumber();

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" /> Weekly Challenge
          </h1>
          <p className="text-sm text-muted-foreground">Week #{weekNum} · 10 questions · 45s each · 1.5x rewards</p>
        </div>
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <Trophy className="mr-1 h-3 w-3" /> Up to 150 coins
        </Badge>
      </div>

      {state === "ready" && (
        <Card className="border-orange-300">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold">Weekly Challenge — Week #{weekNum}</h2>
            <p className="text-sm text-muted-foreground">10 harder questions. Same set for all students this week. Higher rewards. Can you top the board?</p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 45s per question</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3" /> 1.5x XP & Coins</span>
              <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Perfect = 2x bonus</span>
            </div>
            <Button size="lg" className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={startChallenge}>
              <Flame className="mr-2 h-4 w-4" /> Start Weekly Challenge
            </Button>
          </CardContent>
        </Card>
      )}

      {state === "playing" && currentQ && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium">Q{currentIdx + 1}/10</span>
            <Progress value={(currentIdx / 10) * 100} className="flex-1 h-2" />
            <div className={`flex items-center gap-1 text-sm font-mono font-bold ${timer <= 10 ? "text-red-600 animate-pulse" : ""}`}>
              <Clock className="h-3.5 w-3.5" /> {timer}s
            </div>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{currentQ.subject}</Badge>
                <Badge className={`text-[10px] ${currentQ.difficulty === "hard" ? "bg-red-100 text-red-800" : currentQ.difficulty === "medium" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{currentQ.difficulty}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isSel = selected === idx;
                const isCorr = idx === currentQ.correctIndex;
                const show = selected !== null;
                let cls = "w-full text-left justify-start h-auto py-3 px-4 ";
                if (show && isCorr) cls += "border-green-500 bg-green-50 text-green-800";
                else if (show && isSel && !isCorr) cls += "border-red-500 bg-red-50 text-red-800";
                return (
                  <Button key={idx} variant="outline" className={cls} onClick={() => handleAnswer(idx)} disabled={show}>
                    <span className="flex items-center gap-2 w-full">
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">{String.fromCharCode(65+idx)}</span>
                      <span className="flex-1 text-sm">{opt}</span>
                      {show && isCorr && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {show && isSel && !isCorr && <XCircle className="h-4 w-4 text-red-600" />}
                    </span>
                  </Button>
                );
              })}
              {selected !== null && (
                <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <b>Explanation:</b> {currentQ.explanation}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score: {score}/{currentIdx + (selected !== null ? 1 : 0)}</span>
            <span className="flex items-center gap-1"><Coins className="h-3 w-3 text-amber-600" /> {earnedCoins}</span>
          </div>
        </div>
      )}

      {state === "complete" && (
        <Card className="border-orange-300">
          <CardContent className="p-8 text-center space-y-4">
            <Trophy className="h-12 w-12 mx-auto text-orange-500" />
            <h2 className="text-xl font-bold">Weekly Challenge Complete!</h2>
            <div className="text-4xl font-bold text-orange-600">{score} / 10</div>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="rounded-lg border p-3 bg-purple-50 text-center">
                <Zap className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-lg font-bold text-purple-700">+{earnedXP}</p>
                <p className="text-[10px]">XP Earned</p>
              </div>
              <div className="rounded-lg border p-3 bg-amber-50 text-center">
                <Coins className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                <p className="text-lg font-bold text-amber-700">+{earnedCoins}</p>
                <p className="text-[10px]">Coins Earned</p>
              </div>
            </div>
            <Button onClick={startChallenge} className="mt-4 bg-orange-600 hover:bg-orange-700">
              <RotateCcw className="mr-2 h-4 w-4" /> Retry This Week
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyChallenge;
