const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            book: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"],
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    shippingAddress: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        country: {
            type: String,
        },
    },
    billingAddress: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        country: {
            type: String,
        },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["credit_card", "paypal", "stripe", "cash"],
    },

    subtotal: {
        type: Number,
        required: true,
    },

    discount: {
        type: Number,
        default: 0,
    },

    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
        ],
        default: "pending",
    },

    notes: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to update the updatedAt field
OrderSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for item count
OrderSchema.virtual("itemCount").get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

module.exports = mongoose.model("Order", OrderSchema);
