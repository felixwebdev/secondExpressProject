import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import dotenv from "dotenv";
import getJWTToken from "../middleware/getJWTToken.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

class UserController {
    index(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        User.find().skip(skip).limit(limit).select('-password').then(users => {
            User.countDocuments().then(count => {
                return ApiResponse.success(res, {
                    users,
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                });
            });
        }).catch(err => {
            return ApiResponse.error(res, 'Server error', 500);
        });
    }

    async register(req, res) {
        const {username, email, name, password} = req.body;
        
        if (!username || !email || !name || !password) {
            return ApiResponse.badRequest(res, 'All fields are required');
        }

        try {
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return ApiResponse.badRequest(res, 'Username or email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({username, email, name, password: hashedPassword});
            await newUser.save();
            return ApiResponse.success(res, { id: newUser._id, username: newUser.username, email: newUser.email, name: newUser.name }, 'User registered successfully', 201);
        }   
        catch (error) {
            return ApiResponse.error(res, 'Server error', 500);
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return ApiResponse.badRequest(res, 'Username and password are required');
        }
        try {
            const user = await User.findOne({$or: [{username }, {email: username }] });
            if (!user) {
                return ApiResponse.badRequest("User not found");
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return ApiResponse.badRequest(res, 'Invalid credentials');
            }
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        
            // Set token in HttpOnly cookie
            res.cookie('token', token, { 
                httpOnly: true,
                sameSite: "none",       // cho phép cross-site cookie 
                secure: process.env.NODE_ENV === 'production' 
            });

            res.json({ token });

            return ApiResponse.success(res, { token } ,'Login successful' );
        }
        catch (error) {
            return ApiResponse.error(res, 'Server error', 500);
        }
    }

    async introspect(req, res, next) {
        const tokenData = await getJWTToken(req, res);
        if (!tokenData || !tokenData.id) {
            return ApiResponse.badRequest(res, 'Invalid token');
        }
        return ApiResponse.success(res, tokenData);
    }

    async logout(req, res) {
        res.clearCookie('token');
        return ApiResponse.success(res, null, 'Logged out successfully');
    }

    async myInfo(req, res) {
        const tokenData = await getJWTToken(req, res);
        if (!tokenData || !tokenData.id) {
            return ApiResponse.badRequest(res, 'Invalid token');
        }
        const user = await User.findById(tokenData.id).select('-password');
        if (!user) {
            return ApiResponse.badRequest(res, 'User not found');
        }
        return ApiResponse.success(res, {id: user._id,name: user.name,role: user.role});
    }

    async findUserById(req, res) {
        const { id } = req.params;
        const user = await User.findOne({_id: id}).select('-password');
        if (!user) {
            return ApiResponse.badRequest(res, 'User not found');
        }
        return ApiResponse.success(res, {
                id: user._id, 
                username: user.username,
                email: user.email, 
                name: user.name, 
                role: user.role
        }); 
    }

    deleteUser(req, res) {
        const { id } = req.params;
        User.findByIdAndDelete(id).then(() => {
            return ApiResponse.success(res, null, 'User deleted successfully');
        }).catch(err => {
            return ApiResponse.error(res, 'Server error', 500);
        });
    }

    async updateUser(req, res) {
        const { id } = req.params;
        const { name, password, role } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        User.findByIdAndUpdate(id, updateData, { new: true }).then(user => {
            if (!user) {
                return ApiResponse.badRequest(res, 'User not found');
            }
            return ApiResponse.success(res, { id: user._id, username: user.username, email: user.email, name: user.name, role: user.role }, 'User updated successfully');
        }).catch(err => {
            return ApiResponse.error(res, 'Server error', 500);
        });
    }
}

export default new UserController();