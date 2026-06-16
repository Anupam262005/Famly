// src/utils/socketContext.jsx
// Provides a Socket.io connection shared across the whole app.
// Reactively creates/destroys the socket when auth token changes.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./authContext";

const SocketContext = createContext(null);

/** Derive root server URL from VITE_SERVER (strip "/api/v1" suffix) */
const getSocketUrl = () => {
  const server = import.meta.env.VITE_SERVER || "http://localhost:8000";

  try {
    const url = new URL(server);
    return url.origin; // e.g. http://localhost:8000
  } catch {
    return server;
  }
};

export const SocketProvider = ({ children }) => {
  const { auth } = useAuth();

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Keep references so callbacks don't suffer from stale closures
  const socketRef = useRef(null);
  const tokenRef = useRef(null);

  const createSocket = useCallback(() => {
    const token = auth?.accessToken ?? null;

    // User logged out
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setSocket(null);
      setConnected(false);
      tokenRef.current = null;
      return;
    }

    // Already connected with same token
    if (
      token === tokenRef.current &&
      socketRef.current &&
      socketRef.current.connected
    ) {
      return;
    }

    tokenRef.current = token;

    // Disconnect previous socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socketUrl = getSocketUrl();
    console.log("🔌 Connecting Socket.io to:", socketUrl);

    const s = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      console.log("🟢 Socket connected:", s.id);
      setConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);

      // If authentication failed, allow a future reconnect
      if (
        err.message === "Invalid token" ||
        err.message === "Authentication required"
      ) {
        tokenRef.current = null;
      }
    });
  }, [auth?.accessToken]);

  // Connect/reconnect whenever auth token changes
  useEffect(() => {
    createSocket();
  }, [createSocket]);

  // Cross-tab + axios refresh-token support
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "auth") {
        console.log("🔄 Auth changed in localStorage — reconnecting socket...");
        createSocket();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [createSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        reconnectSocket: createSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return context;
};