"use client";

import { useEffect, useState, useCallback } from "react";
import { createPusherClient } from "@/lib/pusher-client";
import { CHANNELS, EVENTS } from "@/lib/pusherChannels";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trackedUserId, setTrackedUserId] = useState<string | null>(null);

  // Reset local state when the logged-in user changes (including logout).
  // This runs during render, not in an effect, so it's not a same-tick
  // setState-in-effect and doesn't trigger the lint rule.
  if ((user?.id ?? null) !== trackedUserId) {
    setTrackedUserId(user?.id ?? null);
    setNotifications([]);
    setUnreadCount(0);
  }

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.log("could not load notifications", err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const pusher = createPusherClient();
    const channelName = user.role === "admin" ? CHANNELS.admin : CHANNELS.user(user.id);
    const channel = pusher.subscribe(channelName);

    const handler = (payload: AppNotification) => {
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    channel.bind(EVENTS.NEW_NOTIFICATION, handler);
    channel.bind(EVENTS.NEW_ORDER, handler);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await fetch(`${API_URL}/api/notifications/${id}/read`, { method: "PUT", credentials: "include" });
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch(`${API_URL}/api/notifications/read-all`, { method: "PUT", credentials: "include" });
  }, []);

  return { notifications, unreadCount, markRead, markAllRead };
}