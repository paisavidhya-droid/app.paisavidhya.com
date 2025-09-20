// authMiddleware.js
const jwt = require("jsonwebtoken");




const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization; // case-insensitive by Node
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  try {
    const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET_KEY);
 // Accept common id fields and normalize to req.user.id
    const id = decoded.sub || decoded.id || decoded.userId || decoded._id;
    if (!id) return res.status(401).json({ message: "Invalid token payload" });


    req.auth = decoded; // { sub, role, email, iat, exp, ... }

  req.user = {
      id: String(id),
      role: decoded.role,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    const message = err.name === "TokenExpiredError"
      ? "Token expired"
      : "Invalid or malformed token";
    return res.status(401).json({ message });
  }
};

module.exports = authMiddleware;

