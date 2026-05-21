"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Sun, Moon, ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { notificationApi } from "@/lib/api/notification";
import { NotificationResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Share2, Copy, Check } from "lucide-react";
import { documentApi } from "@/lib/api/document";
const notificationIcons: Record<string, string> = {
  INVITE: "👋", CREATE: "📄", UPDATE: "✏️", ARCHIVE: "📦",
  UNARCHIVE: "📂", DELETE: "🗑️", RESTORE: "♻️", PERMANENT_DELETE: "❌",
  SHARE: "🔗", LEAVE: "👤", COMMENT: "💬", ADD_MEMBER: "➕",
  REMOVE_MEMBER: "➖", ROLE_CHANGE: "🔑", TRANSFER_OWNERSHIP: "👑",
};

interface EditorNavbarProps {
  workspaceId: number;
  documentId: number;
}

export default function EditorNavbar(props: EditorNavbarProps) {
  const { documentId } = props;
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    notificationApi.getUnread()
      .then(({ data }) => setNotifications(data))
      .catch(() => {});
  }, []);

  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowSharePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleShare = async () => {
    if (shareUrl) { setShowSharePopup(true); return; }
    setSharing(true);
    try {
      const { data } = await documentApi.share(documentId, 1440); 
      setShareUrl(data.url);
      setShowSharePopup(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkRead = async (id: number) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  return (
    <div className="h-11 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 bg-white dark:bg-neutral-950 shrink-0">
      {}
      <button
        onClick={() => router.push("/home")}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Home
      </button>

      {}
      <div className="flex items-center gap-1">
        {}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {resolvedTheme === "dark"
              ? <Sun className="w-4 h-4 text-neutral-500" />
              : <Moon className="w-4 h-4 text-neutral-500" />
            }
          </button>
        )}

        {}
        <div className="relative" ref={shareRef}>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            {sharing ? "Sharing..." : "Share"}
          </button>

          {showSharePopup && shareUrl && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 z-50">
              <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Share link</p>
              <p className="text-xs text-neutral-400 mb-3">Anyone with this link can view the document</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && <p className="text-xs text-green-500 mt-2">Copied to clipboard!</p>}
            </div>
          )}
        </div>

        {}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Bell className="w-4 h-4 text-neutral-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-neutral-400">
                    All caught up! 🎉
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer border-b border-neutral-50 dark:border-neutral-800 last:border-0"
                      onClick={() => handleMarkRead(n.id)}
                    >
                      <span className="text-base shrink-0 mt-0.5">
                        {notificationIcons[n.type] || "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 dark:text-white">{n.message}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}