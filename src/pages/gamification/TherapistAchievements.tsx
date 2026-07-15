import { AchievementCenter } from "@/components/gamification/AchievementCenter";

const TherapistAchievements = () => (
  <AchievementCenter
    role="therapist" roleName="Panchakarma Therapist" roleEmoji="💆"
    userPoints={1200} userCoins={180} userStreak={22}
    earnedBadgeIds={["th-ready", "th-10-sessions", "th-100-sessions", "th-punctual", "th-shirodhara", "th-zero-incidents"]}
    coinsToday={12} coinsWeek={65} coinsMonth={180}
    coinHistory={[
      { date: "Jul 15 · 12:00", action: "Complete therapy session", coins: 3, emoji: "💆", balance: 180 },
      { date: "Jul 15 · 11:00", action: "Patient improvement recorded", coins: 10, emoji: "📈", balance: 177 },
      { date: "Jul 15 · 09:00", action: "On-time for session", coins: 1, emoji: "⏰", balance: 167 },
      { date: "Jul 14 · 17:00", action: "Zero adverse events (week)", coins: 15, emoji: "🛡️", balance: 166 },
      { date: "Jul 14 · 09:00", action: "Complete therapy session", coins: 3, emoji: "💆", balance: 151 },
    ]}
  />
);
export default TherapistAchievements;
