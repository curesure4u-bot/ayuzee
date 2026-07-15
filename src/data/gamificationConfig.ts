// 🎮 Ayuzee Gamification Engine Configuration
// Ayuzee Coins system shared across all 7 roles: Doctor, Patient, Student, Therapist, Service Provider, Pharma, HMS Staff

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type RoleType = "doctor" | "patient" | "student" | "therapist" | "service_provider" | "pharma" | "hms_staff";
export type BadgeCategory = "onboarding" | "consistency" | "quality" | "growth" | "milestones" | "teamwork" | "clinical" | "sales" | "attendance" | "engagement" | "learning" | "skills";

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  points: number;
  rarity: BadgeRarity;
  category: BadgeCategory;
  role: RoleType;
  condition: string;
};

export type Rank = {
  name: string;
  emoji: string;
  minPoints: number;
  color: string;
};

export type CoinRule = {
  action: string;
  coins: number;
  role: RoleType | "all";
  emoji: string;
};

// 🏆 RANK TIERS (shared across all roles)
export const RANKS: Rank[] = [
  { name: "Beginner", emoji: "🌱", minPoints: 0, color: "text-slate-500" },
  { name: "Practitioner", emoji: "🌿", minPoints: 100, color: "text-green-600" },
  { name: "Expert", emoji: "⭐", minPoints: 500, color: "text-blue-600" },
  { name: "Master", emoji: "🏅", minPoints: 1500, color: "text-purple-600" },
  { name: "Champion", emoji: "🏆", minPoints: 3000, color: "text-amber-600" },
  { name: "Legend", emoji: "👑", minPoints: 7500, color: "text-yellow-500" },
  { name: "Immortal", emoji: "💎", minPoints: 15000, color: "text-pink-600" },
];

// 💰 COIN EARNING RULES
export const COIN_RULES: CoinRule[] = [
  // All roles
  { action: "Complete profile", coins: 15, role: "all", emoji: "✅" },
  { action: "Daily login", coins: 2, role: "all", emoji: "📅" },
  { action: "7-day streak", coins: 25, role: "all", emoji: "🔥" },
  { action: "30-day streak", coins: 100, role: "all", emoji: "⚡" },
  { action: "Refer a friend (converted)", coins: 50, role: "all", emoji: "🤝" },
  { action: "Leave a review", coins: 10, role: "all", emoji: "⭐" },
  { action: "Post Google review", coins: 25, role: "all", emoji: "🌐" },
  // Doctor specific
  { action: "Complete consultation", coins: 5, role: "doctor", emoji: "🩺" },
  { action: "Use AI Scribe", coins: 3, role: "doctor", emoji: "🤖" },
  { action: "Write e-prescription", coins: 2, role: "doctor", emoji: "📋" },
  { action: "Panchakarma course completed (patient)", coins: 20, role: "doctor", emoji: "✨" },
  { action: "Patient gives 5-star", coins: 10, role: "doctor", emoji: "⭐" },
  { action: "Teleconsultation completed", coins: 8, role: "doctor", emoji: "📹" },
  { action: "Publish research paper", coins: 100, role: "doctor", emoji: "📚" },
  // Patient specific
  { action: "Complete Gut Health assessment", coins: 20, role: "patient", emoji: "🫁" },
  { action: "Complete Prakriti assessment", coins: 30, role: "patient", emoji: "🧬" },
  { action: "Log daily PROMs", coins: 3, role: "patient", emoji: "📝" },
  { action: "Take medicines on time (day)", coins: 2, role: "patient", emoji: "💊" },
  { action: "Follow Pathya diet (day)", coins: 2, role: "patient", emoji: "🥗" },
  { action: "Complete Panchakarma course", coins: 100, role: "patient", emoji: "🌟" },
  { action: "Book appointment online", coins: 5, role: "patient", emoji: "📱" },
  // Student specific
  { action: "Complete a course", coins: 30, role: "student", emoji: "📖" },
  { action: "Pass quiz (90%+)", coins: 15, role: "student", emoji: "🎯" },
  { action: "Log clinical case", coins: 5, role: "student", emoji: "📋" },
  { action: "Attend CME/webinar", coins: 10, role: "student", emoji: "🎓" },
  { action: "Submit research paper", coins: 50, role: "student", emoji: "📄" },
  // Therapist specific
  { action: "Complete therapy session", coins: 3, role: "therapist", emoji: "💆" },
  { action: "Patient improvement recorded", coins: 10, role: "therapist", emoji: "📈" },
  { action: "Zero adverse events (week)", coins: 15, role: "therapist", emoji: "🛡️" },
  { action: "On-time for session", coins: 1, role: "therapist", emoji: "⏰" },
  // Service Provider specific
  { action: "Receive booking", coins: 5, role: "service_provider", emoji: "🏨" },
  { action: "International guest hosted", coins: 20, role: "service_provider", emoji: "🌍" },
  { action: "Reply to enquiry within 1hr", coins: 5, role: "service_provider", emoji: "⚡" },
  { action: "5-star venue review", coins: 15, role: "service_provider", emoji: "🌟" },
  // Pharma specific
  { action: "List new product", coins: 5, role: "pharma", emoji: "📦" },
  { action: "Receive order", coins: 3, role: "pharma", emoji: "🛒" },
  { action: "Ship within 24 hours", coins: 5, role: "pharma", emoji: "🚚" },
  { action: "Doctor recommends product", coins: 10, role: "pharma", emoji: "👨‍⚕️" },
  // HMS Staff specific
  { action: "Register patient", coins: 1, role: "hms_staff", emoji: "📝" },
  { action: "Generate bill (accurate)", coins: 2, role: "hms_staff", emoji: "🧾" },
  { action: "Push record to ABDM", coins: 3, role: "hms_staff", emoji: "🔗" },
  { action: "Use AI feature", coins: 2, role: "hms_staff", emoji: "🤖" },
  { action: "Complete shift without issue", coins: 5, role: "hms_staff", emoji: "✅" },
];


// 🏅 ALL BADGES BY ROLE
export const BADGES: Badge[] = [
  // ===== 🩺 DOCTOR BADGES =====
  { id: "dr-first-steps", name: "First Steps", emoji: "👣", description: "Complete your doctor profile", points: 10, rarity: "common", category: "onboarding", role: "doctor", condition: "profile_complete" },
  { id: "dr-first-rx", name: "First Prescription", emoji: "📋", description: "Write your first e-prescription", points: 50, rarity: "common", category: "onboarding", role: "doctor", condition: "prescriptions >= 1" },
  { id: "dr-ai-adopter", name: "AI Adopter", emoji: "🤖", description: "Use AI Scribe 20 times", points: 200, rarity: "rare", category: "clinical", role: "doctor", condition: "ai_scribe_uses >= 20" },
  { id: "dr-week-warrior", name: "Week Warrior", emoji: "🔥", description: "Login 7 consecutive days", points: 100, rarity: "rare", category: "consistency", role: "doctor", condition: "streak >= 7" },
  { id: "dr-month-master", name: "Month Master", emoji: "⚡", description: "Active 30 consecutive days", points: 500, rarity: "epic", category: "consistency", role: "doctor", condition: "streak >= 30" },
  { id: "dr-100-consults", name: "Centurion", emoji: "💯", description: "Complete 100 consultations", points: 500, rarity: "epic", category: "milestones", role: "doctor", condition: "consultations >= 100" },
  { id: "dr-pk-expert", name: "Panchakarma Expert", emoji: "✨", description: "Complete 50 Panchakarma patient courses", points: 1000, rarity: "epic", category: "clinical", role: "doctor", condition: "pk_courses >= 50" },
  { id: "dr-5star", name: "5-Star Doctor", emoji: "⭐", description: "Maintain 4.8+ rating for 3 months", points: 1000, rarity: "epic", category: "quality", role: "doctor", condition: "rating >= 4.8 for 90 days" },
  { id: "dr-teleconsult-pro", name: "Teleconsult Pro", emoji: "📹", description: "Complete 25 teleconsultations", points: 300, rarity: "rare", category: "growth", role: "doctor", condition: "teleconsults >= 25" },
  { id: "dr-zero-complaints", name: "Zero Complaints", emoji: "🛡️", description: "No complaints for 3 months", points: 500, rarity: "epic", category: "quality", role: "doctor", condition: "complaints == 0 for 90 days" },
  { id: "dr-referral-champ", name: "Referral Champion", emoji: "🤝", description: "Refer 10 patients who visit", points: 500, rarity: "rare", category: "growth", role: "doctor", condition: "referrals_converted >= 10" },
  { id: "dr-mentor", name: "Mentor", emoji: "🎓", description: "Guide 5 junior doctors/students", points: 500, rarity: "rare", category: "teamwork", role: "doctor", condition: "mentees >= 5" },
  { id: "dr-1000-patients", name: "1000 Lives Touched", emoji: "❤️", description: "Treat 1000 unique patients", points: 5000, rarity: "legendary", category: "milestones", role: "doctor", condition: "unique_patients >= 1000" },
  { id: "dr-1year", name: "1 Year with Ayuzee", emoji: "🎂", description: "Complete 1 year on the platform", points: 2000, rarity: "epic", category: "milestones", role: "doctor", condition: "tenure >= 365 days" },
  { id: "dr-ayush-champion", name: "AYUSH Champion", emoji: "👑", description: "Top doctor of the year", points: 10000, rarity: "legendary", category: "milestones", role: "doctor", condition: "annual_top_doctor" },
  { id: "dr-researcher", name: "Published Researcher", emoji: "📚", description: "Publish a research paper", points: 1000, rarity: "epic", category: "growth", role: "doctor", condition: "publications >= 1" },

  // ===== 👤 PATIENT BADGES =====
  { id: "pt-welcome", name: "Welcome Aboard", emoji: "🎉", description: "Create your Ayuzee account", points: 20, rarity: "common", category: "onboarding", role: "patient", condition: "account_created" },
  { id: "pt-health-card", name: "Health Card Ready", emoji: "💳", description: "Complete health profile + ABHA", points: 40, rarity: "common", category: "onboarding", role: "patient", condition: "profile_complete && abha_linked" },
  { id: "pt-gut-check", name: "Gut Check Done", emoji: "🫁", description: "Complete Gut Health Assessment", points: 50, rarity: "common", category: "engagement", role: "patient", condition: "gut_health_done" },
  { id: "pt-prakriti", name: "Know Thy Prakriti", emoji: "🧬", description: "Complete Prakriti assessment", points: 100, rarity: "rare", category: "engagement", role: "patient", condition: "prakriti_done" },
  { id: "pt-med-champ", name: "Medicine Champion", emoji: "💊", description: "7-day medicine adherence streak", points: 100, rarity: "rare", category: "consistency", role: "patient", condition: "medicine_streak >= 7" },
  { id: "pt-pathya", name: "Pathya Follower", emoji: "🥗", description: "Follow diet plan 14 days", points: 100, rarity: "rare", category: "consistency", role: "patient", condition: "diet_streak >= 14" },
  { id: "pt-daily-logger", name: "Daily Logger", emoji: "📝", description: "Log PROMs 30 consecutive days", points: 200, rarity: "epic", category: "consistency", role: "patient", condition: "prom_streak >= 30" },
  { id: "pt-reviewer", name: "Helpful Reviewer", emoji: "✍️", description: "Leave 5 reviews", points: 100, rarity: "rare", category: "engagement", role: "patient", condition: "reviews >= 5" },
  { id: "pt-google", name: "Google Advocate", emoji: "🌐", description: "Post a Google review", points: 200, rarity: "rare", category: "engagement", role: "patient", condition: "google_review_posted" },
  { id: "pt-friend-bringer", name: "Friend Bringer", emoji: "👫", description: "Refer 3 friends who visit", points: 300, rarity: "rare", category: "growth", role: "patient", condition: "referrals >= 3" },
  { id: "pt-pk-complete", name: "Panchakarma Graduate", emoji: "🌟", description: "Complete a full Panchakarma course", points: 500, rarity: "epic", category: "milestones", role: "patient", condition: "pk_completed" },
  { id: "pt-1year", name: "Wellness Warrior", emoji: "🏆", description: "Active health management for 1 year", points: 1000, rarity: "epic", category: "milestones", role: "patient", condition: "tenure >= 365" },
  { id: "pt-transformation", name: "Transformation", emoji: "🦋", description: "Document major health improvement (VAS 50%↓)", points: 5000, rarity: "legendary", category: "milestones", role: "patient", condition: "vas_improvement >= 50%" },

  // ===== 🎓 STUDENT BADGES =====
  { id: "st-scholar", name: "Scholar Begins", emoji: "📖", description: "Join the student portal", points: 10, rarity: "common", category: "onboarding", role: "student", condition: "joined_student_portal" },
  { id: "st-first-course", name: "First Course", emoji: "🎯", description: "Complete any course", points: 100, rarity: "common", category: "learning", role: "student", condition: "courses_completed >= 1" },
  { id: "st-quiz-master", name: "Quiz Master", emoji: "🏆", description: "Score 90%+ in 5 quizzes", points: 200, rarity: "rare", category: "learning", role: "student", condition: "high_quiz_scores >= 5" },
  { id: "st-10-courses", name: "Knowledge Seeker", emoji: "📚", description: "Complete 10 courses", points: 500, rarity: "epic", category: "learning", role: "student", condition: "courses_completed >= 10" },
  { id: "st-first-paper", name: "First Paper", emoji: "📄", description: "Submit first research paper", points: 300, rarity: "rare", category: "learning", role: "student", condition: "papers_submitted >= 1" },
  { id: "st-published", name: "Published Author", emoji: "🏅", description: "Get paper published in journal", points: 1000, rarity: "epic", category: "milestones", role: "student", condition: "papers_published >= 1" },
  { id: "st-logbook", name: "Case Logger", emoji: "📋", description: "Log 50 clinical cases", points: 200, rarity: "rare", category: "clinical", role: "student", condition: "cases_logged >= 50" },
  { id: "st-cme", name: "Lifelong Learner", emoji: "🎓", description: "Attend 10 CME programs", points: 300, rarity: "rare", category: "engagement", role: "student", condition: "cme_attended >= 10" },
  { id: "st-webinar-host", name: "Knowledge Sharer", emoji: "🎤", description: "Host a webinar", points: 300, rarity: "rare", category: "teamwork", role: "student", condition: "webinars_hosted >= 1" },
  { id: "st-graduation", name: "Graduated!", emoji: "🎓", description: "Complete BAMS/MD degree", points: 2000, rarity: "epic", category: "milestones", role: "student", condition: "graduated" },
  { id: "st-future-vaidya", name: "Future Vaidya", emoji: "👑", description: "Top student of the year", points: 5000, rarity: "legendary", category: "milestones", role: "student", condition: "annual_top_student" },

  // ===== 💆 THERAPIST BADGES =====
  { id: "th-ready", name: "Therapist Ready", emoji: "💪", description: "Complete profile + skills", points: 20, rarity: "common", category: "onboarding", role: "therapist", condition: "profile_complete" },
  { id: "th-10-sessions", name: "Getting Started", emoji: "🌿", description: "Complete 10 therapy sessions", points: 50, rarity: "common", category: "milestones", role: "therapist", condition: "sessions >= 10" },
  { id: "th-100-sessions", name: "Skilled Hands", emoji: "🙌", description: "Complete 100 sessions", points: 300, rarity: "rare", category: "milestones", role: "therapist", condition: "sessions >= 100" },
  { id: "th-500-sessions", name: "Master Therapist", emoji: "🏆", description: "Complete 500 sessions", points: 1000, rarity: "epic", category: "milestones", role: "therapist", condition: "sessions >= 500" },
  { id: "th-favorite", name: "Patient Favorite", emoji: "❤️", description: "4.8+ rating from 50 patients", points: 500, rarity: "epic", category: "quality", role: "therapist", condition: "rating >= 4.8 && rated_by >= 50" },
  { id: "th-zero-incidents", name: "Safety First", emoji: "🛡️", description: "No adverse events for 6 months", points: 300, rarity: "rare", category: "quality", role: "therapist", condition: "zero_incidents_180_days" },
  { id: "th-punctual", name: "Punctual Pro", emoji: "⏰", description: "On-time 30 consecutive sessions", points: 200, rarity: "rare", category: "attendance", role: "therapist", condition: "on_time_streak >= 30" },
  { id: "th-multi-skill", name: "Multi-Therapy Expert", emoji: "🌟", description: "Certified in 5+ therapy types", points: 500, rarity: "epic", category: "skills", role: "therapist", condition: "certifications >= 5" },
  { id: "th-shirodhara", name: "Shirodhara Master", emoji: "💧", description: "Complete 100 Shirodhara sessions", points: 300, rarity: "rare", category: "skills", role: "therapist", condition: "shirodhara_sessions >= 100" },
  { id: "th-1lakh", name: "Earning Star", emoji: "💰", description: "Earn ₹1 lakh in commissions", points: 500, rarity: "epic", category: "growth", role: "therapist", condition: "earnings >= 100000" },
  { id: "th-year-best", name: "Therapist of Year", emoji: "👑", description: "Top-rated therapist annually", points: 5000, rarity: "legendary", category: "milestones", role: "therapist", condition: "annual_top_therapist" },

  // ===== 🏢 SERVICE PROVIDER BADGES =====
  { id: "sp-listed", name: "Venue Listed", emoji: "🏨", description: "List your first venue", points: 50, rarity: "common", category: "onboarding", role: "service_provider", condition: "venues >= 1" },
  { id: "sp-rooms", name: "Rooms Ready", emoji: "🛏️", description: "Add 5+ rooms with photos", points: 100, rarity: "common", category: "onboarding", role: "service_provider", condition: "rooms_with_photos >= 5" },
  { id: "sp-first-booking", name: "First Booking!", emoji: "🎉", description: "Receive first patient booking", points: 100, rarity: "common", category: "milestones", role: "service_provider", condition: "bookings >= 1" },
  { id: "sp-50-bookings", name: "Popular Venue", emoji: "🔥", description: "Complete 50 bookings", points: 500, rarity: "rare", category: "milestones", role: "service_provider", condition: "bookings >= 50" },
  { id: "sp-5star", name: "5-Star Venue", emoji: "🌟", description: "Maintain 4.8+ rating", points: 1000, rarity: "epic", category: "quality", role: "service_provider", condition: "rating >= 4.8" },
  { id: "sp-nabh", name: "NABH Ready", emoji: "🏅", description: "NABH checklist 90%+", points: 2000, rarity: "epic", category: "quality", role: "service_provider", condition: "nabh_score >= 90" },
  { id: "sp-10l-revenue", name: "Revenue Milestone", emoji: "💰", description: "Generate ₹10L via platform", points: 500, rarity: "rare", category: "growth", role: "service_provider", condition: "revenue >= 1000000" },
  { id: "sp-international", name: "Global Wellness", emoji: "🌍", description: "Host 10 international patients", points: 500, rarity: "rare", category: "growth", role: "service_provider", condition: "international_guests >= 10" },
  { id: "sp-responder", name: "Quick Responder", emoji: "⚡", description: "Reply all enquiries within 1 hour", points: 200, rarity: "rare", category: "engagement", role: "service_provider", condition: "avg_response < 60min for 30 days" },
  { id: "sp-1year", name: "Trusted Partner", emoji: "🤝", description: "Complete 1 year partnership", points: 1000, rarity: "epic", category: "milestones", role: "service_provider", condition: "tenure >= 365" },
  { id: "sp-top-hospital", name: "Top Hospital", emoji: "👑", description: "#1 rated AYUSH hospital", points: 10000, rarity: "legendary", category: "milestones", role: "service_provider", condition: "rank == 1" },

  // ===== 📦 PHARMA BADGES =====
  { id: "ph-first-product", name: "First Product", emoji: "📦", description: "List first product", points: 50, rarity: "common", category: "onboarding", role: "pharma", condition: "products >= 1" },
  { id: "ph-50-products", name: "Catalog Builder", emoji: "📚", description: "List 50+ products", points: 200, rarity: "rare", category: "sales", role: "pharma", condition: "products >= 50" },
  { id: "ph-first-sale", name: "First Sale!", emoji: "🛒", description: "First order via platform", points: 100, rarity: "common", category: "sales", role: "pharma", condition: "orders >= 1" },
  { id: "ph-100-orders", name: "100 Orders", emoji: "📈", description: "Complete 100 orders", points: 500, rarity: "rare", category: "milestones", role: "pharma", condition: "orders >= 100" },
  { id: "ph-10l-sales", name: "₹10L Sales", emoji: "💰", description: "Reach ₹10 lakh in sales", points: 1000, rarity: "epic", category: "milestones", role: "pharma", condition: "sales >= 1000000" },
  { id: "ph-gmp", name: "GMP Certified", emoji: "✅", description: "Upload valid GMP certificate", points: 1000, rarity: "epic", category: "quality", role: "pharma", condition: "gmp_certified" },
  { id: "ph-zero-returns", name: "Quality Assured", emoji: "🛡️", description: "No returns for 3 months", points: 500, rarity: "rare", category: "quality", role: "pharma", condition: "zero_returns_90_days" },
  { id: "ph-fast-shipper", name: "Lightning Shipper", emoji: "🚚", description: "Ship all within 24 hours", points: 300, rarity: "rare", category: "engagement", role: "pharma", condition: "all_shipped_24h for 30 days" },
  { id: "ph-doctor-choice", name: "Doctor's Choice", emoji: "👨‍⚕️", description: "Recommended by 20+ doctors", points: 500, rarity: "epic", category: "growth", role: "pharma", condition: "doctor_recommendations >= 20" },
  { id: "ph-5-states", name: "Pan-India", emoji: "🇮🇳", description: "Sell in 5+ states", points: 300, rarity: "rare", category: "growth", role: "pharma", condition: "states_served >= 5" },
  { id: "ph-top-mfr", name: "Trusted Manufacturer", emoji: "👑", description: "Top-rated manufacturer of year", points: 10000, rarity: "legendary", category: "milestones", role: "pharma", condition: "annual_top_manufacturer" },

  // ===== 🏥 HMS STAFF BADGES =====
  { id: "hms-ready", name: "System Ready", emoji: "💻", description: "Complete HMS onboarding", points: 20, rarity: "common", category: "onboarding", role: "hms_staff", condition: "onboarding_complete" },
  { id: "hms-first-patient", name: "First Registration", emoji: "📝", description: "Register first patient", points: 30, rarity: "common", category: "onboarding", role: "hms_staff", condition: "registrations >= 1" },
  { id: "hms-daily-active", name: "Daily Active", emoji: "📅", description: "Use HMS every working day for a month", points: 100, rarity: "rare", category: "consistency", role: "hms_staff", condition: "active_days_streak >= 25" },
  { id: "hms-data-champ", name: "Data Champion", emoji: "📊", description: "Zero missing records for a month", points: 200, rarity: "rare", category: "quality", role: "hms_staff", condition: "missing_records == 0 for 30 days" },
  { id: "hms-billing-ace", name: "Billing Ace", emoji: "🧾", description: "99%+ billing accuracy", points: 300, rarity: "rare", category: "quality", role: "hms_staff", condition: "billing_accuracy >= 99%" },
  { id: "hms-nabh", name: "NABH Compliant", emoji: "🏅", description: "Maintain 90%+ NABH score", points: 500, rarity: "epic", category: "quality", role: "hms_staff", condition: "nabh_score >= 90" },
  { id: "hms-quick-bill", name: "Speed Biller", emoji: "⚡", description: "Average bill under 2 minutes", points: 200, rarity: "rare", category: "quality", role: "hms_staff", condition: "avg_bill_time < 120s" },
  { id: "hms-zero-wait", name: "Zero Wait", emoji: "🏃", description: "Average patient wait under 15 min", points: 300, rarity: "epic", category: "quality", role: "hms_staff", condition: "avg_wait < 15min" },
  { id: "hms-cross-train", name: "Cross-Trained", emoji: "🎯", description: "Learn 3 different HMS modules", points: 200, rarity: "rare", category: "skills", role: "hms_staff", condition: "modules_learned >= 3" },
  { id: "hms-ai-user", name: "AI Adopter", emoji: "🤖", description: "Use AI features 50 times", points: 200, rarity: "rare", category: "skills", role: "hms_staff", condition: "ai_uses >= 50" },
  { id: "hms-1000-txn", name: "1000 Transactions", emoji: "💯", description: "Process 1000 transactions", points: 500, rarity: "epic", category: "milestones", role: "hms_staff", condition: "transactions >= 1000" },
  { id: "hms-abdm-pioneer", name: "ABDM Pioneer", emoji: "🔗", description: "Push 100 records to ABDM", points: 500, rarity: "epic", category: "milestones", role: "hms_staff", condition: "abdm_pushes >= 100" },
  { id: "hms-power-user", name: "HMS Power User", emoji: "👑", description: "Top utilizer of the year", points: 5000, rarity: "legendary", category: "milestones", role: "hms_staff", condition: "annual_top_user" },
];

// 🔄 CROSS-ROLE INTERACTIONS (when one role's action rewards another)
export const CROSS_ROLE_REWARDS = [
  { trigger: "Patient completes Panchakarma", rewards: [{ role: "doctor", coins: 50, emoji: "🩺" }, { role: "therapist", coins: 30, emoji: "💆" }, { role: "service_provider", coins: 20, emoji: "🏨" }] },
  { trigger: "Patient gives 5-star review", rewards: [{ role: "doctor", coins: 20, emoji: "⭐" }, { role: "therapist", coins: 10, emoji: "⭐" }, { role: "service_provider", coins: 10, emoji: "⭐" }] },
  { trigger: "Doctor prescribes from catalog", rewards: [{ role: "pharma", coins: 5, emoji: "📋" }] },
  { trigger: "Student assists in case", rewards: [{ role: "student", coins: 10, emoji: "📖" }, { role: "doctor", coins: 5, emoji: "🎓" }] },
  { trigger: "Patient refers friend who books", rewards: [{ role: "patient", coins: 50, emoji: "👫" }, { role: "doctor", coins: 20, emoji: "🤝" }] },
  { trigger: "HMS achieves NABH 100%", rewards: [{ role: "hms_staff", coins: 100, emoji: "🏅" }] },
  { trigger: "International booking completed", rewards: [{ role: "service_provider", coins: 100, emoji: "🌍" }, { role: "doctor", coins: 50, emoji: "🌐" }, { role: "therapist", coins: 30, emoji: "✈️" }] },
];

// 🎁 REWARD REDEMPTION OPTIONS
export const REWARDS = [
  { coins: 100, reward: "₹100 wallet credit", emoji: "💰", forRoles: ["patient"] },
  { coins: 500, reward: "Free Abhyanga session", emoji: "💆", forRoles: ["patient"] },
  { coins: 1000, reward: "Free health checkup package", emoji: "🏥", forRoles: ["patient"] },
  { coins: 500, reward: "Priority listing boost (1 week)", emoji: "🚀", forRoles: ["doctor", "service_provider"] },
  { coins: 1000, reward: "Featured badge (1 month)", emoji: "⭐", forRoles: ["doctor", "service_provider", "pharma"] },
  { coins: 2000, reward: "Free CME course", emoji: "🎓", forRoles: ["doctor", "student"] },
  { coins: 500, reward: "Commission bonus ₹500", emoji: "💵", forRoles: ["therapist"] },
  { coins: 1000, reward: "Product listing boost", emoji: "📦", forRoles: ["pharma"] },
  { coins: 2000, reward: "Ayuzee Certified badge", emoji: "✅", forRoles: ["doctor", "therapist", "service_provider", "pharma", "hms_staff"] },
  { coins: 5000, reward: "Exclusive Ayuzee Partner status", emoji: "👑", forRoles: ["doctor", "service_provider", "pharma"] },
];

// Helper functions
export const getBadgesForRole = (role: RoleType) => BADGES.filter(b => b.role === role);
export const getCoinRulesForRole = (role: RoleType) => COIN_RULES.filter(r => r.role === role || r.role === "all");
export const getRewardsForRole = (role: RoleType) => REWARDS.filter(r => r.forRoles.includes(role));
export const getRank = (points: number) => [...RANKS].reverse().find(r => points >= r.minPoints) || RANKS[0];
export const getNextRank = (points: number) => RANKS.find(r => r.minPoints > points);
export const getRarityColor = (rarity: BadgeRarity) => {
  switch (rarity) {
    case "common": return "border-slate-300 bg-slate-50 text-slate-700";
    case "rare": return "border-blue-300 bg-blue-50 text-blue-700";
    case "epic": return "border-purple-300 bg-purple-50 text-purple-700";
    case "legendary": return "border-amber-400 bg-amber-50 text-amber-700";
  }
};
export const getRarityBadgeColor = (rarity: BadgeRarity) => {
  switch (rarity) {
    case "common": return "bg-slate-200 text-slate-700";
    case "rare": return "bg-blue-200 text-blue-700";
    case "epic": return "bg-purple-200 text-purple-700";
    case "legendary": return "bg-amber-200 text-amber-800";
  }
};
