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

export async function notifyUserIfVipUpgradeAvailable(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) return { available: false };

    const currentLevel = user.profile?.vipLevel || 0;
    const eligibleLevel = await calculateEligibleVipLevel(user.balance);

    if (eligibleLevel > currentLevel) {
      // Create upgrade notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "VIP Upgrade Available",
          message: `You qualify for VIP Level ${eligibleLevel}! ` +
                   "Contact support to complete your upgrade.",
          type: 'VIP_UPGRADE_OFFER',
          metadata: {
            eligibleLevel,
            currentLevel
          }
        }
      });

      return {
        available: true,
        currentLevel,
        eligibleLevel
      };
    }

    return { available: false, currentLevel };
  } catch (error) {
    console.error("VIP notification error:", error);
    throw error;
  }
}