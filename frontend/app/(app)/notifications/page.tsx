"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { notificationApi } from "@/lib/api/notification";
import { NotificationResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

const notificationIcons: Record<string, string> = {
  INVITE: "👋", CREATE: "📄", UPDATE: "✏️", ARCHIVE: "📦",
  UNARCHIVE: "📂", DELETE: "🗑️", RESTORE: "♻️", PERMANENT_DELETE: "❌",
  SHARE: "🔗", LEAVE: "👤", COMMENT: "💬", ADD_MEMBER: "➕",
  REMOVE_MEMBER: "➖", ROLE_CHANGE: "🔑", TRANSFER_OWNERSHIP: "👑",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.getAll()
      .then(({ data }) => setNotifications(data))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: number) => {
    await notificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-neutral-400 text-center py-8">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Bell className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-400">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={clsx(
                "flex items-start gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                !n.read
                  ? "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
              )}
            >
              <span className="text-lg shrink-0 mt-0.5">
                {notificationIcons[n.type] || "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  "text-sm",
                  !n.read ? "font-medium text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"
                )}>
                  {n.message}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}