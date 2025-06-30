// utils/VipCalculator.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function calculateVipLevel(balance) {
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

export async function updateUserVipLevel(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newVipLevel = await calculateVipLevel(user.balance);

    if (user.profile && user.profile.vipLevel !== newVipLevel) {
      await prisma.profile.update({
        where: { userId },
        data: { vipLevel: newVipLevel }
      });
    }
  } catch (error) {
    console.error("Error updating VIP level:", error);
    throw error;
  }
}