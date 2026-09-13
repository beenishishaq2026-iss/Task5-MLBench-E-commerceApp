"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Package, Megaphone, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";

const TYPE_ICON: Record<AppNotification["type"], typeof Package> = {
  "order-status": Package,
  "new-order": Sparkles,
  promo: Megaphone,
};

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // close the full panel on outside click / Escape, like a real dropdown
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleToggle() {
    setHovering(false);
    setOpen((v) => {
      const next = !v;
      // opening the panel clears the unread badge, like a real inbox
      if (next && unreadCount > 0) {
        markAllRead();
      }
      return next;
    });
  }

  // small delay on mouse-leave so moving from the bell into the preview
  // doesn't instantly close it — this is just a quick peek, not a click target
  function handleMouseEnter() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (!open) setHovering(true);
  }
  function handleMouseLeave() {
    hoverTimeout.current = setTimeout(() => setHovering(false), 150);
  }

  const previewNotifications = notifications.slice(0, 3);
  const showHoverPreview = hovering && !open && notifications.length > 0;

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-5 w-5 items-center justify-center border-0 bg-transparent p-0 align-middle leading-none text-ink/80 hover:text-rust"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* lightweight hover peek — a couple of truncated lines, no header/chrome */}
      {showHoverPreview && (
        <div className="absolute right-0 z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-brass/20 bg-white shadow-lg">
          <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-brass/20 bg-white" />
          <div className="relative divide-y divide-brass/10">
            {previewNotifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              return (
                <div key={n._id} className="flex gap-2.5 px-3 py-2.5 text-sm">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass/15 text-rust">
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{n.title}</span>
                    <span className="line-clamp-1 block text-xs text-ink/60">{n.message}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className="block w-full border-t border-brass/20 py-2 text-center text-xs font-medium text-rust hover:bg-cream"
          >
            View all
          </button>
        </div>
      )}

      {/* full panel — opens on click, stays open until dismissed */}
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-brass/20 bg-white shadow-xl">
          <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-brass/20 bg-white" />

          <div className="relative flex items-center justify-between border-b border-brass/20 px-4 py-3">
            <p className="font-[family-name:var(--font-display)] text-base italic text-ink">
              Notifications
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-brass/10 hover:text-rust"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/10 text-ink/40">
                  <Bell size={18} />
                </div>
                <p className="text-sm text-ink/50">You&apos;re all caught up</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                return (
                  <Link
                    key={n._id}
                    href={n.link || "#"}
                    onClick={() => !n.read && markRead(n._id)}
                    className={`flex gap-3 border-b border-brass/10 px-4 py-3 text-sm last:border-b-0 hover:bg-cream ${
                      !n.read ? "bg-rust/5" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/15 text-rust">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate font-medium text-ink">{n.title}</span>
                        {!n.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rust" />
                        )}
                      </span>
                      <span className="line-clamp-2 mt-0.5 block text-ink/60">{n.message}</span>
                      <span className="mt-1 block text-xs text-ink/40">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}