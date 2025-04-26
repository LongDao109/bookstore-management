const express = require("express");
const router = express.Router();
const Category = require("../models/Category"); // Adjust path to your Category model
const Book = require("../models/Book");
const authMiddleware = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post("/", authMiddleware, admin, async (req, res) => {
    const { name, description, image, featured } = req.body;

    // Check required field
    if (!name) {
        return res
            .status(400)
            .json({ success: false, error: "Please add a name" });
    }

    try {
        // Check if category name already exists
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({
                success: false,
                error: "Category name already exists",
            });
        }

        // Create category
        const category = await Category.create({
            name,
            description,
            image,
            featured: !!featured, // ensure boolean
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});
// @route   GET /api/categories/slug/:slug
// @desc    Get single category by slug
// @access  Public
router.get("/slug/:slug", async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .populate("parent", "name slug")
            .populate("books", "title slug");
        if (!category) {
            return res
                .status(404)
                .json({ success: false, error: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});
// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find()
            .populate("parent", "name slug")
            .populate("books", "title slug");
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate("parent", "name slug")
            .populate("books", "title slug");
        if (!category) {
            return res
                .status(404)
                .json({ success: false, error: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put("/:id", authMiddleware, admin, async (req, res) => {
    const { name, description, image, featured } = req.body;

    // Check required field
    if (!name) {
        return res
            .status(400)
            .json({ success: false, error: "Please add a name" });
    }

    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res
                .status(404)
                .json({ success: false, error: "Category not found" });
        }

        // Check if name is being updated and already exists
        if (name && name !== category.name) {
            const categoryExists = await Category.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({
                    success: false,
                    error: "Category name already exists",
                });
            }
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, image, featured },
            {
                new: true,
                runValidators: false, // Since we're not validating types
            }
        )
            .populate("parent", "name slug")
            .populate("books", "title slug");

        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete("/:id", authMiddleware, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res
                .status(404)
                .json({ success: false, error: "Category not found" });
        }

        // Check if category has books
        const books = await Book.find({ category: req.params.id });
        if (books.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete category with associated books",
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.log(error);

        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/categories/featured
// @desc    Get featured categories
// @access  Public
router.get("/featured", async (req, res) => {
    try {
        const categories = await Category.find({ featured: true })
            .populate("parent", "name slug")
            .populate("books", "title slug");
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
