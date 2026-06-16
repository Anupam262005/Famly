import { User, Family, Membership } from "../models/index.js";
import { Story } from "../models/story.models.js"; // MongoDB
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { Op } from "sequelize";
import { PendingSignup } from "../models/pendingSignup.models.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google login controller

const loginWithGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, "ID token is required");

  // Verify Google ID token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email } = ticket.getPayload();

  // Check if user already exists in your DB
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // If user not found, do NOT register automatically
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "You need to sign in first"));
  }

  // User exists → generate JWT tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  await user.update({ refreshToken });

  return res.json(
    new ApiResponse(
      200,
      { user, accessToken, refreshToken },
      "Google login successful",
    ),
  );
});

const sendSignupOTP = asyncHandler(async (req, res) => {
  const { fullname, username, dob, gender, email, phone_no, password } =
    req.body;

  if (
    !fullname ||
    !username ||
    !dob ||
    !gender ||
    !email ||
    !phone_no ||
    !password
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check existing registered users
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }, { phone_no }],
    },
  });

  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists with this email/username/phone",
    );
  }

  // Upload profile photo now itself
  let profilePhotoUrl =
    "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg";

  if (req.file?.path) {
    const uploadRes = await uploadOnCloudinary(req.file.path, "image");

    if (!uploadRes?.secure_url) {
      throw new ApiError(500, "Failed to upload profile image");
    }

    profilePhotoUrl = uploadRes.secure_url;
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Remove old pending signup if any
  const oldPending = await PendingSignup.findOne({
    where: { email },
  });

  if (
    oldPending &&
    oldPending.signupData?.profilePhoto &&
    oldPending.signupData.profilePhoto !==
      "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg"
  ) {
    try {
    await deleteImageOnCloudinary(
      oldPending.signupData.profilePhoto
    );
  } catch (err) {}
  }

  await PendingSignup.destroy({
    where: { email },
  });

  // Store signup data temporarily
  await PendingSignup.create({
    email,
    otp,
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    signupData: {
      fullname,
      username,
      dob,
      gender,
      email,
      phone_no,
      password,
      profilePhoto: profilePhotoUrl,
    },
  });

  // Send OTP
  await sendOTPEmail(email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "OTP sent successfully"));
});

const verifySignupOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const pendingSignup = await PendingSignup.findOne({
    where: { email },
  });

  if (!pendingSignup) {
    throw new ApiError(404, "No pending signup found");
  }

  if (pendingSignup.expiresAt < new Date()) {
    if (
      pendingSignup.signupData?.profilePhoto &&
      pendingSignup.signupData.profilePhoto !==
        "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg"
    ) {
      try {
    await deleteImageOnCloudinary(
      pendingSignup.signupData.profilePhoto
    );
  } catch (err) {}
    }

    await pendingSignup.destroy();
    throw new ApiError(400, "OTP expired. Please try again.");
  }

  if (pendingSignup.otp !== otp) {
    await pendingSignup.increment("attempts");
    await pendingSignup.reload();

    if (pendingSignup.attempts >= 5) {
      // Clean uploaded image
      if (
        pendingSignup.signupData?.profilePhoto &&
        pendingSignup.signupData.profilePhoto !==
          "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg"
      ) {
        try {
    await deleteImageOnCloudinary(
      pendingSignup.signupData.profilePhoto
    );
  } catch (err) {}
      }

      await pendingSignup.destroy();

      throw new ApiError(
        400,
        "Too many incorrect OTP attempts. Please sign up again.",
      );
    }

    throw new ApiError(
      400,
      `Invalid OTP. ${5 - pendingSignup.attempts} attempt(s) remaining.`,
    );
  }

  const data = pendingSignup.signupData;

  // Double check no one registered meanwhile
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email: data.email },
        { username: data.username },
        { phone_no: data.phone_no },
      ],
    },
  });

  if (existingUser) {
    if (
      pendingSignup.signupData?.profilePhoto &&
      pendingSignup.signupData.profilePhoto !==
        "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg"
    ) {
      try {
    await deleteImageOnCloudinary(
      pendingSignup.signupData.profilePhoto
    );
  } catch (err) {}
    }

    await pendingSignup.destroy();

    throw new ApiError(
      400,
      "User already exists with this email/username/phone",
    );
  }

  // Create actual user
  const user = await User.create({
    fullname: data.fullname,
    username: data.username,
    dob: data.dob,
    gender: data.gender,
    email: data.email,
    phone_no: data.phone_no,
    passwordHash: data.password,
    profilePhoto: data.profilePhoto,
    refreshToken: "",
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await user.update({
    refreshToken,
  });

  // Remove temporary record
  await pendingSignup.destroy();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user,
        accessToken,
        refreshToken,
      },
      "User registered successfully",
    ),
  );
});

const resendSignupOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const pendingSignup = await PendingSignup.findOne({
    where: { email },
  });

  if (!pendingSignup) {
    throw new ApiError(
      404,
      "No pending signup found. Please fill the signup form again.",
    );
  }

  // Generate new OTP
  const newOTP = Math.floor(100000 + Math.random() * 900000).toString();

  // Update OTP, expiry and reset attempts
  await pendingSignup.update({
    otp: newOTP,
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });

  // Send email
  await sendOTPEmail(email, newOTP);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP resent successfully"));
});

// ========== REGISTER USER ==========
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, dob, gender, email, phone_no, password } =
    req.body;
  // take gender in lowercase;
  if (
    !fullname ||
    !username ||
    !dob ||
    !gender ||
    !email ||
    !phone_no ||
    !password
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check uniqueness
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }, { phone_no }],
    },
  });
  // const existingUser = await User.findOne({
  // where: Sequelize.or(
  //     { email },
  //     { username },
  //     { phone_no }
  // )
  // });

  if (existingUser)
    throw new ApiError(
      400,
      "User already exists with this email/username/phone",
    );

  // Profile photo upload
  let profilePhotoUrl =
    "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg";
  //ek defalult image cloudinary par store karakar uska url yaha de denge
  console.log(req.file?.path);
  if (req.file?.path) {
    const uploadRes = await uploadOnCloudinary(req.file.path, "image");
    profilePhotoUrl = uploadRes.secure_url;
  }
  console.log(profilePhotoUrl);

  const user = await User.create({
    fullname,
    username,
    dob,
    gender,
    email,
    phone_no,
    passwordHash: password,
    profilePhoto: profilePhotoUrl,
    refreshToken: "",
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  await user.update({ refreshToken });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user, accessToken, refreshToken },
        "User registered successfully",
      ),
    );
});

// ========== LOGIN USER ==========

// make sure  frontend sends "identifier" (username/email/phone) instead of loginID ...
const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { identifier, password } = req.body; // identifier = username/email/phone

  if (!identifier || !password)
    throw new ApiError(400, "All fields are required");

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { username: identifier },
        { phone_no: identifier },
      ],
    },
  });

  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  await user.update({ refreshToken });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "Login successful",
      ),
    );
});

// ========== LOGOUT ==========
const logout = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.user_id);
  if (!user) throw new ApiError(404, "User not found");

  user.refreshToken = "";
  await user.save();

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// ========== REFRESH TOKEN ==========
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findByPk(decoded.user_id);

    if (!user) throw new ApiError(401, "Invalid token");
    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError(403, "Refresh token expired or used");

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (err) {
    throw new ApiError(401, err.message || "Invalid refresh token");
  }
});

// ========== CURRENT USER ==========
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.json(new ApiResponse(200, req.user, "Current user fetched"));
});

// ========== CHANGE PASSWORD ==========
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError(400, "Both passwords required");

  const isValid = await req.user.isPasswordCorrect(oldPassword);

  console.log(isValid);
  if (!isValid) throw new ApiError(401, "Old password incorrect");

  console.log(newPassword);
  req.user.passwordHash = newPassword;

  await req.user.save();

  return res.json(new ApiResponse(200, {}, "Password updated successfully"));
});

// ========== UPDATE PROFILE PHOTO ==========
const updateUserProfileImage = asyncHandler(async (req, res) => {
  if (!req.file?.path) throw new ApiError(400, "Profile image required");

  if (req.user.profilePhoto) {
    await deleteImageOnCloudinary(req.user.profilePhoto);
  }
  const uploadRes = await uploadOnCloudinary(req.file.path, "image");
  await req.user.update({ profilePhoto: uploadRes.secure_url });

  return res.json(new ApiResponse(200, req.user, "Profile photo updated"));
});

// ========== GET USER PROFILE ==========
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["passwordHash", "refreshToken"] },
  });
  if (!user) throw new ApiError(404, "User not found");

  const families = await user.getFamilies();
  return res.json(
    new ApiResponse(200, { user, families }, "User profile fetched"),
  );
});

// ========== UPDATE ACCOUNT DETAILS ==========
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, username, gender, dob } = req.body;

  // Only pick fields that are not undefined
  const updates = {};
  if (fullname !== undefined) updates.fullname = fullname;
  if (username !== undefined) updates.username = username;
  if (gender !== undefined) updates.gender = gender;
  if (dob !== undefined) updates.dob = dob;

  await req.user.update(updates);

  // remove sensitive fields (like password)
  const userData = req.user.toJSON();
  delete userData.password;

  return res.json(new ApiResponse(200, userData, "Account details updated"));
});

// user timeline content.controller.js me hai

const getUserFamilies = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  // Fetch memberships for the user
  const memberships = await Membership.findAll({
    where: { user_id: userId },
    attributes: ["family_id", "role"],
  });

  if (!memberships || memberships.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "User is not a member of any family"));
  }

  // Format response
  const result = memberships.map((m) => ({
    family_id: m.family_id,
    role: m.role,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, result, "User families fetched successfully"));
});

export {
  sendSignupOTP,
  verifySignupOTP,
  resendSignupOTP,
  registerUser,
  loginUser,
  logout,
  loginWithGoogle,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  updateUserProfileImage,
  getUserProfile,
  changeCurrentPassword,
  getUserFamilies,
};
