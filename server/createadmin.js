// scripts/resetAdmin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  await prisma.user.upsert({
    where: { email: "admin3@example.com" },
    update: { 
      password: await bcrypt.hash("Admin123!", 10),
      role: 'admin'
    },
    create: {
      email: "admin3@example.com",
      password: await bcrypt.hash("Admin123!", 10),
      username: "admin3",
      fullName: "Admin User",
      phoneNumber: "+12345678908",
      referralCode: "ADMIN1245",
      role: "admin",
      profile: {
        create: {
          vipLevel: 4
        }
      }
    }
  });
  console.log("Admin account ready");
}

resetAdmin()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

