// src/components/Common/NotificationBell.jsx
// Drop-in bell icon for your Header.jsx showing live unread badge count.
// Usage in Header.jsx:
//   import NotificationBell from "./NotificationBell";
//   <NotificationBell />

import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../utils/notificationContext";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/notifications" className="relative inline-flex items-center p-2">
      <Bell size={22} className="text-gray-700 hover:text-indigo-600 transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
