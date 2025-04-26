const mongoose = require("mongoose");
const slugify = require("slugify");

const BookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please add a title"],
            trim: true,
            maxlength: [100, "Title cannot be more than 100 characters"],
        },
        slug: String,
        author: {
            type: String,
            required: [true, "Please add a description"],
        },
        description: {
            type: String,
            required: [true, "Please add a description"],
        },
        isbn: {
            type: String,
            required: [true, "Please add an ISBN"],
            unique: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please add a category"],
        },

        price: {
            type: Number,
            required: [true, "Please add a price"],
            min: [0, "Price must be at least 0"],
        },
        salePrice: {
            type: Number,
            min: [0, "Sale price must be at least 0"],
        },
        stock: {
            type: Number,
            required: [true, "Please add stock quantity"],
            default: 0,
            min: [0, "Stock must be at least 0"],
        },
        format: {
            type: String,
            enum: ["Hardcover", "Paperback", "E-book", "Audiobook"],
            default: "Paperback",
        },
        pageCount: {
            type: Number,
            min: [1, "Page count must be at least 1"],
        },

        publishDate: {
            type: Date,
        },
        publisher: {
            type: String,
            trim: true,
        },
        coverImage: {
            type: String,
            required: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            min: [0, "Rating must be at least 0"],
            max: [5, "Rating cannot be more than 5"],
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Create book slug from the title
BookSchema.pre("save", function (next) {
    this.slug = slugify(this.title, { lower: true });
    this.updatedAt = Date.now();
    next();
});

// Virtual for reviews
BookSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "book",
    justOne: false,
});

// Method to check if book is in stock
BookSchema.methods.isInStock = function () {
    return this.stock > 0;
};

// Method to check if book is on sale
BookSchema.methods.isOnSale = function () {
    return this.salePrice && this.salePrice < this.price;
};

// Create text index for search
BookSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Book", BookSchema);
