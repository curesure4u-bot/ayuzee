import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Swords,
  Users,
  Clock,
  Calendar,
  Loader2,
  LogIn,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useQuizCompetitions, type QuizCompetition } from "@/hooks/useQuizCompetition";

const statusColor: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

const difficultyColor: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-800",
  Hard: "bg-red-100 text-red-800",
};

function CompetitionCard({
  comp,
  isJoined,
  onJoin,
}: {
  comp: QuizCompetition;
  isJoined: boolean;
  onJoin: (id: string) => void;
}) {
  const startsAt = new Date(comp.starts_at);
  const endsAt = new Date(comp.ends_at);
  const now = new Date();
  const isActive = comp.status === "active" || (now >= startsAt && now <= endsAt);
  const isUpcoming = comp.status === "upcoming" && now < startsAt;

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{comp.title}</h3>
              <Badge className={`text-[10px] ${statusColor[comp.status] || statusColor.upcoming}`}>
                {comp.status}
              </Badge>
              <Badge className={`text-[10px] ${difficultyColor[comp.difficulty] || ""}`}>
                {comp.difficulty}
              </Badge>
            </div>
            {comp.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comp.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" /> {comp.subject}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {Math.floor(comp.time_limit_seconds / 60)} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {comp.participant_count || 0} joined
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />{" "}
                {startsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(isActive || comp.status === "completed") && isJoined && (
              <Button size="sm" variant={comp.status === "completed" ? "outline" : "default"} asChild>
                <Link to={`/student/competitions/${comp.id}`}>
                  {comp.status === "completed" ? (
                    <>
                      <Trophy className="h-4 w-4 mr-1" /> Results
                    </>
                  ) : (
                    <>
                      <Swords className="h-4 w-4 mr-1" /> Play
                    </>
                  )}
                </Link>
              </Button>
            )}
            {isUpcoming && !isJoined && (
              <Button size="sm" onClick={() => onJoin(comp.id)}>
                <LogIn className="h-4 w-4 mr-1" /> Join
              </Button>
            )}
            {isUpcoming && isJoined && (
              <Badge variant="secondary" className="text-xs">Joined</Badge>
            )}
            {comp.status === "completed" && !isJoined && (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/student/competitions/${comp.id}`}>
                  <Trophy className="h-4 w-4 mr-1" /> Leaderboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const QuizCompetitions = () => {
  const { competitions, joinedIds, loading, joinCompetition } = useQuizCompetitions();
  const [tab, setTab] = useState("active");

  const handleJoin = async (id: string) => {
    const ok = await joinCompetition(id);
    if (ok) toast.success("Joined competition! You'll be notified when it starts.");
    else toast.error("Could not join competition");
  };

  const upcoming = competitions.filter((c) => c.status === "upcoming");
  const active = competitions.filter((c) => c.status === "active");
  const completed = competitions.filter((c) => c.status === "completed");

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="h-6 w-6 text-primary" /> Inter-College Quiz Competition
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compete against students from other colleges in timed AYUSH quizzes. Earn points for your college!
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No active competitions right now. Check upcoming for scheduled events!
              </CardContent>
            </Card>
          ) : (
            active.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} isJoined={joinedIds.includes(comp.id)} onJoin={handleJoin} />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No upcoming competitions scheduled yet.
              </CardContent>
            </Card>
          ) : (
            upcoming.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} isJoined={joinedIds.includes(comp.id)} onJoin={handleJoin} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No completed competitions yet.
              </CardContent>
            </Card>
          ) : (
            completed.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} isJoined={joinedIds.includes(comp.id)} onJoin={handleJoin} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizCompetitions;
