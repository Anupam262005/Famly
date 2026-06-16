// src/controllers/notification.legacy.controller.js
// Birthday and anniversary generators extracted from the old controller.
// No socket integration needed — these are cron-style batch jobs.

import { Notification } from "../models/notification.models.js";
import { User, Family, Membership } from "../models/index.js";
import { Privategroup } from "../models/privategroup.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateBirthdayNotifications = asyncHandler(async (req, res) => {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const users = await User.findAll();
  const notifications = [];

  for (let user of users) {
    const dob = new Date(user.dob);
    if (dob.getMonth() === todayMonth && dob.getDate() === todayDate) {
      notifications.push({
        userId: user.user_id,
        type: "birthday",
        title: "Happy Birthday 🎂",
        message: `Wishing you a wonderful birthday, ${user.fullname}!`,
        status: "unread",
        meta: { fromUserName: "Famly" },
      });

      const userMemberships = await Membership.findAll({ where: { user_id: user.user_id } });
      const familyIds = userMemberships.map((m) => m.family_id);

      if (familyIds.length > 0) {
        const familyMembers = await Membership.findAll({ where: { family_id: familyIds } });
        familyMembers.forEach((fm) => {
          if (fm.user_id !== user.user_id) {
            notifications.push({
              userId: fm.user_id,
              type: "birthday",
              title: "Birthday Reminder 🎂",
              message: `Today is ${user.fullname}'s birthday! 🎉`,
              status: "unread",
              meta: { fromUserName: "Famly" },
            });
          }
        });
      }
    }
  }

  const created = await Notification.insertMany(notifications);
  return res.status(201).json(
    new ApiResponse(201, { count: created.length }, "Birthday notifications generated")
  );
});

export const generateAnniversaryNotifications = asyncHandler(async (req, res) => {
  const today = new Date();
  const todayMonth = today.getUTCMonth();
  const todayDate = today.getUTCDate();

  const families = await Family.findAll();
  const notifications = [];

  for (let fam of families) {
    const ann = new Date(fam.marriage_date);
    if (ann.getUTCMonth() === todayMonth && ann.getUTCDate() === todayDate) {
      const members = await Membership.findAll({ where: { family_id: fam.family_id } });
      members.forEach((m) => {
        notifications.push({
          userId: m.user_id,
          type: "anniversary",
          title: "Anniversary Reminder 💍",
          message: `Happy anniversary to the ${fam.family_name} family! 🎉`,
          status: "unread",
          meta: { fromUserName: "Famly" },
        });
      });
    }
  }

  const created = await Notification.insertMany(notifications);
  return res.status(201).json(
    new ApiResponse(201, { count: created.length }, "Anniversary notifications generated")
  );
});
