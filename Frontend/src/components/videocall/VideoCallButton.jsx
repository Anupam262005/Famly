// src/components/videocall/VideoCallButton.jsx
// Drop-in button that starts a video or audio call for a family.
// Place this in OwnerFamilyPage and MemberFamilyPage sidebars.
//
// Usage:
//   <VideoCallButton familyId={familyId} callerName={user.fullname} />

import { useState } from "react";
import { Video, Phone, Loader2 } from "lucide-react";
import api from "../../utils/axios";
import { toast } from "react-toastify";

export default function VideoCallButton({ familyId, callerName }) {
  const [starting, setStarting] = useState(false);

  const startCall = async (mode) => {
    // mode: "video" | "audio"
    if (starting) return;
    setStarting(true);
    try {
      // Hit the backend to create the call notification for all family members
      const res = await api.post(`/notification/call/start`, {
        familyId,
        callerName,
        mode, // "video" or "audio"
      });

      const { roomId } = res.data.data;

      // Navigate caller directly into the call room
      window.open(`/call/${roomId}?mode=${mode}`, "_blank");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to start call. Please try again."
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      {/* Video Call */}
      <button
        onClick={() => startCall("video")}
        disabled={starting}
        title="Start Video Call"
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                   bg-gradient-to-r from-violet-600 to-purple-500 text-white font-semibold
                   text-sm hover:shadow-md hover:shadow-purple-200 transition-all
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {starting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Video size={15} />
        )}
        Video Call
      </button>

      {/* Audio Call */}
      <button
        onClick={() => startCall("audio")}
        disabled={starting}
        title="Start Audio Call"
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                   bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold
                   text-sm hover:shadow-md hover:shadow-emerald-200 transition-all
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {starting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Phone size={15} />
        )}
        Audio Call
      </button>
    </div>
  );
}