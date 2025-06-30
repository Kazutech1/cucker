import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all VIP levels
export const getAllVipLevels = async (req, res) => {
  try {
    const vipLevels = await prisma.vipLevel.findMany({
      orderBy: { level: 'asc' }
    });
    res.json(vipLevels);
  } catch (error) {
    console.error("Get VIP levels error:", error);
    res.status(500).json({ message: "Failed to fetch VIP levels" });
  }
};

// Get user's current VIP level
export const getUserVipLevel = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { 
        vipLevelData: true  // Include the related VIP level data
      }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Return only the current VIP level data
    res.json(profile.vipLevelData);
    
  } catch (error) {
    console.error("Get user VIP error:", error);
    res.status(500).json({ message: "Failed to fetch VIP data" });
  }
};