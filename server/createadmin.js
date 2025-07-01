// scripts/resetAdmin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  await prisma.user.upsert({
<<<<<<< HEAD
    where: { email: "admin3@example.com" },
=======
    where: { email: "admin2@example.com" },
>>>>>>> ed5030b7be3f95686677bc913ebf92d016146104
    update: { 
      password: await bcrypt.hash("Admin123!", 10),
      role: 'admin'
    },
    create: {
<<<<<<< HEAD
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
=======
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
>>>>>>> ed5030b7be3f95686677bc913ebf92d016146104
    }
  });
  console.log("Admin account ready");
}

resetAdmin()
  .catch(e => console.error(e))
<<<<<<< HEAD
  .finally(() => prisma.$disconnect());

=======
  .finally(() => prisma.$disconnect());
>>>>>>> ed5030b7be3f95686677bc913ebf92d016146104
