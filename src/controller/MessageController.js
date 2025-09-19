import { Message } from "../models/Message.js";  
import mongoose from "mongoose";

class messageController {
  sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;
    console.log(recipient, content);
    const sender = req.user.id; 
    console.log(sender);

    if (!recipient || !content) {
      return res.status(400).json({ message: "Recipient and content are required" });
    }

    const message = new Message({
      sender,
      recipient,
      content
    });

    await message.save();
    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// Lấy tất cả tin nhắn giữa 2 user
getConversation = async (req, res) => {
  try {
    const { userId } = req.params; // id của người muốn chat cùng
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
      .sort({ timestamp: 1 }) // sắp xếp theo thời gian
      .populate("sender", "username email")
      .populate("recipient", "username email");

    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversation", error: error.message });
  }
};

// Lấy tất cả tin nhắn của 1 user (inbox)
getUserMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId }
      ]
    })
      .sort({ timestamp: -1 })
      .populate("sender", "username email")
      .populate("recipient", "username email");

    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user messages", error: error.message });
  }
};

// Xóa tin nhắn (chỉ cho phép người gửi xóa)
deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error: error.message });
  }
};
}

export default new messageController();