import { useState } from "react";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastRecord {
  id: string;
  segment: string;
  channel: string;
  subject: string;
  priority: string;
  sentAt: string;
}

export default function AdminBroadcast() {
  const [segment, setSegment] = useState("all_users");
  const [channel, setChannel] = useState("in_app");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [sendNow, setSendNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<BroadcastRecord[]>([]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    setSending(true);
    try {
      await (supabase as any).from("platform_audit_log").insert({
        action_type: "broadcast",
        module: "notifications",
        description: subject,
        metadata: {
          segment,
          channel,
          message,
          priority,
          scheduled: sendNow ? "immediate" : scheduledDate,
        },
      });

      const record: BroadcastRecord = {
        id: Date.now().toString(),
        segment,
        channel,
        subject,
        priority,
        sentAt: new Date().toLocaleString(),
      };
      setHistory((prev) => [record, ...prev]);

      toast.success("Broadcast sent successfully");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Megaphone className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">Broadcast & Announcements</h1>
          <p className="text-muted-foreground">Send announcements by segment</p>
        </div>
      </div>

      {/* Compose Form */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Broadcast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Recipient Segment</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="all_doctors">All Doctors</SelectItem>
                  <SelectItem value="all_therapists">All Therapists</SelectItem>
                  <SelectItem value="all_venues">All Venues</SelectItem>
                  <SelectItem value="all_students">All Students</SelectItem>
                  <SelectItem value="all_patients">All Patients</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-App Notification</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Broadcast subject..."
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
              rows={5}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={sendNow} onCheckedChange={setSendNow} />
              <Label>Send Now</Label>
            </div>
            {!sendNow && (
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-[250px]"
              />
            )}
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full md:w-auto">
            {sending ? "Sending..." : "Send Broadcast"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No broadcasts sent in this session.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.subject}</TableCell>
                    <TableCell>{record.segment.replace(/_/g, " ")}</TableCell>
                    <TableCell>{record.channel.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.priority === "urgent"
                            ? "destructive"
                            : record.priority === "important"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {record.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.sentAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
