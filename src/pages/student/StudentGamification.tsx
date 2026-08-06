import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Zap, Coins, Trophy, Flame, Star, TrendingUp, Medal,
  Brain, Target, Calendar, Gift, Users, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LEVELS, getLevel, QUIZ_SUBJECTS } from "@/data/ayushQuizBank";
import { useStudentProgress } from "@/hooks/useStudentProgress";
import { supabase } from "@/integrations/supabase/client";

// Mock student data (in production this would come from Supabase)
const MOCK_STUDENT = {
  name: "Ayuzee Student",
  college: "Govt. Ayurveda College",
  year: "3rd BAMS",
  xp: 450,
  coins: 185,
  streak: 7,
  quizzesCompleted: 23,
  correctAnswers: 89,
  totalAnswers: 115,
  rank: 42,
  totalStudents: 1250,
};

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Dr. Priya S.", college: "VPSV Ayurveda, Kottakkal", xp: 2450, streak: 30 },
  { rank: 2, name: "Arun K.", college: "SDM Ayurveda, Udupi", xp: 2100, streak: 25 },
  { rank: 3, name: "Meera R.", college: "Govt. Ayurveda, Trivandrum", xp: 1890, streak: 22 },
  { rank: 4, name: "Rahul M.", college: "BHU Ayurveda, Varanasi", xp: 1750, streak: 18 },
  { rank: 5, name: "Sneha J.", college: "NIA, Jaipur", xp: 1600, streak: 15 },
  { rank: 6, name: "Karthik P.", college: "Govt. Ayurveda, Chennai", xp: 1450, streak: 14 },
  { rank: 7, name: "Anjali D.", college: "IPGT&RA, Jamnagar", xp: 1320, streak: 12 },
  { rank: 8, name: "Vishnu N.", college: "Amrita Ayurveda, Kollam", xp: 1200, streak: 11 },
  { rank: 9, name: "Divya S.", college: "SDM Ayurveda, Hassan", xp: 1100, streak: 10 },
  { rank: 10, name: "Ajay T.", college: "Govt. Ayurveda, Nagpur", xp: 980, streak: 9 },
];

const DAILY_ACTIVITIES = [
  { label: "Daily Quiz", xp: "+50 XP", coins: "+25", icon: Brain, done: false, link: "/learning/daily-quiz" },
  { label: "Login Streak (Day 7)", xp: "+20 XP", coins: "+10", icon: Flame, done: true, link: "" },
  { label: "Read Article", xp: "+10 XP", coins: "+5", icon: Target, done: false, link: "/learning/blogs" },
  { label: "Community Answer", xp: "+15 XP", coins: "+10", icon: Users, done: false, link: "/community" },
];

const StudentGamification = () => {
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useStudentProgress();
  const [leaderboard, setLeaderboard] = useState<{ rank: number; name: string; college: string; xp: number; streak: number }[]>([]);

  // Fetch real leaderboard from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("student_quiz_progress")
          .select("user_id, xp, streak, student_profiles(full_name, college_name)")
          .order("xp", { ascending: false })
          .limit(10);
        if (data && data.length > 0) {
          setLeaderboard(data.map((row: any, idx: number) => ({
            rank: idx + 1,
            name: row.student_profiles?.full_name || `Student ${idx + 1}`,
            college: row.student_profiles?.college_name || "AYUSH College",
            xp: row.xp || 0,
            streak: row.streak || 0,
          })));
        } else {
          // Fallback to sample data if no real data yet
          setLeaderboard([
            { rank: 1, name: "Dr. Priya S.", college: "VPSV Ayurveda, Kottakkal", xp: 2450, streak: 30 },
            { rank: 2, name: "Arun K.", college: "SDM Ayurveda, Udupi", xp: 2100, streak: 25 },
            { rank: 3, name: "Meera R.", college: "Govt. Ayurveda, Trivandrum", xp: 1890, streak: 22 },
            { rank: 4, name: "Rahul M.", college: "BHU Ayurveda, Varanasi", xp: 1750, streak: 18 },
            { rank: 5, name: "Sneha J.", college: "NIA, Jaipur", xp: 1600, streak: 15 },
            { rank: 6, name: "Karthik P.", college: "Govt. Ayurveda, Chennai", xp: 1450, streak: 14 },
            { rank: 7, name: "Anjali D.", college: "IPGT&RA, Jamnagar", xp: 1320, streak: 12 },
            { rank: 8, name: "Vishnu N.", college: "Amrita Ayurveda, Kollam", xp: 1200, streak: 11 },
            { rank: 9, name: "Divya S.", college: "SDM Ayurveda, Hassan", xp: 1100, streak: 10 },
            { rank: 10, name: "Ajay T.", college: "Govt. Ayurveda, Nagpur", xp: 980, streak: 9 },
          ]);
        }
      } catch {
        // Fallback silently
        setLeaderboard([
          { rank: 1, name: "Be the first!", college: "Take a quiz to appear here", xp: 0, streak: 0 },
        ]);
      }
    })();
  }, []);

  // Use real data if available, otherwise mock
  const student = progress ? {
    name: "Ayuzee Student",
    college: "Your College",
    year: "AYUSH",
    xp: progress.xp,
    coins: progress.coins,
    streak: progress.streak,
    quizzesCompleted: progress.quizzes_completed,
    correctAnswers: progress.correct_answers,
    totalAnswers: progress.total_answers,
    rank: 42,
    totalStudents: 1250,
  } : MOCK_STUDENT;

  const level = getLevel(student.xp);
  const nextLevel = LEVELS.find(l => l.xpRequired > student.xp) || LEVELS[LEVELS.length - 1];
  const progressToNext = nextLevel.xpRequired > level.xpRequired
    ? ((student.xp - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100
    : 100;

  if (progressLoading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> My Progress
          </h1>
          <p className="text-sm text-muted-foreground">Earn XP & Coins · Level up · Compete with peers</p>
        </div>
        <Button onClick={() => navigate("/learning/daily-quiz")}>
          <Brain className="mr-2 h-4 w-4" /> Take Daily Quiz
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto text-purple-600 mb-1" />
            <p className="text-2xl font-bold text-purple-700">{student.xp}</p>
            <p className="text-[10px] text-purple-600">Total XP</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 text-center">
            <Coins className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-700">{student.coins}</p>
            <p className="text-[10px] text-amber-600">Ayuzee Coins</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto text-orange-600 mb-1" />
            <p className="text-2xl font-bold text-orange-700">{student.streak}</p>
            <p className="text-[10px] text-orange-600">Day Streak 🔥</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-700">#{student.rank}</p>
            <p className="text-[10px] text-green-600">All India Rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Level {level.level}: {level.title}</p>
                <p className="text-[10px] text-muted-foreground">{student.xp} / {nextLevel.xpRequired} XP to next level</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary">{nextLevel.title} →</Badge>
          </div>
          <Progress value={progressToNext} className="h-3" />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{level.title}</span>
            <span>{nextLevel.title} ({nextLevel.xpRequired} XP)</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily Activities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Today's Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DAILY_ACTIVITIES.map((act, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded border ${act.done ? "bg-green-50 border-green-200" : "hover:bg-muted/50 cursor-pointer"}`}
                onClick={() => !act.done && act.link && navigate(act.link)}>
                <div className="flex items-center gap-2">
                  <act.icon className={`h-4 w-4 ${act.done ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${act.done ? "line-through text-muted-foreground" : ""}`}>{act.label}</span>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <Badge variant="outline" className="text-purple-600">{act.xp}</Badge>
                  <Badge variant="outline" className="text-amber-600">{act.coins}</Badge>
                  {act.done && <Badge className="bg-green-600 text-white text-[9px]">Done</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coins Economy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4" /> Ayuzee Coins Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded border p-3 bg-amber-50/50">
              <p className="font-bold text-amber-800 text-lg">{student.coins} Coins</p>
              <p className="text-[10px] text-amber-700">= ₹{(student.coins / 10).toFixed(0)} Ayuzee Money</p>
            </div>
            <p className="text-xs text-muted-foreground">100 coins = ₹10 Ayuzee Money. Redeem for courses, products, or consultations.</p>
            <div className="text-xs space-y-1">
              <p className="font-medium">How to earn:</p>
              <p>• Daily Quiz: 25-75 coins/day</p>
              <p>• Complete Course: 100 coins</p>
              <p>• Write Case Study: 50 coins</p>
              <p>• Refer Friend: 30 coins</p>
              <p>• 7-day Streak Bonus: 50 coins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Medal className="h-4 w-4 text-amber-500" /> All India Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">College</th>
                  <th className="text-right p-2">XP</th>
                  <th className="text-right p-2">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      {entry.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold ${entry.rank === 1 ? "bg-amber-500" : entry.rank === 2 ? "bg-gray-400" : "bg-amber-700"}`}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="p-2 font-medium">{entry.name}</td>
                    <td className="p-2 text-muted-foreground">{entry.college}</td>
                    <td className="p-2 text-right font-mono text-purple-700">{entry.xp}</td>
                    <td className="p-2 text-right">
                      <span className="text-orange-600">{entry.streak}🔥</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
            <span>Your rank: <b>#{student.rank}</b> of {student.totalStudents} students</span>
            <span className="text-muted-foreground">Keep quizzing to climb! 🚀</span>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" /> Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold">{student.quizzesCompleted}</p>
              <p className="text-[10px] text-muted-foreground">Quizzes Done</p>
            </div>
            <div>
              <p className="text-xl font-bold">{Math.round((student.correctAnswers / student.totalAnswers) * 100)}%</p>
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <p className="text-xl font-bold">{student.correctAnswers}/{student.totalAnswers}</p>
              <p className="text-[10px] text-muted-foreground">Correct Answers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGamification;
