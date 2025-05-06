const mysql = require("mysql2");

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

module.exports = db;