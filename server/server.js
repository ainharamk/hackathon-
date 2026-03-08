const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

// MySQL connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Password",    // change this password to work on your servers
    database: "hackathon",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
    connection.release();
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Database error");
            return;
        }
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post("/stats", (req, res) => {
    const { page, action, value } = req.body;

    const sql = "INSERT INTO daily_stats (page, action, value) VALUES (?, ?, ?)";

    db.query(sql, [page, action, value], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Database error");
            return;
        }

        res.json({
            message: "Stat saved",
            id: result.insertId
        });
    });
});

app.post("/tracker", (req, res) => {
  const { mood, hoursSlept } = req.body;

  const sql = `
    INSERT INTO daily_tracker (mood, hours_slept)
    VALUES (?, ?)
  `;

  db.query(sql, [mood, hoursSlept], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Database error");
      return;
    }

    res.json({ message: "Tracker saved" });
  });
});

app.post("/forum", (req, res) => {
  const { username, message } = req.body;

  const sql = `
    INSERT INTO forum_posts (username, message)
    VALUES (?, ?)
  `;

  db.query(sql, [username, message], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Database error");
      return;
    }

    res.json({ message: "Post saved" });
  });
});

app.get("/tracker", (req, res) => {
  db.query(
    "SELECT * FROM daily_tracker ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        res.status(500).send("Database error");
        return;
      }

      res.json(results);
    }
  );
});

app.get("/forum", (req, res) => {
  db.query(
    "SELECT * FROM forum_posts ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        res.status(500).send("Database error");
        return;
      }

      res.json(results);
    }
  );
});


fetch("http://localhost:3000/tracker", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    mood: "Happy",
    hoursSlept: 7
  })
});

fetch("http://localhost:3000/forum", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "Alex",
    message: "Today was difficult but I'm trying."
  })
});