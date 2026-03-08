const express = require("express");
const mysql = require("mysql2");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

// MySQL connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Password1.",    // change this password to work on your servers
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

const PORT = 3001;
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



app.get("/forum/posts", (req, res) => {

  const sql = `
    SELECT p.*, 
    JSON_ARRAYAGG(r.message) AS replies
    FROM forum_posts p
    LEFT JOIN forum_replies r
    ON p.id = r.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });

});

app.post("/forum/posts", (req, res) => {

  const { id, content } = req.body;

  const sql =
  "INSERT INTO forum_posts (id, content, created_by_user) VALUES (?, ?, true)";

  db.query(sql, [id, content], err => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Post created" });
  });

});

app.post("/forum/replies", (req, res) => {

  const { postId, message } = req.body;

  const sql =
  "INSERT INTO forum_replies (post_id, message) VALUES (?, ?)";

  db.query(sql, [postId, message], err => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Reply added" });
  });

});

app.delete("/forum/posts/:id", (req, res) => {

  db.query(
    "DELETE FROM forum_posts WHERE id = ?",
    [req.params.id],
    err => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Post deleted" });
    }
  );

});