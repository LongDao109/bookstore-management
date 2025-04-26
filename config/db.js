const mongoose = require("mongoose");
const Book = require("../models/Book");
const Category = require("../models/Category");
// const sciFiCategoryId = "680a1c000d3d515214f86825";
// const programmingCategoryId = "680a1cebbea1dbf3c4a0f8a4";
// const selfHelpCategoryId = "680a1d1abea1dbf3c4a0f8a7";
// const books = [
//     // Science Fiction
//     {
//         title: "The Time Explorer",
//         author: "Arthur Nova",
//         description: "A thrilling journey through time and space.",
//         isbn: "9780000000001",
//         category: sciFiCategoryId, // replace with actual ObjectId
//         price: 18.99,
//         salePrice: 14.99,
//         stock: 10,
//         format: "Hardcover",
//         pageCount: 320,
//         publishDate: new Date("2023-03-15"),
//         publisher: "Galactic Press",
//         coverImage:
//             "https://m.media-amazon.com/images/I/51GSKM4FEPL._SY466_.jpg",
//         rating: 4.6,
//         reviewCount: 89,
//     },
//     {
//         title: "Stars Beyond Reach",
//         author: "Elena Ray",
//         description: "A tale of survival and discovery across galaxies.",
//         isbn: "9780000000002",
//         category: sciFiCategoryId,
//         price: 22.5,
//         stock: 5,
//         format: "Paperback",
//         pageCount: 410,
//         publishDate: new Date("2022-07-10"),
//         publisher: "Cosmos House",
//         rating: 4.3,
//         coverImage:
//             "https://m.media-amazon.com/images/I/71vw3upLUjL._SL1499_.jpg",
//     },
//     {
//         title: "Robots of Tomorrow",
//         author: "Mark Elson",
//         description: "Exploring the ethical side of AI and robotics.",
//         isbn: "9780000000003",
//         category: sciFiCategoryId,
//         price: 15.0,
//         stock: 8,
//         format: "E-book",
//         pageCount: 290,
//         coverImage:
//             "https://m.media-amazon.com/images/I/718bCpiX4gL._SL1500_.jpg",
//     },
//     {
//         title: "Alien Archives",
//         author: "Zara Trent",
//         description: "Secret files on alien civilizations.",
//         isbn: "9780000000004",
//         category: sciFiCategoryId,
//         price: 20.0,
//         stock: 12,
//         format: "Audiobook",
//         pageCount: 1,
//         coverImage:
//             "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSUN9YhShsmXp85HN7lOyi4JpTyyF-DJU-hUSL62R_hbzD2r_zE",
//     },

//     // Programming
//     {
//         title: "Mastering JavaScript",
//         author: "Tom Larson",
//         description: "Deep dive into JavaScript for developers.",
//         isbn: "9780000000005",
//         category: programmingCategoryId,
//         price: 34.99,
//         stock: 6,
//         format: "Paperback",
//         pageCount: 500,
//         coverImage:
//             "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSKj969O9UrVqtidOFjrlMJ35yMYNcexqUyTXPSeV-vaAsis9sY",
//     },
//     {
//         title: "SwiftUI Essentials",
//         author: "Nina Kim",
//         description: "Building beautiful apps with SwiftUI.",
//         isbn: "9780000000006",
//         category: programmingCategoryId,
//         price: 29.99,
//         stock: 10,
//         format: "Paperback",
//         pageCount: 350,
//         coverImage:
//             "https://m.media-amazon.com/images/I/61Gp+YT7zcL._SL1360_.jpg",
//     },
//     {
//         title: "Node.js in Action",
//         author: "Chris Allen",
//         description: "Backend development with Node.js.",
//         isbn: "9780000000007",
//         category: programmingCategoryId,
//         price: 27.99,
//         stock: 3,
//         format: "E-book",
//         pageCount: 420,
//         coverImage:
//             "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSLc_56Q8HUZiwdhBTnvMugCBDs8ir8B-kGMALmv1G5QPzco7TW",
//     },

//     // Self-Help
//     {
//         title: "Atomic Habits",
//         author: "James Clear",
//         description: "An easy & proven way to build good habits.",
//         isbn: "9780000000008",
//         category: selfHelpCategoryId,
//         price: 21.0,
//         stock: 15,
//         format: "Hardcover",
//         pageCount: 320,
//         coverImage:
//             "https://m.media-amazon.com/images/I/81ANaVZk5LL._SL1500_.jpg",
//     },
//     {
//         title: "Mindfulness Made Simple",
//         author: "Emma Lewis",
//         description: "Reduce stress and increase focus through mindfulness.",
//         isbn: "9780000000009",
//         category: selfHelpCategoryId,
//         price: 18.0,
//         stock: 8,
//         format: "Paperback",
//         pageCount: 240,
//         coverImage:
//             "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSxy_2l0AFJCIlaAVsQfcr1TzvyKCzYCO9hXNYlrmZ8Ja3aPRJn",
//     },
//     {
//         title: "The 5 AM Club",
//         author: "Robin Sharma",
//         description: "Own your morning. Elevate your life.",
//         isbn: "9780000000010",
//         category: selfHelpCategoryId,
//         price: 25.0,
//         stock: 5,
//         format: "Hardcover",
//         pageCount: 336,
//         coverImage:
//             "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9J_tzkxsQQv3e64XWgwS4AiwULU8IVFECtRaWg37dK7ANNcde",
//     },
// ];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            `mongodb+srv://user1:${process.env.MONGO_PASSWORD}@cluster0.zqtpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        // await Category.deleteMany();
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
