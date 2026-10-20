"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
    setUnreadCount(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-ink-200">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-xl">
          <div className="border-b border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-ink-400">You&apos;re all caught up.</div>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                onClick={() => setOpen(false)}
                className="block border-b border-ink-50 px-4 py-3 last:border-0 hover:bg-ink-50"
              >
                <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">{n.body}</p>
                <p className="mt-1 text-[11px] text-ink-400">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
