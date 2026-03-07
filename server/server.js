const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

// MySQL connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Password",
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