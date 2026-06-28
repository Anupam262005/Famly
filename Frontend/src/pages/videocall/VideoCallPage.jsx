// src/pages/videocall/VideoCallPage.jsx
import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/authContext";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const APP_ID = Number(import.meta.env.VITE_APP_ID); 
const SERVER_SECRET = String(import.meta.env.VITE_SERVER_SECRET);

export default function VideoCallPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const containerRef = useRef(null);
  const zpRef = useRef(null);

  const mode = searchParams.get("mode") || "video"; 
  const user = auth?.user;

  useEffect(() => {
    if (!containerRef.current || !user) return;

    const initCall = async () => {
      if (!APP_ID || !SERVER_SECRET) {
        console.error("ZegoCloud credentials missing!");
        return;
      }

      const userID = String(user.user_id);
      const userName = user.fullname || user.username || `User${userID}`;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomId,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      const isAudioOnly = mode === "audio";

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Invite link",
            url: window.location.protocol + "//" + window.location.host + `/call/${roomId}?mode=${mode}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: !isAudioOnly,
        showMyCameraToggleButton: !isAudioOnly,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: !isAudioOnly,
        showTextChat: true,
        showUserList: true,
        maxUsers: 50,
        layout: "Auto",
        showLayoutButton: !isAudioOnly,
        onLeaveRoom: () => {
          navigate(-1); 
        },
      });
    };

    initCall();

    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy?.();
        } catch (error) {
          console.warn("ZegoCloud instance destruction ignored:", error);
        }
        zpRef.current = null;
      }
    };
  }, [roomId, mode, user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-lg">Please log in to join a call.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
      className="bg-gray-900"
    />
  );
}