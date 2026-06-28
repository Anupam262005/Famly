// src/routes/call.notification.route.js
// POST /api/v1/notification/call/start
//
// Rewritten to match your codebase exactly:
//  - ES Modules (import/export)
//  - Uses your verifyJWT middleware
//  - Uses Membership from models/index.js (Sequelize / Postgres)
//  - Uses Notification from models/notification.models.js (Mongoose)
//  - Uses emitToUser from socketServer.js (no getIO needed)
//  - Uses crypto.randomUUID() — no extra npm package needed

import express from "express";
import crypto from "crypto";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Membership } from "../models/index.js";
import { Notification } from "../models/notification.models.js";
import { emitToUser } from "../socketServer.js";

const router = express.Router();

// POST /api/v1/notification/call/start
router.post("/call/start", verifyJWT, async (req, res) => {
  try {
    const { familyId, callerName, mode = "video" } = req.body;
    const callerId = req.user.user_id;

    if (!familyId) {
      return res.status(400).json({ success: false, message: "familyId is required" });
    }

    // 1. Generate a unique room ID (no uuid package needed)
    const roomId = crypto.randomUUID();

    // 2. Find all members of this family (Sequelize / Postgres)
    const memberships = await Membership.findAll({
      where: { family_id: familyId },
      attributes: ["user_id"],
    });

    const memberUserIds = memberships
      .map((m) => m.user_id)
      .filter((id) => Number(id) !== Number(callerId)); // exclude the caller

    // Even if no other members, return roomId so caller can open the call
    if (memberUserIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No other members to notify",
        data: { roomId },
      });
    }

    const callIcon  = mode === "audio" ? "📞" : "📹";
    const callLabel = mode === "audio" ? "audio" : "video";

    // 3. Create a Mongoose notification for each family member (except caller)
    const notifications = await Promise.all(
      memberUserIds.map((userId) =>
        Notification.create({
          userId,                         // Mongoose field is "userId" (camelCase)
          type: "video_call",
          title: `${callIcon} ${callerName} started a ${callLabel} call`,
          message: "It's in progress — join now!",
          status: "unread",
          call: {                         // added in notification.models.js below
            roomId,
            mode,
            callerName,
            callerId,
            familyId,
          },
          meta: {
            fromUserId: callerId,
            fromUserName: callerName,
          },
        })
      )
    );

    // 4. Push the notification to each member in real-time via Socket.io
    notifications.forEach((notif, i) => {
      emitToUser(memberUserIds[i], "new_notification", notif.toJSON());
    });

    return res.status(200).json({
      success: true,
      message: "Call notifications sent",
      data: { roomId },
    });
  } catch (err) {
    console.error("Error starting call notification:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;