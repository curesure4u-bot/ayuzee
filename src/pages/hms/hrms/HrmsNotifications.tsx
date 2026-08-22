import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Bell, CheckCircle2, AlertTriangle, Info, Calendar, IndianRupee, FileText, GraduationCap, Users, XCircle } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  { id: "n1", title: "Leave Request Pending", message: "Mohan P has applied for 2 days CL (Aug 25-26). Awaiting your approval.", category: "leave", priority: "high", isRead: false, createdAt: "2026-08-20T10:00:00Z", actionUrl: "/hms/hrms/leave" },
  { id: "n2", title: "Sunita M — 3 Days Absent", message: "Employee has been absent for 3 consecutive days without leave application. Please follow up.", category: "attendance", priority: "urgent", isRead: false, createdAt: "2026-08-21T08:00:00Z", actionUrl: "/hms/hrms/attendance" },
  { id: "n3", title: "Dr. Meena — Registration Expiring", message: "TNBIM registration expires on Sep 15, 2026. Remind employee to renew.", category: "registration_expiry", priority: "high", isRead: false, createdAt: "2026-08-18T09:00:00Z", actionUrl: "/hms/hrms/employees/2" },
  { id: "n4", title: "Fire Safety Training — Sep 15", message: "Mandatory fire safety drill scheduled. 5 staff not yet registered.", category: "training", priority: "normal", isRead: false, createdAt: "2026-08-19T11:00:00Z", actionUrl: "/hms/hrms/training" },
  { id: "n5", title: "Payroll Processing Due", message: "August 2026 payroll attendance lock date is approaching (25th). Ensure corrections are completed.", category: "payroll", priority: "normal", isRead: true, createdAt: "2026-08-20T07:00:00Z", actionUrl: "/hms/hrms/payroll" },
  { id: "n6", title: "Mohan P — Probation Ending", message: "Probation period ends on Sep 1, 2026. Performance review and confirmation decision needed.", category: "probation", priority: "high", isRead: true, createdAt: "2026-08-15T09:00:00Z", actionUrl: "/hms/hrms/employees/9" },
  { id: "n7", title: "New Candidate Applied", message: "Deepa R applied for Panchakarma Therapist vacancy. Review application.", category: "general", priority: "low", isRead: true, createdAt: "2026-08-18T14:00:00Z", actionUrl: "/hms/hrms/recruitment" },
  { id: "n8", title: "Salary Advance Request", message: "Mohan P requested ₹10,000 salary advance. Needs approval.", category: "request", priority: "normal", isRead: false, createdAt: "2026-08-18T10:30:00Z", actionUrl: "/hms/hrms/requests" },
  { id: "n9", title: "BLS Certificate Expiring", message: "Dr. Arun's CPR/BLS certification expires on Sep 15, 2026. Schedule retraining.", category: "document_expiry", priority: "normal", isRead: true, createdAt: "2026-08-16T08:00:00Z", actionUrl: "/hms/hrms/training" },
  { id: "n10", title: "Employee Birthday — Aug 25", message: "Priya Therapist's birthday is on Aug 25. Send wishes!", category: "birthday", priority: "low", isRead: true, createdAt: "2026-08-24T06:00:00Z", actionUrl: null },
];

const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
  leave: { icon: Calendar, color: "text-purple-600 bg-purple-50", label: "Leave" },
  attendance: { icon: AlertTriangle, color: "text-red-600 bg-red-50", label: "Attendance" },
  registration_expiry: { icon: FileText, color: "text-amber-600 bg-amber-50", label: "Expiry" },
  document_expiry: { icon: FileText, color: "text-amber-600 bg-amber-50", label: "Document" },
  training: { icon: GraduationCap, color: "text-blue-600 bg-blue-50", label: "Training" },
  payroll: { icon: IndianRupee, color: "text-green-600 bg-green-50", label: "Payroll" },
  probation: { icon: Users, color: "text-indigo-600 bg-indigo-50", label: "Probation" },
  request: { icon: Info, color: "text-cyan-600 bg-cyan-50", label: "Request" },
  birthday: { icon: Users, color: "text-pink-600 bg-pink-50", label: "Birthday" },
  general: { icon: Bell, color: "text-gray-600 bg-gray-50", label: "General" },
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const HrmsNotifications = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    toast.success("Marked as read");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All marked as read");
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderNotification = (n: typeof MOCK_NOTIFICATIONS[0], showActions: boolean) => {
    const cfg = categoryConfig[n.category] || categoryConfig.general;
    const Icon = cfg.icon;
    return (
      <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border transition ${!n.isRead ? "bg-blue-50/30 border-blue-200" : "hover:bg-muted/20"}`}>
        <div className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${cfg.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</p>
            {n.priority === "urgent" && <Badge className={`text-[8px] border-0 ${priorityColors.urgent}`}>Urgent</Badge>}
            {n.priority === "high" && <Badge className={`text-[8px] border-0 ${priorityColors.high}`}>Important</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] text-muted-foreground">
              {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
            <Badge variant="outline" className="text-[8px]">{cfg.label}</Badge>
          </div>
        </div>
        {showActions && (
          <div className="flex flex-col gap-1 shrink-0">
            {!n.isRead && <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => markRead(n.id)} title="Mark read"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /></Button>}
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => dismiss(n.id)} title="Dismiss"><XCircle className="h-3.5 w-3.5 text-gray-400" /></Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-blue-600" /> Notifications</h1>
          <p className="text-sm text-muted-foreground">HR alerts, reminders & action items</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark All Read ({unread.length})</Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-blue-100"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-700">{unread.length}</p><p className="text-[9px] text-muted-foreground">Unread</p></CardContent></Card>
        <Card className="border-red-100"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-700">{unread.filter((n) => n.priority === "urgent" || n.priority === "high").length}</p><p className="text-[9px] text-muted-foreground">High Priority</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{notifications.length}</p><p className="text-[9px] text-muted-foreground">Total</p></CardContent></Card>
      </div>

      <Tabs defaultValue="unread">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-2">
          {unread.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">All caught up! No unread notifications.</CardContent></Card>
          ) : (
            unread.map((n) => renderNotification(n, true))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2">
          {notifications.map((n) => renderNotification(n, true))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsNotifications;
