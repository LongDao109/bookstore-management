const User = require("../models/User");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing jwt secret");
        }
        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};
module.exports = authMiddleware;
