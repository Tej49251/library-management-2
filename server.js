// Import required modules
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));
app.use(express.static("public"));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root@1234",
  database: "user_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});

// Serve HTML pages
// app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/forgot-password", (req, res) => res.sendFile(path.join(__dirname, "public", "forgot-password.html")));
app.get("/reset-password", (req, res) => res.sendFile(path.join(__dirname, "public", "reset-password.html")));
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "library-management", "home.html")); // Serve the dashboard page
  } else {
    res.redirect("/login");
  }
});
// User Registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (results.length > 0) {
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        req.session.user = results[0];
        res.redirect("/dashboard");
      } else {
        res.send("Invalid credentials! <a href='/'>Try again</a>");
      }
    } else {
      res.send("User not found! <a href='/register'>Register</a>");
    }
  });
});

// Forgot Password
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (results.length > 0) {
      const token = Math.random().toString(36).substr(2, 8);
      db.query("UPDATE users SET reset_token = ? WHERE email = ?", [token, email]);

      // Send Email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: "your-email@gmail.com", pass: "your-email-password" },
      });

      const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Use this token to reset your password: ${token}`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) res.send("Error sending email");
        else res.send("Check your email for the reset token!");
      });
    } else {
      res.send("Email not found! <a href='/forgot-password'>Try again</a>");
    }
  });
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;
  db.query("SELECT * FROM users WHERE email = ? AND reset_token = ?", [email, token], async (err, results) => {
    if (results.length > 0) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.query("UPDATE users SET password = ?, reset_token = NULL WHERE email = ?", [hashedPassword, email]);
      res.send("Password reset successful! <a href='/'>Login</a>");
    } else {
      res.send("Invalid token! <a href='/reset-password'>Try again</a>");
    }
  });
});

app.get("/members-data", (req, res) => {
  db.query("SELECT username FROM users", (err, results) => {
    if (err) throw err;
    res.json(results); // Send JSON response
  });
});



// Start Server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
