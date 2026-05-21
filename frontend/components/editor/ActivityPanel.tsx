"use client";

import { useEffect, useRef, useState } from "react";
import { activityApi } from "@/lib/api/activity";
import { useDocumentStore } from "@/lib/store/documentStore";
import { useAuthStore } from "@/lib/store/authStore";

interface ActivityCapsule {
  id: string;
  label: string;
  color: string;
}

const actionColors: Record<string, string> = {
  DOCUMENT_CREATED:  "bg-green-500/20 text-green-400 border-green-500/30",
  DOCUMENT_UPDATED:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DOCUMENT_DELETED:  "bg-red-500/20 text-red-400 border-red-500/30",
  DOCUMENT_ARCHIVED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DOCUMENT_RESTORED: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  DOCUMENT_SHARED:   "bg-purple-500/20 text-purple-400 border-purple-500/30",
  BLOCK_CREATED:     "bg-green-500/20 text-green-400 border-green-500/30",
  BLOCK_UPDATED:     "bg-blue-500/20 text-blue-400 border-blue-500/30",
  BLOCK_DELETED:     "bg-red-500/20 text-red-400 border-red-500/30",
  BLOCK_MOVED:       "bg-purple-500/20 text-purple-400 border-purple-500/30",
  USER_ADDED:        "bg-teal-500/20 text-teal-400 border-teal-500/30",
  USER_REMOVED:      "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ROLE_CHANGED:      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const userColors = [
  "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "bg-teal-500/20 text-teal-400 border-teal-500/30",
];

export default function ActivityPanel({ workspaceId }: { workspaceId: number }) {
  const [capsules, setCapsules] = useState<ActivityCapsule[]>([]);
  
  
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const { activeUsers, typingUsers } = useDocumentStore();
  const { user } = useAuthStore();

  useEffect(() => {
    
    activityApi.getFeed(workspaceId, 0, 10)
      .then(({ data }) => {
        data.forEach((item) => {
          seenIdsRef.current.add(
            `${item.userId}-${item.action}-${item.createdAt}`
          );
        });
        initializedRef.current = true;
      })
      .catch(() => { initializedRef.current = true; });

    
    const interval = setInterval(async () => {
      if (!initializedRef.current) return;
      try {
        const { data } = await activityApi.getFeed(workspaceId, 0, 10);
        const newItems = data.filter((item) => {
          const id = `${item.userId}-${item.action}-${item.createdAt}`;
          return !seenIdsRef.current.has(id);
        });

        if (newItems.length === 0) return;

        
        newItems.forEach((item) => {
          seenIdsRef.current.add(
            `${item.userId}-${item.action}-${item.createdAt}`
          );
        });

        
        newItems.forEach((item, index) => {
          const capsuleId = `${item.userId}-${item.action}-${Date.now()}-${index}`;
          const label = `User ${item.userId} · ${item.action.replace(/_/g, " ").toLowerCase()}`;
          const color = actionColors[item.action] || "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";

          
          setTimeout(() => {
            setCapsules((prev) => [...prev, { id: capsuleId, label, color }]);

            
            setTimeout(() => {
              setCapsules((prev) => prev.filter((c) => c.id !== capsuleId));
            }, 3000);
          }, index * 300);
        });

      } catch {}
    }, 8000);

    return () => clearInterval(interval);
  }, [workspaceId]);

  const otherUsers = activeUsers.filter((u) => u.userId !== user?.id);
  const typingOthers = typingUsers
    .filter((t) => t.userId !== user?.id)
    .map((t) => activeUsers.find((u) => u.userId === t.userId))
    .filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">

      {}
      {otherUsers.map((u, i) => (
        <div
          key={u.userId}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${userColors[i % userColors.length]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {u.userName}
        </div>
      ))}

      {}
      {typingOthers.map((u) => u && (
        <div
          key={`typing-${u.userId}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-neutral-500/20 text-neutral-300 border-neutral-500/30"
        >
          <span className="flex gap-0.5 items-center">
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          {u.userName} typing
        </div>
      ))}

      {}
      {capsules.map((capsule) => (
        <div
          key={capsule.id}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${capsule.color} animate-fade-in`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {capsule.label}
        </div>
      ))}

      {}
      {otherUsers.length === 0 && capsules.length === 0 && typingOthers.length === 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border bg-neutral-500/10 text-neutral-500 border-neutral-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Only you
        </div>
      )}
    </div>
  );
}