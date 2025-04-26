const express = require("express");
const router = express.Router();
const Review = require("../models/Review"); // Adjust path to your Review model
const Book = require("../models/Book"); // Adjust path to your Book model
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/Order");

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
    const { book, rating, text } = req.body;

    // Check required fields
    if (!book) {
        return res
            .status(400)
            .json({ success: false, error: "Please add a book" });
    }
    if (rating === undefined || rating === null) {
        return res
            .status(400)
            .json({ success: false, error: "Please add a rating" });
    }
    if (!text) {
        return res
            .status(400)
            .json({ success: false, error: "Please add review text" });
    }

    try {
        // Check if book exists
        const bookExists = await Book.findById(book);
        if (!bookExists) {
            return res
                .status(404)
                .json({ success: false, error: "Book not found" });
        }

        // Check if user has purchased the book (optional verification)
        const order = await Order.findOne({
            user: req.user.id,
            "items.book": book,
            status: { $in: ["processing", "shipped", "delivered"] },
        });
        const verified = !!order;

        // Create review
        const review = await Review.create({
            book,
            user: req.user.id,
            rating,
            text,
            title: req.body.title,
            verified,
        });

        const populatedReview = await Review.findById(review._id)
            .populate("book", "title slug")
            .populate("user", "firstName lastName");
        res.status(201).json({ success: true, data: populatedReview });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "User has already reviewed this book",
            });
        }
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("book", "title slug")
            .populate("user", "firstName lastName");
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/reviews/book/:bookId
// @desc    Get reviews for a specific book
// @access  Public
router.get("/book/:bookId", async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res
                .status(404)
                .json({ success: false, error: "Book not found" });
        }

        const reviews = await Review.find({ book: req.params.bookId })
            .populate("book", "title slug")
            .populate("user", "firstName lastName");
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/reviews/:id
// @desc    Get single review by ID
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate("book", "title slug")
            .populate("user", "firstName lastName");
        if (!review) {
            return res
                .status(404)
                .json({ success: false, error: "Review not found" });
        }
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put("/:id", authMiddleware, async (req, res) => {
    const { rating, text } = req.body;

    // Check required fields if provided
    if (rating === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add a rating" });
    }
    if (text === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add review text" });
    }

    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res
                .status(404)
                .json({ success: false, error: "Review not found" });
        }

        // Check if user owns the review or is admin
        if (
            review.user.toString() !== req.user.id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                error: "Not authorized to update this review",
            });
        }

        // Update review
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            { rating, text, title: req.body.title },
            {
                new: true,
                runValidators: false, // Since we're not validating types
            }
        )
            .populate("book", "title slug")
            .populate("user", "firstName lastName");

        res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res
                .status(404)
                .json({ success: false, error: "Review not found" });
        }

        // Check if user owns the review or is admin
        if (
            review.user.toString() !== req.user.id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                error: "Not authorized to delete this review",
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   POST /api/reviews/:id/vote
// @desc    Increment helpful votes for a review
// @access  Private
router.post("/:id/vote", authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res
                .status(404)
                .json({ success: false, error: "Review not found" });
        }

        // Prevent user from voting on their own review
        if (review.user.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                error: "Cannot vote on your own review",
            });
        }

        // Increment helpful votes
        review.helpfulVotes += 1;
        await review.save();

        const populatedReview = await Review.findById(review._id)
            .populate("book", "title slug")
            .populate("user", "firstName lastName");
        res.status(200).json({ success: true, data: populatedReview });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
