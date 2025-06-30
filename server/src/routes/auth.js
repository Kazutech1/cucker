import express from "express";
import { register, login, getProfile, updateProfile,  getNotifications } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/auth.js";


const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/messages", getNotifications);

// Protected routes
router.get("/profile", authenticateUser, getProfile);
router.patch("/profile", authenticateUser, updateProfile);

export default router; 