import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { calculateVipLevel, updateUserVipLevel } from "../utils/VipCalculator.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Generate random referral code
const generateReferralCode = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// Phone number validation function
const validatePhoneNumber = (phoneNumber) => {
  // Basic phone number validation (adjust regex as needed)
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 10;
};

// Register Controller
// Register Controller
export const register = async (req, res) => {
  const { email, fullName, username, phoneNumber, password, referredBy } = req.body;

  try {
    // Validate required fields
    if (!email || !fullName || !username || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email }, 
          { username },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      let conflictField = "field";
      if (existingUser.email === email) conflictField = "Email";
      else if (existingUser.username === username) conflictField = "Username";
      else if (existingUser.phoneNumber === phoneNumber) conflictField = "Phone number";
      
      return res.status(400).json({ message: `${conflictField} already exists` });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Ensure default VIP level exists
      await tx.vipLevel.upsert({
        where: { level: 0 },
        update: {},
        create: {
          level: 0,
          name: "Default",
          profitPerOrder: 0,
          appsPerSet: 0,
          minBalance: 0
        }
      });

      const newUser = await tx.user.create({
        data: {
          email,
          fullName,
          username,
          phoneNumber,
          password: hashedPassword,
          referralCode,
          referredBy: referredBy || null
        }
      });

      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          vipLevel: 0
        }
      });

      return { user: newUser, profile: newProfile };
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        referralCode: result.user.referralCode,
        vipLevel: result.profile.vipLevel
      }
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Login Controller (can login with email, username, or phone number)
export const login = async (req, res) => {
  const { login, password } = req.body;

  try {
    if (!login || !password) {
      return res.status(400).json({ message: "Login and password are required" });
    }

    const user = await prisma.user.findFirst({ 
      where: {
        OR: [
          { email: login },
          { username: login },
          { phoneNumber: login }
        ]
      },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Updated token generation to include role
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role || 'user' // Include role, default to 'user'
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        balance: user.balance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        vipLevel: user.profile?.vipLevel || 0,
        role: user.role || 'user' // Send role to frontend
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getProfile = async (req, res) => {
  try {
    // First update the VIP level based on current balance
    await updateUserVipLevel(req.user.id);

    const userWithProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { 
        profile: {
          include: { 
            vipLevelData: true
          }
        } 
      }
    });

    if (!userWithProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      user: {
        username: userWithProfile.username,
        email: userWithProfile.email,
        phoneNumber: userWithProfile.phoneNumber,
        balance: userWithProfile.balance,
        referralCode: userWithProfile.referralCode,
        referredBy: userWithProfile.referredBy,
        vipLevel: userWithProfile.profile.vipLevelData,
        totalInvested: userWithProfile.profile.totalInvested
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  try {
    const updateData = {};
    
    if (fullName) updateData.fullName = fullName;
    
    if (phoneNumber) {
      // Validate phone number if provided
      if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
      
      // Check if phone number is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber: phoneNumber,
          id: { not: req.user.id }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      
      updateData.phoneNumber = phoneNumber;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// User: Get all broadcast notifications
export const getNotifications = async (req, res) => {
  try {
    const { isRead, limit, type } = req.query
    
    const notifications = await prisma.notification.findMany({
      where: {
        isRead: isRead ? isRead === 'true' : undefined,
        type: type || undefined
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })

    res.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
