import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, Send, Users } from "lucide-react";

const HmsInviteFriends = () => {
  const [provider, setProvider] = useState("");
  const [emails, setEmails] = useState("");
  const [phones, setPhones] = useState("");

  const handleSend = () => {
    if (provider === "sms") {
      if (!phones.trim()) { toast.error("Please enter phone numbers"); return; }
      toast.success(`SMS invitations sent to ${phones.split(",").length} contacts`);
    } else if (provider === "email") {
      if (!emails.trim()) { toast.error("Please enter email addresses"); return; }
      toast.success(`Email invitations sent to ${emails.split(",").length} contacts`);
    } else if (provider) {
      toast.success(`Redirecting to ${provider} contacts...`);
    } else {
      toast.error("Please select a service provider");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-orange-600 text-center">Invite Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6">
            <p className="text-sm text-amber-800">
              Now, it is easy to invite your friends to MocDoc. We will send a invitation mail about MocDoc to your friends, they can then follow you by signing into MocDoc.
            </p>
          </div>

          <p className="text-sm font-medium mb-4">Please select your service provider listed below</p>

          <RadioGroup value={provider} onValueChange={setProvider} className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="flex items-center space-x-2 border rounded p-3 hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="gmail" id="gmail" />
                <Label htmlFor="gmail" className="cursor-pointer flex items-center gap-1">
                  <span className="text-sm font-medium">Gmail</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded p-3 hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="yahoo" id="yahoo" />
                <Label htmlFor="yahoo" className="cursor-pointer">
                  <span className="text-sm font-bold text-purple-700">YAHOO!</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded p-3 hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="hotmail" id="hotmail" />
                <Label htmlFor="hotmail" className="cursor-pointer">
                  <span className="text-xs">Windows Live<br/><span className="text-[10px] text-muted-foreground">Hotmail</span></span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded p-3 hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="cursor-pointer flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">By Email</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded p-3 hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="cursor-pointer flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">By SMS</span>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Email Input */}
          {provider === "email" && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label>Email Addresses (comma separated)</Label>
                <Textarea
                  placeholder="friend1@email.com, friend2@email.com, ..."
                  rows={3}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
              </div>
              <div>
                <Label>Personal Message (optional)</Label>
                <Textarea placeholder="Hi! I'm using this HMS software and thought you might find it useful..." rows={2} />
              </div>
            </div>
          )}

          {/* SMS Input */}
          {provider === "sms" && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label>Phone Numbers (comma separated, with +91)</Label>
                <Textarea
                  placeholder="+91-9876543210, +91-8765432109, ..."
                  rows={3}
                  value={phones}
                  onChange={(e) => setPhones(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Gmail/Yahoo/Hotmail info */}
          {(provider === "gmail" || provider === "yahoo" || provider === "hotmail") && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Clicking "Send Invitations" will open a secure {provider === "gmail" ? "Google" : provider === "yahoo" ? "Yahoo" : "Microsoft"} login window 
                where you can select contacts to invite. No passwords are stored.
              </p>
            </div>
          )}

          {provider && (
            <div className="mt-6">
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSend}>
                <Send className="mr-2 h-4 w-4" /> Send Invitations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsInviteFriends;
