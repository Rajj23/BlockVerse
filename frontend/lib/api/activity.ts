import api from "./axios";
import { ActivityFeedResponse } from "@/types";

export const activityApi = {
  getFeed: (workspaceId: number, page: number, size: number) =>
    api.get<ActivityFeedResponse[]>(`/v1/workspace/${workspaceId}/activity-feed`, {
      params: { page, size }
    }),
};