"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { activityApi } from "@/lib/api/activity";
import { ActivityFeedResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function ActivityPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = use(params);
  const [feed, setFeed] = useState<ActivityFeedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (pageNum: number) => {
    try {
      const { data } = await activityApi.getFeed(parseInt(wsId), pageNum, 20);
      if (pageNum === 0) setFeed(data);
      else setFeed((prev) => [...prev, ...data]);
      if (data.length < 20) setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [wsId]);

  useEffect(() => { loadFeed(0); }, [wsId, loadFeed]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFeed(next);
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Activity</h1>

      {loading ? (
        <div className="text-sm text-neutral-400 text-center py-8">Loading...</div>
      ) : feed.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Activity className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-400">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {feed.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {item.userId}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 dark:text-white">
                  <span className="font-medium">{item.action}</span>
                  <span className="text-neutral-500"> on </span>
                  <span className="font-medium">{item.entityType}</span>
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mt-2"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}