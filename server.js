const express = require("express");
const connectDB = require("./config/db");

const app = express();

// connect to database
connectDB();

//init middleware to use body parser
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("Howdy!"));

// define routes
app.use("/api/users", require("./routes/users"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Game On!"));
