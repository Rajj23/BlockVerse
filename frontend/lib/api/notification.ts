import api from "./axios";
import { NotificationResponse } from "@/types";

export const notificationApi = {
  getAll: () =>
    api.get<NotificationResponse[]>("/v1/notifications"),

  getUnread: () =>
    api.get<NotificationResponse[]>("/v1/notifications/unread"),

  markRead: (id: number) =>
    api.put(`/v1/notifications/${id}/read`),

  markAllRead: () =>
    api.put("/v1/notifications/read-all"),
};