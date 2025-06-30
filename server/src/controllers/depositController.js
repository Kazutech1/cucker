import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Configure file storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/deposits/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `deposit-${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('proofImage');

// Wrapper for async middleware
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get deposit info
export const getDepositInfo = asyncHandler(async (req, res) => {
  const wallets = await prisma.adminWallet.findMany({
    where: { isActive: true },
    select: {
      currency: true,
      address: true,
      network: true
    }
  });

  res.json({
    depositWallets: wallets,
    minDeposit: 10
  });
});

// Submit deposit proof
export const submitDepositProof = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err instanceof multer.MulterError 
          ? err.message 
          : 'File upload failed'
      });
    }

    const { amount, currency, txHash } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!amount || !currency || (!txHash && !req.file)) {
      return res.status(400).json({ 
        message: "Amount, currency, and either txHash or proof image are required" 
      });
    }

    // Verify wallet exists
    const wallet = await prisma.adminWallet.findFirst({
      where: { 
        currency,
        isActive: true 
      }
    });

    if (!wallet) {
      return res.status(400).json({ message: "Invalid currency selected" });
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount: parseFloat(amount),
        txHash: txHash || null,
        proofImage: req.file ? `/uploads/deposits/${req.file.filename}` : null,
        status: "pending"
      }
    });

    res.json({
      message: "Deposit submitted for verification",
      depositId: deposit.id,
      status: deposit.status
    });
  });
});

export default {
  getDepositInfo,
  submitDepositProof
};