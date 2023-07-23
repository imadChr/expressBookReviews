const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Invalid request. Username and password are required." });
  }

  const user = authenticatedUser(username, password);

  if (user) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password." });
  }
});


regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if the user has already posted a review for the given ISBN.
  if (books[isbn].reviews[username]) {
    // Modify the existing review.
    books[isbn].reviews[username].review = review;
    return res.status(200).json({ message: "Review modified successfully" });
  }

  books[isbn].reviews[username] = { username, review };
  return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
        const isbn = req.params.isbn;
        const username = req.session.authorization?.username;
        if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found" });
        }

        if (!username) {
          return res.status(401).json({ message: "User not logged in" });
        }
       
        if(books[isbn].reviews[username]){
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });

        }
        return res.status(401).json({message:"Review not found for the user"});
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
