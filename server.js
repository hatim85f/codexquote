const express = require("express");
const connectDB = require("./config/db");
var cors = require("cors");

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Codex Quote Server started on port ${PORT}`);
});
