import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (since we're uploading to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('proofImage');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'deposits', // Organize uploads in a folder
      public_id: `deposit-${uuidv4()}`, // Custom public ID
      resource_type: 'image',
      format: 'jpg', // Convert to jpg for consistency
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto' // Automatic format optimization
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

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

    let proofImageUrl = null;
    
    // Upload image to Cloudinary if file exists
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        proofImageUrl = uploadResult.secure_url; // Use secure HTTPS URL
        
        console.log('Image uploaded to Cloudinary:', {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: "Failed to upload image. Please try again." 
        });
      }
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount: parseFloat(amount),
        txHash: txHash || null,
        proofImage: proofImageUrl, // Store Cloudinary URL instead of local path
        status: "pending"
      }
    });

    res.json({
      message: "Deposit submitted for verification",
      depositId: deposit.id,
      status: deposit.status,
      proofImageUrl: proofImageUrl // Return the URL for confirmation
    });
  });
});

export default {
  getDepositInfo,
  submitDepositProof
};