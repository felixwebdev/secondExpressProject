import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
const JWT_SECRET = process.env.JWT_SECRET;

const getJWTToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const headerToken = req.headers["authorization"]?.split(" ")[1];
    const token = cookieToken || headerToken;
    if (!token) {
      return ApiResponse.badRequest(res, "No token provided");
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      return ApiResponse.error(res, "Invalid token", 401);
    }   
    } catch (error) {
        return res.sendStatus(403); // Forbidden
    }
};

export default getJWTToken;