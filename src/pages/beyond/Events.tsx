import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  Mic,
  Play,
  Radio,
  Send,
  Star,
  ThumbsUp,
  Timer,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { earnXP } from "@/services/beyondGamification";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

interface EventItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  event_type: string;
  host_name: string;
  guest_speakers: string[];
  thumbnail_url: string | null;
  category: string;
  starts_at: string;
  ends_at: string | null;
  duration_minutes: number;
  live_url: string | null;
  replay_url: string | null;
  replay_available: boolean;
  replay_expires_at: string | null;
  status: string;
  is_free: boolean;
  price_inr: number;
  max_attendees: number | null;
  cta_enabled: boolean;
  cta_title: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_link: string | null;
  xp_reward: number;
  tags: string[];
  registration_count: number;
}

interface Registration {
  event_id: string;
  status: string;
}

interface QAItem {
  id: string;
  event_id: string;
  user_id: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  is_pinned: boolean;
  upvotes: number;
  asked_at: string;
}

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  file_url: string | null;
  external_url: string | null;
  description: string | null;
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function getEventTypeIcon(type: string) {
  switch (type) {
    case "webinar": return <Video className="h-4 w-4" />;
    case "workshop": return <Users className="h-4 w-4" />;
    case "live_qa": return <MessageCircle className="h-4 w-4" />;
    case "masterclass": return <Star className="h-4 w-4" />;
    case "panel": return <Mic className="h-4 w-4" />;
    default: return <Calendar className="h-4 w-4" />;
  }
}

function getEventTypeLabel(type: string) {
  const labels: Record<string, string> = {
    webinar: "Webinar",
    workshop: "Workshop",
    live_qa: "Live Q&A",
    masterclass: "Masterclass",
    panel: "Panel Discussion",
  };
  return labels[type] || type;
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatEventTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("Starting now!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      else setTimeLeft(`${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, isExpired };
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

const Events = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail state
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQ, setSubmittingQ] = useState(false);

  const activeEventCountdown = useCountdown(activeEvent?.starts_at ?? new Date().toISOString());

  const sb = supabase as any;

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [eventsRes, regsRes] = await Promise.all([
      sb.from("beyond_events").select("*").eq("is_published", true).order("starts_at", { ascending: true }),
      session.session
        ? sb.from("beyond_event_registrations").select("event_id, status").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setEvents(eventsRes.data || []);
    setRegistrations(regsRes.data || []);
    setLoading(false);
  };

  const openEvent = async (event: EventItem) => {
    setActiveEvent(event);
    setView("detail");
    const [qaRes, resRes] = await Promise.all([
      sb.from("beyond_event_qa").select("*").eq("event_id", event.id).order("is_pinned", { ascending: false }).order("upvotes", { ascending: false }),
      sb.from("beyond_event_resources").select("*").eq("event_id", event.id).order("sort_order"),
    ]);
    setQaItems(qaRes.data || []);
    setResources(resRes.data || []);
  };

  const registerForEvent = async (eventId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in first"); return; }
    const userId = session.session.user.id;

    await sb.from("beyond_event_registrations").upsert({
      user_id: userId,
      event_id: eventId,
      status: "registered",
    }, { onConflict: "user_id,event_id" });

    // Increment registration count
    const event = events.find((e) => e.id === eventId);
    if (event) {
      await sb.from("beyond_events").update({ registration_count: (event.registration_count || 0) + 1 }).eq("id", eventId);
    }

    setRegistrations((prev) => [...prev.filter((r) => r.event_id !== eventId), { event_id: eventId, status: "registered" }]);
    await earnXP(userId, 25, "event_register", "Registered for event");
    toast.success("Registered! You'll get a reminder before the event. +25 XP");
  };

  const markAttended = async (eventId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;

    await sb.from("beyond_event_registrations").update({
      status: "attended",
      attended_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("event_id", eventId);

    const event = events.find((e) => e.id === eventId);
    if (event) {
      await earnXP(userId, event.xp_reward, "event_attended", `Attended: ${event.title}`);
      toast.success(`Attendance recorded! +${event.xp_reward} XP`);
    }

    setRegistrations((prev) => prev.map((r) => r.event_id === eventId ? { ...r, status: "attended" } : r));
  };

  const submitQuestion = async () => {
    if (!activeEvent || !newQuestion.trim()) return;
    setSubmittingQ(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSubmittingQ(false); return; }

    const { data } = await sb.from("beyond_event_qa").insert({
      event_id: activeEvent.id,
      user_id: session.session.user.id,
      question: newQuestion.trim(),
    }).select().single();

    if (data) setQaItems((prev) => [...prev, data]);
    setNewQuestion("");
    setSubmittingQ(false);
    toast.success("Question submitted!");
  };

  // ─── RENDER: Event List ───────────────────────────────────
  const renderEventList = () => {
    const upcoming = events.filter((e) => e.status === "upcoming" || e.status === "live");
    const past = events.filter((e) => e.status === "completed");
    const registeredIds = registrations.map((r) => r.event_id);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
              <Radio className="h-7 w-7 text-red-500" />
              Events & Webinars
            </h1>
            <p className="text-muted-foreground">Live sessions, workshops, and masterclasses for your growth</p>
          </div>
          <Badge variant="outline" className="gap-1 w-fit">
            <Calendar className="h-3 w-3" /> {upcoming.length} upcoming
          </Badge>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="registered">My Events ({registrations.length})</TabsTrigger>
            {past.length > 0 && <TabsTrigger value="past">Past ({past.length})</TabsTrigger>}
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No upcoming events</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon — new events are added regularly</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcoming.map((event) => {
                  const isRegistered = registeredIds.includes(event.id);
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={isRegistered}
                      onOpen={() => openEvent(event)}
                      onRegister={() => registerForEvent(event.id)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* My Events */}
          <TabsContent value="registered" className="space-y-4 mt-4">
            {registrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No registered events yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Register for an event to see it here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.filter((e) => registeredIds.includes(e.id)).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={true}
                    onOpen={() => openEvent(event)}
                    onRegister={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past" className="space-y-4 mt-4">
            <div className="space-y-4">
              {past.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={registeredIds.includes(event.id)}
                  onOpen={() => openEvent(event)}
                  onRegister={() => {}}
                  isPast
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ─── RENDER: Event Detail ─────────────────────────────────
  const renderEventDetail = () => {
    if (!activeEvent) return null;
    const reg = registrations.find((r) => r.event_id === activeEvent.id);
    const isRegistered = !!reg;
    const hasAttended = reg?.status === "attended";
    const { timeLeft, isExpired } = activeEventCountdown;
    const isLive = activeEvent.status === "live" || isExpired;
    const isCompleted = activeEvent.status === "completed";

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setView("list"); setActiveEvent(null); }}>
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Button>

        {/* Event Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "destructive" : isCompleted ? "secondary" : "outline"} className="gap-1">
              {isLive ? <><Radio className="h-3 w-3 animate-pulse" /> Live Now</> :
               isCompleted ? <><CheckCircle2 className="h-3 w-3" /> Completed</> :
               <><Timer className="h-3 w-3" /> {timeLeft}</>}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {getEventTypeIcon(activeEvent.event_type)}
              {getEventTypeLabel(activeEvent.event_type)}
            </Badge>
            {activeEvent.is_free && <Badge variant="secondary">Free</Badge>}
          </div>
          <h2 className="text-2xl font-bold">{activeEvent.title}</h2>
          {activeEvent.subtitle && <p className="text-muted-foreground">{activeEvent.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatEventDate(activeEvent.starts_at)}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatEventTime(activeEvent.starts_at)}</span>
            <span className="flex items-center gap-1"><Timer className="h-4 w-4" />{activeEvent.duration_minutes} min</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{activeEvent.registration_count} registered</span>
          </div>
        </div>

        {/* Countdown / Live / Replay Banner */}
        {!isCompleted && !isLive && isRegistered && (
          <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800/40">
            <CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Event starts in</p>
              <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">{timeLeft}</p>
              <p className="text-xs text-muted-foreground mt-2">You're registered — we'll remind you before it starts</p>
            </CardContent>
          </Card>
        )}

        {isLive && activeEvent.live_url && (
          <Card className="border-red-300 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-6 text-center space-y-3">
              <Radio className="h-8 w-8 text-red-500 mx-auto animate-pulse" />
              <p className="font-semibold text-lg">Event is LIVE!</p>
              <a href={activeEvent.live_url} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2">
                  <Play className="h-4 w-4" /> Join Live Session
                </Button>
              </a>
              {!hasAttended && (
                <Button variant="outline" size="sm" onClick={() => markAttended(activeEvent.id)} className="ml-2">
                  Mark as Attended (+{activeEvent.xp_reward} XP)
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {isCompleted && activeEvent.replay_available && activeEvent.replay_url && (
          <Card className="border-blue-200 dark:border-blue-800/40">
            <CardContent className="p-6 text-center space-y-3">
              <Play className="h-8 w-8 text-blue-500 mx-auto" />
              <p className="font-semibold">Watch Replay</p>
              {activeEvent.replay_expires_at && (
                <p className="text-xs text-muted-foreground">Available until {formatEventDate(activeEvent.replay_expires_at)}</p>
              )}
              <div className="aspect-video rounded-lg overflow-hidden bg-black max-w-2xl mx-auto">
                <iframe src={activeEvent.replay_url} className="w-full h-full" allowFullScreen title="Replay" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration CTA */}
        {!isRegistered && !isCompleted && (
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to join?</p>
                <p className="text-sm text-muted-foreground">Register to get reminders and access to the session</p>
              </div>
              <Button onClick={() => registerForEvent(activeEvent.id)} className="gap-1">
                <Zap className="h-4 w-4" /> Register Free
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Description + Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About This Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm whitespace-pre-line">{activeEvent.description}</p>
            <div className="flex items-center gap-3 pt-2 border-t">
              <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/40 grid place-items-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                {activeEvent.host_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">Hosted by {activeEvent.host_name}</p>
                {activeEvent.guest_speakers.length > 0 && (
                  <p className="text-xs text-muted-foreground">Guests: {activeEvent.guest_speakers.join(", ")}</p>
                )}
              </div>
            </div>
            {activeEvent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {activeEvent.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        {resources.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-green-500" />
                Resources & Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resources.map((res) => (
                  <a
                    key={res.id}
                    href={res.file_url || res.external_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{res.title}</p>
                      {res.description && <p className="text-xs text-muted-foreground">{res.description}</p>}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{res.resource_type}</Badge>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Q&A Section */}
        {isRegistered && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Questions & Answers ({qaItems.length})
              </CardTitle>
              <CardDescription>Ask questions before, during, or after the event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Submit Question */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button onClick={submitQuestion} disabled={submittingQ || !newQuestion.trim()} size="icon" className="shrink-0 h-[60px] w-[60px]">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Questions List */}
              {qaItems.length > 0 && (
                <div className="space-y-3 mt-4">
                  {qaItems.map((qa) => (
                    <div key={qa.id} className={`rounded-lg border p-3 ${qa.is_pinned ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20" : ""}`}>
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{qa.question}</p>
                          {qa.answer && (
                            <div className="mt-2 pl-3 border-l-2 border-green-300">
                              <p className="text-sm text-green-700 dark:text-green-400">{qa.answer}</p>
                              {qa.answered_by && <p className="text-[10px] text-muted-foreground mt-1">— {qa.answered_by}</p>}
                            </div>
                          )}
                        </div>
                        {qa.is_pinned && <Badge variant="outline" className="text-[9px] shrink-0">Pinned</Badge>}
                        <div className="flex items-center gap-1 shrink-0">
                          <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px]">{qa.upvotes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA (Call to Action) */}
        {activeEvent.cta_enabled && activeEvent.cta_title && (
          <Card className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-800/40">
            <CardContent className="p-6 text-center space-y-3">
              <Zap className="h-8 w-8 text-violet-500 mx-auto" />
              <h3 className="text-lg font-bold">{activeEvent.cta_title}</h3>
              {activeEvent.cta_description && <p className="text-sm text-muted-foreground">{activeEvent.cta_description}</p>}
              {activeEvent.cta_link && (
                <a href={activeEvent.cta_link}>
                  <Button size="lg" className="gap-2 mt-2">
                    <Star className="h-4 w-4" /> {activeEvent.cta_button_text || "Learn More"}
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  return view === "detail" ? renderEventDetail() : renderEventList();
};

// ════════════════════════════════════════════════════════════
// EVENT CARD COMPONENT
// ════════════════════════════════════════════════════════════

function EventCard({ event, isRegistered, onOpen, onRegister, isPast }: {
  event: EventItem;
  isRegistered: boolean;
  onOpen: () => void;
  onRegister: () => void;
  isPast?: boolean;
}) {
  const { timeLeft } = useCountdown(event.starts_at);
  const isLive = event.status === "live";

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isLive ? "border-red-300 dark:border-red-800/40" : ""}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left: Date Badge */}
          <div className={`sm:w-24 p-4 flex sm:flex-col items-center justify-center gap-2 text-center ${
            isLive ? "bg-red-50 dark:bg-red-950/20" : "bg-violet-50 dark:bg-violet-950/20"
          }`}>
            <div>
              <p className="text-xs text-muted-foreground">{new Date(event.starts_at).toLocaleDateString("en-IN", { month: "short" })}</p>
              <p className="text-2xl font-bold">{new Date(event.starts_at).getDate()}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(event.starts_at).toLocaleDateString("en-IN", { weekday: "short" })}</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={isLive ? "destructive" : "outline"} className="gap-1 text-[10px]">
                    {getEventTypeIcon(event.event_type)}
                    {isLive ? "LIVE" : getEventTypeLabel(event.event_type)}
                  </Badge>
                  {event.is_free && <Badge variant="secondary" className="text-[10px]">Free</Badge>}
                  {isRegistered && <Badge variant="outline" className="text-[10px] text-green-600 border-green-300"><CheckCircle2 className="h-3 w-3 mr-0.5" />Registered</Badge>}
                </div>
                <h3 className="font-semibold text-sm cursor-pointer hover:text-violet-600 transition-colors" onClick={onOpen}>{event.title}</h3>
                {event.subtitle && <p className="text-xs text-muted-foreground truncate">{event.subtitle}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatEventTime(event.starts_at)}</span>
              <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{event.duration_minutes}min</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.registration_count}</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3" />+{event.xp_reward} XP</span>
              {!isPast && !isLive && <span className="text-violet-600 font-medium">Starts in {timeLeft}</span>}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={onOpen}>
                {isPast && event.replay_available ? "Watch Replay" : "View Details"}
              </Button>
              {!isRegistered && !isPast && (
                <Button size="sm" onClick={onRegister}>Register</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Events;
