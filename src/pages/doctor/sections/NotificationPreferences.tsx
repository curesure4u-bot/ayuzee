import { useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bell,
  MessageSquare,
  ShoppingCart,
  Calendar,
  UserPlus,
  FileText,
  Star,
  TrendingUp,
  Stethoscope,
  Save,
} from "lucide-react";

interface NotifPref {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
  default: boolean;
}

const NOTIFICATION_OPTIONS: NotifPref[] = [
  { key: "new_appointment", label: "New Appointment Booking", description: "When a patient books a consultation with you", icon: Calendar, category: "Appointments", default: true },
  { key: "appointment_reminder", label: "Appointment Reminders", description: "30-min before your scheduled consultations", icon: Calendar, category: "Appointments", default: true },
  { key: "appointment_cancelled", label: "Cancellation Alerts", description: "When a patient cancels their booking", icon: Calendar, category: "Appointments", default: true },
  { key: "new_patient_order", label: "New Patient Order", description: "When a partner order is placed for your patient", icon: ShoppingCart, category: "Orders", default: true },
  { key: "order_delivered", label: "Order Delivered", description: "Confirmation when patient receives medicines", icon: ShoppingCart, category: "Orders", default: false },
  { key: "margin_payout", label: "Margin Payout", description: "Weekly payout processed notification", icon: TrendingUp, category: "Orders", default: true },
  { key: "new_referral", label: "New Case Referral", description: "When another doctor sends you a referral", icon: Stethoscope, category: "Community", default: true },
  { key: "new_follower", label: "New Follower", description: "When a doctor or patient follows you", icon: UserPlus, category: "Community", default: false },
  { key: "post_liked", label: "Post Liked / Commented", description: "Interactions on your feed posts", icon: MessageSquare, category: "Community", default: false },
  { key: "article_published", label: "Article Approved", description: "When your article is published after review", icon: FileText, category: "Community", default: true },
  { key: "new_review", label: "New Patient Review", description: "When a patient leaves a rating/review", icon: Star, category: "Feedback", default: true },
  { key: "mention", label: "@Mention in Feed", description: "When someone tags you in a discussion", icon: MessageSquare, category: "Community", default: true },
  { key: "webinar_reminder", label: "Webinar Reminders", description: "Upcoming webinars and CME sessions", icon: Bell, category: "Learning", default: true },
  { key: "platform_updates", label: "Platform Updates", description: "New features, offers, and announcements", icon: Bell, category: "General", default: false },
];

const NotificationPreferences = () => {
  const { doctor } = useDoctor();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NOTIFICATION_OPTIONS.forEach((o) => { initial[o.key] = o.default; });
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const togglePref = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, save to a user_notification_preferences table
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Notification preferences saved!");
    setSaving(false);
  };

  const categories = [...new Set(NOTIFICATION_OPTIONS.map((o) => o.category))];
  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground">Choose what notifications you want to receive.</p>
        </div>
        <Badge variant="outline">{enabledCount}/{NOTIFICATION_OPTIONS.length} enabled</Badge>
      </div>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-4">
            {NOTIFICATION_OPTIONS.filter((o) => o.category === category).map((option) => (
              <div key={option.key} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition">
                <div className="flex items-center gap-3">
                  <option.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <Switch checked={prefs[option.key]} onCheckedChange={() => togglePref(option.key)} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
