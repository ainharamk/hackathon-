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
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT),
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
});

console.log("DB Host:", process.env.DB_HOST || process.env.MYSQLHOST);
console.log("DB Port:", process.env.DB_PORT || process.env.MYSQLPORT);

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
    "SELECT id FROM users WHERE username = ?",
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

// Returns the most recent log for the given user (?username=xxx)
app.get("/tracker", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send("username query param required");
  }

  db.query(
    "SELECT * FROM daily_tracker WHERE username = ? ORDER BY created_at DESC, id DESC LIMIT 1",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Database error");
      // mood stored as varchar — parse to number so frontend comparisons work
      const parsed = results.map(r => ({ ...r, mood: Number(r.mood) }));
      res.json(parsed);
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
  // Use a subquery instead of JSON_ARRAYAGG to avoid null/empty JSON parse issues
  const sql = `
    SELECT p.id, p.username, p.message AS content
    FROM forum_posts p
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, posts) => {
    if (err) return res.status(500).send("Database error");

    if (posts.length === 0) return res.json([]);

    const postIds = posts.map(p => p.id);
    const replySql = `
      SELECT post_id, username, message AS content
      FROM forum_replies
      WHERE post_id IN (?)
      ORDER BY created_at ASC
    `;

    db.query(replySql, [postIds], (err, replies) => {
      if (err) return res.status(500).send("Database error");

      // Group replies by post_id safely — no JSON.parse needed
      const replyMap = {};
      (replies || []).forEach(r => {
        if (!replyMap[r.post_id]) replyMap[r.post_id] = [];
        replyMap[r.post_id].push({ username: r.username, content: r.content });
      });

      const result = posts.map(p => ({
        id: p.id,
        username: p.username,
        content: p.content,
        replies: replyMap[p.id] || [],
      }));

      res.json(result);
    });
  });
});

app.post("/forum/posts/:id/reply", (req, res) => {
  const { username, content } = req.body;
  const postId = req.params.id;
  if (!username || !content) return res.status(400).send("Missing fields");

  const sql = "INSERT INTO forum_replies (post_id, username, message) VALUES (?, ?, ?)";
  db.query(sql, [postId, username, content], (err) => {
    if (err) return res.status(500).send("Database error");
    res.json({ username, content });
  });
});

app.delete("/forum/posts/:id", (req, res) => {
  // Replies deleted automatically via ON DELETE CASCADE
  db.query("DELETE FROM forum_posts WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Database error");
    res.json({ message: "Post deleted" });
  });
});

// ---------- EXPERT QUESTIONS ----------
// Stored as a forum post flagged with created_by_user = false
app.post("/forum/experts", (req, res) => {
  const { username, content } = req.body;
  if (!username || !content) return res.status(400).send("Missing fields");

  const sql =
    "INSERT INTO forum_posts (username, message, created_by_user) VALUES (?, ?, false)";
  db.query(sql, [username, `[EXPERT QUESTION] ${content}`], (err) => {
    if (err) return res.status(500).send("Database error");
    res.json({ message: "Expert question submitted" });
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