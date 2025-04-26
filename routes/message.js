const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message"); // Adjust path to your Message model

const router = express.Router();

// Send message
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const message = new Message({
            senderId: req.user.id,
            receiverId,
            content,
        });

        await message.save();
        req.app.locals.io.emit("newMessage", message);

        res.json({ success: false, data: message });
    } catch (error) {
        console.log(error);

        res.json({ success: false, error: "Interval server errror" });
    }
});

// Get messages
router.get("/:receiverId", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id, receiverId: req.params.receiverId },
                { senderId: req.params.receiverId, receiverId: req.user.id },
            ],
        }).sort({ timestamp: 1 });

        res.json({ success: false, data: messages });
    } catch (error) {
        console.log(error);

        res.json({ success: false, error: "Interval server errror" });
    }
});

module.exports = router;
