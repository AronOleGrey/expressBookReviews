const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
  if (isValid(username)) return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/', (req, res) => res.send(JSON.stringify(books, null, 4)));

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  books[isbn] ? res.send(JSON.stringify(books[isbn], null, 4))
              : res.status(404).json({ message: "Book not found" });
});

public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const result = {};
  Object.keys(books).forEach((isbn) => { if (books[isbn].author === author) result[isbn] = books[isbn]; });
  Object.keys(result).length ? res.send(JSON.stringify(result, null, 4))
                             : res.status(404).json({ message: "No books found for this author" });
});

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const result = {};
  Object.keys(books).forEach((isbn) => { if (books[isbn].title === title) result[isbn] = books[isbn]; });
  Object.keys(result).length ? res.send(JSON.stringify(result, null, 4))
                             : res.status(404).json({ message: "No books found with this title" });
});

public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  books[isbn] ? res.send(JSON.stringify(books[isbn].reviews, null, 4))
              : res.status(404).json({ message: "Book not found" });
});

public_users.get('/async/books', async (req, res) => {
  try { const r = await axios.get('http://localhost:5000/'); res.send(JSON.stringify(r.data, null, 4)); }
  catch (e) { res.status(500).json({ message: "Error fetching books", error: e.message }); }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try { const r = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`); res.send(JSON.stringify(r.data, null, 4)); }
  catch (e) { res.status(404).json({ message: "Book not found", error: e.message }); }
});

public_users.get('/async/author/:author', async (req, res) => {
  try { const r = await axios.get(`http://localhost:5000/author/${encodeURIComponent(req.params.author)}`); res.send(JSON.stringify(r.data, null, 4)); }
  catch (e) { res.status(404).json({ message: "No books found for this author", error: e.message }); }
});

public_users.get('/async/title/:title', async (req, res) => {
  try { const r = await axios.get(`http://localhost:5000/title/${encodeURIComponent(req.params.title)}`); res.send(JSON.stringify(r.data, null, 4)); }
  catch (e) { res.status(404).json({ message: "No books found with this title", error: e.message }); }
});

module.exports.general = public_users;
