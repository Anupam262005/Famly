// // src/components/notifications/NotificationCards.jsx
// // Production-level notification card component.
// // Handles: message, join_request, join_response, family_invitation, family_invitation_response

// import { useState, useEffect, useRef } from "react";
// import {
//   Trash2,
//   Clock,
//   CheckCircle,
//   XCircle,
//   UserPlus,
//   MessageSquare,
//   Crown,
//   Eye,
// } from "lucide-react";
// import api from "../../utils/axios";
// import { toast } from "react-toastify";
// import { useNotifications } from "../../utils/notificationContext";

// export default function NotificationCard({ notification, auth }) {
//   const { updateNotification, deleteNotification, markAsRead, deleteNotificationFromDb } = useNotifications();
//   const userId = Number(auth?.user?.user_id);
//   const isSender = notification.meta?.fromUserId === userId;

//   // Track the decision state locally so UI updates immediately on accept/decline
//   const [decision, setDecision] = useState(
//     notification.joinRequest?.decision ||
//     notification.familyInvitation?.decision ||
//     "pending"
//   );
//   const [responding, setResponding] = useState(false);

//   // Sync decision state if notification prop changes (e.g. from socket update)
//   useEffect(() => {
//     const newDecision =
//       notification.joinRequest?.decision ||
//       notification.familyInvitation?.decision ||
//       "pending";
//     setDecision(newDecision);
//   }, [notification.joinRequest?.decision, notification.familyInvitation?.decision]);

//   const formattedDate = new Date(notification.createdAt).toLocaleString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const isUnread = notification.status === "unread";
//   const isPending = decision === "pending";
//   const isAccepted = decision === "accepted";

//   const cardRef = useRef(null);

//   // ── Handlers ─────────────────────────────────────────────────────────────

//   // (moved handleMarkRead to its original place below)

//   const handleJoinResponse = async (dec) => {
//     setResponding(true);
//     try {
//       await api.patch(`/notification/join-request/${notification._id}/respond`, {
//         decision: dec,
//       });
//       setDecision(dec);
//       // Sync context state so the card shows the updated decision
//       updateNotification(notification._id, {
//         joinRequest: { ...notification.joinRequest, decision: dec },
//         status: "read",
//       });
//       toast.success(dec === "accepted" ? "✅ User added!" : "Request rejected");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to respond");
//     } finally {
//       setResponding(false);
//     }
//   };

//   const handleInvitationResponse = async (dec) => {
//     setResponding(true);
//     try {
//       await api.patch(`/family/invitation/${notification._id}/respond`, {
//         decision: dec,
//       });
//       setDecision(dec);
//       // Remove the old invitation card, as the backend will send a new message notification via socket
//       deleteNotification(notification._id);
//       toast.success(
//         dec === "accepted" ? "✅ You've joined the family!" : "Invitation declined"
//       );
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to respond");
//     } finally {
//       setResponding(false);
//     }
//   };

//   const handleMarkRead = async () => {
//     if (isUnread) {
//       await markAsRead(notification._id);
//     }
//   };

//   // ── Auto mark as read on scroll ──────────────────────────────────────────
//   useEffect(() => {
//     if (!isUnread) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           handleMarkRead();
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.5 }
//     );

//     if (cardRef.current) observer.observe(cardRef.current);

//     return () => observer.disconnect();
//   }, [isUnread, notification._id]);

//   const handleDelete = async () => {
//     if (!window.confirm("Delete this notification?")) return;
//     await deleteNotificationFromDb(notification._id, notification.meta?.groupNotificationId);
//   };

//   // ── Shared UI pieces ─────────────────────────────────────────────────────

//   const borderColor = isUnread ? "border-indigo-400" : "border-gray-200";

//   const ActionFooter = ({ showDelete = true }) => (
//     <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
//       <div className="flex items-center gap-2">
//         {isUnread && (
//           <button
//             onClick={handleMarkRead}
//             className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
//             title="Mark as read"
//           >
//             <Eye size={12} />
//             Mark read
//           </button>
//         )}
//         {showDelete && (
//           <button
//             onClick={handleDelete}
//             className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
//             title="Delete notification"
//           >
//             <Trash2 size={12} />
//             Delete
//           </button>
//         )}
//       </div>
//       <p className="text-xs text-gray-400 flex items-center gap-1">
//         <Clock size={11} /> {formattedDate}
//       </p>
//     </div>
//   );

//   const DecisionBadge = ({ acceptText, rejectText }) => (
//     <div
//       className={`flex items-center gap-1.5 text-sm font-semibold ${isAccepted ? "text-green-600" : "text-red-500"
//         }`}
//     >
//       {isAccepted ? <CheckCircle size={15} /> : <XCircle size={15} />}
//       {isAccepted ? acceptText : rejectText}
//     </div>
//   );

//   const UnreadDot = () =>
//     isUnread ? <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> : null;

//   // ── TYPE: join_request ───────────────────────────────────────────────────
//   if (notification.type === "join_request") {
//     const { requesterName, targetName, targetType } = notification.joinRequest || {};
//     return (
//       <div
//         ref={cardRef}
//         className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${borderColor}`}
//       >
//         <div className="flex items-center gap-2 mb-3">
//           <span className="p-1.5 bg-amber-100 rounded-full">
//             <UserPlus size={15} className="text-amber-600" />
//           </span>
//           <span className="text-xs font-bold uppercase tracking-wide text-amber-600">
//             Join Request · {targetType === "family" ? "Family" : "Group"}
//           </span>
//           <UnreadDot />
//         </div>

//         <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
//         <p className="text-gray-600 text-sm mb-4">{notification.message}</p>

//         {isPending ? (
//           <div className="flex gap-2">
//             <button
//               onClick={() => handleJoinResponse("accepted")}
//               disabled={responding}
//               className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
//             >
//               <CheckCircle size={15} /> Accept
//             </button>
//             <button
//               onClick={() => handleJoinResponse("rejected")}
//               disabled={responding}
//               className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
//             >
//               <XCircle size={15} /> Reject
//             </button>
//           </div>
//         ) : (
//           <DecisionBadge
//             acceptText="You accepted this request"
//             rejectText="You rejected this request"
//           />
//         )}

//         <ActionFooter />
//       </div>
//     );
//   }

//   // ── TYPE: join_response ──────────────────────────────────────────────────
//   if (notification.type === "join_response") {
//     const accepted = notification.joinRequest?.decision === "accepted";
//     return (
//       <div
//         ref={cardRef}
//         className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${accepted ? "border-green-400" : "border-red-400"
//           }`}
//       >
//         <div className="flex items-center gap-2 mb-3">
//           <span className={`p-1.5 rounded-full ${accepted ? "bg-green-100" : "bg-red-100"}`}>
//             {accepted ? (
//               <CheckCircle size={15} className="text-green-600" />
//             ) : (
//               <XCircle size={15} className="text-red-500" />
//             )}
//           </span>
//           <span
//             className={`text-xs font-bold uppercase tracking-wide ${accepted ? "text-green-600" : "text-red-500"
//               }`}
//           >
//             {accepted ? "Request Accepted" : "Request Declined"}
//           </span>
//           <UnreadDot />
//         </div>
//         <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
//         <p className="text-gray-600 text-sm">{notification.message}</p>
//         <ActionFooter />
//       </div>
//     );
//   }

//   // ── TYPE: family_invitation ──────────────────────────────────────────────
//   if (notification.type === "family_invitation") {
//     const { invitedByName, familyName, role } = notification.familyInvitation || {};
//     const isRootRole = role === "admin";
//     return (
//       <div
//         ref={cardRef}
//         className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${borderColor}`}
//       >
//         <div className="flex items-center gap-2 mb-3">
//           <span className={`p-1.5 rounded-full ${isRootRole ? "bg-amber-100" : "bg-purple-100"}`}>
//             {isRootRole ? (
//               <Crown size={15} className="text-amber-600" />
//             ) : (
//               <UserPlus size={15} className="text-purple-600" />
//             )}
//           </span>
//           <span
//             className={`text-xs font-bold uppercase tracking-wide ${isRootRole ? "text-amber-600" : "text-purple-600"
//               }`}
//           >
//             {isRootRole ? "Root Member Invitation" : "Family Invitation"}
//           </span>
//           <UnreadDot />
//         </div>

//         <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
//         <p className="text-gray-600 text-sm mb-4">{notification.message}</p>

//         {isPending ? (
//           <div className="flex gap-2">
//             <button
//               onClick={() => handleInvitationResponse("accepted")}
//               disabled={responding}
//               className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
//             >
//               <CheckCircle size={15} /> Accept
//             </button>
//             <button
//               onClick={() => handleInvitationResponse("rejected")}
//               disabled={responding}
//               className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
//             >
//               <XCircle size={15} /> Decline
//             </button>
//           </div>
//         ) : (
//           <DecisionBadge
//             acceptText="You accepted — welcome to the family!"
//             rejectText="You declined this invitation"
//           />
//         )}

//         <ActionFooter />
//       </div>
//     );
//   }

//   // ── TYPE: family_invitation_response ─────────────────────────────────────
//   if (notification.type === "family_invitation_response") {
//     const accepted = notification.familyInvitation?.decision === "accepted";
//     return (
//       <div
//         ref={cardRef}
//         className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${accepted ? "border-green-400" : "border-red-400"
//           }`}
//       >
//         <div className="flex items-center gap-2 mb-3">
//           <span className={`p-1.5 rounded-full ${accepted ? "bg-green-100" : "bg-red-100"}`}>
//             {accepted ? (
//               <CheckCircle size={15} className="text-green-600" />
//             ) : (
//               <XCircle size={15} className="text-red-500" />
//             )}
//           </span>
//           <span
//             className={`text-xs font-bold uppercase tracking-wide ${accepted ? "text-green-600" : "text-red-500"
//               }`}
//           >
//             Invitation {accepted ? "Accepted" : "Declined"}
//           </span>
//           <UnreadDot />
//         </div>
//         <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
//         <p className="text-gray-600 text-sm">{notification.message}</p>
//         <ActionFooter />
//       </div>
//     );
//   }

//   // ── TYPE: message (and any other/legacy types) ──────────────────────────
//   const senderName =
//     notification.senderName || notification.meta?.fromUserName || "System";
//   const audienceName = notification.meta?.audienceName;

//   return (
//     <div
//       ref={cardRef}
//       className={`relative p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md ${borderColor}`}
//     >
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <span className="p-1.5 bg-indigo-100 rounded-full">
//             <MessageSquare size={15} className="text-indigo-600" />
//           </span>
//           <span className="text-xs font-bold uppercase tracking-wide text-indigo-500">
//             Message
//             {audienceName && (
//               <span className="ml-1.5 font-normal text-gray-400 normal-case">
//                 → {audienceName}
//               </span>
//             )}
//           </span>
//           <UnreadDot />
//         </div>
//         {isSender && (
//           <button
//             onClick={handleDelete}
//             className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
//             title="Delete for everyone"
//           >
//             <Trash2 size={15} />
//           </button>
//         )}
//       </div>

//       <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
//       <p className="text-sm text-gray-500 font-medium mb-0.5">{senderName}:</p>
//       <p className="text-gray-700 text-sm italic leading-relaxed">
//         "{notification.message}"
//       </p>

//       <ActionFooter showDelete={!isSender} />
//     </div>
//   );
// }



// new code with video call

// src/components/notifications/NotificationCards.jsx
// Production-level notification card component.
// Handles: message, join_request, join_response, family_invitation, family_invitation_response

import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  MessageSquare,
  Crown,
  Eye,
  Video,
  Phone,
} from "lucide-react";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { useNotifications } from "../../utils/notificationContext";

export default function NotificationCard({ notification, auth }) {
  const { updateNotification, deleteNotification, markAsRead, deleteNotificationFromDb } = useNotifications();
  const userId = Number(auth?.user?.user_id);
  const isSender = notification.meta?.fromUserId === userId;

  // Track the decision state locally so UI updates immediately on accept/decline
  const [decision, setDecision] = useState(
    notification.joinRequest?.decision ||
    notification.familyInvitation?.decision ||
    "pending"
  );
  const [responding, setResponding] = useState(false);

  // Sync decision state if notification prop changes (e.g. from socket update)
  useEffect(() => {
    const newDecision =
      notification.joinRequest?.decision ||
      notification.familyInvitation?.decision ||
      "pending";
    setDecision(newDecision);
  }, [notification.joinRequest?.decision, notification.familyInvitation?.decision]);

  const formattedDate = new Date(notification.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isUnread = notification.status === "unread";
  const isPending = decision === "pending";
  const isAccepted = decision === "accepted";

  const cardRef = useRef(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  // (moved handleMarkRead to its original place below)

  const handleJoinResponse = async (dec) => {
    setResponding(true);
    try {
      await api.patch(`/notification/join-request/${notification._id}/respond`, {
        decision: dec,
      });
      setDecision(dec);
      // Sync context state so the card shows the updated decision
      updateNotification(notification._id, {
        joinRequest: { ...notification.joinRequest, decision: dec },
        status: "read",
      });
      toast.success(dec === "accepted" ? "✅ User added!" : "Request rejected");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond");
    } finally {
      setResponding(false);
    }
  };

  const handleInvitationResponse = async (dec) => {
    setResponding(true);
    try {
      await api.patch(`/family/invitation/${notification._id}/respond`, {
        decision: dec,
      });
      setDecision(dec);
      // Remove the old invitation card, as the backend will send a new message notification via socket
      deleteNotification(notification._id);
      toast.success(
        dec === "accepted" ? "✅ You've joined the family!" : "Invitation declined"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond");
    } finally {
      setResponding(false);
    }
  };

  const handleMarkRead = async () => {
    if (isUnread) {
      await markAsRead(notification._id);
    }
  };

  // ── Auto mark as read on scroll ──────────────────────────────────────────
  useEffect(() => {
    if (!isUnread) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleMarkRead();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [isUnread, notification._id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this notification?")) return;
    await deleteNotificationFromDb(notification._id, notification.meta?.groupNotificationId);
  };

  // ── Shared UI pieces ─────────────────────────────────────────────────────

  const borderColor = isUnread ? "border-indigo-400" : "border-gray-200";

  const ActionFooter = ({ showDelete = true }) => (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2">
        {isUnread && (
          <button
            onClick={handleMarkRead}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="Mark as read"
          >
            <Eye size={12} />
            Mark read
          </button>
        )}
        {showDelete && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Delete notification"
          >
            <Trash2 size={12} />
            Delete
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Clock size={11} /> {formattedDate}
      </p>
    </div>
  );

  const DecisionBadge = ({ acceptText, rejectText }) => (
    <div
      className={`flex items-center gap-1.5 text-sm font-semibold ${isAccepted ? "text-green-600" : "text-red-500"
        }`}
    >
      {isAccepted ? <CheckCircle size={15} /> : <XCircle size={15} />}
      {isAccepted ? acceptText : rejectText}
    </div>
  );

  const UnreadDot = () =>
    isUnread ? <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> : null;

  // ── TYPE: join_request ───────────────────────────────────────────────────
  if (notification.type === "join_request") {
    const { requesterName, targetName, targetType } = notification.joinRequest || {};
    return (
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${borderColor}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 bg-amber-100 rounded-full">
            <UserPlus size={15} className="text-amber-600" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-amber-600">
            Join Request · {targetType === "family" ? "Family" : "Group"}
          </span>
          <UnreadDot />
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{notification.message}</p>

        {isPending ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleJoinResponse("accepted")}
              disabled={responding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} /> Accept
            </button>
            <button
              onClick={() => handleJoinResponse("rejected")}
              disabled={responding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <XCircle size={15} /> Reject
            </button>
          </div>
        ) : (
          <DecisionBadge
            acceptText="You accepted this request"
            rejectText="You rejected this request"
          />
        )}

        <ActionFooter />
      </div>
    );
  }

  // ── TYPE: join_response ──────────────────────────────────────────────────
  if (notification.type === "join_response") {
    const accepted = notification.joinRequest?.decision === "accepted";
    return (
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${accepted ? "border-green-400" : "border-red-400"
          }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`p-1.5 rounded-full ${accepted ? "bg-green-100" : "bg-red-100"}`}>
            {accepted ? (
              <CheckCircle size={15} className="text-green-600" />
            ) : (
              <XCircle size={15} className="text-red-500" />
            )}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wide ${accepted ? "text-green-600" : "text-red-500"
              }`}
          >
            {accepted ? "Request Accepted" : "Request Declined"}
          </span>
          <UnreadDot />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
        <p className="text-gray-600 text-sm">{notification.message}</p>
        <ActionFooter />
      </div>
    );
  }

  // ── TYPE: family_invitation ──────────────────────────────────────────────
  if (notification.type === "family_invitation") {
    const { invitedByName, familyName, role } = notification.familyInvitation || {};
    const isRootRole = role === "admin";
    return (
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${borderColor}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`p-1.5 rounded-full ${isRootRole ? "bg-amber-100" : "bg-purple-100"}`}>
            {isRootRole ? (
              <Crown size={15} className="text-amber-600" />
            ) : (
              <UserPlus size={15} className="text-purple-600" />
            )}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wide ${isRootRole ? "text-amber-600" : "text-purple-600"
              }`}
          >
            {isRootRole ? "Root Member Invitation" : "Family Invitation"}
          </span>
          <UnreadDot />
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{notification.message}</p>

        {isPending ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleInvitationResponse("accepted")}
              disabled={responding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} /> Accept
            </button>
            <button
              onClick={() => handleInvitationResponse("rejected")}
              disabled={responding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <XCircle size={15} /> Decline
            </button>
          </div>
        ) : (
          <DecisionBadge
            acceptText="You accepted — welcome to the family!"
            rejectText="You declined this invitation"
          />
        )}

        <ActionFooter />
      </div>
    );
  }

  // ── TYPE: family_invitation_response ─────────────────────────────────────
  if (notification.type === "family_invitation_response") {
    const accepted = notification.familyInvitation?.decision === "accepted";
    return (
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${accepted ? "border-green-400" : "border-red-400"
          }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`p-1.5 rounded-full ${accepted ? "bg-green-100" : "bg-red-100"}`}>
            {accepted ? (
              <CheckCircle size={15} className="text-green-600" />
            ) : (
              <XCircle size={15} className="text-red-500" />
            )}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wide ${accepted ? "text-green-600" : "text-red-500"
              }`}
          >
            Invitation {accepted ? "Accepted" : "Declined"}
          </span>
          <UnreadDot />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
        <p className="text-gray-600 text-sm">{notification.message}</p>
        <ActionFooter />
      </div>
    );
  }

  // ── TYPE: video_call ─────────────────────────────────────────────────────
  if (notification.type === "video_call") {
    const { roomId, mode, callerName } = notification.call || {};
    const isVideo = mode !== "audio";
    const CallIcon = isVideo ? Video : Phone;
    const accentColor = isVideo ? "text-violet-600" : "text-emerald-600";
    const accentBg = isVideo ? "bg-violet-100" : "bg-emerald-100";
    const borderAccent = isVideo ? "border-violet-400" : "border-emerald-400";

    return (
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 border-l-4 ${borderAccent}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`p-1.5 rounded-full ${accentBg}`}>
            <CallIcon size={15} className={accentColor} />
          </span>
          <span className={`text-xs font-bold uppercase tracking-wide ${accentColor}`}>
            {isVideo ? "Video Call" : "Audio Call"}
          </span>
          <UnreadDot />
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{notification.message}</p>

        {roomId && (
          <button
            onClick={() =>
              window.open(`/call/${roomId}?mode=${mode || "video"}`, "_blank")
            }
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-white text-sm font-semibold transition-colors
              ${isVideo
                ? "bg-violet-600 hover:bg-violet-700"
                : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            <CallIcon size={15} /> Join Now
          </button>
        )}

        <ActionFooter />
      </div>
    );
  }

  // ── TYPE: message (and any other/legacy types) ──────────────────────────
  const senderName =
    notification.senderName || notification.meta?.fromUserName || "System";
  const audienceName = notification.meta?.audienceName;

  return (
    <div
      ref={cardRef}
      className={`relative p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-100 rounded-full">
            <MessageSquare size={15} className="text-indigo-600" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-indigo-500">
            Message
            {audienceName && (
              <span className="ml-1.5 font-normal text-gray-400 normal-case">
                → {audienceName}
              </span>
            )}
          </span>
          <UnreadDot />
        </div>
        {isSender && (
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
            title="Delete for everyone"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
      <p className="text-sm text-gray-500 font-medium mb-0.5">{senderName}:</p>
      <p className="text-gray-700 text-sm italic leading-relaxed">
        "{notification.message}"
      </p>

      <ActionFooter showDelete={!isSender} />
    </div>
  );
}