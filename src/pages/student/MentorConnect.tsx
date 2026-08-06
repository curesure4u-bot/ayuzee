import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Handshake,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Star,
  UserCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useMentorList, useMentorshipMessages, type Mentor, type MentorshipRequest } from "@/hooks/useMentorship";

// ---------- Message Thread Component ----------

function MessageThread({ request }: { request: MentorshipRequest }) {
  const { messages, loading, userId, sendMessage } = useMentorshipMessages(request.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const result = await sendMessage(text.trim());
    setSending(false);
    if (result) {
      setText("");
    } else {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="max-h-64 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/30">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.sender_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.sender_id === userId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {request.status === "accepted" && (
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="text-sm"
          />
          <Button size="sm" onClick={handleSend} disabled={!text.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {request.status === "pending" && (
        <p className="text-xs text-muted-foreground text-center">
          Waiting for mentor to accept your request...
        </p>
      )}
      {request.status === "declined" && (
        <p className="text-xs text-destructive text-center">
          This request was declined by the mentor.
        </p>
      )}
    </div>
  );
}

// ---------- Main Page ----------

const MentorConnect = () => {
  const { mentors, myRequests, loading, userId, sendRequest } = useMentorList();
  const [tab, setTab] = useState("mentors");
  const [search, setSearch] = useState("");
  const [requestDialogMentor, setRequestDialogMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeThread, setActiveThread] = useState<MentorshipRequest | null>(null);

  const filteredMentors = mentors.filter((m) => {
    if (m.user_id === userId) return false; // Don't show self
    const q = search.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.specialization.toLowerCase().includes(q) ||
      (m.college_name || "").toLowerCase().includes(q) ||
      m.subjects.some((s) => s.toLowerCase().includes(q))
    );
  });

  const requestedMentorIds = myRequests.map((r) => r.mentor_id);

  const handleSendRequest = async () => {
    if (!requestDialogMentor || !requestMessage.trim()) {
      toast.error("Please write a message to the mentor");
      return;
    }
    setSending(true);
    const result = await sendRequest(requestDialogMentor.id, requestMessage.trim());
    setSending(false);

    if (result.success) {
      toast.success("Request sent! You'll be notified when the mentor responds.");
      setRequestDialogMentor(null);
      setRequestMessage("");
    } else {
      toast.error(result.error || "Failed to send request");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Handshake className="h-6 w-6 text-primary" /> Mentorship & Connect
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find senior mentors for guidance on academics, research, and career
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="mentors" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Find Mentors
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> My Connections ({myRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, specialization, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Badge variant="outline">
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? "s" : ""} available
          </Badge>

          <div className="space-y-3">
            {filteredMentors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No mentors found matching your search.
                </CardContent>
              </Card>
            ) : (
              filteredMentors.map((mentor) => {
                const alreadyRequested = requestedMentorIds.includes(mentor.id);
                const isFull = mentor.current_mentees >= mentor.max_mentees;
                return (
                  <Card key={mentor.id} className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{mentor.full_name}</h3>
                            {mentor.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                <Star className="h-3 w-3 fill-current" /> {mentor.rating}
                              </span>
                            )}
                          </div>
                          {mentor.bio && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mentor.bio}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">{mentor.specialization}</Badge>
                            {mentor.college_name && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <GraduationCap className="h-3 w-3" /> {mentor.college_name}
                              </span>
                            )}
                            {mentor.year_of_study && (
                              <Badge variant="secondary" className="text-[10px]">Year {mentor.year_of_study}</Badge>
                            )}
                          </div>
                          {mentor.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mentor.subjects.map((s) => (
                                <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            <UserCheck className="h-3 w-3 inline mr-0.5" />
                            {mentor.current_mentees}/{mentor.max_mentees} mentees
                          </p>
                        </div>

                        <div className="shrink-0">
                          {alreadyRequested ? (
                            <Badge variant="secondary" className="text-xs">Requested</Badge>
                          ) : isFull ? (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Full</Badge>
                          ) : (
                            <Button size="sm" onClick={() => setRequestDialogMentor(mentor)}>
                              <Handshake className="h-4 w-4 mr-1" /> Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Requests / Connections Tab */}
        <TabsContent value="requests" className="space-y-3 mt-4">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                No mentorship connections yet. Browse mentors and send a request!
              </CardContent>
            </Card>
          ) : (
            myRequests.map((req) => {
              const statusIcon =
                req.status === "accepted" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                req.status === "declined" ? <XCircle className="h-4 w-4 text-red-500" /> :
                <Clock className="h-4 w-4 text-amber-500" />;

              return (
                <Card key={req.id} className={activeThread?.id === req.id ? "border-primary" : ""}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {statusIcon}
                        <div>
                          <p className="font-medium text-sm">{req.mentor_name || "Mentor"}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.mentor_specialization} · {req.status}
                          </p>
                        </div>
                      </div>
                      {req.status === "accepted" && (
                        <Button
                          size="sm"
                          variant={activeThread?.id === req.id ? "default" : "outline"}
                          onClick={() => setActiveThread(activeThread?.id === req.id ? null : req)}
                          className="gap-1.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {activeThread?.id === req.id ? "Hide Chat" : "Chat"}
                        </Button>
                      )}
                    </div>

                    {activeThread?.id === req.id && (
                      <>
                        <Separator />
                        <MessageThread request={req} />
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={!!requestDialogMentor} onOpenChange={(open) => !open && setRequestDialogMentor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
          </DialogHeader>
          {requestDialogMentor && (
            <div className="space-y-4 mt-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium text-sm">{requestDialogMentor.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {requestDialogMentor.specialization} · {requestDialogMentor.college_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="request-msg">
                  Introduce yourself and describe what guidance you need *
                </label>
                <Textarea
                  id="request-msg"
                  placeholder="Hi! I'm a 2nd year BAMS student and I need help with..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSendRequest} disabled={sending} className="w-full">
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorConnect;
