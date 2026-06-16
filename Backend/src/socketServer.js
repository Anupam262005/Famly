// src/socketServer.js
// Drop-in Socket.io server — import this in src/index.js
// It attaches to the existing HTTP server and manages real-time notifications.

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "./models/index.js"; // Sequelize (Postgres)

// Map: userId (number) → Set of socketIds
// Allows one user to have multiple tabs/devices connected simultaneously
const onlineUsers = new Map();

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    // ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────
    // Every socket connection must carry a valid JWT so we know who is connecting.
    // The client sends it as: socket = io(URL, { auth: { token: accessToken } })
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "");

            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findByPk(decoded.user_id, {
                attributes: ["user_id", "fullname", "email"],
                raw: true,
            });

            if (!user) return next(new Error("User not found"));

            socket.userId = user.user_id;
            socket.userFullname = user.fullname;
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    // ─── CONNECTION ────────────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        const userId = Number(socket.userId);
        console.log(`🟢 Socket connected: user ${userId} (${socket.id})`);

        // Register socket under this userId
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);

        // Let the client know how many unread they have immediately
        // (the controller will call emitUnreadCount after fetching from DB)

        // ─── MARK AS READ ──────────────────────────────────────────────────────
        // Client emits: socket.emit("mark_read", { notifId })
        socket.on("mark_read", ({ notifId }) => {
            // Handled via REST PATCH /notification/:id/read
            // Socket event just confirms the client received acknowledgment
            socket.emit("marked_read_ack", { notifId });
        });

        // ─── JOIN REQUEST RESPONSE ─────────────────────────────────────────────
        // Owner responds to a join request (accept / reject)
        // Client emits: socket.emit("join_request_response", { requestNotifId, decision, targetUserId, groupOrFamilyId, type })
        // We just relay; the real work is done in the REST endpoint
        socket.on("join_request_response", (data) => {
            // This is just a relay in case the owner wants real-time confirmation
            // The REST endpoint handles DB updates and emits back via emitToUser
            socket.emit("join_response_ack", { requestNotifId: data.requestNotifId });
        });

        // ─── DISCONNECT ────────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) onlineUsers.delete(userId);
            }
            console.log(`🔴 Socket disconnected: user ${userId} (${socket.id})`);
        });
    });

    return io;
};

// ─── HELPERS USED BY CONTROLLERS ────────────────────────────────────────────

/** Send a notification object to a specific user (all their tabs/devices) */
export const emitToUser = (userId, event, payload) => {
    const sockets = onlineUsers.get(Number(userId));
    if (!sockets || sockets.size === 0) return; // user offline — DB persists it anyway
    sockets.forEach((socketId) => {
        io.to(socketId).emit(event, payload);
    });
};

/** Emit the current unread count badge to a user */
export const emitUnreadCount = (userId, count) => {
    emitToUser(userId, "unread_count", { count });
};

/** Is a specific user currently online? */
export const isUserOnline = (userId) => onlineUsers.has(Number(userId));

export { io };
