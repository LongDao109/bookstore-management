const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const categoryRoutes = require("./routes/category");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");
const messageRoutes = require("./routes/message");
const connectDB = require("./config/db");
require("dotenv/config");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production to specific origins
        methods: ["GET", "POST"],
    },
});
app.locals.io = io;
connectDB();
// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return next(new Error("User not found"));
        socket.user = user;
        next();
    } catch (err) {
        next(new Error("Invalid token"));
    }
});

// Socket.IO Connection Handling
io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User ${userId} connected`);

    socket.join(userId);

    // Listen for new message
    socket.on("sendMessage", async ({ receiverId, content }) => {
        try {
            if (!receiverId || !content) return;

            const message = new Message({
                senderId: userId,
                receiverId,
                content,
            });

            await message.save();

            io.to(receiverId).emit("newMessage", message);
            io.to(userId).emit("newMessage", message);
        } catch (error) {
            socket.emit("error", { message: "Message failed to send" });
        }
    });

    socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
    });
});

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

server.listen(5000, () => console.log("Server running on port 5000"));
