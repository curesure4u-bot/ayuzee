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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, AlertTriangle, Send, ChevronDown, ChevronUp } from "lucide-react";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface SupportTicket {
  id: string;
  therapist_id: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  admin_response: string;
  resolved_at: string;
  created_at: string;
}

const FAQ_ITEMS = [
  { q: "How do I update my availability?", a: "Go to the Availability page from the sidebar. You can add/remove time slots for each day of the week and block specific dates." },
  { q: "How do I get paid for completed sessions?", a: "Payments are processed automatically after session completion. Check your Earnings page for payment status and history." },
  { q: "What if a patient has an adverse reaction?", a: "Stop the treatment immediately, ensure patient safety, and use the Emergency Protocol section below. Then submit an urgent support ticket." },
  { q: "How do I update my profile and certifications?", a: "Visit your Profile page to update your details, upload certifications, and manage your specializations." },
  { q: "Can I reschedule a session?", a: "Yes, from your Sessions page you can reschedule upcoming sessions. Notify the patient at least 24 hours in advance." },
  { q: "How do I contact a prescribing doctor?", a: "Use the Communication Hub to send a message to the doctor. Select 'Doctor' as recipient type and choose the appropriate message type." },
];

const CATEGORIES = ["payment", "scheduling", "technical", "emergency", "feedback", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function TherapistSupportPage() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // New ticket form
  const [category, setCategory] = useState("technical");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [therapist.id]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("therapist_support_tickets")
      .select("*")
      .eq("therapist_id", therapist.id)
      .order("created_at", { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  };

  const submitTicket = async () => {
    if (!subject || !description) {
      toast.error("Subject and description are required");
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("therapist_support_tickets").insert({
      therapist_id: therapist.id,
      category,
      subject,
      description,
      priority,
      status: "open",
    });

    if (error) {
      toast.error("Failed to submit ticket");
    } else {
      toast.success("Support ticket submitted");
      setSubject("");
      setDescription("");
      setPriority("medium");
      setCategory("technical");
      fetchTickets();
    }
    setSubmitting(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-700";
      case "in_progress": return "bg-yellow-100 text-yellow-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "closed": return "bg-gray-100 text-gray-700";
      default: return "";
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading support...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HelpCircle className="w-6 h-6" />Help & Support
      </h1>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border rounded-lg">
              <button
                className="w-full p-3 text-left flex items-center justify-between"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <span className="font-medium text-sm">{item.q}</span>
                {expandedFaq === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedFaq === i && (
                <div className="px-3 pb-3">
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />Emergency Protocols
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-sm">Adverse Reaction During Therapy</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1 space-y-1">
              <li>Stop the treatment immediately</li>
              <li>Ensure patient is in a safe, comfortable position</li>
              <li>Check vitals (pulse, breathing, consciousness)</li>
              <li>Call emergency services if severe reaction (Dial 108/112)</li>
              <li>Notify the prescribing doctor via Communication Hub (mark as urgent)</li>
              <li>Document the incident in session notes</li>
              <li>Submit an urgent support ticket with category "Emergency"</li>
            </ol>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-sm">Patient Discomfort / Mild Reaction</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1 space-y-1">
              <li>Reduce intensity or pause treatment</li>
              <li>Ask patient about their comfort level</li>
              <li>Provide water and allow rest</li>
              <li>Modify treatment plan as needed</li>
              <li>Document in patient notes for future reference</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Submit Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Report a Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about your issue..." rows={4} />
          </div>
          <Button onClick={submitTicket} disabled={submitting}>
            <Send className="w-4 h-4 mr-2" />{submitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>My Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-muted-foreground text-center">No tickets submitted yet</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{ticket.subject}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                        <Badge variant="outline" className="text-xs">{ticket.priority}</Badge>
                      </div>
                    </div>
                    <Badge className={`text-xs ${statusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  {ticket.admin_response && (
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs font-medium">Admin Response:</p>
                      <p className="text-sm">{ticket.admin_response}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(ticket.created_at).toLocaleDateString()}
                    {ticket.resolved_at && ` | Resolved: ${new Date(ticket.resolved_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
