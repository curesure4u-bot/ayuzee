# Beyond.Praxis — Setup & Deployment Guide
## For Jasir Sajidh

---

## Quick Start (5 minutes)

### 1. Run Database Scripts in Supabase

Go to **Supabase Dashboard → SQL Editor → New Query** and run these files in order:

```
1. scripts/create_beyond_praxis_tables.sql       ← Core + Gamification (run first!)
2. scripts/create_beyond_time_management.sql     ← Time Management
3. scripts/create_beyond_book_library.sql        ← Book Library (30 books)
4. scripts/create_beyond_leadership_lab.sql      ← Leadership (12 scenarios)
5. scripts/create_beyond_wellness_hub.sql        ← Wellness Hub
6. scripts/create_beyond_finance_toolkit.sql     ← Finance Toolkit
7. scripts/create_beyond_guided_pathways.sql     ← Pathways (30 lessons)
8. scripts/create_beyond_journal.sql             ← Journal
9. scripts/create_beyond_habits.sql              ← Habit Tracker
```

### 2. Verify Tables Created

Run this query to confirm:
```sql
SELECT count(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'beyond_%';
-- Should return ~35-39 tables
```

### 3. Access the Platform

Navigate to: `/beyond` (Dashboard)

All routes:
- `/beyond` — Dashboard
- `/beyond/wheel-of-life` — Wheel of Life Assessment
- `/beyond/time-management` — Pomodoro + Planner + Energy
- `/beyond/books` — Book Library (30 books)
- `/beyond/leadership` — Leadership Scenarios
- `/beyond/wellness` — Breathing + Mood + Burnout
- `/beyond/finance` — Income/Expense + SIP + EMI + Tax
- `/beyond/career` — 8 Career Paths
- `/beyond/pathways` — 3 Guided Programs (30 lessons)
- `/beyond/journal` — Reflection Journal
- `/beyond/habits` — Habit Tracker
- `/beyond/badges` — Badge Collection
- `/beyond/leaderboard` — Weekly Rankings
- `/beyond/profile` — User Profile
- `/beyond/writing` — Case Report + Abstract + Citation + Journals
- `/beyond/micro-learning` — 18 Micro-Lessons

---

## Architecture Summary

### Frontend Files

```
src/pages/beyond/
├── BeyondPraxisLayout.tsx    ← Sidebar layout + XP bar
├── BeyondDashboard.tsx       ← Main dashboard (tool-first)
├── WheelOfLife.tsx           ← Radar chart assessment
├── TimeManagement.tsx        ← Pomodoro + Planner + Energy + Templates
├── BookLibrary.tsx           ← 30 books + reading tracker
├── LeadershipLab.tsx         ← 12 scenarios + 5 levels
├── WellnessHub.tsx           ← Breathing + Mood + Gratitude + Burnout
├── FinanceToolkit.tsx        ← Tracker + SIP + EMI + Tax
├── CareerNavigator.tsx       ← 8 career paths
├── GuidedPathways.tsx        ← 3 programs + lesson player
├── ReflectionJournal.tsx     ← Prompts + types + history
├── HabitTracker.tsx          ← 7-day grid + streaks
├── MyBadges.tsx              ← Badge showcase + catalog
├── Leaderboard.tsx           ← Weekly XP rankings
├── BeyondProfile.tsx         ← Profile editor + stats
├── WriterStudio.tsx          ← Case report + Abstract + Citation
└── MicroLearning.tsx         ← 18 swipeable lessons

src/services/
└── beyondGamification.ts     ← XP, streaks, badges, coins engine

src/hooks/
└── useBeyondGamification.ts  ← React hook wrapper
```

### Gamification System

- **XP & Levels**: 10 levels from Intern to Praxis Master
- **Streaks**: 7 types (login, learning, wellness, planning, reading, reflection, finance)
- **Badges**: 24 badges across 4 rarities (common/rare/epic/legendary)
- **Coins**: Earn & spend in platform store
- **Leaderboard**: Weekly XP rankings, resets Monday
- **Challenges**: Daily/weekly/monthly challenges

### Key XP Rewards

| Action | XP | Coins |
|--------|------|-------|
| Wheel of Life assessment | 100 | 25 |
| Leadership scenario | 50 | 15 |
| Journal entry | 30 | 10 |
| Micro-lesson | 25 | 5 |
| Pathway lesson | 25 | 10 |
| Weekly plan saved | 20 | — |
| Pomodoro session | 15 | 5 |
| Mood logged | 15 | — |
| Finance entry | 15 | — |
| Habit checked | 10 | — |
| Breathing exercise | 10 | — |
| Book finished | 150 | 30 |
| Apply-It challenge | 75 | 20 |
| Pathway completed | 400-500 | 100 |

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL + RLS + Edge Functions)
- **Charts**: Recharts (radar, bar, line)
- **Deploy**: Netlify (static + functions)
- **Gamification**: Client-side service layer (src/services/beyondGamification.ts)

---

## Next Steps for Jasir

1. Run the SQL scripts in Supabase
2. Test each module by navigating to `/beyond`
3. Add more content (books, scenarios, pathways) via Supabase dashboard
4. Set up Supabase Auth (email/password or Google sign-in)
5. Share beta with 10 medical students for feedback
6. Iterate based on which tools get used most

---

*Built with love for Jasir Sajidh — Beyond.Praxis, August 2026*
