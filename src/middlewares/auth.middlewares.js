import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/index.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

export default verifyToken;


export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const firebaseToken = authHeader.split("Bearer ")[1];

    const decodedToken = await auth.verifyIdToken(firebaseToken);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(403).json({
        message: "Không có quyền truy cập",
      });
    }

    const hasPermission = req.user.roles.some(role =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện hành động này",
      });
    }

    next();
  };
};
