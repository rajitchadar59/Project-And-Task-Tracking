const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const account = await User.findById(decoded.id).select('-password');
    if (!account) return res.status(401).json({ message: "Account not found" });

    req.user = account; 
    req.userId = account._id.toString();
    req.role = account.role; 

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden: Only ${requiredRole} can access this.` });
    }
    next();
  };
};

const authorizeOwner = (paramIdField = "id") => {
  return (req, res, next) => {
    const targetId = req.params[paramIdField];
    if (req.userId === targetId) return next();
    return res.status(403).json({ message: "Forbidden: You don't own this resource" });
  };
};

module.exports = { authMiddleware, authorizeRole, authorizeOwner };