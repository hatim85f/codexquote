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

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/quotes", require("./routes/api/quotation"));
app.use("/api/clients", require("./routes/api/clients"));
app.use("/api/payments", require("./routes/api/payments"));
app.use("/api/invoices", require("./routes/api/invoice"));
app.use("/api/feedback", require("./routes/api/newFeedback"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Codex Quote Server started on port ${PORT}`);
});
