// import { Notification } from "../models/notification.models.js"; // Mongo (Mongoose)
// // import User from "../models/user.model.js"; // Postgres (Sequelize)
// // import Family from "../models/family.model.js"; // Postgres (Sequelize)
// import {User, Family,Membership } from "../models/index.js"
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { Privategroup } from "../models/privategroup.models.js";
// import { NUMBER } from "sequelize";
// import { Op } from "sequelize";

// // ========== CREATE NOTIFICATION (manual) ==========
// // const createNotification = asyncHandler(async (req, res) => {
// //     console.log(req.body)
// //   const { type, title, message, meta, expiresAt } = req.body;

// //   const userId = Number(req.user.user_id)
// //   if (!userId || !type || !title || !message) {
// //     throw new ApiError(400, "userId, type, title and message are required");
// //   }

// //   const notif = await Notification.create({
// //     userId,
// //     type,
// //     title,
// //     message,
// //     status: "unread",
// //     meta: meta || {},
// //     expiresAt: expiresAt || null
// //   });

// //   return res
// //     .status(201)
// //     .json(new ApiResponse(201, notif, " Notification created successfully"));
// // });

//  const createNotification = asyncHandler(async (req, res) => {
//   const { type, title, message, meta, expiresAt } = req.body;

//   const userId = Number(req.user?.user_id);
//   const senderName = req.user?.fullname || "A family member";

//   if (!userId || !type || !title || !message) {
//     throw new ApiError(400, "userId, type, title and message are required");
//   }

//   // 1️⃣ Fetch families of sender
//   const memberships = await Membership.findAll({ where: { user_id: userId } });
//   if (!memberships.length) {
//     throw new ApiError(400, "User is not part of any family");
//   }

//   const familyIds = memberships.map((m) => m.family_id);

//   // 2️⃣ Fetch all members of those families
//   const allMembers = await Membership.findAll({
//     where: { family_id: familyIds },
//   });

//   if (!allMembers.length) {
//     throw new ApiError(404, "No family members found");
//   }

//   // 3️⃣ Collect unique member IDs (excluding sender)
//   const uniqueMemberIds = [
//     ...new Set(allMembers.map((m) => Number(m.user_id))),
//   ].filter((id) => id !== userId);

//   // 4️⃣ Prepare notification objects
//   const notifications = [];

//   // For sender (so they also see their notification)
//   // notifications.push({
//   //   userId,
//   //   type,
//   //   title,
//   //   message,
//   //   status: "unread",
//   //   meta: meta || {},
//   //   expiresAt: expiresAt || null,
//   // });

//   // For sender
// const groupNotificationId = Date.now();
// notifications.push({
//   userId,
//   type,
//   title,
//   message,
//   status: "unread",
//   meta: {
//     ...meta,
//     fromUserId: userId,
//     groupNotificationId
//   },
//   expiresAt: expiresAt || null,
// });

//   // For each unique recipient
//   uniqueMemberIds.forEach((memberId) => {
//     notifications.push({
//       userId: memberId,
//       type,
//       title,
//       message: `${senderName} says: ${message}`,
//       status: "unread",
//       meta: {
//         ...meta,
//         fromUserId: userId,
//         groupNotificationId,
//       },
//       expiresAt: expiresAt || null,
//     });
//   });

//   // 5️⃣ Insert into MongoDB once per user
//   const createdNotifications = await Notification.insertMany(notifications);

//   // 6️⃣ Respond
//   return res.status(201).json(
//     new ApiResponse(
//       201,
//       createdNotifications,
//       "Notifications created and sent to all family members successfully"
//     )
//   );
// });



// // ========== GENERATE BIRTHDAY NOTIFICATIONS (family + groups) ==========
// // const generateBirthdayNotifications = asyncHandler(async (req, res) => {
// //   const today = new Date();
// //   const todayMonth = today.getUTCMonth();
// //   const todayDate = today.getUTCDate();

// //   const users = await User.findAll(); // Sequelize (Postgres)
// //   let createdNotifications = [];

// //   for (let u of users) {
// //     const dob = new Date(u.dob);
// //     if (dob.getUTCMonth() === todayMonth && dob.getUTCDate() === todayDate) {
// //       // 1️⃣ Notify the birthday person
// //       const selfNotif = await Notification.create({
// //         userId: u.user_id,
// //         type: "birthday",
// //         title: "Happy Birthday 🎂",
// //         message: `Wishing you a wonderful birthday, ${u.fullname}!`,
// //         status: "unread",
// //         meta: { birthdayPerson: u.fullname }
// //       });
// //       createdNotifications.push(selfNotif);

// //       // 2️⃣ Notify family members
// //       const memberships = await Membership.findAll({
// //         where: { family_id: { [Op.ne]: null } } // all families
// //       });
// //       const userFamilies = memberships.filter(m => m.user_id === u.user_id).map(m => m.family_id);

// //       if (userFamilies.length > 0) {
// //         const familyMembers = await Membership.findAll({
// //           where: { family_id: userFamilies }
// //         });
// //         for (let fm of familyMembers) {
// //           if (fm.user_id !== u.user_id) {
// //             const famNotif = await Notification.create({
// //               userId: fm.user_id,
// //               type: "birthday",
// //               title: "Birthday Reminder 🎂",
// //               message: `Today is ${u.fullname}'s birthday! 🎉`,
// //               status: "unread",
// //               meta: { birthdayPerson: u.fullname }
// //             });
// //             createdNotifications.push(famNotif);
// //           }
// //         }
// //       }

// //       // 3️⃣ Notify private group members
// //       const groups = await Privategroup.find({ "members.user_id": u.user_id });
// //       for (let group of groups) {
// //         for (let member of group.members) {
// //           if (member.user_id !== u.user_id) {
// //             const groupNotif = await Notification.create({
// //               userId: member.user_id,
// //               type: "birthday",
// //               title: "Group Birthday Reminder 🎂",
// //               message: `${u.fullname} (your group member) has a birthday today 🎉`,
// //               status: "unread",
// //               meta: { birthdayPerson: u.fullname, groupId: group._id }
// //             });
// //             createdNotifications.push(groupNotif);
// //           }
// //         }
// //       }
// //     }
// //   }

// //   return res.status(201).json(
// //     new ApiResponse(
// //       201,
// //       { count: createdNotifications.length, notifications: createdNotifications },
// //       "Birthday notifications generated"
// //     )
// //   );
// // });

// const generateBirthdayNotifications = asyncHandler(async (req, res) => {
//   const today = new Date();
//   const todayMonth = today.getMonth(); // local month
//   const todayDate = today.getDate();   // local date

//   const users = await User.findAll(); // all users
//   const notifications = [];

//   for (let user of users) {
//     const dob = new Date(user.dob);
//     if (dob.getMonth() === todayMonth && dob.getDate() === todayDate) {
//       // 1️⃣ Notify the user themselves
//       notifications.push({
//         userId: user.user_id,
//         type: "birthday",
//         title: "Happy Birthday 🎂",
//         message: `Wishing you a wonderful birthday, ${user.fullname}!`,
//         status: "unread",
//         meta: { birthdayPerson: user.fullname },
//       });

//       // 2️⃣ Notify family members
//       const userMemberships = await Membership.findAll({
//         where: { user_id: user.user_id },
//       });
//       const familyIds = userMemberships.map(m => m.family_id);

//       if (familyIds.length > 0) {
//         const familyMembers = await Membership.findAll({
//           where: { family_id: familyIds },
//         });

//         familyMembers.forEach(fm => {
//           if (fm.user_id !== user.user_id) {
//             notifications.push({
//               userId: fm.user_id,
//               type: "birthday",
//               title: "Birthday Reminder 🎂",
//               message: `Today is ${user.fullname}'s birthday! 🎉`,
//               status: "unread",
//               meta: { birthdayPerson: user.fullname },
//             });
//           }
//         });
//       }

//       // 3️⃣ Notify private group members
//       const groups = await Privategroup.find({ "members.user_id": user.user_id });
//       groups.forEach(group => {
//         group.members.forEach(member => {
//           if (member.user_id !== user.user_id) {
//             notifications.push({
//               userId: member.user_id,
//               type: "birthday",
//               title: "Group Birthday Reminder 🎂",
//               message: `${user.fullname} (your group member) has a birthday today 🎉`,
//               status: "unread",
//               meta: { birthdayPerson: user.fullname, groupId: group._id },
//             });
//           }
//         });
//       });
//     }
//   }

//   // Bulk insert all notifications at once
//   const createdNotifications = await Notification.insertMany(notifications);

//   return res.status(201).json({
//     status: "success",
//     count: createdNotifications.length,
//     notifications: createdNotifications,
//     message: "Birthday notifications generated",
//   });
// });


// // ========== GENERATE ANNIVERSARY NOTIFICATIONS (family + groups) ==========
// const generateAnniversaryNotifications = asyncHandler(async (req, res) => {
//   const today = new Date();
//   const todayMonth = today.getUTCMonth();
//   const todayDate = today.getUTCDate();

//   const families = await Family.findAll(); // Sequelize (Postgres)
//   let createdNotifications = [];

//   for (let fam of families) {
//     const ann = new Date(fam.marriageDate);
//     if (ann.getUTCMonth() === todayMonth && ann.getUTCDate() === todayDate) {
//       // Notify family members
//       const members = await Membership.findAll({ where: { family_id: fam.family_id } });
//       for (let m of members) {
//         const notif = await Notification.create({
//           userId: m.user_id,
//           type: "anniversary",
//           title: "Anniversary Reminder 💍",
//           message: `Today is ${fam.husbandName} & ${fam.wifeName}'s anniversary 🎉`,
//           status: "unread",
//           meta: { anniversaryCouple: `${fam.husbandName} & ${fam.wifeName}` }
//         });
//         createdNotifications.push(notif);
//       }

//       // Notify private groups of family creator
//       const groups = await Privategroup.find({ "members.user_id": fam.createdBy });
//       for (let group of groups) {
//         for (let member of group.members) {
//           const groupNotif = await Notification.create({
//             userId: member.user_id,
//             type: "anniversary",
//             title: "Group Anniversary Reminder 💍",
//             message: `${fam.husbandName} & ${fam.wifeName} are celebrating their anniversary today 🎉`,
//             status: "unread",
//             meta: { couple: `${fam.husbandName} & ${fam.wifeName}`, groupId: group._id }
//           });
//           createdNotifications.push(groupNotif);
//         }
//       }
//     }
//   }

//   return res.status(201).json(
//     new ApiResponse(
//       201,
//       { count: createdNotifications.length, notifications: createdNotifications },
//       "Anniversary notifications generated"
//     )
//   );
// });

// //vansh check it out
// // ========== CREATE MILESTONE NOTIFICATION ========== //
// // const createMilestoneNotification = asyncHandler(async (req, res) => {
// //   const { userId, milestoneName, message } = req.body;

// //   if (!userId || !milestoneName || !message) {
// //     throw new ApiError(400, "userId, milestoneName and message are required");
// //   }

// //   const notif = await Notification.create({
// //     userId,
// //     type: "milestone",
// //     title: milestoneName,
// //     message,
// //     status: "unread",
// //     meta: { milestoneName }
// //   });

// //   return res
// //     .status(201)
// //     .json(new ApiResponse(201, notif, " Milestone notification created"));
// // });


// // ========== GET USER NOTIFICATIONS ==========


// const getUserNotifications = asyncHandler(async (req, res) => {
//   const userId=parseInt(req.user.user_id);
//   const page = Number(req.query.page) || 1; // default page = 1
//   const limit = 10; // fixed 10 notifications per page
//   const skip = (page - 1) * limit;

//   // Fetch notifications with pagination
//   const notifications = await Notification.find({ userId })
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   // Count total notifications
//   const totalCount = await Notification.countDocuments({ userId });
//   const totalPages = Math.ceil(totalCount / limit);
//    console.log(notifications)
//    console.log("hii")

//    const userIds = [...new Set(notifications.map(n => n.userId))];
//   const users = await User.findAll({
//     where: { user_id: userIds },
//     attributes: ["user_id", "fullname"],
//     raw: true,
//   });

//   const userMap = {};
//   users.forEach(u => {
//     userMap[u.user_id] = u.fullname;
//   });

//   const enrichedNotifications = notifications.map(n => ({
//     ...n,
//     user: {
//       user_id: n.userId,
//       fullname: userMap[n.userId] || "Unknown User",
//     },
//   }));

//   return res.status(200).json(
//     new ApiResponse(200, {
//       notifications: enrichedNotifications,
//       page,
//       totalPages,
//       totalCount
//     }, "User notifications fetched")
//   );
// });



// // ========== MARK ONE NOTIFICATION AS READ ==========
// const markAsRead = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const notif = await Notification.findByIdAndUpdate(
//     id,
//     { status: "read" },
//     { new: true }
//   );

//   if (!notif) throw new ApiError(404, "Notification not found");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, notif, " Notification marked as read"));
// });


// // ========== MARK ALL USER NOTIFICATIONS AS READ ==========
// const markAllAsRead = asyncHandler(async (req, res) => {
//   const { userId } = req.params;

//   await Notification.updateMany(
//     { userId, status: "unread" },
//     { $set: { status: "read" } }
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, " All notifications marked as read"));
// });


// // ========== DELETE NOTIFICATION ==========
// // const deleteNotification = asyncHandler(async (req, res) => {
// //   const { id } = req.params;

// //   const notif = await Notification.findByIdAndDelete(id);
// //   if (!notif) throw new ApiError(404, "Notification not found");

// //   return res
// //     .status(200)
// //     .json(new ApiResponse(200, {}, " Notification deleted successfully"));
// // });

// const deleteNotification = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const notif = await Notification.findById(id);
//   if (!notif) throw new ApiError(404, "Notification not found");

//   // Delete all notifications with the same groupNotificationId
//   await Notification.deleteMany({ "meta.groupNotificationId": notif.meta.groupNotificationId });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Notification deleted for all family members"));
// });


// // ✅ Export all controllers
// export {
//   createNotification,
//   generateBirthdayNotifications,
//   generateAnniversaryNotifications,

//   getUserNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification
// };


// src/controllers/notification.controller.js  ← REPLACE your existing file completely
//
// What's new vs the old version:
//  1. sendMessage        — broadcast a message to family members, privategroup members, or both
//  2. sendJoinRequest    — requester asks to join a private group OR family; owner gets notified
//  3. respondToJoinRequest — owner accepts/rejects; requester gets a real-time notification
//  4. getUserNotifications — unchanged API surface, now also emits unread count via socket
//  5. markAsRead / markAllAsRead / deleteNotification — unchanged
//  6. Every write emits the notification to the recipient in real time via Socket.io
//     If the user is offline the notification is still persisted in MongoDB.

import mongoose from "mongoose";
import { Notification } from "../models/notification.models.js";
import { User, Family, Membership } from "../models/index.js";
import { Privategroup } from "../models/privategroup.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitToUser, emitUnreadCount } from "../socketServer.js";
import { Op } from "sequelize";

// ─── INTERNAL HELPER ──────────────────────────────────────────────────────────
// After saving a notification, push it live to the recipient and update their badge count.
const pushAndBadge = async (notification) => {
  const { userId } = notification;
  emitToUser(userId, "new_notification", notification);

  // Recompute unread count for the badge
  const unread = await Notification.countDocuments({ userId, status: "unread" });
  emitUnreadCount(userId, unread);
};

// ─── 1. SEND MESSAGE ──────────────────────────────────────────────────────────
// POST /api/v1/notification/send-message
//
// Body:
//   title        string  required
//   message      string  required
//   audienceType "family" | "privategroup" | "all_families"
//   audienceId   string  required when audienceType is "family" or "privategroup"
//
// Behaviour:
//   • "family"      → sends to all members of the specified family (sender gets a copy too)
//   • "privategroup"→ sends to all members of the specified private group
//   • "all_families"→ sends to all members of every family the sender belongs to
const sendMessage = asyncHandler(async (req, res) => {
  const { title, message, audienceType, audienceId } = req.body;

  const senderId = Number(req.user.user_id);
  const senderName = req.user.fullname || "A family member";

  if (!title || !message || !audienceType) {
    throw new ApiError(400, "title, message, and audienceType are required");
  }

  let recipientIds = []; // Postgres user_ids
  let audienceName = "";

  // ── Resolve recipients ────────────────────────────────────────────────────
  if (audienceType === "family") {
    if (!audienceId) throw new ApiError(400, "audienceId is required for family");
    const family = await Family.findByPk(Number(audienceId));
    if (!family) throw new ApiError(404, "Family not found");
    audienceName = family.family_name;

    const members = await Membership.findAll({ where: { family_id: Number(audienceId) } });
    recipientIds = [...new Set(members.map((m) => Number(m.user_id)))];

  } else if (audienceType === "privategroup") {
    if (!audienceId) throw new ApiError(400, "audienceId is required for privategroup");
    const group = await Privategroup.findById(audienceId);
    if (!group) throw new ApiError(404, "Private group not found");
    audienceName = group.name;

    // Check sender is a member
    const isMember = group.members.some((m) => Number(m.user_id) === senderId);
    if (!isMember) throw new ApiError(403, "You are not a member of this group");

    recipientIds = [...new Set(group.members.map((m) => Number(m.user_id)))];

  } else if (audienceType === "all_families") {
    const memberships = await Membership.findAll({ where: { user_id: senderId } });
    if (!memberships.length) throw new ApiError(400, "You are not part of any family");

    const familyIds = memberships.map((m) => m.family_id);
    const allMembers = await Membership.findAll({ where: { family_id: familyIds } });
    recipientIds = [...new Set(allMembers.map((m) => Number(m.user_id)))];
    audienceName = "All Families";

  } else {
    throw new ApiError(400, "Invalid audienceType");
  }

  if (!recipientIds.length) throw new ApiError(404, "No recipients found");

  // ── Build notification documents ──────────────────────────────────────────
  const groupNotificationId = Date.now();

  const docs = recipientIds.map((uid) => ({
    userId: uid,
    type: "message",
    title,
    message: uid === senderId ? message : `${senderName}: ${message}`,
    status: "unread",
    meta: {
      fromUserId: senderId,
      fromUserName: senderName,
      audienceType,
      audienceId: audienceId || null,
      audienceName,
      groupNotificationId,
    },
  }));

  const created = await Notification.insertMany(docs);

  // ── Push to online recipients in real time ────────────────────────────────
  for (const notif of created) {
    await pushAndBadge(notif);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { count: created.length }, "Message sent successfully"));
});

// ─── 2. SEND JOIN REQUEST ─────────────────────────────────────────────────────
// POST /api/v1/notification/join-request
//
// Body:
//   targetType  "family" | "privategroup"
//   targetId    string  (family_id or Mongo _id)
//
// The notification goes to the OWNER of the family/group so they can accept/reject.
const sendJoinRequest = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;
  const requesterId = Number(req.user.user_id);
  const requesterName = req.user.fullname || "Someone";

  if (!targetType || !targetId) {
    throw new ApiError(400, "targetType and targetId are required");
  }

  let ownerId;
  let targetName;

  if (targetType === "family") {
    const family = await Family.findByPk(Number(targetId));
    if (!family) throw new ApiError(404, "Family not found");
    ownerId = Number(family.created_by);
    targetName = family.family_name;

    // Check if already a member
    const existing = await Membership.findOne({
      where: { family_id: Number(targetId), user_id: requesterId },
    });
    if (existing) throw new ApiError(400, "You are already a member of this family");

  } else if (targetType === "privategroup") {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new ApiError(400, "Invalid group id");
    }
    const group = await Privategroup.findById(targetId);
    if (!group) throw new ApiError(404, "Private group not found");
    ownerId = Number(group.createdBy);
    targetName = group.name;

    const alreadyMember = group.members.some((m) => Number(m.user_id) === requesterId);
    if (alreadyMember) throw new ApiError(400, "You are already a member of this group");

  } else {
    throw new ApiError(400, "targetType must be 'family' or 'privategroup'");
  }

  // Check for a duplicate pending request
  const duplicate = await Notification.findOne({
    userId: ownerId,
    type: "join_request",
    "joinRequest.requesterId": requesterId,
    "joinRequest.targetId": String(targetId),
    "joinRequest.decision": "pending",
  });
  if (duplicate) throw new ApiError(400, "A join request is already pending for this group/family");

  // Create the join request notification for the owner
  const notif = await Notification.create({
    userId: ownerId,
    type: "join_request",
    title: `Join Request — ${targetName}`,
    message: `${requesterName} wants to join ${targetName}.`,
    status: "unread",
    joinRequest: {
      requesterId,
      requesterName,
      targetType,
      targetId: String(targetId),
      targetName,
      decision: "pending",
    },
  });

  await pushAndBadge(notif);

  return res
    .status(201)
    .json(new ApiResponse(201, notif, "Join request sent to the owner"));
});

// ─── 3. RESPOND TO JOIN REQUEST ───────────────────────────────────────────────
// PATCH /api/v1/notification/join-request/:notifId/respond
//
// Body:
//   decision  "accepted" | "rejected"
//
// Only the owner of the family/group can call this.
// On accept: adds the requester to the family/group (same as the existing join flows).
// Either way: updates the join_request notification and sends a join_response to the requester.
const respondToJoinRequest = asyncHandler(async (req, res) => {
  const { notifId } = req.params;
  const { decision } = req.body;
  const ownerId = Number(req.user.user_id);
  const ownerName = req.user.fullname || "The owner";

  if (!["accepted", "rejected"].includes(decision)) {
    throw new ApiError(400, "decision must be 'accepted' or 'rejected'");
  }

  // Fetch the join_request notification
  const requestNotif = await Notification.findById(notifId);
  if (!requestNotif || requestNotif.type !== "join_request") {
    throw new ApiError(404, "Join request notification not found");
  }
  if (requestNotif.userId !== ownerId) {
    throw new ApiError(403, "Only the owner can respond to this request");
  }
  if (requestNotif.joinRequest.decision !== "pending") {
    throw new ApiError(400, "This request has already been responded to");
  }

  const { requesterId, requesterName, targetType, targetId, targetName } =
    requestNotif.joinRequest;

  // ── Perform the join if accepted ──────────────────────────────────────────
  if (decision === "accepted") {
    if (targetType === "family") {
      const existing = await Membership.findOne({
        where: { family_id: Number(targetId), user_id: requesterId },
      });
      if (!existing) {
        await Membership.create({
          family_id: Number(targetId),
          user_id: requesterId,
          role: "member",
        });
      }
    } else if (targetType === "privategroup") {
      const group = await Privategroup.findById(targetId);
      if (!group) throw new ApiError(404, "Group not found");

      const already = group.members.some((m) => Number(m.user_id) === requesterId);
      if (!already) {
        group.members.push({ user_id: requesterId, role: "member", joinedAt: new Date() });
        await group.save();
      }
    }
  }

  // ── Update the original join_request notification to reflect the decision ─
  requestNotif.joinRequest.decision = decision;
  requestNotif.status = "read"; // owner acted on it
  await requestNotif.save();

  // ── Send a join_response notification to the requester ───────────────────
  const responseNotif = await Notification.create({
    userId: requesterId,
    type: "join_response",
    title:
      decision === "accepted"
        ? `✅ You're in — ${targetName}`
        : `❌ Request declined — ${targetName}`,
    message:
      decision === "accepted"
        ? `${ownerName} accepted your request to join ${targetName}.`
        : `${ownerName} declined your request to join ${targetName}.`,
    status: "unread",
    joinRequest: {
      requesterId,
      requesterName,
      targetType,
      targetId,
      targetName,
      decision,
      originalRequestNotifId: String(requestNotif._id),
    },
  });

  await pushAndBadge(responseNotif);

  // Also emit an update to the owner's own notification so the UI can refresh the badge/state
  emitToUser(ownerId, "join_request_updated", {
    notifId: String(requestNotif._id),
    decision,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { requestNotif, responseNotif }, `Request ${decision}`)
    );
});

// ─── 4. GET USER NOTIFICATIONS ────────────────────────────────────────────────
// GET /api/v1/notification/user?page=1
const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.user_id);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const [notifications, totalCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId }),
  ]);

  const unreadCount = await Notification.countDocuments({ userId, status: "unread" });

  // Emit the current unread count so the badge updates on page load
  emitUnreadCount(userId, unreadCount);

  // Enrich with sender name from Postgres (for message notifications)
  const fromUserIds = [
    ...new Set(
      notifications
        .map((n) => n.meta?.fromUserId || n.joinRequest?.requesterId)
        .filter(Boolean)
    ),
  ];

  const users =
    fromUserIds.length > 0
      ? await User.findAll({
        where: { user_id: fromUserIds },
        attributes: ["user_id", "fullname"],
        raw: true,
      })
      : [];

  const userMap = {};
  users.forEach((u) => (userMap[u.user_id] = u.fullname));

  const enriched = notifications.map((n) => ({
    ...n,
    senderName:
      n.meta?.fromUserName ||
      userMap[n.meta?.fromUserId] ||
      n.joinRequest?.requesterName ||
      "System",
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications: enriched,
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        unreadCount,
      },
      "Notifications fetched"
    )
  );
});

// ─── 5. MARK ONE AS READ ──────────────────────────────────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = Number(req.user.user_id);

  const notif = await Notification.findByIdAndUpdate(
    id,
    { status: "read" },
    { new: true }
  );
  if (!notif) throw new ApiError(404, "Notification not found");

  const unread = await Notification.countDocuments({ userId, status: "unread" });
  emitUnreadCount(userId, unread);

  return res.status(200).json(new ApiResponse(200, notif, "Marked as read"));
});

// ─── 6. MARK ALL AS READ ─────────────────────────────────────────────────────
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = Number(req.user.user_id);

  await Notification.updateMany({ userId, status: "unread" }, { $set: { status: "read" } });
  emitUnreadCount(userId, 0);

  return res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});

// ─── 7. DELETE NOTIFICATION ───────────────────────────────────────────────────
// If it's a broadcast message (has groupNotificationId), deletes all copies.
// Otherwise deletes just this one.
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = Number(req.user.user_id);

  const notif = await Notification.findById(id);
  if (!notif) throw new ApiError(404, "Notification not found");

  if (notif.meta?.groupNotificationId) {
    // Only the original sender can bulk-delete
    if (notif.meta.fromUserId !== userId) {
      throw new ApiError(403, "Only the sender can delete this notification for everyone");
    }
    await Notification.deleteMany({
      "meta.groupNotificationId": notif.meta.groupNotificationId,
    });
  } else {
    await Notification.findByIdAndDelete(id);
  }

  const unread = await Notification.countDocuments({ userId, status: "unread" });
  emitUnreadCount(userId, unread);

  return res.status(200).json(new ApiResponse(200, {}, "Notification deleted"));
});

// ─── 8. GET UNREAD COUNT (REST fallback) ─────────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = Number(req.user.user_id);
  const count = await Notification.countDocuments({ userId, status: "unread" });
  return res.status(200).json(new ApiResponse(200, { count }, "Unread count"));
});

// ─── 9. LEGACY: keep old birthday/anniversary generators working ──────────────
// (unchanged — just re-exported so existing routes don't break)
import { generateBirthdayNotifications, generateAnniversaryNotifications } from "./notification.legacy.controller.js";

export {
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
};
