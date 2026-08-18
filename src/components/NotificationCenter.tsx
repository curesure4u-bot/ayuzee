import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell, CheckCircle, Clock, AlertTriangle, ShoppingBag, Calendar,
  MessageSquare, ListChecks, X, Check, Trash2, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  source_module: string;
  source_url: string | null;
  is_read: boolean;
  priority: string;
  created_at: string;
};

const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  task_overdue: { icon: AlertTriangle, color: "text-red-500" },
  task_due_today: { icon: Clock, color: "text-amber-500" },
  task_assigned: { icon: ListChecks, color: "text-blue-500" },
  task_completed: { icon: CheckCircle, color: "text-green-500" },
  appointment_upcoming: { icon: Calendar, color: "text-purple-500" },
  appointment_cancelled: { icon: X, color: "text-red-500" },
  appointment_reminder: { icon: Clock, color: "text-indigo-500" },
  order_placed: { icon: ShoppingBag, color: "text-teal-500" },
  order_shipped: { icon: ShoppingBag, color: "text-blue-500" },
  order_delivered: { icon: CheckCircle, color: "text-green-500" },
  message_received: { icon: MessageSquare, color: "text-violet-500" },
  feedback_received: { icon: MessageSquare, color: "text-pink-500" },
  system: { icon: Info, color: "text-gray-500" },
  info: { icon: Info, color: "text-blue-500" },
  warning: { icon: AlertTriangle, color: "text-amber-500" },
  success: { icon: CheckCircle, color: "text-green-500" },
};

// Generate sample notifications (these would come from DB in production)
function generateSampleNotifications(): Notification[] {
  const now = new Date();
  return [
    { id: "n1", title: "Task Overdue", message: "\"Insurance claim submissions\" was due 2 days ago", type: "task_overdue", source_module: "task_tracker", source_url: "/task-tracker/variable-tasks", is_read: false, priority: "high", created_at: new Date(now.getTime() - 600000).toISOString() },
    { id: "n2", title: "Appointment Tomorrow", message: "Patient Ramesh Kumar — 10:00 AM consultation", type: "appointment_upcoming", source_module: "appointments", source_url: "/doctor/appointments", is_read: false, priority: "normal", created_at: new Date(now.getTime() - 3600000).toISOString() },
    { id: "n3", title: "Task Due Today", message: "\"Weekly meeting preparation\" is due today", type: "task_due_today", source_module: "task_tracker", source_url: "/task-tracker/variable-tasks", is_read: false, priority: "normal", created_at: new Date(now.getTime() - 7200000).toISOString() },
    { id: "n4", title: "Order Delivered", message: "Your order #AY-2847 has been delivered", type: "order_delivered", source_module: "orders", source_url: "/dashboard/orders", is_read: true, priority: "low", created_at: new Date(now.getTime() - 86400000).toISOString() },
    { id: "n5", title: "New Feedback", message: "Patient Mrs. Lakshmi left a 5-star review", type: "feedback_received", source_module: "feedback", source_url: "/doctor/feedback", is_read: true, priority: "low", created_at: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: "n6", title: "Task Completed", message: "\"End-of-day billing reconciliation\" marked done", type: "task_completed", source_module: "task_tracker", source_url: "/task-tracker", is_read: true, priority: "low", created_at: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: "n7", title: "3 High-Priority Tasks Aging", message: "Consider delegating or starting a focus session", type: "warning", source_module: "task_tracker", source_url: "/task-tracker/notifications", is_read: false, priority: "high", created_at: new Date(now.getTime() - 1800000).toISOString() },
  ];
}

/**
 * Unified Notification Center — bell icon in header.
 * Aggregates notifications from all modules.
 */
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>(generateSampleNotifications());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Try to load from Supabase (gracefully fails if table doesn't exist yet)
  useEffect(() => {
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        const { data, error } = await (supabase as any)
          .from("unified_notifications")
          .select("*")
          .eq("user_id", session.session.user.id)
          .eq("is_dismissed", false)
          .order("created_at", { ascending: false })
          .limit(20);
        if (!error && data && data.length > 0) {
          setNotifications(data);
        }
      } catch {
        // Table may not exist yet — use sample data
      }
    })();
  }, []);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    // Also update in DB
    (supabase as any).from("unified_notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id).then(() => {});
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.source_url) {
      navigate(notif.source_url);
      setOpen(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" title="Notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 text-[11px] font-bold text-white px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && <Badge variant="destructive" className="text-[9px] h-4">{unreadCount} new</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={markAllRead}>
              <Check className="mr-0.5 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map(notif => {
                const typeConfig = TYPE_ICONS[notif.type] || TYPE_ICONS.info;
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!notif.is_read ? "bg-blue-50/50" : ""}`}
                    onClick={() => handleClick(notif)}
                  >
                    <div className={`mt-0.5 shrink-0 ${typeConfig.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-medium truncate ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-muted-foreground">{timeAgo(notif.created_at)}</span>
                        {notif.priority === "high" || notif.priority === "urgent" ? (
                          <Badge variant="destructive" className="text-[8px] h-3 px-1">
                            {notif.priority}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-500 text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { navigate("/task-tracker/notifications"); setOpen(false); }}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
