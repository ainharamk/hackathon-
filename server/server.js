require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://hackathon-production-d745.up.railway.app",
  })
);

// ---------- DATABASE CONNECTION ----------
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release();
});

// ---------- HEALTH CHECK ----------
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// ---------- USER AUTH ----------
app.post("/users/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password required");

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Database error");
      if (results.length > 0) return res.status(400).send("Username taken");

      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err) => {
          if (err) return res.status(500).send("Database error");
          res.json({ message: "User registered", username });
        }
      );
    }
  );
});

app.post("/users/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password required");

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Database error");
      if (results.length === 0) return res.status(400).send("User not found");
      if (results[0].password !== password)
        return res.status(400).send("Incorrect password");

      res.json({ message: "Login successful", username });
    }
  );
});

// ---------- DAILY TRACKER ----------
app.post("/tracker", (req, res) => {
  const { username, mood, hoursSlept } = req.body;
  if (!username || !mood || hoursSlept == null)
    return res.status(400).send("Missing fields");

  const sql =
    "INSERT INTO daily_tracker (username, mood, hours_slept) VALUES (?, ?, ?)";
  db.query(sql, [username, mood, hoursSlept], (err) => {
    if (err) return res.status(500).send("Database error");
    res.json({ message: "Tracker saved" });
  });
});

app.get("/tracker", (req, res) => {
  db.query(
    "SELECT * FROM daily_tracker ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).send("Database error");
      res.json(results);
    }
  );
});

// ---------- FORUM POSTS & REPLIES ----------
app.post("/forum/posts", (req, res) => {
  const { username, content } = req.body;
  if (!username || !content) return res.status(400).send("Missing fields");

  const sql =
    "INSERT INTO forum_posts (username, message, created_by_user) VALUES (?, ?, true)";
  db.query(sql, [username, content], (err, result) => {
    if (err) return res.status(500).send("Database error");

    // Return the newly created post
    const newPost = {
      id: result.insertId,
      username,
      content,
      replies: [],
    };
    res.json(newPost);
  });
});

app.get("/forum/posts", (req, res) => {
  const sql = `
    SELECT p.id, p.username, p.message AS content,
           IFNULL(JSON_ARRAYAGG(JSON_OBJECT('username', r.username, 'content', r.message)), '[]') AS replies
    FROM forum_posts p
    LEFT JOIN forum_replies r ON p.id = r.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    // Parse replies from JSON string to array
    const posts = results.map(r => ({
      id: r.id,
      username: r.username,
      content: r.content,
      replies: JSON.parse(r.replies)
    }));
    res.json(posts);
  });
});

app.post("/forum/posts/:id/reply", (req, res) => {
  const { username, content } = req.body;
  const postId = req.params.id;
  if (!username || !content) return res.status(400).send("Missing fields");

  const sql = "INSERT INTO forum_replies (post_id, username, message) VALUES (?, ?, ?)";
  db.query(sql, [postId, username, content], (err, result) => {
    if (err) return res.status(500).send("Database error");
    res.json({ username, content }); // send back the reply object
  });
});

app.delete("/forum/posts/:id", (req, res) => {
  db.query("DELETE FROM forum_posts WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Database error");
    res.json({ message: "Post deleted" });
  });
});

// ---------- REACT STATIC FILES ----------
app.use(express.static(path.join(__dirname, "../build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// ---------- START SERVER ----------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});