const express = require("express");
const db = require("./db");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Register User with Email & Hashed Password
router.post("/register", async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", 
    [email, username, hashedPassword], (err) => {
        if (err) return res.status(500).send("Error registering user");
        res.send("User registered successfully!");
    });
});

// Login User
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).send("Invalid credentials");

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) return res.status(401).send("Invalid credentials");

        res.json({ success: true });
    });
});

//fetch members
router.get("/members", (req, res) => {
    db.query("SELECT id, username FROM users", (err, results) => {
        if (err) return res.status(500).send("Error fetching members");
        res.json(results);
    });
});


module.exports = router;