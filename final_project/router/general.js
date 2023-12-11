const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Incomplete data for registration" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({
        username,
        password,
    });

    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    const bookList = Object.values(books);
    const formattedBookList = JSON.stringify(bookList, null, 2); // Use JSON.stringify for neat formatting
    res.status(200).send(formattedBookList);
});

// Using Promise callbacks (Get the book list available in the shop)
public_users.get('/', function (req, res) {
    getBookList()
        .then(bookList => {
            const formattedBookList = JSON.stringify(bookList, null, 2);
            res.status(200).send(formattedBookList);
        })
        .catch(error => {
            console.error("Error fetching book list:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

function getBookList() {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:5000/')  // Assuming the server is running on localhost:5000
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Using async-await with Axios (Get the book list available in the shop)
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBookList();
        const formattedBookList = JSON.stringify(bookList, null, 2);
        res.status(200).send(formattedBookList);
    } catch (error) {
        console.error("Error fetching book list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function getBookList() {
    try {
        const response = await axios.get('http://localhost:5000/');  // Assuming the server is running on localhost:5000
        return response.data;
    } catch (error) {
        throw error;
    }
}




// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
});

// Using Promise callbacks (Get book details based on ISBN)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookDetails(isbn)
        .then(book => {
            res.status(200).json(book);
        })
        .catch(error => {
            console.error("Error fetching book details:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

function getBookDetails(isbn) {
    return new Promise((resolve, reject) => {
        axios.get(`http://localhost:5000/isbn/${isbn}`)  // Assuming the server is running on localhost:5000
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Using async-await with Axios (Get book details based on ISBN)
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookDetails(isbn);
        res.status(200).json(book);
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function getBookDetails(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);  // Assuming the server is running on localhost:5000
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length === 0) {
        return res.status(404).json({ message: "No books found for the author" });
    }

    return res.status(200).json(booksByAuthor);
});

// Using Promise callbacks (Get book details based on author)
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then(booksByAuthor => {
            if (booksByAuthor.length === 0) {
                return res.status(404).json({ message: "No books found for the author" });
            }
            res.status(200).json(booksByAuthor);
        })
        .catch(error => {
            console.error("Error fetching books by author:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        axios.get(`http://localhost:5000/author/${author}`)  // Assuming the server is running on localhost:5000
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}


// Using async-await with Axios (Get book details based on author)
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        if (booksByAuthor.length === 0) {
            return res.status(404).json({ message: "No books found for the author" });
        }
        res.status(200).json(booksByAuthor);
    } catch (error) {
        console.error("Error fetching books by author:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);  // Assuming the server is running on localhost:5000
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksWithTitle = Object.values(books).filter(book => book.title === title);

    if (booksWithTitle.length === 0) {
        return res.status(404).json({ message: "No books found with the title" });
    }

    return res.status(200).json(booksWithTitle);
});


// Using Promise callbacks (Get all books based on title)
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then(booksWithTitle => {
            if (booksWithTitle.length === 0) {
                return res.status(404).json({ message: "No books found with the title" });
            }
            res.status(200).json(booksWithTitle);
        })
        .catch(error => {
            console.error("Error fetching books by title:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        axios.get(`http://localhost:5000/title/${title}`)  // Assuming the server is running on localhost:5000
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Using async-await with Axios (Get all books based on title)
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const booksWithTitle = await getBooksByTitle(title);
        if (booksWithTitle.length === 0) {
            return res.status(404).json({ message: "No books found with the title" });
        }
        res.status(200).json(booksWithTitle);
    } catch (error) {
        console.error("Error fetching books by title:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function getBooksByTitle(title) {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);  // Assuming the server is running on localhost:5000
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviews = book.reviews;

    return res.status(200).json(reviews);
});

module.exports.general = public_users;
