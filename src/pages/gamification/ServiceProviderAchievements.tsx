import { AchievementCenter } from "@/components/gamification/AchievementCenter";

const ServiceProviderAchievements = () => (
  <AchievementCenter
    role="service_provider" roleName="Hospital / Venue" roleEmoji="🏨"
    userPoints={2100} userCoins={320} userStreak={45}
    earnedBadgeIds={["sp-listed", "sp-rooms", "sp-first-booking", "sp-50-bookings", "sp-responder", "sp-international", "sp-1year"]}
    coinsToday={20} coinsWeek={95} coinsMonth={320}
    coinHistory={[
      { date: "Jul 15 · 10:00", action: "International guest hosted", coins: 20, emoji: "🌍", balance: 320 },
      { date: "Jul 15 · 09:00", action: "Receive booking", coins: 5, emoji: "🏨", balance: 300 },
      { date: "Jul 14 · 14:00", action: "5-star venue review", coins: 15, emoji: "🌟", balance: 295 },
      { date: "Jul 14 · 08:30", action: "Reply to enquiry within 1hr", coins: 5, emoji: "⚡", balance: 280 },
      { date: "Jul 13 · 12:00", action: "Receive booking", coins: 5, emoji: "🏨", balance: 275 },
    ]}
  />
);
export default ServiceProviderAchievements;
