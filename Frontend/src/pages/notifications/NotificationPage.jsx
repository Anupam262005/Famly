// src/pages/notifications/NotificationPage.jsx
// Real-time notification page powered by NotificationContext + Socket.io

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useAuth } from "../../utils/authContext";
import NotificationCard from "../../components/notifications/NotificationCards";
import { useNotifications } from "../../utils/notificationContext";
import { useSocket } from "../../utils/socketContext";

export default function NotificationsPage() {
  const { auth } = useAuth();
  const { connected } = useSocket();
  const {
    notifications,
    totalPages,
    loading,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
  } = useNotifications();

  const [page, setPage] = useState(1);
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, page, totalPages]);

  useEffect(() => {
    if (page > 1) {
      fetchNotifications(page);
    }
  }, [page, fetchNotifications]);

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 pb-12">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight flex items-center gap-2">
            <Bell size={28} />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
            Messages, join requests, and updates — in real time
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-red-400"
              }`}
              title={connected ? "Socket connected" : "Socket disconnected"}
            />
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setPage(1);
              fetchNotifications(1);
            }}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium transition-colors border border-indigo-200"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-12 text-gray-400">Loading notifications...</div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No notifications yet</p>
          <p className="text-gray-300 text-sm mt-1">
            Messages and join requests will appear here in real time
          </p>
        </div>
      )}

      {notifications.map((notif) => (
        <NotificationCard key={notif._id} notification={notif} auth={auth} />
      ))}

      {/* ── Infinite Scroll Trigger ────────────────────────────────────────── */}
      {totalPages > 1 && page < totalPages && (
        <div ref={observerRef} className="h-10 mt-6" />
      )}
    </div>
  );
}
