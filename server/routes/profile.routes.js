import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profile.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getProfile);
router.put("/", protectRoute, updateProfile);
router.put("/password", protectRoute, changePassword);

export default router;
