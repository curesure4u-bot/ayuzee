import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { MessageCircle, Send, User, Stethoscope, Search } from "lucide-react";

type Message = { id: string; from: string; text: string; time: string; isMe: boolean };
type Contact = { name: string; role: string; branch: string; online: boolean; lastMsg: string };

const contacts: Contact[] = [
  { name: "Dr. Sahana Fathima", role: "BAMS", branch: "Kadayanallur", online: true, lastMsg: "Patient referred for PK" },
  { name: "Dr. Meena Patel", role: "Panchakarma Head", branch: "Main Hospital", online: true, lastMsg: "Virechana slot available Thu" },
  { name: "Dr. Priya Das", role: "Homeopathy", branch: "City Center", online: false, lastMsg: "Sent repertory analysis" },
  { name: "Dr. Suriya", role: "BAMS", branch: "Rajapalayam", online: true, lastMsg: "Need consult on OA case" },
  { name: "Pharmacist Sindhu", role: "Pharmacy", branch: "Kadayanallur", online: true, lastMsg: "Rasnasaptakam back in stock" },
];

const mockMessages: Message[] = [
  { id: "1", from: "Dr. Sahana Fathima", text: "Hi Dr. Saleem, I have a patient with chronic Gridhrasi not responding to oral meds. Can you take over for Panchakarma?", time: "10:15 AM", isMe: false },
  { id: "2", from: "Me", text: "Sure, please refer. What's the current Rx and how long has the pain been?", time: "10:18 AM", isMe: true },
  { id: "3", from: "Dr. Sahana Fathima", text: "2 months on Yogaraja Guggulu + Rasnadi. Pain still 7/10. SLR positive 40°. I think Kati Basti + Agnikarma would help.", time: "10:20 AM", isMe: false },
  { id: "4", from: "Me", text: "Agreed. Send the patient for admission tomorrow. I'll plan 7 days Kati Basti + 3 Agnikarma sittings. Any drug allergies?", time: "10:22 AM", isMe: true },
  { id: "5", from: "Dr. Sahana Fathima", text: "No known allergies. Patient ID: AL-15291 (Mrs. Kalpana). I'll send referral through system. Thanks!", time: "10:24 AM", isMe: false },
];

const DoctorChat = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const [selectedContact, setSelectedContact] = useState("Dr. Sahana Fathima");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), from: "Me", text: input, time: "Now", isMe: true }]);
    setInput("");
    toast.success("Message sent");
  };

  return (
    <div className="p-6 space-y-0 h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4"><MessageCircle className="h-6 w-6 text-blue-600" /> Doctor-to-Doctor Chat</h1>

      <div className="grid grid-cols-3 gap-4 h-[calc(100%-60px)]">
        {/* Contacts */}
        <Card className="col-span-1 flex flex-col">
          <CardHeader className="pb-2 shrink-0"><div className="relative"><Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search doctors..." className="pl-8 h-8 text-xs" /></div></CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {contacts.map(c => (
              <div key={c.name} onClick={() => setSelectedContact(c.name)} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b ${selectedContact === c.name ? "bg-blue-50" : ""}`}>
                <div className="relative"><div className="h-9 w-9 rounded-full bg-blue-100 grid place-items-center"><Stethoscope className="h-4 w-4 text-blue-600" /></div>{c.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p><p className="text-[10px] text-muted-foreground truncate">{c.lastMsg}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="col-span-2 flex flex-col">
          <CardHeader className="pb-2 shrink-0 border-b"><div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-blue-600" /><div><p className="text-sm font-medium">{selectedContact}</p><p className="text-[10px] text-muted-foreground">Online · {contacts.find(c => c.name === selectedContact)?.branch}</p></div></div></CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg p-3 ${m.isMe ? "bg-blue-600 text-white" : "bg-muted"}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.isMe ? "text-blue-200" : "text-muted-foreground"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-3 flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type message..." className="flex-1" />
              <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorChat;
