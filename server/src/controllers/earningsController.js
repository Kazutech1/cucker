// earningsController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VIP_LEVELS = [
  { level: 0, minBalance: 0, roi: 0 },
  { level: 1, minBalance: 50, roi: 0.5 },    // 0.5% daily
  { level: 2, minBalance: 1000, roi: 0.6 },  // 0.6% daily
  { level: 3, minBalance: 4000, roi: 0.9 },  // 0.9% daily
  { level: 4, minBalance: 10000, roi: 1.2 }  // 1.2% daily
];

export const calculateDailyProfit = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get user with current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check 24-hour cooldown
    if (user.lastProfitCalc) {
      const lastCalcTime = new Date(user.lastProfitCalc).getTime();
      const currentTime = now.getTime();
      const timeDiff = currentTime - lastCalcTime;
      
      if (timeDiff < 24 * 60 * 60 * 1000) {
        const nextAvailableTime = lastCalcTime + 24 * 60 * 60 * 1000;
        const hoursLeft = Math.ceil((nextAvailableTime - currentTime) / (60 * 60 * 1000));
        
        return res.status(400).json({
          success: false,
          message: `Please wait 24 hours between profit claims. ${hoursLeft} hours remaining.`,
          nextAvailable: new Date(nextAvailableTime),
          hoursRemaining: hoursLeft,
          lastClaimed: user.lastProfitCalc
        });
      }
    }

    // Determine VIP level based on current balance (highest level where balance >= minBalance)
    let vipLevel = 0;
    for (let i = VIP_LEVELS.length - 1; i >= 0; i--) {
      if (user.balance >= VIP_LEVELS[i].minBalance) {
        vipLevel = VIP_LEVELS[i].level;
        break;
      }
    }

    // Get the ROI for the determined VIP level
    const currentVip = VIP_LEVELS.find(level => level.level === vipLevel);
    if (!currentVip) {
      return res.status(500).json({ message: "Invalid VIP level configuration" });
    }

    // Calculate daily profit (ROI is percentage, so divide by 100)
    const dailyProfit = user.balance * (currentVip.roi / 100);

    // Update user records
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profitBalance: { increment: dailyProfit },
        lastProfitCalc: now,
        profile: {
          update: {
            vipLevel: vipLevel
          }
        }
      },
      include: { profile: true }
    });

    // Record the earnings history
    await prisma.earningsHistory.create({
      data: {
        userId: userId,
        amount: dailyProfit,
        date: now
      }
    });

    res.json({
      success: true,
      message: "Daily profit calculated successfully",
      vipLevel: vipLevel,
      dailyProfit: dailyProfit,
      newProfitBalance: updatedUser.profitBalance,
      nextAvailable: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });

  } catch (error) {
    console.error("Profit calculation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to calculate profit",
      error: error.message 
    });
  }
};

// Add a new function to get earnings info without calculating
export const getDailyEarningsInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine VIP level based on current balance
    let vipLevel = 0;
    for (let i = VIP_LEVELS.length - 1; i >= 0; i--) {
      if (user.balance >= VIP_LEVELS[i].minBalance) {
        vipLevel = VIP_LEVELS[i].level;
        break;
      }
    }

    const currentVip = VIP_LEVELS.find(level => level.level === vipLevel);
    const potentialDailyProfit = user.balance * (currentVip.roi / 100);

    // Check if user can claim profit
    let canClaim = true;
    let nextAvailable = null;

    if (user.lastProfitCalc) {
      const lastCalcTime = new Date(user.lastProfitCalc).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastCalcTime;
      
      if (timeDiff < 24 * 60 * 60 * 1000) {
        canClaim = false;
        nextAvailable = new Date(lastCalcTime + 24 * 60 * 60 * 1000);
      }
    }

    res.json({
      success: true,
      vipLevel: vipLevel,
      currentBalance: user.balance,
      profitBalance: user.profitBalance,
      potentialDailyProfit: potentialDailyProfit,
      canClaim: canClaim,
      nextAvailable: nextAvailable,
      lastProfitCalc: user.lastProfitCalc
    });

  } catch (error) {
    console.error("Get earnings info error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get earnings info",
      error: error.message 
    });
  }
};



