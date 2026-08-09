import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

interface MicroLesson {
  id: string;
  title: string;
  category: string;
  content: string;
  keyInsight: string;
  actionItem: string;
  source: string;
}

const MICRO_LESSONS: MicroLesson[] = [
  // FINANCE
  { id: "f1", title: "The 72 Rule", category: "finance", content: "Divide 72 by your annual return rate to know how many years it takes to double your money. At 12% returns, your money doubles in 6 years. At 8%, it takes 9 years. This is why starting early matters enormously.", keyInsight: "Time in market > timing the market. Every year you delay costs exponentially.", actionItem: "Calculate: At your current savings rate, when does your money double?", source: "The Psychology of Money" },
  { id: "f2", title: "Pay Yourself First", category: "finance", content: "Transfer money to savings/investments BEFORE paying bills or spending. Treat saving like a non-negotiable bill — like EMI. If you save what is left after spending, you will never save. If you spend what is left after saving, you will always have enough.", keyInsight: "Automate: Set up SIP on salary day. The money you never see, you never miss.", actionItem: "Set up one auto-debit that moves money to investments on the 1st of every month.", source: "Rich Dad Poor Dad" },
  { id: "f3", title: "Lifestyle Inflation Trap", category: "finance", content: "When income increases, expenses should NOT increase proportionally. A doctor who earns 5L/month but spends 4.8L is poorer than one earning 2L and spending 1.2L. Wealth = What you keep, not what you earn.", keyInsight: "Every time you get a raise, save 50% of the increment before upgrading lifestyle.", actionItem: "If you got a recent raise, how much of it went to savings vs lifestyle?", source: "I Will Teach You to Be Rich" },

  // LEADERSHIP
  { id: "l1", title: "The 5-Second Rule", category: "leadership", content: "When you have an impulse to act on a goal, you must physically move within 5 seconds or your brain will kill the idea. Count 5-4-3-2-1 and move. This breaks the habit of hesitation and overthinking.", keyInsight: "Courage is not the absence of fear. It is acting before fear takes over.", actionItem: "Next time you hesitate to speak up in a meeting, count 5-4-3-2-1 and speak.", source: "The 5 Second Rule — Mel Robbins" },
  { id: "l2", title: "Feedback Sandwich is Dead", category: "leadership", content: "The positive-negative-positive sandwich is transparent and ineffective. Instead use SBI: Situation (when/where), Behavior (what specifically), Impact (the effect). Direct, specific, kind — no sugar-coating needed.", keyInsight: "People respect directness more than diplomacy. Be kind AND clear.", actionItem: "Give one piece of SBI feedback to a colleague today.", source: "Radical Candor — Kim Scott" },
  { id: "l3", title: "Leading by Asking", category: "leadership", content: "The best leaders ask questions instead of giving answers. 'What do you think we should do?' develops your team more than 'Here is what to do.' Every answer you give is a growth opportunity you stole from someone.", keyInsight: "Your job is to develop people, not to be the smartest person in the room.", actionItem: "In your next interaction, ask 2 questions before giving any advice.", source: "Turn the Ship Around — L. David Marquet" },

  // PRODUCTIVITY
  { id: "p1", title: "The 2-Minute Rule", category: "productivity", content: "If a task takes less than 2 minutes, do it NOW. Do not add it to a list, do not schedule it, do not think about it. Just do it. Small tasks left undone create mental clutter that drains energy for important work.", keyInsight: "Small action > perfect planning. The cost of deciding is often higher than the cost of doing.", actionItem: "Right now: identify one 2-minute task you have been postponing. Do it.", source: "Getting Things Done — David Allen" },
  { id: "p2", title: "Parkinson's Law", category: "productivity", content: "Work expands to fill the time available for its completion. A task that could take 1 hour takes 3 hours if you give yourself 3 hours. Set artificial deadlines shorter than needed.", keyInsight: "Constraints create creativity. Give yourself less time, and you will find you need less.", actionItem: "Tomorrow, set a timer for 50% of what you think a task needs. See what happens.", source: "Deep Work — Cal Newport" },
  { id: "p3", title: "Context Switching Costs", category: "productivity", content: "Every time you switch tasks, it takes 23 minutes to regain full focus. Checking email between patients costs more than you think. Batch similar tasks. Protect focus blocks like you protect your patients.", keyInsight: "Multitasking is a myth. Your brain is single-threaded for deep work.", actionItem: "Block one 90-minute slot tomorrow. No phone, no email, one task only.", source: "Make Time — Jake Knapp" },

  // WELLNESS
  { id: "w1", title: "Box Breathing Reset", category: "wellness", content: "4 seconds in, 4 hold, 4 out, 4 hold. Navy SEALs use this to stay calm under fire. Works between patients, before surgery, during conflict. Your nervous system cannot tell the difference between a tiger and an angry patient.", keyInsight: "You cannot control situations. You can always control your breath.", actionItem: "Do 4 cycles of box breathing right now. Notice how you feel after.", source: "Breath — James Nestor" },
  { id: "w2", title: "The Stress Cycle Must Complete", category: "wellness", content: "Stress and stressor are different. Solving the problem (stressor) does not release the physical stress. You must complete the stress cycle through: physical movement, deep breathing, positive social interaction, laughter, or creative expression.", keyInsight: "Your body does not know the danger is over until you tell it physically.", actionItem: "After your shift today, do 20 min of movement. Not for fitness — for stress completion.", source: "Burnout — Emily Nagoski" },
  { id: "w3", title: "Sleep is a Superpower", category: "wellness", content: "6 hours of sleep gives you the cognitive ability of someone who is legally drunk. After 17 hours awake, your performance equals a blood alcohol of 0.05%. Sleep is not lazy — it is professional.", keyInsight: "Sacrificing sleep to work more is like withdrawing from an ATM without depositing.", actionItem: "Set a non-negotiable bedtime tonight. Prioritize 7+ hours. No screens 30 min before.", source: "Why We Sleep — Matthew Walker" },

  // COMMUNICATION
  { id: "c1", title: "Name It to Tame It", category: "communication", content: "When someone is emotional, label the emotion: 'It sounds like you are frustrated.' This simple act reduces amygdala activation by 50%. People feel heard and immediately become more rational and cooperative.", keyInsight: "Emotions named out loud lose their power. Emotions ignored grow stronger.", actionItem: "Use one emotion label today: 'It seems like...' or 'It sounds like you feel...'", source: "Never Split the Difference — Chris Voss" },
  { id: "c2", title: "The Power of Silence", category: "communication", content: "After asking a question, wait. Do not fill the silence. Most people speak within 7 seconds of silence. The person who is comfortable with silence controls the conversation. Doctors who listen more, diagnose faster.", keyInsight: "Silence is not empty — it is full of information you would miss while talking.", actionItem: "In your next conversation, count to 7 silently after asking a question.", source: "Crucial Conversations" },
  { id: "c3", title: "Start with Why", category: "communication", content: "Before explaining WHAT or HOW, explain WHY. 'Take this medicine because it reduces your inflammation by 60% and prevents joint damage' works better than 'Take this medicine three times a day.' People comply when they understand purpose.", keyInsight: "WHY creates motivation. WHAT creates compliance. HOW creates capability.", actionItem: "Next time you prescribe, explain WHY this specific medicine matters for THIS patient.", source: "Start With Why — Simon Sinek" },

  // MINDSET
  { id: "m1", title: "Reframe Failure", category: "mindset", content: "Edison did not fail 10,000 times. He found 10,000 ways that did not work. Every clinical mistake is data. Every rejected paper is feedback. The only true failure is the one you refuse to learn from.", keyInsight: "Failure is not the opposite of success. It is a prerequisite.", actionItem: "Write down your most recent 'failure'. What did it teach you?", source: "Black Box Thinking — Matthew Syed" },
  { id: "m2", title: "Identity-Based Change", category: "mindset", content: "Do not say 'I want to read more.' Say 'I am a reader.' Do not say 'I want to exercise.' Say 'I am someone who moves daily.' When your identity shifts, behavior follows automatically.", keyInsight: "Every action is a vote for the person you are becoming.", actionItem: "Write one 'I am' statement for who you want to become. Repeat it today.", source: "Atomic Habits — James Clear" },
  { id: "m3", title: "The Locus of Control", category: "mindset", content: "Internals believe they control outcomes. Externals blame luck, politics, or circumstances. Research shows internals earn more, achieve more, and are happier. You cannot control events, but you always control your response.", keyInsight: "Ask: What CAN I control here? Focus only on that. Release everything else.", actionItem: "Name one thing you have been blaming on circumstances. What can YOU do about it?", source: "The 7 Habits — Stephen Covey" },
];

const CATEGORY_COLORS: Record<string, string> = {
  finance: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  leadership: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  productivity: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  wellness: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  communication: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  mindset: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const MicroLearning = () => {
  const { addXP, addCoins, recordStreak } = useBeyondGamification();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredLessons = categoryFilter === "all"
    ? MICRO_LESSONS
    : MICRO_LESSONS.filter((l) => l.category === categoryFilter);

  const currentLesson = filteredLessons[currentIndex];
  const totalLessons = filteredLessons.length;

  const goNext = () => {
    if (currentIndex < totalLessons - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const markDone = async () => {
    if (!currentLesson || completed.has(currentLesson.id)) return;
    setCompleted((prev) => new Set(prev).add(currentLesson.id));
    await addXP(25, "micro_lesson", `Completed: ${currentLesson.title}`);
    await addCoins(5, "micro_lesson");
    await recordStreak("learning");
    toast.success(`Lesson done! +25 XP`);
    // Auto-advance
    if (currentIndex < totalLessons - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
    }
  };

  const categories = ["all", "finance", "leadership", "productivity", "wellness", "communication", "mindset"];

  if (!currentLesson) {
    return (
      <div className="text-center py-12">
        <Brain className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">No lessons in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-500" />
            Micro-Learning
          </h1>
          <p className="text-muted-foreground">5-minute lessons — learn something powerful between patients</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><Award className="h-3 w-3" /> +25 XP each</Badge>
          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> {completed.size} done</Badge>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? "default" : "outline"}
            className="text-xs capitalize"
            onClick={() => { setCategoryFilter(cat); setCurrentIndex(0); }}
          >
            {cat === "all" ? "All" : cat}
          </Button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={((currentIndex + 1) / totalLessons) * 100} className="flex-1 h-2" />
        <span className="text-xs text-muted-foreground">{currentIndex + 1}/{totalLessons}</span>
      </div>

      {/* Lesson Card */}
      <Card className="relative overflow-hidden">
        {completed.has(currentLesson.id) && (
          <div className="absolute top-3 right-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        )}
        <CardHeader>
          <Badge className={`w-fit text-xs ${CATEGORY_COLORS[currentLesson.category] || ""}`}>
            {currentLesson.category}
          </Badge>
          <CardTitle className="text-lg mt-2">{currentLesson.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Content */}
          <p className="text-sm leading-relaxed">{currentLesson.content}</p>

          {/* Key Insight */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Key Insight
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">{currentLesson.keyInsight}</p>
          </div>

          {/* Action Item */}
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-3">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Do This Now
            </p>
            <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-1">{currentLesson.actionItem}</p>
          </div>

          {/* Source */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>Source: {currentLesson.source}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={markDone}
              disabled={completed.has(currentLesson.id)}
            >
              {completed.has(currentLesson.id) ? (
                <><CheckCircle2 className="h-4 w-4" /> Done</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Mark as Learned (+25 XP)</>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={goNext} disabled={currentIndex === totalLessons - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroLearning;
