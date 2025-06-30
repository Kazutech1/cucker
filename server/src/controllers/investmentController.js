import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createInvestment = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Verify user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create investment in transaction
    const [investment, updatedUser] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          userId,
          amount
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amount },
          profile: {
            update: {
              totalInvested: { increment: amount }
            }
          }
        },
        include: { profile: true }
      })
    ]);

    res.json({
      message: "Investment created successfully",
      investment,
      newBalance: updatedUser.balance,
      totalInvested: updatedUser.profile.totalInvested
    });

  } catch (error) {
    console.error("Create investment error:", error);
    res.status(500).json({ message: "Failed to create investment" });
  }
};