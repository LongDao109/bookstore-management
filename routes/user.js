const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Adjust path to your User model

const authMiddleware = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// @route   GET /api/users/all
// @desc    Get all user
// @access  Private
router.get("/all", authMiddleware, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});
// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log({ firstName, lastName, email, password });

    // Check required fields
    if (!firstName || !lastName || !email || !password) {
        return res
            .status(400)
            .json({ success: false, error: "Missing fields" });
    }

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res
                .status(400)
                .json({ success: false, error: "Email already exists" });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
        });
        const userObj = user.toObject();
        delete userObj.password;

        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true,
            token,
            data: userObj,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   POST /api/users/login
// @desc    Login user and return JWT
// @access  Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check required fields
    if (!email) {
        return res
            .status(400)
            .json({ success: false, error: "Please add an email" });
    }
    if (!password) {
        return res
            .status(400)
            .json({ success: false, error: "Please add a password" });
    }

    try {
        // Find user
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid credentials" });
        }

        const token = user.getSignedJwtToken();
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            token,
            data: userObj,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).select(
            "-password"
        );

        res.status(200).json({ success: true, data: currentUser });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   PUT /api/users/me
// @desc    Update current user
// @access  Private
router.put("/me", authMiddleware, async (req, res) => {
    const { firstName, lastName, phone } = req.body;

    // Check required fields if provided
    if (!firstName || !lastName) {
        return res.status(400).json({ success: false, error: "Missing data" });
    }

    try {
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (phone) updateFields.phone = phone;

        const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
            new: true,
            runValidators: false, // Since we're not validating types
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   POST /api/users/addresses
// @desc    Add address to user
// @access  Private
router.post("/addresses", authMiddleware, async (req, res) => {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    // Check required address fields
    if (!type || !street || !city || !state || !zipCode || !country) {
        return res.status(400).json({ success: false, error: "Missing data" });
    }

    try {
        const user = await User.findById(req.user.id);
        const newAddress = {
            type,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault,
        };
        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json({ success: true, data: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete address from user
// @access  Private
router.delete("/addresses/:addressId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(
            (address) => address._id.toString() !== req.params.addressId
        );
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   POST /api/users/wishlist
// @desc    Add book to wishlist
// @access  Private
router.post("/wishlist", authMiddleware, async (req, res) => {
    const { bookId } = req.body;

    // Check required field
    if (!bookId) {
        return res
            .status(400)
            .json({ success: false, error: "Please add a book ID" });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(bookId)) {
            user.wishlist.push(bookId);
            await user.save();
        }
        res.status(200).json({ success: true, data: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   DELETE /api/users/wishlist/:bookId
// @desc    Remove book from wishlist
// @access  Private
router.delete("/wishlist/:bookId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.wishlist = user.wishlist.filter(
            (bookId) => bookId.toString() !== req.params.bookId
        );
        await user.save();
        res.status(200).json({ success: true, data: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
