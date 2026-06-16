import express from "express";
import {
  createFamily,
  getFamily,
  addMember,
  addRootMember,
  respondToFamilyInvitation,
  updateFamily,
  removeMember,
  deleteFamily,
  leaveMember,
  joinFamily,
  getMyFamilies,
} from "../controllers/family.controller.js";

import { getFamilyAncestorsAndDescendants, getFamilyAncestorsAndDescendantsById } from '../controllers/FamilyTree.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ── Family CRUD ───────────────────────────────────────────────────────────────
router.post("/create-family", verifyJWT, upload.single("familyPhoto"), createFamily);
router.get("/my-families", verifyJWT, getMyFamilies);
router.get("/:familyId", verifyJWT, getFamily);
router.put("/update/:family_id", verifyJWT, upload.single("familyPhoto"), updateFamily);
router.delete("/delete-family/:family_id", verifyJWT, deleteFamily);

// ── Member management (sends notification invitations now) ────────────────────
router.post("/add-member/:family_id", verifyJWT, addMember);
router.post("/add-root-member", verifyJWT, addRootMember);
router.delete("/remove-member/:family_id", verifyJWT, removeMember);
router.post("/leave-family/:family_id", verifyJWT, leaveMember);

// ── Respond to family invitation (invited user accepts/rejects) ───────────────
router.patch("/invitation/:notifId/respond", verifyJWT, respondToFamilyInvitation);

// ── Join via invitation code (sends join request to admin) ────────────────────
router.post("/join-family", verifyJWT, joinFamily);

// ── Family tree ───────────────────────────────────────────────────────────────
router.get("/tree", verifyJWT, getFamilyAncestorsAndDescendants);
router.get("/tree/:user_id", getFamilyAncestorsAndDescendantsById);

export default router;
