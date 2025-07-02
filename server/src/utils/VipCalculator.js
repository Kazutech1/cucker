import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function calculateEligibleVipLevel(balance) {
  const vipLevels = await prisma.vipLevel.findMany({
    orderBy: { level: 'desc' }
  });

  for (const level of vipLevels) {
    if (balance >= level.minBalance) {
      return level.level;
    }
  }
  return 0;
}

export async function checkVipUpgradeEligibility(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) return { available: false };

    const currentLevel = user.profile?.vipLevel || 0;
    const eligibleLevel = await calculateEligibleVipLevel(user.balance);

    if (eligibleLevel > currentLevel) {
      return {
        available: true,
        message: `🎉 VIP Upgrade Available! You qualify for Level ${eligibleLevel}`,
        currentLevel,
        eligibleLevel,
        toastConfig: {  // Optional: Add styling hints for frontend
          type: "success",
          duration: 5000,
          position: "top-right"
        }
      };
    }

    return { available: false, currentLevel };
  } catch (error) {
    console.error("VIP check error:", error);
    return { error: "Failed to check VIP eligibility" };
  }
}