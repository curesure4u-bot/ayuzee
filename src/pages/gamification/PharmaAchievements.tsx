import { AchievementCenter } from "@/components/gamification/AchievementCenter";

const PharmaAchievements = () => (
  <AchievementCenter
    role="pharma" roleName="Pharma / Manufacturer" roleEmoji="📦"
    userPoints={950} userCoins={150} userStreak={18}
    earnedBadgeIds={["ph-first-product", "ph-50-products", "ph-first-sale", "ph-fast-shipper", "ph-5-states"]}
    coinsToday={8} coinsWeek={48} coinsMonth={150}
    coinHistory={[
      { date: "Jul 15 · 11:00", action: "Ship within 24 hours", coins: 5, emoji: "🚚", balance: 150 },
      { date: "Jul 15 · 09:00", action: "Receive order", coins: 3, emoji: "🛒", balance: 145 },
      { date: "Jul 14 · 15:00", action: "Doctor recommends product", coins: 10, emoji: "👨‍⚕️", balance: 142 },
      { date: "Jul 14 · 10:00", action: "List new product", coins: 5, emoji: "📦", balance: 132 },
      { date: "Jul 13 · 12:00", action: "Receive order", coins: 3, emoji: "🛒", balance: 127 },
    ]}
  />
);
export default PharmaAchievements;
