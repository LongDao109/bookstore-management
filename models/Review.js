const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: [true, "Please add a rating between 1 and 5"],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, "Title cannot be more than 100 characters"],
        },
        text: {
            type: String,
            required: [true, "Please add a review text"],
            trim: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        helpfulVotes: {
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

// Prevent user from submitting more than one review per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Pre-save hook to update the updatedAt field
ReviewSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (bookId) {
    const obj = await this.aggregate([
        {
            $match: { book: bookId },
        },
        {
            $group: {
                _id: "$book",
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model("Book").findByIdAndUpdate(bookId, {
            rating: obj[0] ? obj[0].averageRating : 0,
            reviewCount: obj[0] ? obj[0].reviewCount : 0,
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.book);
});

// Call getAverageRating after remove
ReviewSchema.post("remove", function () {
    this.constructor.getAverageRating(this.book);
});

module.exports = mongoose.model("Review", ReviewSchema);
