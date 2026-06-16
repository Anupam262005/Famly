import { User, Family, Membership } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteImageOnCloudinary } from "../utils/cloudinary.js";
import { Op } from 'sequelize';
import { sequelize } from "../db/index.js"
import { Notification } from "../models/notification.models.js";
import { emitToUser, emitUnreadCount } from "../socketServer.js";

const generateInvitationCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FAM-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const isRootMember = (family, userId) => {
  return Number(family.male_root_member) === Number(userId) ||
    Number(family.female_root_member) === Number(userId);
};

// Internal helper: push notification live + update badge count
const pushAndBadge = async (notification) => {
  const { userId } = notification;
  emitToUser(userId, "new_notification", notification);
  const unread = await Notification.countDocuments({ userId, status: "unread" });
  emitUnreadCount(userId, unread);
};

const createFamily = asyncHandler(async (req, res) => {
  const { family_name, marriage_date, description } = req.body;

  if (!family_name || !marriage_date) {
    throw new ApiError(400, "Family name and marriage date are required");
  }

  const user = await User.findByPk(Number(req.user.user_id));
  if (!user) throw new ApiError(404, "User not found");

  const existingRootFamily = await Family.findOne({
    where: {
      [Op.or]: [
        { male_root_member: user.user_id },
        { female_root_member: user.user_id },
      ],
    },
  });

  if (existingRootFamily) {
    throw new ApiError(400, "You are already a root member of another family and cannot create a new family");
  }

  let male_root_member = null;
  let female_root_member = null;
  let ancestor = null;

  if (user.gender.toLowerCase() === "male") {
    male_root_member = user.user_id;
    ancestor = user.parent_family || null;
  } else if (user.gender.toLowerCase() === "female") {
    female_root_member = user.user_id;
  } else {
    throw new ApiError(400, "User gender must be male or female");
  }

  let familyPhotoUrl = "https://res.cloudinary.com/famly/image/upload/v1759747171/default-family-image_vjfu7v.jpg";
  if (req.file) {
    try {
      const uploadResult = await uploadOnCloudinary(req.file.path, "image");
      if (!uploadResult) throw new Error("Upload failed");
      familyPhotoUrl = uploadResult.secure_url;
    } catch (uploadError) {
      throw new ApiError(500, "Failed to upload family photo");
    }
  }

  let invitation_code;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    invitation_code = generateInvitationCode();
    const existingFamily = await Family.findOne({ where: { invitation_code } });
    if (!existingFamily) isUnique = true;
    attempts++;
  }

  if (!isUnique) throw new ApiError(500, "Failed to generate unique invitation code");

  const transaction = await Family.sequelize.transaction();

  try {
    const newFamily = await Family.create({
      family_name,
      marriage_date,
      description: description || null,
      familyPhoto: familyPhotoUrl,
      created_by: user.user_id,
      male_root_member,
      female_root_member,
      ancestor,
      invitation_code,
    }, { transaction });

    const rootMemberId = male_root_member || female_root_member;
    await Membership.create({
      family_id: newFamily.family_id,
      user_id: rootMemberId,
      role: "admin",
    }, { transaction });

    await transaction.commit();

    return res
      .status(201)
      .json(new ApiResponse(201, newFamily, "Family created successfully"));

  } catch (error) {
    await transaction.rollback();
    throw new ApiError(500, "Failed to create family: " + error.message);
  }
});

const getFamily = asyncHandler(async (req, res) => {
  const { familyId } = req.params;

  if (!familyId) throw new ApiError(400, "Family ID is required");

  const family = await Family.findByPk(familyId, {
    include: [
      { model: User, as: "maleRoot", attributes: ["user_id", "username", "fullname", "email", "gender", "profilePhoto"] },
      { model: User, as: "femaleRoot", attributes: ["user_id", "username", "fullname", "email", "gender", "profilePhoto"] },
      {
        model: Membership,
        as: "memberships",
        include: [
          { model: User, as: "user", attributes: ["user_id", "username", "fullname", "email", "gender", "profilePhoto"] },
        ],
      },
    ],
  });

  if (!family) throw new ApiError(404, "Family not found");

  return res.status(200).json(new ApiResponse(200, family, "Family fetched successfully"));
});

// ─── GET MY FAMILIES ──────────────────────────────────────────────────────────
const getMyFamilies = asyncHandler(async (req, res) => {
  const userId = Number(req.user.user_id);

  const memberships = await Membership.findAll({ where: { user_id: userId } });
  const familyIds = memberships.map((m) => m.family_id);

  const families = await Family.findAll({
    where: {
      [Op.or]: [
        { family_id: familyIds },
        { male_root_member: userId },
        { female_root_member: userId }
      ]
    },
    order: [['created_at', 'DESC']],
  });

  if (!families || families.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "You are not in any families yet"));
  }

  return res.status(200).json(new ApiResponse(200, families, "Fetched your families successfully"));
});

// ─── ADD MEMBER (sends acceptance invitation notification to user) ─────────────
// Admin sends a notification to the user asking them to accept family membership
const addMember = asyncHandler(async (req, res) => {
  const family_id = Number(req.params.family_id);
  const username = req.body.username;

  if (!family_id || !username) throw new ApiError(400, "family_id and username are required");

  // Check if family exists
  const family = await Family.findByPk(family_id);
  if (!family) throw new ApiError(404, "Family not found");

  // Check if current user is root member
  if (!isRootMember(family, req.user.user_id)) {
    throw new ApiError(403, "Only root members can add members to this family");
  }

  // Check if user exists by username
  const user = await User.findOne({ where: { username: username } });
  if (!user) throw new ApiError(404, "User not found");

  // Prevent adding yourself
  if (Number(req.user.user_id) === user.user_id) {
    throw new ApiError(400, "You cannot add yourself as a member");
  }

  // Check if user already has a parent family
  if (user.parent_family !== null) {
    throw new ApiError(400, "This user already belongs to a family and cannot be added");
  }

  // Check if user is already a member of this family
  const existingMembership = await Membership.findOne({ where: { family_id, user_id: user.user_id } });
  if (existingMembership) throw new ApiError(400, "User is already a member of this family");

  // Check if there's already a pending invitation for this user+family
  const existingInvitation = await Notification.findOne({
    userId: user.user_id,
    type: "family_invitation",
    "familyInvitation.familyId": String(family_id),
    "familyInvitation.decision": "pending",
  });
  if (existingInvitation) throw new ApiError(400, "An invitation is already pending for this user");

  const adminUser = await User.findByPk(Number(req.user.user_id));
  const adminName = adminUser?.fullname || "Family Admin";

  // Create invitation notification for the target user
  const notif = await Notification.create({
    userId: user.user_id,
    type: "family_invitation",
    title: `Family Invitation — ${family.family_name}`,
    message: `${adminName} has invited you to join the ${family.family_name} family as a member.`,
    status: "unread",
    familyInvitation: {
      invitedBy: Number(req.user.user_id),
      invitedByName: adminName,
      familyId: String(family_id),
      familyName: family.family_name,
      role: "member",
      decision: "pending",
    },
  });

  await pushAndBadge(notif);

  return res
    .status(200)
    .json(new ApiResponse(200, notif, `Invitation sent to ${user.fullname}. They must accept to join the family.`));
});

// ─── ADD ROOT MEMBER (sends acceptance invitation notification to user) ────────
const addRootMember = asyncHandler(async (req, res) => {
  const username = req.body.username;
  if (!username) throw new ApiError(400, "username is required");

  // Get current user
  const currentUser = await User.findByPk(Number(req.user.user_id));
  if (!currentUser) throw new ApiError(404, "Current user not found");

  // Get target user by username
  const targetUser = await User.findOne({ where: { username: username } });
  if (!targetUser) throw new ApiError(404, "Target user not found");

  if (currentUser.user_id === targetUser.user_id) {
    throw new ApiError(400, "You cannot add yourself as a root member");
  }

  // Check if target user is already a root member in another family
  const existingRootFamily = await Family.findOne({
    where: {
      [Op.or]: [
        { male_root_member: targetUser.user_id },
        { female_root_member: targetUser.user_id },
      ],
    },
  });
  if (existingRootFamily) throw new ApiError(400, "This user is already a root member of another family");

  // Fetch the family where current user is a root member
  const family = await Family.findOne({
    where: {
      [Op.or]: [
        { male_root_member: currentUser.user_id },
        { female_root_member: currentUser.user_id },
      ],
    },
  });
  if (!family) throw new ApiError(404, "You are not a root member of any family");

  // Validate the gender slot is available
  if (targetUser.gender.toLowerCase() === "male") {
    if (family.male_root_member) throw new ApiError(400, "Male root member already exists");
  } else if (targetUser.gender.toLowerCase() === "female") {
    if (family.female_root_member) throw new ApiError(400, "Female root member already exists");
  } else {
    throw new ApiError(400, "User gender must be male or female");
  }

  // Check for existing pending invitation
  const existingInvitation = await Notification.findOne({
    userId: targetUser.user_id,
    type: "family_invitation",
    "familyInvitation.familyId": String(family.family_id),
    "familyInvitation.decision": "pending",
  });
  if (existingInvitation) throw new ApiError(400, "An invitation is already pending for this user");

  // Create root member invitation notification
  const notif = await Notification.create({
    userId: targetUser.user_id,
    type: "family_invitation",
    title: `Root Member Invitation — ${family.family_name}`,
    message: `${currentUser.fullname} has invited you to join the ${family.family_name} family as a root member (admin).`,
    status: "unread",
    familyInvitation: {
      invitedBy: currentUser.user_id,
      invitedByName: currentUser.fullname,
      familyId: String(family.family_id),
      familyName: family.family_name,
      role: "admin",
      decision: "pending",
    },
  });

  await pushAndBadge(notif);

  return res
    .status(200)
    .json(new ApiResponse(200, notif, `Root member invitation sent to ${targetUser.fullname}. They must accept to join.`));
});

// ─── RESPOND TO FAMILY INVITATION (member accepts/rejects) ───────────────────
// Called by the invited user to accept or reject a family_invitation
const respondToFamilyInvitation = asyncHandler(async (req, res) => {
  const { notifId } = req.params;
  const { decision } = req.body;

  const userId = Number(req.user.user_id);
  const userName = req.user.fullname || "The user";

  if (!["accepted", "rejected"].includes(decision)) {
    throw new ApiError(400, "decision must be 'accepted' or 'rejected'");
  }

  const invitationNotif = await Notification.findById(notifId);

  if (!invitationNotif || invitationNotif.type !== "family_invitation") {
    throw new ApiError(404, "Invitation notification not found");
  }

  if (Number(invitationNotif.userId) !== userId) {
    throw new ApiError(403, "This invitation is not for you");
  }

  if (invitationNotif.familyInvitation.decision !== "pending") {
    throw new ApiError(
      400,
      "This invitation has already been responded to"
    );
  }

  const {
    invitedBy,
    invitedByName,
    familyId,
    familyName,
    role,
  } = invitationNotif.familyInvitation;

  // ===================================================
  // ACCEPT INVITATION
  // ===================================================
  if (decision === "accepted") {
    const transaction = await sequelize.transaction();

    try {
      const family = await Family.findByPk(Number(familyId), {
        transaction,
      });

      if (!family) {
        throw new ApiError(404, "Family not found");
      }

      const user = await User.findByPk(userId, {
        transaction,
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // ---------------------------------------------------
      // ADMIN (ROOT MEMBER) INVITATION
      // ---------------------------------------------------
      if (role === "admin") {
        // User cannot already be root member of another family
        const alreadyRoot = await Family.findOne({
          where: {
            [Op.or]: [
              { male_root_member: userId },
              { female_root_member: userId },
            ],
            family_id: {
              [Op.ne]: Number(familyId),
            },
          },
          transaction,
        });

        if (alreadyRoot) {
          throw new ApiError(
            400,
            `You are already a root member of "${alreadyRoot.family_name}". Please leave or delete that family before accepting this invitation.`
          );
        }

        const updateData = {};

        if (user.gender?.toLowerCase() === "male") {
          if (family.male_root_member) {
            throw new ApiError(
              400,
              "Male root slot is already occupied"
            );
          }

          updateData.male_root_member = userId;
          updateData.ancestor = user.parent_family || null;
        } else if (user.gender?.toLowerCase() === "female") {
          if (family.female_root_member) {
            throw new ApiError(
              400,
              "Female root slot is already occupied"
            );
          }

          updateData.female_root_member = userId;
        } else {
          throw new ApiError(
            400,
            "User gender must be male or female"
          );
        }

        await family.update(updateData, { transaction });
      }

      // ---------------------------------------------------
      // MEMBER INVITATION
      // ---------------------------------------------------
      if (role === "member") {
        // User can belong to only one parent family
        if (user.parent_family !== null) {
          throw new ApiError(
            400,
            "You are already a member of another family. Please leave that family before accepting this invitation."
          );
        }
      }

      // ---------------------------------------------------
      // CREATE MEMBERSHIP IF NOT ALREADY EXISTS
      // ---------------------------------------------------
      const existingMembership = await Membership.findOne({
        where: {
          family_id: Number(familyId),
          user_id: userId,
        },
        transaction,
      });

      if (!existingMembership) {
        await Membership.create(
          {
            family_id: Number(familyId),
            user_id: userId,
            role,
          },
          { transaction }
        );
      }

      // ---------------------------------------------------
      // ONLY MEMBER INVITATIONS UPDATE parent_family
      // ---------------------------------------------------
      if (role === "member") {
        await User.update(
          {
            parent_family: Number(familyId),
          },
          {
            where: {
              user_id: userId,
            },
            transaction,
          }
        );

        // If a male member joins his parent's family,
        // connect any family where he is the male root.
        if (user.gender?.toLowerCase() === "male") {
          await Family.update(
            {
              ancestor: Number(familyId),
            },
            {
              where: {
                male_root_member: userId,
                family_id: {
                  [Op.ne]: Number(familyId),
                },
              },
              transaction,
            }
          );
        }
      }

      await transaction.commit();

      // ---------------------------------------------------
      // REMOVE OTHER PENDING INVITATIONS OF SAME ROLE
      // ---------------------------------------------------
      if (role === "member") {
        await Notification.deleteMany({
          userId,
          type: "family_invitation",
          "familyInvitation.role": "member",
          "familyInvitation.decision": "pending",
          _id: { $ne: invitationNotif._id },
        });
      }

      if (role === "admin") {
        await Notification.deleteMany({
          userId,
          type: "family_invitation",
          "familyInvitation.role": "admin",
          "familyInvitation.decision": "pending",
          _id: { $ne: invitationNotif._id },
        });
      }

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ===================================================
  // DELETE CURRENT INVITATION AND CREATE MESSAGE FOR INVITEE
  // ===================================================
  await invitationNotif.deleteOne();

  const myResponseNotif = await Notification.create({
    userId: userId,
    type: "message",
    title: decision === "accepted" ? "Invitation Accepted" : "Invitation Declined",
    message: decision === "accepted" 
        ? `You have accepted the invitation to join the ${familyName} family.` 
        : `You have declined the invitation to join the ${familyName} family.`,
    status: "unread",
    meta: {
      fromUserName: "System",
      audienceName: familyName
    }
  });

  await pushAndBadge(myResponseNotif);

  // ===================================================
  // NOTIFY THE INVITER
  // ===================================================
  const responseNotif = await Notification.create({
    userId: invitedBy,
    type: "family_invitation_response",
    title:
      decision === "accepted"
        ? `✅ ${userName} joined ${familyName}`
        : `❌ ${userName} declined your invitation`,
    message:
      decision === "accepted"
        ? `${userName} accepted your invitation to join the ${familyName} family.`
        : `${userName} declined your invitation to join the ${familyName} family.`,
    status: "unread",
    familyInvitation: {
      invitedBy,
      invitedByName,
      familyId,
      familyName,
      role,
      decision,
      originalInvitationNotifId: String(invitationNotif._id),
    },
  });

  await pushAndBadge(responseNotif);

  emitToUser(invitedBy, "invitation_response_received", {
    notifId: String(invitationNotif._id),
    decision,
    userName,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        invitationNotif,
        responseNotif,
      },
      `Invitation ${decision}`
    )
  );
});


const updateFamily = asyncHandler(async (req, res) => {
  const family_id = Number(req.params.family_id);
  const { family_name, marriage_date, description } = req.body;

  if (!family_id || isNaN(family_id)) throw new ApiError(400, "Valid family ID is required");

  const family = await Family.findByPk(family_id);
  if (!family) throw new ApiError(404, "Family not found");

  if (!isRootMember(family, req.user.user_id)) {
    throw new ApiError(403, "Only root members can update family details");
  }

  const transaction = await Family.sequelize.transaction();

  try {
    const updateData = {};
    if (family_name?.trim()) updateData.family_name = family_name.trim();
    if (marriage_date) {
      const date = new Date(marriage_date);
      if (isNaN(date)) throw new ApiError(400, "Invalid marriage date format");
      updateData.marriage_date = marriage_date;
    }
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      if (family.familyPhoto && !family.familyPhoto.includes("default-family-image")) {
        await deleteImageOnCloudinary(family.familyPhoto);
      }
      const uploadedPhoto = await uploadOnCloudinary(req.file.path, "image");
      if (!uploadedPhoto) throw new ApiError(500, "Failed to upload family photo");
      updateData.familyPhoto = uploadedPhoto.secure_url;
    }

    await family.update(updateData, { transaction });
    await family.reload({ transaction });
    await transaction.commit();

    return res.status(200).json(new ApiResponse(200, family, "Family details updated successfully"));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

const removeMember = asyncHandler(async (req, res) => {
  const family_id = Number(req.params.family_id);
  const user_id = Number(req.query.user_id);
  const current_user_id = Number(req.user.user_id);

  if (!family_id || !user_id) throw new ApiError(400, "family_id and user_id are required");

  const transaction = await Family.sequelize.transaction();

  try {
    const family = await Family.findByPk(family_id, { transaction });
    if (!family) throw new ApiError(404, "Family not found");

    if (!isRootMember(family, current_user_id)) {
      throw new ApiError(403, "Only root members can remove members from the family");
    }

    if (isRootMember(family, user_id)) {
      throw new ApiError(400, "Cannot remove a root member from the family");
    }

    const membership = await Membership.findOne({ where: { family_id, user_id }, transaction });
    if (!membership) throw new ApiError(404, "User is not a member of this family");

    await membership.destroy({ transaction });

    await User.update({ parent_family: null }, { where: { user_id }, transaction });

    const user = await User.findByPk(user_id, { transaction });
    if (user?.gender?.toLowerCase() === "male") {
      await Family.update(
        { ancestor: null },
        {
          where: {
            male_root_member: user_id,
            ancestor: family_id,
          },
          transaction,
        }
      );
    }

    await transaction.commit();
    return res.status(200).json(new ApiResponse(200, {}, "Member removed successfully"));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

const leaveMember = asyncHandler(async (req, res) => {
  const family_id = Number(req.params.family_id);
  const user_id = Number(req.user.user_id);

  const t = await sequelize.transaction();

  try {
    const family = await Family.findByPk(family_id, { transaction: t });
    if (!family) throw new ApiError(404, "Family not found");

    if (Number(family.male_root_member) === user_id || Number(family.female_root_member) === user_id) {
      throw new ApiError(400, "Root members cannot leave the family. Transfer root status first.");
    }

    const membership = await Membership.findOne({ where: { family_id, user_id }, transaction: t });
    if (!membership) throw new ApiError(404, "User is not a member of this family");

    await membership.destroy({ transaction: t });

    const user = await User.findByPk(user_id, { transaction: t });
    if (user) {
      user.parent_family = null;
      await user.save({ transaction: t });
      if (user.gender?.toLowerCase() === "male") {
        await Family.update(
          { ancestor: null },
          {
            where: {
              male_root_member: user_id,
              ancestor: family_id,
            },
            transaction: t,
          }
        );
      }
    }

    await t.commit();
    return res.status(200).json(new ApiResponse(200, {}, "Left family successfully"));
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

const deleteFamily = asyncHandler(async (req, res) => {
  const family_id = Number(req.params.family_id);

  if (!family_id) {
    throw new ApiError(400, "family_id is required");
  }

  // Check if family exists
  const family = await Family.findByPk(family_id);
  if (!family) {
    throw new ApiError(404, "Family not found");
  }

  // Only root members can delete
  const currentUserId = Number(req.user.user_id);
  if (
    Number(family.male_root_member) !== currentUserId &&
    Number(family.female_root_member) !== currentUserId
  ) {
    throw new ApiError(
      403,
      "Only root members can delete this family"
    );
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Detach only direct child families.
    // Their own descendants remain attached to them.
    await Family.update(
      { ancestor: null },
      {
        where: { ancestor: family_id },
        transaction,
      }
    );

    // 2. Remove all memberships belonging to this family
    await Membership.destroy({
      where: { family_id },
      transaction,
    });

    // 3. Users who belonged to this family
    // no longer have a parent family.
    await User.update(
      { parent_family: null },
      {
        where: { parent_family: family_id },
        transaction,
      }
    );

    // 4. Delete the family record
    await family.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Family deleted successfully"
      )
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// ─── JOIN FAMILY VIA CODE (sends join request to root member) ─────────────────
const joinFamily = asyncHandler(async (req, res) => {
  const { invitation_code } = req.body;
  const user_id = Number(req.user.user_id);

  if (!invitation_code) throw new ApiError(400, "Invitation code is required");

  const family = await Family.findOne({ where: { invitation_code } });
  if (!family) throw new ApiError(404, "Invalid invitation code or family not found");

  const user = await User.findByPk(user_id);
  if (!user) throw new ApiError(404, "User not found");

  if (family.male_root_member === user.user_id || family.female_root_member === user.user_id) {
    throw new ApiError(400, "You are already a root member of this family");
  }

  if (user.parent_family !== null) {
    throw new ApiError(400, "You already belong to a family and cannot join another");
  }

  const existingMembership = await Membership.findOne({ where: { family_id: family.family_id, user_id } });
  if (existingMembership) throw new ApiError(400, "You are already a member of this family");

  // Check for existing pending join request
  const existingRequest = await Notification.findOne({
    type: "join_request",
    "joinRequest.requesterId": user_id,
    "joinRequest.targetId": String(family.family_id),
    "joinRequest.targetType": "family",
    "joinRequest.decision": "pending",
  });
  if (existingRequest) throw new ApiError(400, "A join request is already pending for this family");

  // Determine who to notify — prefer male root, fallback to female root, fallback to created_by
  const rootAdminId = Number(family.male_root_member) || Number(family.female_root_member) || Number(family.created_by);
  const requesterName = user.fullname || user.username;

  const notif = await Notification.create({
    userId: rootAdminId,
    type: "join_request",
    title: `Join Request — ${family.family_name}`,
    message: `${requesterName} wants to join your family "${family.family_name}" using the invitation code.`,
    status: "unread",
    joinRequest: {
      requesterId: user_id,
      requesterName,
      targetType: "family",
      targetId: String(family.family_id),
      targetName: family.family_name,
      decision: "pending",
    },
  });

  await pushAndBadge(notif);

  return res.status(200).json(new ApiResponse(200, notif, "Join request sent to the family admin. Please wait for approval."));
});

export {
  createFamily,
  getFamily,
  addMember,
  addRootMember,
  respondToFamilyInvitation,
  updateFamily,
  removeMember,
  deleteFamily,
  generateInvitationCode,
  leaveMember,
  joinFamily,
  getMyFamilies,
};
