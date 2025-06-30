// scripts/seedWallets.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedWallets() {
  await prisma.adminWallet.createMany({
    data: [
      {
        currency: 'BTC',
        address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
        network: 'Mainnet'
      },
      {
        currency: 'ETH',
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        network: 'ERC20'
      },
      {
        currency: 'USDT',
        address: 'TNPZqNpM8K7yZQd4itjv1eJZ1kFSYWx5vW',
        network: 'TRC20'
      }
    ]
  });
  console.log("Admin wallets seeded!");
}

seedWallets()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());