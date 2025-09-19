import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";


const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers["authorization"]?.split(" ")[1];
  const token = cookieToken || headerToken;

  console.log(token);

  if (!token) {
    return ApiResponse.badRequest(res, "No token provided");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return ApiResponse.error(res, "Invalid token", 401);
  }
};

export default verifyToken;
