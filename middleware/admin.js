// Middleware to check admin role
const admin = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res
            .status(403)
            .json({ success: false, error: "Not authorized as admin" });
    }
};
module.exports = admin;
