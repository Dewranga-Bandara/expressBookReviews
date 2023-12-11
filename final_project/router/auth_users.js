const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some((user) => user.username === username);
};

const authenticatedUserForRegisteredUsers = (username, password) => {
    const registeredUser = users.find(user => user.username === username && user.password === password);
    return !!registeredUser;
};

regd_users.use(express.json());

regd_users.use(session({
    secret: process.env.SESSION_SECRET || 'your_default_session_secret',
    resave: false,
    saveUninitialized: true
}));

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUserForRegisteredUsers(username, password)) {
        const accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).json({ message: "Registered user successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid login credentials for registered user" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:id", (req, res) => {
    const bookId = req.params.id;
    const { review } = req.body;

    // Check if the user is logged in
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!bookId || !review) {
        return res.status(400).json({ message: "Incomplete data for review" });
    }

    // Find the book in the books object using the bookId
    const book = books[bookId];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get the username from the session
    const username = req.session.authorization.username;

    // Modify or add the review to the book
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added or modified successfully" });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if the user is logged in
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!isbn) {
        return res.status(400).json({ message: "Incomplete data for review deletion" });
    }

    // Find the book in the books object using the isbn
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get the username from the session
    const username = req.session.authorization.username;

    // Check if the user has a review for the book
    if (book.reviews && book.reviews[username]) {
        // Remove the user's review
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
