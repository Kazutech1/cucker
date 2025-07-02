import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import vipRoutes from "./routes/vip.js";
import earningsRouter from "./routes/earnings.js";
import investmentsRouter from "./routes/investments.js";
import withdrawalRouter from "./routes/withdrawal.js";
import depositRouter from "./routes/deposit.js";
import adminRouter from './admin/adminRoutes.js';
import transactionRoutes from './routes/transaction.js'; // New transaction routes


// Initialize app
dotenv.config();
const app = express();

// Configure paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: "*", // Accept requests from any domain
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - FIXED PATH
// FIXED PATH TO MATCH WHERE FILES ARE SAVED
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));
// Ensure uploads directory exists
import fs from "fs";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vip", vipRoutes);
app.use("/api/earnings", earningsRouter);
app.use("/api/investments", investmentsRouter);
app.use("/api/withdrawal", withdrawalRouter);
app.use("/api/deposit", depositRouter);
app.use('/api/admin', adminRouter);
app.use('/api/transactions', transactionRoutes); // Add transaction routes



// Health check
app.get("/", (req, res) => {
  res.send("✅ API is working!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
