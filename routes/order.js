const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            subtotal,
            discount,
            total,
            notes,
            user,
        } = req.body;
        console.log({
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            subtotal,
            discount,
            total,
            notes,
            user,
        });

        if (!user) {
            return res
                .status(400)
                .json({ success: false, error: "Missing user" });
        }
        if (!items || items.length === 0) {
            return res
                .status(400)
                .json({ success: false, error: "No items in order" });
        }

        const order = new Order({
            user: user,
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            subtotal,
            discount,
            total,
            notes,
        });

        const savedOrder = await order.save();
        res.status(201).json({ success: true, data: savedOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/orders/stats/current-month
// @desc    Get total orders in current month (admin only)
// @access  Private/Admin
router.get("/stats/current-month", authMiddleware, admin, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

        const totalOrders = await Order.countDocuments({
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });

        res.json({
            success: true,
            month: now.toLocaleString("default", { month: "long" }),
            year: now.getFullYear(),
            totalOrders,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (admin only, with optional ?limit=n)
// @access  Private/Admin
router.get("/", authMiddleware, admin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0; // 0 = no limit

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("user", "name email")
            .populate("items.book", "title price");

        res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/orders/my
// @desc    Get current user's orders
// @access  Private
router.get("/my", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate(
            "items.book",
            "title price"
        );
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private (owner or admin)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.book", "title price");

        if (!order)
            return res
                .status(404)
                .json({ success: false, error: "Order not found" });

        // Check permission
        if (
            order.user._id.toString() !== req.user._id.toString() &&
            !req.user.isAdmin
        ) {
            return res
                .status(403)
                .json({ success: false, error: "Not authorized" });
        }

        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put("/:id", authMiddleware, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order)
            return res
                .status(404)
                .json({ success: false, error: "Order not found" });

        order.status = req.body.status || order.status;
        const updated = await order.save();

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete("/:id", authMiddleware, admin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order)
            return res
                .status(404)
                .json({ success: false, error: "Order not found" });

        res.json({ success: true, message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
