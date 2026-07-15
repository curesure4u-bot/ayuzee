import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRank } from "@/data/gamificationConfig";

type LeaderEntry = { rank: number; name: string; role: string; roleEmoji: string; points: number; badges: number; streak: number; avatar: string };

const mockLeaderboard: LeaderEntry[] = [
  { rank: 1, name: "Dr. Arun Sharma", role: "Doctor", roleEmoji: "🩺", points: 4500, badges: 12, streak: 45, avatar: "👨‍⚕️" },
  { rank: 2, name: "Suresh Therapist", role: "Therapist", roleEmoji: "💆", points: 3200, badges: 9, streak: 38, avatar: "🧑‍🦱" },
  { rank: 3, name: "Kavitha R. (Admin)", role: "HMS Staff", roleEmoji: "🏥", points: 2800, badges: 8, streak: 52, avatar: "👩" },
  { rank: 4, name: "Dr. Meena Patel", role: "Doctor", roleEmoji: "🩺", points: 2500, badges: 8, streak: 30, avatar: "👩‍⚕️" },
  { rank: 5, name: "Ayuzee Main Hospital", role: "Service Provider", roleEmoji: "🏨", points: 2100, badges: 7, streak: 45, avatar: "🏥" },
  { rank: 6, name: "Ramesh Kumar", role: "Patient", roleEmoji: "👤", points: 1850, badges: 5, streak: 12, avatar: "👨" },
  { rank: 7, name: "Priya Therapist", role: "Therapist", roleEmoji: "💆", points: 1600, badges: 6, streak: 28, avatar: "👩" },
  { rank: 8, name: "Kottakkal AVS", role: "Pharma", roleEmoji: "📦", points: 1400, badges: 5, streak: 25, avatar: "🏭" },
  { rank: 9, name: "Dr. Priya Das", role: "Doctor", roleEmoji: "🩺", points: 1200, badges: 5, streak: 20, avatar: "👩‍⚕️" },
  { rank: 10, name: "Dr. Rahul (PG-2)", role: "Student", roleEmoji: "🎓", points: 1100, badges: 6, streak: 35, avatar: "👨‍🎓" },
];

const UnifiedLeaderboard = () => {
  const [period, setPeriod] = useState("month");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = roleFilter === "all" ? mockLeaderboard : mockLeaderboard.filter(l => l.role.toLowerCase().includes(roleFilter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">🏆 Ayuzee Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top achievers across all roles · Weekly / Monthly / All-time</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="week">This Week</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="all">All Time</SelectItem></SelectContent></Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="doctor">🩺 Doctors</SelectItem><SelectItem value="patient">👤 Patients</SelectItem><SelectItem value="therapist">💆 Therapists</SelectItem><SelectItem value="student">🎓 Students</SelectItem><SelectItem value="service">🏨 Venues</SelectItem><SelectItem value="pharma">📦 Pharma</SelectItem><SelectItem value="hms">🏥 HMS Staff</SelectItem></SelectContent></Select>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.slice(0, 3).map((entry, i) => (
          <Card key={entry.rank} className={`text-center ${i === 0 ? "bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-300 ring-2 ring-amber-200" : i === 1 ? "bg-gradient-to-b from-slate-50 to-gray-50 border-slate-300" : "bg-gradient-to-b from-orange-50 to-amber-50 border-orange-200"}`}>
            <CardContent className="p-4">
              <p className="text-3xl mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</p>
              <p className="text-2xl">{entry.avatar}</p>
              <p className="font-bold text-sm mt-2">{entry.name}</p>
              <Badge variant="outline" className="text-[10px] mt-1">{entry.roleEmoji} {entry.role}</Badge>
              <p className="text-lg font-bold mt-2 text-amber-700">{entry.points} pts</p>
              <div className="flex justify-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span>🏅{entry.badges}</span>
                <span>🔥{entry.streak}d</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Rank</th>
                <th className="px-3 py-2 text-left font-medium">Points</th>
                <th className="px-3 py-2 text-left font-medium">Badges</th>
                <th className="px-3 py-2 text-left font-medium">Streak</th>
              </tr></thead>
              <tbody>
                {filtered.map((entry) => {
                  const rank = getRank(entry.points);
                  return (
                    <tr key={entry.rank} className={`border-b hover:bg-muted/30 ${entry.rank <= 3 ? "bg-amber-50/30" : ""}`}>
                      <td className="px-3 py-2 font-bold">{entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank-1] : entry.rank}</td>
                      <td className="px-3 py-2"><div className="flex items-center gap-2"><span className="text-xl">{entry.avatar}</span><span className="font-medium">{entry.name}</span></div></td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{entry.roleEmoji} {entry.role}</Badge></td>
                      <td className="px-3 py-2"><span>{rank?.emoji} {rank?.name}</span></td>
                      <td className="px-3 py-2 font-bold text-amber-700">{entry.points}</td>
                      <td className="px-3 py-2">🏅 {entry.badges}</td>
                      <td className="px-3 py-2">🔥 {entry.streak}d</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLeaderboard;
