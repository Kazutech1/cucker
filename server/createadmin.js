// scripts/resetAdmin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  await prisma.user.upsert({
    where: { email: "admin2@example.com" },
    update: { 
      password: await bcrypt.hash("Admin123!", 10),
      role: 'admin'
    },
    create: {
      email: "admin2@example.com",
      password: await bcrypt.hash("Admin123!", 10),
      username: "admins",
      fullName: "Admin User",
      phoneNumber: "+1234567890",
      referralCode: "ADMIN124",
      role: "admin",
      // profile: {
      //   create: {
      //     vipLevel: 0
      //   }
      // }
    }
  });
  console.log("Admin account ready");
}

resetAdmin()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());