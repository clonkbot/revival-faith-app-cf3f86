import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { X, Bell, Check, CheckCheck, Heart, Church, BookOpen, Loader2 } from "lucide-react";

interface Notification {
  _id: Id<"notifications">;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: number;
}

interface NotificationPanelProps {
  onClose: () => void;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  prayer_reminder: { icon: Heart, color: "text-amber-400", bg: "bg-amber-500/20" },
  church_reminder: { icon: Church, color: "text-rose-400", bg: "bg-rose-500/20" },
  resource_update: { icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/20" },
};

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = useQuery(api.notifications.list);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const unreadNotifications = notifications?.filter((n: Notification) => !n.isRead) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="w-full sm:w-96 h-full sm:h-auto sm:max-h-[80vh] bg-stone-900 sm:m-4 sm:rounded-2xl border-l sm:border border-amber-500/20 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl text-amber-100">Notifications</h2>
              <p className="text-amber-200/50 text-xs">
                {unreadNotifications.length} unread
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && (
              <motion.button
                onClick={() => markAllAsRead({})}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg text-amber-200/50 hover:text-amber-200 hover:bg-stone-800 transition-all"
                title="Mark all as read"
              >
                <CheckCheck className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-amber-200/50 hover:text-amber-200 hover:bg-stone-800 transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
          {notifications === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-amber-500/30 mx-auto mb-4" />
              <p className="text-amber-200/50">No notifications yet</p>
              <p className="text-amber-200/30 text-sm mt-1">
                You'll receive prayer reminders every minute
              </p>
            </div>
          ) : (
            notifications.map((notification: Notification, index: number) => {
              const config = typeConfig[notification.type] || typeConfig.prayer_reminder;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-3 md:p-4 rounded-xl border transition-all ${
                    notification.isRead
                      ? "bg-stone-800/30 border-transparent"
                      : "bg-stone-800/60 border-amber-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.isRead ? "text-amber-200/50" : "text-amber-100"}`}>
                        {notification.message}
                      </p>
                      <p className="text-amber-200/30 text-xs mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <motion.button
                        onClick={() => markAsRead({ id: notification._id })}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg text-amber-200/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
