import {User} from "../models/User.js";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
const JWT_SECRET = process.env.JWT_SECRET;

const verifyRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const cookieToken = req.cookies?.token;
      const headerToken = req.headers["authorization"]?.split(" ")[1];
      const token = cookieToken || headerToken;
      if (!token) {
        return ApiResponse.badRequest(res, "No token provided");
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
          return ApiResponse.badRequest(res, "User not found");
        }
        // Check if user's role is in the allowedRoles
        if (!allowedRoles.includes(user.role)) {
          return ApiResponse.unauthorized(res, "You do not have permission to access this resource");
        }
        next();
      } catch (error) {
        return ApiResponse.error(res, "Invalid token", 401);
      }
    } catch (error) {
      return ApiResponse.error(res, "Server error", 500);
    }
  };
};

export default verifyRoles;
