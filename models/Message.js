const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessageSchema = new Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            trim: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
