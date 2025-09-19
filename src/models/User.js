import mongoose from "mongoose";
import ROLE_LISTS from "../config/role_lists.js";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: {type: String, required: true},
  password: { type: String, required: true },
  role: {type: String, enum: ['user', 'admin'], default: ROLE_LISTS.USER}
}, { timestamps: true,});

export const User = mongoose.model("User", userSchema);