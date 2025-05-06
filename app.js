const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "tejas1",
    database: "simple_auth"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

// Register User
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
        if (err) return res.status(500).send("Error registering user");
        res.send("User registered successfully!");
    });
});

// Login User
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, results) => {
        if (err || results.length === 0) return res.status(401).send("Invalid credentials");
        res.send("Login successful!");
    });
});

// Serve Frontend
app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Simple Auth</title>
            <script>
                const API_URL = "http://localhost:3000";

                async function register() {
                    const username = document.getElementById("username").value;
                    const password = document.getElementById("password").value;
                    const response = await fetch(API_URL + "/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    });
                    document.getElementById("message").innerText = await response.text();
                }

                async function login() {
                    const username = document.getElementById("username").value;
                    const password = document.getElementById("password").value;
                    const response = await fetch(API_URL + "/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    });
                    document.getElementById("message").innerText = await response.text();
                }
            </script>
        </head>
        <body>
            <h2>Simple Auth System</h2>
            <input type="text" id="username" placeholder="Username">
            <input type="password" id="password" placeholder="Password">
            <button onclick="register()">Register</button>
            <button onclick="login()">Login</button>
            <p id="message"></p>
        </body>
        </html>
    `);
});

// Start Server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));