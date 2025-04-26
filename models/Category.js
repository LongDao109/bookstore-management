const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            unique: true,
            trim: true,
            maxlength: [50, "Name cannot be more than 50 characters"],
        },
        slug: String,
        description: {
            type: String,
            maxlength: [500, "Description cannot be more than 500 characters"],
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        image: {
            type: String,
        },
        featured: {
            type: Boolean,
            default: false,
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

// Create category slug from the name
CategorySchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    this.updatedAt = Date.now();
    next();
});

// Reverse populate with virtuals
CategorySchema.virtual("books", {
    ref: "Book",
    localField: "_id",
    foreignField: "category",
    justOne: false,
});

module.exports = mongoose.model("Category", CategorySchema);
