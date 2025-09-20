import express from "express";
import messageController from "../controller/MessageController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/conversation/:userId", verifyToken, messageController.getConversation);
router.get("/my", verifyToken, messageController.getUserMessages);
router.delete("/:id", verifyToken, messageController.deleteMessage);
router.post("/", verifyToken, messageController.sendMessage);

export default router;
