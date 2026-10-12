"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { Bell, CheckCheck, X, Users, CreditCard, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { getAdminNotifications, markNotificationAsRead, markAllAdminNotificationsAsRead } from "@/actions/notifications";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedUserId?: string | null;
  createdAt: Date;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationIcon(type: string) {
  switch (type) {
    case "NEW_FREE_TRIAL": return <Users className="w-4 h-4 text-indigo-500" />;
    case "PAYMENT_RECEIVED": return <CreditCard className="w-4 h-4 text-green-500" />;
    case "OFFLINE_PAYMENT": return <CreditCard className="w-4 h-4 text-blue-500" />;
    case "PENDING_FEE": return <Clock className="w-4 h-4 text-amber-500" />;
    case "OVERDUE_FEE": return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "RENEWAL": return <RefreshCw className="w-4 h-4 text-purple-500" />;
    default: return <Bell className="w-4 h-4 text-gray-400" />;
  }
}

function notificationRoute(type: string): string {
  switch (type) {
    case "NEW_FREE_TRIAL": return "/admin?tab=members";
    case "PAYMENT_RECEIVED": return "/admin?tab=members";
    case "OFFLINE_PAYMENT": return "/admin?tab=members";
    case "PENDING_FEE": return "/admin?tab=members";
    case "OVERDUE_FEE": return "/admin?tab=whatsapp";
    case "RENEWAL": return "/admin?tab=members";
    default: return "/admin";
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getAdminNotifications();
      setNotifications(data.notifications as Notification[]);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch {
      setError("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 30s polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click-outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      startTransition(async () => {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    }
    setOpen(false);
    router.push(notificationRoute(notification.type));
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAdminNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden"
          style={{ maxHeight: "min(520px, calc(100vh - 80px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All read</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto" style={{ maxHeight: "min(420px, calc(100vh - 140px))" }}>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                Loading...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-10 px-4 text-center">
                <div>
                  <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">{error}</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">No notifications</p>
                  <p className="text-xs text-gray-400 mt-0.5">You&apos;re all caught up!</p>
                </div>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                      !notification.isRead ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 ${
                      !notification.isRead ? "bg-gray-100" : "bg-gray-50"
                    }`}>
                      {notificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notification.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
