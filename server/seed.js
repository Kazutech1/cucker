import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const vipLevels = [
  { level: 0, name: "VIP 0", profitPerOrder: 0.0, appsPerSet: 0, minBalance: 0 },
  { level: 1, name: "VIP 1", profitPerOrder: 0.5, appsPerSet: 40, minBalance: 50 },
  { level: 2, name: "VIP 2", profitPerOrder: 0.6, appsPerSet: 45, minBalance: 1000 },
  { level: 3, name: "VIP 3", profitPerOrder: 0.9, appsPerSet: 50, minBalance: 4000 },
  { level: 4, name: "VIP 4", profitPerOrder: 1.2, appsPerSet: 60, minBalance: 10000 },
];

async function seedVipLevels() {
  try {
    await prisma.vipLevel.deleteMany(); // Clear existing records
    await prisma.vipLevel.createMany({ data: vipLevels });
    console.log("✅ VIP Levels seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding VIP levels:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedVipLevels();