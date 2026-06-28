// // import mongoose, { Schema } from "mongoose";

// // const notificationSchema = new Schema({
// //   userId: {
// //     type: Number, // receiver of the notification
// //     required: true,
// //   },

// //   type: {
// //     type: String,
// //     enum: ["birthday", "anniversary", "general", "comment","like", "story"],
// //     required: true,
// //   },

// //   title: {
// //     type: String,
// //     required: true,
// //     trim: true,
// //   },

// //   message: {
// //     type: String,
// //     required: true,
// //   },

// //   link: {
// //     type: String, // optional: redirect to story, group, or milestone page
// //     default: null,
// //   },

// //   status: {
// //     type: String,
// //     enum: ["unread", "read"],
// //     default: "unread",
// //   },

// //   meta: {
// //     // store extra details depending on type
// //     birthdayPerson: { type: String },  // for birthdays
// //     anniversaryCouple: { type: String }, // for anniversaries
// //     milestoneName: { type: String },   // for milestone (e.g. "100 stories")
// //     storyId: { type: String },         // for story notifications
// //     commentId: { type: String },       // for comment notifications
// //     groupId: { type: String }, 
// //     fromUserId: { type: Number }, 
// //     groupNotificationId : {type :Number},        // optional: link to group
// //   },

// //   expiresAt: {
// //     type: Date, // optional: reminders can expire
// //   }

// // }, { timestamps: true });  // createdAt, updatedAt

// // export const Notification = mongoose.model("Notification", notificationSchema);


// // src/models/notification.models.js  ← REPLACE your existing file
// // Added types: "message", "join_request", "join_response"
// // Removed category types (birthday, anniversary, etc.) per your requirement
// // targetType / targetId track whether the request is for a family or privategroup

// import mongoose, { Schema } from "mongoose";

// const notificationSchema = new Schema(
//   {
//     userId: {
//       type: Number,
//       required: true,
//       index: true,
//     },

//     type: {
//       type: String,
//       enum: [
//         "message",
//         "join_request",          // user → family admin: wants to join via code
//         "join_response",         // admin → user: response to join request (privategroup)
//         "family_invitation",     // admin → user: admin invites user to family
//         "family_invitation_response", // user → admin: accepted/rejected invitation
//         "birthday",
//         "anniversary",
//         "general",
//         "comment",
//         "like",
//         "story",
//       ],
//       required: true,
//     },

//     title: { type: String, required: true, trim: true },
//     message: { type: String, required: true },
//     status: { type: String, enum: ["unread", "read"], default: "unread" },

//     // ── For join requests (user → family admin, or user → group owner) ──────
//     joinRequest: {
//       requesterId: { type: Number },
//       requesterName: { type: String },
//       targetType: { type: String, enum: ["family", "privategroup"] },
//       targetId: { type: String },
//       targetName: { type: String },
//       decision: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//       originalRequestNotifId: { type: String },
//     },

//     // ── For family invitations (admin → user) ────────────────────────────────
//     familyInvitation: {
//       invitedBy: { type: Number },
//       invitedByName: { type: String },
//       familyId: { type: String },
//       familyName: { type: String },
//       role: { type: String, enum: ["admin", "member"] },
//       decision: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//       originalInvitationNotifId: { type: String },
//     },

//     // ── For broadcast messages ────────────────────────────────────────────────
//     meta: {
//       fromUserId: { type: Number },
//       fromUserName: { type: String },
//       audienceType: { type: String, enum: ["family", "privategroup", "all_families"] },
//       audienceId: { type: String },
//       audienceName: { type: String },
//       groupNotificationId: { type: Number },
//     },

//     link: { type: String, default: null },
//     expiresAt: { type: Date },
//   },
//   { timestamps: true }
// );



// notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

// export const Notification = mongoose.model("Notification", notificationSchema);



// new code with video call notification support


// import mongoose, { Schema } from "mongoose";

// const notificationSchema = new Schema({
//   userId: {
//     type: Number, // receiver of the notification
//     required: true,
//   },

//   type: {
//     type: String,
//     enum: ["birthday", "anniversary", "general", "comment","like", "story"],
//     required: true,
//   },

//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   message: {
//     type: String,
//     required: true,
//   },

//   link: {
//     type: String, // optional: redirect to story, group, or milestone page
//     default: null,
//   },

//   status: {
//     type: String,
//     enum: ["unread", "read"],
//     default: "unread",
//   },

//   meta: {
//     // store extra details depending on type
//     birthdayPerson: { type: String },  // for birthdays
//     anniversaryCouple: { type: String }, // for anniversaries
//     milestoneName: { type: String },   // for milestone (e.g. "100 stories")
//     storyId: { type: String },         // for story notifications
//     commentId: { type: String },       // for comment notifications
//     groupId: { type: String }, 
//     fromUserId: { type: Number }, 
//     groupNotificationId : {type :Number},        // optional: link to group
//   },

//   expiresAt: {
//     type: Date, // optional: reminders can expire
//   }

// }, { timestamps: true });  // createdAt, updatedAt

// export const Notification = mongoose.model("Notification", notificationSchema);


// src/models/notification.models.js  ← REPLACE your existing file
// Added types: "message", "join_request", "join_response"
// Removed category types (birthday, anniversary, etc.) per your requirement
// targetType / targetId track whether the request is for a family or privategroup

import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "message",
        "join_request",          // user → family admin: wants to join via code
        "join_response",         // admin → user: response to join request (privategroup)
        "family_invitation",     // admin → user: admin invites user to family
        "family_invitation_response", // user → admin: accepted/rejected invitation
        "video_call",            // caller → family members: video/audio call started
        "birthday",
        "anniversary",
        "general",
        "comment",
        "like",
        "story",
      ],
      required: true,
    },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["unread", "read"], default: "unread" },

    // ── For join requests (user → family admin, or user → group owner) ──────
    joinRequest: {
      requesterId: { type: Number },
      requesterName: { type: String },
      targetType: { type: String, enum: ["family", "privategroup"] },
      targetId: { type: String },
      targetName: { type: String },
      decision: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      originalRequestNotifId: { type: String },
    },

    // ── For family invitations (admin → user) ────────────────────────────────
    familyInvitation: {
      invitedBy: { type: Number },
      invitedByName: { type: String },
      familyId: { type: String },
      familyName: { type: String },
      role: { type: String, enum: ["admin", "member"] },
      decision: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      originalInvitationNotifId: { type: String },
    },

    // ── For broadcast messages ────────────────────────────────────────────────
    meta: {
      fromUserId: { type: Number },
      fromUserName: { type: String },
      audienceType: { type: String, enum: ["family", "privategroup", "all_families"] },
      audienceId: { type: String },
      audienceName: { type: String },
      groupNotificationId: { type: Number },
    },

    link: { type: String, default: null },
    expiresAt: { type: Date },

    // ── For video/audio call notifications ───────────────────────────────────
    call: {
      roomId:     { type: String },
      mode:       { type: String, enum: ["video", "audio"] },
      callerName: { type: String },
      callerId:   { type: Number },
      familyId:   { type: String },
    },
  },
  { timestamps: true }
);



notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);