const express = require("express");
const router = express.Router();
const Book = require("../models/Book"); // Adjust path to your Book model

const authMiddleware = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// @route   GET /api/books/search
// @desc    Search books by title or description
// @access  Public

router.get("/search", async (req, res) => {
    const { query, category, minPrice, maxPrice, featured, publishDate } =
        req.query;
    console.log({
        query,
        category,
        minPrice,
        maxPrice,
        featured,
        publishDate,
    });

    const filter = {};

    // Search by title, author, or isbn
    if (query) {
        const regex = new RegExp(query.toString(), "i");
        filter.$or = [{ title: regex }, { author: regex }, { isbn: regex }];
    }

    // Category (ObjectId string)
    if (category) {
        filter.category = category;
    }

    // Price Range
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Featured
    if (featured === "true") filter.featured = true;
    if (featured === "false") filter.featured = false;

    // Publish Date (exact match or ISO partial)
    if (publishDate) {
        filter.publishDate = { $regex: publishDate.toString(), $options: "i" };
    }

    try {
        const books = await Book.find(filter).populate("category", "name");

        res.status(200).json({
            success: true,
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/books/featured
// @desc    Get featured books
// @access  Public
router.get("/featured", async (req, res) => {
    try {
        const books = await Book.find({ featured: true }).populate(
            "category",
            "name"
        );
        res.status(200).json({
            success: true,
            count: books.length,
            data: books,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   POST /api/books
// @desc    Create a new book
// @access  Private (Admin only)

router.post("/", authMiddleware, admin, async (req, res) => {
    const {
        title,
        author,
        description,
        isbn,
        category,
        price,
        stock,
        coverImage,
        featured,
        format,
        language,
        pageCount,
        publishDate,
        salePrice,
        publisher,
    } = req.body;
    console.log({
        title,
        author,
        description,
        isbn,
        category,
        price,
        stock,
    });
    // Check required fields
    if (
        !title ||
        !author ||
        !description ||
        !isbn ||
        !category ||
        !pageCount ||
        !price ||
        !stock ||
        !format ||
        !coverImage
    ) {
        return res.status(400).json({ success: false, error: "Missing data" });
    }

    try {
        // Check if ISBN already exists
        const bookExists = await Book.findOne({ isbn });
        if (bookExists) {
            return res
                .status(400)
                .json({ success: false, error: "ISBN already exists" });
        }

        // Create book
        const book = await Book.create({
            title,
            author,
            description,
            isbn,
            category,
            price,
            salePrice,
            stock,
            featured,
            format,
            pageCount,
            language,
            publishDate,
            publisher,
            coverImage,
        });
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        console.log(error);

        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/books
// @desc    Get all books (with optional limit)
// @access  Public
router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);

        const query = Book.find()
            .populate("category", "name")
            .sort({ createdAt: -1 });

        if (!isNaN(limit)) {
            query.limit(limit);
        }

        const books = await query.exec();

        res.status(200).json({
            success: true,
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.error("GET /api/books error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate(
            "category",
            "name"
        );
        if (!book) {
            return res
                .status(404)
                .json({ success: false, error: "Book not found" });
        }
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   GET /api/books/slug/:slug
// @desc    Get single book by slug
// @access  Public
router.get("/slug/:slug", async (req, res) => {
    try {
        const book = await Book.findOne({ slug: req.params.slug }).populate(
            "category",
            "name"
        );
        if (!book) {
            return res
                .status(404)
                .json({ success: false, error: "Book not found" });
        }
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private (Admin only)
router.put("/:id", authMiddleware, admin, async (req, res) => {
    const { title, author, description, isbn, category, price, stock } =
        req.body;

    // Check required fields if provided
    if (title === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add a title" });
    }
    if (author === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add an author" });
    }
    if (description === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add a description" });
    }
    if (isbn === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add an ISBN" });
    }
    if (category === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add a category" });
    }
    if (price === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add a price" });
    }
    if (stock === "") {
        return res
            .status(400)
            .json({ success: false, error: "Please add stock quantity" });
    }

    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res
                .status(404)
                .json({ success: false, error: "Book not found" });
        }

        // Check if ISBN is being updated and already exists
        if (isbn && isbn !== book.isbn) {
            const bookExists = await Book.findOne({ isbn });
            if (bookExists) {
                return res
                    .status(400)
                    .json({ success: false, error: "ISBN already exists" });
            }
        }

        // Update book
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: false, // Since we're not validating types
            }
        ).populate("category", "name");

        res.status(200).json({ success: true, data: updatedBook });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private (Admin only)
router.delete("/:id", authMiddleware, admin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res
                .status(404)
                .json({ success: false, error: "Book not found" });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
