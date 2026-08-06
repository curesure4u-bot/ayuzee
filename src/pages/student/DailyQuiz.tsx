import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Clock, Trophy, Coins, Zap, CheckCircle2, XCircle,
  ChevronRight, RotateCcw, Star
} from "lucide-react";
import { toast } from "sonner";
import { getDailyQuiz, REWARDS, getLevel, type QuizQuestion } from "@/data/ayushQuizBank";
import { useStudentProgress } from "@/hooks/useStudentProgress";

type QuizState = "ready" | "playing" | "review" | "complete";

const DailyQuiz = () => {
  const { progress, loading: progressLoading, recordQuiz } = useStudentProgress();
  const [state, setState] = useState<QuizState>("ready");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  // Load daily questions
  const startQuiz = useCallback(() => {
    const qs = getDailyQuiz(5);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelected(null);
    setAnswers([]);
    setTimer(30);
    setScore(0);
    setEarnedXP(0);
    setEarnedCoins(0);
    setState("playing");
  }, []);

  // Timer countdown
  useEffect(() => {
    if (state !== "playing" || selected !== null) return;
    if (timer <= 0) { handleTimeout(); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [state, timer, selected]);

  function handleTimeout() {
    setAnswers(prev => [...prev, null]);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setTimer(30);
    } else {
      finishQuiz([...answers, null]);
    }
  }

  function handleAnswer(optionIdx: number) {
    if (selected !== null) return;
    setSelected(optionIdx);
    const correct = optionIdx === questions[currentIdx].correctIndex;
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (correct) {
      const diff = questions[currentIdx].difficulty;
      const multiplier = REWARDS.difficultyBonus[diff];
      const xp = Math.round(REWARDS.correctAnswer.xp * multiplier);
      const coins = Math.round(REWARDS.correctAnswer.coins * multiplier);
      setScore(s => s + 1);
      setEarnedXP(x => x + xp);
      setEarnedCoins(c => c + coins);
    }

    // Auto-advance after 2s
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelected(null);
        setTimer(30);
      } else {
        finishQuiz(newAnswers);
      }
    }, 2000);
  }

  function finishQuiz(finalAnswers: (number | null)[]) {
    const finalScore = finalAnswers.filter((a, i) => a === questions[i]?.correctIndex).length;
    let bonusXP = 0;
    let bonusCoins = 0;
    // Perfect quiz bonus
    if (finalScore === questions.length) {
      bonusXP = REWARDS.perfectQuiz.xp;
      bonusCoins = REWARDS.perfectQuiz.coins;
      setEarnedXP(x => x + bonusXP);
      setEarnedCoins(c => c + bonusCoins);
      toast.success("Perfect Score! Bonus XP & Coins earned!");
    }
    // Persist to Supabase
    const totalXP = earnedXP + bonusXP;
    const totalCoins = earnedCoins + bonusCoins;
    recordQuiz(finalScore, questions.length, totalXP, totalCoins);
    setState("complete");
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Daily Quiz Challenge
          </h1>
          <p className="text-sm text-muted-foreground">5 questions · 30 seconds each · Earn XP & Coins</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
          <Coins className="mr-1 h-3 w-3" /> Earn up to 75 coins
        </Badge>
      </div>

      {/* READY STATE */}
      {state === "ready" && (
        <Card className="border-primary/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Ready for today's challenge?</h2>
            <p className="text-sm text-muted-foreground">
              Answer 5 MCQs from AYUSH subjects. Earn XP to level up and Coins convertible to Ayuzee Money.
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 30s per question</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Difficulty bonus</span>
              <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Perfect = 2x bonus</span>
            </div>
            <Button size="lg" onClick={startQuiz} className="mt-4">
              <Zap className="mr-2 h-4 w-4" /> Start Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PLAYING STATE */}
      {state === "playing" && currentQ && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Q{currentIdx + 1}/5</span>
            <Progress value={(currentIdx / questions.length) * 100} className="flex-1 h-2" />
            <div className={`flex items-center gap-1 text-sm font-mono font-bold ${timer <= 10 ? "text-red-600 animate-pulse" : "text-muted-foreground"}`}>
              <Clock className="h-3.5 w-3.5" /> {timer}s
            </div>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{currentQ.subject}</Badge>
                <Badge className={`text-[10px] ${currentQ.difficulty === "easy" ? "bg-green-100 text-green-800" : currentQ.difficulty === "medium" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                  {currentQ.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showResult = selected !== null;
                let btnClass = "w-full text-left justify-start h-auto py-3 px-4 ";
                if (showResult && isCorrect) btnClass += "border-green-500 bg-green-50 text-green-800";
                else if (showResult && isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 text-red-800";
                else if (!showResult) btnClass += "hover:border-primary/50 hover:bg-primary/5";

                return (
                  <Button key={idx} variant="outline" className={btnClass}
                    onClick={() => handleAnswer(idx)} disabled={selected !== null}>
                    <span className="flex items-center gap-2 w-full">
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 text-sm">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                    </span>
                  </Button>
                );
              })}

              {/* Explanation after answer */}
              {selected !== null && (
                <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <b>Explanation:</b> {currentQ.explanation}
                  {currentQ.reference && <span className="text-blue-600 ml-1">({currentQ.reference})</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score tracker */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score: {score}/{currentIdx + (selected !== null ? 1 : 0)}</span>
            <span className="flex items-center gap-1"><Coins className="h-3 w-3 text-amber-600" /> {earnedCoins} coins</span>
          </div>
        </div>
      )}

      {/* COMPLETE STATE */}
      {state === "complete" && (
        <Card className="border-primary/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Quiz Complete!</h2>
            <div className="text-4xl font-bold text-primary">{score} / {questions.length}</div>
            <p className="text-sm text-muted-foreground">
              {score === questions.length ? "Perfect! You're amazing! 🎉" :
               score >= 4 ? "Excellent work! Almost perfect! 🌟" :
               score >= 3 ? "Good job! Keep learning! 👍" :
               score >= 2 ? "Not bad! Review the explanations 📚" :
               "Keep practicing! You'll improve! 💪"}
            </p>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="rounded-lg border p-3 text-center bg-purple-50">
                <Zap className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-lg font-bold text-purple-700">+{earnedXP}</p>
                <p className="text-[10px] text-purple-600">XP Earned</p>
              </div>
              <div className="rounded-lg border p-3 text-center bg-amber-50">
                <Coins className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                <p className="text-lg font-bold text-amber-700">+{earnedCoins}</p>
                <p className="text-[10px] text-amber-600">Coins Earned</p>
              </div>
            </div>

            {/* Review answers */}
            <div className="text-left space-y-2 mt-4">
              <h3 className="font-semibold text-sm">Review:</h3>
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const correct = userAnswer === q.correctIndex;
                return (
                  <div key={i} className={`text-xs p-2 rounded border ${correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <div className="flex items-start gap-2">
                      {correct ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5" /> : <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5" />}
                      <div>
                        <p className="font-medium">{q.question}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Correct: {q.options[q.correctIndex]}
                          {!correct && userAnswer !== null && <span className="text-red-600"> · Your answer: {q.options[userAnswer]}</span>}
                          {userAnswer === null && <span className="text-amber-600"> · Time out</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={startQuiz} className="mt-4">
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyQuiz;
