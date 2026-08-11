import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Inbox, AlertCircle, Plus } from "lucide-react";
import { NO_DIRECT_CONTACT_NOTICE } from "@/utils/therapistPrivacy";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface Message {
  id: string;
  sender_type: string;
  sender_id: string;
  recipient_type: string;
  recipient_id: string;
  session_id: string;
  subject: string;
  message: string;
  is_read: boolean;
  read_at: string;
  is_urgent: boolean;
  message_type: string;
  created_at: string;
}

const MESSAGE_TYPES = ["general", "instruction", "clarification", "adverse_event", "follow_up", "handoff"];

export default function TherapistCommunication() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Compose form state
  const [newRecipientType, setNewRecipientType] = useState("doctor");
  const [newRecipientId, setNewRecipientId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newIsUrgent, setNewIsUrgent] = useState(false);
  const [newMessageType, setNewMessageType] = useState("general");

  useEffect(() => {
    fetchMessages();
  }, [therapist.id]);

  const fetchMessages = async () => {
    setLoading(true);
    const [inboxRes, sentRes] = await Promise.all([
      (supabase as any)
        .from("therapist_messages")
        .select("*")
        .eq("recipient_id", therapist.id)
        .eq("recipient_type", "therapist")
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("therapist_messages")
        .select("*")
        .eq("sender_id", therapist.id)
        .eq("sender_type", "therapist")
        .order("created_at", { ascending: false }),
    ]);

    if (inboxRes.data) setInboxMessages(inboxRes.data);
    if (sentRes.data) setSentMessages(sentRes.data);
    setLoading(false);
  };

  const markAsRead = async (msg: Message) => {
    if (msg.is_read) {
      setSelectedMessage(msg);
      return;
    }
    await (supabase as any)
      .from("therapist_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", msg.id);
    setInboxMessages(inboxMessages.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    setSelectedMessage({ ...msg, is_read: true });
  };

  const sendMessage = async () => {
    if (!newSubject || !newMessage) {
      toast.error("Subject and message are required");
      return;
    }
    const { error } = await (supabase as any).from("therapist_messages").insert({
      sender_type: "therapist",
      sender_id: therapist.id,
      recipient_type: newRecipientType,
      recipient_id: newRecipientId || null,
      subject: newSubject,
      message: newMessage,
      is_urgent: newIsUrgent,
      message_type: newMessageType,
      is_read: false,
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent");
      setComposeOpen(false);
      setNewSubject("");
      setNewMessage("");
      setNewRecipientId("");
      setNewIsUrgent(false);
      setNewMessageType("general");
      fetchMessages();
    }
  };

  const unreadCount = inboxMessages.filter((m) => !m.is_read).length;

  const filterMessages = (msgs: Message[]) =>
    msgs.filter((m) => filterType === "all" || m.message_type === filterType);

  const renderMessageList = (messages: Message[], isInbox: boolean) => (
    <div className="space-y-2">
      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No messages</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
              isInbox && !msg.is_read ? "border-primary bg-primary/5 font-medium" : ""
            } ${selectedMessage?.id === msg.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => (isInbox ? markAsRead(msg) : setSelectedMessage(msg))}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {msg.is_urgent && <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-sm">{msg.subject || "(No Subject)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{msg.message_type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{msg.message}</p>
            <div className="text-xs text-muted-foreground mt-1">
              {isInbox ? `From: ${msg.sender_type}` : `To: ${msg.recipient_type}`}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6" />Communication Hub
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </h1>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Message</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipient Type</Label>
                  <Select value={newRecipientType} onValueChange={setNewRecipientType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="system">System/Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message Type</Label>
                  <Select value={newMessageType} onValueChange={setNewMessageType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Recipient ID (optional)</Label>
                <Input value={newRecipientId} onChange={(e) => setNewRecipientId(e.target.value)} placeholder="Leave blank for general" />
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Message subject" />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." rows={4} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newIsUrgent} onCheckedChange={setNewIsUrgent} />
                <Label>Mark as Urgent</Label>
              </div>
              <Button onClick={sendMessage} className="w-full">
                <Send className="w-4 h-4 mr-2" />Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {MESSAGE_TYPES.map((t) => (
            <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="inbox">
            <TabsList>
              <TabsTrigger value="inbox">
                <Inbox className="w-4 h-4 mr-1" />Inbox
                {unreadCount > 0 && <Badge variant="destructive" className="ml-1 text-xs">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="w-4 h-4 mr-1" />Sent
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox" className="mt-4">
              {renderMessageList(filterMessages(inboxMessages), true)}
            </TabsContent>
            <TabsContent value="sent" className="mt-4">
              {renderMessageList(filterMessages(sentMessages), false)}
            </TabsContent>
          </Tabs>
        </div>

        {/* Message Detail */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {selectedMessage.is_urgent && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <CardTitle className="text-base">{selectedMessage.subject || "(No Subject)"}</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{selectedMessage.message_type}</Badge>
                  <span>From: {selectedMessage.sender_type}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a message to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
