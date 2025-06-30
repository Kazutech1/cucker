import express from "express";
import { 
  getAllVipLevels, 
  getUserVipLevel 
} from "../controllers/vipController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

// Public route
router.get("/levels", getAllVipLevels);

// Protected routes
router.get("/my-level", authenticateUser, getUserVipLevel);

export default router;