import { AchievementCenter } from "@/components/gamification/AchievementCenter";

const PatientAchievements = () => (
  <AchievementCenter
    role="patient" roleName="Patient" roleEmoji="👤"
    userPoints={420} userCoins={85} userStreak={8}
    earnedBadgeIds={["pt-welcome", "pt-health-card", "pt-gut-check", "pt-prakriti"]}
    coinsToday={5} coinsWeek={32} coinsMonth={85}
    coinHistory={[
      { date: "Jul 15 · 08:00", action: "Daily login", coins: 2, emoji: "📅", balance: 85 },
      { date: "Jul 15 · 07:30", action: "Log daily PROMs", coins: 3, emoji: "📝", balance: 83 },
      { date: "Jul 14 · 20:00", action: "Take medicines on time", coins: 2, emoji: "💊", balance: 80 },
      { date: "Jul 14 · 12:00", action: "Follow Pathya diet", coins: 2, emoji: "🥗", balance: 78 },
      { date: "Jul 13 · 09:00", action: "Book appointment online", coins: 5, emoji: "📱", balance: 76 },
      { date: "Jul 12 · 10:00", action: "7-day streak bonus!", coins: 25, emoji: "🔥", balance: 71 },
    ]}
  />
);
export default PatientAchievements;
