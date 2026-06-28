// // src/utils/notificationContext.jsx
// // Global notification state: unread count badge, live toast popup, and cached list.
// //
// // Wire into main.jsx:
// //   <SocketProvider><NotificationProvider>...</NotificationProvider></SocketProvider>
// //
// // Then in any component:
// //   const { unreadCount, notifications, fetchNotifications, markAsRead } = useNotifications();

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
// } from "react";
// import { toast } from "react-toastify";
// import api from "./axios";
// import { useAuth } from "./authContext";
// import { useSocket } from "./socketContext";

// const NotificationContext = createContext(null);

// export const NotificationProvider = ({ children }) => {
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [notifications, setNotifications] = useState([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const { socket } = useSocket();
//   const { auth } = useAuth();
//   const isLoggedIn = !!auth?.user;

//   // ── Fetch paginated notifications from REST ──────────────────────────────
//   const fetchNotifications = useCallback(
//     async (page = 1) => {
//       if (!isLoggedIn) return;
//       setLoading(true);
//       try {
//         const res = await api.get(`/notification/user?page=${page}`);
//         const d = res.data.data;
//         setNotifications((prev) => {
//           if (page === 1) return d.notifications;
//           const newMap = new Map(prev.map((n) => [n._id, n]));
//           d.notifications.forEach((n) => newMap.set(n._id, n));
//           return Array.from(newMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         });
//         setTotalPages(d.totalPages);
//         setUnreadCount(d.unreadCount ?? 0);
//       } catch (err) {
//         console.error("Failed to fetch notifications", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [isLoggedIn]
//   );

//   // ── Initial fetch on mount ────────────────────────────────────────────────
//   useEffect(() => {
//     fetchNotifications(1);
//   }, [fetchNotifications]);

//   // ── Socket listeners ─────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!socket) return;

//     console.log("📡 Registering notification socket listeners on", socket.id);

//     // Real-time badge update
//     const onUnreadCount = ({ count }) => setUnreadCount(count);

//     // New notification arrives → prepend to list + show toast
//     const onNewNotification = (notif) => {
//       setNotifications((prev) => {
//         // Avoid duplicates (e.g. if REST fetch races with socket push)
//         if (prev.some((n) => n._id === notif._id)) return prev;
//         return [notif, ...prev];
//       });
//       setUnreadCount((c) => c + 1);

//       // Toast based on type
//       if (notif.type === "join_request") {
//         toast.info(
//           `📬 ${notif.joinRequest?.requesterName} wants to join ${notif.joinRequest?.targetName}`,
//           { autoClose: 8000 }
//         );
//       } else if (notif.type === "join_response") {
//         const accepted = notif.joinRequest?.decision === "accepted";
//         accepted
//           ? toast.success(`✅ ${notif.title}`)
//           : toast.error(`❌ ${notif.title}`);
//       } else if (notif.type === "family_invitation") {
//         toast.info(`👨‍👩‍👧 ${notif.title}`, { autoClose: 8000 });
//       } else if (notif.type === "family_invitation_response") {
//         const accepted = notif.familyInvitation?.decision === "accepted";
//         accepted
//           ? toast.success(`✅ ${notif.title}`)
//           : toast.info(`ℹ️ ${notif.title}`);
//       } else {
//         toast.info(`🔔 ${notif.title}: ${notif.message}`, { autoClose: 5000 });
//       }
//     };

//     // Owner responded to a join request — update the local notification card
//     const onJoinRequestUpdated = ({ notifId, decision }) => {
//       setNotifications((prev) =>
//         prev.map((n) =>
//           n._id === notifId
//             ? {
//                 ...n,
//                 joinRequest: { ...n.joinRequest, decision },
//                 status: "read",
//               }
//             : n
//         )
//       );
//     };

//     // User responded to a family invitation — update the inviter's local card
//     const onInvitationResponseReceived = ({ notifId, decision }) => {
//       setNotifications((prev) =>
//         prev.map((n) =>
//           n._id === notifId
//             ? {
//                 ...n,
//                 familyInvitation: { ...n.familyInvitation, decision },
//                 status: "read",
//               }
//             : n
//         )
//       );
//     };

//     // Re-fetch when we get a fresh connection (missed notifications while offline)
//     const onConnect = () => {
//       console.log("✅ Socket connected — re-fetching notifications");
//       fetchNotifications(1);
//     };

//     socket.on("unread_count", onUnreadCount);
//     socket.on("new_notification", onNewNotification);
//     socket.on("join_request_updated", onJoinRequestUpdated);
//     socket.on("invitation_response_received", onInvitationResponseReceived);
//     socket.on("connect", onConnect);

//     return () => {
//       socket.off("unread_count", onUnreadCount);
//       socket.off("new_notification", onNewNotification);
//       socket.off("join_request_updated", onJoinRequestUpdated);
//       socket.off("invitation_response_received", onInvitationResponseReceived);
//       socket.off("connect", onConnect);
//     };
//   }, [socket, fetchNotifications]);

//   // ── Update a notification in-place (used after accept/decline) ──────────
//   const updateNotification = useCallback((notifId, updates) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n._id === notifId ? { ...n, ...updates } : n))
//     );
//   }, []);

//   // ── Remove a notification completely ──────────
//   const deleteNotification = useCallback((notifId) => {
//     setNotifications((prev) => prev.filter((n) => n._id !== notifId));
//   }, []);

//   // ── Mark one as read ──────────────────────────────────────────────────────
//   const markAsRead = useCallback(async (notifId) => {
//     try {
//       await api.patch(`/notification/${notifId}/read`);
//       setNotifications((prev) =>
//         prev.map((n) => (n._id === notifId ? { ...n, status: "read" } : n))
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     } catch (err) {
//       console.error("markAsRead error", err);
//     }
//   }, []);

//   // ── Mark all as read ──────────────────────────────────────────────────────
//   const markAllAsRead = useCallback(async () => {
//     try {
//       await api.patch("/notification/read-all");
//       setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
//       setUnreadCount(0);
//     } catch (err) {
//       console.error("markAllAsRead error", err);
//     }
//   }, []);

//   // ── Delete notification from DB ───────────────────────────────────────────────────
//   const deleteNotificationFromDb = useCallback(async (notifId, groupNotificationId) => {
//     try {
//       await api.delete(`/notification/${notifId}`);
//       if (groupNotificationId) {
//         setNotifications((prev) =>
//           prev.filter((n) => n.meta?.groupNotificationId !== groupNotificationId)
//         );
//       } else {
//         setNotifications((prev) => prev.filter((n) => n._id !== notifId));
//       }
//       // Recalculate unread count
//       setUnreadCount((c) => Math.max(0, c - 1));
//     } catch (err) {
//       console.error("deleteNotification error", err);
//     }
//   }, []);

//   return (
//     <NotificationContext.Provider
//       value={{
//         unreadCount,
//         notifications,
//         totalPages,
//         loading,
//         fetchNotifications,
//         updateNotification,
//         deleteNotification,
//         markAsRead,
//         markAllAsRead,
//         deleteNotificationFromDb,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);



// new code with video call

// src/utils/notificationContext.jsx
// Global notification state: unread count badge, live toast popup, and cached list.
//
// Wire into main.jsx:
//   <SocketProvider><NotificationProvider>...</NotificationProvider></SocketProvider>
//
// Then in any component:
//   const { unreadCount, notifications, fetchNotifications, markAsRead } = useNotifications();

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import api from "./axios";
import { useAuth } from "./authContext";
import { useSocket } from "./socketContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { socket } = useSocket();
  const { auth } = useAuth();
  const isLoggedIn = !!auth?.user;

  // ── Fetch paginated notifications from REST ──────────────────────────────
  const fetchNotifications = useCallback(
    async (page = 1) => {
      if (!isLoggedIn) return;
      setLoading(true);
      try {
        const res = await api.get(`/notification/user?page=${page}`);
        const d = res.data.data;
        setNotifications((prev) => {
          if (page === 1) return d.notifications;
          const newMap = new Map(prev.map((n) => [n._id, n]));
          d.notifications.forEach((n) => newMap.set(n._id, n));
          return Array.from(newMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        setTotalPages(d.totalPages);
        setUnreadCount(d.unreadCount ?? 0);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn]
  );

  // ── Initial fetch on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // ── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    console.log("📡 Registering notification socket listeners on", socket.id);

    // Real-time badge update
    const onUnreadCount = ({ count }) => setUnreadCount(count);

    // New notification arrives → prepend to list + show toast
    const onNewNotification = (notif) => {
      setNotifications((prev) => {
        // Avoid duplicates (e.g. if REST fetch races with socket push)
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((c) => c + 1);

      // Toast based on type
      if (notif.type === "join_request") {
        toast.info(
          `📬 ${notif.joinRequest?.requesterName} wants to join ${notif.joinRequest?.targetName}`,
          { autoClose: 8000 }
        );
      } else if (notif.type === "join_response") {
        const accepted = notif.joinRequest?.decision === "accepted";
        accepted
          ? toast.success(`✅ ${notif.title}`)
          : toast.error(`❌ ${notif.title}`);
      } else if (notif.type === "family_invitation") {
        toast.info(`👨‍👩‍👧 ${notif.title}`, { autoClose: 8000 });
      } else if (notif.type === "family_invitation_response") {
        const accepted = notif.familyInvitation?.decision === "accepted";
        accepted
          ? toast.success(`✅ ${notif.title}`)
          : toast.info(`ℹ️ ${notif.title}`);
      } else if (notif.type === "video_call") {
        // Show a persistent, actionable toast with a Join button
        const { roomId, mode, callerName } = notif.call || {};
        const callIcon = mode === "audio" ? "📞" : "📹";
        toast.info(
          ({ closeToast }) => (
            <div>
              <p className="font-semibold text-sm">
                {callIcon} {callerName} started a {mode === "audio" ? "audio" : "video"} call
              </p>
              <p className="text-xs text-gray-600 mb-2">It's in progress — join now!</p>
              <button
                onClick={() => {
                  window.open(`/call/${roomId}?mode=${mode || "video"}`, "_blank");
                  closeToast();
                }}
                className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full hover:bg-purple-700"
              >
                Join Now
              </button>
            </div>
          ),
          { autoClose: false, closeOnClick: false }
        );
      } else {
        toast.info(`🔔 ${notif.title}: ${notif.message}`, { autoClose: 5000 });
      }
    };

    // Owner responded to a join request — update the local notification card
    const onJoinRequestUpdated = ({ notifId, decision }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId
            ? {
                ...n,
                joinRequest: { ...n.joinRequest, decision },
                status: "read",
              }
            : n
        )
      );
    };

    // User responded to a family invitation — update the inviter's local card
    const onInvitationResponseReceived = ({ notifId, decision }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId
            ? {
                ...n,
                familyInvitation: { ...n.familyInvitation, decision },
                status: "read",
              }
            : n
        )
      );
    };

    // Re-fetch when we get a fresh connection (missed notifications while offline)
    const onConnect = () => {
      console.log("✅ Socket connected — re-fetching notifications");
      fetchNotifications(1);
    };

    socket.on("unread_count", onUnreadCount);
    socket.on("new_notification", onNewNotification);
    socket.on("join_request_updated", onJoinRequestUpdated);
    socket.on("invitation_response_received", onInvitationResponseReceived);
    socket.on("connect", onConnect);

    return () => {
      socket.off("unread_count", onUnreadCount);
      socket.off("new_notification", onNewNotification);
      socket.off("join_request_updated", onJoinRequestUpdated);
      socket.off("invitation_response_received", onInvitationResponseReceived);
      socket.off("connect", onConnect);
    };
  }, [socket, fetchNotifications]);

  // ── Update a notification in-place (used after accept/decline) ──────────
  const updateNotification = useCallback((notifId, updates) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, ...updates } : n))
    );
  }, []);

  // ── Remove a notification completely ──────────
  const deleteNotification = useCallback((notifId) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notifId));
  }, []);

  // ── Mark one as read ──────────────────────────────────────────────────────
  const markAsRead = useCallback(async (notifId) => {
    try {
      await api.patch(`/notification/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, status: "read" } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("markAsRead error", err);
    }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notification/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markAllAsRead error", err);
    }
  }, []);

  // ── Delete notification from DB ───────────────────────────────────────────────────
  const deleteNotificationFromDb = useCallback(async (notifId, groupNotificationId) => {
    try {
      await api.delete(`/notification/${notifId}`);
      if (groupNotificationId) {
        setNotifications((prev) =>
          prev.filter((n) => n.meta?.groupNotificationId !== groupNotificationId)
        );
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      }
      // Recalculate unread count
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("deleteNotification error", err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        totalPages,
        loading,
        fetchNotifications,
        updateNotification,
        deleteNotification,
        markAsRead,
        markAllAsRead,
        deleteNotificationFromDb,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);