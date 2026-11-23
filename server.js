// Library Book Management REST API
// Node.js + Express.js | Data memory (array) me store hota hai, koi database nahi

const express = require("express");
const app = express();
const PORT = 3000;

// JSON request body padhne ke liye middleware
app.use(express.json());

// ---------- Data (in-memory array) ----------
let books = [
  {
    id: 101,
    title: "Wings of Fire",
    author: "A.P.J. Abdul Kalam",
    genre: "Autobiography",
    publishedYear: 1999,
    available: true,
  },
  {
    id: 102,
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    publishedYear: 1988,
    available: true,
  },
  {
    id: 103,
    title: "Harry Potter",
    author: "J.K. Rowling",
    genre: "Fantasy",
    publishedYear: 1997,
    available: false,
  },
];

// Agli book ki id yahan se milegi (101-103 already use ho chuki hain)
let nextId = 104;

// ---------- Validation function ----------
// Agar data sahi hai to "" (empty) return karta hai,
// warna error message return karta hai
function validateBook(data) {
  if (!data || typeof data !== "object") {
    return "Request body JSON object hona chahiye";
  }
  if (typeof data.title !== "string" || data.title.trim() === "") {
    return "title must be a non-empty string";
  }
  if (typeof data.author !== "string" || data.author.trim() === "") {
    return "author must be a non-empty string";
  }
  if (typeof data.genre !== "string" || data.genre.trim() === "") {
    return "genre must be a non-empty string";
  }
  if (typeof data.publishedYear !== "number" || !Number.isInteger(data.publishedYear) || data.publishedYear <= 0) {
    return "publishedYear must be a valid number (e.g. 1999)";
  }
  if (typeof data.available !== "boolean") {
    return "available must be a Boolean (true or false)";
  }
  return "";
}

// ---------- Routes ----------

// 1. GET all books
app.get("/api/books", (req, res) => {
  res.status(200).json(books);
});

// 6. Filter by author  (IMPORTANT: /:id route se PEHLE likha hai)
// Example: /api/books/filter?author=rowling
app.get("/api/books/filter", (req, res) => {
  const author = req.query.author;

  // Agar author query di hi nahi gayi to saari books return hongi
  if (!author) {
    return res.status(200).json(books);
  }

  const result = books.filter((book) =>
    book.author.toLowerCase().includes(author.toLowerCase())
  );
  res.status(200).json(result); // match nahi mila to [] jayega
});

// 3. GET book by id
app.get("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).json(book);
});

// 2. POST new book
app.post("/api/books", (req, res) => {
  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const newBook = {
    id: nextId++, // unique id automatically
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    genre: req.body.genre.trim(),
    publishedYear: req.body.publishedYear,
    available: req.body.available,
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// 4. PUT update book
app.put("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  book.title = req.body.title.trim();
  book.author = req.body.author.trim();
  book.genre = req.body.genre.trim();
  book.publishedYear = req.body.publishedYear;
  book.available = req.body.available;

  res.status(200).json(book);
});

// 5. DELETE book
app.delete("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Book not found" });
  }

  books.splice(index, 1);
  res.status(200).json({ message: "Book deleted successfully" });
});

// Galat JSON bhejne par (malformed JSON) 400 return karne ke liye
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  res.status(500).json({ message: "Something went wrong" });
});

// ---------- Server start ----------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
