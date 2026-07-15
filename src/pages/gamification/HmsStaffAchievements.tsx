import { AchievementCenter } from "@/components/gamification/AchievementCenter";

const HmsStaffAchievements = () => (
  <AchievementCenter
    role="hms_staff" roleName="HMS Staff" roleEmoji="🏥"
    userPoints={750} userCoins={110} userStreak={20}
    earnedBadgeIds={["hms-ready", "hms-first-patient", "hms-daily-active", "hms-data-champ", "hms-billing-ace", "hms-ai-user"]}
    coinsToday={9} coinsWeek={42} coinsMonth={110}
    coinHistory={[
      { date: "Jul 15 · 10:00", action: "Push record to ABDM", coins: 3, emoji: "🔗", balance: 110 },
      { date: "Jul 15 · 09:30", action: "Generate bill (accurate)", coins: 2, emoji: "🧾", balance: 107 },
      { date: "Jul 15 · 09:00", action: "Register patient", coins: 1, emoji: "📝", balance: 105 },
      { date: "Jul 15 · 08:45", action: "Use AI feature", coins: 2, emoji: "🤖", balance: 104 },
      { date: "Jul 14 · 17:00", action: "Complete shift without issue", coins: 5, emoji: "✅", balance: 102 },
      { date: "Jul 14 · 09:00", action: "Daily login", coins: 2, emoji: "📅", balance: 97 },
    ]}
  />
);
export default HmsStaffAchievements;
