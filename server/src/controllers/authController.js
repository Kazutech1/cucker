import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { checkVipUpgradeEligibility } from "../utils/VipCalculator.js";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for profile pictures
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for profile pictures
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('profilePicture');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'profile-pictures',
      public_id: `profile-${uuidv4()}`,
      resource_type: 'image',
      format: 'jpg',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focusing on face
        { quality: 'auto' }
      ]
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

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
export const register = async (req, res) => {
  const { email, fullName, username, phoneNumber, password, withdrawalPassword, referredBy } = req.body;

  try {
    // Validate required fields (fullName is now optional, referredBy is now required)
    if (!email || !username || !phoneNumber || !password || !withdrawalPassword || !referredBy) {
      return res.status(400).json({ 
        message: "Email, username, phone number, password, withdrawal password, and referral code are required" 
      });
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Check if referral code exists in the system
    const referringUser = await prisma.user.findFirst({
      where: {
        referralCode: referredBy
      }
    });

    if (!referringUser) {
      return res.status(400).json({ message: "Invalid referral code" });
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

    // Hash main password (but not withdrawal password)
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
          fullName: fullName || null, // Make fullName optional
          username,
          phoneNumber,
          password: hashedPassword,
          withdrawalPassword, // Stored as plain text (not hashed)
          referralCode,
          referredBy
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
        vipLevel: result.profile.vipLevel,
        profilePicture: result.user.profilePicture
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

    // Update last login time
await prisma.user.update({
  where: { id: user.id },
  data: { lastLogin: new Date() }
});

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
        role: user.role || 'user',
        profilePicture: user.profilePicture // Include profile picture
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
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

    // Check VIP eligibility (returns message instead of creating notification)
    const vipCheck = await checkVipUpgradeEligibility(req.user.id);

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
        totalInvested: userWithProfile.profile.totalInvested,
        profilePicture: userWithProfile.profilePicture // Include profile picture
      },
      toast: vipCheck.available ? {
        message: vipCheck.message,
        ...vipCheck.toastConfig
      } : null
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove the separate uploadProfilePicture function since it's now integrated into updateProfile

// Update Profile Controller with Profile Picture Upload
export const updateProfile = async (req, res) => {
  // Use multer to handle both form data and file upload
  upload(req, res, async (err) => {
    if (err && !(err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE')) {
      return res.status(400).json({ 
        message: err instanceof multer.MulterError 
          ? err.message 
          : 'File upload failed'
      });
    }

    try {
      const { fullName, phoneNumber } = req.body;
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

      // Handle profile picture update if file is provided
      if (req.file) {
        // Get current user to check if they have an existing profile picture
        const currentUser = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { profilePicture: true }
        });

        // Upload new image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        updateData.profilePicture = uploadResult.secure_url;

        // Delete old profile picture from Cloudinary if it exists
        if (currentUser.profilePicture) {
          try {
            // Extract public_id from the old URL
            const urlParts = currentUser.profilePicture.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = `profile-pictures/${publicIdWithExtension.split('.')[0]}`;
            
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.log('Could not delete old profile picture:', deleteError.message);
            // Continue even if deletion fails
          }
        }
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
          phoneNumber: updatedUser.phoneNumber,
          profilePicture: updatedUser.profilePicture
        }
      });

    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
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




// controllers/referralController.js

// Get user's referral information
export const getUserReferralInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's referral code and basic stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referredBy: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count total referrals
    const totalReferrals = await prisma.user.count({
      where: { referredBy: user.referralCode }
    });

    // Count active referrals (users who have deposited or completed tasks)
    const activeReferrals = await prisma.user.count({
      where: { 
        referredBy: user.referralCode,
        OR: [
          { deposits: { some: { status: "verified" } } },
          { userTasks: { some: { status: "completed" } } }
        ]
      }
    });

    // Calculate total earned from referrals
    const referralBonuses = await prisma.earningsHistory.aggregate({
      where: { 
        userId,
        type: "referral"
      },
      _sum: {
        amount: true
      }
    });

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        totalReferrals,
        activeReferrals,
        totalEarned: referralBonuses._sum.amount || 0,
        // referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`
      }
    });

  } catch (error) {
    console.error("Get referral info error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Get list of users referred by the current user
export const getReferredUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get user's referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get referred users with some basic info
    const referredUsers = await prisma.user.findMany({
      where: { referredBy: user.referralCode },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        balance: true,
        createdAt: true,
        deposits: {
          where: { status: "verified" },
          select: { amount: true },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        userTasks: {
          where: { status: "completed" },
          select: { profitAmount: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit)
    });

    // Count total referred users for pagination
    const total = await prisma.user.count({
      where: { referredBy: user.referralCode }
    });

    res.json({
      success: true,
      data: referredUsers.map(user => ({
        ...user,
        lastDeposit: user.deposits[0]?.amount || 0,
        lastTaskProfit: user.userTasks[0]?.profitAmount || 0
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get referred users error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};