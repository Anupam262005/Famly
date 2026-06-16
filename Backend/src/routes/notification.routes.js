// src/routes/notification.routes.js  ← REPLACE your existing file

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  sendJoinRequest,
  respondToJoinRequest,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  generateBirthdayNotifications,
  generateAnniversaryNotifications,
} from "../controllers/notification.controller.js";

const router = Router();

// ── Message notifications ──────────────────────────────────────────────────
// Send a message to family members, a private group, or all your families
router.post("/notification/send-message", verifyJWT, sendMessage);

// ── Join request flow ──────────────────────────────────────────────────────
// Requester: ask to join a family or private group
router.post("/notification/join-request", verifyJWT, sendJoinRequest);
// Owner: accept or reject a join request
router.patch("/notification/join-request/:notifId/respond", verifyJWT, respondToJoinRequest);

// ── Read / manage ──────────────────────────────────────────────────────────
router.get("/notification/user", verifyJWT, getUserNotifications);
router.get("/notification/unread-count", verifyJWT, getUnreadCount);
// ✅ Fix: read-all MUST be before /:id/read — otherwise Express treats "read-all" as the :id param
router.patch("/notification/read-all", verifyJWT, markAllAsRead);
router.patch("/notification/:id/read", verifyJWT, markAsRead);
router.delete("/notification/:id", verifyJWT, deleteNotification);

// ── Legacy batch generators (cron / admin) ─────────────────────────────────
router.post("/notification/generate/birthdays", generateBirthdayNotifications);
router.post("/notification/generate/anniversaries", generateAnniversaryNotifications);

export default router;
