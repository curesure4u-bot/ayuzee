import { AchievementCenter } from "@/components/gamification/AchievementCenter";

const StudentAchievements = () => (
  <AchievementCenter
    role="student" roleName="Ayurveda Student" roleEmoji="🎓"
    userPoints={680} userCoins={120} userStreak={15}
    earnedBadgeIds={["st-scholar", "st-first-course", "st-quiz-master", "st-logbook", "st-cme"]}
    coinsToday={10} coinsWeek={55} coinsMonth={120}
    coinHistory={[
      { date: "Jul 15 · 14:00", action: "Attend CME/webinar", coins: 10, emoji: "🎓", balance: 120 },
      { date: "Jul 14 · 16:00", action: "Pass quiz (90%+)", coins: 15, emoji: "🎯", balance: 110 },
      { date: "Jul 14 · 10:00", action: "Log clinical case", coins: 5, emoji: "📋", balance: 95 },
      { date: "Jul 13 · 09:00", action: "Complete a course", coins: 30, emoji: "📖", balance: 90 },
      { date: "Jul 12 · 08:00", action: "Daily login", coins: 2, emoji: "📅", balance: 60 },
    ]}
  />
);
export default StudentAchievements;
