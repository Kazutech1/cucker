export const adminAuth = (req, res, next) => {
  try {
    // 1. Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // 2. Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Admin privileges required",
        error: `Your role: ${req.user.role}`,
        required: "admin"
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    res.status(500).json({ message: "Authorization check failed" });
  }
};