const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    avatar: {
        type: String,
    },
    firstName: {
        type: String,
        required: [true, "Please add a first name"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Please add a last name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },
    phone: {
        type: String,
        trim: true,
    },
    addresses: [
        {
            type: {
                type: String,
                enum: ["billing", "shipping"],
                required: true,
            },
            isDefault: {
                type: Boolean,
                default: false,
            },
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            zipCode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
                default: "United States",
            },
        },
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
    this.updatedAt = Date.now();

    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", UserSchema);
