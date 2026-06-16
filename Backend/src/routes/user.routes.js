// routes/user.route.js
import express from "express";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserProfileImage,
  getUserProfile,
  loginWithGoogle,
  logout,
  getUserFamilies,
  sendSignupOTP,
  verifySignupOTP,
  resendSignupOTP,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/send-signup-otp",
  upload.single("profilePhoto"),
  sendSignupOTP
);

router.post(
  "/verify-signup-otp",
  verifySignupOTP
);

router.post(
  "/resend-signup-otp",
  resendSignupOTP
);

// Register user
router.post("/register", upload.single("profilePhoto"), registerUser);

// Login user (email/username/phone + password)
router.post("/login", loginUser);

// Google login
router.post("/login/google", loginWithGoogle);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// Logout
router.post("/logout", verifyJWT, logout);

// ========== USER PROFILE / ACCOUNT ==========

// Get current logged-in user
router.get("/me", verifyJWT, getCurrentUser);

// Change password
router.post("/change-password", verifyJWT, changeCurrentPassword);

// Update account details
router.put("/update", verifyJWT, updateAccountDetails);

// Update profile image
router.put(
  "/update/profile-photo",
  verifyJWT,
  upload.single("profilePhoto"),
  updateUserProfileImage
);

// Get another user’s profile by ID
router.get("/:userId/profile", getUserProfile);

router.get("/get-families", verifyJWT, getUserFamilies);

export default router;  