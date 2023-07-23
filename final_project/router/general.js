const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const Username = req.body.username;
  const Password = req.body.password;
  if(!Username || !Password){
    return res.status(208).json({message:"Invalid username or password"});
  }
  const User = users.filter((user)=> user.username === Username);
  if(User.length > 0){
    return res.status(404).json({message:"Username already exists"});
  }
  users.push({ username: Username, password: Password });
  return res.status(200).json(`User: ${Username} has registered successfully`)
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
  const author = req.params.author;
  // Obtain all the book objects from the 'books' object.
  const bookList = Object.values(books);

  const booksByAuthor = bookList.filter((book) => book.author === author);
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found for the author" });
  }
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const bookList = Object.values(books);
  const booksByTitle = bookList.filter((book)=> book.title === title);
  if(booksByTitle.length === 0){
    return res.status(404).json({message:"No books having this title are found"});
  }
  return res.status(200).json({booksByTitle});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if(!book){
      return res.status(404).json({message:"book not found"})
    }

    const reviews = book.reviews;
    return res.status(200).json({reviews}); 
});

// A function for getting all the books
function getBooksUsingPromiseCallback() {
  return new Promise((resolve, reject) => {
    const bookList = Object.values(books);
    resolve(bookList);
  });
}
// A function for getting a book details using isbn 
function getBookDetailsUsingPromiseCallback(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  });
}
// A function for getting a book details using author
function getBooksByAuthorUsingPromiseCallback(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject(new Error("Books not found for the given author"));
    }
  });
}

module.exports.general = public_users;
