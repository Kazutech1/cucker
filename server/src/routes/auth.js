import express from "express";
import { register, login, getProfile, updateProfile,  getNotifications, getUserReferralInfo, getReferredUsers } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/auth.js";


const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/messages", getNotifications);

// Protected routes
router.get("/profile", authenticateUser, getProfile);
router.patch("/profile", authenticateUser, updateProfile);
router.get('/my-referrals', authenticateUser, getUserReferralInfo);
router.get('/referred-users', authenticateUser, getReferredUsers);

export default router; 